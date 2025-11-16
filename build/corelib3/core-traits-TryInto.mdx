# TryInto

Simple and safe type conversions that may fail in a controlled way under
some circumstances.
This is useful when you are doing a type conversion that may trivially succeed but may also need
special handling. For example, there is no way to convert an [`i64`](./core-integer-i64.md) into an [`i32`](./core-integer-i32.md) using the
[`Into`](./core-traits-Into.md) trait, because an [`i64`](./core-integer-i64.md) may contain a value that an [`i32`](./core-integer-i32.md) cannot represent and so
the conversion would lose data.  This might be handled by truncating the [`i64`](./core-integer-i64.md) to an [`i32`](./core-integer-i32.md)
or by simply returning `Bounded::<i32>::MAX`, or by some other method. The [`Into`](./core-traits-Into.md) trait
is intended for perfect conversions, so the `TryInto` trait informs the programmer when a type
conversion could go bad and lets them decide how to handle it.
# Generic Implementations

- [`TryInto`](./core-traits-TryInto.md) is reflexive, which means that `TryInto<T, T>` is implemented
- [`TryInto`](./core-traits-TryInto.md) is implemented for all types that implement [`Into`](./core-traits-Into.md)
# Examples

Converting chess coordinates (like 'e4') into a validated position:
```cairo
#[derive(Copy, Drop, PartialEq)]
 struct Position {
     file: u8, // Column a-h (0-7)
     rank: u8, // Row 1-8 (0-7)
 }

 impl TupleTryIntoPosition of TryInto<(u8, u8), Position> {
    fn try_into(self: (u8, u8)) -> Option<Position> {
        let (file_char, rank) = self;

        // Validate rank is between 1 and 8
        if rank < 1 || rank > 8 {
            return None;
        }

        // Validate and convert file character (a-h) to number (0-7)
        if file_char < 'a' || file_char > 'h' {
            return None;
        }
        let file = file_char - 'a';

        Some(Position {
            file,
            rank: rank - 1 // Convert 1-8 (chess notation) to 0-7 (internal index)
        })
    }
}

// Valid positions
let e4 = ('e', 4).try_into();
assert!(e4 == Some(Position { file: 4, rank: 3 }));

// Invalid positions
let invalid_file = ('x', 4).try_into();
let invalid_rank = ('a', 9).try_into();
assert!(invalid_file == None);
assert!(invalid_rank == None);
```

Fully qualified path: [core](./core.md)::[traits](./core-traits.md)::[TryInto](./core-traits-TryInto.md)

<pre><code class="language-cairo">pub trait TryInto&lt;T, S&gt;</code></pre>

## Trait functions

### try_into

Attempts to convert the input type T into the output type S.
In the event of a conversion error, returns [`None`](./core-option.md#none).
# Examples

```cairo
let a: Option<u8> = 1_u16.try_into();
assert!(a == Some(1));
let b: Option<u8> = 256_u16.try_into();
assert!(b == None);
```

Fully qualified path: [core](./core.md)::[traits](./core-traits.md)::[TryInto](./core-traits-TryInto.md)::[try_into](./core-traits-TryInto.md#try_into)

<pre><code class="language-cairo">fn try_into&lt;T, S, T, S&gt;(self: T) -&gt; <a href="core-option-Option.html">Option&lt;S&gt;</a></code></pre>


