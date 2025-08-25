.. _amm_cairo:

A simple Automated Market Maker (AMM)
=====================================

Automated Market Maker (AMM), as you might guess from the name,
is a mechanism that allows a simple way for market-making.
In an AMM we have two types of users: traders and liquidity providers.

Traders perform trades against liquidity pools.
Every liquidity pool supports two or more assets,
and allows trading according to some predetermined formula.
This means that for every quantity of some asset that you want to buy,
you can compute exactly how much you'd have to pay to receive it
(given the current state of the pool).

Unlike the regular order book matching, it's very easy to write and run AMM logic.
So easy that it can be fully deployed on Ethereum and still provide efficient, inexpensive trading.
The user interface is extremely simple -- you only need to specify the quantity of the assets
you want to trade, and you know you'll get a fair rate.
An AMM is also very friendly for the Liquidity Providers --
anyone can easily provide liquidity (invest money) and potentially profit by doing so.

To learn more about AMM you can take a look at the
`Uniswap docs <https://uniswap.org/docs/v2/protocol-overview/how-uniswap-works/>`_.

A regular smart contract implementing an AMM may change the balance of your on-chain account
for each operation. The problem with this approach is that it implies that every operation
will have a non-negligible gas cost.
In order to achieve scalability, we move from transactions that change the on-chain (L1) state
to off-chain transactions that change an off-chain (L2) state.
Consider :ref:`the voting system example <voting>`. For each vote we changed the Merkle tree
of public keys -- this is an example of an off-chain state
(note that the root of the Merkle is usually maintained on-chain, so the root by itself
is an example of an on-chain state).

In this tutorial we will write Cairo code that implements a very simple AMM.
The system we are going to build will handle swaps between users and the AMM.
Following the release StarkNet Planets Alpha, we released a :ref:`tutorial <amm_starknet>`
that implements the same functionality presented here, only as a StarkNet contract.
Comparing those two tutorials can be a fun exercise that highlights the power of StarkNet.
To keep the tutorial manageable, a few things were omitted
(after reading this page, and assuming you have read the previous pages of the tutorial,
you should be able to add all of them by yourself):

1.  Only two tokens are supported, and the AMM supports a specific trading curve.
2.  Signature verification -- in most scenarios you'll need to verify that the user
    intended to make the transaction.
3.  One direction trades -- The system only supports buying one token in exchange
    for the other one, in one direction.
4.  Users providing liquidity (off-chain) --
    providing liquidity can be handled on-chain with the proposed system,
    but you can also implement an off-chain version, where a user can move funds
    from their (off-chain) account to the AMM.
5.  Deposits and withdrawals -- To make it a real system, you'll have to allow users
    to deposit and withdraw their funds.
    This can be done by outputting the amount deposited or withdrawn and performing the
    equivalent operation on-chain, based on this output.
6.  Trading fees -- usually some fee is taken from the traders, to incentivize
    liquidity providers.

Accounts
--------

Each account will contain the balances of the two tokens, and the public key of the user.
Since this tutorial does not implement signature verification, we won't really use the
``public_key`` field -- it's here mainly for the sake of completeness.

.. tested-code:: cairo account

    struct Account {
        public_key: felt,
        token_a_balance: felt,
        token_b_balance: felt,
    }

Modifying an account
--------------------

First, let's define the global state.
We will use a ``DictAccess`` array to track the changes to the accounts in the batch.
The key will be the account id, and the value will be a pointer to an instance of the ``Account``
struct.
If you need to recall how a ``DictAccess`` array works, see :ref:`dicts_in_cairo`.

.. tested-code:: cairo amm_state

    from starkware.cairo.common.dict_access import DictAccess

    // The maximum amount of each token that belongs to the AMM.
    const MAX_BALANCE = 2 ** 64 - 1;

    struct AmmState {
        // A dictionary that tracks the accounts' state.
        account_dict_start: DictAccess*,
        account_dict_end: DictAccess*,
        // The amount of the tokens currently in the AMM.
        // Must be in the range [0, MAX_BALANCE].
        token_a_balance: felt,
        token_b_balance: felt,
    }

Now we can write a function that updates the balances of a given account and returns its key:

