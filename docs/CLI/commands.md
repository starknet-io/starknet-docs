import APITable from '@site/src/components/APITable';

# Commands

:::tip

All the CLI commands require the `--network` parameter, which can be either `alpha-goerli` or `alpha-mainnet`.
You can set the `STARKNET_NETWORK` environment variable, causing subsequent calls to the
StarkNet CLI to use the specified network, e.g. to interact with testnet you can set:

`export STARKNET_NETWORK=alpha-goerli`

:::

### starknet deploy_account

```bash title="deploy account"
starknet deploy_account
  --wallet <wallet_provider>
  --account <account_name>
```

Deploys an account contract, can take the following arguments:

- `account_name` - the name given to the account, used for managing multiple accounts from the CLI (if not specified, the name
  `__default__` is used.
- `wallet_provider`\* - the path to module which manages the account (responsible for key generation, signing, etc.)

:::info

Today, the StarkNet CLI only works with the [OpenZeppelin account contract](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/third_party/open_zeppelin/Account.cairo).
The CLI uses this specific [wallet provider](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/wallets/open_zeppelin.py).
To use this provider, either set up the following environment variable or pass the same value directly to the `wallet_provider` parameter:

```
export STARKNET_WALLET=starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount
```

:::

:::warning
Using the builtin wallet providers that are part of the cairo-lang package (starkware.starknet.wallets...) is _not secure_ (for example, the private key may be kept not encrypted and without backup in your home directory). You should only use them if you’re not overly concerned with losing access to your accounts (for example, for testing purposes).
:::

### starknet invoke

```bash title="invoke"
starknet invoke
  --address <contract_address>
  --abi <contract_abi>
  --function <function_name>
  --inputs <arguments>
  --signature <signature_information>
  --wallet <wallet_name>
  --nonce <nonce>
```

Sends a transaction to the StarkNet sequencer, can take the following arguments:

- `address`\* - the address of the called contract
- `contract_abi`\* - a path to a JSON file containing the called [contract’s abi](https://www.cairo-lang.org/docs/hello_starknet/intro.html#the-contract-s-abi)
- `function_name`\*- the name of the called function
- `arguments`\* - inputs to the called function, represented by a list of space-delimited values`
- `signature_information` - list of field elements as described [here](../Blocks/transactions.md#signature)
- `wallet_name` - the name of the desired wallet, use [deploy_account](./commands.md#starknet-deploy_account) to set-up new accounts in the CLI.
- `nonce` - account nonce, only relevant if the call is going through an account

:::tip
Today, interaction with StarkNet may be done either via account or by a direct call. The `signature` argument can only be provided in the case of a direct call, since otherwise providing the signature is the responsibility of the account module. To use an account you must specify `wallet_name`, otherwise a direct call will be used (you may also explicitly perform a direct call by adding `--no_wallet` to the command). Note that in the future direct calls will be deprecated and the only way to interact with the system would be through accounts.
:::

### starknet deploy

```bash title="deploy"
starknet deploy
  --salt <salt>
  --contract <contract_definition>
  --inputs <constructor_inputs>
  --token <token>
```

Deploys a new contract, can take the following arguments:

- `salt` - a seed that is used in the computation of the contract’s address (if not specified, the sequencer will choose a random string)
- `contract_definition`\* - path to a JSON file containing the contract’s bytecode and abi (can be obtained by executing [starknet-compile](https://www.cairo-lang.org/docs/hello_starknet/intro.html#compile-the-contract))
- `constructor_inputs`\* - the arguments given to the contract’s constructor, represented by a list of space-delimited values
- `token` - a token allowing contract deployment (can be obtained by applying [here](https://forms.reform.app/starkware/SN-Alpha-Contract-Deployment/l894lu)). Only used in the Alpha stages and will be deprecated in the future

:::info
The deploy token is a temporary measure which will be deprecated when fees are incorporated in the system. Only relevant for mainnet.
:::

### starknet tx_status

```bash title="tx_status"
starknet tx_status
  --hash <transaction_hash>
  --contract <contract_definition>
  --error_message
```

Returns the transaction status, can take the following arguments:

- `transaction_hash`\* - hash of the requested transaction
- `contract_definition` - path to a JSON file containing the compiled contract to which the transaction was addressed. If supplied, the debug information from the compiled contract will be used to add error locations.
- `error_message` - if specified, only the error message will be returned (or empty response in case the transaction was successful)

The possible statuses of a transaction are:

- `NOT_RECEIVED`
- `RECEIVED`
- `PENDING`
- `REJECTED`
- `ACCEPTED_ON_L2`
- `ACCEPTED_ON_L1`

Refer to [this](../Blocks/transaction-life-cycle.md) section for more information about the transaction lifecycle.

### starknet call

```bash title="call"
starknet call
  --address <contract_address>
  --abi <contract_abi>
  --function <function_name>
  --inputs <arguments>
  --block_hash <block_hash>
  --block_number <block_number>
  --signature <signature_information>
  --wallet <wallet_name>
  --nonce <nonce>
```

Calls a StarkNet contract without affecting the state, can take the following arguments:

- `contract_address`\* - address of the called contract
- `contract_abi`\* - path to a JSON file containing the called [contract’s abi](https://www.cairo-lang.org/docs/hello_starknet/intro.html#the-contract-s-abi)
- `function_name`\* - name of the function which is called
- `arguments`\* - inputs to the called function, represented by a list of space-delimited values
- `block_hash` - the hash of the block used as the context for the call operation. If this argument is omitted, the latest block is used
- `block_number` - same as block_hash, but specifies the context block by number or [tag](#block_tag)
- `signature_information` - list of field elements as described [here](../Blocks/transactions.md#signature)
- `wallet_name` - the name of the desired wallet, use [deploy_account](./commands.md#starknet-deploy_account) to set-up new accounts in the CLI
- `nonce` - account nonce, only relevant if the call is going through an account

<a name="block_tag"></a>

:::info Block Tag

A block context can be specified via the `latest` or `pending` tags, where the former refers to the latest accepted on L2 block and the latter refers to the [pending block](../Blocks/transaction-life-cycle.md#the-pending-block).

:::

### starknet get_block

```bash title="get_block"
starknet get_block
--hash <block_hash>
--number <block_number>
```

Returns the requested block, exactly one of the following arguments must be given:

- `block_hash` - hash of the requested block
- `block_number` - number or [tag](#block_tag) of the requested block

### starknet get_code

```bash title="get_code"
starknet get_code
  --contract_address <contact_address>
  --block_hash <block_hash>
  --block_number <block_number>
```

Returns the ABI and the byte code of the requested contract, can take the following arguments:

- `contact_address`\* - address of the requested contract
- `block_hash` - the hash of the block used as the context for the operation. If this argument is omitted, the latest block is used
- `block_number` - same as block_hash, but specifies the context block by number or [tag](#block_tag)

### starknet get_storage_at

```bash title="get_storage_at"
starknet get_storage_at
  --contract_address <contract_address>
  --key <key>
  --block_hash <block_hash>
  --block_number <block_number>
```

Queries a contract’s storage at a specific key, can take the following arguments:

- `contract_address` \*- address of the requested contract
- `key`\* - the requested key from the given contract’s storage
- `block_hash` - the hash of the block relative to which the storage will be provided. In case this argument is not given, the latest block is used
- `block_number` - same as block_hash, but specifies the context block by number or [tag](#block_tag)

### starknet get_transaction

```bash title="get_transaction"
starknet get_transaction --hash <transaction_hash>
```

Returns the requested transaction, expects the following argument:

- `transaction_hash`\* - hash of the requested transaction

### starknet get_transaction_receipt

```bash title="get_transaction_receipt"
starknet get_transaction_receipt --hash <transaction_hash>
```

Returns the [receipt](../Blocks/transaction-life-cycle.md#transaction-receipt) associated with the transaction, expects the following argument:

- `transaction_hash`\* - hash of the requested transaction

### starknet estimate_fee

```bash title="estimate_fee"
    starknet estimate_fee
        --address <contract_address>
        --abi <contract_abi>
        --function <function_name>
        --inputs <arguments>
```

Returns the fee estimation for a given contract call, can take the following arguments:

- `address`\* - the address of the called contract
- `contract_abi`\* - a path to a JSON file containing the called [contract’s abi](https://www.cairo-lang.org/docs/hello_starknet/intro.html#the-contract-s-abi)
- `function_name`\*- the name of the called function
- `arguments`\* - inputs to the called function, represented by a list of space-delimited values`

### starknet estimate_message_fee

```bash title="estimate_message_fee"
    starknet estimate_message_fee
        --from_address <sender_address>
        --to_address <contract_address>
        --function <function_name>
        --inputs <arguments>
```

Returns the fee estimation for a given [l1 handler](../L1-L2%20Communication/messaging-mechanism.md#l1--l2-message-fees) application, can take the following arguments:

- `from_address`\* - the L1 address of the sender
- `to_address`\* - the L2 address of the receipient
- `contract_abi`\* - a path to a JSON file containing the [abi](https://www.cairo-lang.org/docs/hello_starknet/intro.html#the-contract-s-abi) of the receiving contract on L2
- `function_name`\*- the name of the desired l1 handler
- `arguments`\* - inputs to the called handler, represented by a list of space-delimited values

:::tip Custom endpoints
When working with the CLI, it's possible to manually choose the read/write endpoints for the
interaction with StarkNet, by adding the ``--feeder_gateway_url` and `gateway_url` parameters.

The following are the endpoints for StarkNet testnet and mainnet:

- Testnet feeder gateway URL: https://alpha4.starknet.io/feeder_gateway/
- Mainnet feeder gateway URL: https://alpha-mainnet.starknet.io/feeder_gateway/
- Testnet gateway URL: https://alpha4.starknet.io/gateway/
- Mainnet gateway URL: https://alpha-mainnet.starknet.io/gateway/
  :::
