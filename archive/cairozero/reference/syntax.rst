Syntax
======

This page summarizes the syntax of Cairo. For more information, refer to the "Hello, Cairo"
and "How Cairo Works" tutorials.

Comments
--------

Text can be inserted into the body of Cairo programs to document notes about the code.
The commented text is annotated with the ``//`` syntax. Text following it is ignored by
the compiler.

.. tested-code:: cairo syntax_comments

    // Comments can be placed before, after or within code blocks.
    func main() {
        // The '//' syntax signals that this line is a comment.
        // This line will also not run as code. The next line will.
        let x = 9;
        return ();
    }

Each comment spreads until the end of the line. In order to write a multiline comment, prefix all
the comment lines with ``//``.

Punctuation
-----------

The punctuation marks used in Cairo are described below:

*   ``;`` (semicolon). Used at the end of each instruction.
*   ``(`` ``)`` (parentheses, round brackets). Used in a function declaration, ``if`` statements,
    and in a tuple declaration.
*   ``{`` ``}`` (braces, curly braces, curly brackets). Used in a declaration of implicit
    arguments and to define a block of code
    (e.g., the body of a function, and ``if`` and ``else`` blocks).
*   ``[`` ``]`` (brackets, square brackets). Standalone brackets represent the value at a
    particular address location (such as the allocation pointer, ``[ap]``). Brackets following a
    pointer or a tuple act as a subscript operator, where ``x[2]`` represents the element with
    index ``2`` in ``x``.
*   ``*`` Single asterisk. Refers to the pointer of an expression.
*   ``, ap++`` Used to increment the allocation pointer ``ap`` by one after the preceding
    instruction has finished.
*   ``%`` Percent sign. Appears at the start of a directive, such as ``%builtins`` or ``%lang``.
*   ``%{`` ``%}`` Represents Python hints.
*   ``_`` (underscore, underline). A placeholder to handle values that are not used, such as an
    unused function return value.

.. _syntax_type:

Type system
-----------

Cairo have the following types:

*   ``felt`` -- a field element (see :ref:`field_elements`).
*   ``MyStruct`` where ``MyStruct`` is a :ref:`struct <syntax_structs>` name.
*   An unnamed tuple -- For example: ``(a, b)`` where ``a`` and ``b`` are types
    (see :ref:`syntax_tuples`).
*   A named tuple -- For example: ``(x: a, y: b)`` where ``a`` and ``b`` are types
    (see :ref:`syntax_tuples`).
*   ``T*`` where ``T`` is any type -- a pointer to type ``T``. For example: ``MyStruct*`` or
    ``felt**``.

Expressions
-----------

An expression in Cairo is one of the following:

* An integer literal (e.g., ``5``). Considered as of type ``felt``.
* An identifier (a :ref:`constant <syntax_const>` or a :ref:`reference <syntax_reference>`).
  E.g., ``my_identifier``, ``struct_name.member_name``, ``reference_name.member_name``.
* An address register: ``ap`` or ``fp``. Both have type ``felt``.
* ``x + y``, ``x - y``, ``x * y``, ``x / y``, ``-x`` where ``x`` and ``y`` are expressions.
* ``(x)`` where ``x`` is an expression -- same as ``x``
  (allows to control operator precedence in the expression).
* ``[x]`` where ``x`` is an expression -- represents the value of the member at the address ``x``.
  If ``x`` is of type ``T*`` then ``[x]`` is of type ``T``.
* ``&x`` where ``x`` is an expression -- represents the address of the expression ``x``.
  For example, ``&[x]`` is ``x``.
* ``cast(x, T)`` where ``x`` is an expression and ``T`` is a type -- same as ``x``, except that
  the type is changed to ``T``. For example, ``cast(10, MyStruct*)`` is ``10``, thought as a pointer
  to a ``MyStruct`` instance.

.. _syntax_const:

Constants
---------

You can define a constant value as follows:

.. tested-code:: cairo syntax_consts

    const CONSTANT_NAME = const_value;

``const_value`` must be an expression that evaluates to an integer (field element) at compile time.
For example: ``5`` or ``4 + 2 * VAL`` where ``VAL`` is another constant.

.. _syntax_reference:

References
----------

A reference can be defined as follows:

.. tested-code:: cairo syntax_reference

    let ref_name: ref_type = ref_expr;

where ``ref_type`` is a type and ``ref_expr`` is some Cairo expression.

A reference can be rebound, which means that different expressions may be assigned to the same
reference. See :ref:`reference_rebinding`. For example:

.. tested-code:: cairo syntax_reference_rebinding

    let a = 7;  // a is initially bound to the expression 7.
    let a = 8;  // a is now bound to the expression 8.

