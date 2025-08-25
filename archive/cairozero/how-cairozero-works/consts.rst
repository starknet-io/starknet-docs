Consts and references
=====================

Consts
------

Cairo supports defining constant expressions (only integers).
For example, one may write:

.. tested-code:: cairo const_example

    const value = 1234;
    [ap] = value;

which is equivalent to

.. tested-code:: cairo const_example2

    [ap] = 1234;

The line ``const value = 1234`` is not translated to a Cairo instruction;
it is just used by the compiler to replace ``value`` with ``1234`` in the following instructions.

.. _short_string_literals:

Short string literals
---------------------

A short string is a string whose length is at most 31 characters, and therefore can fit into
a single field element.

.. tested-code:: cairo short_string_literals0

    [ap] = 'hello';

which is equivalent to

.. tested-code:: cairo short_string_literals1

    [ap] = 0x68656c6c6f;

It is important to note that a short-string is simply a way to represent a field element,
it's not a real string.
Cairo doesn't support strings at the moment, and when it does, strings will be represented using
``"`` rather than ``'`` (similar to the distinction in C/C++).

The string's first character is the most significant byte of the integer (big endian
representation).

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    program0 = compile_cairo(codes['short_string_literals0'], PRIME)
    program1 = compile_cairo(codes['short_string_literals1'], PRIME)
    assert program0.data == program1.data

.. _references:

References
----------

Sometimes it may be difficult to follow the progress of the ``ap`` register.
Consider the following code, which computes :math:`x^{16}+x` for :math:`x = 3`:

.. tested-code:: cairo references_example

    // Set value of x.
    [ap] = 3, ap++;

    [ap] = [ap - 1] * [ap - 1], ap++;
    [ap] = [ap - 1] * [ap - 1], ap++;
    [ap] = [ap - 1] * [ap - 1], ap++;
    [ap] = [ap - 1] * [ap - 1], ap++;

    [ap] = [ap - 1] + [ap - 5], ap++;

The problem is that it's difficult to say whether the offset ``5`` in the last line should indeed be
``5`` (rather than ``4`` or ``6``). Instead, we can write:

.. tested-code:: cairo references_example2

    // Set value of x.
    let x = ap;
    [x] = 3, ap++;

    [ap] = [ap - 1] * [ap - 1], ap++;
    [ap] = [ap - 1] * [ap - 1], ap++;
    [ap] = [ap - 1] * [ap - 1], ap++;
    [ap] = [ap - 1] * [ap - 1], ap++;

    [ap] = [ap - 1] + [x], ap++;

The ``let`` syntax defines a *reference* and this code compiles exactly to the same instructions
as the previous code.
In particular, the compiler replaces the first occurrence of ``[x]`` by ``[ap]`` and the second
by ``[ap - 5]``. In other words, the compiler tracks the progress of the ``ap`` register and
substitutes ``x`` accordingly.

References can hold any Cairo expression, for example:

.. tested-code:: cairo references_example3

    let x = [[fp + 3] + 1];
    [ap] = x;  // This will compile to [ap] = [[fp + 3] + 1].

.. _assert_statement:
.. _compound_expressions:

The assert statement and compound expressions
---------------------------------------------

Often you'll need to perform a computation which involves more than one operation.
The polynomial in :ref:`a_simple_cairo_program_exercise` is a good example.
An expression that involves more than one operation (e.g., ``[ap] * [ap] * [ap]``,
``[[[ap]]] + [ap]``, ...) is called a *compound expression*.
The Cairo compiler supports the following syntax, which allows to assert the equality between the
values of two compound expressions:

.. tested-code:: cairo compound_assert_syntax

    assert <expr> = <expr>;

For example,

.. tested-code:: cairo compound_assert

    let x = [ap - 1];
    let y = [ap - 2];
    assert x * x = x + 5 * y;

