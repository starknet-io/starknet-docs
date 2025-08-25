.. _builtins:

Builtins and implicit arguments
===============================

Introduction
------------

Builtins are predefined optimized low-level execution units which are added to the Cairo CPU board
to perform predefined computations
which are expensive to perform in vanilla Cairo (e.g., range-checks, Pedersen hash, ECDSA, ...).

The communication between the CPU and the builtins is done through memory:
each builtin is assigned a continuous area in the memory and applies some constraints
(depending on the builtin definition) on the memory cells in that area.
For example, the Pedersen builtin will enforce that:

.. code-block:: none

    [p + 2] = hash([p + 0], [p + 1])
    [p + 5] = hash([p + 3], [p + 4])
    [p + 8] = hash([p + 6], [p + 7])
    ...

Cairo code may read/write from those memory cells to "invoke" the builtin.
The following code verifies that ``hash(x, y) == z``:

.. tested-code:: cairo invoke_builtin

    // Write the value of x to [p + 0].
    x = [p];
    // Write the value of y to [p + 1].
    y = [p + 1];
    // The builtin enforces that [p + 2] == hash([p + 0], [p + 1]).
    z = [p + 2];

Once we use the addresses ``[p + 0]``, ``[p + 1]``, ``[p + 2]`` in order to compute the first hash
we cannot use them again to compute a different hash (since Cairo memory is immutable). Instead,
we should use ``[p + 3]``, ``[p + 4]``, ``[p + 5]``, and so on.
This means that we have to keep track of a pointer to the next unused builtin instance.
The convention is that functions which use the builtin should get that pointer as an argument
and return an updated pointer to the next unused instance.
A more complete version of the example above would look like this:

.. tested-code:: cairo hash2_0

    func hash2(hash_ptr: felt*, x, y) -> (hash_ptr: felt*, z: felt) {
        // Invoke the hash function.
        x = [hash_ptr];
        y = [hash_ptr + 1];
        // Return the updated pointer (increased by 3 memory cells)
        // and the result of the hash.
        return (hash_ptr=hash_ptr + 3, z=[hash_ptr + 2]);
    }

We can use :ref:`typed_references` with the type ``HashBuiltin`` from
``starkware.cairo.common.cairo_builtins`` as follows:

.. tested-code:: cairo hash2_1

    from starkware.cairo.common.cairo_builtins import HashBuiltin

    func hash2(hash_ptr: HashBuiltin*, x, y) -> (
        hash_ptr: HashBuiltin*, z: felt
    ) {
        let hash = hash_ptr;
        // Invoke the hash function.
        hash.x = x;
        hash.y = y;
        // Return the updated pointer (increased by 3 memory cells)
        // and the result of the hash.
        return (hash_ptr=hash_ptr + HashBuiltin.SIZE, z=hash.result);
    }

.. _implicit_arguments:

Implicit arguments
------------------

If a function ``foo()`` calls ``hash2()``, ``foo()`` must also get and return the
builtin pointer (``hash_ptr``) and so does every function calling ``foo()``.
Since this pattern is so common, Cairo has syntactic sugar for it, called "Implicit arguments".
Take a look at the following implementation of ``hash2``
(note the function declaration in particular):

.. tested-code:: cairo hash2_2

    from starkware.cairo.common.cairo_builtins import HashBuiltin

    func hash2{hash_ptr: HashBuiltin*}(x, y) -> (z: felt) {
        // Create a copy of the reference and advance hash_ptr.
        let hash = hash_ptr;
        let hash_ptr = hash_ptr + HashBuiltin.SIZE;
        // Invoke the hash function.
        hash.x = x;
        hash.y = y;
        // Return the result of the hash.
        // The updated pointer is returned automatically.
        return (z=hash.result);
    }

