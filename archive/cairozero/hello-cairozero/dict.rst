The 15-puzzle - cont.
=====================

.. _dicts_in_cairo:

Dictionaries/maps in Cairo
--------------------------

The next thing we should check is that the numbers of the second list
(the values of the tiles being moved) are consistent with the first list.
To do this, we need to store and update the location of each tile.
This requires some kind of read-write memory, where we can track the location of
each tile and update it when tiles are moved.
But as Cairo's memory is immutable, we can't use it for that purpose.

Luckily, there is a library function called ``squash_dict`` which can assist us here.
It allows to simulate the behavior of a read-write dict/map in Cairo.

The standard-library file ``dict_access.cairo`` defines the following struct:

.. tested-code:: cairo dict_access

    struct DictAccess {
        key: felt,
        prev_value: felt,
        new_value: felt,
    }

The function ``squash_dict()``, which is defined in ``squash_dict.cairo``, gets a list of
``DictAccess`` and treats them as "read-modify-write" instructions on a dict.
It verifies that they make sense -- if we change the value at ``key=3`` to ``10``,
the next entry which refers to ``key=3`` must have ``prev_value=10``.
Finally, it returns the **squashed dict** -- which is a list of ``DictAccess``
entries where
(1) the squashed keys are sorted,
(2) each key appears once and
(3) the squashed ``prev_value`` refers to the ``prev_value`` in the **first** time
the key appeared and
similarly ``new_value`` refers to ``new_value`` in the **last** time it
appeared.

Let's take a look at an example. Suppose that we have the following list of
DictAccess entries:

=== ==== ===
Key Prev New
=== ==== ===
7   3    2
5   4    4
7   2    10
0   2    3
7   10   0
0   3    4
0   4    5
=== ==== ===

Note that when 7 appears the second time (the third entry), the previous value 2 matches the
new value in the first row, and the new value 10 matches the previous value in the next appearance
of 7 in the fifth row. If this was not the case, ``squash_dict`` would fail.

The squashed dict in this case will be:

=== ==== ===
Key Prev New
=== ==== ===
0   2    5
5   4    4
7   3    0
=== ==== ===

You can see that it summarizes what happened to each key (e.g., key 7 started from 3, changed to 2,
then to 10 and then to 0. Therefore in the squashed dict we see the values 3 and 0).

Preparing the list of DictAccess entries
----------------------------------------

Our keys will be the values on the tiles (the numbers between 1 and 15),
and our values will be the locations.
There is one problem: each location consists of two field elements
and each value in ``DictAccess`` is one field element.
There are two possible solutions:
(1) use a pointer to the location object,
(2) convert the two coordinates to one number using the formula ``4 * row + col``.
Here we chose to go with option (2).

.. tested-code:: cairo build_dict

    from starkware.cairo.common.dict_access import DictAccess
    from starkware.cairo.common.squash_dict import squash_dict

    func build_dict(
        loc_list: Location*,
        tile_list: felt*,
        n_steps,
        dict: DictAccess*,
    ) -> (dict: DictAccess*) {
        if (n_steps == 0) {
            // When there are no more steps, just return the dict
            // pointer.
            return (dict=dict);
        }

        // Set the key to the current tile being moved.
        assert dict.key = [tile_list];

        // Its previous location should be where the empty tile is
        // going to be.
        let next_loc: Location* = loc_list + Location.SIZE;
        assert dict.prev_value = 4 * next_loc.row + next_loc.col;

        // Its next location should be where the empty tile is
        // now.
        assert dict.new_value = 4 * loc_list.row + loc_list.col;

        // Call build_dict recursively.
        return build_dict(
            loc_list=next_loc,
            tile_list=tile_list + 1,
            n_steps=n_steps - 1,
            dict=dict + DictAccess.SIZE,
        );
    }