Note that such statements are usually compiled to more than one instruction and ``ap`` may
advance an unknown number of steps (the exact number depends on the number of operations in the two
compound expressions). Hence, **you should avoid** using ``ap`` and
``fp`` directly in such expressions and use the mechanisms presented in this section instead
(:ref:`references <references>` and :ref:`temporary <tempvars>`/:ref:`local <local_vars>`
variables).

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    program1 = compile_cairo(codes['compound_assert'], PRIME)
    program2 = compile_cairo("""
    [ap] = 5, ap++;                      // 5.
    [ap] = [ap - 1] * [ap - 3], ap++;    // 5 * y.
    [ap] = [ap - 3] + [ap - 1], ap++;    // x + 5 * y.
    [ap - 4] * [ap - 4] = [ap - 1];      // x * x = x + 5 * y.
    """, PRIME)
    assert program1.data == program2.data

.. _revoked_references:

Revoked references
------------------

Note that if there is a label or a call instruction
(call to another function. See :ref:`functions`)
between the definition of a reference
that depends on ``ap`` and its usage, the reference may be *revoked*, since the compiler may not
be able to compute the change of ``ap`` (as one may jump to the label from another place in the
program, or call a function that might change ``ap`` in an unknown way).

In some cases, the compiler will not automatically detect that a jump may occur
(for example, in an explicit relative jump, see the exercise below)
and the reference will not be revoked.
However, using this reference in such cases may result in an undefined behavior.

References which do not depend on ``ap`` (for example, ``let x = [[fp]];``)
are never revoked by the compiler, but the same rule applies -- using those references
outside of the scope of the function they were defined in, may result in an undefined behavior.

Exercise
********

Run the following code, with ``--steps=32 --print_memory`` and explain what happens.

..  TODO(Adi, 01/06/2021): Uncomment the following once references are revoked by labels.
    Then, replace ``jmp rel -1`` with the same jump, using a label and try to compile the code.

.. tested-code:: cairo reference_undefined_behavior

    func main() {
        let x = [ap];
        [ap] = 1, ap++;
        [ap] = 2, ap++;

        [ap] = x, ap++;
        jmp rel -1;  // Jump to the previous instruction.
    }

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13
    program = compile_cairo(codes['reference_undefined_behavior'], PRIME)

    runner = CairoRunner(program, layout='plain')

    runner.initialize_segments()
    runner.initialize_function_entrypoint('main', [])
    runner.initialize_vm(hint_locals={})
    runner.run_for_steps(16)

    assert [runner.vm_memory[runner.initial_ap + i] for i in range(6)] == [1, 2, 1, 2, 1, 2]


.. _typed_references:

Typed references
----------------

Suppose that ``[fp]`` contains a pointer to a struct of three memory cells: x, y, z.
To access the value of y, one may write ``[[fp] + 1]``. However, this requires the programmer
to maintain the offset of y.

A better way is to define a struct:

.. tested-code:: cairo typed_references0

    struct MyStruct {
        x: felt,
        y: felt,
        z: felt,
    }

This creates a struct named ``MyStruct``.
The keyword ``felt`` stands for field element, which is the primitive type in Cairo.
The Cairo compiler computes the offsets of the members from the beginning
of the structs, and you can access those offsets using
``MyStruct.x``, ``MyStruct.y`` and ``MyStruct.z`` (for example ``MyStruct.z = 2``).
In addition, the total size of the struct can be obtained using ``MyStruct.SIZE``.
Now we can replace ``[[fp] + 1]`` with ``[[fp] + MyStruct.y]``.

Since this pattern repeats itself quite a lot, Cairo supports defining typed references
as follows:

.. tested-code:: cairo typed_references1

    let ptr: MyStruct* = cast([fp], MyStruct*);
    assert ptr.y = 10;
    // This will compile to [ptr + MyStruct.y],
    // which will subsequently compile to [[fp] + 1].

In general, the syntax ``refname.member_name``, where ``refname`` is a typed reference
with value ``val`` and type ``T``, and ``T.member_name`` is a member definition,
compiles to ``[val + T.member_name]``.

