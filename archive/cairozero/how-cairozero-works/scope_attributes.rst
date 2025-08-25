.. _scope_attributes:

Scope attributes
----------------

You can define an attribute for a code block by surrounding it with a ``with_attr`` statement as
follows:

.. tested-code:: cairo with_attr_example

    with_attr attribute_name("Attribute value") {
        // Code block.
    }

The attribute value must be a string, and can refer to local variables only.
Referring to a variable is done by putting the variable name inside curly brackets
(e.g., ``"x must be positive. Got: {x}."``).

At present, only one attribute is supported by the Cairo runner: ``error_message``.
It allows the user to annotate a code block with an informative error message.
If a runtime error originates from a code wrapped by this attribute,
the VM will automatically add the corresponding error message to the error trace.

Note that if the statement that caused the error is surrounded by more than one ``with_attr``,
all of the error messages will appear in the output. This is also true for error messages wrapping
function calls. Consider the following (contrived) example:

.. tested-code:: cairo with_attr_error_message_example

    from starkware.cairo.common.math import assert_not_zero

    func inverse(x) -> (res: felt) {
        with_attr error_message("x must not be zero. Got x={x}.") {
            return (res=1 / x);
        }
    }

    func assert_not_equal(a, b) {
        let diff = a - b;
        with_attr error_message("a and b must be distinct.") {
            inverse(diff);
        }
        return ();
    }

If you call ``assert_not_equal`` with ``a == b``, you should get the following error:

.. tested-code:: none with_attr_get_error_message_output

    Error message: x must not be zero. Got x=0.
    :5:21: Error at pc=0:7:
    Cannot deduce operand in '0 = ? * 1' (possibly due to division by 0).
            return (res=1 / x);
                        ^***^
    Cairo traceback (most recent call last):
    Error message: a and b must be distinct.
    :12:9: (pc=0:10)
            inverse(diff);
            ^***********^

.. test::

    import pytest
    import re

    from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo
    from starkware.cairo.lang.vm.vm_exceptions import VmException

    PRIME = 2**64 + 13
    program = compile_cairo(
        codes['with_attr_error_message_example'], prime = PRIME, debug_info = True)
    runner = CairoFunctionRunner(program)

    expected_error = codes['with_attr_get_error_message_output']
    with pytest.raises(VmException, match=re.escape(expected_error)):
        runner.run(
            'assert_not_equal',
            7,
            7,
        )
