# IndexView

A trait for indexing operations (`container[index]`) where the input type is not modified.
`container[index]` is syntactic sugar for `container.index(index)`.
# Examples

The following example implements `IndexView` on a `NucleotideCount` container, which can be
indexed without modifying the input, enabling individual counts to be retrieved with index
syntax.
```cairo
use core::ops::IndexView;

#[derive(Copy, Drop)]
enum Nucleotide {
     A,
     C,
     G,
     T,
 }

#[derive(Copy, Drop)]
struct NucleotideCount {
     a: usize,
     c: usize,
     g: usize,
     t: usize,
 }

impl NucleotideIndex of IndexView<NucleotideCount, Nucleotide> {
     type Target = usize;

     fn index(self: @NucleotideCount, index: Nucleotide) -> Self::Target {
         match index {
             Nucleotide::A => *self.a,
             Nucleotide::C => *self.c,
             Nucleotide::G => *self.g,
             Nucleotide::T => *self.t,
         }
     }
 }

let nucleotide_count = NucleotideCount {a: 14, c: 9, g: 10, t: 12};
assert!(nucleotide_count[Nucleotide::A] == 14);
assert!(nucleotide_count[Nucleotide::C] == 9);
assert!(nucleotide_count[Nucleotide::G] == 10);
assert!(nucleotide_count[Nucleotide::T] == 12);
```

Fully qualified path: [core](./core.md)::[ops](./core-ops.md)::[index](./core-ops-index.md)::[IndexView](./core-ops-index-IndexView.md)

<pre><code class="language-cairo">pub trait IndexView&lt;C, I&gt;</code></pre>

## Trait functions

### index

Performs the indexing (`container[index]`) operation.
# Panics

May panic if the index is out of bounds.

Fully qualified path: [core](./core.md)::[ops](./core-ops.md)::[index](./core-ops-index.md)::[IndexView](./core-ops-index-IndexView.md)::[index](./core-ops-index-IndexView.md#index)

<pre><code class="language-cairo">fn index&lt;C, I, C, I&gt;(self: @C, index: I) -&gt; <a href="core-ops-index-IndexView.html">IndexView&lt;C, I&gt;Target</a></code></pre>


## Trait types

### Target

The returned type after indexing.

Fully qualified path: [core](./core.md)::[ops](./core-ops.md)::[index](./core-ops-index.md)::[IndexView](./core-ops-index-IndexView.md)::[Target](./core-ops-index-IndexView.md#target)

<pre><code class="language-cairo">type Target;</code></pre>


