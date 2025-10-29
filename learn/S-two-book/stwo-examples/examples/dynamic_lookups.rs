use num_traits::{identities::Zero, One};
use rand::prelude::SliceRandom;
use stwo::core::verifier::verify;
use stwo::core::{
    air::Component,
    channel::{Blake2sChannel, Channel},
    fields::{m31::M31, qm31::SecureField},
    pcs::{CommitmentSchemeVerifier, PcsConfig},
    poly::circle::CanonicCoset,
    vcs::blake2_merkle::Blake2sMerkleChannel,
};
use stwo::prover::{
    backend::simd::{column::BaseColumn, m31::LOG_N_LANES, qm31::PackedSecureField, SimdBackend},
    poly::{
        circle::{CircleEvaluation, PolyOps},
        BitReversedOrder,
    },
    prove, CommitmentSchemeProver,
};
use stwo_constraint_framework::relation;
use stwo_constraint_framework::{
    EvalAtRow, FrameworkComponent, FrameworkEval, LogupTraceGenerator, Relation, RelationEntry,
    TraceLocationAllocator,
};

// ANCHOR: test_eval
struct TestEval {
    log_size: u32,
    lookup_elements: LookupElements,
}

impl FrameworkEval for TestEval {
    fn log_size(&self) -> u32 {
        self.log_size
    }

    fn max_constraint_log_degree_bound(&self) -> u32 {
        self.log_size + LOG_CONSTRAINT_EVAL_BLOWUP_FACTOR
    }

    fn evaluate<E: EvalAtRow>(&self, mut eval: E) -> E {
        let random_col = eval.next_trace_mask();
        let ordered_col = eval.next_trace_mask();

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            E::EF::one(),
            &[random_col],
        ));

        eval.add_to_relation(RelationEntry::new(
            &self.lookup_elements,
            -E::EF::one(),
            &[ordered_col],
        ));

        eval.finalize_logup_in_pairs();

        eval
    }
}
// ANCHOR_END: test_eval
const LOG_CONSTRAINT_EVAL_BLOWUP_FACTOR: u32 = 1;

relation!(LookupElements, 1);

// ANCHOR: gen_trace
fn gen_trace(log_size: u32) -> Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>> {
    let mut rng = rand::thread_rng();
    let values = (0..(1 << log_size)).map(|i| i).collect::<Vec<_>>();

    // Create a random permutation of the values
    let mut random_values = values.clone();
    random_values.shuffle(&mut rng);
    let random_col_1 = BaseColumn::from_iter(random_values.iter().map(|v| M31::from(*v)));

    // Create another random permutation of the values
    let mut random_values = random_values.clone();
    random_values.shuffle(&mut rng);
    let random_col_2 = BaseColumn::from_iter(random_values.iter().map(|v| M31::from(*v)));

    // Convert table to trace polynomials
    let domain = CanonicCoset::new(log_size).circle_domain();
    vec![random_col_1, random_col_2]
        .into_iter()
        .map(|col| CircleEvaluation::new(domain, col))
        .collect()
}

fn gen_logup_trace(
    log_size: u32,
    random_col_1: &BaseColumn,
    random_col_2: &BaseColumn,
    lookup_elements: &LookupElements,
) -> (
    Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>>,
    SecureField,
) {
    let mut logup_gen = LogupTraceGenerator::new(log_size);

    let mut col_gen = logup_gen.new_col();
    for row in 0..(1 << (log_size - LOG_N_LANES)) {
        // 1 / random - 1 / ordered = (ordered - random) / (random * ordered)
        let random_val: PackedSecureField = lookup_elements.combine(&[random_col_1.data[row]]);
        let ordered_val: PackedSecureField = lookup_elements.combine(&[random_col_2.data[row]]);
        col_gen.write_frac(row, ordered_val - random_val, random_val * ordered_val);
    }
    col_gen.finalize_col();

    logup_gen.finalize_last()
}
// ANCHOR_END: gen_trace

// ANCHOR: main_start
fn main() {
    // ANCHOR_END: main_start
    let log_size = LOG_N_LANES;

    // Config for FRI and PoW
    let config = PcsConfig::default();

    // Precompute twiddles for evaluating and interpolating the trace
    let twiddles = SimdBackend::precompute_twiddles(
        CanonicCoset::new(
            log_size + LOG_CONSTRAINT_EVAL_BLOWUP_FACTOR + config.fri_config.log_blowup_factor,
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

    // Commit to the size of the trace
    channel.mix_u64(log_size as u64);

    // ANCHOR: gen_trace_main
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
    // ANCHOR_END: gen_trace_main

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
    channel.mix_u64(log_size as u64);
    commitment_scheme.commit(proof.commitments[1], &sizes[1], channel);
    commitment_scheme.commit(proof.commitments[2], &sizes[2], channel);

    verify(&[&component], channel, commitment_scheme, proof).unwrap();

    // ANCHOR: main_end
}
// ANCHOR_END: main_end
