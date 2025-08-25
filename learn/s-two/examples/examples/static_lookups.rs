use num_traits::{identities::Zero, One};
use rand::Rng;
use stwo_prover::{
    constraint_framework::{
        logup::LogupTraceGenerator, preprocessed_columns::PreProcessedColumnId, EvalAtRow,
        FrameworkComponent, FrameworkEval, Relation, RelationEntry, TraceLocationAllocator,
    },
    core::{
        air::Component,
        backend::{
            simd::{column::BaseColumn, m31::LOG_N_LANES, qm31::PackedSecureField, SimdBackend},
            Column,
        },
        channel::{Blake2sChannel, Channel},
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

// ANCHOR: range_check_column
struct RangeCheckColumn {
    pub log_size: u32,
}

#[allow(dead_code)]
impl RangeCheckColumn {
    pub fn new(log_size: u32) -> Self {
        Self { log_size }
    }

    pub fn gen_column(&self) -> CircleEvaluation<SimdBackend, M31, BitReversedOrder> {
        let col = BaseColumn::from_iter((0..(1 << self.log_size)).map(|i| M31::from(i)));
        CircleEvaluation::new(CanonicCoset::new(self.log_size).circle_domain(), col)
    }

    pub fn id(&self) -> PreProcessedColumnId {
        PreProcessedColumnId {
            id: format!("range_check_{}_bits", self.log_size),
        }
    }
}
// ANCHOR_END: range_check_column

// ANCHOR: test_eval
struct TestEval {
    range_check_id: PreProcessedColumnId,
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

    fn evaluate<E: EvalAtRow>(&self, mut eval: E) -> E {
        let range_check_col = eval.get_preprocessed_column(self.range_check_id.clone());

        let lookup_col_1 = eval.next_trace_mask();
        let lookup_col_2 = eval.next_trace_mask();
        let multiplicity_col = eval.next_trace_mask();

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            -E::EF::from(multiplicity_col),
            &[range_check_col],
        ));

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            E::EF::one(),
            &[lookup_col_1],
        ));

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            E::EF::one(),
            &[lookup_col_2],
        ));

        eval.finalize_logup_batched(&vec![0, 1, 1]);

        eval
    }
}
// ANCHOR_END: test_eval

const CONSTRAINT_EVAL_BLOWUP_FACTOR: u32 = 1;

// ANCHOR: gen_trace
fn gen_trace(log_size: u32) -> Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>> {
    // Create a table with random values
    let mut rng = rand::thread_rng();
    let mut lookup_col_1 =
        BaseColumn::from_iter((0..(1 << log_size)).map(|_| M31::from(rng.gen_range(0..16))));
    let mut lookup_col_2 =
        BaseColumn::from_iter((0..(1 << log_size)).map(|_| M31::from(rng.gen_range(0..16))));

    let mut multiplicity_col = BaseColumn::zeros(1 << log_size);
    lookup_col_1
        .as_mut_slice()
        .iter()
        .chain(lookup_col_2.as_mut_slice().iter())
        .for_each(|value| {
            let index = value.0 as usize;
            multiplicity_col.set(index, multiplicity_col.at(index) + M31::from(1));
        });

    // Convert table to trace polynomials
    let domain = CanonicCoset::new(log_size).circle_domain();
    vec![
        lookup_col_1.clone(),
        lookup_col_2.clone(),
        multiplicity_col.clone(),
    ]
    .into_iter()
    .map(|col| CircleEvaluation::new(domain, col))
    .collect()
}
// ANCHOR_END: gen_trace

// ANCHOR: gen_logup_trace
relation!(LookupElements, 1);

fn gen_logup_trace(
    log_size: u32,
    range_check_col: &BaseColumn,
    lookup_col_1: &BaseColumn,
    lookup_col_2: &BaseColumn,
    multiplicity_col: &BaseColumn,
    lookup_elements: &LookupElements,
) -> (
    Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>>,
    SecureField,
) {
    let mut logup_gen = LogupTraceGenerator::new(log_size);

    let mut col_gen = logup_gen.new_col();
    for simd_row in 0..(1 << (log_size - LOG_N_LANES)) {
        let numerator: PackedSecureField = PackedSecureField::from(multiplicity_col.data[simd_row]);
        let denom: PackedSecureField = lookup_elements.combine(&[range_check_col.data[simd_row]]);
        col_gen.write_frac(simd_row, -numerator, denom);
    }
    col_gen.finalize_col();

    let mut col_gen = logup_gen.new_col();
    for simd_row in 0..(1 << (log_size - LOG_N_LANES)) {
        let lookup_col_1_val: PackedSecureField =
            lookup_elements.combine(&[lookup_col_1.data[simd_row]]);
        let lookup_col_2_val: PackedSecureField =
            lookup_elements.combine(&[lookup_col_2.data[simd_row]]);
        // 1 / denom1 + 1 / denom2 = (denom1 + denom2) / (denom1 * denom2)
        let numerator = lookup_col_1_val + lookup_col_2_val;
        let denom = lookup_col_1_val * lookup_col_2_val;
        col_gen.write_frac(simd_row, numerator, denom);
    }
    col_gen.finalize_col();

    logup_gen.finalize_last()
}
// ANCHOR_END: gen_logup_trace

// ANCHOR: main_start
fn main() {
    // ANCHOR_END: main_start
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
    let range_check_col = RangeCheckColumn::new(log_size).gen_column();
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(vec![range_check_col.clone()]);
    tree_builder.commit(channel);

    // Commit to the size of the trace
    channel.mix_u64(log_size as u64);

    // Create and commit to the trace columns
    let trace = gen_trace(log_size);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace.clone());
    tree_builder.commit(channel);

    // ANCHOR: logup_start
    // Draw random elements to use when creating the random linear combination of lookup values in the LogUp columns
    let lookup_elements = LookupElements::draw(channel);

    // Create and commit to the LogUp columns
    let (logup_cols, claimed_sum) = gen_logup_trace(
        log_size,
        &range_check_col,
        &trace[0],
        &trace[1],
        &trace[2],
        &lookup_elements,
    );
    // ANCHOR_END: logup_start
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(logup_cols);
    tree_builder.commit(channel);

    // Create a component
    let component = FrameworkComponent::<TestEval>::new(
        &mut TraceLocationAllocator::default(),
        TestEval {
            range_check_id: RangeCheckColumn::new(log_size).id(),
            log_size,
            lookup_elements,
        },
        claimed_sum,
    );

    // Prove
    let proof = prove(&[&component], channel, commitment_scheme).unwrap();

    // ANCHOR: verify
    // Verify
    assert_eq!(claimed_sum, SecureField::zero());

    let channel = &mut Blake2sChannel::default();
    let commitment_scheme = &mut CommitmentSchemeVerifier::<Blake2sMerkleChannel>::new(config);
    let sizes = component.trace_log_degree_bounds();

    commitment_scheme.commit(proof.commitments[0], &sizes[0], channel);
    channel.mix_u64(log_size as u64);
    commitment_scheme.commit(proof.commitments[1], &sizes[1], channel);
    commitment_scheme.commit(proof.commitments[2], &sizes[2], channel);

    verify(&[&component], channel, commitment_scheme, proof).unwrap();
    // ANCHOR_END: verify
    // ANCHOR: main_end
}
// ANCHOR_END: main_end
