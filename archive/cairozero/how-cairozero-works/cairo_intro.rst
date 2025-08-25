Introduction to Cairo
=====================

.. _field_elements:

Field elements
--------------

In modern CPUs, the basic data type is a 64-bit integer. Mathematically, we can think of it
as doing our computations modulo :math:`2^{64}`.
For example, :math:`-17` is represented as
:math:`2^{64} - 17` and indeed :math:`-17 \equiv 2^{64} - 17 \pmod{2^{64}}`
and if we multiply :math:`2^{63}` by 2 we get 0.

In Cairo, the basic data type is an integer in the range :math:`0 \leq x < P`
where :math:`P` is a prime number
(for example, :math:`P = 2^{251} + 17 \cdot 2^{192} + 1` is a standard choice).
All the computations are done modulo :math:`P`.

In some cases, it has no effect on the code: If you're writing a loop that
sums the values :math:`1, 2, 3, \ldots, 1000`, no overflow will occur and the computation
will result in the expected value
(note that :math:`P` may be much larger than :math:`2^{64}`, so extremely large values
may be represented in one element). In some cases, you will have to prevent overflow
as you would in regular CPUs.

On the other hand, there are cases where working modulo :math:`P` requires more caution:

1.  Division -- Unlike regular CPUs where integer division ``x / y`` is defined as
    :math:`\lfloor x / y \rfloor`
    (so ``7 / 2 = 3``) and it may or may not satisfy the equation ``(x / y) * y == x``,
    in Cairo, the result of ``x / y`` is defined to always
    satisfy the equation ``(x / y) * y == x``. If ``y`` divides ``x`` as integers,
    you will get the expected result in Cairo (for example ``6 / 2`` will indeed result in 3).
    But when ``y`` does not divide ``x``, you may get a surprising result:
    For example, since :math:`2 \cdot \frac{P + 1}{2} = P + 1 \equiv 1 \pmod{P}`, the value of
    ``1 / 2`` in Cairo is :math:`\frac{P + 1}{2}` (and not 0 or 0.5).

2.  Checking if a value is even: In regular CPU if you take a value `x` and multiply it by 2,
    the result is always even. This does not hold in Cairo -- as we saw before, if we take
    :math:`\frac{P + 1}{2}` and multiply by 2 we get 1, which is an odd number.
    In fact, this property works "by accident" in CPUs. If we try to generalize it slightly it fails
    even there -- multiplying ``x`` by 3 does not always results in a number divisible by 3
    (try running the following c++ code: ``std::cout << 12297829382473034411U * 3 << std::endl;``).

Nondeterministic computation
-----------------------------

As the goal of a Cairo program is to prove that some computation is correct,
we can sometimes take shortcuts. Consider for example that our goal is to prove
that the square root, :math:`y`, of :math:`x = 961`
is in the range :math:`0, 1, \ldots, 100`.
The straight-forward way would be to write a complicated code that starts from
961, computes its root and verifies that this root is in the required range.
But we can do something much easier, simply show that if we start with 31 and
square it we get 961 (and verify that 31 is in the range).
This means that instead of starting with the input (961) we can start from the solution (31).
We refer to this method as nondeterministic computation
(you can learn more `here <https://en.wikipedia.org/wiki/NP_(complexity)>`_).

The pseudocode will take the following form:

1. Magically guess the value of :math:`y` (this is the nondeterministic part).
2. Compute :math:`y^2` and make sure the result is equal to :math:`x`.
3. Verify :math:`y` is in the range.

You will learn more about how to write Cairo programs that take advantage of
this ability in the sections :ref:`hints` and :ref:`non_deterministic_jumps`.

Exercise
********

1.  Write nondeterministic pseudocode for proving that the equation
    :math:`x^7 + x + 18 = 0` has a solution.
2.  Write nondeterministic pseudocode for proving that the same equation
    has at least two different solutions.

.. _memory_model:

Memory model
------------

