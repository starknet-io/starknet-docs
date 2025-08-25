Common Library
==============

This page summarizes library functions available in the Cairo common library.
The common library is written in Cairo, and its code can be found
`here
<https://github.com/starkware-libs/cairo-lang/tree/master/src/starkware/cairo/common>`_. It
provides a level of abstraction for common and useful components that can be imported
for use in any Cairo program.

The libraries available are listed below, organized alphabetically. The functions
within each library are outlined under the relevant library heading.

-   :ref:`common_library_alloc`.
-   :ref:`common_library_bitwise`.
-   :ref:`common_library_cairo_builtins`.
-   :ref:`common_library_default_dict`.
-   :ref:`common_library_dict`.
-   :ref:`common_library_dict_access`.
-   :ref:`common_library_find_element`.
-   :ref:`common_library_set`.


..  TODO(perama, 16/06/2021): Move the link above when the section is complete.
    -   :ref:`common_library_hash`
    -   :ref:`common_library_hash_chain`
    -   :ref:`common_library_hash_state`
    -   :ref:`common_library_invoke`
    -   :ref:`common_library_keccak`
    -   :ref:`common_library_math`
    -   :ref:`common_library_math_cmp`
    -   :ref:`common_library_memcpy`
    -   :ref:`common_library_merkle_multi_update`
    -   :ref:`common_library_merkle_update`
    -   :ref:`common_library_pow`
    -   :ref:`common_library_registers`
    -   :ref:`common_library_serialize`
    -   :ref:`common_library_signature`
    -   :ref:`common_library_small_merkle_tree`
    -   :ref:`common_library_squash_dict`
    -   :ref:`common_library_uint256`

Some descriptions state that the library function
"requires the implicit argument ``<argument>``". See :ref:`syntax_implicit_arguments`
for more information on this topic.

.. _common_library_alloc:

``alloc``
---------

This section refers to the common library's
`alloc <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/alloc.cairo>`_
module.

``alloc()``
***********

Returns a pointer to a newly allocated memory segment.
This is useful when defining dynamically allocated
arrays. As more elements are added, more memory will be allocated.

.. tested-code:: cairo alloc_alloc

    from starkware.cairo.common.alloc import alloc

    // Allocate a memory segment.
    let (array_ptr: felt*) = alloc();

    // Allocate a memory segment for an array of structs.
    let (local struct_array_ptr: MyStruct*) = alloc();

.. _common_library_cairo_builtins:

``cairo_builtins``
------------------

This section refers to the common library's
`cairo_builtins <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/cairo_builtins.cairo>`_
module.

``BitwiseBuiltin``
******************

A struct specifying the bitwise builtin memory structure.
This struct is used by functions from the common library that use the ``bitwise`` builtin.
For example, the ``bitwise_xor()`` function accepts an implicit
argument of type ``BitwiseBuiltin*``, which is used internally to track the next available
builtin instance. See the function
`here <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/bitwise.cairo>`__.

The struct has the following members of type ``felt``:

-   ``x``, the first oprand.
-   ``y``, the second operand.
-   ``x_and_y``, the result of bitwise AND operation on x and y.
-   ``x_xor_y``, the result of bitwise XOR operation on x and y.
-   ``x_or_y``, the result of bitwise OR operation on x and y.

A pointer to the ``bitwise`` builtin, ``bitwise_ptr``, has the type ``BitwiseBuiltin*``.


``HashBuiltin``
***************

A struct specifying the hash builtin memory structure.
This struct is used by functions from the common library that use a hash builtin,
such as the ``pedersen`` builtin. For example, the ``hash2()`` function accepts an implicit
argument of type ``HashBuiltin*``, which is used internally to track the next available
builtin instance. See the function
`here <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/hash.cairo>`__.

The struct has the following members of type ``felt``:

-   ``x``, the first input being hashed.
-   ``y``, the second input being hashed.
-   ``result``, the hash of ``x`` and ``y``.

