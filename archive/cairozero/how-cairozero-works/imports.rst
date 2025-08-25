.. _imports:

Imports
=======

In Cairo, as is the case with other programming languages, it's undesirable and impractical to
keep an entire program in one source file. To avoid this, and to facilitate modularity,
Cairo allows importing a module from another file, with the following syntax:

.. tested-code:: cairo import_syntax

    from a.b import c as d

This will search for a Cairo module ``a.b``, and import ``c`` from it, binding it to the name
``d`` in this module. The ``as`` clause is optional, and without it, ``c`` will simply be bound
to the local name ``c``. Several tokens can be imported from the same Cairo file using the following
syntax:

.. tested-code:: cairo double_import

    from a.b import c as d, e, f

.. _import_search_path:

Import search paths
-------------------

When Cairo looks for the module ``a.b`` in the example above, it will search for a file
``a/b.cairo`` in the paths it has been configured to search. The paths searched are taken from
a colon-separated list that can be set in two ways:

* The ``--cairo_path`` argument to the Cairo compiler.

* The environment variable ``CAIRO_PATH``.

For example, in order to add ``/home/cairo_libs`` and ``/tmp/cairo_libs`` to the
path list used by the Cairo compiler, one can run either of the following lines:

.. code:: bash

    cairo-compile --cairo_path="/home/cairo_libs:/tmp/cairo_libs" ...

    CAIRO_PATH="/home/cairo_libs:/tmp/cairo_libs" cairo-compile ...

In addition, Cairo will search the current directory and the standard library directory relative
to the compiler path.

The Cairo compiler will automatically detect and fail on cyclic imports or multiple imports
sharing the same name in a single Cairo file.
