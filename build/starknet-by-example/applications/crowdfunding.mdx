---
title: "Crowdfunding Campaign"
---

# Crowdfunding Campaign

Crowdfunding is a method of raising capital through the collective effort of many individuals. It allows project creators to raise funds from a large number of people, usually through small contributions.

1. Contract admin creates a campaign in some user's name (i.e. creator).
2. Users can pledge, transferring their token to a campaign.
3. Users can "unpledge", retrieving their tokens.
4. The creator can at any point refund any of the users.
5. Once the total amount pledged is more than the campaign goal, the campaign funds are "locked" in the contract, meaning the users can no longer unpledge; they can still pledge though.
6. After the campaign ends, the campaign creator can claim the funds if the campaign goal is reached.
7. Otherwise, campaign did not reach it's goal, pledgers can retrieve their funds.
8. The creator can at any point cancel the campaign for whatever reason and refund all of the pledgers.
9. The contract admin can upgrade the contract implementation, refunding all of the users and resetting the campaign state (we will use this in the [Advanced Factory chapter](./advanced_factory)).

Because contract upgrades need to be able to refund all of the pledges, we need to be able to iterate over all of the pledgers and their amounts. Since iteration is not supported by `Map`, we need to create a custom storage type that will encompass pledge management. We use a component for this purpose.

```rust
use starknet::ContractAddress;

#[starknet::interface]
pub trait IPledgeable<TContractState> {
    fn add(ref self: TContractState, pledger: ContractAddress, amount: u256);
    fn get(self: @TContractState, pledger: ContractAddress) -> u256;
    fn get_pledger_count(self: @TContractState) -> u32;
    fn array(self: @TContractState) -> Array<ContractAddress>;
    fn get_total(self: @TContractState) -> u256;
    fn remove(ref self: TContractState, pledger: ContractAddress) -> u256;
}

#[starknet::component]
pub mod pledgeable_component {
    use core::array::ArrayTrait;
    use core::num::traits::Zero;
    use starknet::ContractAddress;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };

    #[storage]
    pub struct Storage {
        index_to_pledger: Map<u32, ContractAddress>,
        pledger_to_amount: Map<ContractAddress, u256>,
        pledger_count: u32,
        total_amount: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    mod Errors {
        pub const INCONSISTENT_STATE: felt252 = 'Non-indexed pledger found';
    }

    #[embeddable_as(Pledgeable)]
    pub impl PledgeableImpl<
        TContractState, +HasComponent<TContractState>,
    > of super::IPledgeable<ComponentState<TContractState>> {
        fn add(ref self: ComponentState<TContractState>, pledger: ContractAddress, amount: u256) {
            let old_amount: u256 = self.pledger_to_amount.read(pledger);

            if old_amount == 0 {
                let index = self.pledger_count.read();
                self.index_to_pledger.write(index, pledger);
                self.pledger_count.write(index + 1);
            }

            self.pledger_to_amount.write(pledger, old_amount + amount);
            self.total_amount.write(self.total_amount.read() + amount);
        }

        fn get(self: @ComponentState<TContractState>, pledger: ContractAddress) -> u256 {
            self.pledger_to_amount.read(pledger)
        }

        fn get_pledger_count(self: @ComponentState<TContractState>) -> u32 {
            self.pledger_count.read()
        }

        fn array(self: @ComponentState<TContractState>) -> Array<ContractAddress> {
            let mut result = array![];

            let mut index = self.pledger_count.read();
            while index != 0 {
                index -= 1;
                let pledger = self.index_to_pledger.read(index);
                result.append(pledger);
            };

            result
        }

        fn get_total(self: @ComponentState<TContractState>) -> u256 {
            self.total_amount.read()
        }

        fn remove(ref self: ComponentState<TContractState>, pledger: ContractAddress) -> u256 {
            let amount: u256 = self.pledger_to_amount.read(pledger);

            // check if the pledge even exists
            if amount == 0 {
                return 0;
            }

            let last_index = self.pledger_count.read() - 1;

            // if there are other pledgers, we need to update our indices
            if last_index != 0 {
                let mut pledger_index = last_index;
                loop {
                    if self.index_to_pledger.read(pledger_index) == pledger {
                        break;
                    }
                    // if pledger_to_amount contains a pledger, then so does index_to_pledger
                    // thus this will never underflow
                    pledger_index -= 1;
                };

                self.index_to_pledger.write(pledger_index, self.index_to_pledger.read(last_index));
            }

            // last_index == new pledger count
            self.pledger_count.write(last_index);
            self.pledger_to_amount.write(pledger, 0);
            self.index_to_pledger.write(last_index, Zero::zero());

            self.total_amount.write(self.total_amount.read() - amount);

            amount
        }
    }
}
```

