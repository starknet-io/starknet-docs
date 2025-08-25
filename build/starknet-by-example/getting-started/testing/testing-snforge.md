# Testing with Starknet Foundry (Snforge)

## Overview

Starknet Foundry provides a robust testing framework specifically designed for Starknet smart contracts. Tests can be executed using the `snforge test` command.

<Info>
To use snforge as your default test runner, add this to your `scarb.toml{:md}`:
```toml
[scripts]
test = "snforge test"
```
This will make `scarb test` use snforge under the hood.
</Info>

Let's examine a sample contract that we'll use throughout this section:

```rust
#[starknet::interface]
trait ITestContract<TContractState> {
    fn increment(ref self: TContractState);
    fn get_count(self: @TContractState) -> u128;
}

#[starknet::contract]
mod TestContract {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        count: u128,
    }

    #[abi(embed_v0)]
    impl TestContract of super::ITestContract<ContractState> {
        fn increment(ref self: ContractState) {
            let current = self.count.read();
            self.count.write(current + 1);
        }

        fn get_count(self: @ContractState) -> u128 {
            self.count.read()
        }
    }
}
```

## Test Structure and Organization

### Test Location
There are two common approaches to organizing tests:
1. **Integration Tests**: Place in the `tests/{:md}` directory, following your `src/{:md}` structure
2. **Unit Tests**: Place directly in `src/{:md}` files within a test module

For unit tests in source files, always guard the test module with `#[cfg(test)]` to ensure tests are only compiled during testing:

```rust
#[cfg(test)]
mod tests {
    use super::{ITestContractDispatcher, ITestContractDispatcherTrait};
    use snforge_std::{ContractClassTrait, DeclareResultTrait, declare};

    #[test]
    fn test_increment() {
        let contract = declare("TestContract").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@array![]).unwrap();
        let mut dispatcher = ITestContractDispatcher { contract_address };
        
        assert_eq!(dispatcher.get_count(), 0);
        dispatcher.increment();
        assert_eq!(dispatcher.get_count(), 1);
    }
}
```

### Basic Test Structure

Each test function requires the `#[test]` attribute. For tests that should verify error conditions, add the `#[should_panic]` attribute.

Here's a comprehensive test example:

```rust
#[cfg(test)]
mod tests {
    use super::{ITestContractDispatcher, ITestContractDispatcherTrait};
    use snforge_std::{ContractClassTrait, DeclareResultTrait, declare};

    fn deploy() -> ITestContractDispatcher {
        let contract = declare("TestContract").unwrap().contract_class();
        let (contract_address, _) = contract.deploy(@array![]).unwrap();
        ITestContractDispatcher { contract_address }
    }

    #[test]
    fn test_increment() {
        let mut contract = deploy();
        assert_eq!(contract.get_count(), 0);
        contract.increment();
        assert_eq!(contract.get_count(), 1);
    }

    #[test]
    fn test_multiple_increments() {
        let mut contract = deploy();
        contract.increment();
        contract.increment();
        contract.increment();
        assert_eq!(contract.get_count(), 3);
    }
}
```

## Testing Techniques

### Direct Storage Access

For testing specific storage scenarios, snforge provides `load` and `store` functions:

```rust
#[test]
fn test_direct_storage_access() {
    let mut contract = deploy();
    
    // Directly set storage value
    contract.contract_state_for_testing().count.write(100);
    assert_eq!(contract.get_count(), 100);
    
    // Directly read storage value
    let stored_value = contract.contract_state_for_testing().count.read();
    assert_eq!(stored_value, 100);
}
```

### Contract State Testing

Use `Contract::contract_state_for_testing` to access internal contract state:

```rust
#[test]
fn test_contract_state() {
    let mut contract = deploy();
    
    // Access contract state directly
    let state = contract.contract_state_for_testing();
    state.count.write(42);
    
    assert_eq!(contract.get_count(), 42);
}
```

### Event Testing

To verify event emissions:

```rust
#[test]
fn test_event_emission() {
    let mut contract = deploy();
    
    // Test that incrementing emits an event
    contract.increment();
    
    // Verify the event was emitted (this would require event definitions)
    // For now, just verify the state change
    assert_eq!(contract.get_count(), 1);
}
```

<Info>
For more details about events, visit the [Events](../basics/events) section.
</Info>

## Testing Best Practices

1. **Test Environment**: snforge bootstraps a minimal blockchain environment for predictable test execution
2. **Assertions**: Use built-in assertion macros for clear test conditions:
   - `assert_eq!`: Equal comparison
   - `assert_ne!`: Not equal comparison
   - `assert_gt!`: Greater than comparison
   - `assert_ge!`: Greater than or equal comparison
   - `assert_lt!`: Less than comparison
   - `assert_le!`: Less than or equal comparison
3. **Test Organization**: Group related tests in modules and use descriptive test names

## Next Steps

For more advanced testing techniques and features, consult the [Starknet Foundry Book - Testing Contracts](https://foundry-rs.github.io/starknet-foundry/testing/contracts.html).
