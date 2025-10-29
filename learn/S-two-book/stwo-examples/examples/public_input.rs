use num_traits::One;
use num_traits::Zero;
use stwo::core::fields::FieldExpOps;
use stwo::core::verifier::verify;
use stwo::core::{
    air::Component,
    channel::{Blake2sChannel, Channel},
    fields::{m31::M31, qm31::SecureField},
    pcs::{CommitmentSchemeVerifier, PcsConfig},
    poly::circle::CanonicCoset,
    vcs::blake2_merkle::Blake2sMerkleChannel,
    ColumnVec,
};
use stwo::prover::{
    backend::simd::{
        column::BaseColumn,
        m31::{PackedM31, LOG_N_LANES},
        qm31::PackedSecureField,
        SimdBackend,
    },
    backend::Column,
    poly::{
        circle::{CircleEvaluation, PolyOps},
        BitReversedOrder,
    },
    prove, CommitmentSchemeProver,
};
use stwo_constraint_framework::{
    relation, EvalAtRow, FrameworkComponent, FrameworkEval, LogupTraceGenerator, Relation,
    RelationEntry, TraceLocationAllocator,
};

struct PublicDataClaim {
    public_input: Vec<Vec<PackedM31>>,
    public_output: Vec<PackedM31>,
}

impl PublicDataClaim {
    pub fn mix_into(&self, channel: &mut impl Channel) {
        for input in self.public_input.iter().flatten() {
            for v in input.to_array().iter() {
                channel.mix_u64(v.0 as u64);
            }
        }
        for output in self.public_output.iter() {
            for v in output.to_array().iter() {
                channel.mix_u64(v.0 as u64);
            }
        }
    }
}

relation!(PublicInputElements, 3);

struct TestEval {
    log_size: u32,
    lookup_elements: PublicInputElements,
}

impl FrameworkEval for TestEval {
    fn log_size(&self) -> u32 {
        self.log_size
    }

    fn max_constraint_log_degree_bound(&self) -> u32 {
        self.log_size + LOG_CONSTRAINT_EVAL_BLOWUP_FACTOR
    }

    fn evaluate<E: EvalAtRow>(&self, mut eval: E) -> E {
        // 10 columns: c0..c9, each row encodes a Fibonacci sequence across columns
        let c0 = eval.next_trace_mask();
        let c1 = eval.next_trace_mask();
        let c2 = eval.next_trace_mask();
        let c3 = eval.next_trace_mask();
        let c4 = eval.next_trace_mask();
        let c5 = eval.next_trace_mask();
        let c6 = eval.next_trace_mask();
        let c7 = eval.next_trace_mask();
        let c8 = eval.next_trace_mask();
        let c9 = eval.next_trace_mask();

        // Enforce Fibonacci relation: c_{i} = c_{i-1} + c_{i-2}
        eval.add_constraint(c0.clone() + c1.clone() - c2.clone());
        eval.add_constraint(c1.clone() + c2.clone() - c3.clone());
        eval.add_constraint(c2.clone() + c3.clone() - c4.clone());
        eval.add_constraint(c3.clone() + c4.clone() - c5.clone());
        eval.add_constraint(c4.clone() + c5.clone() - c6.clone());
        eval.add_constraint(c5.clone() + c6.clone() - c7.clone());
        eval.add_constraint(c6.clone() + c7.clone() - c8.clone());
        eval.add_constraint(c7.clone() + c8.clone() - c9.clone());

        // LogUp relation: -1/(c0 + alpha * c1 + alpha^2 * c9 - Z)
        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            -E::EF::one(),
            &[c0.clone(), c1.clone(), c9.clone()],
        ));
        eval.finalize_logup();

        eval
    }
}

const LOG_CONSTRAINT_EVAL_BLOWUP_FACTOR: u32 = 1;

