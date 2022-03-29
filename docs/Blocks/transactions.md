import APITable from '@site/src/components/APITable';

# Transaction structure

StarkNet, in its Alpha version, supports two types of transactions: a `Deploy` transaction and an `Invoke Function` transaction. We describe the available fields for both of these transaction types and how the transaction hash is calculated in both cases.

## Deploy transaction

A deploy transaction is a transaction type used to deploy contracts to StarkNet [^1]

A deploy transaction has the following fields:

<APITable>

| Name                    | Type                 | Description                                                                      |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `contract_address_salt` | `Field element`      | A random number used to distinguish between different instances of the contract  |
| `contract_code`         | `Field element`      | A path to the json containing the contract’s definition                          |
| `constructor_calldata`  | `List<FieldElement>` | The arguments passed to the constructor during deployment                        |
| `caller_address`        | `Field element`      | Who invoked the deployment. Set to 0 (in future: the deploying account contract) |

</APITable>

### Transaction hash

In order to calculate the transaction hash, we first need to obtain the deployed contract address.

The Deploy transaction’s hash is calculated as follows:

$$
\begin{aligned}
\text{deploy\_tx\_hash} = h( & \text{"deploy"}, \text{contract\_address}, sn\_keccak(\text{“constructor”}),\\ & h(\text{constructor\_calldata}), \text{chain\_id})
\end{aligned}
$$

Where:

- “deploy” and “constructor” constant’s prefixes, encoded in bytes (ASCII), with big-endian.
- $h$ is the [Pedersen](../Hashing/hash-functions#pedersen-hash) hash and $sn\_keccak$ is [StarkNet Keccak](../Hashing/hash-functions#starknet-keccak)
- `chain_id` is a constant value specifying the network this transaction is sent to. See below.
- `contract_address` is calculated as described here.

## Invoke Function

The invoke function transaction is the main transaction type used to invoke contract functions in StarkNet.

An invoke function transaction has the following fields:

<APITable>

| Name                   | Type                 | Description                                                                               |
| ---------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `contract_address`     | `Field element`      | The address of the contract invoked by this transaction                                   |
| `entry_point_selector` | `Field element`      | The encoding of the selector for the function invoked (the entry point in the contract)   |
| `calldata`             | `List<FieldElement>` | The arguments passed to the invoked function                                              |
| `signature`            | `List<FieldElement>` | Additional information given by the caller, representing the signature of the transaction |
| `max_fee`              | `Field element`      | The maximum fee that the sender is willing to pay for the transaction                     |
| `version`              | `Field element`      | The intended StarkNet OS version                                                          |

</APITable>

:::info transaction version

The StarkNet OS contains a hard-coded version (currently set to 0), and can only accept transactions
with this version. A transaction with a different version can not be included in a proof. By advancing the version with breaking changes
in the StarkNet OS, we can prevent old transactions from being executed in this unintended version, thus protecting the user. Note that setting a different version can be useful for testing purposes, since even if the transaction is properly signed, it can never be included in the production StarkNet (testnet or mainnet).

:::

### Transaction hash

The invoke function transaction hash is calculated as a hash over the given transaction elements, specifically:

$$
\begin{aligned}
\text{invoke\_tx\_hash} = h( & \text{"invoke"}, \text{version}, \text{contract\_address}, \text{entry\_point\_selector}, \\ & h(\text{calldata}), \text{max\_fee}, \text{chain\_id})
\end{aligned}
$$

Where:

- “invoke” is a constant prefix, encoded in bytes (ASCII), with big-endian.
- `chain_id` is a constant value specifying the network this transaction is sent to. See below.
- $$h$$ is the [Pedersen](../Hashing/hash-functions#pedersen-hash) hash

### Signature

While StarkNet does not have a specific signature scheme built into the protocol, the Cairo language in which smart contracts are written does have an efficient implementation for ECDSA signature with respect to a [STARK-friendly curve](../Hashing/hash-functions#stark-curve).

The generator used in the ECDSA algorithm is $G=\left(g_x, g_y\right)$ where:

$g_x=874739451078007766457464989774322083649278607533249481151382481072868806602$
$g_y=152666792071518830868575557812948353041420400780739481342941381225525861407$

[^1]: Note, this type of transaction may be deprecated as StarkNet matures, effectively incorporating this into an invoke function transaction over an account contract which will implement the deployment as part of its functionality.