.. tested-code:: cairo modify_account

    from starkware.cairo.common.dict import dict_read, dict_write
    from starkware.cairo.common.math import assert_nn_le
    from starkware.cairo.common.registers import get_fp_and_pc

    func modify_account{range_check_ptr}(
        state: AmmState, account_id, diff_a, diff_b
    ) -> (state: AmmState, key: felt) {
        alloc_locals;

        // Define a reference to state.account_dict_end so that we
        // can use it as an implicit argument to the dict functions.
        let account_dict_end = state.account_dict_end;

        // Retrieve the pointer to the current state of the account.
        let (local old_account: Account*) = dict_read{
            dict_ptr=account_dict_end
        }(key=account_id);

        // Compute the new account values.
        tempvar new_token_a_balance = (
            old_account.token_a_balance + diff_a
        );
        tempvar new_token_b_balance = (
            old_account.token_b_balance + diff_b
        );

        // Verify that the new balances are positive.
        assert_nn_le(new_token_a_balance, MAX_BALANCE);
        assert_nn_le(new_token_b_balance, MAX_BALANCE);

        // Create a new Account instance.
        local new_account: Account;
        assert new_account.public_key = old_account.public_key;
        assert new_account.token_a_balance = new_token_a_balance;
        assert new_account.token_b_balance = new_token_b_balance;

        // Perform the account update.
        // Note that dict_write() will update the 'account_dict_end'
        // reference.
        let (__fp__, _) = get_fp_and_pc();
        dict_write{dict_ptr=account_dict_end}(
            key=account_id, new_value=cast(&new_account, felt)
        );

        // Construct and return the new state with the updated
        // 'account_dict_end'.
        local new_state: AmmState;
        assert new_state.account_dict_start = (
            state.account_dict_start
        );
        assert new_state.account_dict_end = account_dict_end;
        assert new_state.token_a_balance = state.token_a_balance;
        assert new_state.token_b_balance = state.token_b_balance;

        return (state=new_state, key=old_account.public_key);
    }

Note that when we call ``dict_write()`` we need to cast the type
of the value from ``Account*`` to ``felt``: ``&new_account``
is of type ``Account*``, but ``new_value`` expects a value
of type ``felt``.

Swapping Tokens
---------------

Now let's move on to the interesting part of the AMM: exchanging tokens.
Say that a user wants to get ``token_b`` in exchange for ``token_a`` of some specified amount
(``token_a_amount``). Let's denote the amount of tokens they will get by ``token_b_amount``.
In the equations below we let:

* ``a`` and ``b`` denote the amounts of ``token_a`` and ``token_b`` the user swaps,
* ``x`` and ``y`` denote the current balances of ``token_a`` and ``token_b`` in the AMM
  (that is, ``AmmState.token_a_balance`` and ``AmmState.token_b_balance``).

The AMM formula states that the value of ``token_a_balance * token_b_balance`` (that is, ``x * y``)
should be preserved. So we have:

.. math::

    (x + a) \cdot (y - b)  = x \cdot y.

Let's isolate ``b`` (as the rest of the values are known):

.. math::

    b = \frac{y \cdot a}{x + a}.

.. _swap:

.. tested-code:: cairo swap

    from starkware.cairo.common.math import unsigned_div_rem

    // Represents a swap transaction between a user and the AMM.
    struct SwapTransaction {
        account_id: felt,
        token_a_amount: felt,
    }

    func swap{range_check_ptr}(
        state: AmmState, transaction: SwapTransaction*
    ) -> (state: AmmState) {
        alloc_locals;

        tempvar a = transaction.token_a_amount;
        tempvar x = state.token_a_balance;
        tempvar y = state.token_b_balance;

        // Check that a is in range.
        assert_nn_le(a, MAX_BALANCE);

        // Compute the amount of token_b the user will get:
        //   b = (y * a) / (x + a).
        let (b, _) = unsigned_div_rem(y * a, x + a);
        // Make sure that b is also in range.
        assert_nn_le(b, MAX_BALANCE);

        // Update the user's account.
        let (state, key) = modify_account(
            state=state,
            account_id=transaction.account_id,
            diff_a=-a,
            diff_b=b,
        );

        // Here you should verify the user has signed on a message
        // specifying that they would like to sell 'a' tokens of
        // type token_a. You should use the public key returned by
        // modify_account().

        // Compute the new balances of the AMM and make sure they
        // are in range.
        tempvar new_x = x + a;
        tempvar new_y = y - b;
        assert_nn_le(new_x, MAX_BALANCE);
        assert_nn_le(new_y, MAX_BALANCE);

        // Update the state.
        local new_state: AmmState;
        assert new_state.account_dict_start = (
            state.account_dict_start
        );
        assert new_state.account_dict_end = state.account_dict_end;
        assert new_state.token_a_balance = new_x;
        assert new_state.token_b_balance = new_y;

        %{
            # Print the transaction values using a hint, for
            # debugging purposes.
            print(
                f'Swap: Account {ids.transaction.account_id} '
                f'gave {ids.a} tokens of type token_a and '
                f'received {ids.b} tokens of type token_b.')
        %}

        return (state=new_state);
    }