You may omit the type and write (the Cairo compiler will deduce the type from the right-hand side):

.. tested-code:: cairo typed_references2

    let ptr = cast([fp], MyStruct*);

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    compile_cairo(codes['typed_references0'] + '\n' + codes['typed_references1'], PRIME)
    compile_cairo(codes['typed_references0'] + '\n' + codes['typed_references2'], PRIME)

.. _casting:

Casting
-------

Every Cairo expression has an associated type. Cairo supports types such as field-element
(represented by the keyword ``felt``), pointers and structs.
For example, the type of the values of the
registers ``ap`` and ``fp`` and any integer literal is ``felt``.

You can change the type of an expression using ``cast(<expr>, <type>)``, where ``<type>`` can be
``felt`` (for a field-element), ``T`` (for a struct ``T``, as explained above) or a pointer to
another type (such as ``T*`` or ``felt**``).


.. _tempvars:

Temporary variables
-------------------

Cairo supports the following syntactic sugar which allows defining temporary variables:

.. tested-code:: cairo temp_var0

    tempvar var_name = <expr>;

For simple expressions, with at most one operation, this is equivalent to:

.. tested-code:: cairo temp_var1

    [ap] = <expr>, ap++;
    let var_name = [ap - 1];

:ref:`Compound expressions <compound_expressions>` are also supported, in which case the command
may be compiled to more than one Cairo instruction.

Note that as the reference is based on ``ap``, it may be revoked by some instructions
(see :ref:`revoked_references`).

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    program0 = compile_cairo(codes['temp_var0'].replace('<expr>', '[fp]'), PRIME)
    program1 = compile_cairo(codes['temp_var1'].replace('<expr>', '[fp]'), PRIME)
    # Check the equivalence between the two programs.
    assert program0 == program1

Exercise
********

Rewrite the solution to :ref:`a_simple_cairo_program_exercise` using temporary variables.

.. _local_vars:

Local variables
---------------

Another important feature is called "local variables". Unlike :ref:`tempvars` which are based
on the ``ap`` register, and thus are revoked by some instructions (see :ref:`revoked_references`),
local variables are based on the ``fp`` register. In the scope of a function, the first local
variable will be a reference to ``[fp + 0]``, the second one to ``[fp + 1]`` and so on.
Unlike :ref:`tempvars` which take care of incrementing ``ap``, this is not the case for local
variables. You must take care to advance ``ap`` if you're using local variables.
The Cairo compiler auto-generates a constant ``SIZEOF_LOCALS`` which is equal to the
accumulated size (of cells) of locals within the same scope. For example:

.. tested-code:: cairo locals

    func main() {
        ap += SIZEOF_LOCALS;
        local x;  // x will be a reference to [fp + 0].
        local y;  // y will be a reference to [fp + 1].

        x = 5;
        y = 7;
        ret;
    }

Additionally, Cairo provides the instruction ``alloc_locals`` which is transformed to
``ap += SIZEOF_LOCALS``.

You may also define a local variable and assign a value to it in a single line:

.. tested-code:: cairo local_var_syntax

    local x = <expr>;

In fact, the expression may be a :ref:`compound expression <compound_expressions>`.

Note that unless the local variable is initialized in the same line,
the ``local`` directive itself does not translate to a Cairo instruction
(this is another difference from ``tempvar``) -- it simply translates to a reference definition.
This is one of the reasons you must increase the value of ``ap`` manually.

A local variable may have a type, like a reference.
In the current version of Cairo, the type of a local variable must be explicitly
stated (otherwise, ``felt`` is used), and it is not deduced from the type of the
initialization value.

Exercise
********

1.  What's wrong with the following code?
    (Hint: try to replace ``ap += SIZEOF_LOCALS;`` with ``alloc_locals;`` and see what happens)
    Can you fix it without changing the order of the variable definitions in the code?

    .. tested-code:: cairo locals_exercise1

        func main() {
            tempvar x = 0;

            local y;
            ap += SIZEOF_LOCALS;
            y = 6;
            ret;
        }

