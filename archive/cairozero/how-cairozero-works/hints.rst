.. _hints:

Hints
=====

Introduction
------------

Cairo supports nondeterministic instructions.
For example, to compute the root of 25 one may simply write:

.. tested-code:: cairo sqrt_no_hints

    [ap] = 25, ap++;
    [ap - 1] = [ap] * [ap], ap++;

While this is fine for the verifier, the prover cannot handle such an expression implicitly
(for example, the value can be both 5 or -5) and we have to instruct it what to do in order
to compute the root. This is done by adding what we call 'hints'.
A hint is a block of Python code, that will be executed by the prover right before the next
instruction.

The format is as follows:

.. tested-code:: cairo sqrt_with_hint

    [ap] = 25, ap++;
    %{
        import math
        memory[ap] = int(math.sqrt(memory[ap - 1]))
    %}
    [ap - 1] = [ap] * [ap], ap++;

To access ``[ap]`` in the hint we use the syntax ``memory[ap]``
(note that while ``[ap]`` is a valid Cairo expression,
it is not a valid expression in Python).
In addition, if we want to access a Cairo constant, ``x``, in a hint, we use the expression
``ids.x``. Function arguments and references, can be accessed in the same way.

Note that a hint is attached to the next instruction and executed before each execution
of the corresponding instruction. The hint is not an instruction on its own. Thus,

.. tested-code:: cairo hints2

    %{ print("Hello world!") %}
    jmp rel 0;  // This instruction is an infinite loop.

will print ``Hello world`` infinitely many times
(rather than printing once and then starting an infinite loop).

Exercise
********

Make the code in the example above (of computing the square root) compile,
and then run it. Then change the hint to:

.. code-block:: none

    memory[ap] = int(math.sqrt(memory[ap - 1])) + 1

You should get an ``An ASSERT_EQ instruction failed`` error.
Make sure you understand it.

Exercise
********

What is the difference between the following code segments?

.. tested-code:: cairo hints_exercise1

    [ap] = 25, ap++;
    %{
        import math
        memory[ap] = int(math.sqrt(memory[ap - 1]))
    %}
    [ap - 1] = [ap] * [ap], ap++;

and

.. tested-code:: cairo hints_exercise2

    [ap] = 25, ap++;
    [ap] = 5;
    [ap - 1] = [ap] * [ap], ap++;

Split your answer into two parts: the difference from the prover's point of view
and the difference from the verifier's point of view.

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13

    def get_code(name):
        return f'func main() {{\n{codes[name]}\n ret; \n }}'

    assert codes['hints_exercise1'] == codes['sqrt_with_hint']

    program_sqrt_no_hints = compile_cairo(get_code('sqrt_no_hints'), PRIME, debug_info=True)
    program_sqrt_with_hint = compile_cairo(get_code('sqrt_with_hint'), PRIME, debug_info=True)
    assert program_sqrt_no_hints.data == program_sqrt_with_hint.data

    program_hints_exercise2 = compile_cairo(get_code('hints_exercise2'), PRIME, debug_info=True)

    for program in [program_sqrt_with_hint, program_hints_exercise2]:
        runner = CairoRunner(program, layout='small')
        runner.initialize_segments()
        end = runner.initialize_main_entrypoint()
        runner.initialize_vm(hint_locals={})
        runner.run_until_pc(end)

        assert runner.vm_memory[runner.vm.run_context.ap - 1] == 5
