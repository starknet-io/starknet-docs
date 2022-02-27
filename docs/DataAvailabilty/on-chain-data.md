# On-Chain Data

## Introduction

In the current stage of the Alpha, StarkNet operates in a ZK-Rollup mode. This means that upon the acceptance of a state update on-chain, the state diff between the previous and new state is sent as calldata to Ethereum.

This data allows anyone that observes Ethereum to reconstruct the current state of StarkNet. Note that to update the StarkNet state on L1, it suffices to send a valid proof – without information on the transactions or particular changes that this update caused. Consequently, more information must be provided in order to allow other parties to locally track StarkNet’s state.

## Format

The state diffs contain information on every contact whose storage was updated and additional information on contract deployments. Those differences are sent as `unit256[]` array as part of the calldata, and are encoded as follows:

- Number of cells that encode contract deployments
- For each deployed contract, we have:
  - `contract_address` - the [address](../Contracts/contract-address) of the deployed contract
  - `contract_hash` - the [hash](../Contracts/contract-hash) of the contract
  - `len(constructor_call_data)` - the number of arguments to the contract constructor
  - `constructor_call_data` - the list of arguments to the constructor
- Number of contracts whose storage is updated
- For each such contract, we have:
  - `contract_address` - the [address](../Contracts/contract-address) of the contract
  - `num_of_storage_updates` - number of storage updates
  - For each storage update:
    - `key` - the address inside the contract's storage where the value is updated
    - `value` - the new value

## Example

Below we show an example of on chain data which was extracted from L1, and proceed to decode it according to the above format.

```json
[
  5,
  2472939307328371039455977650994226407024607754063562993856224077254594995194,
  1336043477925910602175429627555369551262229712266217887481529642650907574765,
  2,
  955723665991825982403667749532843665052270105995360175183368988948217233556,
  2439272289032330041885427773916021390926903450917097317807468082958581062272,
  5,
  2019172390095051323869047481075102003731246132997057518965927979101413600827,
  1, 5, 102,
  2111158214429736260101797453815341265658516118421387314850625535905115418634,
  2,
  619473939880410191267127038055308002651079521370507951329266275707625062498,
  1471584055184889701471507129567376607666785522455476394130774434754411633091,
  619473939880410191267127038055308002651079521370507951329266275707625062499,
  541081937647750334353499719661793404023294520617957763260656728924567461866,
  2472939307328371039455977650994226407024607754063562993856224077254594995194,
  1,
  955723665991825982403667749532843665052270105995360175183368988948217233556,
  2439272289032330041885427773916021390926903450917097317807468082958581062272,
  3429319713503054399243751728532349500489096444181867640228809233993992987070,
  1, 5, 1110,
  3476138891838001128614704553731964710634238587541803499001822322602421164873,
  6, 59664015286291125586727181187045849528930298741728639958614076589374875456,
  600,
  221246409693049874911156614478125967098431447433028390043893900771521609973,
  400,
  558404273560404778508455254030458021013656352466216690688595011803280448030,
  100,
  558404273560404778508455254030458021013656352466216690688595011803280448031,
  200,
  558404273560404778508455254030458021013656352466216690688595011803280448032,
  300,
  1351148242645005540004162531550805076995747746087542030095186557536641755046,
  500
]
```

- The first element, 5, is the number of cells that encode contracts deployment.
- The next five elements describe a single contract deployment with the following parameters:
  - `contract_address`:
  ```
  2472939307328371039455977650994226407024607754063562993856224077254594995194
  ```
  - `contract_hash`:
  ```
  1336043477925910602175429627555369551262229712266217887481529642650907574765
  ```
  - Two constructor arguments (indicated by the cell at index 3):
  ```
  955723665991825982403667749532843665052270105995360175183368988948217233556
  ```
  ```
  2439272289032330041885427773916021390926903450917097317807468082958581062272
  ```
- The next element, `5` (index 6 in the array), is the number of contracts whose storage was updated. We will take only the first contract as an example.
  - `contract_address`:
  ```
  2019172390095051323869047481075102003731246132997057518965927979101413600827
  ```
  - One update (indicated by the cell at index 8):
    - The value at key 5 was changed to 102.

The next 4 contracts storage updates are interpreted in the same manner.

## Extract from Ethereum

The data described above is sent across several Ethereum transactions, each holding a part of this array as calldata. Each new StarkNet block has its associated state diff transactions. You may find the code for extracting this data from Ethereum in [Pathfinder's repo](https://github.com/eqlabs/pathfinder/blob/2fe6f549a0b8b9923ed7a21cd1a588bc571657d6/crates/pathfinder/src/ethereum/state_update/retrieve.rs). Pathfinder is the first StarkNet full node implementation. You may also take a look at the [python script](https://github.com/eqlabs/pathfinder/blob/2fe6f549a0b8b9923ed7a21cd1a588bc571657d6/crates/pathfinder/resources/fact_retrieval.py) which extracts the same information.
