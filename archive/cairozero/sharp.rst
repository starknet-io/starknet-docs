Using SHARP (Shared Prover)
===========================

SHARP (formerly known as GPS) is a service that generates proofs attesting to the validity of
the executions of Cairo programs. Then, it sends those proofs to an Ethereum testnet (Goerli) where
they are verified by a smart contract.
You can read more in
`Cairo for Blockchain Developers <https://www.cairo-lang.org/cairo-for-blockchain-developers/>`_
and in
`Playground & GPS Alpha <https://www.cairo-lang.org/playground-gps-alpha/>`_.

To send a proof you can use the ``cairo-sharp`` command line utility.
It allows you to send programs to SHARP and to query their status, until they are successfully
verified on-chain.

Sending a program to SHARP
--------------------------

Let's create a small program (proving that you know the square root of a given number)
to send to SHARP. Create a file named ``sharp_test.cairo`` with the following code:

.. tested-code:: cairo sharp_program

    %builtins output

    func main(output_ptr: felt*) -> (output_ptr: felt*) {
        alloc_locals;
        local x;
        %{ ids.x = program_input['x'] %}
        assert [output_ptr] = x * x;
        return (output_ptr=output_ptr + 1);
    }

Create a file named ``input.json`` with the program input:

.. tested-code:: json sharp_input

    {
        "x": 17
    }

The following command will compile the program, run it on the given input and send
it to SHARP. Make sure you have the latest version of the cairo-lang package installed
(currently, $[VERSION]), see :ref:`quickstart`.

.. code-block:: bash

    cairo-sharp submit --source sharp_test.cairo \
        --program_input input.json

The output should look like:

.. code-block:: none

    Compiling...
    Running...
    Submitting to SHARP...
    Job sent.
    Job key: 1f38cbf0-7153-4114-9442-44501bfed8eb
    Fact: 0xf457e4311f8229ab7b08191a6658112a29a962a9f2fe95d7a3d4f1200eef0195

The job key is a unique identifier assigned to your job by SHARP.
The fact is the result of a hash function on the program hash and the program output
(which in our case includes the square of :math:`x`).
See `Playground & GPS Alpha <https://www.cairo-lang.org/playground-gps-alpha/>`_.

You can now use the job key to query the state of the job in the SHARP service:

.. code-block:: bash

    cairo-sharp status 1f38cbf0-7153-4114-9442-44501bfed8eb

Once the status of your job is ``PROCESSED``, it means that it was sent to the blockchain for
verification.
To see if when your fact is successfully registered you can use ``cairo-sharp is_verified``
(make sure to use the job's fact and not the job key and to supply the URL of an Ethereum node):

.. code-block:: bash

    cairo-sharp is_verified \
        0xf457e4311f8229ab7b08191a6658112a29a962a9f2fe95d7a3d4f1200eef0195 \
        --node_url=<URL_of_an_Ethereum_node>

.. TODO(lior, 08/02/2022): Consider adding a link to Etherscan.
