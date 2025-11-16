# Store

Trait for types that can be stored in Starknet contract storage.
The `Store` trait enables types to be stored in and retrieved from Starknet's contract storage.
Cairo implements `Store` for most primitive types. However, collection types (arrays, dicts,
etc.) do not implement `Store` directly. Instead, use specialized storage types, such as [`Vec`](./core-starknet-storage-vec-Vec.md)
or [`Map`](./core-starknet-storage-map-Map.md).
# Derivation

To make a type storable in contract storage, simply derive the `Store` trait:
```cairo
#[derive(Drop, starknet::Store)]
struct Sizes {
    tiny: u8,    // 8 bits
    small: u32,  // 32 bits
    medium: u64, // 64 bits
}
```

This allows the `Size` struct to be stored in a contract's storage.
There's no real reason to implement this trait yourself, as it can be trivially derived.
For efficiency purposes, consider manually implementing [`StorePacking`](./core-starknet-storage_access-StorePacking.md) to optimize storage
usage.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)

<pre><code class="language-cairo">pub trait Store&lt;T&gt;</code></pre>

## Trait functions

### read

Reads a value from storage at the given domain and base address.
# Arguments

- `address_domain` - The storage domain (currently only 0 is supported)
- `base` - The base storage address to read from

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)::[read](./core-starknet-storage_access-Store.md#read)

<pre><code class="language-cairo">fn read&lt;T, T&gt;(address_domain: <a href="core-integer-u32.html">u32</a>, base: <a href="core-starknet-storage_access-StorageBaseAddress.html">StorageBaseAddress</a>) -&gt; <a href="core-result-Result.html">Result&lt;T, Array&lt;felt252&gt;&gt;</a></code></pre>


### write

Writes a value to storage at the given domain and base address.
# Arguments

- `address_domain` - The storage domain (currently only 0 is supported)
- `base` - The base storage address to write to
- `value` - The value to store

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)::[write](./core-starknet-storage_access-Store.md#write)

<pre><code class="language-cairo">fn write&lt;T, T&gt;(
    address_domain: <a href="core-integer-u32.html">u32</a>, base: <a href="core-starknet-storage_access-StorageBaseAddress.html">StorageBaseAddress</a>, value: T,
) -&gt; <a href="core-result-Result.html">Result&lt;(), Array&lt;felt252&gt;&gt;</a></code></pre>


### read_at_offset

Reads a value from storage at a base address plus an offset.
# Arguments

- `address_domain` - The storage domain (currently only 0 is supported)
- `base` - The base storage address
- `offset` - The offset from the base address where the value should be read

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)::[read_at_offset](./core-starknet-storage_access-Store.md#read_at_offset)

<pre><code class="language-cairo">fn read_at_offset&lt;T, T&gt;(
    address_domain: <a href="core-integer-u32.html">u32</a>, base: <a href="core-starknet-storage_access-StorageBaseAddress.html">StorageBaseAddress</a>, offset: <a href="core-integer-u8.html">u8</a>,
) -&gt; <a href="core-result-Result.html">Result&lt;T, Array&lt;felt252&gt;&gt;</a></code></pre>


### write_at_offset

Writes a value to storage at a base address plus an offset.
# Arguments

- `address_domain` - The storage domain (currently only 0 is supported)
- `base` - The base storage address
- `offset` - The offset from the base address where the value should be written
- `value` - The value to store

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)::[write_at_offset](./core-starknet-storage_access-Store.md#write_at_offset)

<pre><code class="language-cairo">fn write_at_offset&lt;T, T&gt;(
    address_domain: <a href="core-integer-u32.html">u32</a>, base: <a href="core-starknet-storage_access-StorageBaseAddress.html">StorageBaseAddress</a>, offset: <a href="core-integer-u8.html">u8</a>, value: T,
) -&gt; <a href="core-result-Result.html">Result&lt;(), Array&lt;felt252&gt;&gt;</a></code></pre>


### size

Returns the size in storage for this type.
This is bounded to 255, as the offset is a u8. As such, a single type can only take up to
255 slots in storage.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)::[size](./core-starknet-storage_access-Store.md#size)

<pre><code class="language-cairo">fn size&lt;T, T&gt;() -&gt; <a href="core-integer-u8.html">u8</a></code></pre>


### scrub

Clears the storage area by writing zeroes to it.
# Arguments

- `address_domain` - The storage domain
- `base` - The base storage address to start clearing
- `offset` - The offset from the base address where clearing should start

The operation writes zeroes to storage starting from the specified base address and offset,
and continues for the size of the type as determined by the `size()` function.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[Store](./core-starknet-storage_access-Store.md)::[scrub](./core-starknet-storage_access-Store.md#scrub)

<pre><code class="language-cairo">fn scrub&lt;T, T&gt;(
    address_domain: <a href="core-integer-u32.html">u32</a>, base: <a href="core-starknet-storage_access-StorageBaseAddress.html">StorageBaseAddress</a>, offset: <a href="core-integer-u8.html">u8</a>,
) -&gt; <a href="core-result-Result.html">Result&lt;(), Array&lt;felt252&gt;&gt;</a></code></pre>


