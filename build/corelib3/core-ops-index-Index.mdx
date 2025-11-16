# Index

A trait for indexing operations (`container[index]`) where the input type is mutated.
This trait should be implemented when you want to implement indexing operations on a type that's
mutated by a read access. This is useful for any type depending on a [`Felt252Dict`](./core-dict-Felt252Dict.md), where
dictionary accesses are modifying the data structure itself.
`container[index]` is syntactic sugar for `container.index(index)`.
# Examples

The following example implements `Index` on a `Stack` type. This `Stack` is implemented based on
a [`Felt252Dict`](./core-dict-Felt252Dict.md), where dictionary accesses are modifying the dictionary itself. As such, we
must implement the `Index` trait instead of the `IndexView` trait.
```cairo
use core::ops::Index;

#[derive(Destruct, Default)]
struct Stack {
    items: Felt252Dict<u128>,
    len: usize
}

#[generate_trait]
impl StackImpl of StackTrait {
    fn push(ref self: Stack, item: u128) {
        self.items.insert(self.len.into(), item);
        self.len += 1;
    }
}

impl StackIndex of Index<Stack, usize> {
     type Target = u128;

     fn index(ref self: Stack, index: usize) -> Self::Target {
         if index >= self.len {
             panic!("Index out of bounds");
         }
         self.items.get(index.into())
     }
 }

let mut stack: Stack = Default::default();
stack.push(1);
assert!(stack[0] == 1);
```

Fully qualified path: [core](./core.md)::[ops](./core-ops.md)::[index](./core-ops-index.md)::[Index](./core-ops-index-Index.md)

<pre><code class="language-cairo">pub trait Index&lt;C, I&gt;</code></pre>

## Trait functions

### index

Performs the indexing (`container[index]`) operation.
# Panics

May panic if the index is out of bounds.

Fully qualified path: [core](./core.md)::[ops](./core-ops.md)::[index](./core-ops-index.md)::[Index](./core-ops-index-Index.md)::[index](./core-ops-index-Index.md#index-1)

<pre><code class="language-cairo">fn index&lt;C, I, C, I&gt;(ref self: C, index: I) -&gt; <a href="core-ops-index-Index.html">Index&lt;C, I&gt;Target</a></code></pre>


## Trait types

### Target

The returned type after indexing.

Fully qualified path: [core](./core.md)::[ops](./core-ops.md)::[index](./core-ops-index.md)::[Index](./core-ops-index-Index.md)::[Target](./core-ops-index-Index.md#target)

<pre><code class="language-cairo">type Target;</code></pre>


