import APITable from '@site/src/components/APITable';

# Transaction structure

StarkNet, in its Alpha version, supports two types of transactions: a `Deploy` transaction and an `Invoke Function` transaction. We describe the available fields for both of these transaction types and how the transaction hash is calculated in both cases.

## Deploy transaction

:::important
The deploy transaction will be deprecated in future StarkNet versions. To deploy new constract instances, you can use the `deploy` syscall. For more information, see [contract classes](../Contracts/contract-classes.md).
:::

A deploy transaction is a transaction type used to deploy contracts to StarkNet.

A deploy transaction has the following fields:

<APITable>

| Name                    | Type                 | Description                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract_address_salt` | `FieldElement`       | A random number used to distinguish between different instances of the contract.                                                                                                                                                                                                                                                                      |
| `contract_definition`   | `ContractClass`      | The object that defines the contract's functionality.                                                                                                                                                                                                                                                                                                 |
| `constructor_calldata`  | `List<FieldElement>` | The arguments passed to the constructor during deployment.                                                                                                                                                                                                                                                                                            |
| `caller_address`        | `FieldElement`       | Who invoked the deployment. Set to 0 (in future: the deploying account contract).                                                                                                                                                                                                                                                                     |
| `version`               | `FieldElement`       | The transaction's version. Possible values are 1 or 0.<br>When the fields that comprise a transaction change, either by adding a new field or removing an existing field, then the transaction version increases. Including a transaction whose version is not supported by the StarkNet OS prevents that transaction from being included in a block. |

</APITable>

### Calculating the hash of a deploy transaction

In order to calculate the transaction hash, we first need to obtain the deployed contract address.

The Deploy transaction’s hash is calculated as follows:

$$
\begin{aligned}
\text{deploy\_tx\_hash} = h( & \text{"deploy"}, \text{version}, \text{contract\_address}, sn\_keccak(\text{“constructor”}),\\ & h(\text{constructor\_calldata}), 0, \text{chain\_id})
\end{aligned}
$$

Where:

- The placeholder zero is used to align the hash computation for the different types of transactions (here, it holds the place of the `max_fee` field which exsists in both `invoke` and `declare` transactions)
- “deploy” and “constructor” constant’s prefixes, encoded in bytes (ASCII), with big-endian.
- $h$ is the [Pedersen](../Hashing/hash-functions.md#pedersen-hash) hash and $sn\_keccak$ is [StarkNet Keccak](../Hashing/hash-functions.md#starknet-keccak)
- `chain_id` is a constant value that specifies the network to which this transaction is sent. See [Chain-Id](./transactions.md#chain-id).
- `contract_address` is calculated as described [here](../Contracts/contract-address.md).

## Invoke Transaction

The invoke function transaction is the main transaction type used to invoke contract functions in StarkNet.

An invoke function transaction has the following fields:

<APITable>

| Name                                                                                                 | Type                 | Description                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract_address` (Transaction version 0) <br> `account_contract_address` (Transaction version 1.0) | `FieldElement`       | The address of the contract invoked by this transaction.                                                                                                                                                                                                                                                                                              |
| `entry_point_selector` (Transaction version 0)                                                       | `FieldElement`       | The encoding of the selector for the function invoked (the entry point in the contract)                                                                                                                                                                                                                                                               |
| `calldata`                                                                                           | `List<FieldElement>` | The arguments passed to the invoked function                                                                                                                                                                                                                                                                                                          |
| `signature`                                                                                          | `List<FieldElement>` | Additional information given by the caller, representing the signature of the transaction                                                                                                                                                                                                                                                             |
| `max_fee`                                                                                            | `FieldElement`       | The maximum fee that the sender is willing to pay for the transaction                                                                                                                                                                                                                                                                                 |
| `nonce`                                                                                              | `FieldElement`       | (Transaction version 1)<br>The transaction nonce.                                                                                                                                                                                                                                                                                                     |
| `version`                                                                                            | `FieldElement`       | The transaction's version. Possible values are 1 or 0.<br>When the fields that comprise a transaction change, either by adding a new field or removing an existing field, then the transaction version increases. Including a transaction whose version is not supported by the StarkNet OS prevents that transaction from being included in a block. |

