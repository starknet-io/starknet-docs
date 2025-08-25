# System Calls (Syscalls)

System calls (syscalls) are the interface between Starknet smart contracts and the Starknet Operating System (OS). They provide essential functionalities for:

- Reading blockchain state and context
- Contract interactions (deployment, calls)
- Event emission
- Cross-layer communication
- Storage operations

All syscalls return a `SyscallResult` type, which can be either `Success` or `Failure`, enabling proper error handling in your contracts.

## Available Syscalls

### Blockchain State

- [get_execution_info](#get_execution_info) - Get current execution context
- [get_block_hash](#get_block_hash) - Retrieve a block's hash
- [get_class_hash_at](#get_class_hash_at) - Get the class hash of a contract at a specific address

### Contract Operations

- [call_contract](#call_contract) - Call another contract
- [deploy](#deploy) - Deploy a new contract
- [library_call](#library_call) - Make a delegate call
- [replace_class](#replace_class) - Upgrade contract code

### Events and Messaging

- [emit_event](#emit_event) - Emit contract events
- [send_message_to_l1](#send_message_to_l1) - Send messages to Ethereum (L1)

### Storage Operations

- [storage_read](#storage_read) - Read from contract storage
- [storage_write](#storage_write) - Write to contract storage

### Cryptographic Operations

- [keccak](#keccak) - Compute Keccak hash
- [sha256_process_block](#sha256_process_block) - Compute SHA256 hash

## Detailed Reference

### get_block_hash

```rust
fn get_block_hash_syscall(block_number: u64) -> SyscallResult<felt252>
```

Retrieves the hash of a specific block by its number. Only works for blocks within the range `[first_v0_12_0_block, current_block - 10]`.

### get_execution_info

<Info>
Instead of using this syscall directly, the `starknet::info` module provides convenient helper functions:

- `get_execution_info()` - Full execution context
- `get_caller_address()` - Current caller
- `get_contract_address()` - Current contract
- `get_block_info()` - Block information
- `get_tx_info()` - Transaction details
- `get_block_timestamp()` - Current block time
- `get_block_number()` - Current block number
</Info>

```rust
fn get_execution_info_v2_syscall() -> SyscallResult<Box<starknet::info::v2::ExecutionInfo>>
fn get_execution_info_syscall() -> SyscallResult<Box<starknet::info::ExecutionInfo>>
```

Returns information about the current execution context.

### get_class_hash_at

<Warning>
This syscall will only be supported from Starknet v0.13.4 onwards.
</Warning>

```rust
fn get_class_hash_at_syscall(contract_address: ContractAddress) -> SyscallResult<ClassHash>
```

Returns the class hash of a contract at a specific address.

### call_contract

<Info>
For safer contract calls, use the dispatcher pattern shown in [Calling other contracts](./interacting/calling_other_contracts)
</Info>

```rust
fn call_contract_syscall(
    address: ContractAddress,
    entry_point_selector: felt252,
    calldata: Span<felt252>
) -> SyscallResult<Span<felt252>>
```

Calls a contract at the specified address. Failures cannot be caught and will revert the entire transaction.

### deploy

```rust
fn deploy_syscall(
    class_hash: ClassHash,
    contract_address_salt: felt252,
    calldata: Span<felt252>,
    deploy_from_zero: bool,
) -> SyscallResult<(ContractAddress, Span::<felt252>)>
```

Deploys a new contract instance. Returns the deployed address and constructor result.

The [Simple Factory](./interacting/factory) uses the `deploy` syscall under the hood:

```cairo
// [!include ~/listings/quickstart/factory/src/simple_factory.cairo:deploy]
```

### emit_event

```rust
fn emit_event_syscall(
    keys: Span<felt252>,
    data: Span<felt252>
) -> SyscallResult<()>
```

Emits an event with indexed keys and data values.

See the [Events](./basics/events) section for more information:

```cairo
// [!include ~/listings/quickstart/events/src/counter.cairo:emit]
```

### library_call

```rust
fn library_call_syscall(
    class_hash: ClassHash,
    function_selector: felt252,
    calldata: Span<felt252>
) -> SyscallResult<Span<felt252>>
```

Makes a delegate call to execute code from another contract class within the current contract's context. Similar to Ethereum's delegatecall but limited to a single class.

### send_message_to_l1

```rust
fn send_message_to_l1_syscall(
    to_address: felt252,
    payload: Span<felt252>
) -> SyscallResult<()>
```

Sends a message to an Ethereum (L1) contract.

### replace_class

```rust
fn replace_class_syscall(
    class_hash: ClassHash
) -> SyscallResult<()>
```

Upgrades the contract's code by replacing its class hash.

This syscall is used in [Upgradeable Contract](../../applications/upgradeable_contract):

```cairo
// [!include ~/listings/applications/upgradeable_contract/src/upgradeable_contract_v0.cairo:upgrade]
```

:::note
The new code only affects future calls. The current transaction continues with the old code unless explicitly called through `call_contract`.
:::

### storage_read

:::warning
Using this syscall directly is not recommended. Follow the [Storage](./basics/storage) section for more information.
:::

```rust
fn storage_read_syscall(
    address_domain: u32,
    address: StorageAddress,
) -> SyscallResult<felt252>
```

Low-level storage read operation.

### storage_write

:::warning
Using this syscall directly is not recommended. Follow the [Storage](./basics/storage) section for more information.
:::

```rust
fn storage_write_syscall(
    address_domain: u32,
    address: StorageAddress,
    value: felt252
) -> SyscallResult<()>
```

Low-level storage write operation.

### keccak

```rust
fn keccak_syscall(input: Span<u64>) -> SyscallResult<u256>
```

Computes the Keccak hash of the input data as a little-endian 256-bit number, where `input` is a Span of 64-bits little-endian words.

:::note
**Padding**

- The input must be a multiple of 1088 bits (== 17 u64 words)
- The input must be pre-padded following the Keccak padding rule (pad10\*1):
  1. Add a '1' bit
  2. Add zero or more '0' bits
  3. Add a final '1' bit
     The total length after padding must be a multiple of 1088 bits

:::

### sha256_process_block

```rust
fn sha256_process_block_syscall(
    state: core::sha256::Sha256StateHandle, input: Box<[u32; 16]>,
) -> SyscallResult<core::sha256::Sha256StateHandle> {}
```

Computes the next SHA-256 state of the input block with the given state.

:::note
The system call does not add any padding and the input needs to be a multiple of 512 bits (== 16 u32 words).
:::

## Additional Resources

- [Official Syscalls Documentation](https://docs.starknet.io/documentation/architecture_and_concepts/Smart_Contracts/system-calls-cairo1/)
- [Source Code](https://github.com/starkware-libs/cairo/blob/v2.10.1/corelib/src/starknet/syscalls.cairo)
