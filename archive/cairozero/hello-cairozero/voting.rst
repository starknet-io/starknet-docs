.. _voting:

Voting system
=============

In this section we will write Cairo code for a small voting system.
This voting system can be used, for example, to run a secure (non-private) voting with a lot of
voters on a blockchain.
We will assume that each voter has a pair of private and public keys
(for the `ECDSA signature scheme <https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm>`_)
and that the list of voters' public keys is fixed.
Each voter may vote "Yes" (1) or "No" (0).
The system will **not** guarantee anonymity.

This section assumes some basic knowledge of cryptographic primitives such as hash functions,
digital signatures and Merkle trees.
In addition, if you haven't already read the previous parts of the "Hello, Cairo" tutorial, you
are encouraged to do so before reading this part.

Generating dummy data
---------------------

First, let's generate some dummy data for the voting.
To generate the key pairs and signature we will write a small Python script using
StarkWare's crypto library:

.. tested-code:: python voting_dummy_data_py

    import json

    from starkware.crypto.signature.signature import (
        pedersen_hash, private_to_stark_key, sign)

    # Set an identifier that will represent what we're voting for.
    # This will appear in the user's signature to distinguish
    # between different polls.
    POLL_ID = 10018

    # Generate key pairs.
    priv_keys = []
    pub_keys = []

    for i in range(10):
        priv_key = 123456 * i + 654321  # See "Safety note" below.
        priv_keys.append(priv_key)

        pub_key = private_to_stark_key(priv_key)
        pub_keys.append(pub_key)

    # Generate 3 votes of voters 3, 5, and 8.
    votes = []
    for (voter_id, vote) in [(3, 0), (5, 1), (8, 0)]:
        r, s = sign(
            msg_hash=pedersen_hash(POLL_ID, vote),
            priv_key=priv_keys[voter_id])
        votes.append({
            'voter_id': voter_id,
            'vote': vote,
            'r': hex(r),
            's': hex(s),
        })

    # Write the data (public keys and votes) to a JSON file.
    input_data = {
        'public_keys': list(map(hex, pub_keys)),
        'votes': votes,
    }

    with open('voting_input.json', 'w') as f:
        json.dump(input_data, f, indent=4)
        f.write('\n')

We use the Pedersen hash function and the ECDSA signature, which are natively supported in Cairo.
For technical details about those cryptographic primitives see
`STARK Curve <https://docs.starkware.co/starkex/stark-curve.html>`_ and
`Pedersen Hash Function <https://docs.starkware.co/starkex/pedersen-hash-function.html>`_.

**Safety note:**
In a real system, choosing the private keys must be done using a strong random mechanism.
The reason we didn't use random private keys for our dummy data is to get a deterministic
example, which is more convenient for a tutorial.

Here's what we get:

.. tested-code:: json voting_dummy_data_json

    {
        "public_keys": [
            "0x1c3eb6d67f833a9dac3766b2f22d31299875884f3fc84ebc70c322e8fb18112",
            "0x22285e2a1c84a7b6e283eb1ee28a40ba30874aff62617ba1220d7dc6a2b1e70",
            "0x2226376596c83aa0c5381b42b516bd84e604d7ff65647bab46feb7540a6544d",
            "0x492cf083fdc9d0c48bcc2807abd2a6da8550b872d047cd36e501a5e12cb581d",
            "0x1b16536d44330830c39b119673c7a065fe6592094d8506221053176c9500e54",
            "0x4cb42f213ed6dcfadb7b987fd31b2260334cbe404315708d17a2404fbadb11e",
            "0xb52947e334a58f8041373c44270c90c0bd28f345b0dac2af0886ec3cfab253",
            "0x23592b2754186e35f970c72eea16d46df2570bc68e6ee3069d8aa68d1a1707a",
            "0x529196a1456a35d3ee9138dd7355cb6416fe40deade3adab76f2e66554400ef",
            "0x2854a6d2c60e46b2f176659ccbffdddc3db9e2d1e74d3fa54f2fe252e571db0"
        ],
        "votes": [
            {
                "voter_id": 3,
                "vote": 0,
                "r": "0x315007dfbb13073cac204056c43fa51df0d56f88485c9563e86927f03c039bd",
                "s": "0x51ce6bb918720da62507bf093a6e29877fd77a0f979c0bdcd5684c8bdfefea4"
            },
            {
                "voter_id": 5,
                "vote": 1,
                "r": "0x5640e049062218fece9a6ab3f7871ff8dd7f8f7bc01d0e3b408f03d6477a1b6",
                "s": "0x70adf064b7e317fba19bac2d2677ad0448a4229d2340d5af1eb86a6252d6812"
            },
            {
                "voter_id": 8,
                "vote": 0,
                "r": "0x1749c30845cdf996ec03b79dd8262cf68e504143c93c94c8020d78c6f42b635",
                "s": "0x31a8bac54c17ac9c81dc036bcc761a3f78d7f43a8d42c468d774c1b2a9746c2"
            }
        ]
    }