References can be revoked, which means that either:

*   There is a conflict between the expression assigned to a reference at two different places in
    the code (for example, due to an ``if`` statement. See example below).
*   The reference is ``ap``-based (e.g., temporary variables or return values from a function
    call), and the change in ap (between the definition and usage) cannot be deduced at compile
    time.

See :ref:`revoked_references` for more information.

.. tested-code:: cairo syntax_revoked_references

    func foo(x) {
        // The compiler cannot deduce whether the if or the else
        // block will be executed.
        if (x == 0) {
            let a = 23;
        } else {
            let a = 8;
        }

        // 'a' cannot be accessed, because it has
        // conflicting values: 23 vs 8.

        return ();
    }

Locals
------

Local variables are defined using the keyword ``local``. Cairo places local variables relative to
the frame pointer (``fp``), and thus their values will not be revoked. See :ref:`local_vars` for more
information.

.. tested-code:: cairo syntax_local

    local a = 3;

Any function that uses a local variable must have the ``alloc_locals;`` statement, usually
at the beginning of the function.
This statement is responsible for allocating the memory cells used by the local
variables within the function's scope.

In addition, it allows the compiler to allocate local variables for references
that would have otherwise been revoked (see :ref:`revoked_implicit_arguments`).
In order to use local variables, without this feature, you can replace the ``alloc_locals;``
statement with ``ap += SIZEOF_LOCALS;``.

.. tested-code:: cairo syntax_alloc_locals

    func foo() {
        alloc_locals;
        local a = 3;
        return ();
    }

If the address of a local variable is needed, the value of a reference named ``fp`` must be set to
the value of the frame pointer. This can be done by the statement
``let (__fp__, _) = get_fp_and_pc()``. See :ref:`retrieving_registers` for more information.

.. _syntax_structs:

Structs
-------

You can define a struct as follows:

.. tested-code:: cairo structs

    struct MyStruct {
        first_member: felt,
        second_member: MyStruct*,
    }

Each member is defined using the syntax ``<member_name>: <member_type>,``.

The struct has a size, which is the sum of the sizes of its members.
The size can be retrieved using ``MyStruct.SIZE``.

Each member is assigned an offset from the beginning of the struct.
The first member is assigned offset 0,
the second is assigned offset according to the size of the first member and so on.
The offset can be retrieved using ``MyStruct.member_name``.
For example, ``MyStruct.first_member == 0`` and ``MyStruct.second_member == 1``
(since the size of ``felt`` is 1).

Pointers
--------

A pointer is used to signify the address of the first field element in the memory of an element.
The pointer can be used to access the element in an efficient manner. For example, a function
may accept a pointer as an argument, and then access the element at the address of the pointer.
The following example shows how to use this type of expression to access a tuple element:

.. tested-code:: cairo syntax_pointer

    from starkware.cairo.common.registers import get_fp_and_pc

    // Accepts a pointer called my_tuple.
    func foo(my_tuple: felt*) {
        // 'my_tuple' points to the 'numbers' tuple.
        let a = my_tuple[1];  // a = 2.
        return ();
    }

    func main() {
        alloc_locals;
        // Get the value of the fp register.
        let (__fp__, _) = get_fp_and_pc();
        // Define a tuple.
        local numbers: (felt, felt, felt) = (1, 2, 3);
        // Send the address of the 'numbers' tuple.
        foo(&numbers);
        return ();
    }

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    code = codes['syntax_pointer']
    compile_cairo(code, PRIME)

The above example shows how ``foo()`` accepts a pointer, which is then used to access the tuple.
Passing an argument as a pointer, instead of by value, may be cheaper.

Struct constructor
------------------

Once a struct has been defined, a constructor can be used to declare an instance of that struct as
follows:

.. tested-code:: cairo struct-constructor0

    let struct_instance = MyStruct(
        first_member=value0, second_member=value1
    );

Members must be declared in order of appearance. Struct constructors may be nested as follows:

.. tested-code:: cairo struct-constructor1

    let struct1 = A(v=value0, w=B(x=value1, y=value2));

Where ``A`` is a struct with members ``v`` and ``w`` and ``B`` is a struct with members ``x`` and
``y``.

Arrays
------

Arrays can be defined as a pointer (``felt*``) to the first element of the array. As an array is
populated, the elements take up contiguous memory cells. The ``alloc()`` function is used to
define a memory segment that expands its size whenever each new element in the array is written.

