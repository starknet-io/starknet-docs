Object allocation
=================

Cairo has a few ways of storing an object in memory and getting a pointer
to it (which can be used by other functions):

*   Memory segment allocation: The :ref:`alloc() <alloc>` function can be used
    to create an arbitrary-length array.
*   Single item allocation: The :ref:`new <new_operator>` operator initializes a single item
    and returns a pointer to it.
*   Local variables: You can allocate a local variable and retrieve its address.
    See :ref:`retrieving_registers`.

.. _alloc:

alloc()
-------

The standard library function ``alloc()`` may
be used to "dynamically" allocate a new memory segment (see :ref:`segments`).
This segment can be used to store an array or a single element.

For example:

.. tested-code:: cairo alloc_example

    from starkware.cairo.common.alloc import alloc

    func foo() {
        let (struct_array: MyStruct*) = alloc();

        // Set the first three elements.
        assert struct_array[0] = MyStruct(a=1, b=2);
        assert struct_array[1] = MyStruct(a=3, b=4);
        assert struct_array[2] = MyStruct(a=5, b=6);
        return ();
    }

.. _new_operator:

The "new" operator
------------------

The ``new`` operator takes an expression and pushes it onto the stack and returns a pointer to
the memory address of that object. For example:

.. tested-code:: cairo new_operator0

    func foo() {
        tempvar ptr: MyStruct* = new MyStruct(a=1, b=2);
        assert ptr.a = 1;
        assert ptr.b = 2;
        return ();
    }

Note that unlike ``alloc()``, which allocates a new memory segment, the ``new`` operator
creates the object in the execution segment (see :ref:`segments`). Since memory in Cairo is never
freed, both approaches have a similar outcome -- you can use the pointer even after the function
ends.
On the other hand, this means that the ``new`` operator can't be used for an arbitrary-sized arrays.
The ``new`` operator is useful since it allows you to allocate the memory and initialize the object
in one instruction. In fact, you can use multiple ``new`` operators in the same line if necessary.

This is theoretically equivalent to the following code:

.. tested-code:: cairo new_operator_equiv

    tempvar obj: MyStruct = MyStruct(a=1, b=2);
    tempvar ptr: MyStruct* = &obj;

However, ``&obj`` is currently not supported for ``tempvar``, so this code does not compile.

You can use ``new`` to allocate a fixed-size array using tuples:

.. tested-code:: cairo new_operator1

    func foo() {
        tempvar arr: felt* = new (1, 1, 2, 3, 5);
        assert arr[4] = 5;
        return ();
    }

For arrays of structs you'll need to explicitly cast the pointer:

.. tested-code:: cairo new_operator2

    func foo() {
        tempvar arr: MyStruct* = cast(
            new (MyStruct(a=1, b=2), MyStruct(a=3, b=4)), MyStruct*
        );
        assert arr[1].a = 3;
        return ();
    }

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner

    PRIME = 2**64 + 13

    my_struct = """
        struct MyStruct {
            a: felt,
            b: felt,
        }
    """

    for code_name in ["alloc_example", "new_operator0", "new_operator1", "new_operator2"]:
        program = compile_cairo(my_struct + codes[code_name], PRIME)
        runner = CairoFunctionRunner(program)
        runner.run("foo")

    code = f"""
        {my_struct}
        func foo() {{
            alloc_locals;
            let __fp__ = 0;
            {codes["new_operator_equiv"].replace("tempvar", "local")}
            ret;
        }}
    """
    compile_cairo(code, PRIME)
