Cairo Documentation
===================

**Cairo** is a programming language for writing provable programs, where one party can prove
to another that a certain computation was executed correctly.
**Cairo** and similar proof systems
can be used to provide scalability to blockchains.

StarkNet uses the **Cairo** programming language both for its infrastructure
and for writing StarkNet contracts.
If you are looking for StarkNet specific documentation then
please see `here <https://docs.starknet.io/documentation/>`__.

Here we provide two tutorials:

*   :ref:`Hello, Cairo <hello_cairo>`
*   :ref:`How Cairo Works <how_cairo_works>`


"Hello, Cairo" describes Cairo for the programmer who wishes to understand what Cairo can do
hands-on, and start writing programs in Cairo.
"How Cairo Works" starts from the low-level assembly-like version of Cairo and
explains the syntactic sugar mechanisms applied by the Cairo compiler,
which turns Cairo to a high-level-like language.

The "Hello, Cairo" tutorial contains several references to "How Cairo Works"
for those who want to get a better understanding of those topics.

**Where should I start?**
If you want to write Cairo programs, independent of StarkNet, start with "Hello, Cairo".

If you are looking for an introduction to StarkNet specifically,
then you can visit the StarkNet documentation `here <https://docs.starknet.io/documentation/>`__.

Finally, if you want to understand Cairo's internals from the ground up,
start with "How Cairo Works" and then follow with "Hello, Cairo".

.. toctree::
    :hidden:

    self

.. toctree::
    :maxdepth: 1

    quickstart

.. toctree::
    :maxdepth: 2

    hello_starknet/index
    hello_cairo/index
    how_cairo_works/index
    reference/index
    sharp