The function gets a pointer to the list of locations, a pointer to the list of tiles
(unlike the list of locations, this is a list of simple field elements, not structs),
the number of steps in the solution and a pointer called ``dict``.
The function writes its new dict entries starting from ``dict``, and returns the "updated"
``dict`` pointer -- the pointer to the next address to write if you want to add more entries
to the list. This way we can concatenate functions writing ``DictAccess`` lists.
This pattern, of getting a pointer, reading/writing entries from that pointer and returning
an updated pointer is very common in Cairo.

The line ``let next_loc: Location* = ...`` defines a :ref:`reference <references>` --
unlike tempvar/local, this does not allocate a memory cell. Instead, every time we
refer to ``next_loc`` it will be replaced by ``loc_list + Location.SIZE``.
Thus, the scope of the reference is simply the scope of its expression.

The line ``return build_dict(...)`` is a tail recursion call: a recursion which ends with returning
the values of the recursive call.

Exercise
********

How would you write the function without the ``return build_dict(...)`` syntax?

Note that you can use the Cairo tracer to debug your code if needed.
In addition, you may refer to :ref:`debugging_tricks`.

Final state
-----------

To make sure that the solution ends in the "solved" configuration,
we will append 15 entries to the list of ``DictAccess`` entries created
by ``build_dict()``. The first entry will be
``(key=1, prev_value=0, new_value=0)``. We mentioned above that a DictAccess represents
a read-modify-write operation.
As ``new_value=prev_value``, this entry is a simple read operation, used to guarantee
that at the end of ``build_dict()``, tile 1 is located at 0 (which is the top-left square).
Similarly, we will add
``(key=2, prev_value=1, new_value=1), ..., (key=15, prev_value=14, new_value=14)``.
It is slightly more efficient to write the loop backwards:

.. tested-code:: cairo finalize_state

    func finalize_state(dict: DictAccess*, idx) -> (
        dict: DictAccess*
    ) {
        if (idx == 0) {
            return (dict=dict);
        }

        assert dict.key = idx;
        assert dict.prev_value = idx - 1;
        assert dict.new_value = idx - 1;

        // Call finalize_state recursively.
        return finalize_state(
            dict=dict + DictAccess.SIZE, idx=idx - 1
        );
    }