The curly braces declare ``hash_ptr`` as an *implicit argument*. This automatically adds
an argument **and** a return value to the function.
If you're using the high-level ``return`` statement, you don't have to explicitly return
``hash_ptr``. The Cairo compiler just returns the current binding of the ``hash_ptr``
reference. Since ``hash2`` has to return the pointer to the next available instance,
we added the :ref:`reference rebinding <reference_rebinding>`:
``let hash_ptr = hash_ptr + HashBuiltin.SIZE;``.
Note that its only effect is on the return statement (implicitly).

.. _calling_with_implicit_arguments:

Calling a function that gets implicit arguments
-----------------------------------------------

Cairo's standard library includes ``hash2`` in the module ``starkware.cairo.common.hash``.
You can call ``hash2()`` in a few ways:

1.  Explicitly, using ``{x=y}``, where ``x`` is the name of the implicit argument and ``y`` is the
    name of the reference to bind to it. We use the word "bind" since ``y`` is not merely passed to
    ``foo`` -- after the call, ``y`` will be rebound to the value returned by ``foo``
    for the implicit argument ``x``.

    .. tested-code:: cairo call_hash2_0

        from starkware.cairo.common.cairo_builtins import HashBuiltin
        from starkware.cairo.common.hash import hash2

        func foo{hash_ptr0: HashBuiltin*}() -> (z: felt) {
            let (z) = hash2{hash_ptr=hash_ptr0}(1, 2);
            // The previous statement rebinds the value of hash_ptr0.
            // If hash_ptr0 were used here, it would've referred to
            // the updated value, rather than foo's argument.
            return (z=z);
        }

    Note that you must use named arguments with implicit arguments.

2.  Implicitly, if the calling function also has an **implicit** argument named ``hash_ptr``:

    .. tested-code:: cairo call_hash2_1

        from starkware.cairo.common.cairo_builtins import HashBuiltin
        from starkware.cairo.common.hash import hash2

        func foo{hash_ptr: HashBuiltin*}() -> (z: felt) {
            let (z) = hash2(1, 2);
            // The previous statement rebinds the value of hash_ptr.
            // If hash_ptr were used here, it would've referred to
            // the updated value, rather than foo's argument.
            return (z=z);
        }

    Trying to use ``hash2(1, 2)`` if there's is no reference named ``hash_ptr``,
    or this reference is not an implicit argument (or marked using a ``with`` statement as you'll see
    below) will fail.

3.  Implicitly, inside a ``with`` statement on a reference named ``hash_ptr``:

    .. tested-code:: cairo call_hash2_2

        from starkware.cairo.common.cairo_builtins import HashBuiltin
        from starkware.cairo.common.hash import hash2

        func foo(hash_ptr: HashBuiltin*) -> (
            hash_ptr: HashBuiltin*, z: felt
        ) {
            // Use a with-statement, since 'hash_ptr' is not an
            // implicit argument.
            with hash_ptr {
                let (z) = hash2(1, 2);
            }
            return (hash_ptr=hash_ptr, z=z);
        }

    The purpose of the ``with`` statement is to make the code more readable:
    The call to ``hash2`` **changes** (rebinds) the reference ``hash_ptr``, even though
    ``hash_ptr`` is not mentioned in that line. While it is extremely convenient
    to program this way, it makes it difficult to understand which function call changes what
    variable.
    Therefore, the only references that may be implicitly changed are implicit arguments and
    references mentioned in a ``with`` statement.

Using the implicit argument mechanism, and helper functions, such as ``hash2``,
you don't have to worry about the builtin pointer -- all you have to do is add ``hash_ptr``
as an implicit argument and then you can call ``hash2`` without explicitly passing
the pointer.