A pointer to the ``pedersen`` builtin, ``pedersen_ptr``, has the type ``HashBuiltin*``.

``SignatureBuiltin``
********************

A struct specifying the signature builtin memory structure.
This struct is used by functions from the common library that use a signature builtin,
such as the ``ecdsa`` builtin. For example, the ``verify_ecdsa_signature()`` function
accepts an implicit argument of type ``SignatureBulitin*``, which is used internally
to track the next available builtin instance. See the function
`here <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/signature.cairo>`__.

The struct has the following members of type ``felt``:

-   ``pub_key``, an ECDSA public key.
-   ``message``, a message signed by the ``pub_key``.

A pointer to the ``ecdsa`` builtin, ``ecdsa_ptr``, has the type ``SignatureBuiltin*``.

.. _common_library_bitwise:

``bitwise``
-----------

This section refers to the common library's
`bitwise <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/bitwise.cairo>`_
module.

``bitwise_and()``
*****************

Returns the result of the bitwise AND operation of two elements. Requires an implicit
argument, ``bitwise_ptr`` of type ``BitwiseBuiltin*``.

The function accepts the explicit arguments:

-   ``x`` of type ``felt``, the first operand.
-   ``y`` of type ``felt``, the second operand.

The function returns the value:

-   ``x_and_y`` of type ``felt``, the result of the bitwise ``AND`` operation ``a & b``.

The example below shows the operation on binary inputs ``1100`` and ``1010``
results in ``1000``:

.. tested-code:: cairo library_bitwise_and

    from starkware.cairo.common.bitwise import bitwise_and

    let (result) = bitwise_and(12, 10);  // Binary (1100, 1010).
    assert result = 8;  // Binary 1000.

``bitwise_xor()``
*****************

Returns the result of the bitwise XOR operation on two elements. Requires an implicit
argument, ``bitwise_ptr`` of type ``BitwiseBuiltin*``.

The function accepts the explicit arguments:

-   ``x`` of type ``felt``, the first operand.
-   ``y`` of type ``felt``, the second operand.

The function returns the value:

-   ``x_xor_y`` of type ``felt``, the result of the bitwise ``XOR`` operation ``a ^ b``.

The example below shows the operation on binary inputs ``1100`` and ``1010``
results in ``0110``:

.. tested-code:: cairo library_bitwise_xor

    from starkware.cairo.common.bitwise import bitwise_xor

    let (result) = bitwise_xor(12, 10);  // Binary (1100, 1010).
    assert result = 6;  // Binary 0110.

``bitwise_or()``
****************

Returns the result of the bitwise OR operation on two elements. Requires an implicit
argument, ``bitwise_ptr`` of type ``BitwiseBuiltin*``.

The function accepts the explicit arguments:

-   ``x`` of type ``felt``, the first operand.
-   ``y`` of type ``felt``, the second operand.

The function returns the value:

-   ``x_or_y`` of type ``felt``, the result of the bitwise ``OR`` operation ``a | b``.

The example below shows the operation on binary inputs ``1100`` and ``1010``
results in ``1110``:

.. tested-code:: cairo library_bitwise_or

    from starkware.cairo.common.bitwise import bitwise_or

    let (result) = bitwise_or(12, 10);  // Binary (1100, 1010).
    assert result = 14;  // Binary 1110.

``bitwise_operations()``
************************

Returns the result of the bitwise AND, XOR and OR operations on two elements. Requires
an implicit argument, ``bitwise_ptr`` of type ``BitwiseBuiltin*``.

The function accepts the explicit arguments:

-   ``x`` of type ``felt``, the first operand.
-   ``y`` of type ``felt``, the second operand.

The function returns the values:

-   ``x_and_y`` of type ``felt``, the result of the bitwise ``AND`` operation ``a & b``.
-   ``x_xor_y`` of type ``felt``, the result of the bitwise ``XOR`` operation ``a ^ b``.
-   ``x_or_y`` of type ``felt``, the result of the bitwise ``OR`` operation ``a | b``.