Cairo supports a read-only nondeterministic memory, which means that the value for each memory
cell is chosen by the prover, but it cannot change over time (during a Cairo program execution).
We use the syntax ``[x]`` to represent the value of the memory at address ``x``.
The above implies, for example, that if we assert that ``[0] = 7`` at the beginning of a program,
then the value of ``[0]`` will be ``7`` during the entire run.

It is usually convenient to think of the memory as a write-once memory:
you may write a value to a cell once,
but you cannot change it afterwards.
Thus, we may interpret an instruction that asserts that ``[0] == 7`` either as
"read the value from the memory cell at address 0 and verify that you got 7" or
"write the value 7 to that memory cell" depending on the context
(in the read-only nondeterministic memory model they mean the same thing).

.. _registers:

Registers
---------

The only values that may change over time are held within designated registers:

*   ``ap`` (allocation pointer) - points to a yet-unused memory cell.
*   ``fp`` (frame pointer) - points to the frame of the current function. The addresses of all the
    function's arguments and local variables are relative to the value of this register.
    When a function starts, it is equal to ``ap``. But unlike ``ap``, the value of ``fp``
    remains the same throughout the scope of a function.
    You will learn more about ``fp`` in :ref:`fp_register`.
*   ``pc`` (program counter) - points to the current instruction.

.. _basic_instructions:

Basic instructions
------------------

A simple Cairo instruction takes the form of an assertion for equality. For example::

    [ap] = [ap - 1] * [fp], ap++;

states that the product of two memory cells (``[ap - 1]`` and ``[fp]``) must be the same as the
value of the next unused cell (``[ap]``).
We think of this as "writing" the product of the two values into ``[ap]``.
The suffix ``ap++`` tells Cairo to increase ``ap`` by one after performing the instruction
(to change ``ap`` in any way other than ``ap++``, you must use the designated instruction
``ap += ...``). ``ap++`` is not an instruction on its own - it is part of the instruction
that appears before the comma. The comma syntax is unique to ``ap++`` and cannot be
used to separate two instructions.

The following list demonstrates what are the valid assert-equal instructions we have in Cairo:

.. tested-code:: cairo instruction_examples

    [fp - 1] = [ap - 2] + [fp + 4];
    [ap - 1] = [fp + 10] * [ap], ap++;
    [ap - 1] = [fp + 10] + 12345, ap++;  // See (a) below.
    [fp + 2] = [ap + 5];
    [fp + 2] = 12345;
    [ap + 2] = [[ap + 5]];  // See (b) below.
    [ap] = [fp - 3] - [ap + 4];  // See (c) below.
    [ap] = [fp - 3] / [ap + 4];  // See (c) below.

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    program = compile_cairo(codes['instruction_examples'], PRIME)

a.  There are two types of integers that may appear in an instruction:

    *   Immediates, which can either serve as the second operands in a given operation
        (such as ``12345`` in ``[ap - 1] = [fp + 10] + 12345;``) or as a standalone value for
        assignment (such as ``[fp + 2] = 12345;``).

    *   Offsets, which appear inside brackets
        (such as ``5`` in ``[ap + 5]`` or ``-3`` in ``[fp - 3]``).

    An immediate can be any field element, while an offset is limited to the range
    :math:`[-2^{15}, 2^{15})`.

b.  The instruction ``[ap + 2] = [[ap + 5]];`` is a double dereference instruction where you take the
    value ``[ap + 5]`` and regard it as an address to the memory.

c.  These instructions are syntactic sugar -- they are replaced by
    ``[fp - 3] = [ap] + [ap + 4];`` and ``[fp - 3] = [ap] * [ap + 4];`` respectively.

Cairo also supports a high-level syntax which allows the user to write statements involving more
than one operation, as you'll see in :ref:`assert_statement`.

.. _a_simple_cairo_program_exercise:

Exercise - A simple Cairo program
*********************************

Write a program poly.cairo that computes the expression:

.. math::

    x^3 + 23x^2 + 45x + 67, \quad x=100


