# Messaging Mechanism

## L1 → L2 Messages

Contracts on L1 can interact asynchronously with contracts on L2 via the L1→L2 messaging protocol. In the first step, an L1 contract initiates a message to an L2 contract on StarkNet. It does so by calling the [`sendMessageToL2`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L100) function on the StarkNet Core Contract with the message parameters. The StarkNet Core Contract hashes the message parameters (the L1 sender address, the recipient contract address on StarkNet, function selector, and the relevant calldata) and increases the hash counter by 1.

A message is then decoded into a StarkNet transaction which invokes a function annotated with the `l1_handler` decorator on the target contract.
The StarkNet sequencer, upon seeing enough L1 confirmations for the transaction that sent the message, initiates the corresponding L2 transaction which invokes the relvant `l1_handler`. The handled message is then attached to the proof of the relevant state update – and the message is cleared (or the count is deduced) when the state is updated. At this point the message is considered handled.

The above flow is illustrated in the following diagram:

![l1l2](../../static/img/l1l2.png)

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

## L1 → L2 Message Cancellation

Imagine a scenario where a user transfers an asset from L1 to L2. The flow starts with the user sending the asset to a StarkNet bridge and the corresponding L1→L2 message generation. Now, imagine that the L2 message consumption doesn’t function (this might happen due to a bug in the dApps’s Cairo contract). This could result in the user losing custody over their asset forever.

To mitigate this risk, we allow the contract that initiated the L1→L2 message to cancel it – after declaring the intent and waiting a suitable amount of time. The user starts by calling [`startL1ToL2MessageCancellation`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L134) with the relevant message parameters in the StarkNet Core Contract. Then, after a five days delay, the user can finalize the cancellation by calling [`cancelL1ToL2Message`](https://github.com/starkware-libs/cairo-lang/blob/4e233516f52477ad158bc81a86ec2760471c1b65/src/starkware/starknet/eth/StarknetMessaging.sol#L147). The reason for the delay is to protect the sequencer from a DOS attack in the form of repeatedly sending and canceling a message – before it is included in L1, rendering the L2 block which contains the activation of the corresponding L1 handler invalid. Note that this flow should only be used in edge cases such as bugs on the Layer 2 contract preventing message consumption.