The example below shows the operation on binary inputs ``1100`` and ``1010``
results in ``1000``, ``0110`` and ``1110``:

.. tested-code:: cairo library_bitwise_operations

    from starkware.cairo.common.bitwise import bitwise_operations

    // Binary (1100, 1010).
    let (and_, xor_, or_) = bitwise_operations(12, 10);
    assert and_ = 8;  // Binary 1000.
    assert xor_ = 6;  // Binary 0110.
    assert or_ = 14;  // Binary 1110.

.. _common_library_default_dict:

``default_dict``
----------------

This section refers to the common library's
`default_dict <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/default_dict.cairo>`_
module.

``default_dict_new()``
**********************

Returns a new dictionary where all keys are initialized with a given default value.
One can interact with the dictionary using the ``dict_read()``, ``dict_write()``
operations discussed in the ``dict`` module.
Note that in order to enforce the consistency of subsequent dictionary accesses with
the default values, one must eventually call ``default_dict_finalize()`` (which in turn calls
``dict_squash()``, as discussed in the corresponding section). Otherwise, this is only enforced
by hints which can be bypassed by a malicious prover.

The function expects the explicit argument:

-   ``default_value``, the default value.

The function returns:

-   ``res``, of type ``DictAccess*``, a pointer to the new dictionary.

``default_dict_finalize()``
***************************

Squashes the dictionary and verifies consistency with respect to the default value.
A squashed dictionary is one whose intermediate updates have been summarized and each
key appears exactly once with its most recent value.
For more details see ``dict_squash()`` from the ``dict`` module.

..  TODO(perama, 29/08/2021): Add link when available (dict_squash).

The function expects three explicit arguments:

-   ``dict_accesses_start``, a pointer to the initial dictionary (first operation).
-   ``dict_accesses_end``, a pointer to the end of the dictionary (last operation).
-   ``default_value``, the expected initial value of each key.

The function returns the values:

-   ``squashed_dict_start``, a pointer to the start of the squashed dictionary.
-   ``squashed_dict_end``, a pointer to the end of the squashed dictionary.

Note that one must eventually call ``default_dict_finalize()`` to verify both the internal
consistency of the ``DictAccess`` entries forming the dictionary and of the consistency
with the default value.

In the example below we create and finalize a default dictionary, and explain what
may happen if ``default_dict_finalize()`` is not called.

Example
*******

.. tested-code:: cairo library_default_dict_finalize

    %builtins range_check

    from starkware.cairo.common.default_dict import (
        default_dict_new,
        default_dict_finalize,
    )
    from starkware.cairo.common.dict import dict_write, dict_update

    func main{range_check_ptr}() -> () {
        alloc_locals;
        let (local my_dict_start) = default_dict_new(
            default_value=7
        );
        let my_dict = my_dict_start;
        dict_write{dict_ptr=my_dict}(key=0, new_value=8);
        // The following is an inconsistent update, the entry with
        // key 1 still contains the default value 7.
        // This will fail while using the library's hints
        // but can be made to pass by a malicious prover.

        // For a honest prover, this will fail in the library's hints,
        // but a malicious prover can make the following dict_update
        // pass. However, if it does, the code will necessarily fail
        // at default_dict_finalize.
        // dict_update{dict_ptr=my_dict}(key=1, prev_value=8, new_value=9);

        // Finalize fails for the malicious prover with extra update.
        let (
            finalized_dict_start, finalized_dict_end
        ) = default_dict_finalize(my_dict_start, my_dict, 7);
        return ();
    }

.. _common_library_dict:

``dict``
--------

This section refers to the common library's
`dict <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/dict.cairo>`_
module for working with user defined dictionaries, abstracting away Cairo's simulation
of dictionaries as an array of read/write logs.

``dict_new()``
**************

Returns a new dictionary. The function does not require any arguments.
A new dictionary is initially populated by using a hint with the
expression ``initial_dict``. The dictionary associated with that expression
will be found by the ``__dict_manager``.

