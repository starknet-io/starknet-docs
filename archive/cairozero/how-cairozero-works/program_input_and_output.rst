Program input & output
======================

A Cairo program may have a secret input (called "program input")
and a public output (called "program output").

Let's say that you want to prove that you know the pre-image of a hash function
(that is, ``x`` such that ``hash(x) = y`` for a given ``y``).
The input will be your secret (``x``) -- the pre-image of the hash function.
The program will then compute the hash of this input, and output the result.
Since Cairo's program-output is public, everyone who gets the proof will be convinced that the
prover indeed knows a pre-image for the expected hash value.

Sometimes, a value from the program input will be copied to the program output --
consider, for example, the statement "I know that the ``n``-th Fibonacci number is ``Y``".
The program input in this case will be ``n``, and the output will be both ``n`` and ``Y`` --
because the verifier has to see what is ``n``.
Removing ``n`` from the output will result in a proof of the statement
"I know that some fibonacci number is ``Y``".

.. _program_inputs:

Program input
-------------

Adding program input to a Cairo program is easy --
you create a json file with your program input, and pass it to ``cairo-run`` using the
``--program_input`` flag.
Then you can use hints to access the content of this file using the variable ``program_input``
(recall that hints are only visible to the prover).

Exercise
********

Create an input file ``input.json`` with the following content:

.. tested-code:: json program_input

    {
        "secret": 1234
    }

Now compile and run the following program (run with ``--program_input=input.json``):

.. tested-code:: cairo program_input_code

    func main() {
        %{ memory[ap] = program_input['secret'] %}
        [ap] = [ap], ap++;
        ret;
    }

.. test::

    import json

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13
    program = compile_cairo(codes['program_input_code'], PRIME)

    runner = CairoRunner(program, layout='plain')

    runner.initialize_segments()
    end = runner.initialize_function_entrypoint('main', [])
    runner.initialize_vm(hint_locals={'program_input': json.loads(codes['program_input'])})
    runner.run_until_pc(end)

    result = runner.vm_memory[runner.vm.run_context.ap - 1]
    assert result == 1234

.. TODO(Adi, 15/02/2021): Make the following exercise external.

.. only:: internal

    Exercise
    ********

    Modify ``simple_fibonacci.cairo`` so that the first two values,
    and the length of the sequence will be given by the program input.

.. _program_output:

Program output
--------------

Adding an output to a Cairo program is slightly more complicated.
Start by adding the following directive to the top of your file
(see more on the ``%builtins`` directive :ref:`here <builtins>`):

.. tested-code:: cairo output_builtin_directive

    %builtins output

You'll need to run your program with a different layout to be able to use the output builtin.
Add ``--layout=small`` to ``cairo-run`` (see more on layouts :ref:`here <layouts>`).
Using the ``small`` layout requires the number of steps to be divisible by 512,
so you will have to run with ``--steps=512`` (which should suffice for small programs).

The ``%builtins output`` directive makes the function ``main()`` get one argument and return one
value. The argument is conventionally called ``output_ptr`` and the program should use it as a
pointer to a block of memory to which it may write its outputs.
``main()`` should return the value of the pointer after writing, signifying where the chunk of
output memory ends.

The following program writes three constant values to the output.

.. tested-code:: cairo output_builtin_example

    %builtins output

    func main(output_ptr: felt*) -> (output_ptr: felt*) {
        [ap] = 100;
        [ap] = [output_ptr], ap++;

        [ap] = 200;
        [ap] = [output_ptr + 1], ap++;

        [ap] = 300;
        [ap] = [output_ptr + 2], ap++;

        // Return the new value of output_ptr, which was advanced
        // by 3.
        [ap] = output_ptr + 3, ap++;
        ret;
    }

Note that ``output_ptr`` is the value of the output pointer,
while ``[output_ptr]`` is the value it points to.
Also note that ``[output_ptr] = 100`` is not a valid Cairo instruction,
so we split it into two instructions (for the list of instructions see :ref:`basic_instructions`).

.. TODO(Adi, 15/02/2021): Make the following exercise external.

.. only:: internal

    Exercise
    ********

    Modify ``simple_fibonacci.cairo`` to output the length of the sequence and the final value.
