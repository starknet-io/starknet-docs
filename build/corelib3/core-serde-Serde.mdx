# Serde

A trait that allows for serializing and deserializing values of any type.
The `Serde<T>` trait defines two core operations:
- `serialize`: Converts a value into a sequence of `felt252`s
- `deserialize`: Reconstructs a value from a sequence of `felt252`s
# Examples
## Simple Types (u8, u16, u32, u64, u128)

Simple types are serialized into a single `felt252`:
```cairo
let value: u8 = 42;
let mut output: Array<felt252> = array![];
value.serialize(ref output);
assert!(output == array![42]); // Single value
```
## Compound Types (u256)

Compound types may be serialized into multiple `felt252` values:
```cairo
let value: u256 = u256 { low: 1, high: 2 };
let mut output: Array<felt252> = array![];
value.serialize(ref output);
assert!(output == array![1, 2]); // Two `felt252`s: low and high
```
# Implementing `Serde`
## Using the `Derive` Macro

In most cases, you can use the `#[derive(Serde)]` attribute to automatically generate the
implementation for your type:
```cairo
#[derive(Serde)]
struct Point {
    x: u32,
    y: u32
}
```
## Manual Implementation

Should you need to customize the serialization behavior for a type in a way that derive does not
support, you can implement the `Serde` yourself:
```cairo
impl PointSerde of Serde<Point> {
    fn serialize(self: @Point, ref output: Array<felt252>) {
        output.append((*self.x).into());
        output.append((*self.y).into());
    }

    fn deserialize(ref serialized: Span<felt252>) -> Option<Point> {
        let x = (*serialized.pop_front()?).try_into()?;
        let y = (*serialized.pop_front()?).try_into()?;

        Some(Point { x, y })
    }
}
```

Fully qualified path: [core](./core.md)::[serde](./core-serde.md)::[Serde](./core-serde-Serde.md)

<pre><code class="language-cairo">pub trait Serde&lt;T&gt;</code></pre>

## Trait functions

### serialize

Serializes a value into a sequence of `felt252`s.
# Examples

```cairo
let value: u256 = 1;
let mut serialized: Array<felt252> = array![];
value.serialize(ref serialized);
assert!(serialized == array![1, 0]); // `serialized` contains the [low, high] parts of the
`u256` value ``````

Fully qualified path: [core](./core.md)::[serde](./core-serde.md)::[Serde](./core-serde-Serde.md)::[serialize](./core-serde-Serde.md#serialize)

<pre><code class="language-cairo">fn serialize&lt;T, T&gt;(self: @T, ref output: <a href="core-array-Array.html">Array&lt;felt252&gt;</a>)</code></pre>


### deserialize

Deserializes a value from a sequence of `felt252`s.
If the value cannot be deserialized, returns `None`.
# Examples

```cairo
let mut serialized: Span<felt252> = array![1, 0].span();
let value: u256 = Serde::deserialize(ref serialized).unwrap();
assert!(value == 1);
```

Fully qualified path: [core](./core.md)::[serde](./core-serde.md)::[Serde](./core-serde-Serde.md)::[deserialize](./core-serde-Serde.md#deserialize)

<pre><code class="language-cairo">fn deserialize&lt;T, T&gt;(ref serialized: <a href="core-array-Span.html">Span&lt;felt252&gt;</a>) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