Note that Cairo has no way to enforce that subsequent read/writes are consistent
with the ``initial_dict`` hint (this is only enforced at the Python level). Technically, the
return value is a pointer to an empty ``DictAccess`` array. Soundness with respect to the
initial values can only be achieved with explicit initialization of the dictionary or
by using the ``default_dict_new()`` from the
`default_dict <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/default_dict.cairo>`_
module instead, which is not based on user-defined hints (and is thus also
available in StarkNet, unlike ``dict_new()``).
One must eventually call dict_squash() when using the dictionary.

The function returns the argument:

-   ``res``, of type ``DictAccess*``, a pointer to the new dictionary.

.. tested-code:: cairo library_dict_new

    from starkware.cairo.common.dict import dict_new
    from starkware.cairo.common.dict_access import DictAccess

    alloc_locals;
    %{
        initial_dict = {
            5: 8,
            12: 35,
            33: 198
        }
    %}
    let (local my_dict: DictAccess*) = dict_new();
    // 'my_dict' is now associated with the hint's 'initial_dict'.

``dict_read()``
***************

Returns the value of a specified dictionary key. Must be passed an implicit argument,
``dict_ptr``, of type ``DictAccess*``, representing the pointer to the end of the dictionary.
Only available for dictionaries created via ``dict_new()`` or ``default_dict_new()``.

Note that the consistency of the returned value from ``dict_read()`` is only verified
at the hint level (technically, ``dict_read()`` appends one ``DictAccess`` instruction
to the dictionary). To make sure that a malicious prover won't be able to return a
different value one must eventually call ``dict_squash()``.

The function accepts the explicit argument:

-   ``key``, of type ``felt``, the requested key.

The function returns the argument:

-   ``value``, of type ``felt``, the value assigned to ``key``.

The example below shows, for an existing dictionary whose end pointer is ``my_dict``,
how the value associated with the key ``12`` can be read. Note how the pointer ``my_dict``
is passed as an implicit argument.

.. tested-code:: cairo library_dict_read

    from starkware.cairo.common.dict import dict_read

    // my_dict has key:val pairs {5: 8, 12: 35, 33: 198}.
    let (local val: felt) = dict_read{dict_ptr=my_dict}(key=12);
    assert val = 35;

``dict_write()``
****************

Overrides the current value of an existing key. In order to work with a dynamic
dictionary one can initialize it with ``default_dict_new()`` rather than ``dict_new()``
(in which case all keys are assumed to be present, initially with the default value).
Must be passed a pointer to the end of the dictionary, ``dict_ptr``, of
type ``DictAccess*``, as an implicit argument. No values are returned.
Only available for dictionaries created via ``dict_new()`` or ``default_dict_new()``.

The function accepts the explicit arguments:

-   ``key``, of type ``felt``, the key to override.
-   ``new_value``, of type ``felt``, the value to be assigned to ``key``.

The example below shows how, for an existing dictionary whose pointer is ``my_dict``,
the value associated with the key ``12`` can be changed from ``35`` to ``34``.
Note how the pointer ``my_dict`` is passed as an implicit argument.

.. tested-code:: cairo library_dict_write

    from starkware.cairo.common.dict import dict_write

    // my_dict has key:val pairs {5: 8, 12: 35, 33: 198}.

    // The value associated with key=12 is changed.
    dict_write{dict_ptr=my_dict}(key=12, new_value=34);

    let key_12_val = dict_read{dict_ptr=my_dict}(key=12);
    // dict_squash() must be called here (omitted for brevity).
    assert key_12_val = 34;

``dict_update()``
*****************

Updates the value of a given key in a dictionary. ``dict_ptr``, of type ``DictAccess*``,
representing a pointer to the end of the dictionary, must be passed as an
implicit argument to this function. Only available for dictionaries created via ``dict_new()``
or ``default_dict_new()``. No values are returned.

The function expects three explicit arguments of type ``felt``:

-   ``key``, the key to update.
-   ``prev_value``, the current value assigned to ``key``.
-   ``new_value``, the value to be assigned to ``key``.

