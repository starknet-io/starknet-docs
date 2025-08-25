Programming in Cairo
====================

Your first function
-------------------

Let's start by looking at the following Cairo function which computes the sum of the elements of an
array:

.. tested-code:: cairo array_sum

    // Computes the sum of the memory elements at addresses:
    //   arr + 0, arr + 1, ..., arr + (size - 1).
    func array_sum(arr: felt*, size) -> felt {
        if (size == 0) {
            return 0;
        }

        // size is not zero.
        let sum_of_rest = array_sum(arr=arr + 1, size=size - 1);
        return arr[0] + sum_of_rest;
    }

The first two lines are comment lines, and are ignored by the compiler.
Comments in Cairo start with ``//`` and continue until the end of the line.

The first non-comment line ``func array_sum(arr: felt*, size) -> felt {``
defines a function named ``array_sum``
which takes two arguments: ``arr`` and ``size``.
``arr`` points to an array of ``size`` elements.
The type of ``arr`` is ``felt*`` which is a pointer
(for more information about ``felt``, see  :ref:`below <field_element>`).
The function declares that it returns a single field element (``felt``).
The scope of the function ends with the ``}`` character
(although ``}`` doesn't mean that the function returns -- you must add the ``return`` statement
explicitly).

The next line ``if (size == 0) {`` instructs Cairo to execute the code in the ``if`` statement's
body if ``size`` is zero, and skip to the end of the if statement's body otherwise.

When ``size == 0``, there are no elements in the array, and so we can return that the sum is zero.
As with other programming languages, the return statement ends the execution of the function
immediately and returns the control to the calling function.

Now to the interesting part.
The line ``let sum_of_rest = array_sum(arr=arr + 1, size=size - 1);``
(which is executed only if ``size != 0``)
makes a recursive call to ``array_sum()``, starting from the second element
(as ``arr`` points to the first memory cell of the array, ``arr + 1`` points to the second cell.
Also note that we need to pass ``size - 1``),
and stores the result in a variable named ``sum_of_rest``.
Note that you don't have to write ``arr=`` and ``size=``
but it is recommended as it increases the readability of the code.

The scope of the return values of functions is restricted
(for example, they may be revoked due to jumps or function calls).
Later, we will see how to overcome this by using local variables.
You can read more in :ref:`revoked_references`.

Finally, we return the sum of the first element with the sum of the rest of the elements.
You can use either ``arr[0]`` or ``[arr]`` for the value of the first element of the array
(``[...]`` is the dereference operator, so ``[arr]`` is the value of the memory at address ``arr``).

.. _product_exercise:

Exercise
********

Write a function that computes the product of all the even entries of an array
``(arr[0] * arr[2] * ...)``. You may assume that the length is even.
(You may want to wait with running it until you read :ref:`using_array_sum`.)

A low-level language with powerful syntactic sugar
**************************************************

Cairo is not a high-level language.
It's a low-level language with some powerful syntactic sugar to allow writing maintainable code.
The advantage is that the Cairo language allows you to write very efficient code
(you can write in the Cairo language almost anything you can run on the Cairo machine).
The main disadvantage is that in some places you'll have to know what you're doing in order to
avoid some common mistakes.
Don't worry though, this document will guide you through those delicate places.

Recursion instead of loops
**************************

You may have noticed that we've used recursion in the code above rather than
the loop structure you may have expected.
The main reason for this is that the Cairo memory is immutable --
once you write the value of a memory cell, this cell cannot change in the future.
This is similar to pure functional languages, whose objects are also immutable,
where you also have to replace loops with recursion for the same reason.

Having said that, we will note that loop structures (in some sense) are possible in Cairo,
but they are limited (you cannot call functions inside a loop, for example)
and more complicated to implement. Their only advantage is that they tend to be
slightly more efficient than recursion.

The assert statement
--------------------

The assert statement:

.. tested-code:: cairo hl_assert

    assert <expr0> = <expr1>;

which we use below, allows us to do two things: verify that two values
are the same (as you may have expected), but also to assign a value to a memory cell.
For example, ``assert [ptr] = 0;`` will set the value of the memory cell at address ``ptr`` to
``0`` (if it was not set before).
This has to do with the fact that the Cairo memory is immutable:
If the values were previously set it will function as an assert statement.
On the other hand, if the value on the left-hand side
(in some simple cases it will work with the right-hand side as well)
was not set yet, Cairo will set it, thus causing the assert to pass.

So how can I change the value of ``[ptr]`` if I already set it before?
Won't the assert statement function as an assert rather than an assignment?
The answer is that you can't -- Cairo memory is immutable, which means that once a value
was written to a memory cell, it cannot change.

You can read more in :ref:`memory_model`.

Writing a main() function
-------------------------

Before we write a ``main()`` function that will call ``array_sum()``, let's start with something
simpler:

.. tested-code:: cairo hello_world_main

    %builtins output

    from starkware.cairo.common.serialize import serialize_word

    func main{output_ptr: felt*}() {
        serialize_word(1234);
        serialize_word(4321);
        return ();
    }

There are a few new components we see here:

1.  **The function main()**:
    The ``main()`` function is the starting point of the Cairo program.

2.  **The builtin directive and the output builtin**:
    The directive ``%builtins output`` instructs the Cairo compiler that our program
    will use the "output" builtin.
    You can learn about builtins in general :ref:`here <builtins>`.
    For now we will focus on the output builtin we're using here.

    The output builtin is what allows the program to communicate with the external world.
    You can think of it as the equivalent of Python's ``print()`` or C++'s ``std::cout``.
    As with all builtins, we don't have special instructions in Cairo to use them --
    the communication with the builtin is done by reading/writing values to the memory.

    The output builtin is quite simple: Declaring it using ``%builtins`` turns the signature
    of ``main()`` to ``main{output_ptr: felt*}()``.
    The syntax ``{output_ptr: felt*}`` declares an "implicit argument", which means that
    behind the scenes, it adds both a corresponding argument and return value.
    More information about implicit arguments can be found in :ref:`implicit_arguments`.

    The argument points to the *beginning* of the memory segment to which the program output
    should be written.
    The program should then *return* a pointer that marks the *end* of the output.
    The convention we use in Cairo is that the end of a memory segment always points to the
    memory cell **after** the last written cell.
    And indeed, this is what Cairo expects of the returned value.

3.  **The function serialize_word()**:
    To write the value ``x`` to the output, we can use the library function ``serialize_word(x)``.
    ``serialize_word`` gets one argument (the value we want to write) and one implicit argument
    ``output_ptr`` (which means that behind the scenes it also returns one value).
    In fact it's quite simple: it writes ``x`` to the memory cell pointed by ``output_ptr``
    (that is, ``[output_ptr]``) and returns ``output_ptr + 1``.
    Now the implicit argument mechanism kicks in: in the first call to ``serialize_word()``
    the Cairo compiler passes the value of ``output_ptr`` as the implicit argument.
    In the second call it uses the value returned by the first call.

4.  **Import statements**:
    The line ``from starkware.cairo.common.serialize import serialize_word`` instructs
    the compiler to compile the file ``starkware/cairo/common/serialize.cairo``, and to expose
    the identifier ``serialize_word``.
    You can use ``... import serialize_word as foo`` to choose a different
    name in which you can address ``serialize_word`` in the current module.
    You can learn more about the import statement :ref:`here <imports>`.

Running the code
****************

Save the code above (with the ``main()`` function)
as ``array_sum.cairo`` (later we will change it to call ``array_sum()``),
and compile and run it using the following commands:

.. tested-code:: bash hello_world_compile

    cairo-compile array_sum.cairo --output array_sum_compiled.json

    cairo-run --program=array_sum_compiled.json \
        --print_output --layout=small

You should get:

.. tested-code:: none hello_world_output

    Program output:
      1234
      4321

The ``--layout`` flag is needed because we're using the output builtin, which is not available
in the plain layout (see :ref:`layouts`).

.. _field_element:

The primitive type - field element (felt)
-----------------------------------------

In Cairo when you don't specify a type of a variable/argument, its type is a **field element**
(represented by the keyword ``felt``).
In the context of Cairo, when we say "a field element" we mean an integer in the range
:math:`-P/2 < x < P/2` where :math:`P` is a very large (prime) number
(currently it is a 252-bit number, which is a number with 76 decimal digits).
When we add, subtract or multiply and the result is outside the range above, there is an
overflow, and the appropriate multiple of :math:`P` is added or subtracted to bring
the result back into this range (in other words, the result is computed modulo :math:`P`).

The most important difference between integers and field elements is **division**:
Division of field elements (and therefore division in Cairo) *is not* the integer division
you have in many programming languages, where the integral part of the quotient is
returned (so you get ``7 / 3 = 2``).
As long as the numerator is a multiple of the denominator,
it will behave as you expect (``6 / 3 = 2``).
If this is not the case, for example when we divide ``7/3``,
it will result in a field element ``x`` that will satisfy ``3 * x = 7``.
It won't be ``2.3333`` because ``x`` has to be an integer.
If this seems impossible, remember that if ``3 * x`` is outside the range
:math:`-P/2 < x < P/2`, an overflow will occur which can bring the result down to 7.
It's a well-known mathematical fact that unless the denominator is zero, there will always
be a value ``x`` satisfying ``denominator * x = numerator``.

Let's try it! Modify the code in ``array_sum.cairo`` as follows:

.. tested-code:: cairo hl_division_example

    %builtins output

    from starkware.cairo.common.serialize import serialize_word

    func main{output_ptr: felt*}() {
        serialize_word(6 / 3);
        serialize_word(7 / 3);
        return ();
    }

Use the commands above to run it (don't forget to compile again, or you'll get the same output
you had before). You should get:

.. tested-code:: none hl_division_example_output

    Program output:
      2
      1206167596222043737899107594365023368541035738443865566657697352045290673496

Now, edit the code to print the result of multiplying the last number by 3
and verify that you indeed get 7.

You'll see that in most of your code (unless you intend to write a very algebraic code),
you won't have to deal with the fact that the values in Cairo are field elements
and you'll be able to treat them as if they were normal integers.

.. _using_array_sum:

Using array_sum()
-----------------

Now, let's write a ``main()`` function that will use ``array_sum()``.
To do this, we will need to allocate space for the array.
This is done using the library function ``alloc()``:

.. tested-code:: cairo array_sum_main

    %builtins output

    from starkware.cairo.common.alloc import alloc
    from starkware.cairo.common.serialize import serialize_word

    func array_sum(arr: felt*, size) -> felt {
        // ...
    }

    func main{output_ptr: felt*}() {
        const ARRAY_SIZE = 3;

        // Allocate an array.
        let (ptr) = alloc();

        // Populate some values in the array.
        assert [ptr] = 9;
        assert [ptr + 1] = 16;
        assert [ptr + 2] = 25;

        // Call array_sum to compute the sum of the elements.
        let sum = array_sum(arr=ptr, size=ARRAY_SIZE);

        // Write the sum to the program output.
        serialize_word(sum);

        return ();
    }

Here we have a few additional new things:

1.  **Memory allocation**:
    We use the standard library function ``alloc()`` to allocate a new memory segment.
    In practice the exact location of the allocated memory will be determined only when the program
    terminates, which allows us to avoid specifying the size of the allocation.

2.  **Constants**:
    A constant in Cairo is defined using ``const CONST_NAME = <expr>;`` where ``<expr>``
    must be an integer (a field element, to be precise), known at compile time.

Compile and run the code (note that you'll have to copy the code of ``array_sum()`` from
the top of the page). You should get:

.. tested-code:: none array_sum_output

    Program output:
      50

.. test::

    import os
    import subprocess
    import sys
    import tempfile

    array_sum_main_code = codes['array_sum_main'].replace("""
    func array_sum(arr: felt*, size) -> felt {
        // ...
    }
    """, codes['array_sum'])

    for code, expected_output in [
        (codes['hello_world_main'], codes['hello_world_output']),
        (codes['hl_division_example'], codes['hl_division_example_output']),
        (array_sum_main_code, codes['array_sum_output']),
    ]:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Add env vars necessary for running both cairo-compile and cairo-run.
            env = {'PATH': os.environ["PATH"], 'RUNFILES_DIR': os.environ["RUNFILES_DIR"]}

            open(os.path.join(tmpdir, 'array_sum.cairo'), 'w').write(code)
            output = subprocess.check_output(
                codes['hello_world_compile'], shell=True, cwd=tmpdir, env=env).decode('ascii')
            assert output.strip() == expected_output

Exercise
********

If you haven't done so already, try to run your :ref:`product function <product_exercise>`
using the ``main()`` above. Don't forget to adjust the number of elements to an even number.
