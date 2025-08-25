Define word
-----------

The ``dw`` keyword compiles to a single field element of data directly in the code. For example:

.. tested-code:: cairo dw_single

    dw 0x123;

will be translated to the field element ``0x123`` in the bytecode.
This is not really an instruction, and therefore should not be in any execution path.
A common use for this is constant arrays:

.. tested-code:: cairo dw_example

    from starkware.cairo.common.registers import get_label_location

    // Returns a pointer to the values: [1, 22, 333, 4444].
    func get_data() -> (data: felt*) {
        let (data_address) = get_label_location(data_start);
        return (data=cast(data_address, felt*));

        data_start:
        dw 1;
        dw 22;
        dw 333;
        dw 4444;
    }

    func main() {
        let (data) = get_data();
        tempvar value = data[2];
        assert value = 333;
        return ();
    }

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.cairo_runner import CairoRunner

    PRIME = 2**64 + 13
    program = compile_cairo(codes['dw_example'], PRIME)

    runner = CairoRunner(program, layout='plain')

    runner.initialize_segments()
    end = runner.initialize_main_entrypoint()
    runner.initialize_vm(hint_locals={})
    runner.run_until_pc(end)