.. _transaction_loop_list:

The transaction loop
--------------------

The following function takes an array of transactions and applies them to the state:

.. tested-code:: cairo transaction_loop

    func transaction_loop{range_check_ptr}(
        state: AmmState,
        transactions: SwapTransaction**,
        n_transactions,
    ) -> (state: AmmState) {
        if (n_transactions == 0) {
            return (state=state);
        }

        let first_transaction: SwapTransaction* = [transactions];
        let (state) = swap(
            state=state, transaction=first_transaction
        );

        return transaction_loop(
            state=state,
            transactions=transactions + 1,
            n_transactions=n_transactions - 1,
        );
    }

The type ``SwapTransaction**`` represents a pointer to a pointer to an instance
of ``SwapTransaction``.
In our case it represents a list of pointers to swap transactions,
so that ``[transactions]`` is a pointer to the first transaction,
``[transactions + 1]`` is a pointer to the second transaction and so on.

Computing the Merkle roots
--------------------------

The accounts will be stored as the leaves of
a `Merkle tree <https://en.wikipedia.org/wiki/Merkle_tree>`_
(similar to what we did in :ref:`the voting tutorial <voting_merkle_tree>`),
so we need to generate one field element
that represents the account information.
We will do so by computing the hash of the ``Account`` struct's members:

.. tested-code:: cairo hash_account

    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    // Returns a hash committing to the account's state using the
    // following formula:
    //   H(H(public_key, token_a_balance), token_b_balance).
    // where H is the Pedersen hash function.
    func hash_account{pedersen_ptr: HashBuiltin*}(
        account: Account*
    ) -> (res: felt) {
        let res = account.public_key;
        let (res) = hash2{hash_ptr=pedersen_ptr}(
            res, account.token_a_balance
        );
        let (res) = hash2{hash_ptr=pedersen_ptr}(
            res, account.token_b_balance
        );
        return (res=res);
    }

We continue in a similar manner to the way the :ref:`main function <voting_main>` works in
the voting tutorial.
We need to take the dict of changes to the accounts, squash it and compute
the Merkle roots before and after applying the batch of transactions.
Unlike the voting tutorial, where the values in the dict were the leaves themselves,
here the values are pointers to ``Account`` so
before calling ``small_merkle_tree_update`` (and after squashing the dictionary)
we call ``hash_account`` on all the values (both before and after the batch):

.. tested-code:: cairo hash_dict_values

    from starkware.cairo.common.dict import dict_update

    // For each entry in the input dict (represented by dict_start
    // and dict_end) write an entry to the output dict (represented
    // by hash_dict_start and hash_dict_end) after applying
    // hash_account on prev_value and new_value and keeping the same
    // key.
    func hash_dict_values{pedersen_ptr: HashBuiltin*}(
        dict_start: DictAccess*,
        dict_end: DictAccess*,
        hash_dict_start: DictAccess*,
    ) -> (hash_dict_end: DictAccess*) {
        if (dict_start == dict_end) {
            return (hash_dict_end=hash_dict_start);
        }

        // Compute the hash of the account before and after the
        // change.
        let (prev_hash) = hash_account(
            account=cast(dict_start.prev_value, Account*)
        );
        let (new_hash) = hash_account(
            account=cast(dict_start.new_value, Account*)
        );

        // Add an entry to the output dict.
        dict_update{dict_ptr=hash_dict_start}(
            key=dict_start.key,
            prev_value=prev_hash,
            new_value=new_hash,
        );
        return hash_dict_values(
            dict_start=dict_start + DictAccess.SIZE,
            dict_end=dict_end,
            hash_dict_start=hash_dict_start,
        );
    }

Now we can compute the Merkle roots (we have arbitrarily chosen to use height of 10 in the
Merkle tree, supporting :math:`2^{10} = 1024` accounts):