It is possible to get ``prev_value`` from ``__dict_manager`` using the hint:

``%{ ids.new_value = __dict_manager.get_dict(ids.dict_ptr)[ids.key] %}``

The example demonstrates how to update the value of a specified key for a
dictionary whose end pointer is referenced by ``dict_end``.

.. tested-code:: cairo library_dict_update0

    %builtins range_check

    from starkware.cairo.common.dict import (
        dict_new,
        dict_write,
        dict_update,
        dict_squash,
    )

    func main{range_check_ptr}() -> () {
        %{ initial_dict = {0: 0} %}
        let (dict_start) = dict_new();
        let dict_end = dict_start;
        dict_write{dict_ptr=dict_end}(key=0, new_value=1);
        dict_update{dict_ptr=dict_end}(
            key=0, prev_value=1, new_value=2
        );
        return ();
    }

One can think of ``dict_update()`` as a conditional write. Passing ``prev_value``
ensures that an override will only occur in case the current value equals ``prev_value``.
Note that this is only verified at the hint level and consistency relies on eventual
squashing.

``dict_squash()``
*****************

Squashes a dictionary represented by an array of read/write logs.
A squashed dictionary is one whose intermediate updates have been summarized and each key
appears exactly once with its most recent value. This is the only function in this module that
asserts the consistency of accesses to the dictionary represented by the ``DictAccess`` array.
A program that uses dict operations without invoking ``dict_squash()`` can run successfully
even if it contains inconsistent dictionary operations (see example below).

The function uses the ``range_check`` builtin and thus
requires ``range_check_ptr`` as an implicit argument.

The function expects two explicit arguments of type ``DictAccess*``:

-   ``dict_accesses_start``, a pointer to the start of the dictionary (first operation).
-   ``dict_accesses_end``, a pointer to the end of the dictionary (last operation).

The function returns two values of type ``DictAccess*``:

-   ``squashed_dict_start``, a pointer to the start of the squashed dictionary.
-   ``squashed_dict_end``, a pointer to the end of the squashed dictionary.

The only function that uses ``dict_accesses_start`` is ``dict_squash()``. All
other dictionary operations append to the array of ``DictAccess`` instances.

.. tested-code:: cairo library_dict_squash

    %builtins range_check

    from starkware.cairo.common.dict import (
        dict_new,
        dict_write,
        dict_update,
        dict_squash,
    )

    func main{range_check_ptr}() -> () {
        %{ initial_dict = {0: 0} %}
        let (dict_start) = dict_new();
        let dict_end = dict_start;
        dict_write{dict_ptr=dict_end}(0, 1);
        dict_update{dict_ptr=dict_end}(0, 1, 2);
        let (squashed_dict_start, squashed_dict_end) = dict_squash{
            range_check_ptr=range_check_ptr
        }(dict_start, dict_end);
        // The following is an inconsistent update, 'prev_value'
        // is now '2'. This will fail while using the library's hints
        // but can be made to pass by a malicious prover.
        dict_update{dict_ptr=squashed_dict_end}(
            key=0, prev_value=3, new_value=2
        );
        // Squash fails. Even a malicious prover can't pass
        // verification for a failed dict_squash operation.
        let (squashed_dict_start, squashed_dict_end) = dict_squash{
            range_check_ptr=range_check_ptr
        }(squashed_dict_start, squashed_dict_end);
        return ();
    }

.. _common_library_dict_access:

``dict_access``
---------------

This section refers to the common library's
`dict_access <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/dict_access.cairo>`_
module.

``DictAccess``
**************

A struct specifying the ``DictAccess`` memory structure. Cairo simulates dictionaries
by an array of read-modify-write instructions, which are logged by the ``DictAccess`` struct.
The consistency of such an array can be verified by applying ``squash_dict()``.

For libraries that abstract Cairo's representation of dictionaries and allow a more
standard dictionary interface than what will be shown here, see the
``dict`` and ``default_dict`` modules in the common library.

The struct has the following members of type ``felt``:

