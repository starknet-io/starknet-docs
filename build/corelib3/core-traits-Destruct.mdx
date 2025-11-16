# Destruct

A trait that allows for custom destruction behavior of a type.
In Cairo, values must be explicitly handled - they cannot be silently dropped.
Types can only go out of scope in two ways:
1. Implement `Drop` - for types that can be discarded trivially
2. Implement `Destruct` - for types that need cleanup when destroyed. Typically, any type that
contains
a `Felt252Dict` must implement `Destruct`, as the `Felt252Dict` needs to be "squashed" when
going
out of scope to ensure a program is sound.

Generally, `Destruct` does not need to be implemented manually. It can be derived from the
`Drop` and `Destruct` implementations of the type's fields.
# Examples

Here's a simple type that wraps a `Felt252Dict` and needs to be destructed:
```cairo
use core::dict::Felt252Dict;

// A struct containing a Felt252Dict must implement Destruct
#[derive(Destruct, Default)]
struct ResourceManager {
    resources: Felt252Dict<u32>,
    count: u32,
}

#[generate_trait]
impl ResourceManagerImpl of ResourceManagerTrait{
   fn add_resource(ref self: ResourceManager, resource_id: felt252, amount: u32){
       assert!(self.resources.get(resource_id) == 0, "Resource already exists");
       self.resources.insert(resource_id, amount);
       self.count += amount;
   }
}

let mut manager = Default::default();

// Add some resources
manager.add_resource(1, 100);

// When manager goes out of scope here, Destruct is automatically called,
// which ensures the dictionary is properly squashed
```

Fully qualified path: [core](./core.md)::[traits](./core-traits.md)::[Destruct](./core-traits-Destruct.md)

<pre><code class="language-cairo">pub trait Destruct&lt;T&gt;</code></pre>

## Trait functions

### destruct

Fully qualified path: [core](./core.md)::[traits](./core-traits.md)::[Destruct](./core-traits-Destruct.md)::[destruct](./core-traits-Destruct.md#destruct-1)

<pre><code class="language-cairo">fn destruct&lt;T, T&gt;(self: T)</code></pre>