1.  After the program ends, the value should be at ``[ap - 1]``.

2.  For this exercise, you may assume that the ``fp`` register is constant and initialized to
    the same value as ``ap``.

Use the following template:

.. tested-code:: cairo exercise_template

    func main() {
        [ap] = 100, ap++;
        // << Your code here >>

        ret;
    }

3.  Your code shouldn't depend on the value of ``x``.

4.  Bonus: This can be done using 5 instructions, not counting the ones given in the template.

5.  Compile with ``cairo-compile`` and inspect the output.
    The output should be in ``poly_compiled.json``.


6.  Run the program (this will invoke the Cairo VM):

    .. tested-code:: none cairo_intro_run_cmd

        cairo-run \
        --program=poly_compiled.json --print_memory --print_info \
        --trace_file=poly_trace.bin --memory_file=poly_memory.bin \
        --relocate_prints

    Take a look at the output: You should see the memory values
    (the last cell should be 1234567).
    Verify that you understand what's going on there.

.. test::

    import os
    import subprocess
    import sys
    import tempfile

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13
    YOUR_CODE_HERE = '// << Your code here >>'
    assert YOUR_CODE_HERE in codes['exercise_template']
    code = codes['exercise_template'].replace(YOUR_CODE_HERE, """
       [ap] = [ap - 1] + 23, ap++;
       [ap] = [ap - 1] * [ap - 2], ap++;
       [ap] = [ap - 1] + 45, ap++;
       [ap] = [ap - 1] * [ap - 4], ap++;
       [ap] = [ap - 1] + 67, ap++;
    """)
    program = compile_cairo(code, PRIME)

    runner = CairoRunner(program, layout='plain')

    runner.initialize_segments()
    end = runner.initialize_function_entrypoint('main', [])
    runner.initialize_vm(hint_locals={})
    runner.run_until_pc(end)

    result = runner.vm_memory[runner.vm.run_context.ap - 1]
    assert result == 1234567

    with tempfile.TemporaryDirectory() as tmpdir:
        # Add env vars necessary for running both cairo-compile and cairo-run.
        env = {'PATH': os.environ["PATH"], 'RUNFILES_DIR': os.environ["RUNFILES_DIR"]}

        open(os.path.join(tmpdir, 'test.cairo'), 'w').write(code)
        compile_cmd = f"""\
    cairo-compile test.cairo \
    --prime=3618502788666131213697322783095070105623107215331596699973092056135872020481 \
    --output=poly_compiled.json"""
        subprocess.check_output(compile_cmd, shell=True, cwd=tmpdir, env=env)
        subprocess.check_output(codes['cairo_intro_run_cmd'], shell=True, cwd=tmpdir, env=env)

.. _continuous_memory:

Continuous memory
-----------------

Cairo has a technical requirement that memory addresses accessed by a program
must be continuous. For example, if addresses 7 and 9 are accessed,
then 8 must also be accessed before the end of the program (the order of access doesn't matter).
If small gaps in the address range are present, the prover will automatically fill those addresses
with arbitrary values.
Generally, having such gaps is inefficient, as it means memory is being consumed without being used.
Introducing too many holes could make the generation of a proof too expensive for an honest prover
to perform.
However, this still does not violate the soundness guarantee -- a false proof cannot be generated
regardless.

Exercise
********

1.  Run the following program:

    .. Add compile & run test.

    .. tested-code:: cairo cairo_intro_exercise

        func main() {
            [ap] = 100;
            [ap + 2] = 200;
            ret;
        }

    Explain why the execution of this program creates a memory gap, and therefore an inefficiency
    (given what you've just read in the above section).
    Add one instruction at the end of the function (just before ``ret``) so that there won't be a
    memory gap.

2.  What's wrong with the following code?

    .. tested-code:: cairo cairo_intro_exercise2

        func main() {
            [ap] = 300;
            [ap + 10000000000] = 400;
            ret;
        }