-   ``key``, the key of a key-value pair.
-   ``prev_value``, the previous value iof a key-value pair.
-   ``new_value``, the current value of a key-value pair.

In the example below, a dictionary is created by adding ``DictAccess`` structs to an array
and manually incrementing a pointer to the end of the array.

.. tested-code:: cairo library_dictaccess0

    %builtins range_check

    from starkware.cairo.common.dict import dict_squash
    from starkware.cairo.common.squash_dict import squash_dict
    from starkware.cairo.common.alloc import alloc
    from starkware.cairo.common.dict_access import DictAccess

    func main{range_check_ptr}() -> () {
        alloc_locals;
        let (dict_start: DictAccess*) = alloc();
        assert dict_start[0] = DictAccess(
            key=0, prev_value=100, new_value=100
        );
        assert dict_start[1] = DictAccess(
            key=1, prev_value=200, new_value=200
        );

        let dict_end = dict_start + 2 * DictAccess.SIZE;
        // (dict_start, dict_end) now represents the dictionary
        // {0: 100, 1: 200}.

        // Now pass the dictionary to a function for inspection.
        check_key_ratio{dict_ptr=dict_end}(a=0, b=1);

        // Squash the dictionary from an array of 4 DictAccess
        // structs to an array of 2, with a single DictAccess
        // entry per key.
        // Fails if the prover changed 'value_a' and 'value_b'.
        let (local squashed_dict_start: DictAccess*) = alloc();
        let (squashed_dict_end) = squash_dict{
            range_check_ptr=range_check_ptr
        }(dict_start, dict_end, squashed_dict_start);
        return ();
    }

``check_key_ratio()`` checks that the value of key ``b`` is double the value of key ``a``.
This will only be enforced if we eventually call ``squash_dict()``.

.. tested-code:: cairo library_dictaccess1

    func check_key_ratio{dict_ptr: DictAccess*}(a: felt, b: felt) {
        alloc_locals;
        // Adds more DictAccess entries to the existing array.
        // Values match previous entries and will be squashed.
        local value_a;
        local value_b;
        %{
            ids.value_a = 100  # Malicious prover may change it.
            ids.value_b = 200
        %}
        assert value_a * 2 = value_b;
        // Simulate dictionary read by appending a 'DictAccess'
        // instruction with 'prev_value=new_value=current_value'.
        assert dict_ptr[0] = DictAccess(
            key=a, prev_value=value_a, new_value=value_a
        );
        assert dict_ptr[1] = DictAccess(
            key=b, prev_value=value_b, new_value=value_b
        );
        let dict_end = dict_ptr + 2 * DictAccess.SIZE;
        // A call to squash_dict() will ensure that the prover
        // used values that are consistent with the input dictionary.
        return ();
    }

.. _common_library_find_element:

``find_element``
----------------

This section refers to the common library's
`find_element <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/find_element.cairo>`_
module.

``find_element()``
******************

Returns the pointer to an element in an array whose key matches a specified key. The function
requires the implicit argument ``range_check_ptr``. Note that if the array contains
multiple elements with the requested key, the function may return a pointer to any of them.

The function requires four explicit arguments:

-   ``array_ptr``, a pointer to an array.
-   ``elm_size``, the size (in memory cells) of each element in the array.
-   ``n_elms``, the number of elements in the array.
-   ``key``, the key to look for (the key is assumed to be the first member of
    each element in the array).

The function returns:

-   ``elm_ptr``, the pointer to an element whose first memory cell is ``key``
    (namely, ``[elm_ptr]=key``).

The function has the ability to receive the index of that element via a hint, which may
save proving time. If ``key`` is not found then a ``ValueError`` exception
will be raised while processing the library's hint. Note that a malicious prover
can't cause ``find_element()`` to succeed by changing the hint, as the Cairo
program will fail when the key is not present in the array.

