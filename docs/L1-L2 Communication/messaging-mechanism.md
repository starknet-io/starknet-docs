# Messaging Mechanism

## L2 → L1 Messages

Contracts on L2 can interact asynchronously with contracts on L1 via the L2→L1 messaging protocol.

During the execution of a StarkNet transaction, a contract on StarkNet sends an L2→L1 message by calling the [`send_message_to_L1`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/common/messages.cairo#L4) syscall. The message parameters (which contain the recipient contract on L1 and the relevant data) are then attached to the relevant state update that includes this syscall invocation.

For example:

```js
 let (message_payload : felt*) = alloc()
assert message_payload[0] = <payload_parameter>
// potentially add more elements to message_payload (message_payload[1], message_payload[2],  etc.)

assert_lt_felt(to_address, ETH_ADDRESS_BOUND)
assert_not_zero(to_address)
send_message_to_l1(to_address=to_address, payload_size=1, payload=message_payload)
```

After the state update that included this transaction is proved and the L1 state is updated, the hash of the message is stored on L1 in the StarkNet Core Contract (and the relevant counter is increased), and the `LogMessageToL1` event (which contains the message parameters) is emitted.

Later, the recipient address on L1 can access and consume the message as part of an L1 transaction by re-supplying the message parameters. This is done by calling [`consumeMessageFromL2`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L119) in the StarkNet Core Contract, who verifies that the hash corresponds to a stored message and that the caller is indeed the recipient on L1. In such a case, the reference count of the message hash in the StarkNet Core Contract decreases by 1.

The above flow is illustrated in the following diagram:

![l2l1](../../static/img/l2l1.png)

### Structure And Hashing

As demonstrated above, the structure of a L2 → L1 message is given by:

<table>
<tr><th> L2 → L1 Message </th></tr>
<tr><td>

| FromAddress    | ToAddress         | Payload   |
| -------------- | ----------------- | --------- |
| `FieldElement` | `EthereumAddress` | `Payload` |

</td></tr> </table>

The hash of a L2 → L1 message is computed on L1 as follows:

```
keccak256(
    abi.encodePacked(
        FromAddress,
        ToAddress,
        Payload.length,
        Payload
    )
);
```

## L1 → L2 Messages

Contracts on L1 can interact asynchronously with contracts on L2 via the L1→L2 messaging protocol. In the first step, an L1 contract initiates a message to an L2 contract on StarkNet. It does so by calling the [`sendMessageToL2`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L100) function on the StarkNet Core Contract with the message parameters. The StarkNet Core Contract hashes the message parameters and updates the L1→L2 messages mapping to indicate that a message with this hash was indeed sent (in fact, we also record the fee paid by the sender, for more details see [L1 → L2 message fees](./messaging-mechanism.md#l1--l2-message-fees)). An L1→L2 message consists of:

- The L1 sender address
- The recipient contract address on StarkNet
- Function selector
- Calldata array
- Message nonce

:::info message nonce
The message nonce is maintained on the StarkNet Core contract on L1, and is bumped whenever a message is
sent to L2. It is used to avoid hash collisions between different L1 handler transactions who are induced by the same message being sent on L1 multiple times (see [below](./messaging-mechanism.md#structure-and-hashing-1)).
:::

A message is then decoded into a StarkNet transaction which invokes a function annotated with the `l1_handler` decorator on the target contract. Such transactions on L2 are called **_L1 handler transactions_**.
The StarkNet sequencer, upon seeing enough L1 confirmations for the transaction that sent the message, initiates the corresponding L2 transaction which invokes the relevant `l1_handler`. The handled message is then attached to the proof of the relevant state update – and the message is cleared when the state is updated. At this point the message is considered handled.

The above flow is illustrated in the following diagram:

![l1l2](../../static/img/l1l2.png)

### L1 → L2 Message Cancellation

Imagine a scenario where a user transfers an asset from L1 to L2. The flow starts with the user sending the asset to a StarkNet bridge and the corresponding L1→L2 message generation. Now, imagine that the L2 message consumption doesn’t function (this might happen due to a bug in the dApps’s Cairo contract). This could result in the user losing custody over their asset forever.

To mitigate this risk, we allow the contract that initiated the L1→L2 message to cancel it – after declaring the intent and waiting a suitable amount of time. The user starts by calling [`startL1ToL2MessageCancellation`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L134) with the relevant message parameters in the StarkNet Core Contract. Then, after a five days delay, the user can finalize the cancellation by calling [`cancelL1ToL2Message`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L147). The reason for the delay is to protect the sequencer from a DOS attack in the form of repeatedly sending and canceling a message – before it is included in L1, rendering the L2 block which contains the activation of the corresponding L1 handler invalid. Note that this flow should only be used in edge cases such as bugs on the Layer 2 contract preventing message consumption.

### L1 → L2 Message Fees

An L1 → L2 message induces a transaction on L2, which, unlike regular transactions, is not sent by an account. This calls for a different mechanism for paying the transaction's fee, for otherwise the sequencer has no incentive of including L1 handler transactions inside a block.

To avoid having to interact with both L1 and L2 when sending a message, L1 → L2 messages are payable on L1, by sending ETH with the call to the payable function `sendMessageToL2` on the StarkNet Core contract. The sequencer takes this fee in exchange for handling the message. The sequencer charges the fee in full upon updating the L1 state with the consumption of this message.

:::note
Throughtout the lifecycle of the message, the assoicated fee is locked in the Core contract. If the message was not processed for any reason, then [cancelling](./messaging-mechanism#l1--l2-message-cancellation) the message will
also return the fee to the sender.
:::

The fee itself is calculated in the [same manner](../Fees/fee-mechanism.md#overall-fee) as "regular" L2 transactions. You can use the [CLI](../CLI/commands#starknet-estimate_message_fee) to get an estimate of a L1 → L2 message fee.

### Structure And Hashing

For completeness, we describe the precise structure of both the message as it appears on L1 and the induced transaction as it appears on L2.

<table>
<tr><th> L1 → L2 Message </th><th> L1 Handler Transaction</th></tr>
<tr><td>

| FromAddress       | ToAddress      | Selector       | Payload              | Nonce          |
| ----------------- | -------------- | -------------- | -------------------- | -------------- |
| `EthereumAddress` | `FieldElement` | `FieldElement` | `List<FieldElement>` | `FieldElement` |

</td><td>

| Version        | ContractAddress | Selector             | Calldata       | Nonce          |
| -------------- | --------------- | -------------------- | -------------- | -------------- |
| `FieldElement` | `FieldElement`  | `List<FieldElement>` | `FieldElement` | `FieldElement` |

</td></tr> </table>

The hash of the message is computed on L1 as follows:

```
keccak256(
    abi.encodePacked(
        uint256(FromAddress),
        ToAddress,
        Nonce,
        Selector,
        Payload.length,
        Payload
    )
);
```

The hash of the corresponding L1 handler transaction on L2 is computed as follows:

$$
\begin{aligned}
\text{l1\_hander\_tx\_hash} = h( & \text{"l1\_handler"}, \text{version}, \text{contract\_address}, \text{entry\_point\_selector}, \\ & h(\text{calldata}), \text{max\_fee}, \text{chain\_id}, \text{nonce})
\end{aligned}
$$

Where:

- “l1_handler” is a constant prefix, encoded in bytes (ASCII), with big-endian.
- `chain_id` is a constant value that specifies the network to which this transaction is sent. See [Chain-Id](../Blocks/transactions.md#chain-id).
- $$h$$ is the [Pedersen](../Hashing/hash-functions.md#pedersen-hash) hash

:::info Sender Address in the calldata
In a `l1_handler` transaction, the first element of the calldata is always the Ethereum address of the sender.
:::