.. tested-code:: cairo syntax_array

    from starkware.cairo.common.alloc import alloc

    // An array of felts.
    local felt_array: felt*;
    // An array of structs.
    let (local struct_array: MyStruct*) = alloc();
    // Populate the first element with a struct.
    assert struct_array[0] = MyStruct(
        first_member=1, second_member=2
    );

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    code = codes['syntax_array']
    code = f"""
        struct MyStruct {{
            first_member: felt,
            second_member: felt,
        }}
        func main() {{
            alloc_locals;
            {code}
            ret;
        }}
    """
    program = compile_cairo(code, PRIME)

Each element uses the same amount of memory cells and may be accessed by a zero based index
as follows:

.. tested-code:: cairo array_index

    assert felt_array[2] = 85;  // (1)

    let a = struct_array[1].first_member;  // (2)

Where: (1) the third element in the array is assigned the value ``85``, and (2) ``a``
is bound to a value from the second struct in the array of structs.

.. _syntax_tuples:

Tuples
------

A tuple is a finite, ordered, unchangeable list of elements. It is represented as a
comma-separated list of elements enclosed by parentheses (e.g., ``(3, x)``).
Their elements may be of any combination of valid :ref:`types <syntax_type>`. A tuple
that contains only one element must be defined in one of the two following ways: the element is
a named tuple or has a trailing comma. When a tuple is passed as an argument, the type of each
element may be specified on a per-element basis (e.g., ``my_tuple: (felt, felt, MyStruct)``).
Tuple values may be accessed with a zero-based index in brackets ``[index]``, including access to
nested tuple elements as shown below.

.. tested-code:: cairo syntax_tuples

    // A tuple with three elements.
    local tuple0: (felt, felt, felt) = (7, 9, 13);
    local tuple1: (felt,) = (5,);  // (5) is not a valid tuple.
    // A named tuple does not require a trailing comma.
    local tuple2: (a: felt) = (a=5);
    // Tuple contains another tuple.
    local tuple3: (felt, (felt, felt, felt), felt) = (1, tuple0, 5);
    local tuple4: ((felt, (felt, felt, felt), felt), felt, felt) = (
        tuple3, 2, 11
    );
    let a = tuple0[2];  // let a = 13.
    let b = tuple4[0][1][2];  // let b = 13.

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    code = codes['syntax_tuples']
    code = f'func main() {{\n alloc_locals; \n {code}\n ret; \n }}'
    compile_cairo(code, PRIME)

Functions
---------

You can define a function as follows:

.. tested-code:: cairo syntax_function

    func func_name{implicit_arg1: felt, implicit_arg2: felt*}(
        arg1: felt, arg2: MyStruct*
    ) -> (ret1: felt, ret2: felt) {
        // Function body.
    }

The implicit argument part ``{implicit_arg1: felt, implicit_arg2: felt*}``
and the return value ``(ret1: felt, ret2: felt)`` are optional.

For more information about functions see :ref:`functions` and :ref:`implicit_arguments`.

Return statement
----------------

A function must end with a ``return`` statement, which takes the following form:

.. tested-code:: cairo syntax_return

    return (ret1=val1, ret2=val2);

Return values may either be positional or named, where positional values are identified
by the order in which they appear in the ``-> ()`` syntax. Positional arguments
must appear before named arguments.

.. tested-code:: cairo syntax_return_position

    // Permitted.
    return (2, b=3);  // positional, named.

    // Not permitted.
    // return (a=2, 3)  // named, positional.

Function return values
----------------------

A function can return values to the caller function. The return values are
designated by the ``-> ()`` syntax.

.. tested-code:: cairo syntax_return_val

    func my_function() -> (a: felt, b: felt) {
        return (2, b=3);
    }

    func main() {
        let (val_a, val_b) = my_function();
        return ();
    }

Functions can specify that a return value should be of a specific type.
The function below returns two values, ``a``, a value of type ``felt``
and ``b``, a pointer.

.. tested-code:: cairo syntax_return_val_typed

    func my_function() -> (a: felt, b: felt*) {
    }

Call statement
--------------

You can call a function in the following ways:

.. tested-code:: cairo syntax_function_call

    foo(x=1, y=2);  // (1)
    let x = foo(x=1, y=2);  // (2)
    let (ret1, ret2) = foo(x=1, y=2);  // (3)
    return foo(x=1, y=2);  // (4)

Option (1) can be used when there is no return value or it should be ignored.

Option (2) binds ``x`` to the return value struct.

Option (3) unpacks the return value into ``ret1`` and ``ret2``.

Option (4) is a tail recursion -- after ``foo`` returns, the calling function returns the
same return value.

Scope attributes
----------------

You can define a string attribute for a code block by surrounding it with a ``with_attr`` statement
as follows:

