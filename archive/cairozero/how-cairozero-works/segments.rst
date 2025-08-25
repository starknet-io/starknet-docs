.. _segments:

Segments
========

Rationale
---------

As you may recall, the memory of a Cairo program has to be :ref:`continuous<continuous_memory>`.
However, some parts of the program may be individually continuous but vary in length in ways that
are only computed at runtime -- in fact, their size can only be known after the program
terminates.

For this purpose, during the run of the Cairo VM, it's useful to treat the memory as a list of
continuous *segments*, which are concatenated to form one continuous chunk at the end of the run,
when their final sizes can be calculated.


Relocatable values
------------------

The absolute address of every memory cell within a segment can only be determined at the end of a
VM run. Because these addresses can be stored in memory cells themselves, the VM needs a way to
refer to them. This is achieved using *relocatable values*, represented as ``<segment>:<offset>``,
where ``<segment>`` is the segment number, assigned arbitrarily at the start of the run, and
``<offset>`` is the offset of the memory cell within the segment.

Note that because segment numbers are assigned arbitrarily, the number is not guaranteed to
represent the same segment across different programs or even in different runs of the same
program.

Uses
----

The program and execution segments
**********************************

Cairo programs are themselves kept in memory, in what is called the *program segment*. This
segment is of fixed length and contains the numeric representation of the Cairo program.
The program counter ``pc`` starts at the beginning of the program segment.

In addition to this, any Cairo program requires an *execution segment*. This is where the
registers ``ap`` and ``fp`` start, and where data generated during the run of a Cairo program
(variables, return addresses for function calls, etc.) is stored.

The length of the execution segment is variable, as it depends, for example, on the
program input.

Builtin segments
****************

As you'll see in the :ref:`builtins` section, every builtin receives its own continuous area in
memory. This memory is located in its own segment, which is variable in length.

Example
-------

Compile the following code and run it with
``--layout=small --print_memory --print_info --print_segments`` (and without ``--relocate_prints``):

.. tested-code:: cairo segments_example

    %builtins output

    func main(output_ptr: felt*) -> (output_ptr: felt*) {
        [ap] = output_ptr, ap++;
        %{
            print('ap =', ap)
            print('[ap - 1] =', memory[ap - 1])
            print()
        %}
        assert [output_ptr] = 12;
        return (output_ptr=output_ptr + 1);
    }

Segments appear in the output in a few places. First, the hint output:

.. tested-code:: text segments_output0

    ap = 1:4
    [ap - 1] = 2:0

The hint prints the value of ``ap`` and then the value of the memory cell at ``ap - 1``, to which
``output_ptr`` was assigned in the line above. Observe that the value of the ``ap`` register is
the relocatable value ``1:4``. Usually, segment ``1`` is the execution segment (recall that ``ap``
starts in the execution segment). On the other hand, the value it points to, the output builtin
pointer, is located in its own segment ``2``.

Segments appear again in the memory output:

.. tested-code:: text segments_output1

    Addr  Value
    -----------
    ⋮
    0:0   5191102247248822272
    0:1   5189976364521848832
    0:2   12
    0:3   4612389708016484351
    0:4   5198983563776458752
    0:5   1
    0:6   2345108766317314046
    ⋮
    1:0   2:0
    1:1   3:0
    1:2   4:0
    1:3   2:0
    1:4   12
    1:5   2:1
    ⋮
    2:0   12

    Program output:
      12

    Number of steps: 5 (originally, 5)
    Used memory cells: 14
    Register values after execution:
    pc = 4:0
    ap = 1:6
    fp = 3:0


The memory is divided into three segments:

*   Segment ``0``: the program segment. This segment contains the compiled bytecode of the program.

*   Segment ``1``: the execution segment. This segment contains the values saved in memory during
    the run of the program. Observe that most of these represent pointers and are thus relocatable
    values themselves. The constant ``12``, which appears twice, is the only exception.

*   Segment ``2``: the output builtin segment. This segment contains the only value written to
    the output, ``12``.

The final values of the registers are also relocatable. ``ap`` remains in the execution segment,
while the return values of ``fp`` and ``pc`` are given their own segments for technical reasons.


Finally, the segment relocation table describes the real addresses of the beginning of the segments
after relocation:

.. tested-code:: text segments_output2

    Segment relocation table:
    0     1
    1     8
    2     14
    3     15
    4     15

Segments ``3-4`` are the empty segments used for the return values of ``fp`` an ``pc``.
Observe that each segment's beginning is mapped to the sum of the lengths of the previous
segments. This keeps the entire memory continuous.

Exercise
--------

Run the same program again, this time with the flag ``--relocate_prints``, which will print
the same values after relocation.

*   Convince yourself that the relocated memory and register values indeed correspond to the
    relocatable values, relocated according to the segment relocation table.

*   Why are the values printed from the hint (the top two lines) still relocatable? Is it possible
    to print their relocated value from the same hint?

.. test::

    import os
    import sys
    import subprocess
    import tempfile

    with tempfile.TemporaryDirectory() as tmpdir:
        # Add env vars necessary for running both cairo-compile and cairo-run.
        env = {'PATH': os.environ["PATH"], 'RUNFILES_DIR': os.environ["RUNFILES_DIR"]}

        open(os.path.join(tmpdir, 'segments.cairo'), 'w').write(codes['segments_example'])
        output = subprocess.check_output(
            'cairo-compile segments.cairo --output segments.json\n'
            'cairo-run --program=segments.json --print_output '
            '--layout=small --print_memory --print_info --print_segments',
            shell=True, cwd=tmpdir, env=env).decode('utf8')

        actual_output_lines = [line.strip() for line in output.splitlines() if line.strip()]
        expected_output = '\n'.join([codes[f'segments_output{i}'] for i in range(3)])
        expected_output_lines = [
            line.strip() for line in expected_output.splitlines() if line.strip()
        ]
        assert actual_output_lines == expected_output_lines
