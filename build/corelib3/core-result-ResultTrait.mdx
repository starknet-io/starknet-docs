# ResultTrait

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)

<pre><code class="language-cairo">pub trait ResultTrait&lt;T, E&gt;</code></pre>

## Trait functions

### expect

Returns the contained `Ok` value, consuming the `self` value.
# Panics

Panics if the value is an `Err`, with the provided `felt252` panic message.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(result.expect('no value') == 123);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[expect](./core-result-ResultTrait.md#expect)

<pre><code class="language-cairo">fn expect&lt;T, E, T, E, +PanicDestruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;, err: <a href="core-felt252.html">felt252</a>) -&gt; T</code></pre>


### unwrap

Returns the contained `Ok` value, consuming the `self` value.
# Panics

Panics if the value is an `Err`, with a standard `Result::unwrap failed` panic message.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(result.unwrap() == 123);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[unwrap](./core-result-ResultTrait.md#unwrap)

<pre><code class="language-cairo">fn unwrap&lt;T, E, T, E, +Destruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; T</code></pre>


### unwrap_or

Returns the contained `Ok` value or a provided default.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(result.unwrap_or(456) == 123);

let result: Result<felt252, felt252> = Err('no value');
assert!(result.unwrap_or(456) == 456);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[unwrap_or](./core-result-ResultTrait.md#unwrap_or)

<pre><code class="language-cairo">fn unwrap_or&lt;T, E, T, E, +Destruct&lt;T&gt;, +Destruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;, default: T) -&gt; T</code></pre>


### unwrap_or_default

Returns the contained `Ok` value or `Default::<T>::default()`.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(result.unwrap_or_default() == 123);

let result: Result<felt252, felt252> = Err('no value');
assert!(result.unwrap_or_default() == 0);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[unwrap_or_default](./core-result-ResultTrait.md#unwrap_or_default)

<pre><code class="language-cairo">fn unwrap_or_default&lt;T, E, T, E, +Destruct&lt;E&gt;, +Default&lt;T&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; T</code></pre>


### unwrap_or_else

Returns the contained [`Ok`](./core-result.md#ok) value or computes it from a closure.
# Examples

```cairo
assert!(Ok(2).unwrap_or_else(|e: ByteArray| e.len()) == 2);
assert!(Err("foo").unwrap_or_else(|e: ByteArray| e.len()) == 3);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[unwrap_or_else](./core-result-ResultTrait.md#unwrap_or_else)

<pre><code class="language-cairo">fn unwrap_or_else&lt;T, E, T, E, F, +Destruct&lt;E&gt;, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (E,)&gt;[Output: T]&gt;(
    self: Result&lt;T, E&gt;, f: F,
) -&gt; T</code></pre>


### and

Returns `other` if the result is `Ok`, otherwise returns the `Err` value of `self`.
# Examples

```cairo
let x: Result<u32, ByteArray> = Ok(2);
let y: Result<ByteArray, ByteArray> = Err("late error");
assert!(x.and(y) == Err("late error"));

let x: Result<u32, ByteArray> = Err("early error");
let y: Result<ByteArray, ByteArray> = Ok("foo");
assert!(x.and(y) == Err("early error"));

let x: Result<u32, ByteArray> = Err("not a 2");
let y: Result<ByteArray, ByteArray> = Err("late error");
assert!(x.and(y) == Err("not a 2"));

let x: Result<u32, ByteArray> = Ok(2);
let y: Result<ByteArray, ByteArray> = Ok("different result type");
assert!(x.and(y) == Ok("different result type"));
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[and](./core-result-ResultTrait.md#and)

<pre><code class="language-cairo">fn and&lt;T, E, T, E, U, +Destruct&lt;T&gt;, +Drop&lt;E&gt;, +Drop&lt;U&gt;&gt;(
    self: Result&lt;T, E&gt;, other: Result&lt;U, E&gt;,
) -&gt; <a href="core-result-Result.html">Result&lt;U, E&gt;</a></code></pre>


### and_then

Calls `op` if the result is `Ok`, otherwise returns the `Err` value of `self`.
This function can be used for control flow based on `Result` values.
# Examples

```cairo
use core::num::traits::CheckedMul;

fn sq_then_string(x: u32) -> Result<ByteArray, ByteArray> {
    let res = x.checked_mul(x).ok_or("overflowed");
    res.and_then(|v| Ok(format!("{}", v)))
}

let x = sq_then_string(4);
assert!(x == Ok("16"));

let y = sq_then_string(65536);
assert!(y == Err("overflowed"));
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[and_then](./core-result-ResultTrait.md#and_then)

<pre><code class="language-cairo">fn and_then&lt;T, E, T, E, U, F, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: Result&lt;U, E&gt;]&gt;(
    self: Result&lt;T, E&gt;, op: F,
) -&gt; <a href="core-result-Result.html">Result&lt;U, E&gt;</a></code></pre>


### or

Returns `other` if the result is `Err`, otherwise returns the `Ok` value of `self`.
# Examples

```cairo
let x: Result<u32, ByteArray> = Ok(2);
let y: Result<u32, ByteArray> = Err("late error");
assert!(x.or(y) == Ok(2));

let x: Result<u32, ByteArray> = Err("early error");
let y: Result<u32, ByteArray> = Ok(2);
assert!(x.or(y) == Ok(2));

let x: Result<u32, ByteArray> = Err("not a 2");
let y: Result<u32, ByteArray> = Err("late error");
assert!(x.or(y) == Err("late error"));

let x: Result<u32, ByteArray> = Ok(2);
let y: Result<u32, ByteArray> = Ok(100);
assert!(x.or(y) == Ok(2));
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[or](./core-result-ResultTrait.md#or)

<pre><code class="language-cairo">fn or&lt;T, E, T, E, F, +Drop&lt;T&gt;, +Drop&lt;F&gt;, +Destruct&lt;E&gt;&gt;(
    self: Result&lt;T, E&gt;, other: Result&lt;T, F&gt;,
) -&gt; <a href="core-result-Result.html">Result&lt;T, F&gt;</a></code></pre>


### or_else

Calls `op` if the result is `Err`, otherwise returns the `Ok` value of `self`.
This function can be used for control flow based on result values.
# Examples

```cairo
let x: Result::<u32, ByteArray> = Result::<u32, ByteArray>::Err("bad input")
    .or_else(|_e| Ok(42));
assert!(x == Ok(42));

let y: Result::<u32, ByteArray> = Result::<u32, ByteArray>::Err("bad input")
    .or_else(|_e| Err("not 42"));
assert!(y == Err("not 42"));

let z: Result::<u32, ByteArray> = Result::<u32, ByteArray>::Ok(100)
    .or_else(|_e| Ok(42));
assert!(z == Ok(100));
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[or_else](./core-result-ResultTrait.md#or_else)

<pre><code class="language-cairo">fn or_else&lt;T, E, T, E, F, O, +Drop&lt;O&gt;, +core::ops::FnOnce&lt;O, (E,)&gt;[Output: Result&lt;T, F&gt;]&gt;(
    self: Result&lt;T, E&gt;, op: O,
) -&gt; <a href="core-result-Result.html">Result&lt;T, F&gt;</a></code></pre>


### expect_err

Returns the contained `Err` value, consuming the `self` value.
# Panics

Panics if the value is an `Ok`, with the provided `felt252` panic message.
# Examples

```cairo
let result: Result<felt252, felt252> = Err('no value');
assert!(result.expect_err('result is ok') == 'no value');
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[expect_err](./core-result-ResultTrait.md#expect_err)

<pre><code class="language-cairo">fn expect_err&lt;T, E, T, E, +PanicDestruct&lt;T&gt;&gt;(self: Result&lt;T, E&gt;, err: <a href="core-felt252.html">felt252</a>) -&gt; E</code></pre>


### unwrap_err

Returns the contained `Err` value, consuming the `self` value.
# Panics

Panics if the value is an `Ok`, with a standard `Result::unwrap_err failed.` panic message.
# Examples

```cairo
let result: Result<felt252, felt252> = Err('no value');
assert!(result.unwrap_err() == 'no value');
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[unwrap_err](./core-result-ResultTrait.md#unwrap_err)

<pre><code class="language-cairo">fn unwrap_err&lt;T, E, T, E, +PanicDestruct&lt;T&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; E</code></pre>


### is_ok

Returns `true` if the `Result` is `Ok`.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(result.is_ok());
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[is_ok](./core-result-ResultTrait.md#is_ok)

<pre><code class="language-cairo">fn is_ok&lt;T, E, T, E&gt;(self: @Result&lt;T, E&gt;) -&gt; <a href="core-bool.html">bool</a></code></pre>


### is_err

Returns `true` if the `Result` is `Err`.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(!result.is_err());
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[is_err](./core-result-ResultTrait.md#is_err)

<pre><code class="language-cairo">fn is_err&lt;T, E, T, E&gt;(self: @Result&lt;T, E&gt;) -&gt; <a href="core-bool.html">bool</a></code></pre>


### into_is_ok

Returns `true` if the `Result` is `Ok`, and consumes the value.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(result.into_is_ok());
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[into_is_ok](./core-result-ResultTrait.md#into_is_ok)

<pre><code class="language-cairo">fn into_is_ok&lt;T, E, T, E, +Destruct&lt;T&gt;, +Destruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; <a href="core-bool.html">bool</a></code></pre>


### into_is_err

Returns `true` if the `Result` is `Err`, and consumes the value.
# Examples

```cairo
let result: Result<felt252, felt252> = Ok(123);
assert!(!result.into_is_err());
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[into_is_err](./core-result-ResultTrait.md#into_is_err)

<pre><code class="language-cairo">fn into_is_err&lt;T, E, T, E, +Destruct&lt;T&gt;, +Destruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; <a href="core-bool.html">bool</a></code></pre>


### ok

Converts from `Result<T, E>` to `Option<T>`.
Converts `self` into an `Option<T>`, consuming `self`,
and discarding the error, if any.
# Examples

```cairo
let x: Result<u32, ByteArray> = Ok(2);
assert!(x.ok() == Some(2));

let x: Result<u32, ByteArray> = Err("Nothing here");
assert!(x.ok().is_none());
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[ok](./core-result-ResultTrait.md#ok)

<pre><code class="language-cairo">fn ok&lt;T, E, T, E, +Destruct&lt;T&gt;, +Destruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; <a href="core-option-Option.html">Option&lt;T&gt;</a></code></pre>


### err

Converts from `Result<T, E>` to `Option<E>`.
Converts `self` into an `Option<E>`, consuming `self`,
and discarding the success value, if any.
# Examples

```cairo
let x: Result<u32, ByteArray> = Err("Nothing here");
assert!(x.err() == Some("Nothing here"));

let x: Result<u32, ByteArray> = Ok(2);
assert!(x.err().is_none());
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[err](./core-result-ResultTrait.md#err)

<pre><code class="language-cairo">fn err&lt;T, E, T, E, +Destruct&lt;T&gt;, +Destruct&lt;E&gt;&gt;(self: Result&lt;T, E&gt;) -&gt; <a href="core-option-Option.html">Option&lt;E&gt;</a></code></pre>


### map

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a
contained [`Ok`](./core-result.md#ok) value, leaving an [`Err`](./core-result.md#err) value untouched.
This function can be used to compose the results of two functions.
# Examples

Print the square of the number contained in the `Result`, otherwise print the error.
```cairo
let inputs: Array<Result<u32, ByteArray>> = array![
    Ok(1), Err("error"), Ok(3), Ok(4),
];
for i in inputs {
    match i.map(|i| i * 2) {
        Ok(x) => println!("{x}"),
        Err(e) => println!("{e}"),
    }
}
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[map](./core-result-ResultTrait.md#map)

<pre><code class="language-cairo">fn map&lt;T, E, T, E, U, F, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: U]&gt;(
    self: Result&lt;T, E&gt;, f: F,
) -&gt; <a href="core-result-Result.html">Result&lt;U, E&gt;</a></code></pre>


### map_or

Returns the provided default (if [`Err`](./core-result.md#err)), or
applies a function to the contained value (if [`Ok`](./core-result.md#ok)).
# Examples

```cairo
let x: Result<_, ByteArray> = Ok("foo");
assert!(x.map_or(42, |v: ByteArray| v.len()) == 3);

let x: Result<_, ByteArray> = Err("bar");
assert!(x.map_or(42, |v: ByteArray| v.len()) == 42);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[map_or](./core-result-ResultTrait.md#map_or)

<pre><code class="language-cairo">fn map_or&lt;
    T, E, T, E, U, F, +Destruct&lt;E&gt;, +Destruct&lt;U&gt;, +Drop&lt;F&gt;, +core::ops::FnOnce&lt;F, (T,)&gt;[Output: U],
&gt;(
    self: Result&lt;T, E&gt;, default: U, f: F,
) -&gt; U</code></pre>


### map_or_else

Maps a `Result<T, E>` to `U` by applying fallback function `default` to
a contained [`Err`](./core-result.md#err) value, or function `f` to a contained [`Ok`](./core-result.md#ok) value.
This function can be used to unpack a successful result
while handling an error.
# Examples

```cairo
let k = 21;

let x: Result<ByteArray, _> = Ok("foo");
assert!(x.map_or_else(|_e: ByteArray| k * 2, |v: ByteArray| v.len()) == 3);

let x: Result<_, ByteArray> = Err("bar");
assert!(x.map_or_else(|_e: ByteArray| k * 2, |v: ByteArray| v.len()) == 42);
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[map_or_else](./core-result-ResultTrait.md#map_or_else)

<pre><code class="language-cairo">fn map_or_else&lt;
    T,
    E,
    T,
    E,
    U,
    D,
    F,
    +Drop&lt;D&gt;,
    +Drop&lt;F&gt;,
    +core::ops::FnOnce&lt;D, (E,)&gt;[Output: U],
    +core::ops::FnOnce&lt;F, (T,)&gt;[Output: U],
&gt;(
    self: Result&lt;T, E&gt;, default: D, f: F,
) -&gt; U</code></pre>


### map_err

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
contained [`Err`](./core-result.md#err) value, leaving an [`Ok`](./core-result.md#ok) value untouched.
This function can be used to pass through a successful result while handling
an error.
# Examples

```cairo
let stringify  = |x: u32| -> ByteArray { format!("error code: {x}") };
let x: Result<u32, u32> = Ok(2);
assert!(x.map_err(stringify) == Result::<u32, ByteArray>::Ok(2));

let x: Result<u32, u32> = Err(13);
assert!(x.map_err(stringify) == Err("error code: 13"));
```

Fully qualified path: [core](./core.md)::[result](./core-result.md)::[ResultTrait](./core-result-ResultTrait.md)::[map_err](./core-result-ResultTrait.md#map_err)

<pre><code class="language-cairo">fn map_err&lt;T, E, T, E, F, O, +Drop&lt;O&gt;, +core::ops::FnOnce&lt;O, (E,)&gt;[Output: F]&gt;(
    self: Result&lt;T, E&gt;, op: O,
) -&gt; <a href="core-result-Result.html">Result&lt;T, F&gt;</a></code></pre>


