# MutableVecTrait

Provides mutable access to elements in a storage [`Vec`](./core-starknet-storage-vec-Vec.md).
This trait extends the read functionality with methods to append new elements
and modify existing ones.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)

<pre><code class="language-cairo">pub trait MutableVecTrait&lt;T&gt;</code></pre>

## Trait functions

### get

Returns a mutable storage path to the element at the specified index, or `None` if out of
bounds.
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait, StoragePointerWriteAccess};

#[storage]
struct Storage {
    numbers: Vec<u256>,
}

fn set_number(ref self: ContractState, index: u64, number: u256) -> bool {
    if let Some(ptr) = self.numbers.get(index) {
        ptr.write(number);
        true
    } else {
        false
    }
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[get](./core-starknet-storage-vec-MutableVecTrait.md#get)

<pre><code class="language-cairo">fn get&lt;T, T&gt;(self: T, index: <a href="core-integer-u64.html">u64</a>) -&gt; <a href="core-option-Option.html">Option&lt;StoragePath&lt;Mutable&lt;MutableVecTrait&lt;T&gt;ElementType&gt;&gt;&gt;</a></code></pre>


### at

Returns a mutable storage path to the element at the specified index.
# Panics

Panics if the index is out of bounds.
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait, StoragePointerWriteAccess};

#[storage]
struct Storage {
    numbers: Vec<u256>,
}

fn set_number(ref self: ContractState, index: u64, number: u256) {
    self.numbers.at(index).write(number);
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[at](./core-starknet-storage-vec-MutableVecTrait.md#at)

<pre><code class="language-cairo">fn at&lt;T, T&gt;(self: T, index: <a href="core-integer-u64.html">u64</a>) -&gt; <a href="core-starknet-storage-StoragePath.html">StoragePath&lt;Mutable&lt;MutableVecTrait&lt;T&gt;ElementType&gt;&gt;</a></code></pre>


### len

Returns the number of elements in the vector.
The length is stored at the vector's base storage address and is automatically
updated when elements are appended.
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait};

#[storage]
struct Storage {
    numbers: Vec<u256>,
}

fn is_empty(self: @ContractState) -> bool {
    self.numbers.len() == 0
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[len](./core-starknet-storage-vec-MutableVecTrait.md#len)

<pre><code class="language-cairo">fn len&lt;T, T&gt;(self: T) -&gt; <a href="core-integer-u64.html">u64</a></code></pre>


### append

Returns a mutable storage path to write a new element at the end of the vector.
This operation:
1. Increments the vector's length
2. Returns a storage path to write the new element
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait, StoragePointerWriteAccess};

#[storage]
struct Storage {
    numbers: Vec<u256>,
}

fn push_number(ref self: ContractState, number: u256) {
    self.numbers.append().write(number);
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[append](./core-starknet-storage-vec-MutableVecTrait.md#append)

<pre><code class="language-cairo">fn append&lt;T, T&gt;(self: T) -&gt; <a href="core-starknet-storage-StoragePath.html">StoragePath&lt;Mutable&lt;MutableVecTrait&lt;T&gt;ElementType&gt;&gt;</a></code></pre>


### allocate

Allocates space for a new element at the end of the vector, returning a mutable storage path
to write the element.
This function is a replacement for the deprecated `append` function, which allowed
appending new elements to a vector.
Unlike `push`, which gets an object to write to the vector, `allocate` is specifically
useful when you need to prepare space for elements of unknown or dynamic size (e.g.,
appending another vector).
# Use Case

`allocate` is essential when pushing a vector into another vector, as the size of the
nested vector is unknown at compile time. It allows the caller to allocate the required
space first, then write the nested vector into the allocated space using `.write()`.
This is necessary because pushing directly (e.g., `vec.push(nested_vec)`) is not supported
due to `Vec` being only a storage abstraction.
# Deprecation Note

The `append` function is now deprecated. Use `allocate` to achieve the same functionality
with improved clarity and flexibility.
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait, StoragePointerWriteAccess};

#[storage]
struct Storage {
    numbers: Vec<Vec<u256>>,
}

fn append_nested_vector(ref self: ContractState, elements: Array<u256>) {
    // Allocate space for the nested vector in the outer vector.
    let new_vec_storage_path = self.numbers.allocate();
    for element in elements {
        new_vec_storage_path.push(element)
    }
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[allocate](./core-starknet-storage-vec-MutableVecTrait.md#allocate)

<pre><code class="language-cairo">fn allocate&lt;T, T&gt;(self: T) -&gt; <a href="core-starknet-storage-StoragePath.html">StoragePath&lt;Mutable&lt;MutableVecTrait&lt;T&gt;ElementType&gt;&gt;</a></code></pre>


### push

Pushes a new value onto the vector.
This operation:
1. Increments the vector's length.
2. Writes the provided value to the new storage location at the end of the vector.
# Note

If you need to allocate storage without writing a value (e.g., when appending another
vector), consider using `allocate` instead.
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait};

#[storage]
struct Storage {
    numbers: Vec<u256>,
}

fn push_number(ref self: ContractState, number: u256) {
    self.numbers.push(number);
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[push](./core-starknet-storage-vec-MutableVecTrait.md#push)

<pre><code class="language-cairo">fn push&lt;T, T, +Drop&lt;Self::ElementType&gt;, +starknet::Store&lt;Self::ElementType&gt;&gt;(
    self: T, value: Self::ElementType,
)</code></pre>


### pop

Pops the last value off the vector.
This operation:
1. Retrieves the value stored at the last position in the vector.
2. Decrements the vector's length.
3. Returns the retrieved value or `None` if the vector is empty.
# Examples

```cairo
use starknet::storage::{Vec, MutableVecTrait};

#[storage]
struct Storage {
    numbers: Vec<u256>,
}

fn pop_number(ref self: ContractState) -> Option<u256> {
    self.numbers.pop()
}
```

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[pop](./core-starknet-storage-vec-MutableVecTrait.md#pop)

<pre><code class="language-cairo">fn pop&lt;T, T, +Drop&lt;Self::ElementType&gt;, +starknet::Store&lt;Self::ElementType&gt;&gt;(self: T) -&gt; <a href="core-option-Option.html">Option&lt;MutableVecTrait&lt;T&gt;ElementType&gt;</a></code></pre>


## Trait types

### ElementType

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage](./core-starknet-storage.md)::[vec](./core-starknet-storage-vec.md)::[MutableVecTrait](./core-starknet-storage-vec-MutableVecTrait.md)::[ElementType](./core-starknet-storage-vec-MutableVecTrait.md#elementtype)

<pre><code class="language-cairo">type ElementType;</code></pre>