.. test::

    import tempfile
    import os

    old_cwd = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)

            exec(codes['voting_dummy_data_py'])

            assert open('voting_input.json').read().strip() == \
                codes['voting_dummy_data_json'].strip()
    finally:
        os.chdir(old_cwd)

Processing the program input
----------------------------

Let's define a struct that will represent a single vote:

.. tested-code:: cairo vote_info

    struct VoteInfo {
        // The ID of the voter.
        voter_id: felt,
        // The voter's public key.
        pub_key: felt,
        // The vote (0 or 1).
        vote: felt,
        // The ECDSA signature (r and s).
        r: felt,
        s: felt,
    }

Now, let's write a function that returns an array of ``VoteInfo`` instances
based on the program input.
Note that since the entire function is basically just one hint, the validity of the returned data
(e.g., that the signatures are valid, the votes are restricted to 0 or 1, etc.)
**is not guaranteed**, so we must verify it later.

.. tested-code:: cairo get_claimed_votes

    from starkware.cairo.common.alloc import alloc

    // Returns a list of VoteInfo instances representing the claimed
    // votes.
    // The validity of the returned data is not guaranteed and must
    // be verified by the caller.
    func get_claimed_votes() -> (votes: VoteInfo*, n: felt) {
        alloc_locals;
        local n;
        let (votes: VoteInfo*) = alloc();
        %{
            ids.n = len(program_input['votes'])
            public_keys = [
                int(pub_key, 16)
                for pub_key in program_input['public_keys']]
            for i, vote in enumerate(program_input['votes']):
                # Get the address of the i-th vote.
                base_addr = \
                    ids.votes.address_ + ids.VoteInfo.SIZE * i
                memory[base_addr + ids.VoteInfo.voter_id] = \
                    vote['voter_id']
                memory[base_addr + ids.VoteInfo.pub_key] = \
                    public_keys[vote['voter_id']]
                memory[base_addr + ids.VoteInfo.vote] = \
                    vote['vote']
                memory[base_addr + ids.VoteInfo.r] = \
                    int(vote['r'], 16)
                memory[base_addr + ids.VoteInfo.s] = \
                    int(vote['s'], 16)
        %}
        return (votes=votes, n=n);
    }

Verifying that the votes are signed
-----------------------------------

One of the first functions we will need is ``verify_vote_signature()``, which
gets a pointer to a ``VoteInfo`` instance and verifies that the vote was indeed signed
by the voter's public key (note that we still haven't checked that the voter's public key
is one of the permitted public keys).

The function starts by calling ``hash2()`` to compute the message
hash. This is the counterpart of the line ``pedersen_hash(POLL_ID, vote)``
in the Python code above.

Then, we call ``verify_ecdsa_signature()`` to check that the signature is valid.
One subtlety is that ``verify_ecdsa_signature()`` gets the signature only as a hint for
the prover -- the fact that it completed successfully only implies that the prover knows
a signature for the given message and public key, not that the specific ``r`` and ``s``
constitute that signature. In our case, it's enough, as we don't care about
``r`` and ``s`` themselves, we just want to make sure the message was signed by the given
public key.

