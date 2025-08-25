import os

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.compiler.cairo_compile import compile_cairo_files

CAIRO_FILE = os.path.join(os.path.dirname(__file__), "sum_by_key_solution.cairo")
PRIME = 2**251 + 17 * 2**192 + 1


def test_find_element():
    program = compile_cairo_files([CAIRO_FILE], prime=PRIME)
    runner = CairoFunctionRunner(program)
    rc_builtin = runner.range_check_builtin

    runner.run("sum_by_key", rc_builtin.base, [3, 5, 1, 10, 3, 1, 3, 8, 1, 20], 5)
    _, result, result_size = runner.get_return_values(3)
    assert result_size == 2
    assert runner.vm_memory.get_range(result, 4) == [1, 30, 3, 14]
