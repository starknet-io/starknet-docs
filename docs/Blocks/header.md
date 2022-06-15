import APITable from '@site/src/components/APITable';

# Block structure

In StarkNet, the block is defined as a list of transactions and a block header.

## Block header

The following fields define the block header:

<APITable>

| Name                     | Type           | Description                                                                       |    Implemented     |
| ------------------------ | -------------- | --------------------------------------------------------------------------------- | :----------------: |
| `parent_block_hash`      | `FieldElement` | The hash of this block's parent                                                   | :heavy_check_mark: |
| `block_number`           | `Integer`      | The number (height) of this block                                                 | :heavy_check_mark: |
| `global_state_root`      | `FieldElement` | The state [commitment](../State/starknet-state.md#state-commitment) after this block | :heavy_check_mark: |
| `sequencer_address`      | `FieldElement` | The StarkNet address of the sequencer who created this block                      | :heavy_check_mark: |
| `block_timestamp`        | `Timestamp`    | The time the sequencer created this block before executing transactions           | :heavy_check_mark: |
| `transaction_count`      | `Integer`      | The number of transactions in a block                                             | :heavy_check_mark: |
| `transaction_commitment` | `FieldElement` | A commitment to the transactions included in the block                            | :heavy_check_mark: |
| `event_count`            | `Integer`      | The number of events                                                              | :heavy_check_mark: |
| `event_commitment`       | `FieldElement` | A commitment to the events produced in this block                                 | :heavy_check_mark: |
| `protocol_version`       | `Integer`      | The version of the StarkNet protocol used when creating this block                |                    |
| `extra data`             | `FieldElement` | Extraneous data that might be useful for running transactions                     |                    |

</APITable>

:::info commitments
The commitment fields transaction_commitment, event_commitment are the roots of a height 64 binary Merkle Patricia tree. The leaf at index $i$ corresponds to the hash of the $i'th$ event/transaction.
:::

## Block hash

The block hash is defined as the Pedersen hash over the header's elements.

$$
\begin{aligned}
h(B)=h(&\text{block\_number}, \text{ global\_state\_root}, \text{ sequencer\_address}, \text{ block\_timestamp}, \\
&\text{transaction\_count}, \text{ transaction\_commitment}, \text{ event\_count},\\
& \text{event\_commitment}, 0, 0, \text{ parent\_block\_hash})
\end{aligned}
$$

Where $h$ is the [Pedersen](../Hashing/hash-functions.md#pedersen-hash) hash.

:::note placeholders
Zeroes inside the hash computation of an object are used as placeholders, to be replaced in the future by meaningful fields.
:::