.. tested-code:: cairo verify_vote_signature

    from starkware.cairo.common.cairo_builtins import (
        HashBuiltin,
        SignatureBuiltin,
    )
    from starkware.cairo.common.hash import hash2
    from starkware.cairo.common.signature import (
        verify_ecdsa_signature,
    )

    // The identifier that represents what we're voting for.
    // This will appear in the user's signature to distinguish
    // between different polls.
    const POLL_ID = 10018;

    func verify_vote_signature{
        pedersen_ptr: HashBuiltin*, ecdsa_ptr: SignatureBuiltin*
    }(vote_info_ptr: VoteInfo*) {
        let (message) = hash2{hash_ptr=pedersen_ptr}(
            x=POLL_ID, y=vote_info_ptr.vote
        );

        verify_ecdsa_signature(
            message=message,
            public_key=vote_info_ptr.pub_key,
            signature_r=vote_info_ptr.r,
            signature_s=vote_info_ptr.s,
        );
        return ();
    }

The ``pedersen`` builtin, which is required in order to compute the Pedersen hash function,
is using an implicit argument called ``pedersen_ptr``.
On the other hand ``hash2()`` gets an implicit argument called ``hash_ptr``.
Therefore, we need to explicitly bind the ``hash_ptr`` implicit argument,
using ``hash2{hash_ptr=pedersen_ptr}(...)``.

