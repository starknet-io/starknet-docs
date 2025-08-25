.. _non_deterministic_jumps:

Nondeterministic jumps
======================

We can now describe a code pattern, called "nondeterministic jumps",
that combines :ref:`conditional_jumps`
and :ref:`hints`.
A nondeterministic jump is a jump instruction that may or may not be executed,
according to the **prover's** decision (rather than according to a condition on values which
were computed before).
To do this, use the Cairo instruction:

.. tested-code:: cairo nondeterministic_jump_example0

    jmp label if [ap] != 0, ap++;

The idea is to use an unused memory cell (``[ap]``) to decide whether or not to jump.
Do not forget to increase ``ap`` to make sure the following instructions will not use this memory
cell.

As with every nondeterministic instruction, a hint must be attached to let the prover know whether
to jump or not. For example:

.. tested-code:: cairo nondeterministic_jump_example1

    %{ memory[ap] = 1 if x > 10 else 0 %}
    jmp label if [ap] != 0, ap++;

Exercise
********

The following code tries to compute the expression :math:`\lfloor x / 2 \rfloor` using the formula

.. math::

    \lfloor x / 2 \rfloor =
    \begin{cases}
    x / 2, & \text{$x$ is even} \\
    (x - 1) / 2, & \text{$x$ is odd} \\
    \end{cases}

(recall that since we're :ref:`working in a field <field_elements>`,
the operation ``/ 2`` is division by 2 in the field,
rather than integer division).

Can you explain what's wrong with the following code?

.. tested-code:: cairo div2_exercise

    func div2(x) {
        %{ memory[ap] = ids.x % 2 %}
        jmp odd if [ap] != 0, ap++;

        even:
        // Case x % 2 == 0.
        [ap] = x / 2, ap++;
        ret;

        odd:
        // Case x % 2 == 1.
        [ap] = x - 1, ap++;
        [ap] = [ap - 1] / 2, ap++;
        ret;
    }

In :ref:`integer_division` you will see how to implement this function using the range-check
builtin.

.. toggle:: Hint

    Consider the verifier point of view. Can you give an example of what a malicious prover
    can do so that ``div2`` will return the wrong value?

.. toggle:: Hint2

    Try to change the hint to ``%{ memory[ap] = 1 - (ids.x % 2) %}`` and see what happens when you
    call div2(2). Do you get the expected result (1)?

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13
    program = compile_cairo(codes['div2_exercise'], PRIME)

    for x in [113, 114]:
        runner = CairoRunner(program, layout='plain')
        runner.initialize_segments()
        end = runner.initialize_function_entrypoint('div2', [x])
        runner.initialize_vm(hint_locals={})
        runner.run_until_pc(end)
        assert runner.vm.run_context.memory[runner.vm.run_context.ap - 1] == x // 2
