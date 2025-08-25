Program input and hints
=======================

So far programming in Cairo was very similar to programming in conventional programming languages.
In this section we will see one of the main differences:
The Cairo proof system is used to prove that a certain program runs successfully.
Thus, unlike conventional programming languages where you have only one party that runs the program,
here you have two parties -- the prover and the verifier. The **prover** tries to prove
that a certain computation was performed, and the **verifier** wants to verify the correctness
of the proof.
For example, the prover may have an input that it will not share with the verifier
(such as the solution to the 15-puzzle). Thus we need a way to instruct the prover how to
process this additional data.

In order to finish our 15-puzzle program, we need to get rid of the hard-coded solution.
Instead, the solution we're verifying will be given as the program input.
We will explain what that means right after we discuss one of its building blocks -- the hints.

Hints
-----
A hint is a piece of Python code,
which contains instructions that only the prover sees and executes. From the point of
view of the verifier these hints do not exist.

Consider the following functions:

.. tested-code:: cairo hl_hints

    func foo() -> (res: felt) {
        alloc_locals;
        local x = 5;  // Note this line.
        assert x * x = 25;
        return (res=x);
    }

    func bar() -> (res: felt) {
        alloc_locals;
        local x;
        %{ ids.x = 5 %}  // Note this line.
        assert x * x = 25;
        return (res=x);
    }

.. test::

    import json
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13

    code = codes['hl_hints']
    program = compile_cairo(code, PRIME, debug_info=True)

    for func_name in ['foo', 'bar']:
        runner = CairoRunner(program, layout='small')

        runner.initialize_segments()
        end = runner.initialize_function_entrypoint(func_name, [])
        runner.initialize_vm(hint_locals={})
        runner.run_until_pc(end)

        assert runner.vm_memory[runner.vm.run_context.ap - 1] == 5

The line ``%{ ids.x = 5 %}`` is a hint. It instructs the prover to assign the value ``5`` to
the variable ``x``. We discuss the ``ids`` variable in more detail :ref:`below <hl_ids>`.

From the point of view of the **prover**, both functions return 5.
From the point of view of the **verifier**, ``foo`` returns 5 as well,
but the hint in ``bar`` is ignored and thus ``bar`` looks to the verifier as follows:

.. tested-code:: cairo hl_hints2

    func bar() -> (res: felt) {
        alloc_locals;
        local x;
        assert x * x = 25;
        return (res=x);
    }

This may look weird at a first glance, since x is uninitialized and then we assert that
``x * x = 25`` and returned the uninitialized value. But in Cairo when you have an
uninitialized value, it simply means that the prover decides on its value (due to immutability,
the value of ``x`` cannot change during the run).
Let's analyze the code of ``bar()`` from the point of view of the verifier
(so we must ignore the hint).
Let's say that the prover chooses to initialize ``x`` with ``0``.
As ``0 * 0 != 25``, the entire run will fail, and the prover will not be able to generate a
proof. So the prover must choose a value that satisfies ``x * x = 25``.
There are two possibilities: ``x = 5`` and ``x = -5``.
This means that when ``bar()`` is called the verifier knows it returns either 5 or -5,
but it doesn't know which of them.

This explains why we need the hint -- the prover has to know which value to return,
it can't guess it.

You can learn more about hints :ref:`here <hints>`.

Program input
-------------

The way program input is handled is facilitated by hints --
the prover has to know which input to process, but the verifier doesn't care
(the verifier cares only about the initial state and that the solution is valid).

Let's take a look at the final ``main()`` function:

.. tested-code:: cairo 15_puzzle_main

    %builtins output range_check

    func main{output_ptr: felt*, range_check_ptr}() {
        alloc_locals;

        // Declare two variables that will point to the two lists and
        // another variable that will contain the number of steps.
        local loc_list: Location*;
        local tile_list: felt*;
        local n_steps;

        %{
            # The verifier doesn't care where those lists are
            # allocated or what values they contain, so we use a hint
            # to populate them.
            locations = program_input['loc_list']
            tiles = program_input['tile_list']

            ids.loc_list = loc_list = segments.add()
            for i, val in enumerate(locations):
                memory[loc_list + i] = val

            ids.tile_list = tile_list = segments.add()
            for i, val in enumerate(tiles):
                memory[tile_list + i] = val

            ids.n_steps = len(tiles)

            # Sanity check (only the prover runs this check).
            assert len(locations) == 2 * (len(tiles) + 1)
        %}

        check_solution(
            loc_list=loc_list, tile_list=tile_list, n_steps=n_steps
        );
        return ();
    }

Running the program
-------------------

In order to run the program, create a json file named ``puzzle_input.json``
with the solution to be verified:

.. tested-code:: json 15_puzzle_input

    {
        "loc_list": [0, 2, 1, 2, 1, 3, 2, 3, 3, 3],
        "tile_list": [3, 7, 8, 12]
    }

Compile and run using:

