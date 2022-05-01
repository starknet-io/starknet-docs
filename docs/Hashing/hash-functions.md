# Hash functions

## domain and range

All hashes outputs are eventually mapped to elements in $\mathbb{F}_p$ with $p=2^{251}+17\cdot 2^{192}+1$.

There are two hash functions used throughout StarkNet's specifications:

- $sn\_keccak: \{0,1\}^* \rightarrow \mathbb{F}_p$
- $pedersen: \mathbb{F}_p\times\mathbb{F}_p\rightarrow\mathbb{F}_p$

## StarkNet Keccak

StarkNet keccak, usually denoted by $sn\_keccak$, is defined as the first 250 bits of the Keccak256 hash (this is just Keccak256 augmented
in order to fit into a field element).

## Pedersen hash

### STARK curve

Pedersen hash makes use of the following STARK friendly elliptic curve over $\mathbb{F}_p^2$:

$$
y^2=x^3+\alpha x +\beta
$$

where

- $\alpha=1$
- $\beta = 3141592653589793238462643383279502884197169399375105820974944592307816406665$

### Definition

Given an input $(a,b)\in\mathbb{F}_p^2$, we begin by breaking it into $a_{low}, a_{high}, b_{low}, b_{high}$,
where the low part consists of the low 248 bits of the element and the high part consists of the high 4 bits of the element. Our Pedersen hash is then defined by:

$$
h(a,b) = \left[shift\_point + a_{low} \cdot P_0 + a_{high} \cdot P1 + b_{low} \cdot P2  + b_{high} \cdot P3\right]_x
$$

where the values of the constants $shift\_point, P_0, P_1, P_2, P_3$ can be found [here](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/starkware/crypto/signature/fast_pedersen_hash.py), and $[P]_x$ denotes the $x$ coordinate of the point $P$.

### Array hashing

Let $h$ denote the pedersen hash function, then given an array $a_1,...,a_n$ of $n$ field elements
we define $h(a_1,...,a_n)$ to be:

$$
h(...h(h(0, a_1),a_2),...,a_n),n)
$$
