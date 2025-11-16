# StorePacking

Trait for efficient packing of values into optimized storage representations.
This trait enables bit-packing of complex types into simpler storage types to reduce gas costs
by minimizing the number of storage slots used. When a type implements `StorePacking`, the
compiler automatically uses `StoreUsingPacking` to handle storage operations. As such, a type
cannot implement both `Store` and `StorePacking`.
# Storage Optimization

Each storage slot in Starknet is a `felt252`, and storage operations are expensive. By packing
multiple values into fewer slots, you can significantly reduce gas costs. For example:
- Multiple small integers can be packed into a single `felt252`
- Structs with several fields can be compressed into a single storage slot
# Implementation Requirements

To implement `StorePacking`, ensure that the `PackedT` type implements [`Store`](./core-starknet-storage_access-Store.md). The packed
representation must preserve all necessary information to allow unpacking back to the original
type. Additionally, the `pack` and `unpack` operations must be reversible, meaning that packing
followed by unpacking should return the original value.
# Example

Packing multiple integer fields into a single storage slot:
```cairo
use starknet::storage_access::StorePacking;

#[derive(Drop)]
struct Sizes {
    tiny: u8,    // 8 bits
    small: u32,  // 32 bits
    medium: u64, // 64 bits
}

const TWO_POW_8: u128 = 0x100;
const TWO_POW_40: u128 = 0x10000000000;

impl SizesStorePacking of StorePacking<Sizes, u128> {
    fn pack(value: Sizes) -> u128 {
        value.tiny.into() +
        (value.small.into() * TWO_POW_8) +
        (value.medium.into() * TWO_POW_40)
    }

    fn unpack(value: u128) -> Sizes {
        let tiny = value & 0xff;
        let small = (value / TWO_POW_8) & 0xffffffff;
        let medium = (value / TWO_POW_40);

        Sizes {
            tiny: tiny.try_into().unwrap(),
            small: small.try_into().unwrap(),
            medium: medium.try_into().unwrap(),
        }
    }
}
```

By implementing `StorePacking` for `Sizes`, the `Sizes` will be stored in its packed form,
using a single storage slot instead of 3. When retrieved, it will automatically be unpacked back
into the original type.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[StorePacking](./core-starknet-storage_access-StorePacking.md)

<pre><code class="language-cairo">pub trait StorePacking&lt;T, PackedT&gt;</code></pre>

## Trait functions

### pack

Packs a value into its optimized storage representation.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[StorePacking](./core-starknet-storage_access-StorePacking.md)::[pack](./core-starknet-storage_access-StorePacking.md#pack)

<pre><code class="language-cairo">fn pack&lt;T, PackedT, T, PackedT&gt;(value: T) -&gt; PackedT</code></pre>


### unpack

Unpacks a storage representation back into the original type.

Fully qualified path: [core](./core.md)::[starknet](./core-starknet.md)::[storage_access](./core-starknet-storage_access.md)::[StorePacking](./core-starknet-storage_access-StorePacking.md)::[unpack](./core-starknet-storage_access-StorePacking.md#unpack)

<pre><code class="language-cairo">fn unpack&lt;T, PackedT, T, PackedT&gt;(value: PackedT) -&gt; T</code></pre>