.. tested-code:: bash 15_puzzle_compile

    cairo-compile puzzle.cairo --output puzzle_compiled.json

    cairo-run --program=puzzle_compiled.json \
        --print_output --layout=small \
        --program_input=puzzle_input.json

.. test::

    import os
    import subprocess
    import sys
    import tempfile

    PRIME = 2**64 + 13

    code_main_lines = codes['15_puzzle_main'].splitlines()
    code = '\n'.join([
        code_main_lines[0],
        codes['location'],
        codes['verify_valid_location'],
        codes['verify_adjacent_locations'],
        codes['verify_location_list'],
        codes['build_dict'],
        codes['finalize_state'],
        codes['output_initial_values'],
        codes['check_solution'],
    ] + code_main_lines[1:])

    with tempfile.TemporaryDirectory() as tmpdir:
        # Add env vars necessary for running both cairo-compile and cairo-run.
        env = {'PATH': os.environ["PATH"], 'RUNFILES_DIR': os.environ["RUNFILES_DIR"]}

        open(os.path.join(tmpdir, 'puzzle.cairo'), 'w').write(code)
        open(os.path.join(tmpdir, 'puzzle_input.json'), 'w').write(codes['15_puzzle_input'])
        output = subprocess.check_output(
            codes['15_puzzle_compile'], shell=True, cwd=tmpdir, env=env).decode('ascii')
        expected_output = 'Program output:\n' + '\n'.join(map(lambda i: f'  {i}', [
            0, 1, 6, 3, 4, 5, 7, 11, 8, 9, 10, 15, 12, 13, 14, 2, 4]))
        assert output.strip() == expected_output


Taking advantage of nondeterminism
-----------------------------------

Say that you have a list of ``N`` pairs ``(key, value)`` and you want a function ``get_value_by_key``
that returns the ``value`` that's associated with a certain ``key``.
You may assume that the keys are distinct.
Take a moment to think how to write such a function.

The naive solution takes ``O(N)`` Cairo instructions. It turns out that using nondeterminism
it can be done with a constant number of instructions!
All we have to do is find the right index using a hint.
Then, we check that we got the correct key, and that the index is in range:

.. tested-code:: cairo get_value_by_key

    from starkware.cairo.common.math import assert_nn_le

    struct KeyValue {
        key: felt,
        value: felt,
    }

    // Returns the value associated with the given key.
    func get_value_by_key{range_check_ptr}(
        list: KeyValue*, size, key
    ) -> (value: felt) {
        alloc_locals;
        local idx;
        %{
            # Populate idx using a hint.
            ENTRY_SIZE = ids.KeyValue.SIZE
            KEY_OFFSET = ids.KeyValue.key
            VALUE_OFFSET = ids.KeyValue.value
            for i in range(ids.size):
                addr = ids.list.address_ + ENTRY_SIZE * i + \
                    KEY_OFFSET
                if memory[addr] == ids.key:
                    ids.idx = i
                    break
            else:
                raise Exception(
                    f'Key {ids.key} was not found in the list.')
        %}

        // Verify that we have the correct key.
        let item: KeyValue = list[idx];
        assert item.key = key;

        // Verify that the index is in range (0 <= idx <= size - 1).
        assert_nn_le(a=idx, b=size - 1);

        // Return the corresponding value.
        return (value=item.value);
    }

Array index access
******************

The ``get_value_by_key()`` function gets a pointer to the beginning of an array,
the array size, and a key value. It looks for this key
and then returns the value that corresponds to this key.
To access the element at index ``idx`` (where the index is zero-based),
one may write ``list[idx]``. This is an expression of type ``KeyValue``,
which is equivalent to ``[list + KeyValue.SIZE * idx]``.
Similarly, you can write ``list[idx].key`` for the ``key`` member of that element.

.. _hl_ids:

The ``ids`` variable
********************

The ``ids`` variable is the way hints communicate with Cairo objects.
We already saw that ``ids`` can be used to set local variables. Now we see that it
can be used to get the values of constants and the offsets of members.
For example, ``ids.KeyValue.SIZE`` is 2 and ``ids.KeyValue.key`` is 0 (as ``key`` is the first
member of the struct).
Note that due to technical constraints, when we want the address stored in a variable
of type ``T*`` (for example, ``list``) we need to add ``.address_``.
This enables us to write things like ``ids.list.key`` which will be the first field of the
``KeyValue`` struct.

Reviewing ``get_value_by_key()``
********************************

Let's make a quick review of the code:
We start by defining a local variable ``idx`` which we leave unassigned for now.
Then we have a hint that looks for the entry with the requested key
and assigns the index to ``idx``.
The hint itself does take ``O(N)`` operations, but this is not part of the Cairo code --
remember, a hint is just the instructions for the prover on how to resolve
nondeterminism. In practice, the operations of a hint are much cheaper (and in most cases
negligible) with respect to Cairo instructions.