Note that we keep using the pattern where the ``dict`` argument refers to the place
the function should start writing (it'll be the end of ``build_dict()``), and
the function returns the pointer to the end of the new written entries.

Initial state
-------------

We will handle the initial state differently -- we will simply go over the squashed dict
(applied on the results of both ``build_dict()`` and ``finalize_state()``) and
"print" to the program output the initial state.
This way, the verifier of the proof
will know the initial configuration which we solved.

.. tested-code:: cairo output_initial_values

    from starkware.cairo.common.serialize import serialize_word

    func output_initial_values{output_ptr: felt*}(
        squashed_dict: DictAccess*, n
    ) {
        if (n == 0) {
            return ();
        }

        serialize_word(squashed_dict.prev_value);

        // Call output_initial_values recursively.
        return output_initial_values(
            squashed_dict=squashed_dict + DictAccess.SIZE, n=n - 1
        );
    }

Note that we need the implicit argument ``output_ptr`` in order to call ``serialize_word()``.

Putting it all together
-----------------------

.. tested-code:: cairo check_solution

    from starkware.cairo.common.alloc import alloc

    func check_solution{output_ptr: felt*, range_check_ptr}(
        loc_list: Location*, tile_list: felt*, n_steps
    ) {
        alloc_locals;

        // Start by verifying that loc_list is valid.
        verify_location_list(loc_list=loc_list, n_steps=n_steps);

        // Allocate memory for the dict and the squashed dict.
        let (local dict_start: DictAccess*) = alloc();
        let (local squashed_dict: DictAccess*) = alloc();

        let (dict_end) = build_dict(
            loc_list=loc_list,
            tile_list=tile_list,
            n_steps=n_steps,
            dict=dict_start,
        );

        let (dict_end) = finalize_state(dict=dict_end, idx=15);

        let (squashed_dict_end: DictAccess*) = squash_dict(
            dict_accesses=dict_start,
            dict_accesses_end=dict_end,
            squashed_dict=squashed_dict,
        );

        // Verify that the squashed dict has exactly 15 entries.
        // This will guarantee that all the values in the tile list
        // are in the range 1-15.
        assert squashed_dict_end - squashed_dict = 15 *
            DictAccess.SIZE;

        output_initial_values(squashed_dict=squashed_dict, n=15);

        // Output the initial location of the empty tile.
        serialize_word(4 * loc_list.row + loc_list.col);

        // Output the number of steps.
        serialize_word(n_steps);

        return ();
    }

We have mentioned before that in order to perform comparison between two values
you need to use a Cairo builtin named "range-check".
We haven't used it ourselves, but the function ``squash_dict()`` requires it.
Due to the way builtins are implemented in the Cairo machine,
functions that need to use a builtin (and all the functions calling them)
require that a pointer to the builtin will be passed as an argument,
and that the updated pointer will be returned
(the same way we treat the dict pointers).
This happens automatically when we add the implicit argument ``range_check_ptr``.
Thus, ``check_solution()`` gets an implicit argument called ``range_check_ptr`` and
the Cairo compiler passes it to ``squash_dict()``.
``squash_dict()`` returns an updated pointer
and ``check_solution()`` returns the same value to its caller.
You can learn more about the range-check builtins and on builtins in general
:ref:`here <builtins>`.

This is a good time to mention the reference rebinding mechanism.
Up to the call to ``squash_dict()``, ``range_check_ptr`` referred to the argument of the function.
Since ``squash_dict()`` has an implicit argument named ``range_check_ptr``,
this function call **rebinds** the definition of the term ``range_check_ptr``
to the returned value from ``squash_dict``.
This allows chaining calls to functions without giving new names to the
variables
(in fact, we have also used reference rebinding for ``dict_end``).
You should note that while it looks like a variable name ``range_check_ptr`` is changing
its value, this is not the case -- Cairo is immutable.
Rather than the value changing, the meaning of ``range_check_ptr`` throughout the function changes.
You can learn more about reference rebinding :ref:`here <reference_rebinding>`.

Let's modify our previous dummy main to see the results of what we did so far
(note that you'll need to put the ``%builtin`` directive at the top of the file,
and use ``--layout=small`` to ``cairo-run`` due to the usage of builtins):

.. tested-code:: cairo dummy_main2

    %builtins output range_check

    from starkware.cairo.common.registers import get_fp_and_pc

    func main{output_ptr: felt*, range_check_ptr}() {
        alloc_locals;

        local loc_tuple: (
            Location, Location, Location, Location, Location
        ) = (
            Location(row=0, col=2),
            Location(row=1, col=2),
            Location(row=1, col=3),
            Location(row=2, col=3),
            Location(row=3, col=3),
        );

        local tiles: (felt, felt, felt, felt) = (3, 7, 8, 12);

        // Get the value of the frame pointer register (fp) so that
        // we can use the address of loc0.
        let (__fp__, _) = get_fp_and_pc();
        check_solution(
            loc_list=cast(&loc_tuple, Location*),
            tile_list=cast(&tiles, felt*),
            n_steps=4,
        );
        return ();
    }

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13

    code_main_lines = codes['dummy_main2'].splitlines()
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
    program = compile_cairo(code, PRIME, debug_info=True)

    runner = CairoRunner(program, layout='small')

    runner.initialize_segments()
    end = runner.initialize_main_entrypoint()
    runner.initialize_vm(hint_locals={})
    runner.run_until_pc(end)

    assert runner.vm_memory.get_range(runner.builtin_runners['output_builtin'].base, 17) == [
        0, 1, 6, 3, 4, 5, 7, 11, 8, 9, 10, 15, 12, 13, 14, 2, 4]
