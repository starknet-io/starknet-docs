# Contract Hash

The contract hash is a hash of its definition. The elements defining a contract are:

- API version (the version under which the contract was deployed)
- Array of external functions entry points [^1]
- Array of [L1 handlers](https://www.cairo-lang.org/docs/hello_starknet/l1l2.html#receiving-a-message-from-l1) entry points
- Array of constructors entry points (currently, the compiler allows only one constructor)
- Array of used builtin names [^2] (ordered by declaration)
- Keccak[^3] of the contract’s program. Here, the contract’s program stands for the JSON obtained by executing `starknet-compile` with the `--no_debug_info` flag. To see the exact computation of this field, see [our repo](https://github.com/starkware-libs/cairo-lang/blob/7712b21fc3b1cb02321a58d0c0579f5370147a8b/src/starkware/starknet/core/os/contract_hash.py#L116).
- Bytecode (represented by an array of field elements)

The contract’s hash is the chain hash[^4] of the above, computed as follows:

- start with $h(0,api\_version)$
- for every line in the above (excluding the first), compute $h(h(previous\_line), new\_line)$, where the hash of an array is defined [here](../Hashing/hash-functions#array-hashing).
- let $c$ denote the cumulative hash resulting from applying the above process; the contract’s hash is then $h(c, \textrm{number\_of\_lines})$, where $\text{number\_of\_lines}$ is 7.
  For more details, see the [Cairo implementation](https://github.com/starkware-libs/cairo-lang/blob/7712b21fc3b1cb02321a58d0c0579f5370147a8b/src/starkware/starknet/core/os/contracts.cairo#L47).

[^1]:
    An entry point is a pair `(selector, offset)`, where offset is the offset of the instruction that should be called inside the contract’s bytecode
    :::info Function selector
    The selector is an identifier through which the function is callable in transactions or in other contracts. The selector is the [starknet_keccak](../Hashing/hash-functions#starknet-keccak) hash of the function name, encoded in ASCII.
    :::

[^2]: ASCII encoding of the builtin names
[^3]: Here we mean [starknet_keccak](../Hashing/hash-functions#starknet-keccak)
[^4]: [Pedersen hash](../Hashing/hash-functions#pedersen-hash)