2.  Can you spot an inefficiency in the following code? Hint: take a look
    :ref:`here <continuous_memory>`.
    Fix the inefficiency in two ways (implement each of the following fixes separately):

    a. Move the instruction ``alloc_locals;``.
    b. Use ``tempvar`` instead of ``local``.

.. tested-code:: cairo locals_exercise2

    func pow4(n) -> (m: felt) {
        alloc_locals;
        local x;

        jmp body if n != 0;
        [ap] = 0, ap++;
        ret;

        body:
        x = n * n;
        [ap] = x * x, ap++;
        ret;
    }

    func main() {
        pow4(n=5);
        ret;
    }

.. test::
    import pytest

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner
    from starkware.cairo.lang.vm.vm_exceptions import VmException

    locals_exercise1_fix = (codes['locals_exercise1']
        .replace('ap += SIZEOF_LOCALS;', '')
        .replace('tempvar', 'ap += SIZEOF_LOCALS;\n tempvar'))
    locals_exercise2_fix1 = (codes['locals_exercise2']
        .replace('alloc_locals;', '')
        .replace('body:', 'body:\n alloc_locals;'))
    locals_exercise2_fix2 = (codes['locals_exercise2']
        .replace('alloc_locals;', '')
        .replace('local x;', '')
        .replace('x =', 'tempvar x ='))

    tests = [
        ('main', [], codes['locals'], [5, 7]),
        ('main', [], locals_exercise1_fix, [6, 0]),
        ('main', [], codes['locals_exercise1'], None),
        ('main', [], codes['locals_exercise2'], []),
        ('pow4', [3], codes['locals_exercise2'], [9, 81]),
        ('pow4', [0], codes['locals_exercise2'], [None, 0]),
        ('pow4', [3], locals_exercise2_fix1, [9, 81]),
        ('pow4', [0], locals_exercise2_fix1, [0, None]),
        ('pow4', [3], locals_exercise2_fix2, [9, 81]),
        ('pow4', [0], locals_exercise2_fix2, [0, None]),
    ]

    for name, args, code, expected_result in tests:
        PRIME = 2**64 + 13
        program = compile_cairo(code, PRIME)

        runner = CairoRunner(program, layout='plain')
        runner.initialize_segments()
        end = runner.initialize_function_entrypoint(name, args)
        runner.initialize_vm(hint_locals={})

        if expected_result is None:
            with pytest.raises(VmException, match='An ASSERT_EQ instruction failed: 0 != 6'):
                runner.run_until_pc(end)
            continue

        runner.run_until_pc(end)

        assert [runner.vm_memory.get(runner.initial_ap + i) for i in range(len(expected_result))] == \
            expected_result

Typed local variables
---------------------

You can specify a type for the local variable in two different ways:

.. tested-code:: cairo typed_locals

    local x: T* = <expr>;
    local y: T = <expr>;

The first one allocates one cell, which will be considered a pointer to a struct of type ``T``.
Thus you can use ``x.a`` as an equivalent to ``[[fp + 0] + T.a]``
(assuming ``a`` is a member of ``T``).

The second one allocates ``T.SIZE`` cells
(starting from ``fp + 1`` in the example above due to the definition of ``x``),
and in this case ``y.a`` is equivalent to ``[fp + 1 + T.a]`` rather than ``[[fp + 1] + T.a]``
(exercise: why?).

Moreover, ``y`` itself refers to the *address* of the struct (``fp + 1`` rather than ``[fp + 1]``).
This means you may get an error if you try to use ``y``. For example:

.. tested-code:: cairo typed_locals1

    tempvar z = y;

will fail, since it should compile to ``assert [ap] = fp + 1, ap++;`` which is not a valid
instruction in Cairo due to the use of ``fp``. Nevertheless, defining a variable called ``__fp__``
will allow the code to compile, as you will see in :ref:`retrieving_registers`.