.. tested-code:: cairo compute_merkle_roots

    from starkware.cairo.common.dict import dict_new, dict_squash
    from starkware.cairo.common.small_merkle_tree import (
        small_merkle_tree_update,
    )

    const LOG_N_ACCOUNTS = 10;

    // Computes the Merkle roots before and after the batch.
    // Hint argument: initial_account_dict should be a dictionary
    // from account_id to an address in memory of the Account struct.
    func compute_merkle_roots{
        pedersen_ptr: HashBuiltin*, range_check_ptr
    }(state: AmmState) -> (root_before: felt, root_after: felt) {
        alloc_locals;

        // Squash the account dictionary.
        let (squashed_dict_start, squashed_dict_end) = dict_squash(
            dict_accesses_start=state.account_dict_start,
            dict_accesses_end=state.account_dict_end,
        );

        // Hash the dict values.
        %{
            from starkware.crypto.signature.signature import pedersen_hash

            initial_dict = {}
            for account_id, account in initial_account_dict.items():
                public_key = memory[
                    account + ids.Account.public_key]
                token_a_balance = memory[
                    account + ids.Account.token_a_balance]
                token_b_balance = memory[
                    account + ids.Account.token_b_balance]
                initial_dict[account_id] = pedersen_hash(
                    pedersen_hash(public_key, token_a_balance),
                    token_b_balance)
        %}
        let (local hash_dict_start: DictAccess*) = dict_new();
        let (hash_dict_end) = hash_dict_values(
            dict_start=squashed_dict_start,
            dict_end=squashed_dict_end,
            hash_dict_start=hash_dict_start,
        );

        // Compute the two Merkle roots.
        let (root_before, root_after) = small_merkle_tree_update{
            hash_ptr=pedersen_ptr
        }(
            squashed_dict_start=hash_dict_start,
            squashed_dict_end=hash_dict_end,
            height=LOG_N_ACCOUNTS,
        );

        return (root_before=root_before, root_after=root_after);
    }

Let's discuss the hint before calling ``dict_new``.
``dict_new`` expects a hint variable called ``initial_dict``
that specifies what the values of the dictionary are before applying the changes.
This is especially important since
we need the information on *all* of the accounts for the Merkle root computation,
and it's likely that not all of them appeared in the batch.

The computation of the ``initial_dict`` variable can be done in many ways.
Here we chose to pass a hint variable ``initial_account_dict``
that we compute in ``get_account_dict()`` below.


Preparing the program input
---------------------------

Let's create a program input file where we have two accounts with ids 0 and 5
(recall that as we use a Merkle tree of height 10, the account ids should be in the range
:math:`[0, 1024)`). We'll have two swap transactions, one for each of the accounts.

Create a file named ``amm_input.json`` with the following content:

.. tested-code:: json amm_input

    {
        "token_a_balance": 100,
        "token_b_balance": 1000,
        "accounts": {
            "0": {
                "public_key": "0x0",
                "token_a_balance": 123,
                "token_b_balance": 500
            },
            "5": {
                "public_key": "0x0",
                "token_a_balance": 750,
                "token_b_balance": 20
            }
        },
        "transactions": [
            {
                "account_id": 5,
                "token_a_amount": 10
            },
            {
                "account_id": 0,
                "token_a_amount": 10
            }
        ]
    }

Now we'll write two functions that parse the program input.
Recall that values that are chosen by the hints cannot be trusted and their validity
must be checked using Cairo instructions.
For example, in :ref:`swap() <swap>` we verify that the transaction's
``token_a_amount``
is in range (rather than a negative number, for example).

.. tested-code:: cairo get_transactions

    func get_transactions() -> (
        transactions: SwapTransaction**, n_transactions: felt
    ) {
        alloc_locals;
        local transactions: SwapTransaction**;
        local n_transactions: felt;
        %{
            transactions = [
                [
                    transaction['account_id'],
                    transaction['token_a_amount'],
                ]
                for transaction in program_input['transactions']
            ]
            ids.transactions = segments.gen_arg(transactions)
            ids.n_transactions = len(transactions)
        %}
        return (
            transactions=transactions, n_transactions=n_transactions
        );
    }

    func get_account_dict() -> (account_dict: DictAccess*) {
        alloc_locals;
        %{
            account = program_input['accounts']
            initial_dict = {
                int(account_id_str): segments.gen_arg([
                    int(info['public_key'], 16),
                    info['token_a_balance'],
                    info['token_b_balance'],
                ])
                for account_id_str, info in account.items()
            }

            # Save a copy of initial_dict for
            # compute_merkle_roots.
            initial_account_dict = dict(initial_dict)
        %}

        // Initialize the account dictionary.
        let (account_dict) = dict_new();
        return (account_dict=account_dict);
    }