.. tested-code:: cairo syntax_with_attr

    with_attr attribute_name("Attribute value") {
        // Code block.
    }

See :ref:`scope_attributes` for more information.

Library imports
---------------

Library functions are imported at the top of the file or right below the ``%builtins``
directive if it is used. The statement consists of the module name and the functions to
``import`` from it. Multiple functions from the same library can be separated by commas.
Functions from different libraries are imported on different lines. Cairo searches each
module in a default directory path and in any additional paths specified at compile time.
See :ref:`import_search_path` for more information.

.. tested-code:: cairo syntax_library_imports

    %builtins output pedersen
    from starkware.cairo.common.math import (
        assert_not_zero,
        assert_not_equal,
    )
    from starkware.cairo.common.registers import get_ap

.. _syntax_implicit_arguments:

Implicit arguments
------------------

Implicit arguments are specified as part of the function signature, and are declared
inside curly braces ``{implicit_arg_name}``. Implicit arguments are automatically added as an
argument and a return value to the function. The Cairo compiler takes care to return the
current binding of the reference
``implicit_arg_name``. If no implicit arguments are required the braces can be omitted.

.. tested-code:: cairo syntax_implicit_arguments0

    %builtins output

    func serialize_word{output_ptr: felt*}(value: felt) {
        assert [output_ptr] = value;
        let output_ptr = output_ptr + 1;
        // The current binding for output_ptr is implicitly
        // added as a returned value.
        return ();
    }

The function above, which is available in the common library, accepts an impicit argument,
``output_ptr``, whose new binding is implicitly added as a return value.

.. tested-code:: cairo syntax_implicit_arguments1

    func main{output_ptr: felt*}() {
        alloc_locals;
        local start_output_ptr: felt* = output_ptr;
        serialize_word(value=5);
        // The compiler automatically rebinds the name of the given
        // implicit argument to the function's implicit return value.
        assert output_ptr = start_output_ptr + 1;
        return ();
    }

Note that it was not necessary to explicitly pass the implicit argument via
``serialize_word{output_ptr=output_ptr}(value=5)``, since the parent function ``main()``
already has a binding for ``output_ptr`` and the compiler will automatically pass it to
``serialize_word()``. For more information, see :ref:`implicit_arguments`.

Builtins
--------

Builtin declarations appear at the top of the Cairo code file. They are declared with the
``%builtins`` directive, followed by the name of the builtins.
A builtin is utilized by writing the inputs to a dedicated memory segment accessed via the
builtin pointer. The builtin directive adds those pointers as
parameters to main (abstracted in StarkNet contracts), which can then be passed to any
function making use of them.

Pointer names follow the convention ``<builtin name>_ptr``
and pointer types can be found in the ``cairo_builtins``
module of the common library. The builtins, and their respective pointer expressions and
pointer types are listed below.

-   ``output``, for writing program output which appears explicitly in an execution proof.
    Access with a pointer to type ``felt``.
-   ``pedersen``, for computing the Pedersen hash function. Access with a pointer to
    type ``HashBuiltin``.
-   ``range_check``, for checking that a field element is within a range ``[0, 2^128)``,
    and doing various comparisons.
    Due to historical reasons, unlike ``output_ptr``, the ``range_check_ptr`` passed as an
    argument to main is of type ``felt`` rather than ``felt*``.
-   ``ecdsa``, for verifying ECDSA signatures. Access with a pointer to type ``SignatureBuiltin``.
-   ``bitwise``, for performing bitwise operations on felts. Access with a pointer to
    type ``BitwiseBuiltin``.

Below is a function, ``foo()``, which accepts all five builtins, illustrating their
different pointers and pointer types. Note that the pointers must be passed in the
same order that they appear in the ``%builtins`` directive and that the order follows
the convention:

1. ``output``.
2. ``pedersen``.
3. ``range_check``.
4. ``ecdsa``.
5. ``bitwise``.

.. tested-code:: cairo syntax_builtins

    %builtins output pedersen range_check ecdsa bitwise

    from starkware.cairo.common.cairo_builtins import (
        BitwiseBuiltin,
        HashBuiltin,
        SignatureBuiltin,
    )

    func main{
        output_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr,
        ecdsa_ptr: SignatureBuiltin*,
        bitwise_ptr: BitwiseBuiltin*,
    }() {
        // Code body here.
        return ();
    }

For more information about builtins see :ref:`builtins`, and the ``cairo_builtins``
section in the common library.

..  TODO(perama, 06/06/2021): Add link to common library once merged.
    (:ref:`common_library_cairo_builtins` )

Segments
--------

