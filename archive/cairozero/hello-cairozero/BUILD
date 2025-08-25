load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

exports_files(glob([
    "*.rst",
    "*.png",
    "*.cairo",
]))

pytest_test(
    name = "cairo_docs_additional_tests",
    srcs = [
        "sum_by_key_solution_test.py",
    ],
    data = [
        "sum_by_key_solution.cairo",
    ],
    tags = [
        "external_cairo-docs",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
    ],
)