In ``get_transactions()`` we used a utility function called ``segments.gen_arg()``.
This function takes an array of values and creates a new :ref:`memory segment <segments>`
initialized with those values. It returns a pointer to the new segment.
For example,

.. tested-code:: cairo gen_arg0

    func main() {
        alloc_locals;
        local x: felt*;
        %{ ids.x = segments.gen_arg([1, 2, 3]) %}
        assert [x] = 1;
        assert [x + 1] = 2;
        assert [x + 2] = 3;
        return ();
    }

But that's not all -- ``segments.gen_arg()`` works recursively, so any element of the input array
can be an array itself:

.. tested-code:: cairo gen_arg1

    func main() {
        alloc_locals;
        // x is a list of lists.
        local x: felt**;
        %{ ids.x = segments.gen_arg([[1, 2], [3, 4]]) %}
        assert [[x]] = 1;
        assert [[x] + 1] = 2;
        assert [[x + 1]] = 3;
        assert [[x + 1] + 1] = 4;
        return ();
    }

By the way, another similar utility function is ``segments.write_arg()``.
It behaves like ``segments.gen_arg()``,
except that it gets the pointer to write to rather than allocating a new memory segment:

.. tested-code:: cairo gen_arg2

    from starkware.cairo.common.alloc import alloc

    func main() {
        let (vec: felt*) = alloc();
        // Here, an address was already assigned to vec.
        %{ segments.write_arg(ids.vec, [1, 2, 3]) %}
        ap += 2;
        assert [vec] = 1;
        assert [vec + 1] = 2;
        assert [vec + 2] = 3;
        return ();
    }

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13

    for i in range(3):
        program = compile_cairo(codes[f'gen_arg{i}'], PRIME, debug_info=True)
        runner = CairoRunner(program, layout='small')

        runner.initialize_segments()
        end = runner.initialize_main_entrypoint()
        runner.initialize_vm(hint_locals={})
        runner.run_until_pc(end)


The main() function
-------------------

Now we're ready to write the ``main()`` function:

.. tested-code:: cairo amm_main

    %builtins output pedersen range_check

    // The output of the AMM program.
    struct AmmBatchOutput {
        // The balances of the AMM before applying the batch.
        token_a_before: felt,
        token_b_before: felt,
        // The balances of the AMM after applying the batch.
        token_a_after: felt,
        token_b_after: felt,
        // The account Merkle roots before and after applying
        // the batch.
        account_root_before: felt,
        account_root_after: felt,
    }

    func main{
        output_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr,
    }() {
        alloc_locals;

        // Create the initial state.
        local state: AmmState;
        %{
            # Initialize the balances using a hint.
            # Later we will output them to the output struct,
            # which will allow the verifier to check that they
            # are indeed valid.
            ids.state.token_a_balance = \
                program_input['token_a_balance']
            ids.state.token_b_balance = \
                program_input['token_b_balance']
        %}

        let (account_dict) = get_account_dict();
        assert state.account_dict_start = account_dict;
        assert state.account_dict_end = account_dict;

        // Output the AMM's balances before applying the batch.
        let output = cast(output_ptr, AmmBatchOutput*);
        let output_ptr = output_ptr + AmmBatchOutput.SIZE;

        assert output.token_a_before = state.token_a_balance;
        assert output.token_b_before = state.token_b_balance;

        // Execute the transactions.
        let (transactions, n_transactions) = get_transactions();
        let (state: AmmState) = transaction_loop(
            state=state,
            transactions=transactions,
            n_transactions=n_transactions,
        );

        // Output the AMM's balances after applying the batch.
        assert output.token_a_after = state.token_a_balance;
        assert output.token_b_after = state.token_b_balance;

        // Write the Merkle roots to the output.
        let (root_before, root_after) = compute_merkle_roots(
            state=state
        );
        assert output.account_root_before = root_before;
        assert output.account_root_after = root_after;

        return ();
    }

Run the code (you can find the full Cairo file `here <../_static/amm.cairo>`_):

.. tested-code:: bash amm_compile

    cairo-compile amm.cairo --output amm_compiled.json

    cairo-run --program=amm_compiled.json \
        --print_output --layout=small \
        --program_input=amm_input.json

You should get:

