# System Calls

## Introduction

StarkNet smart contracts are written in Cairo. However, Cairo is (among other things, see the [whitepaper](https://eprint.iacr.org/2021/1063.pdf) for more details) a general purpose language, not necessarily aimed at writing contract language. Thus, some additional capabilities are needed for operations that make sense in a smart contract context but not in a standalone program, e.g. calling another contract or accessing the contract's storage. To this end, we introduce system calls to our smart contract language. System calls are a way for the contract to require services from the StarkNet OS. Using these services, a function inside the contract can obtain information that would otherwise be inaccessible, as it depends on the broader state of StarkNet rather than local variables that appear in the function's scope.

## Supported System Calls

### Send Message To L1

Requests the StarkNet OS to send a message to L1. This includes the message parameters as part of the proof's output, exposing them to the StarkNet Core contract on L1 once the state update, including the transaction, is received. For more information, see StarkNet's [messaging mechanism](../L1-L2%20Communication/messaging-mechanism).

This system call expects the receipent address on L1 and the message payload. The send message to L1 syscall can be raised by calling the following function, which is available in [messages.cairo](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/common/messages.cairo):

```js title="send_message_to_l1"
func send_message_to_l1{syscall_ptr : felt*}(
    to_address : felt, payload_size : felt, payload : felt*
)
```

### Library Call

Calls the requested function in any previously declared class. This replaces the known delegate call functionality from Ethereum, with the important difference that there is only one contract involved, the class is only used for its logic.

This system call expects the hash of the class we want to use, a selector for a function within that class, and call arguments. The library call syscall can be raised by calling the following function, which is available in `syscalls.cairo`:

```js title="library_call"
func library_call{syscall_ptr : felt*}(
    class_hash : felt, function_selector : felt, calldata_size : felt, calldata : felt*
) -> (retdata_size : felt, retdata : felt*)
```

### Library Call L1 handler

Similar to library call, but allows calling an L1 handler, which is not direcly callable otherwise (for more details, see StarkNet's [messaging mechanism](../L1-L2 Communication/messaging-mechanism#l1--l2-messages).

When an L1 handler is invoked via this syscall, no L1→L2 message is consumed. This enables a l1 handler to use the logic inside a different l1 handler from an existing class.

:::tip
While not directly enforced, it is best practice to only raise this syscall inside a l1 handler
:::

This system call expects the hash of the class we want to use, a selector for a l1 handler within that class, and call arguments. The library call syscall can be raised by calling the following function, which is available in `syscalls.cairo`:

```js title="library_call_l1_handler"
func library_call_l1_handler{syscall_ptr : felt*}(
    class_hash : felt, function_selector : felt, calldata_size : felt, calldata : felt*
) -> (retdata_size : felt, retdata : felt*)
```

### Deploy

Deploys a new instance of a previously declared class.

This system call expects the class hash of the contract to be deployed, salt (used in the computation of the [contract's address](./contract-address), and constructor arguments. The deploy syscall can be raised by calling the following function, which is available in `syscalls.cairo`:

```js title="deploy"
func deploy{syscall_ptr : felt*}(
    class_hash : felt,
    contract_address_salt : felt,
    constructor_calldata_size : felt,
    constructor_calldata : felt*,
) -> (contract_address : felt)
```

### Get caller address

Returns the address of the calling contract or 0 if this transaction was not initiated by another contract.

This system call can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L112):

```js title="get_caller_address"
func get_caller_address{syscall_ptr : felt*}() -> (caller_address : felt)
```

### Get block number

Gets the number of the block in which the transaction is executed.

This system call can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L161):

```js title="get_block_number"
func get_block_number{syscall_ptr : felt*}() -> (block_number : felt)
```

### Get block timestamp

Gets the timestamp of the block in which the transaction is executed.

This system call can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L210):

```js title="get_block_timestamp"
func get_block_timestamp{syscall_ptr : felt*}() -> (block_timestamp : felt)
```

### Get contract address

Gets the address of the contract who raised the syscall.

This system call can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L186):

```js title="get_contract_address"
func get_contract_address{syscall_ptr : felt*}() -> (contract_address : felt)
```

### Get sequencer address

Returns the address of the sequencer that is producing this block.

This system call can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L138):

```js title="get_sequencer_address"
func get_sequencer_address{syscall_ptr : felt*}() -> (sequencer_address : felt)
```

### Call contract

Calls a given contract. This system call expects the address of the called contract, a selector for a function within that contract, and call arguments.

The call contract syscall can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L42):

```js title="call_contract"
func call_contract{syscall_ptr : felt*}(
    contract_address : felt, function_selector : felt, calldata_size : felt, calldata : felt*
) -> (retdata_size : felt, retdata : felt*)
```

Note that this is consided a lower level syntax for calling contracts. If the interface of the called contract is available, then a more straightforward syntax can be used. See the [tutorial](https://starknet.io/docs/hello_starknet/calling_contracts.html) for more details.

### Storage read

Gets the value of a key in the storage of the calling contract. This system call execpts the key to be read.

The storage read syscall can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L264):

```js title="storage_read"
func storage_read{syscall_ptr : felt*}(address : felt) -> (value : felt)
```

Note that this is considered a low level access to the contract's storage, for a more high level syntax see [storage variables](./contract-storage#storage-variables)

### Storage write

Sets the value of a key in the storage of the calling contract. This system call execpts a key and the value to be writted.

The storage read syscall can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L282):

```js title="storage_write"
func storage_write{syscall_ptr : felt*}(address : felt, value : felt)
```

Note that this is considered a low level access to the contract's storage, for a more high level syntax see [storage variables](./contract-storage#storage-variables)

### Get transaction info

Gets the following information about the original transaction:

- the intended StarkNet OS version
- the address of the account who initiated this transaction
- the maximum fee that is allowed to be charged for the inclusion of this transaction
- the signature of the account who initited this transaction
- the transaction's hash
- the intended chain id

The get trnasaction info syscall can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L351):

```js title="get_tx_info"
func get_tx_info{syscall_ptr : felt*}() -> (tx_info : TxInfo*)
```

### Emit event

Emits an event with a given set of keys and data.

The emit event syscall can be raised by calling the following function, which is available in [`syscalls.cairo`](https://github.com/starkware-libs/cairo-lang/blob/2abd303e1808612b724bc1412b2b5babd04bb4e7/src/starkware/starknet/common/syscalls.cairo#L301):

```js title="emit_event"
func emit_event{syscall_ptr : felt*}(keys_len : felt, keys : felt*, data_len : felt, data : felt*)
```

For more information, and for a higher level syntax for emitting events, see the [documentation](../Events/starknet-events).