When running the Cairo code, the memory is separated into different sections called segments.
For example, each builtin occupies a different memory segment. The memory locations are
designated by two numbers, a segment index and an offset in the segment.
In this format, these numbers are separated by a colon ``:``.
When the program ends, the segments are glued and each value of the form ``*:*``
is replaced with a number. See :ref:`segments` for more information. Some examples
of segments and their interpretation are listed below:

* ``0:3``, memory address 3 within segment 0.
* ``1:7``, memory address 7 within segment 1.
* ``2:12``, memory address 12 within segment 2.

Program input
-------------

Program inputs can be accessed within hints using the (hint) variable ``program_input``.
A Cairo program can be run with the ``--program_input`` flag, which allows providing a json
input file that can be referenced inside the hints.
See :ref:`program_inputs` for more information.

.. tested-code:: cairo syntax_program_inputs

    %{
        # Sets the Python variable `a` to a list of user_ids
        # provided in the .json file.
        a = program_input['user_ids']
    %}

Jumps
-----

The ``jmp`` instruction allows navigating through the program, either moving to a
specific label via ``jmp LABEL;``, or a specific location defined by a value of the program counter.
This may be an absolute value with ``jmp abs VALUE;`` or an offset relative to the current
instruction with ``jmp rel OFFSET;``.
Cairo supports conditional jumps with the syntax ``if <expr> != 0`` following a jump instruction.
It is preferable to use ``if`` rather than ``jmp`` where possible. An example use of ``if`` can be
seen here :ref:`syntax_reference`.

When the jump condition depends on a value that is determined by the prover, it
gets to decide whether or not the jump is executed, de facto making this a non deterministic jump.

.. tested-code:: cairo syntax_jumps

    func my_function() -> (result: felt) {
        alloc_locals;
        local a;
        %{ ids.a = 2 %}  // Allows the prover to decide where to branch.

        jmp case_true if a != 0;

        case_false:
        return (result=0);

        case_true:
        return (result=1);
    }

See :ref:`non_deterministic_jumps` for more information.

Program output
--------------

Cairo programs can share information with the verifier using outputs. Whenever the program
wishes to communicate information to the verifier, it can do so by writing it to a designated
memory segment which can be accessed by using the output builtin. Instead of directly handling
the output pointer, one can call the ``serialize_word()`` library function which abstracts
this from the user. Note that in real applications there is only need to output information
if it's meaningful in some way for the verifier. See :ref:`here <program_output>` for more
information.

The following program outputs two values, 7 and 13.

.. tested-code:: cairo syntax_program_output

    %builtins output

    from starkware.cairo.common.serialize import serialize_word

    func main{output_ptr: felt*}() {
        serialize_word(7);
        serialize_word(13);
        return ();
    }

The following program excerpt outlines how a program may output a struct.

.. tested-code:: cairo syntax_program_output_struct

    %builtins output

    struct MyStruct {
        a: felt,
        b: felt,
    }

    func main{output_ptr: felt*}() {
        let output = cast(output_ptr, MyStruct*);
        assert [output] = MyStruct(a=3, b=4);
        let output_ptr = output_ptr + MyStruct.SIZE;
        return ();
    }

Hints
-----

Python code can be invoked with the ``%{`` ``%}`` block called a hint, which is executed right
before the next Cairo instruction. The hint can interact
with the program's variables/memory as shown in the following code sample.
Note that the hint is not actually part of the Cairo program,
and can thus be replaced by a malicious prover. We can run a Cairo program with
the ``--program_input`` flag, which allows providing a json input file that
can be referenced inside a hint.

.. tested-code:: cairo syntax_hints

    alloc_locals;
    %{ memory[ap] = 100 %}  // Assign to memory.
    [ap] = [ap], ap++;  // Increment ap after using it in the hint.
    assert [ap - 1] = 100;  // Assert the value has some property.

    local a;
    let b = 7;
    %{
        # Assigns the value '9' to the local variable 'a'.
        ids.a = 3 ** 2
        c = ids.b * 2  # Read a reference inside a hint.
    %}

Note that you can access the address of a pointer to a struct using ``ids.struct_ptr.address_``
and you can use ``memory[addr]`` for the value of the memory cell at address ``addr``.

Unpacking
---------

The values returned by a function can be ignored, or bound, to either a reference or local
variable. The ``_`` character is used to handle returned values that are ignored.
Consider the function ``foo()`` that returns two values.

.. tested-code:: cairo syntax_unpacking

    let (a, b) = foo();
    let (_, b) = foo();
    let (local a, local b) = foo();
    let (local a, _) = foo();

For more information see :ref:`return_values_unpacking`.
