The program counter (pc)
========================

Program counter and jumps
-------------------------

The program is stored in memory, where each instruction takes 1 or 2 field elements
(for example, when an immediate value is used in the instruction, it takes 2 field elements,
where the second one is the immediate value).

The program counter (``pc``) keeps the address of the current instruction.
Usually it advances by 1 or 2 per instruction according to the size of the instruction
(when the current instruction occupies two field elements, the program counter advances by 2 for
the next instruction).

A ``jmp`` instruction may be used to jump to a different instruction.
``jmp`` is available in three flavors:

1.  Absolute jump: jumps to a given address (by changing the program counter to the given value).
    For example, ``jmp abs 17;`` will change ``pc`` to 17.

2.  Relative jump: jumps to an offset from the current instruction.
    For example, ``jmp rel 17;`` will change ``pc`` to ``pc + 17``.
    Note that ``pc`` refers to the value of the program counter of the current instruction.
    Thus, a special case is the instruction ``jmp rel 0;`` which jumps to itself,
    thus creating an infinite loop.

3.  Jump to a label: this translates to a relative jump where the Cairo compiler is automatically
    computing the difference between the current instruction and the label.
    This is the most useful (and readable) jump.

.. _my_loop_exercise:

Exercise
********

What does the following code do? (run with ``--no_end --step=16`` to avoid the
``End of program was not reached`` error)

.. tested-code:: cairo exercise_code

    func main() {
        [ap] = 2, ap++;

        my_loop:
        [ap] = [ap - 1] * [ap - 1], ap++;
        [ap] = [ap - 1] + 1, ap++;
        jmp my_loop;
    }

.. test::

    import os
    import subprocess
    import sys
    import tempfile
    with tempfile.TemporaryDirectory() as tmpdir:
      open(os.path.join(tmpdir, 'test.cairo'), 'w').write(codes['exercise_code'])
      compile_cmd = f"""
      cairo-compile test.cairo \
      --prime 3618502788666131213697322783095070105623107215331596699973092056135872020481 \
      --output test_compiled.json
      """
      subprocess.check_output(compile_cmd, shell=True, cwd=tmpdir)
      run_cmd = f"""
      cairo-run \
      --program=test_compiled.json \
      --steps=16 \
      --no_end \
      --print_memory
      """
      output = subprocess.check_output(run_cmd, shell=True, cwd=tmpdir)
      # Sanity check. Make sure 210066388901 appears in the output.
      assert b'210066388901' in output


Bonus exercise
**************

What happens in the following code?
(you can start by running it and looking at the memory; note that you will need the
``--no_end`` flag)

.. tested-code:: cairo pc_exercise

    func main() {
        [fp + 1] = 2, ap++;
        [fp] = 5201798304953761792, ap++;
        jmp rel -1;
    }

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13

    program = compile_cairo(codes['pc_exercise'], PRIME, debug_info=True)
    runner = CairoRunner(program, layout='small')

    runner.initialize_segments()
    runner.initialize_main_entrypoint()
    runner.initialize_vm(hint_locals={})
    runner.run_for_steps(16)

    assert [runner.vm_memory[runner.vm.run_context.fp + i] for i in range(1, 8)] == \
        [2, 4, 8, 16, 32, 64, 128]

.. _conditional_jumps:

Conditional jumps
-----------------

Another important type of instruction is the conditional jump.
The syntax of the instruction is ``jmp <label> if [<expr>] != 0;``
where ``<expr>`` is either ``ap + offset`` or ``fp + offset`` (``offset`` may be omitted).
If the corresponding memory cell is not zero,
the Cairo machine will jump to the given label. Otherwise,
it will continue to the next instruction normally.
Instead of using a label, you may also use ``rel <expr>`` in a similar way to
a regular jump (for example ``jmp rel 17 if [ap - 1] != 0;``).

Exercise
********

Edit the loop ``my_loop`` in the :ref:`exercise above <my_loop_exercise>`
so that it starts by writing 10 to ``[ap]``,
continues by writing the decreasing sequence :math:`9, 8, 7, \ldots, 0`
and then returns. Don't forget the ``ret`` instruction.
Verify that your code works as expected by looking at the memory.