.. _reference_rebinding:

Reference rebinding
-------------------

Cairo allows you to define a reference with the name of an existing reference:

.. tested-code:: cairo ref_rebinding0

    let x: T* = cast(ap, T*);
    x.a = 1;

    // ...

    // Rebind x to the address fp + 3 instead of ap.
    let x: T* = cast(fp + 3, T*);
    x.b = 2;

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    # Check that the code compiles.
    preamble = """
    struct T {
        a: felt,
        b: felt,
    }
    """
    compile_cairo(preamble + codes['ref_rebinding0'].replace('...', ''), PRIME)


**References are not variables:** the scope of each definition is defined according to
**a static analysis** of the order in which the instructions will be executed. It will follow a
basic flow from jumps and conditional jumps, but if there are colliding definitions for the same
reference, the reference will be revoked.

Example
*******

To stress this last point, consider the following code.

.. tested-code:: cairo ref_rebinding1

    func foo(x) {
        let y = 1;
        jmp x_not_zero if x != 0;

        x_is_zero:
        [ap] = y, ap++;  // y == 1.
        let y = 2;
        [ap] = y, ap++;  // y == 2.
        jmp done;

        x_not_zero:
        [ap] = y, ap++;  // y == 1.
        let y = 3;
        [ap] = y, ap++;  // y == 3.

        done:
        // Here, y is revoked, and cannot be accessed.
        ret;
    }

.. test::
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13

    program = compile_cairo(codes['ref_rebinding1'], PRIME)
    runner = CairoRunner(program, layout='plain')

    runner.initialize_segments()
    end = runner.initialize_function_entrypoint('foo', [0])
    runner.initialize_vm(hint_locals={})
    runner.run_until_pc(end)

    assert [runner.vm_memory[runner.initial_ap + i] for i in range(2)] == [1, 2]

This code will return either ``[1, 2]``, or ``[1, 3]``.

.. _tuples:

Tuples
------

Tuples allow convenient referencing of an ordered collection of elements. Tuples consist of any
combination of valid types, including other tuples.

Tuples are represented as a comma-separated list of elements enclosed in parentheses.
For example: ``(3, x)``.

Consider the following assert statement:

.. tested-code:: cairo tuples0

    assert (x, y) = (1, 2);

The above statement compiles to:

.. tested-code:: cairo tuples1

    assert x = 1;
    assert y = 2;

See :ref:`tuple_types` for more information about the type of a tuple expression.

Tuple elements are accessed with the tuple expression followed by brackets containing a zero-based
index to the element. The index must be known at compile time.

.. tested-code:: cairo tuples2

    let a = (7, 6, 5)[2];  // let a = 5;

Cairo requires a trailing comma for single-element tuples, to distinguish them from regular
parentheses. For example ``(5,)`` is a single-element tuple. Access to nested tuples is achieved by
using additional indices starting with the outer-most tuple. For example, ``MyTuple[2][4][3][1]``
first accesses index 2 of ``MyTuple``. This value is accessed at index 4, and so on.

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13

    # Wrap code inside function to allow locals
    def compiled_program(index):
        test_code = codes[f'tuples{index}']
        code = f"""
        func foo() {{
            alloc_locals;
            local x: felt;
            local y: felt;
            {test_code}
            return ();
        }}
        """
        return compile_cairo(code, PRIME)
    # Generate compiled programs for each example.
    programs = [compiled_program(i) for i in range(2)]
    # Verify that the compiled programs are identical.
    assert programs[0].data == programs[1].data

.. _arrays:

Arrays
------

In order to represent an array (an ordered collection of homogeneous elements) in Cairo, one may
use a pointer to the beginning of the array. See :ref:`alloc` for allocating a new memory segment
for arrays.

The expression ``struct_array[n]`` is used to access the n-th element of the array,
where n=0 is the first element. ``struct_array[index]`` is compiled to
``[struct_array + index * MyStruct.SIZE]``, and is of type ``MyStruct``.