Similarly, the implicit argument ``ecdsa_ptr`` is used by ``verify_ecdsa_signature``
(here the name of the implicit argument of ``verify_ecdsa_signature`` is also ``ecdsa_ptr``,
so we don't have to specify the binding explicitly).

.. _voting_merkle_tree:

Merkle tree
-----------

An important feature of our system will be that it will allow splitting the voting process
to *batches*, where each batch can be processed in a separate Cairo run
(this way we can support large and ongoing polls).
This means that we will need to pass information between each pair of consecutive runs:
which of the voters have already cast a vote
(or rather, who is still allowed to vote)
and what the results have been so far.

We will use a `Merkle tree <https://en.wikipedia.org/wiki/Merkle_tree>`_
to store the information about the public keys that are allowed to vote.
A Merkle tree is a cryptographic primitive that
allows "compressing" data of an arbitrary size to a very short value
(in our case, it can fit in one field element).
It works as follows: you take an array of values
(usually of size which is a power of 2, say :math:`2^k`)
and you compute the hashes of pairs of values so that you obtain :math:`2^k / 2 = 2^{k - 1}`
hashes. You repeat this step once more to obtain :math:`2^{k - 2}` hashes, and continue
for a total of :math:`k` steps, which results in one hash, called "the Merkle root".
The important property of Merkle trees is that given the Merkle root of an array of values,
it is not feasible to find a different array of the same size with the same Merkle root.
This way the Merkle root "encodes" all of the tree's data.

Our Merkle tree will contain
all the voters' public keys (padded with zeros) that haven't voted yet.
When someone votes, we replace their public key with 0 in the Merkle tree.
Thus we guarantee that no one can vote
more than once.

For simplicity we hard-code the maximal number of voters to :math:`2^{10} = 1024`:

.. tested-code:: cairo voting_constants

    const LOG_N_VOTERS = 10;

Each Cairo run will output 4 values: the number of "yes" and "no" votes and the Merkle root before
and after processing the votes of that batch
(note that each run handles one batch, which may include multiple votes).
It is up to the system using the Cairo proofs (e.g., a smart contract)
to make sure that the new root encoded in one proof
is the same as the old root encoded in the next proof,
and to add the partial results of the new batch to those accumulated thus far.

Processing the votes
--------------------

To track the changes to the Merkle tree, we will use a ``DictAccess`` array, which will encode
the changes to the leaves (changing actual public keys to zeros). Let's define a ``VotingState``
struct to keep track of the current 'yes' and 'no' counts and the ``DictAccess`` array.
If you need to recall how a ``DictAccess`` array works, see :ref:`dicts_in_cairo`.

.. tested-code:: cairo voting_state

    from starkware.cairo.common.dict import DictAccess

    struct VotingState {
        // The number of "Yes" votes.
        n_yes_votes: felt,
        // The number of "No" votes.
        n_no_votes: felt,
        // Start and end pointers to a DictAccess array with the
        // changes to the public key Merkle tree.
        public_key_tree_start: DictAccess*,
        public_key_tree_end: DictAccess*,
    }

Now, let's write a function that returns an initial state, with both the "yes" and "no"
counters set to zero, and an empty array for the tree's changes.
Note that we're using ``dict_new()`` to create the dict. ``dict_new()`` is one of the high-level
dictionary functions defined in ``dict.cairo``. These functions maintain the current values
of the dictionary using hints. Therefore, ``dict_new()`` expects to get a hint variable
called ``initial_dict`` with the initial values of the dictionary.

.. tested-code:: cairo init_voting_state

    from starkware.cairo.common.dict import dict_new

    func init_voting_state() -> (state: VotingState) {
        alloc_locals;
        local state: VotingState;
        assert state.n_yes_votes = 0;
        assert state.n_no_votes = 0;
        %{
            public_keys = [
                int(pub_key, 16)
                for pub_key in program_input['public_keys']]
            initial_dict = dict(enumerate(public_keys))
        %}
        let (dict: DictAccess*) = dict_new();
        assert state.public_key_tree_start = dict;
        assert state.public_key_tree_end = dict;
        return (state=state);
    }

The following function verifies that the vote is signed and removes the public key from the tree.
There are two options to handle the voting state:

1. Pass it as an argument and return the new state.
2. Add it as an implicit argument.

The two options have a different syntax, but they will be compiled to the same bytecode.
Here we chose the second option as it simplifies the code calling ``process_vote``.

.. tested-code:: cairo process_vote

    from starkware.cairo.common.dict import dict_update
    from starkware.cairo.common.math import assert_not_zero

    func process_vote{
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
        state: VotingState,
    }(vote_info_ptr: VoteInfo*) {
        alloc_locals;

        // Verify that pub_key != 0.
        assert_not_zero(vote_info_ptr.pub_key);

        // Verify the signature's validity.
        verify_vote_signature(vote_info_ptr=vote_info_ptr);

        // Update the public key dict.
        let public_key_tree_end = state.public_key_tree_end;
        dict_update{dict_ptr=public_key_tree_end}(
            key=vote_info_ptr.voter_id,
            prev_value=vote_info_ptr.pub_key,
            new_value=0,
        );

        // Generate the new state.
        local new_state: VotingState;
        assert new_state.public_key_tree_start = (
            state.public_key_tree_start
        );
        assert new_state.public_key_tree_end = public_key_tree_end;

        // Update the counters.
        tempvar vote = vote_info_ptr.vote;
        if (vote == 0) {
            // Vote "No".
            assert new_state.n_yes_votes = state.n_yes_votes;
            assert new_state.n_no_votes = state.n_no_votes + 1;
        } else {
            // Make sure that in this case vote=1.
            assert vote = 1;

            // Vote "Yes".
            assert new_state.n_yes_votes = state.n_yes_votes + 1;
            assert new_state.n_no_votes = state.n_no_votes;
        }

        // Update the state.
        let state = new_state;
        return ();
    }

Finally, let's write the loop that processes all the votes. It gets a pointer to an array
of ``VoteInfo`` instances and its size and updates the given state accordingly.

.. tested-code:: cairo process_votes

    func process_votes{
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
        state: VotingState,
    }(votes: VoteInfo*, n_votes: felt) {
        if (n_votes == 0) {
            return ();
        }

        process_vote(vote_info_ptr=votes);

        process_votes(
            votes=votes + VoteInfo.SIZE, n_votes=n_votes - 1
        );
        return ();
    }

.. _voting_main:

The main() function
-------------------

As explained above, the program will output 4 values that summarize the batch:
the number of "yes" and "no" votes and the Merkle root before and after processing
the votes of that batch. The following struct represents that information:

.. tested-code:: cairo batch_output

    struct BatchOutput {
        n_yes_votes: felt,
        n_no_votes: felt,
        public_keys_root_before: felt,
        public_keys_root_after: felt,
    }

The only missing part is the computation of the two Merkle roots, based on the
public key dictionary (``VotingState.public_key_tree_start`` and
``VotingState.public_key_tree_end``). In order to do this, we first squash the dict
and then call the standard library function ``small_merkle_tree_update()``
(a requirement of ``small_merkle_tree_update()`` is that we use the high-level function
``dict_squash()`` rather than ``squash_dict()``. ``dict_squash()`` passes hint information about
all of the dict entries to the squashed dict, including entries that haven't changed.

.. tested-code:: cairo voting_main

    %builtins output pedersen range_check ecdsa

    from starkware.cairo.common.dict import dict_squash
    from starkware.cairo.common.small_merkle_tree import (
        small_merkle_tree_update,
    )

    func main{
        output_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr,
        ecdsa_ptr: SignatureBuiltin*,
    }() {
        alloc_locals;

        let output = cast(output_ptr, BatchOutput*);
        let output_ptr = output_ptr + BatchOutput.SIZE;

        let (votes, n_votes) = get_claimed_votes();
        let (state) = init_voting_state();
        process_votes{state=state}(votes=votes, n_votes=n_votes);
        local pedersen_ptr: HashBuiltin* = pedersen_ptr;
        local ecdsa_ptr: SignatureBuiltin* = ecdsa_ptr;

        // Write the "yes" and "no" counts to the output.
        assert output.n_yes_votes = state.n_yes_votes;
        assert output.n_no_votes = state.n_no_votes;

        // Squash the dict.
        let (squashed_dict_start, squashed_dict_end) = dict_squash(
            dict_accesses_start=state.public_key_tree_start,
            dict_accesses_end=state.public_key_tree_end,
        );
        local range_check_ptr = range_check_ptr;

        // Compute the two Merkle roots.
        let (root_before, root_after) = small_merkle_tree_update{
            hash_ptr=pedersen_ptr
        }(
            squashed_dict_start=squashed_dict_start,
            squashed_dict_end=squashed_dict_end,
            height=LOG_N_VOTERS,
        );

        // Write the Merkle roots to the output.
        assert output.public_keys_root_before = root_before;
        assert output.public_keys_root_after = root_after;

        return ();
    }

Note that we write ``{state=state}`` explicitly when we call ``process_votes``. This is
required since the compiler does not allow implicit bindings where the bound variable
is not an implicit argument of the calling function. See more information
:ref:`here <calling_with_implicit_arguments>`.

One new feature we used here is the ``cast`` keyword.
The ``cast`` keyword in ``let output = cast(output_ptr, BatchOutput*);``
converts the ``felt`` pointer to a
pointer to ``BatchOutput``, so the type of the ``output`` reference is ``BatchOutput*``.
Now we can write
``output.n_yes_votes`` to access the first output cell, which encodes the number of "yes" votes.

Don't forget to supply the program input file when you run the code
(you can find the full Cairo file `here <../_static/voting.cairo>`_):

.. tested-code:: bash voting_compile

    cairo-compile voting.cairo --output voting_compiled.json

    cairo-run --program=voting_compiled.json \
        --print_output --layout=small \
        --program_input=voting_input.json

You should get:

.. tested-code:: none voting_output

    Program output:
      1
      2
      1591806306193441240739433996824056703232153712683022312894504906643112470393
      -1397522753299492751557547967820826962898231398543673030347416450104778351221

Another batch
-------------

Our Cairo code supports voting in batches, so let's try that.
Let's say that we want to run another batch after the one we just did.
Modify ``voting_input.json`` so that the public keys of the voters who voted in the first batch
are 0 and the ``votes`` section contains one new vote instead of the old three.
You can use the following Python script:

.. tested-code:: python voting_dummy_data_py2

    import json

    from starkware.crypto.signature.signature import pedersen_hash, sign

    POLL_ID = 10018

    input_data = json.load(open('voting_input.json'))
    input_data['public_keys'][3] = '0x0'
    input_data['public_keys'][5] = '0x0'
    input_data['public_keys'][8] = '0x0'

    # Generate a "yes" vote for voter 6.
    voter_id = 6
    priv_key = 123456 * voter_id + 654321
    vote = 1
    r, s = sign(
        msg_hash=pedersen_hash(POLL_ID, vote),
        priv_key=priv_key,
    )
    input_data['votes'] = [{
        'voter_id': voter_id,
        'vote': vote,
        'r': hex(r),
        's': hex(s),
    }]

    with open('voting_input2.json', 'w') as f:
        json.dump(input_data, f, indent=4)
        f.write('\n')

Run the same program again (you don't need to recompile) with ``voting_input2.json``.
You should get:

.. tested-code:: none voting_output2

    Program output:
      1
      0
      -1397522753299492751557547967820826962898231398543673030347416450104778351221
      -628706650786693403852552424323387050556189030546827265857028820447499605255

Note that indeed, the root of the Merkle tree before the second batch is the same as
the root after the first one.

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
        codes['vote_info'],
        codes['get_claimed_votes'],
        codes['verify_vote_signature'],
        codes['voting_constants'],
        codes['voting_state'],
        codes['init_voting_state'],
        codes['process_vote'],
        codes['process_votes'],
        codes['batch_output'],
        codes['voting_main']
    ]))

    voting_filename = os.path.join(os.environ['DOCS_SOURCE_DIR'], 'hello_cairo/voting.cairo')
    # Uncomment below to fix the file:
    # open(voting_filename, 'w').write(code)
    assert open(voting_filename).read() == code, 'Please fix voting.cairo.'
    program = compile_cairo(code, PRIME, debug_info=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Add env vars necessary for running both cairo-compile and cairo-run.
        env = {'PATH': os.environ["PATH"], 'RUNFILES_DIR': os.environ["RUNFILES_DIR"]}

        open(os.path.join(tmpdir, 'voting.cairo'), 'w').write(code)
        open(os.path.join(tmpdir, 'voting_input.json'), 'w').write(codes['voting_dummy_data_json'])
        output = subprocess.check_output(
            codes['voting_compile'], shell=True, cwd=tmpdir, env=env).decode('ascii')

        old_cwd = os.getcwd()
        try:
            os.chdir(tmpdir)
            exec(codes['voting_dummy_data_py2'])
            program_input2 = json.load(open('voting_input2.json'))
        finally:
            os.chdir(old_cwd)
        output2 = subprocess.check_output(
            codes['voting_compile'].replace('voting_input.json', 'voting_input2.json'),
            shell=True, cwd=tmpdir, env=env).decode('ascii')

    # Compute expected Merkle root before voting.
    program_input = json.loads(codes['voting_dummy_data_json'])
    LOG_N_VOTERS = program.get_const('LOG_N_VOTERS')
    public_keys = [int(public_key, 16) for public_key in program_input['public_keys']]
    public_keys += [0] * (2**LOG_N_VOTERS - len(public_keys))
    values = public_keys
    for i in range(LOG_N_VOTERS):
        values = list(map(pedersen_hash, values[::2], values[1::2]))
    root_before = values[0]

    # Compute expected Merkle root after the first batch.
    values = list(public_keys)
    for vote in program_input['votes']:
        values[vote['voter_id']] = 0
    for i in range(LOG_N_VOTERS):
        values = list(map(pedersen_hash, values[::2], values[1::2]))
    root_after = values[0]

    # Compute expected Merkle root after the second batch.
    values = list(public_keys)
    for vote in program_input['votes'] + program_input2['votes']:
        values[vote['voter_id']] = 0
    for i in range(LOG_N_VOTERS):
        values = list(map(pedersen_hash, values[::2], values[1::2]))
    root_after2 = values[0]

    expected_output = 'Program output:\n' + '\n'.join(map(
        lambda x: f'  {to_field_element(x, prime=PRIME)}', [1, 2, root_before, root_after]))
    assert output.strip() == expected_output
    assert output.strip() == codes['voting_output'].strip()

    expected_output2 = 'Program output:\n' + '\n'.join(map(
        lambda x: f'  {to_field_element(x, prime=PRIME)}', [1, 0, root_after, root_after2]))
    assert output2.strip() == expected_output2
    assert output2.strip() == codes['voting_output2'].strip()
