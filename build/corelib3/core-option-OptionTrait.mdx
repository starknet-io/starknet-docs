# OptionTrait

A trait for handling `Option<T>` related operations.

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)

<pre><code class="language-cairo">pub trait OptionTrait&lt;T&gt;</code></pre>

## Trait functions

### expect

Returns the contained `Some` value, consuming the `self` value.
# Panics

Panics if the option value is `None` with a custom `felt252` panic message `err`.
# Examples

```cairo
let option = Some(123);
let value = option.expect('no value');
assert!(value == 123);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[expect](./core-option-OptionTrait.md#expect)

<pre><code class="language-cairo">fn expect&lt;T, T&gt;(self: Option&lt;T&gt;, err: <a href="core-felt252.html">felt252</a>) -&gt; T</code></pre>


### unwrap

Returns the contained `Some` value, consuming the `self` value.
# Panics

Panics if the `self` value equals `None`.
# Examples

```cairo
let option = Some(123);
let value = option.unwrap();
assert!(value == 123);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[unwrap](./core-option-OptionTrait.md#unwrap)

<pre><code class="language-cairo">fn unwrap&lt;T, T&gt;(self: Option&lt;T&gt;) -&gt; T</code></pre>


### ok_or

Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to
`Ok(v)` and `None` to `Err(err)`.
# Examples

```cairo
assert_eq!(Some('foo').ok_or(0), Ok('foo'));

let option: Option<felt252> = None;
assert_eq!(option.ok_or(0), Err(0));
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[ok_or](./core-option-OptionTrait.md#ok_or)

<pre><code class="language-cairo">fn ok_or&lt;T, T, E, +Destruct&lt;E&gt;&gt;(self: Option&lt;T&gt;, err: E) -&gt; <a href="core-result-Result.html">Result&lt;T, E&gt;</a></code></pre>


### ok_or_else

Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to
`Ok(v)` and `None` to `Err(err())`.
# Examples

```cairo
assert_eq!(Some('foo').ok_or_else(|| 0), Ok('foo'));

let option: Option<felt252> = None;
assert_eq!(option.ok_or_else(|| 0), Err(0));
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[ok_or_else](./core-option-OptionTrait.md#ok_or_else)

<pre><code class="language-cairo">fn ok_or_else&lt;T, T, E, F, +Destruct&lt;E&gt;, +core::ops::FnOnce&lt;F, ()&gt;[Output: E], +Drop&lt;F&gt;&gt;(
    self: Option&lt;T&gt;, err: F,
) -&gt; <a href="core-result-Result.html">Result&lt;T, E&gt;</a></code></pre>


### and

Returns [`None`](./core-option.md#none) if the option is [`None`](./core-option.md#none), otherwise returns `optb`.
Arguments passed to `and` are eagerly evaluated; if you are passing the
result of a function call, it is recommended to use `and_then`, which is
lazily evaluated.
# Examples

```cairo
let x = Some(2);
let y: Option<ByteArray> = None;
assert_eq!(x.and(y), None);

let x: Option<u32> = None;
let y: Option<ByteArray> = Some("foo");
assert_eq!(x.and(y), None);

let x = Some(2);
let y: Option<ByteArray> = Some("foo");
assert_eq!(x.and(y), Some("foo"));

let x: Option<u32> = None;
let y: Option<ByteArray> = None;
assert_eq!(x.and(y), None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[and](./core-option-OptionTrait.md#and)

<pre><code class="language-cairo">fn and&lt;T, T, U, +Drop&lt;T&gt;, +Drop&lt;U&gt;&gt;(self: Option&lt;T&gt;, optb: Option&lt;U&gt;) -&gt; <a href="core-option-Option.html">Option&lt;U&gt;</a></code></pre>


### and_then

Returns [`None`](./core-option.md#none) if the option is [`None`](./core-option.md#none), otherwise calls `f` with the
wrapped value and returns the result.
Some languages call this operation flatmap.
# Examples

```cairo
use core::num::traits::CheckedMul;

let option: Option<ByteArray> = checked_mul(2_u32, 2_u32)
    .and_then(|v| Some(format!("{}", v)));
assert_eq!(option, Some("4"));

let option: Option<ByteArray> = checked_mul(65536_u32, 65536_u32)
    .and_then(|v| Some(format!("{}", v)));
assert_eq!(option, None); // overflowed!

let option: Option<ByteArray> = Option::<u32>::None
    .and_then(|v| Some(format!("{}", v)));
assert_eq!(option, None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[and_then](./core-option-OptionTrait.md#and_then)

<pre><code class="language-cairo">fn and_then&lt;T, T, U, F, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: Option&lt;U&gt;]&gt;(
    self: Option&lt;T&gt;, f: F,
) -&gt; <a href="core-option-Option.html">Option&lt;U&gt;</a></code></pre>


### or

Returns the option if it contains a value, otherwise returns `optb`.
Arguments passed to `or` are eagerly evaluated; if you are passing the
result of a function call, it is recommended to use `or_else`, which is
lazily evaluated.
# Examples

```cairo
let x = Some(2);
let y = None;
assert_eq!(x.or(y), Some(2));

let x = None;
let y = Some(100);
assert_eq!(x.or(y), Some(100));

let x = Some(2);
let y = Some(100);
assert_eq!(x.or(y), Some(2));

let x: Option<u32> = None;
let y = None;
assert_eq!(x.or(y), None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[or](./core-option-OptionTrait.md#or)

<pre><code class="language-cairo">fn or&lt;T, T, +Drop&lt;T&gt;&gt;(self: Option&lt;T&gt;, optb: Option&lt;T&gt;) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


### or_else

Returns the option if it contains a value, otherwise calls `f` and
returns the result.
# Examples

```cairo
let nobody = || Option::<ByteArray>::None;
let vikings = || Option::<ByteArray>::Some("vikings");

assert_eq!(Some("barbarians").or_else(vikings), Some("barbarians"));
assert_eq!(None.or_else(vikings), Some("vikings"));
assert_eq!(None.or_else(nobody), None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[or_else](./core-option-OptionTrait.md#or_else)

<pre><code class="language-cairo">fn or_else&lt;T, T, F, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, ()&gt;[Output: Option&lt;T&gt;]&gt;(
    self: Option&lt;T&gt;, f: F,
) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


### xor

Returns [`Some`](./core-option.md#some) if exactly one of `self`, `optb` is [`Some`](./core-option.md#some), otherwise returns [`None`](./core-option.md#none).
# Examples

```cairo
let x = Some(2);
let y: Option<u32> = None;
assert_eq!(x.xor(y), Some(2));

let x: Option<u32> = None;
let y = Some(2);
assert_eq!(x.xor(y), Some(2));

let x = Some(2);
let y = Some(2);
assert_eq!(x.xor(y), None);

let x: Option<u32> = None;
let y: Option<u32> = None;
assert_eq!(x.xor(y), None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[xor](./core-option-OptionTrait.md#xor)

<pre><code class="language-cairo">fn xor&lt;T, T, +Drop&lt;T&gt;&gt;(self: Option&lt;T&gt;, optb: Option&lt;T&gt;) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


### is_some

Returns `true` if the `Option` is `Some`, `false` otherwise.
# Examples

```cairo
let option = Some(123);
assert!(option.is_some());
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[is_some](./core-option-OptionTrait.md#is_some)

<pre><code class="language-cairo">fn is_some&lt;T, T&gt;(self: @Option&lt;T&gt;) -&gt; <a href="core-bool.html">bool</a></code></pre>


### is_some_and

Returns `true` if the `Option` is `Some` and the value inside of it matches a
predicate.
# Examples

```cairo
assert_eq!(Some(2_u8).is_some_and(|x| x > 1), true);
assert_eq!(Some(0_u8).is_some_and(|x| x > 1), false);

let option: Option<u8> = None;
assert_eq!(option.is_some_and(|x| x > 1), false);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[is_some_and](./core-option-OptionTrait.md#is_some_and)

<pre><code class="language-cairo">fn is_some_and&lt;T, T, F, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: bool]&gt;(
    self: Option&lt;T&gt;, f: F,
) -&gt; <a href="core-bool.html">bool</a></code></pre>


### is_none

Returns `true` if the `Option` is `None`, `false` otherwise.
# Examples

```cairo
let option = Some(123);
assert!(!option.is_none());
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[is_none](./core-option-OptionTrait.md#is_none)

<pre><code class="language-cairo">fn is_none&lt;T, T&gt;(self: @Option&lt;T&gt;) -&gt; <a href="core-bool.html">bool</a></code></pre>


### is_none_or

Returns `true` if the `Option` is `None` or the value inside of it matches a
predicate.
# Examples

```cairo
assert_eq!(Some(2_u8).is_none_or(|x| x > 1), true);
assert_eq!(Some(0_u8).is_none_or(|x| x > 1), false);

let option: Option<u8> = None;
assert_eq!(option.is_none_or(|x| x > 1), true);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[is_none_or](./core-option-OptionTrait.md#is_none_or)

<pre><code class="language-cairo">fn is_none_or&lt;T, T, F, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: bool]&gt;(
    self: Option&lt;T&gt;, f: F,
) -&gt; <a href="core-bool.html">bool</a></code></pre>


### unwrap_or

Returns the contained `Some` value if `self` is `Some(x)`. Otherwise, returns the
provided default.
# Examples

```cairo
let option = Some(123);
assert!(option.unwrap_or(456) == 123);

let option = None;
assert!(option.unwrap_or(456) == 456);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[unwrap_or](./core-option-OptionTrait.md#unwrap_or)

<pre><code class="language-cairo">fn unwrap_or&lt;T, T, +Destruct&lt;T&gt;&gt;(self: Option&lt;T&gt;, default: T) -&gt; T</code></pre>


### unwrap_or_default

Returns the contained `Some` value if `self` is `Some(x)`. Otherwise, returns
`Default::<T>::default()`.
# Examples

```cairo
let option = Some(123);
assert!(option.unwrap_or_default() == 123);

let option: Option<felt252> = None;
assert!(option.unwrap_or_default() == Default::default());
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[unwrap_or_default](./core-option-OptionTrait.md#unwrap_or_default)

<pre><code class="language-cairo">fn unwrap_or_default&lt;T, T, +Default&lt;T&gt;&gt;(self: Option&lt;T&gt;) -&gt; T</code></pre>


### unwrap_or_else

Returns the contained [`Some`](./core-option.md#some) value or computes it from a closure.
# Examples

```cairo
let k = 10;
assert!(Some(4).unwrap_or_else(|| 2 * k) == 4);
assert!(None.unwrap_or_else(|| 2 * k) == 20);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[unwrap_or_else](./core-option-OptionTrait.md#unwrap_or_else)

<pre><code class="language-cairo">fn unwrap_or_else&lt;T, T, F, +Drop&lt;F&gt;, impl func: FnOnce&lt;F, ()&gt;, +Drop&lt;func::Output&gt;&gt;(
    self: Option&lt;T&gt;, f: F,
) -&gt; T</code></pre>


### map

Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`)
or returns `None` (if `None`).
# Examples

```cairo
let maybe_some_string: Option<ByteArray> = Some("Hello, World!");
// `Option::map` takes self *by value*, consuming `maybe_some_string`
let maybe_some_len = maybe_some_string.map(|s: ByteArray| s.len());
assert!(maybe_some_len == Some(13));

let x: Option<ByteArray> = None;
assert!(x.map(|s: ByteArray| s.len()) == None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[map](./core-option-OptionTrait.md#map)

<pre><code class="language-cairo">fn map&lt;T, T, U, F, +Destruct&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: U]&gt;(
    self: Option&lt;T&gt;, f: F,
) -&gt; <a href="core-option-Option.html">Option&lt;U&gt;</a></code></pre>


### map_or

Returns the provided default result (if none),
or applies a function to the contained value (if any).
Arguments passed to `map_or` are eagerly evaluated; if you are passing
the result of a function call, it is recommended to use `map_or_else`,
which is lazily evaluated.
# Examples

```cairo
assert_eq!(Some("foo").map_or(42, |v: ByteArray| v.len()), 3);

let x: Option<ByteArray> = None;
assert_eq!(x.map_or(42, |v: ByteArray| v.len()), 42);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[map_or](./core-option-OptionTrait.md#map_or)

<pre><code class="language-cairo">fn map_or&lt;T, T, U, F, +Drop&lt;U&gt;, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: U]&gt;(
    self: Option&lt;T&gt;, default: U, f: F,
) -&gt; U</code></pre>


### map_or_else

Computes a default function result (if none), or
applies a different function to the contained value (if any).
# Basic examples

```cairo
let k = 21;

let x = Some("foo");
assert_eq!(x.map_or_else( || 2 * k, |v: ByteArray| v.len()), 3);

let x: Option<ByteArray> = None;
assert_eq!(x.map_or_else( || 2 * k, |v: ByteArray| v.len()), 42);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[map_or_else](./core-option-OptionTrait.md#map_or_else)

<pre><code class="language-cairo">fn map_or_else&lt;
    T,
    T,
    U,
    D,
    F,
    +Drop&lt;U&gt;,
    +Drop&lt;D&gt;,
    +Drop&lt;F&gt;,
    +core::ops::FnOnce&lt;D, ()&gt;[Output: U],
    +core::ops::FnOnce&lt;F, (T,)&gt;[Output: U],
&gt;(
    self: Option&lt;T&gt;, default: D, f: F,
) -&gt; U</code></pre>


### take

Takes the value out of the option, leaving a [`None`](./core-option.md#none) in its place.
# Examples

```cairo
let mut x = Some(2);
let y = x.take();
assert_eq!(x, None);
assert_eq!(y, Some(2));

let mut x: Option<u32> = None;
let y = x.take();
assert_eq!(x, None);
assert_eq!(y, None);
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[take](./core-option-OptionTrait.md#take)

<pre><code class="language-cairo">fn take&lt;T, T&gt;(ref self: Option&lt;T&gt;) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


### filter

Returns [`None`](./core-option.md#none) if the option is [`None`](./core-option.md#none), otherwise calls `predicate`
with the wrapped value and returns:
- `Some(t)` if `predicate` returns `true` (where `t` is the wrapped
value), and
- [`None`](./core-option.md#none) if `predicate` returns `false`.
# Example

```cairo
let is_even = |n: @u32| -> bool {
    *n % 2 == 0
};

assert_eq!(None.filter(is_even), None);
assert_eq!(Some(3).filter(is_even), None);
assert_eq!(Some(4).filter(is_even), Some(4));
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[filter](./core-option-OptionTrait.md#filter)

<pre><code class="language-cairo">fn filter&lt;T, T, P, +core::ops::FnOnce&lt;P, (@T,)&gt;[Output: bool], +Destruct&lt;T&gt;, +Destruct&lt;P&gt;&gt;(
    self: Option&lt;T&gt;, predicate: P,
) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


### flatten

Converts from `Option<Option<T>>` to `Option<T>`.
# Examples

Basic usage:
```cairo
let x: Option<Option<u32>> = Some(Some(6));
assert_eq!(Some(6), x.flatten());

let x: Option<Option<u32>> = Some(None);
assert_eq!(None, x.flatten());

let x: Option<Option<u32>> = None;
assert_eq!(None, x.flatten());
```

Flattening only removes one level of nesting at a time:
```cairo
let x: Option<Option<Option<u32>>> = Some(Some(Some(6)));
assert_eq!(Some(Some(6)), x.flatten());
assert_eq!(Some(6), x.flatten().flatten());
```

Fully qualified path: [core](./core.md)::[option](./core-option.md)::[OptionTrait](./core-option-OptionTrait.md)::[flatten](./core-option-OptionTrait.md#flatten)

<pre><code class="language-cairo">fn flatten&lt;T, T&gt;(self: Option&lt;Option&lt;T&gt;&gt;) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


