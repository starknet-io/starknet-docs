import APITable from '@site/src/components/APITable';

# Transaction structure

StarkNet, in its Alpha version, supports two types of transactions: a `Deploy` transaction and an `Invoke Function` transaction. We describe the available fields for both of these transaction types and how the transaction hash is calculated in both cases.

## Deploy transaction

A deploy transaction is a transaction type used to deploy contracts to StarkNet [^1]

A deploy transaction has the following fields:

<APITable>

| Name | Type | Description |
| --- | --- | --- |
| `contract_address_salt` | `Field element` | A random number used to distinguish between different instances of the contract |
| `contract_code` | `Field element` | A path to the json containing the contract’s definition |
| `constructor_calldata` |`List<FieldElement>`| The arguments passed to the constructor during deployment |
| `caller_address`| `Field element` | Who invoked the deployment. Set to 0 (in future: the deploying account contract) |

</APITable>

### Transaction hash

In order to calculate the transaction hash, we first need to obtain the deployed contract address.

The Deploy transaction’s hash is calculated as follows:

$$
\begin{aligned}
deploy\_tx\_hash = & h("deploy", contract\_address, sn\_keccak(“constructor”)\\&, h(constructor\_calldata), chain\_id)
\end{aligned}
$$

Where:

* “deploy” and “constructor” constant’s prefixes, encoded in bytes (ASCII), with big-endian.
* $h$ is the  [Pedersen](../Hashing/hash-functions#pedersen-hash) hash and $sn\_keccak$ is [StarkNet Keccak](../Hashing/hash-functions#starknet-keccak)
* `chain_id` is a constant value specifying the network this transaction is sent to. See below.
* `contract_address` is calculated as described here.

## Invoke Function

The invoke function transaction is the main transaction type used to invoke contract functions in StarkNet.

An invoke function transaction has the following fields:

<APITable>

| Name | Type | Description |
| --- | --- | --- |
| `contract_address` | `Field element` | The address of the contract invoked by this transaction |
| `entry_point_selector` | `Field element` | The encoding of the selector for the function invoked (the entry point in the contract) |
| `calldata` |`List<FieldElement>`| The arguments passed to the invoked function |
| `signature`| `List<FieldElement>` | Additional information given by the caller, representing the signature of the transaction |

</APITable>

### Transaction hash

The invoke function transaction hash is calculated as a hash over the given transaction elements, specifically:

$$
\begin{aligned}
invoke\_tx\_hash = & h("invoke", contract\_address, entry\_point\_selector\\&, h(calldata), chain\_id)
\end{aligned}
$$

Where:

* “invoke” is a constant prefix, encoded in bytes (ASCII), with big-endian.
* `chain_id` is a constant value specifying the network this transaction is sent to. See below.
* $$h$ is the [Pedersen](../Hashing/hash-functions#pedersen-hash) hash

[^1]: Note, this type of transaction may be deprecated as StarkNet matures, effectively incorporating this into an invoke function transaction over an account contract which will implement the deployment as part of its functionality.