.. tested-code:: cairo library_find_element

    %builtins range_check
    from starkware.cairo.common.find_element import find_element
    from starkware.cairo.common.alloc import alloc

    struct MyStruct {
        a: felt,
        b: felt,
    }

    func main{range_check_ptr}() -> () {
        // Create an array with MyStruct elements (1,2), (3,4), (5,6).
        alloc_locals;
        let (local array_ptr: MyStruct*) = alloc();
        assert array_ptr[0] = MyStruct(a=1, b=2);
        assert array_ptr[1] = MyStruct(a=3, b=4);
        assert array_ptr[2] = MyStruct(a=5, b=6);

        // Find any element with key '5'.
        let (element_ptr: MyStruct*) = find_element(
            array_ptr=array_ptr,
            elm_size=MyStruct.SIZE,
            n_elms=3,
            key=5,
        );
        // A pointer to the element with index 2 is returned.
        assert element_ptr.a = 5;
        assert element_ptr.b = 6;

        // Pass a known index in a hint to save proving time.
        %{ __find_element_index = 2 %}
        let (element_ptr: MyStruct*) = find_element(
            array_ptr=array_ptr,
            elm_size=MyStruct.SIZE,
            n_elms=3,
            key=5,
        );
        assert element_ptr.a = 5;
        assert element_ptr.b = 6;
        return ();
    }

``search_sorted_lower()``
*************************

Returns the pointer to the first element in the array whose first field is at least ``key``.
The array elements must be sorted by the first field in ascending order. If no such item exists,
it returns a pointer to the end of the array (after the last item). The function requires the
implicit argument ``range_check_ptr``.

The function accepts the arguments:

-   ``array_ptr``, a pointer to a sorted array.
-   ``elm_size``, the size (in memory cells) of each element in the array.
-   ``n_elms``, the number of elements in the array.
-   ``key``, the key lower bound (the key is assumed to be the first member of
    each element in the array).

The function returns:

-  ``elm_ptr``, the pointer to the first element whose key is greater or equal to the lower bound.

Continuing with the example above, with lower bound ``2``, the middle element is returned.

.. tested-code:: cairo library_search_sorted_lower

    from starkware.cairo.common.find_element import (
        search_sorted_lower,
    )

    let (smallest_ptr: MyStruct*) = search_sorted_lower(
        array_ptr=array_ptr, elm_size=2, n_elms=3, key=2
    );
    assert smallest_ptr.a = 3;
    assert smallest_ptr.b = 4;

``search_sorted()``
*******************

Returns both the pointer to the first element in the array whose key matches a specified key, and
an indicator for the success of the search. The array elements must be sorted by the
first field in ascending order. If no such item exists, returns an undefined pointer,
and ``success=0``. The function requires the implicit argument ``range_check_ptr``.

The function accepts the arguments:

-   ``array_ptr``, the pointer to a sorted array.
-   ``elm_size``, the size (in memory cells) of each element in the array.
-   ``n_elms``, the number of elements in the array.
-   ``key``, the key to look for (the key is assumed to be the first member of
    each element in the array).

The function returns:

-   ``elm_ptr``, the pointer to the first element whose first member is ``key``,
    namely ``[elm_ptr] = key``.
-   ``success``, a ``felt`` which equals ``1`` if the key was found and ``0`` otherwise.

Continuing with the same example, since the array is sorted, searching for the key
``5`` leads to the last element.

.. tested-code:: cairo library_search_sorted

    from starkware.cairo.common.find_element import search_sorted

    let (first_ptr: MyStruct*, success_val) = search_sorted(
        array_ptr=array_ptr, elm_size=2, n_elms=3, key=5
    );
    assert success_val = 1;
    assert first_ptr.a = 5;
    assert first_ptr.b = 6;
    // There is no element with key=2.
    let (first_ptr: MyStruct*, success_val) = search_sorted(
        array_ptr=array_ptr, elm_size=2, n_elms=3, key=2
    );
    assert success_val = 0;

.. .. _common_library_hash:

..  ``hash``
..  --------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `hash <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/hash.cairo>`_
    module.

.. .. _common_library_hash_chain:

