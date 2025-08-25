use num_traits::identities::Zero;
use stwo_prover::{
    constraint_framework::{
        preprocessed_columns::PreProcessedColumnId, EvalAtRow, FrameworkComponent, FrameworkEval,
        TraceLocationAllocator,
    },
    core::{
        air::Component,
        backend::{
            simd::{column::BaseColumn, m31::LOG_N_LANES, SimdBackend},
            Column,
        },
        channel::{Blake2sChannel, Channel},
        fields::{m31::M31, qm31::QM31},
        pcs::{CommitmentSchemeProver, CommitmentSchemeVerifier, PcsConfig},
        poly::{
            circle::{CanonicCoset, CircleEvaluation, PolyOps},
            BitReversedOrder,
        },
        prover::{prove, verify},
        vcs::blake2_merkle::Blake2sMerkleChannel,
    },
};

// ANCHOR: is_first_column
struct IsFirstColumn {
    pub log_size: u32,
}

#[allow(dead_code)]
impl IsFirstColumn {
    pub fn new(log_size: u32) -> Self {
        Self { log_size }
    }

    pub fn gen_column(&self) -> CircleEvaluation<SimdBackend, M31, BitReversedOrder> {
        let mut col = BaseColumn::zeros(1 << self.log_size);
        col.set(0, M31::from(1));
        CircleEvaluation::new(CanonicCoset::new(self.log_size).circle_domain(), col)
    }

    pub fn id(&self) -> PreProcessedColumnId {
        PreProcessedColumnId {
            id: format!("is_first_{}", self.log_size),
        }
    }
}
// ANCHOR_END: is_first_column

// ANCHOR: test_eval
struct TestEval {
    is_first_id: PreProcessedColumnId,
    log_size: u32,
}

impl FrameworkEval for TestEval {
    fn log_size(&self) -> u32 {
        self.log_size
    }

    fn max_constraint_log_degree_bound(&self) -> u32 {
        self.log_size + CONSTRAINT_EVAL_BLOWUP_FACTOR
    }

    fn evaluate<E: EvalAtRow>(&self, mut eval: E) -> E {
        let is_first = eval.get_preprocessed_column(self.is_first_id.clone());

        let col_1 = eval.next_trace_mask();
        let col_2 = eval.next_trace_mask();
        let col_3 = eval.next_trace_mask();

        // If is_first is 1, then the constraint is col_1 * col_2 - col_3 = 0
        // If is_first is 0, then the constraint is col_1 * col_2 + col_1 - col_3 = 0
        eval.add_constraint(
            (col_1.clone() * col_2.clone() - col_3.clone()) * is_first.clone()
                + (col_1.clone() * col_2.clone() + col_1.clone() - col_3.clone())
                    * (E::F::from(M31::from(1)) - is_first.clone()),
        );

        eval
    }
}
// ANCHOR_END: test_eval

const CONSTRAINT_EVAL_BLOWUP_FACTOR: u32 = 1;

fn gen_trace(log_size: u32) -> Vec<CircleEvaluation<SimdBackend, M31, BitReversedOrder>> {
    // Create the table
    let mut col_1 = BaseColumn::zeros(1 << log_size);
    col_1.set(0, M31::from(1));
    col_1.set(1, M31::from(7));

    let mut col_2 = BaseColumn::zeros(1 << log_size);
    col_2.set(0, M31::from(5));
    col_2.set(1, M31::from(11));

    let mut col_3 = BaseColumn::zeros(1 << log_size);
    col_3.set(0, col_1.at(0) * col_2.at(0));
    col_3.set(1, col_1.at(1) * col_2.at(1) + col_1.at(1));

    // Convert table to trace polynomials
    let domain = CanonicCoset::new(log_size).circle_domain();

    vec![col_1, col_2, col_3]
        .into_iter()
        .map(|col| CircleEvaluation::new(domain, col))
        .collect()
}

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

    // ANCHOR: gen_traces
    // Create and commit to the preprocessed trace
    let is_first_column = IsFirstColumn::new(log_size);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(vec![is_first_column.gen_column()]);
    tree_builder.commit(channel);

    // Commit to the size of the trace
    channel.mix_u64(log_size as u64);

    // Create and commit to the original trace
    let trace = gen_trace(log_size);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace);
    tree_builder.commit(channel);
    // ANCHOR_END: gen_traces

    // ANCHOR: create_component
    // Create a component
    let component = FrameworkComponent::<TestEval>::new(
        &mut TraceLocationAllocator::default(),
        TestEval {
            is_first_id: is_first_column.id(),
            log_size,
        },
        QM31::zero(),
    );

    // Prove
    let proof = prove(&[&component], channel, commitment_scheme).unwrap();

    // Verify
    let channel = &mut Blake2sChannel::default();
    let commitment_scheme = &mut CommitmentSchemeVerifier::<Blake2sMerkleChannel>::new(config);
    let sizes = component.trace_log_degree_bounds();

    commitment_scheme.commit(proof.commitments[0], &sizes[0], channel);
    channel.mix_u64(log_size as u64);
    commitment_scheme.commit(proof.commitments[1], &sizes[1], channel);

    verify(&[&component], channel, commitment_scheme, proof).unwrap();
    // ANCHOR_END: create_component

    // ANCHOR: main_end
}
// ANCHOR_END: main_end
