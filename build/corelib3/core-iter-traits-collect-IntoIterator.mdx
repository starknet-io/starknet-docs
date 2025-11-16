# IntoIterator

Conversion into an [`Iterator`](./core-iter-traits-iterator-Iterator.md).
By implementing `IntoIterator` for a type, you define how it will be
converted to an iterator. This is common for types which describe a
collection of some kind.
One benefit of implementing `IntoIterator` is that your type will work
with Cairo's `for` loop syntax.
See also: [`FromIterator`](./core-iter-traits-collect-FromIterator.md).
# Examples

Basic usage:
```cairo
let mut iter = array![1, 2, 3].into_iter();

assert!(Some(1) == iter.next());
assert!(Some(2) == iter.next());
assert!(Some(3) == iter.next());
assert!(None == iter.next());
```

Implementing `IntoIterator` for your type:
```cairo
// A sample collection, that's just a wrapper over `Array<u32>`
#[derive(Drop, Debug)]
struct MyCollection {
    arr: Array<u32>
}

// Let's give it some methods so we can create one and add things
// to it.
#[generate_trait]
impl MyCollectionImpl of MyCollectionTrait {
    fn new() -> MyCollection {
        MyCollection {
            arr: ArrayTrait::new()
        }
    }

    fn add(ref self: MyCollection, elem: u32) {
        self.arr.append(elem);
    }
}

// and we'll implement `IntoIterator`
impl MyCollectionIntoIterator of IntoIterator<MyCollection> {
    type IntoIter = core::array::ArrayIter<u32>;
    fn into_iter(self: MyCollection) -> Self::IntoIter {
        self.arr.into_iter()
    }
}

// Now we can make a new collection...
let mut c = MyCollectionTrait::new();

// ... add some stuff to it ...
c.add(0);
c.add(1);
c.add(2);

// ... and then turn it into an `Iterator`:
let mut n = 0;
for i in c {
    assert!(i == n);
    n += 1;
};
```

Fully qualified path: [core](./core.md)::[iter](./core-iter.md)::[traits](./core-iter-traits.md)::[collect](./core-iter-traits-collect.md)::[IntoIterator](./core-iter-traits-collect-IntoIterator.md)

<pre><code class="language-cairo">pub trait IntoIterator&lt;T&gt;</code></pre>

## Trait functions

### into_iter

Creates an iterator from a value.
See the [module-level documentation](./core-iter.md) for more.
# Examples

```cairo
let mut iter = array![1, 2, 3].into_iter();

assert_eq!(Some(1), iter.next());
assert_eq!(Some(2), iter.next());
assert_eq!(Some(3), iter.next());
assert_eq!(None, iter.next());
```

Fully qualified path: [core](./core.md)::[iter](./core-iter.md)::[traits](./core-iter-traits.md)::[collect](./core-iter-traits-collect.md)::[IntoIterator](./core-iter-traits-collect-IntoIterator.md)::[into_iter](./core-iter-traits-collect-IntoIterator.md#into_iter)

<pre><code class="language-cairo">fn into_iter&lt;T, T&gt;(self: T) -&gt; <a href="core-iter-traits-collect-IntoIterator.html">IntoIterator&lt;T&gt;IntoIter</a></code></pre>


## Trait types

### IntoIter

The iterator type that will be created.

Fully qualified path: [core](./core.md)::[iter](./core-iter.md)::[traits](./core-iter-traits.md)::[collect](./core-iter-traits-collect.md)::[IntoIterator](./core-iter-traits-collect-IntoIterator.md)::[IntoIter](./core-iter-traits-collect-IntoIterator.md#intoiter)

<pre><code class="language-cairo">type IntoIter;</code></pre>


