Types
=====

.. _tuple_types:

Tuples
------

A tuple type is defined similarly to a tuple expression. For example, given two types
``a`` and ``b``,
the type ``(a, b)`` represents a tuple that consists of an element of type ``a`` and
an element of type ``b``. For example ``(felt, felt)`` may be used to represent a
(2-dimensional) point.

Cairo also supports named tuples, for example ``(x: felt, y: felt)`` represents a tuple similar
to ``(felt, felt)`` except that the two items are named x and y, respectively.

User-defined type aliases
-------------------------

You can give a new alias for a type as follows:

.. tested-code:: cairo type_definition0

    using Point = (x: felt, y: felt);

Note that ``Point`` is not a new type in this case -- it is only an alias to
``(x: felt, y: felt)``.
You can use ``Point`` as an alias for this type.

For example, you may replace

.. tested-code:: cairo type_definition1

    local pt: (x: felt, y: felt) = (x=2, y=3);

with:

.. tested-code:: cairo type_definition2

    local pt: Point = (x=2, y=3);

.. test::

    from starkware.cairo.lang.compiler.cairo_compile import compile_cairo

    PRIME = 2**64 + 13
    template = codes['type_definition0'] + "\n func foo() {{\n alloc_locals;\n {}\n ret;\n }}"
    program0 = compile_cairo(template.format(codes['type_definition1']), PRIME)
    program1 = compile_cairo(template.format(codes['type_definition2']), PRIME)
    assert program0 == program1

