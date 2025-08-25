# Calling Other Contracts

In Starknet, contracts can interact with each other through contract calls. The recommended way to make these calls is using the dispatcher pattern, which provides type safety and better error handling.

## Understanding Dispatchers

A dispatcher is an automatically generated struct that handles the serialization and deserialization of contract calls. To use dispatchers:

1. Define the target contract's interface as a trait with `#[starknet::interface]` (`IContract`)
2. Import the generated dispatcher types (`IContractDispatcher` and `IContractDispatcherTrait`)
3. Create a dispatcher instance with the target contract's address

Let's look at a practical example where one contract (`Caller`) interacts with another (`Callee`). The `Callee` contract stores a value that can be set and retrieved:

```rust
#[starknet::interface]
trait ICallee<TContractState> {
    fn set_value(ref self: TContractState, value: u128);
    fn get_value(self: @TContractState) -> u128;
}

#[starknet::contract]
mod Callee {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        value: u128,
    }

    #[abi(embed_v0)]
    impl Callee of super::ICallee<ContractState> {
        fn set_value(ref self: ContractState, value: u128) {
            self.value.write(value);
        }

        fn get_value(self: @ContractState) -> u128 {
            self.value.read()
        }
    }
}
```

The `Caller` contract demonstrates how to use the dispatcher to interact with `Callee`:

```rust
#[starknet::interface]
trait ICaller<TContractState> {
    fn call_callee_set_value(ref self: TContractState, callee_address: ContractAddress, value: u128);
    fn call_callee_get_value(self: @TContractState, callee_address: ContractAddress) -> u128;
}

#[starknet::contract]
mod Caller {
    use starknet::storage::StoragePointerReadAccess;
    use super::ICaller;

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl Caller of super::ICaller<ContractState> {
        fn call_callee_set_value(ref self: ContractState, callee_address: ContractAddress, value: u128) {
            // Create a dispatcher for the callee contract
            let callee_dispatcher = ICalleeDispatcher { contract_address: callee_address };
            
            // Call the callee contract's set_value function
            callee_dispatcher.set_value(value);
        }

        fn call_callee_get_value(self: @ContractState, callee_address: ContractAddress) -> u128 {
            // Create a dispatcher for the callee contract
            let callee_dispatcher = ICalleeDispatcher { contract_address: callee_address };
            
            // Call the callee contract's get_value function
            callee_dispatcher.get_value()
        }
    }
}
```

### Key Points:

- The `#[starknet::interface]` attribute automatically generates the dispatcher types
- Dispatchers handle all the low-level details of contract interaction
- Contract calls are type-safe and checked at compile time
- Each contract maintains its own storage and state

For more details about dispatchers, check out the [Cairo Book](https://book.cairo-lang.org/ch102-02-interacting-with-another-contract.html).

<Note>
While you can use the low-level `call_contract_syscall` directly, it's not recommended as it:

- Requires manual serialization/deserialization
- Lacks compile-time type checking
- Is more easy to make mistakes
</Note>