</APITable>

:::info transaction version

The StarkNet OS contains a hard-coded version, and can only accept transactions
with this version. A transaction with a different version can not be included in a proof. By advancing the version with breaking changes
in the StarkNet OS, we can prevent old transactions from being executed in this unintended version, thus protecting the user.

Note that setting a different version can be useful for testing purposes, because even if the transaction is properly signed, it can never be included in the production StarkNet (testnet or mainnet).

:::

### Calculating the hash of an invoke transaction

The invoke function transaction hash is calculated as a hash over the given transaction elements, specifically:

$$
\begin{aligned}
\text{invoke\_tx\_hash} = h( & \text{"invoke"}, \text{version}, \text{contract\_address}, \text{entry\_point\_selector}, \\ & h(\text{calldata}), \text{max\_fee}, \text{chain\_id})
\end{aligned}
$$

Where:

- “invoke” is a constant prefix, encoded in bytes (ASCII), with big-endian.
- `chain_id` is a constant value that specifies the network to which this transaction is sent. See [Chain-Id](./transactions.md#chain-id).
- $$h$$ is the [Pedersen](../Hashing/hash-functions.md#pedersen-hash) hash

## Declare transaction

The declare transaction is used to introduce new classes into the state of StarkNet, enabling other contracts to deploy instances of those classes or using them in a library call. For more information, see [contract classes](../Contracts/contract-classes.md).

A declare transaction has the following fields:

<APITable>

| Name             | Type                 | Description                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract_class` | `ContractClass`      | The class object.                                                                                                                                                                                                                                                                                                                                     |
| `sender_address` | `FieldElement`       | The address of the account initiating the transaction.                                                                                                                                                                                                                                                                                                |
| `max_fee`        | `FieldElement`       | The maximum fee that the sender is willing to pay for the transaction.                                                                                                                                                                                                                                                                                |
| `signature`      | `List<FieldElement>` | Additional information given by the caller, representing the signature of the transaction                                                                                                                                                                                                                                                             |
| `nonce`          | `FieldElement`       | The transaction nonce.                                                                                                                                                                                                                                                                                                                                |
| `version`        | `FieldElement`       | The transaction's version. Possible values are 1 or 0.<br>When the fields that comprise a transaction change, either by adding a new field or removing an existing field, then the transaction version increases. Including a transaction whose version is not supported by the StarkNet OS prevents that transaction from being included in a block. |

</APITable>

### Calculating the hash of a declare transaction

The declare transaction hash is calculated as a hash over the given transaction elements, specifically:

$$
\begin{aligned}
\text{invoke\_tx\_hash} = h( & \text{"declare"}, \text{version}, \text{sender\_address}, \\& 0, 0, \text{max\_fee}, \text{chain\_id}, \text{class\_hash})
\end{aligned}
$$

Where:

- The placeholders zeros are used to align the hash computation for the different types of transactions (here, they stand for the empty call data and entry point selector)
- `chain_id` is a constant value that specifies the network to which this transaction is sent. See [Chain-Id](./transactions.md#chain-id).
- $$h$$ is the [Pedersen](../Hashing/hash-functions.md#pedersen-hash) hash

## Signature

While StarkNet does not have a specific signature scheme built into the protocol, the Cairo language, in which smart contracts are written, does have an efficient implementation for ECDSA signature with respect to a [STARK-friendly curve](../Hashing/hash-functions.md#stark-curve).

The generator used in the ECDSA algorithm is $G=\left(g_x, g_y\right)$ where:

$g_x=874739451078007766457464989774322083649278607533249481151382481072868806602$
$g_y=152666792071518830868575557812948353041420400780739481342941381225525861407$

## Chain-Id

StarkNet currently supports two chain IDs. Chain IDs are given as numbers, representing an encoding of specific constants as bytes (ASCII) using big-endian, as illustrated by the following Python snippet:

```python
chain_id = int.from_bytes(value, byteorder=“big”, signed=False)
```

Two constants are currently used:

- `SN_MAIN` for StarkNet’s main network.
- `SN_GOERLI` for StarkNet's testnet.
