# StarkNet Events

A contract may emit events throughout its execution. Each event contains the following fields:

- `from_address`: address of the contract emitting the events
- `keys`: a list of field elements
- `data`: a list of field elements

The keys can be used for indexing the events, while the data may contain any information that we wish to log (note that we are dealing with two separate lists of possibly varying size, rather than a list of key-value pairs).

## Emitting events

Events can be defined in a contract using the `@event` decorator. Once an event `E` has been defined, the compiler automatically adds the function `E.emit()`. The following example illustrates how an event is defined and emitted:

```js
@event
func message_received(a : felt, b: felt):
end
```

```js
message_received.emit(1, 2);
```

The emit function emits an event with a single key, which is an identifier of the event, given by $\text{sn\_keccak(event\_name)}$, where $\text{event\_name}$ is the ASCII encoding of the event’s name and $\text{sn\_keccak}$ is defined [here](../Hashing/hash-functions.md#starknet-keccak). To emit custom keys, one should use the low level `emit_event` system call:

```js
from starkware.starknet.common.syscalls import emit_event

# ...

let (keys : felt*) = alloc()
assert keys[0] = 'status'
assert keys[1] = 'deposit'
let (data : felt*) = alloc()
assert data[0] = 1
assert data[1] = 2
assert data[2] = 3
emit_event(2, keys, 3, data)
```

The above code emits an event with two keys, the [strings](https://www.cairo-lang.org/docs/how_cairo_works/consts.html#short-string-literals) "status" and "deposit" (think of those as identifiers of the event that can be used for indexing) and three data elments 1, 2, 3.

:::tip
When using the higher level `emit` syntax, the event's data may be of complex types, for example:

```js
struct Point:
    member x : felt
    member y : felt
end

@event
func message_received(arr_len : felt, arr: felt*, p: Point):
end

# ...

let (data : felt*) = alloc()
assert data[0] = 1
assert data[1] = 2
let p = Point(3,4)
message_received.emit(2, data, p)
```

:::

The emitted events are part of the [transaction receipt](../Blocks/transaction-life-cycle.md#transaction-receipt).

## Event ABI

The event definition appears in the contract’s ABI. It contains the list of data fields (name and type) and the list of the custom keys (that is, all keys except the event identifier discussed above). Below is an example of an event inside the ABI:

```json
{
  "data": [
    {
      "name": "a",
      "type": "felt"
    },
    {
      "name": "b",
      "type": "felt"
    }
  ],
  "keys": [],
  "name": "message_received",
  "type": "event"
}
```

## Event hash

The event hash is given by:

$$
h(h(h(h(0,\text{from\_address}),\text{keys\_hash}),\text{data\_hash}),3)
$$

Where:

- $\text{keys\_hash}$, $\text{data\_hash}$ are the hashes of the keys list and data list correspondingly (see [array hashing](../Hashing/hash-functions.md#array-hashing)).
- $h$ is the [pedersen](../Hashing/hash-functions.md#pedersen-hash) hash function

The event hashes are included in the [`event_commitment`](../Blocks/header.md#event_commitment) field of a block.
