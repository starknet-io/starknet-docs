.. _debugging_tricks:

Debugging-related flags
=======================

.. TODO(lior, 15/08/2022): Add an exercise and some tests.

Below are some flags for ``cairo-run`` that you may use to debug errors in your program. In addition
to these flags, you can always add a :ref:`hint <hints>` with a print statement to output the value
of a certain identifier or a memory cell.

``--print_info``
----------------

Instructs ``cairo-run`` to print the info section, which contains the following information:

1. The number of executed steps.
2. The number of used memory cells.
3. The values of the registers at the end of the execution.
4. The segment relocation table.

Note that you may see values of the form ``x:y`` in the output (e.g., ``4:2``).
Those are relocatable values, see :ref:`segments` for more information.

``--print_memory``
------------------

Prints the addresses and values of the memory cells that were assigned during execution.

If you get an error that refers to a specific memory cell, it may be helpful to examine
the value of that cell and the adjacent memory cells.

``--steps``
-----------

You can control the number of steps that ``cairo-run`` performs using the
``--steps`` flags. This is an optional parameter -- if you don't specify it,
``cairo-run`` will run until the program ends (after the ``ret`` instruction called by ``main()``).

``--no_end``
------------

If you specify an exact number of steps, and the program does not end within that number of
steps, ``cairo-run`` will throw an error (``End of program was not reached``).
You can instruct ``cairo-run`` to ignore this using the ``--no_end`` flag.
Specifying the number of steps, combined with the ``--no_end`` flag can be used to debug a
program, as it allows you to examine the values of the memory and registers after the program has
run the specified amount of steps.

``--debug_error``
-----------------

When an error occurs, the memory and the info sections are not printed by default.
You may use the ``--debug_error`` to print them anyway.
The idea is that by examining the values of the memory and the info sections, you may be able
to better understand the source of the error.

``--profile_output profile.pb.gz``
----------------------------------

Outputs a profile result file that can be viewed with `pprof <https://github.com/google/pprof>`_.
If you have ``go`` installed you can view the result using:

.. code-block:: bash

    go tool pprof --web profile.pb.gz

Alternatively, you can use the ``golang`` docker image (you'll need to install docker first):

.. code-block:: bash

    docker run --net=host -v$PWD:/tmp starkwarelibs/pprof profile.pb.gz

Or build the docker image manually using this docker file:

.. code-block:: bash

    FROM golang
    RUN apt update
    RUN apt install -y graphviz
    WORKDIR /tmp
    ENTRYPOINT ["go", "tool", "pprof", "--http", "localhost:8080", "--no_browser"]