.. test::
    import os

    from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    for name, idx in [
            ('hash2', 0), ('hash2', 1), ('hash2', 2),
            ('call_hash2', 0), ('call_hash2', 1), ('call_hash2', 2)]:
        code = '%builtins pedersen\n' + codes[f'{name}_{idx}']
        program = compile_cairo(code, DEFAULT_PRIME)

        runner = CairoRunner(program, layout='small')
        runner.initialize_segments()
        pedersen_base = runner.builtin_runners['pedersen_builtin'].base
        if name == 'hash2':
            func_name = 'hash2'
            args = [pedersen_base, 1, 2]
        else:
            func_name = 'foo'
            args = [pedersen_base]

        end = runner.initialize_function_entrypoint(func_name, args)
        runner.initialize_vm(hint_locals={})
        runner.run_until_pc(end)

        ap = runner.vm.run_context.ap
        assert runner.vm_memory[ap - 2] == pedersen_base + 3
        assert runner.vm_memory[ap - 1] == \
            2592987851775965742543459319508348457290966253241455514226127639100457844774

.. _revoked_implicit_arguments:

Revoked implicit arguments
--------------------------

Try to compile the following code:

.. tested-code:: cairo revoked_imp_args

    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    func foo(n) {
        if (n == 0) {
            return ();
        }
        foo(n=n - 1);
        return ();
    }

    func bar{hash_ptr: HashBuiltin*}() {
        hash2(1, 2);
        foo(3);
        hash2(3, 4);
        return ();
    }

You should get the following error:

.. tested-code:: none revoked_imp_args_err

    test.cairo:15:5: While trying to retrieve the implicit argument 'hash_ptr' in:
        hash2(3, 4);
        ^*********^
    hash.cairo:13:12: Reference 'hash_ptr' was revoked.
    func hash2{hash_ptr: HashBuiltin*}(x, y) -> (result: felt) {
               ^********************^
    Reference was defined here:
    test.cairo:13:5
        hash2(1, 2);
        ^*********^

To understand why you got this error, you should note that implicit arguments
are implemented as references and as such they can be :ref:`revoked <revoked_references>`.

In this case, the line ``hash2(1, 2)`` rebinds ``hash_ptr`` to the value returned
by ``hash2`` (due to the implicit argument of ``hash2``).
This reference is relative to the ``ap`` register.
The call to ``foo()`` revokes this reference since the compiler cannot track the expected change
to the ``ap`` register. On the other hand, the line ``hash2(3, 4)`` requires this reference,
which is the reason we got the error.

To solve it, you can add the line ``local hash_ptr: HashBuiltin* = hash_ptr;``
which copies the value of the reference
to a local variable (and rebinds the reference accordingly) just after the call to ``hash2(1, 2)``
(where the revoked reference was defined).
In fact, it suffices to add ``alloc_locals;`` to the function, and the Cairo compiler will
automatically add this instruction for you.

.. tested-code:: cairo revoked_imp_args_fixed

    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    func foo(n) {
        if (n == 0) {
            return ();
        }
        foo(n=n - 1);
        return ();
    }

    func bar{hash_ptr: HashBuiltin*}() {
        alloc_locals;
        hash2(1, 2);
        // You can skip the line below, and the compiler will add
        // it automatically, because of the alloc_locals keyword.
        local hash_ptr: HashBuiltin* = hash_ptr;
        foo(3);
        hash2(3, 4);
        return ();
    }

After the line ``local hash_ptr: HashBuiltin* = hash_ptr;`` the reference ``hash_ptr`` is relative to
``fp`` (rather than ``ap``) so it's not revoked by the call to ``foo()``.

The compiler is not always able to add such instructions automatically, for example where
if-blocks and jumps are involved. In such cases you will have to add them manually.
Consider the following example:

.. tested-code:: cairo revoked_imp_args_if

    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    func bar{hash_ptr: HashBuiltin*}(x) {
        if (x == 0) {
            hash2(1, 2);
        }

        hash2(3, 4);
        return ();
    }

In this case, the ``hash_ptr`` reference is revoked because its binding depends on
whether the branch ``x == 0`` was taken or not.
If ``x == 0``, the reference points to the value returned from ``hash2(1, 2)`` and otherwise
it points to the implicit argument of ``bar``.
A possible solution is to rebind ``hash_ptr`` *at the end* of both branches
(this necessitates adding an explicit ``else`` block) using a :ref:`temporary variable <tempvars>`:

.. tested-code:: cairo revoked_imp_args_if_fixed

    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    func bar{hash_ptr: HashBuiltin*}(x: felt) {
        if (x == 0) {
            hash2(1, 2);
            tempvar hash_ptr = hash_ptr;
        } else {
            tempvar hash_ptr = hash_ptr;
        }

        hash2(3, 4);
        return ();
    }

The fact that the temporary variable is defined at the end of both branches implies
that after the ``if`` statement is completed,
the ``hash_ptr`` reference is at the same location with respect to ``ap``
whether ``x == 0`` or not
(in our case the reference is going to be ``[ap - 1]``).

.. test::
    import re
    import os

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
    from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError

    try:
        program = compile_cairo([(codes["revoked_imp_args"], "test.cairo")], DEFAULT_PRIME)
    except PreprocessorError as exc:
        error_str = str(exc)
    else:
        raise Exception("Exception was not raised during compilation of revoked_imp_args.")

    error_str = re.sub(".*hash\.cairo", "hash.cairo", error_str)
    assert error_str.strip() == codes["revoked_imp_args_err"].strip()

    # Make sure the fixed version compiles successfully.
    fixed_code = codes["revoked_imp_args_fixed"]
    compile_cairo(fixed_code, DEFAULT_PRIME)

    # Same with the "local" line removed.
    line_removed = fixed_code.replace(
        "local hash_ptr: HashBuiltin* = hash_ptr;", "")
    assert line_removed != fixed_code, "Line is missing from the code example."
    compile_cairo(line_removed, DEFAULT_PRIME)

    try:
        program = compile_cairo([(codes["revoked_imp_args_if"], "test.cairo")], DEFAULT_PRIME)
    except PreprocessorError as exc:
        pass
    else:
        raise Exception("Exception was not raised during compilation of revoked_imp_args_if.")

    # Make sure the fixed version compiles successfully.
    compile_cairo(codes["revoked_imp_args_if_fixed"], DEFAULT_PRIME)

.. _layouts:

Layouts
-------

Cairo supports a few possible layouts.
Each layout specifies which of the different builtins exist
and how many instances of that builtin can be used.
This is measured as the ratio between the number of instructions and
the number of available builtin instances. For example, if this ratio of a hash builtin is 16,
it means that the number of hash invocations can be at most ``n_steps / 16`` where
``n_steps`` is the number of Cairo steps.
If your program needs more hash invocations, you can either increase the number of steps
(using the ``--steps`` flag) or choose a layout with a smaller ratio.

The ``plain`` layout, which is the default layout, has no builtins.
Thus, if your program needs to write output, compute the Pedersen hash or use another builtin,
you will need to call ``cairo-run`` with another layout, which is specified using the
``--layout`` flag.

The ``small`` layout
***********************

The ``small`` layout (``--layout=small``) includes the following builtins:

.. tested-code:: none small_layout

    Builtin name    Ratio
    ---------------------
    Output          -
    Pedersen        8
    Range check     8
    ECDSA           512

.. test::

    from starkware.cairo.lang.instances import LAYOUTS

    res = f'{"Builtin name":<15} Ratio\n'
    res += '---------------------\n'
    for name, builtin in LAYOUTS['small'].builtins.items():
        res += f'{name.replace("_", " "):<15} '
        if hasattr(builtin, 'ratio'):
            res += str(builtin.ratio)
        else:
            res += '-'
        res += '\n'
    assert res.strip().lower() == codes['small_layout'].strip().lower()

**Note**: Since the number of ``ECDSA`` instances is ``n_steps / 512`` and
it must be an integer, it implies that the number of steps must be divisible by ``512``
when the ``small`` layout is used.

The ``%builtins`` directive
---------------------------

The  ``%builtins`` directive specifies which builtins are used by the program.
Each builtin adds an argument to ``main()`` and requires a return value.
Those can be replaced by adding implicit arguments to ``main``.
For example,

.. tested-code:: cairo builtins_directive

    %builtins output pedersen

    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    // Implicit arguments: addresses of the output and pedersen
    // builtins.
    func main{output_ptr, pedersen_ptr: HashBuiltin*}() {
        // The following line implicitly updates the pedersen_ptr
        // reference to pedersen_ptr + 3.
        let (res) = hash2{hash_ptr=pedersen_ptr}(1, 2);
        assert [output_ptr] = res;

        // Manually update the output builtin pointer.
        let output_ptr = output_ptr + 1;

        // output_ptr and pedersen_ptr will be implicitly returned.
        return ();
    }

.. test::

    import os

    from starkware.cairo.lang.cairo_constants import DEFAULT_PRIME
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    program = compile_cairo(codes['builtins_directive'], DEFAULT_PRIME)

    runner = CairoRunner(program, layout='small')
    runner.initialize_segments()
    end = runner.initialize_main_entrypoint()
    runner.initialize_vm(hint_locals={})
    runner.run_until_pc(end)

    output_base = runner.builtin_runners['output_builtin'].base
    pedersen_base = runner.builtin_runners['pedersen_builtin'].base
    ap = runner.vm.run_context.ap
    assert runner.vm_memory[ap - 2] == output_base + 1
    assert runner.vm_memory[ap - 1] == pedersen_base + 3
    assert runner.vm_memory[output_base] == \
        2592987851775965742543459319508348457290966253241455514226127639100457844774

Exercise
********

1.  Write a function that gets a pointer to a hash function builtin and computes
    the hash of three values as :math:`H(H(x, y), z)` (recall that it should return the
    updated pointer).

    a.  Use the builtin directly without ``hash2``. Don't use implicit arguments.

    b.  Rewrite your function so that it gets the builtin pointer as an implicit argument
        and uses the standard library function ``hash2``.

2.  Write a main function calling your function.
3.  Write a function that gets a pointer to an array and computes its hash chain:

    .. math::

        H(\cdots H(H(x_0,x_1),x_2), \ldots, x_n)

Range-checks
------------

The range-check builtin is used to check that a field element is within the range
:math:`[0, 2^{128})`. Namely, it forces that

.. code-block:: none

    0 <= [p + 0] < 2^128
    0 <= [p + 1] < 2^128
    0 <= [p + 2] < 2^128
    ...

where ``p`` is the beginning address of the builtin.
Checking that a value, ``x``, is in a smaller range :math:`[0, \text{BOUND}]`
(where :math:`\text{BOUND} < 2^{128}`) can be done using two range-check instances:

1. Use one instance to verify that :math:`0 \leq x < 2^{128}`.
2. Use another instance to verify that :math:`0 \leq \text{BOUND} - x < 2^{128}`.

**Note:** Talking about :math:`x \geq 0` (without an upper bound, such as :math:`x < 2^{128}`)
is not well defined --
it depends on the interpretation of the field elements as integers
(for example, one could interpret the field elements in the range :math:`[0, p)`
which will imply that all the elements are nonnegative, or in the range
:math:`[-\lfloor p/2 \rfloor, \lfloor p/2 \rfloor]` in which half of the elements are nonnegative).
On the other hand, once we bound :math:`x` from both sides (:math:`0 \leq x < 2^{128}`),
the range becomes well defined.

Exercise
********

1.  Write a function ``foo(x)`` that verifies that :math:`0 \leq x \leq 1000`.
2.  Why isn't checking that :math:`0 \leq 1000 - x < 2^{128}` enough?
3.  Write a function ``foo(x, y, z, w)`` that verifies that
    :math:`0 \leq x \leq y \leq z \leq w < 2^{128}` using as few instances of the bulitin as you can.
4.  How can you check that :math:`0 \leq x < 2^{200}`? (hint: you will need more than one instance
    of the builtin)

    .. toggle:: Hint

        Any number :math:`0 \leq x < 2^{200}` can be expressed as :math:`x = a \cdot 2^{128} + b`,
        where :math:`0 \leq a < 2^{200 - 128}` and :math:`0 \leq b < 2^{128}`.

Divisibility testing
********************

Divisibility is a question of whether an integer ``x`` is divisible by ``y`` without remainder
(namely, is there an integer ``z`` such that :math:`x = y \cdot z`).
A special case is testing whether ``x`` is even (divisible by 2) or odd.
The question of (integer) divisibility is not well-defined in finite fields:
:math:`P - 1` is an even integer, but it is also used to represent -1, which is clearly odd.
One way to overcome this is to force a range. For example, the question "Is the integer
:math:`0 \leq x < 2^{128}` divisible by 3?" is well defined.

Exercise
********

Write a function that verifies that ``x`` is within the range :math:`[0, 2^{128})` and is divisible by
3.

.. toggle:: Hint

    Check that x and y (for a nondeterministic y) are within the range :math:`[0, 2^{128})`
    and that :math:`x = 3 \cdot y` (the range-checks will guarantee that there is no overflow).

.. _integer_division:

Integer division
****************

We can use the range-check builtin in order to compute integer division with remainder.
The goal is to compute :math:`q = \lfloor x / y \rfloor` and :math:`r = x \text{ mod } y`.
We can rewrite it as :math:`x = q \cdot y + r` (as integers) where :math:`0 \leq r < y`.
When we test :math:`x = q \cdot y + r` we need to be careful --
we need to make sure the computation will not overflow.
For simplicity we will assume here that :math:`0 \leq x, y < 2^{64}`
(if this is not the case, you can modify the code according to your constraints).

The following code computes :math:`q` and :math:`r` (and validates :math:`0 \leq x, y < 2^{64}`)
assuming that :math:`|\mathbb{F}| > 2^{128}`:

.. tested-code:: cairo division

    func div{range_check_ptr}(x, y) -> (q: felt, r: felt) {
        alloc_locals;
        local q;
        local r;
        %{ ids.q, ids.r = ids.x // ids.y, ids.x % ids.y %}

        // Check that 0 <= x < 2**64.
        [range_check_ptr] = x;
        assert [range_check_ptr + 1] = 2 ** 64 - 1 - x;

        // Check that 0 <= y < 2**64.
        [range_check_ptr + 2] = y;
        assert [range_check_ptr + 3] = 2 ** 64 - 1 - y;

        // Check that 0 <= q < 2**64.
        [range_check_ptr + 4] = q;
        assert [range_check_ptr + 5] = 2 ** 64 - 1 - q;

        // Check that 0 <= r < y.
        [range_check_ptr + 6] = r;
        assert [range_check_ptr + 7] = y - 1 - r;

        // Verify that x = q * y + r.
        assert x = q * y + r;

        let range_check_ptr = range_check_ptr + 8;
        return (q=q, r=r);
    }

Exercise
********

Convince yourself that the code is correct:

1.  Completeness -- if ``x`` and ``y`` are in range, all the range-checks will pass.
2.  Soundness -- if all the range-checks pass, then the result is correct (assume a malicious prover
    which may ignore the hint, and run any hint it wants instead).
    Why is the assumption :math:`|\mathbb{F}| > 2^{128}` required? (recall that the equation
    ``x = q * y + r`` is checked modulo the field size).

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**251 + 17 * 2**192 + 1
    code = '%builtins range_check\n' + codes['division']
    program = compile_cairo(code, PRIME)

    runner = CairoRunner(program, layout='small')
    runner.initialize_segments()
    range_check_base = runner.builtin_runners['range_check_builtin'].base
    end = runner.initialize_function_entrypoint('div', [range_check_base, 10, 3])
    runner.initialize_vm(hint_locals={})
    runner.run_until_pc(end)
    runner.end_run()

    ap = runner.vm.run_context.ap
    N_RANGE_CHECKS = 8
    assert runner.vm_memory[ap - 3] == range_check_base + N_RANGE_CHECKS
    assert runner.vm_memory[ap - 2] == 3
    assert runner.vm_memory[ap - 1] == 1
