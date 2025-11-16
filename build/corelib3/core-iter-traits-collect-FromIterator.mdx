# FromIterator

Conversion from an [`Iterator`](./core-iter-traits-iterator-Iterator.md).
By implementing `FromIterator` for a type, you define how it will be
created from an iterator. This is common for types which describe a
collection of some kind.
If you want to create a collection from the contents of an iterator, the
`Iterator::collect()` method is preferred. However, when you need to
specify the container type, `FromIterator::from_iter()` can be more
readable than using a turbofish (e.g. `::<Array<_>>()`). See the
`Iterator::collect()` documentation for more examples of its use.
See also: [`IntoIterator`](./core-iter-traits-collect-IntoIterator.md).
# Examples

Basic usage:
```cairo
let v = FromIterator::from_iter(0..5_u32);

assert_eq!(v, array![0, 1, 2, 3, 4]);
```

Implementing `FromIterator` for your type:
```cairo
use core::metaprogramming::TypeEqual;

// A sample collection, that's just a wrapper over Array<T>
#[derive(Drop, Debug)]
struct MyCollection {
    arr: Array<u32>,
}

// Let's give it some methods so we can create one and add things
// to it.
#[generate_trait]
impl MyCollectionImpl of MyCollectionTrait {
    fn new() -> MyCollection {
        MyCollection { arr: ArrayTrait::new() }
    }

    fn add(ref self: MyCollection, elem: u32) {
        self.arr.append(elem);
    }
}

// and we'll implement FromIterator
impl MyCollectionFromIterator of FromIterator<MyCollection, u32> {
    fn from_iter<
            I,
            impl IntoIter: IntoIterator<I>,
            +TypeEqual<IntoIter::Iterator::Item, u32>,
            +Destruct<IntoIter::IntoIter>,
            +Destruct<I>,
        >(
            iter: I
        ) -> MyCollection {
        let mut c = MyCollectionTrait::new();
        for i in iter {
            c.add(i);
        };
        c
    }
}

// Now we can make a new iterator...
let iter = (0..5_u32).into_iter();

// ... and make a MyCollection out of it
let c = FromIterator::<MyCollection>::from_iter(iter);

assert_eq!(c.arr, array![0, 1, 2, 3, 4]);
```

Fully qualified path: [core](./core.md)::[iter](./core-iter.md)::[traits](./core-iter-traits.md)::[collect](./core-iter-traits-collect.md)::[FromIterator](./core-iter-traits-collect-FromIterator.md)

<pre><code class="language-cairo">pub trait FromIterator&lt;T, A&gt;</code></pre>

## Trait functions

### from_iter

Creates a value from an iterator.
See the [module-level documentation](./core-iter.md) for more.
# Examples

```cairo
let iter = (0..5_u32).into_iter();

let v = FromIterator::from_iter(iter);

assert_eq!(v, array![0, 1, 2, 3, 4]);
```

Fully qualified path: [core](./core.md)::[iter](./core-iter.md)::[traits](./core-iter-traits.md)::[collect](./core-iter-traits-collect.md)::[FromIterator](./core-iter-traits-collect-FromIterator.md)::[from_iter](./core-iter-traits-collect-FromIterator.md#from_iter)

<pre><code class="language-cairo">fn from_iter&lt;
    T,
    A,
    T,
    A,
    I,
    impl IntoIter: IntoIterator&lt;I&gt;,
    +TypeEqual&lt;IntoIter::Iterator::Item, A&gt;,
    +Destruct&lt;IntoIter::IntoIter&gt;,
    +Destruct&lt;I&gt;,
&gt;(
    iter: I,
) -&gt; T</code></pre>