Now we can create the `Campaign` contract. 

```rust
pub mod pledgeable;

use starknet::{ClassHash, ContractAddress};

#[derive(Drop, Serde)]
pub struct Details {
    pub canceled: bool,
    pub claimed: bool,
    pub creator: ContractAddress,
    pub description: ByteArray,
    pub end_time: u64,
    pub goal: u256,
    pub start_time: u64,
    pub title: ByteArray,
    pub token: ContractAddress,
    pub total_pledges: u256,
}

#[starknet::interface]
pub trait ICampaign<TContractState> {
    fn claim(ref self: TContractState);
    fn cancel(ref self: TContractState, reason: ByteArray);
    fn pledge(ref self: TContractState, amount: u256);
    fn get_pledge(self: @TContractState, pledger: ContractAddress) -> u256;
    fn get_pledgers(self: @TContractState) -> Array<ContractAddress>;
    fn get_details(self: @TContractState) -> Details;
    fn refund(ref self: TContractState, pledger: ContractAddress, reason: ByteArray);
    fn upgrade(ref self: TContractState, impl_hash: ClassHash, new_end_time: Option<u64>);
    fn unpledge(ref self: TContractState, reason: ByteArray);
}

#[starknet::contract]
pub mod Campaign {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use components::ownable::ownable_component::OwnableInternalTrait;
    use core::num::traits::Zero;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{
        ClassHash, ContractAddress, get_block_timestamp, get_caller_address, get_contract_address,
    };
    use components::ownable::ownable_component;
    use super::pledgeable::pledgeable_component;
    use super::Details;

    component!(path: ownable_component, storage: ownable, event: OwnableEvent);
    component!(path: pledgeable_component, storage: pledges, event: PledgeableEvent);

    #[abi(embed_v0)]
    pub impl OwnableImpl = ownable_component::Ownable<ContractState>;
    impl OwnableInternalImpl = ownable_component::OwnableInternalImpl<ContractState>;
    #[abi(embed_v0)]
    impl PledgeableImpl = pledgeable_component::Pledgeable<ContractState>;

    #[storage]
    struct Storage {
        canceled: bool,
        claimed: bool,
        creator: ContractAddress,
        description: ByteArray,
        end_time: u64,
        goal: u256,
        #[substorage(v0)]
        ownable: ownable_component::Storage,
        #[substorage(v0)]
        pledges: pledgeable_component::Storage,
        start_time: u64,
        title: ByteArray,
        token: IERC20Dispatcher,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Claimed: Claimed,
        Canceled: Canceled,
        #[flat]
        OwnableEvent: ownable_component::Event,
        PledgeableEvent: pledgeable_component::Event,
        PledgeMade: PledgeMade,
        Refunded: Refunded,
        RefundedAll: RefundedAll,
        Unpledged: Unpledged,
        Upgraded: Upgraded,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Canceled {
        pub reason: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Claimed {
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PledgeMade {
        #[key]
        pub pledger: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Refunded {
        #[key]
        pub pledger: ContractAddress,
        pub amount: u256,
        pub reason: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    pub struct RefundedAll {
        pub reason: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Unpledged {
        #[key]
        pub pledger: ContractAddress,
        pub amount: u256,
        pub reason: ByteArray,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Upgraded {
        pub implementation: ClassHash,
    }

    pub mod Errors {
        pub const CANCELED: felt252 = 'Campaign canceled';
        pub const CLAIMED: felt252 = 'Campaign already claimed';
        pub const CLASS_HASH_ZERO: felt252 = 'Class hash zero';
        pub const CREATOR_ZERO: felt252 = 'Creator address zero';
        pub const ENDED: felt252 = 'Campaign already ended';
        pub const END_BEFORE_NOW: felt252 = 'End time < now';
        pub const END_BEFORE_START: felt252 = 'End time < start time';
        pub const END_BIGGER_THAN_MAX: felt252 = 'End time > max duration';
        pub const NOTHING_TO_REFUND: felt252 = 'Nothing to refund';
        pub const NOTHING_TO_UNPLEDGE: felt252 = 'Nothing to unpledge';
        pub const NOT_CREATOR: felt252 = 'Not creator';
        pub const NOT_STARTED: felt252 = 'Campaign not started';
        pub const PLEDGES_LOCKED: felt252 = 'Goal reached, pledges locked';
        pub const START_TIME_IN_PAST: felt252 = 'Start time < now';
        pub const STILL_ACTIVE: felt252 = 'Campaign not ended';
        pub const GOAL_NOT_REACHED: felt252 = 'Goal not reached';
        pub const TITLE_EMPTY: felt252 = 'Title empty';
        pub const TRANSFER_FAILED: felt252 = 'Transfer failed';
        pub const ZERO_ADDRESS_CALLER: felt252 = 'Caller address zero';
        pub const ZERO_ADDRESS_PLEDGER: felt252 = 'Pledger address zero';
        pub const ZERO_ADDRESS_TOKEN: felt252 = 'Token address zero';
        pub const ZERO_DONATION: felt252 = 'Donation must be > 0';
        pub const ZERO_GOAL: felt252 = 'Goal must be > 0';
        pub const ZERO_PLEDGES: felt252 = 'No pledges to claim';
    }

    const NINETY_DAYS: u64 = 90 * 24 * 60 * 60;

    #[constructor]
    fn constructor(
        ref self: ContractState,
        creator: ContractAddress,
        title: ByteArray,
        description: ByteArray,
        goal: u256,
        start_time: u64,
        end_time: u64,
        token_address: ContractAddress,
    ) {
        assert(creator.is_non_zero(), Errors::CREATOR_ZERO);
        assert(title.len() > 0, Errors::TITLE_EMPTY);
        assert(goal > 0, Errors::ZERO_GOAL);
        assert(start_time >= get_block_timestamp(), Errors::START_TIME_IN_PAST);
        assert(end_time >= start_time, Errors::END_BEFORE_START);
        assert(end_time <= get_block_timestamp() + NINETY_DAYS, Errors::END_BIGGER_THAN_MAX);
        assert(token_address.is_non_zero(), Errors::ZERO_ADDRESS_TOKEN);

        self.creator.write(creator);
        self.title.write(title);
        self.goal.write(goal);
        self.description.write(description);
        self.start_time.write(start_time);
        self.end_time.write(end_time);
        self.token.write(IERC20Dispatcher { contract_address: token_address });
        self.ownable._init(get_caller_address());
    }

    #[abi(embed_v0)]
    impl Campaign of super::ICampaign<ContractState> {
        fn cancel(ref self: ContractState, reason: ByteArray) {
            self._assert_only_creator();
            assert(!self.canceled.read(), Errors::CANCELED);
            assert(!self.claimed.read(), Errors::CLAIMED);

            self.canceled.write(true);

            self._refund_all(reason.clone());

            self.emit(Event::Canceled(Canceled { reason }));
        }

        /// Sends the funds to the campaign creator.
        /// It leaves the pledge data intact as a testament to campaign success
        fn claim(ref self: ContractState) {
            self._assert_only_creator();
            assert(self._is_started(), Errors::NOT_STARTED);
            assert(self._is_ended(), Errors::STILL_ACTIVE);
            assert(!self.claimed.read(), Errors::CLAIMED);
            assert(self._is_goal_reached(), Errors::GOAL_NOT_REACHED);
            // no need to check if canceled; if it was, then the goal wouldn't have been reached

            let this = get_contract_address();
            let token = self.token.read();
            let amount = token.balance_of(this);
            assert(amount > 0, Errors::ZERO_PLEDGES);

            self.claimed.write(true);

            let owner = get_caller_address();
            let success = token.transfer(owner, amount);
            assert(success, Errors::TRANSFER_FAILED);

            self.emit(Event::Claimed(Claimed { amount }));
        }

        fn get_details(self: @ContractState) -> Details {
            Details {
                canceled: self.canceled.read(),
                claimed: self.claimed.read(),
                creator: self.creator.read(),
                description: self.description.read(),
                end_time: self.end_time.read(),
                goal: self.goal.read(),
                start_time: self.start_time.read(),
                title: self.title.read(),
                token: self.token.read().contract_address,
                total_pledges: self.pledges.get_total(),
            }
        }

        fn get_pledge(self: @ContractState, pledger: ContractAddress) -> u256 {
            self.pledges.get(pledger)
        }

        fn get_pledgers(self: @ContractState) -> Array<ContractAddress> {
            self.pledges.array()
        }

        fn pledge(ref self: ContractState, amount: u256) {
            assert(self._is_started(), Errors::NOT_STARTED);
            assert(!self._is_ended(), Errors::ENDED);
            assert(!self.canceled.read(), Errors::CANCELED);
            assert(amount > 0, Errors::ZERO_DONATION);

            let pledger = get_caller_address();
            let this = get_contract_address();
            let success = self.token.read().transfer_from(pledger, this, amount);
            assert(success, Errors::TRANSFER_FAILED);

            self.pledges.add(pledger, amount);

            self.emit(Event::PledgeMade(PledgeMade { pledger, amount }));
        }

        fn refund(ref self: ContractState, pledger: ContractAddress, reason: ByteArray) {
            self._assert_only_creator();
            assert(self._is_started(), Errors::NOT_STARTED);
            assert(!self.claimed.read(), Errors::CLAIMED);
            assert(!self.canceled.read(), Errors::CANCELED);
            assert(pledger.is_non_zero(), Errors::ZERO_ADDRESS_PLEDGER);
            assert(self.pledges.get(pledger) != 0, Errors::NOTHING_TO_REFUND);

            let amount = self._refund(pledger);

            self.emit(Event::Refunded(Refunded { pledger, amount, reason }))
        }

        fn unpledge(ref self: ContractState, reason: ByteArray) {
            assert(self._is_started(), Errors::NOT_STARTED);
            assert(!self._is_goal_reached(), Errors::PLEDGES_LOCKED);
            assert(self.pledges.get(get_caller_address()) != 0, Errors::NOTHING_TO_UNPLEDGE);

            let pledger = get_caller_address();
            let amount = self._refund(pledger);

            self.emit(Event::Unpledged(Unpledged { pledger, amount, reason }));
        }

        fn upgrade(ref self: ContractState, impl_hash: ClassHash, new_end_time: Option<u64>) {
            self.ownable._assert_only_owner();
            assert(impl_hash.is_non_zero(), Errors::CLASS_HASH_ZERO);

            // only active campaigns have pledges to refund and an end time to update
            if self._is_started() {
                if let Option::Some(end_time) = new_end_time {
                    assert(end_time >= get_block_timestamp(), Errors::END_BEFORE_NOW);
                    assert(
                        end_time <= get_block_timestamp() + NINETY_DAYS,
                        Errors::END_BIGGER_THAN_MAX,
                    );
                    self.end_time.write(end_time);
                };
                self._refund_all("contract upgraded");
            }

            starknet::syscalls::replace_class_syscall(impl_hash).unwrap();

            self.emit(Event::Upgraded(Upgraded { implementation: impl_hash }));
        }
    }

    #[generate_trait]
    impl CampaignInternalImpl of CampaignInternalTrait {
        fn _assert_only_creator(self: @ContractState) {
            let caller = get_caller_address();
            assert(caller.is_non_zero(), Errors::ZERO_ADDRESS_CALLER);
            assert(caller == self.creator.read(), Errors::NOT_CREATOR);
        }

        fn _is_ended(self: @ContractState) -> bool {
            get_block_timestamp() >= self.end_time.read()
        }

        fn _is_goal_reached(self: @ContractState) -> bool {
            self.pledges.get_total() >= self.goal.read()
        }

        fn _is_started(self: @ContractState) -> bool {
            get_block_timestamp() >= self.start_time.read()
        }

        #[inline(always)]
        fn _refund(ref self: ContractState, pledger: ContractAddress) -> u256 {
            let amount = self.pledges.remove(pledger);

            let success = self.token.read().transfer(pledger, amount);
            assert(success, Errors::TRANSFER_FAILED);

            amount
        }

        fn _refund_all(ref self: ContractState, reason: ByteArray) {
            let mut pledges = self.pledges.array();
            while let Option::Some(pledger) = pledges.pop_front() {
                self._refund(pledger);
            };
            self.emit(Event::RefundedAll(RefundedAll { reason }));
        }
    }
}
