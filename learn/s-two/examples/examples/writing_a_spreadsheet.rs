use stwo_prover::core::{
    backend::{
        simd::{column::BaseColumn, m31::N_LANES},
        Column,
    },
    fields::m31::M31,
};

fn main() {
    let num_rows = N_LANES;

    let mut col_1 = BaseColumn::zeros(num_rows as usize);
    col_1.set(0, M31::from(1));
    col_1.set(1, M31::from(7));

    let mut col_2 = BaseColumn::zeros(num_rows as usize);
    col_2.set(0, M31::from(5));
    col_2.set(1, M31::from(11));
}