.. tested-code:: none amm_output

    Swap: Account 5 gave 10 tokens of type token_a and received 90 tokens of type token_b.
    Swap: Account 0 gave 10 tokens of type token_a and received 75 tokens of type token_b.
    Program output:
      100
      1000
      120
      835
      1525995302570384126242713246787576393592941654328044962264804620003580146919
      1134357528922022223420621430912271931318105966572115905728401979526314542570

Note that the initial balances were 100 and 1000 as specified in the input file.
The final balances, 120 and 835, are consistent with the logs of transactions.

Let's examine the product formula:
After the first transaction the AMM has :math:`100 + 10 = 110` and :math:`1000 - 90 = 910`
tokens respectively.
Indeed 110 * 910 is approximately 100 * 1000. In fact, it is slightly greater.
If the user had gotten 91 tokens rather than 90, the product would've been slightly smaller:

.. math::

    110 \cdot 910 = 100100 > 100000 = 100 \cdot 1000 > 99990 = 110 \cdot 909.

.. test::

    import json
    import os
    import subprocess
    import sys
    import tempfile

    from starkware.cairo.docs.test_utils import reorganize_code
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.compiler.expression_simplifier import to_field_element
    from starkware.cairo.lang.vm.crypto import pedersen_hash

    PRIME = 2**251 + 17 * 2**192 + 1

    code = reorganize_code('\n\n'.join([
        codes['account'],
        codes['amm_state'],
        codes['modify_account'],
        codes['swap'],
        codes['transaction_loop'],
        codes['hash_account'],
        codes['hash_dict_values'],
        codes['compute_merkle_roots'],
        codes['get_transactions'],
        codes['amm_main'],
    ]))

    amm_filename = os.path.join(os.environ['DOCS_SOURCE_DIR'], 'hello_cairo/amm.cairo')
    demo_amm_filename = os.path.join(os.environ['DOCS_SOURCE_DIR'], '../../../demo/amm_demo/amm.cairo')
    # Uncomment below to fix the file:
    # open(amm_filename, 'w').write(code)
    assert open(amm_filename).read() == code, 'Please fix amm.cairo.'
    assert open(demo_amm_filename).read() == code, 'Please fix amm.cairo in demo directory.'
    program = compile_cairo(code, PRIME, debug_info=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Add env vars necessary for running both cairo-compile and cairo-run.
        env = {'PATH': os.environ["PATH"], 'RUNFILES_DIR': os.environ["RUNFILES_DIR"]}

        open(os.path.join(tmpdir, 'amm.cairo'), 'w').write(code)
        open(os.path.join(tmpdir, 'amm_input.json'), 'w').write(codes['amm_input'])
        output = subprocess.check_output(
            codes['amm_compile'], shell=True, cwd=tmpdir, env=env).decode('ascii')

    # Compute expected Merkle root before the batch.
    program_input = json.loads(codes['amm_input'])
    LOG_N_ACCOUNTS = program.get_const('LOG_N_ACCOUNTS')
    account_hashes = [0] * (2**LOG_N_ACCOUNTS)
    accounts = program_input['accounts']
    for account_id, account in accounts.items():
        public_key = int(account['public_key'], 16)
        account_hashes[int(account_id)] = pedersen_hash(
            pedersen_hash(public_key, account['token_a_balance']),
            account['token_b_balance'],
        )
    values = list(account_hashes)
    for i in range(LOG_N_ACCOUNTS):
        values = list(map(pedersen_hash, values[::2], values[1::2]))
    root_before = values[0]

    # Compute expected Merkle root after the batch.
    account_hashes[0] = pedersen_hash(
        pedersen_hash(public_key, accounts['0']['token_a_balance'] - 10),
        accounts['0']['token_b_balance'] + 75,
    )
    account_hashes[5] = pedersen_hash(
        pedersen_hash(public_key, accounts['5']['token_a_balance'] - 10),
        accounts['5']['token_b_balance'] + 90,
    )
    values = list(account_hashes)
    for i in range(LOG_N_ACCOUNTS):
        values = list(map(pedersen_hash, values[::2], values[1::2]))
    root_after = values[0]

    expected_output = 'Program output:\n' + '\n'.join(map(
        lambda x: f'  {to_field_element(x, prime=PRIME)}',
        [100, 1000, 120, 835, root_before, root_after],
    ))
    assert output.strip().endswith(expected_output)
    assert output.strip() == codes['amm_output'].strip()