..  ``hash_chain``
..  --------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `hash_chain <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/hash_chain.cairo>`_
    module.

.. .. _common_library_hash_state:

..  ``hash_state``
..  --------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `hash_state <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/hash_state.cairo>`_
    module.

.. .. _common_library_invoke:

..  ``invoke``
..  ----------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `invoke <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/invoke.cairo>`_
    module.

.. .. _common_library_keccak:

..  ``keccak``
..  ----------

..  TODO(perama, 26/08/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `keccak <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/keccak.cairo>`_
    module.

.. .. _common_library_math:

..  ``math``
..  --------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `math <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/math.cairo>`_
    module.

.. .. _common_library_math_cmp:

..  ``math_cmp``
..  ------------

..  TODO(perama, 26/08/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `math_cmp <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/math_cmp.cairo>`_
    module.

.. .. _common_library_memcpy:

..  ``memcpy``
..  ----------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `memcpy <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/memcpy.cairo>`_
    module.

.. .. _common_library_merkle_multi_update:

..  ``merkle_multi_update``
..  -----------------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `merkle_multi_update <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/merkle_multi_update.cairo>`_
    module.

.. .. _common_library_merkle_update:

..  ``merkle_update``
..  -----------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `merkle_update <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/merkle_update.cairo>`_
    module.

.. .. _common_library_pow:

..  ``pow``
..  -------

..  TODO(perama, 26/08/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `pow <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/pow.cairo>`_
    module.

.. .. _common_library_registers:

..  ``registers``
..  --------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `registers <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/registers.cairo>`_
    module.

.. .. _common_library_serialize:

..  ``serialize``
..  -------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `serialize <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/serialize.cairo>`_
    module.

.. _common_library_set:

``set``
-------

This section refers to the common library's
`set <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/set.cairo>`_
module.

``set_add()``
*************

This function either appends an element to a given array or asserts that it exists.
An honest prover should not append the element if it is already present,
but this is not verified. The function requires the implicit arguments
``set_end_ptr`` (the pointer to the end of the list) and ``range_check_ptr``.

The function expects three explicit arguments:

- ``set_ptr``, the pointer to the start of the list.
- ``elm_size``, the size of each list element.
- ``elm_ptr``, a pointer to the element being added.

.. tested-code:: cairo library_set

    %builtins range_check

    from starkware.cairo.common.alloc import alloc
    from starkware.cairo.common.set import set_add

    struct MyStruct {
        a: felt,
        b: felt,
    }

    func main{range_check_ptr}() {
        alloc_locals;

        // An array containing two structs.
        let (local my_list: MyStruct*) = alloc();
        assert my_list[0] = MyStruct(a=1, b=3);
        assert my_list[1] = MyStruct(a=5, b=7);

        // Suppose that we want to add the element
        // MyStruct(a=1, b=3), but only if it is not already
        // present (for the purpose of the example the contents of
        // the array are known, but this doesn't have to be the
        // case).
        let list_end: felt* = &my_list[2];
        let (new_elm: MyStruct*) = alloc();
        assert new_elm[0] = MyStruct(a=2, b=3);

        set_add{set_end_ptr=list_end}(
            set_ptr=my_list, elm_size=MyStruct.SIZE, elm_ptr=new_elm
        );
        return ();
    }

.. .. _common_library_signature:

..  ``signature``
..  -------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `signature <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/signature.cairo>`_
    module.

.. .. _common_library_small_merkle_tree:

..  ``small_merkle_tree``
..  ---------------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `small_merkle_tree <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/small_merkle_tree.cairo>`_
    module.

.. .. _common_library_squash_dict:

..  ``squash_dict``
..  ---------------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `squash_dict <https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/squash_dict.cairo>`_
    module.

.. .. _common_library_uint256:

..  ``uint256``
..  -----------

..  TODO(perama, 16/06/2021): Uncomment the link when the section is complete.
    This section refers to the common library's
    `uint256 <://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/cairo/common/uint256.cairo>`_
    module.
