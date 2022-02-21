# Contract Address

The contract address is a unique identifier of the contract on StarkNet. It is a chain hash of the following information:

- `prefix` - the ASCII encoding of the constant string “STARKNET_CONTRACT_ADDRESS”
- `caller_address` - currently always zero
- `salt` - part of the [deploy transaction](../Blocks/transactions#deploy-transaction)
- `contract_hash` - see [the docs](./contract-hash)
- `calldata_hash` - [array hash](../Hashing/hash-functions#array-hashing) of the inputs to the constructor

The computation is roughly the following:

```js title="contract address"
contract_address := pedersen(
    “STARKNET_CONTRACT_ADDRESS”,
    caller_address,
    salt,
    pedersen(contract_code),
    pedersen(constructor_calldata))
```

You can find the address computation on our repo [here](https://github.com/starkware-libs/cairo-lang/blob/ed6cf8d6cec50a6ad95fa36d1eb4a7f48538019e/src/starkware/starknet/services/api/gateway/contract_address.py#L12).