fn main() {
    // 16 rows, 10 columns
    let num_rows: usize = 16;
    let log_num_rows: u32 = 4; // log2(16)

    // Create the table
    const NUM_COLS: usize = 10;
    let mut cols: Vec<BaseColumn> = (0..NUM_COLS).map(|_| BaseColumn::zeros(num_rows)).collect();

    // Seeds per row: (1, 1), (1, 2), (1, 3), ... up to 16 rows
    for r in 0..num_rows {
        cols[0].set(r, M31::from(1u32));
        cols[1].set(r, M31::from((r as u32) + 1));
        for c in 2..NUM_COLS {
            let a = cols[c - 2].at(r);
            let b = cols[c - 1].at(r);
            cols[c].set(r, a + b);
        }
    }

    let public_input = [cols[0].clone(), cols[1].clone()]
        .into_iter()
        .map(|col| col.data)
        .collect();
    let public_output = cols[9].clone().data;

    // Convert table to trace polynomials
    let domain = CanonicCoset::new(log_num_rows).circle_domain();
    let trace: ColumnVec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>> = cols
        .into_iter()
        .map(|col| CircleEvaluation::new(domain, col))
        .collect();

    // Config for FRI and PoW
    let config = PcsConfig::default();

    // Precompute twiddles for evaluating and interpolating the trace
    let twiddles = SimdBackend::precompute_twiddles(
        CanonicCoset::new(
            log_num_rows + LOG_CONSTRAINT_EVAL_BLOWUP_FACTOR + config.fri_config.log_blowup_factor,
        )
        .circle_domain()
        .half_coset,
    );

    // Create the channel and commitment scheme
    let channel = &mut Blake2sChannel::default();
    let mut commitment_scheme =
        CommitmentSchemeProver::<SimdBackend, Blake2sMerkleChannel>::new(config, &twiddles);

    // Commit to the preprocessed trace
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(vec![]);
    tree_builder.commit(channel);

    // Commit to the size of the trace
    channel.mix_u64(log_num_rows as u64);

    // Commit to the public input
    let public_data_claim = PublicDataClaim {
        public_input,
        public_output,
    };
    public_data_claim.mix_into(channel);

    // Commit to the original trace
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace.clone());
    tree_builder.commit(channel);

    // Draw random elements for LogUp
    let lookup_elements = PublicInputElements::draw(channel);

    // Build LogUp column:
    //   -1/(c0 + alpha * c1 + alpha^2 * c9 - Z)
    let mut logup_gen = LogupTraceGenerator::new(log_num_rows);

    let mut col_gen = logup_gen.new_col();
    for simd_row in 0..(1 << (log_num_rows - LOG_N_LANES)) {
        let denom: PackedSecureField = lookup_elements.combine(&[
            trace[0].data[simd_row],
            trace[1].data[simd_row],
            trace[9].data[simd_row],
        ]);
        col_gen.write_frac(simd_row, -PackedSecureField::one(), denom);
    }
    col_gen.finalize_col();

    let (logup_cols, mut claimed_sum) = logup_gen.finalize_last();

    // Commit to the LogUp columns
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(logup_cols);
    tree_builder.commit(channel);

    // Create a component
    let component = FrameworkComponent::<TestEval>::new(
        &mut TraceLocationAllocator::default(),
        TestEval {
            log_size: log_num_rows,
            lookup_elements: lookup_elements.clone(),
        },
        claimed_sum,
    );

    // Prove
    let proof = prove(&[&component], channel, commitment_scheme).unwrap();

    // Verify

    // Add the public values to the claimed sum
    let mut public_values = vec![PackedSecureField::zero(); 1 << (log_num_rows - LOG_N_LANES)];
    for simd_row in 0..(1 << (log_num_rows - LOG_N_LANES)) {
        let denom: PackedSecureField = lookup_elements.combine(&[
            trace[0].data[simd_row],
            trace[1].data[simd_row],
            trace[9].data[simd_row],
        ]);
        public_values[simd_row] = denom;
    }
    let public_values = PackedSecureField::batch_inverse(&public_values);
    for value in public_values.iter() {
        for v in value.to_array().iter() {
            claimed_sum += *v;
        }
    }
    assert_eq!(claimed_sum, SecureField::zero());

    let channel = &mut Blake2sChannel::default();
    let commitment_scheme = &mut CommitmentSchemeVerifier::<Blake2sMerkleChannel>::new(config);
    let sizes = component.trace_log_degree_bounds();

    commitment_scheme.commit(proof.commitments[0], &sizes[0], channel);
    channel.mix_u64(log_num_rows as u64);
    public_data_claim.mix_into(channel);
    commitment_scheme.commit(proof.commitments[1], &sizes[1], channel);
    commitment_scheme.commit(proof.commitments[2], &sizes[2], channel);

    verify(&[&component], channel, commitment_scheme, proof).unwrap();
}
