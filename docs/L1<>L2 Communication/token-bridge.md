# StarkGate – Token Bridge

## StarkGate General Architecture

StarkGate is the Ethereum↔StarkNet token bridge developed by StarkWare. Each supported token is associated with an L1 and L2 bridge contracts that are communicating via StarkNet's messaging mechanism.

The bridges facilitate a user’s ability to conduct their transactions with their ETH and ERC-20 tokens that reside on L1, via the StarkNet Alpha network and its STARK-based computational compression capabilities. For simplicity, we use terms such as “deposit”, “transact”, and “transfer” to refer to various operations involving a bridge, even though ETH and ERC20 tokens never actually leave Ethereum.

### L1→L2 Transfer (Deposit)

#### Step 1: Call The Deposit Function on L1

The user calls the function `deposit` (see [ERC-20 deposit](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/solidity/StarknetERC20Bridge.sol#L10) and [ETH deposit](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/solidity/StarknetEthBridge.sol#L10)), supplying as parameters the recipient address on StarkNet and the amount to transfer in the case of ERC-20 token. The deposit function then:

- Checks that the funds transferred are within the Alpha [limitations](./token-bridge#starkgate-alpha-limitations)
- Transfers the funds from the user account to the StarkNet bridge
- Emits a deposit [event](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/solidity/StarknetTokenBridge.sol#L101) with the sender address on L1, the recipient address on L2, and the amount
- Sends a message to the relevant L2 bridge with the amount to be transferred, and the recipient address as parameters. Note that, since every single bridge is dedicated to one token type, the token type doesn't have to be explicit here.

At the end of this step (i.e., after the execution on L1) the deposit transaction is known to StarkNet’s sequencer, yet sequencers may wait for enough L1 confirmations before corresponding deposit transaction is initated on L2. During this step, the status of the L2 deposit transaction is [`NOT_RECEIVED`](../Blocks/transaction-life-cycle#not_received).

#### Step 2: Deposit Triggered on StarkNet

Once enough block confirmations are received for step 1, the sequencers may refer to the deposit request by triggering the L1 handler “
[`handle_deposit`](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/cairo/token_bridge.cairo#L135) on the L2 bridge. The function `handle_deposit` verifies that the deposit indeed came from the corresponding L1 bridge. It then calls to the relevant ERC-20 contract (e.g. the ERC-20 representing ETH on StarkNet) and mints the tokens for the user.

At the end of this step (i.e., after the sequencer processed this transaction, but before a proof is generated), the status of the deposit request will be [`ACCEPTED_ON_L2`](../Blocks/transaction-life-cycle#accepted_on_l2).

#### Step 3: The Block That Includes The Transfer Is Proved

Once the sequencer completes the block construction, StarkNet’s provers will prove its validity and submit a state update to L1. When this happens, the message confirming the funds transfer will be cleared from the StarkNet Core Contract, and the fact that the user has transferred their funds will be part of the now finalized state of StarkNet. Note that if the message wasn’t on L1 to begin with (meaning StarkNet “invented” a deposit request), the state update would fail.

### L2→L1 Transfer (Withdraw)

#### Step 1: Call The Withdraw Function on L2

To initiate a withdraw, a user calls the [`initiate_withdraw`](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/cairo/token_bridge.cairo#L103) function on the L2 bridge contract, supplying as parameters the recipient address on Ethereum, as well as the amount to transfer. The withdraw function then:

- Burns the transferred amount of tokens from the balance of the withdrawal’s initiator
- Sends a message to the relevant L1 bridge with the amount to be transferred, and the recipient address as parameters. As before, since the bridgs are token-specific, the token itself is implicit here.

#### Step 2: The Block That Includes The Transaction Is Proved

Once the sequencer completes the block construction, StarkNet’s provers will prove the validity of the block and submit a state update to L1. When this happens, the message from the previous step is stored in the StarkNet Core Contract.

#### Step 3: Transfering The Funds On L1

After the withdraw message has been recorded on the StarkNet Core Contract, anyone can finalize the transfer on L1 from the bridge back to the user, by calling the `withdraw` function (see [ERC-20 withdraw](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/solidity/StarknetERC20Bridge.sol#L19) and [ETH withdraw](https://github.com/starkware-libs/starkgate-contracts/blob/28f4032b101003b2c6682d753ea61c86b732012c/src/starkware/starknet/apps/starkgate/solidity/StarknetEthBridge.sol#L16)).

:::note
Note that this step is permissionless, and may be performed by anyone. Since the user's address is part of the recorded message on L1, he will be the recepient of the funds, regardless of who called the `withdraw` function on L1.
:::

## StarkGate Alpha Limitations

In order to reduce the risks involved in using an Alpha version, StarkGate Alpha has limitations [^1] involving the deposit amount and total value locked in the L1 bridge contract:

| Token | Max deposit | Max total value locked |
| ----- | ----------- | ---------------------- |
| ETH   | 0.025 Eth   | 225 Eth                |

:::info
We plan to gradually ease these limitations and lift them completely, as confidence grows.
Changes will be updated here, stay tuned.
:::

[^1] Only relveant for Mainnet Alpha