The next thing is a Cairo statement verifying that we got the correct key.
Why do we need that line, where this is already guaranteed by the hint?
(Note that the hint will never choose an index that doesn't match the key.)

To answer this question, let's analyze the program from the point of view of the verifier.
As the hints are only seen by the prover,
the way the verifier sees the program is as follows:

.. tested-code:: cairo get_value_by_key_no_hints

    from starkware.cairo.common.math import assert_nn_le

    struct KeyValue {
        key: felt,
        value: felt,
    }

    // Returns the value associated with the given key.
    func get_value_by_key{range_check_ptr}(
        list: KeyValue*, size, key
    ) -> (value: felt) {
        alloc_locals;
        local idx;

        // Verify that we have the correct key.
        let item: KeyValue = list[idx];
        assert item.key = key;

        // Verify that the index is in range (0 <= idx <= size - 1).
        assert_nn_le(a=idx, b=size - 1);

        // Return the corresponding value.
        return (value=item.value);
    }

One takes an uninitialized number ``idx``
(we will use the terms "guess" and "nondeterministic" interchangeably with "uninitialized")
which they know nothing about,
then they check that this index corresponds to the key and within range.
Without either of these checks, it is clear that the prover will be able to cheat --
all it has to do is to replace the hint with a wrong one (e.g., ``%{ ids.idx = 2 %}``).

The correctness of code from the point of view of the verifier is called "soundness",
and if it holds the code is said to be sound. When you analyze the soundness of the code
you must **ignore all the hints**.

The other direction -- that indeed the hint will find the right index is called "completeness"
(and of course when checking for "completeness" you do take into account the hints).

A good Cairo code must be both sound and complete.
Soundness is the condition people aren't accustomed to verify,
but in most aspects it's the important one :)

.. test::

    import re

    from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13

    program = compile_cairo(codes['get_value_by_key'], PRIME, debug_info=True)
    runner = CairoFunctionRunner(program, layout='small')
    rc_builtin = runner.range_check_builtin
    runner.run('get_value_by_key', rc_builtin.base, [7, 1, 4, 5, 10, 20, 8, 3], 4, 10)
    range_check_ptr, val = runner.get_return_values(2)
    assert val == 20

    # Verify that get_value_by_key_no_hints is consistent with get_value_by_key.
    hints_removed = re.sub(
        r'\s*%\{.*?%\}\s*', '\n\n    ', codes['get_value_by_key'], flags=re.DOTALL)
    assert hints_removed == codes['get_value_by_key_no_hints']

Exercise
********

Write the function ``sum_by_key`` which
gets a list of key-value pairs, and returns a list of key-value pairs,
where each key in the returned list appears once, and its value is the sum of the values
that correspond to the same key in the input list.
For example given the list ``(3, 5), (1, 10), (3, 1), (3, 8), (1, 20)``
the function should return ``(1, 30), (3, 14)`` (the order of the keys is not important).

Hint: build a list of ``DictAccess`` entries where you have an entry for each key-value pair.
For the pair ``(key, value)``, you will have an entry on the same key with
``new_value = prev_value + value``.

Use hints to track the cumulative sums.

After you've built the Cairo dict entries, call ``squash_dict``.
Check that each entry in the squashed dict has ``prev_value = 0``,
and write ``key`` and ``new_value`` to the output array.

Here is a template for your code:

.. tested-code:: cairo sum_by_key_template

    // Builds a DictAccess list for the computation of the cumulative
    // sum for each key.
    func build_dict(list: KeyValue*, size, dict: DictAccess*) -> (
        dict: felt
    ) {
        if (size == 0) {
            return (dict=dict);
        }

        %{
            # Populate ids.dict.prev_value using cumulative_sums...
            # Add list.value to cumulative_sums[list.key]...
        %}
        // Copy list.key to dict.key...
        // Verify that dict.new_value = dict.prev_value + list.value...
        // Call recursively to build_dict()...
    }

    // Verifies that the initial values were 0, and writes the final
    // values to result.
    func verify_and_output_squashed_dict(
        squashed_dict: DictAccess*,
        squashed_dict_end: DictAccess*,
        result: KeyValue*,
    ) -> (result: felt) {
        tempvar diff = squashed_dict_end - squashed_dict;
        if (diff == 0) {
            return (result=result);
        }

        // Verify prev_value is 0...
        // Copy key to result.key...
        // Copy new_value to result.value...
        // Call recursively to verify_and_output_squashed_dict...
    }

    // Given a list of KeyValue, sums the values, grouped by key,
    // and returns a list of pairs (key, sum_of_values).
    func sum_by_key{range_check_ptr}(list: KeyValue*, size) -> (
        result: felt, result_size: felt
    ) {
        %{
            # Initialize cumulative_sums with an empty dictionary.
            # This variable will be used by ``build_dict`` to hold
            # the current sum for each key.
            cumulative_sums = {}
        %}
        // Allocate memory for dict, squashed_dict and res...
        // Call build_dict()...
        // Call squash_dict()...
        // Call verify_and_output_squashed_dict()...
    }

