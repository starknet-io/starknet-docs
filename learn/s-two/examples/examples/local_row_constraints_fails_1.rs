use num_traits::{identities::Zero, One};
use rand::prelude::SliceRandom;
use stwo_prover::{
    constraint_framework::{
        logup::LogupTraceGenerator, EvalAtRow, FrameworkComponent, FrameworkEval, Relation,
        RelationEntry, TraceLocationAllocator, ORIGINAL_TRACE_IDX,
    },
    core::{
        air::Component,
        backend::simd::{
            column::BaseColumn, m31::LOG_N_LANES, qm31::PackedSecureField, SimdBackend,
        },
        channel::Blake2sChannel,
        fields::{m31::M31, qm31::SecureField},
        pcs::{CommitmentSchemeProver, CommitmentSchemeVerifier, PcsConfig},
        poly::{
            circle::{CanonicCoset, CircleEvaluation, PolyOps},
            BitReversedOrder,
        },
        prover::{prove, verify},
        vcs::blake2_merkle::Blake2sMerkleChannel,
    },
    relation,
};

struct TestEval {
    log_size: u32,
    lookup_elements: LookupElements,
}

impl FrameworkEval for TestEval {
    fn log_size(&self) -> u32 {
        self.log_size
    }

    fn max_constraint_log_degree_bound(&self) -> u32 {
        self.log_size + CONSTRAINT_EVAL_BLOWUP_FACTOR
    }

    // ANCHOR: evaluate
    fn evaluate<E: EvalAtRow>(&self, mut eval: E) -> E {
        let unsorted_col = eval.next_trace_mask();
        let [sorted_col_prev_row, sorted_col_curr_row] =
            eval.next_interaction_mask(ORIGINAL_TRACE_IDX, [-1, 0]);

        // New constraint
        eval.add_constraint(
            E::F::one() - (sorted_col_curr_row.clone() - sorted_col_prev_row.clone()),
        );

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            E::EF::one(),
            &[unsorted_col],
        ));

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            -E::EF::one(),
            &[sorted_col_curr_row],
        ));

        eval.finalize_logup_in_pairs();

        eval
    }
    // ANCHOR_END: evaluate
}

const CONSTRAINT_EVAL_BLOWUP_FACTOR: u32 = 1;

relation!(LookupElements, 1);

fn gen_trace(log_size: u32) -> Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>> {
    // Create a table with random values
    let mut rng = rand::thread_rng();
    let sorted_values = (0..(1 << log_size)).map(|i| i).collect::<Vec<_>>();
    let mut unsorted_values = sorted_values.clone();
    unsorted_values.shuffle(&mut rng);

    let unsorted_col = BaseColumn::from_iter(unsorted_values.iter().map(|v| M31::from(*v)));
    let sorted_col = BaseColumn::from_iter(sorted_values.iter().map(|v| M31::from(*v)));

    // Convert table to trace polynomials
    let domain = CanonicCoset::new(log_size).circle_domain();
    vec![unsorted_col, sorted_col]
        .into_iter()
        .map(|col| CircleEvaluation::new(domain, col))
        .collect()
}

fn gen_logup_trace(
    log_size: u32,
    unsorted_col: &BaseColumn,
    sorted_col: &BaseColumn,
    lookup_elements: &LookupElements,
) -> (
    Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>>,
    SecureField,
) {
    let mut logup_gen = LogupTraceGenerator::new(log_size);

    let mut col_gen = logup_gen.new_col();
    for row in 0..(1 << (log_size - LOG_N_LANES)) {
        // 1 / unsorted - 1 / sorted = (sorted - unsorted) / (unsorted * sorted)
        let unsorted_val: PackedSecureField = lookup_elements.combine(&[unsorted_col.data[row]]);
        let sorted_val: PackedSecureField = lookup_elements.combine(&[sorted_col.data[row]]);
        col_gen.write_frac(row, sorted_val - unsorted_val, unsorted_val * sorted_val);
    }
    col_gen.finalize_col();

    logup_gen.finalize_last()
}

fn main() {
    let log_size = LOG_N_LANES;

    // Config for FRI and PoW
    let config = PcsConfig::default();

    // Precompute twiddles for evaluating and interpolating the trace
    let twiddles = SimdBackend::precompute_twiddles(
        CanonicCoset::new(
            log_size + CONSTRAINT_EVAL_BLOWUP_FACTOR + config.fri_config.log_blowup_factor,
        )
        .circle_domain()
        .half_coset,
    );

    // Create the channel and commitment scheme
    let channel = &mut Blake2sChannel::default();
    let mut commitment_scheme =
        CommitmentSchemeProver::<SimdBackend, Blake2sMerkleChannel>::new(config, &twiddles);

    // Create and commit to the preprocessed columns
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(vec![]);
    tree_builder.commit(channel);

    // Create and commit to the trace columns
    let trace = gen_trace(log_size);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace.clone());
    tree_builder.commit(channel);

    // Draw random elements to use when creating the random linear combination of lookup values in the LogUp columns
    let lookup_elements = LookupElements::draw(channel);

    // Create and commit to the LogUp columns
    let (logup_cols, claimed_sum) =
        gen_logup_trace(log_size, &trace[0], &trace[1], &lookup_elements);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(logup_cols);
    tree_builder.commit(channel);

    // Create a component
    let component = FrameworkComponent::<TestEval>::new(
        &mut TraceLocationAllocator::default(),
        TestEval {
            log_size,
            lookup_elements,
        },
        claimed_sum,
    );

    // Prove
    let proof = prove(&[&component], channel, commitment_scheme).unwrap();

    // Verify
    assert_eq!(claimed_sum, SecureField::zero());

    let channel = &mut Blake2sChannel::default();
    let commitment_scheme = &mut CommitmentSchemeVerifier::<Blake2sMerkleChannel>::new(config);
    let sizes = component.trace_log_degree_bounds();

    commitment_scheme.commit(proof.commitments[0], &sizes[0], channel);
    commitment_scheme.commit(proof.commitments[1], &sizes[1], channel);
    commitment_scheme.commit(proof.commitments[2], &sizes[2], channel);

    verify(&[&component], channel, commitment_scheme, proof).unwrap();
}
