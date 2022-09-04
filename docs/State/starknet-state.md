# StarkNet State

The state of StarkNet consists of:

- contract instances: a mapping between addresses (251 bit field elements) and contract’s state.
- [contract classes](../Contracts/contract-classes.md): a mapping between class hash and the class definition

A contract state consists of:

- class_hash (defines the functionality)
- [contract storage](../Contracts/contract-storage.md) (a key-value mapping where the key/values are field elements)
- contract nonce - the number of transactions sent from this contract

<!-- TODO Ariel 04/09: replace this note with a reference to account abstraction / nonce section -->

:::info nonce
Similarly to Ethereum, the contract's nonce is used to provide replay protection at the protocol level. When a transaction is sent to a given contract, the transaction's nonce must match the nonce of the contract. After the transaction is executed, the contract's nonce is increased by one.

Note that while on Ethereum, only EOAs can send transactions and consequently have a non-zero nonce, on StarkNet, only account contracts can send transactions and have a non-zero nonce.
:::

With the above definition, we can provide a brief sketch of StarkNet’s transition function. A transaction $tx$ transitions the system from state $S$ to state $S’$ if:

- $tx$ is an [invoke](../Blocks/transactions.md#invoke-transaction) transaction, and the storage of $S’$ is the result of executing the target contract code with respect to the previous state $S$ (the arguments, contract address, and the specific entry point are part of the transaction)
- $tx$ is a [deploy](../Blocks/transactions.md#deploy-transaction) transaction, and $S’$ contains the new contract’s state at the contract’s address. Additionally, the storage of $S$ is updated according to the execution of the contract’s constructor.
- $tx$ is a [declare](../Blocks/transactions.md#declare-transaction) transaction, and $S'$ contains the class hash and definition in the contract classes mapping

## State Commitment

The state commitment is a digest which uniquely (up to hash collisions) encodes the state. In StarkNet, the commitment is the root of a binary Merkle-Patricia tree of height 251. Like Ethereum, this is a 2-level structure where the contract address determines the path from the root to the leaf encoding the contract state. The information stored in the leaf is:

$$
h(h(h(\text{contract\_hash}, \text{storage\_root}), 0),0)
$$

Where:

- $\text{contract\_hash}$ is the hash of the contract’s definition discussed [here](../Contracts/contract-hash.md)
- $\text{storage\_root}$ is the root of another Merkle-Patricia tree of height 251 that is constructed from the contract’s storage
- $h$ is the [Pedersen](../Hashing/hash-functions.md#pedersen-hash) hash function.

:::info
Note that, as of the time of writing, the commitment does not include classes information. This will be added in future versions.
:::

### Merkle-Patricia tree

#### Specifications

As mentioned above, our commitment scheme uses a binary Merkle-Patricia tree with the Pedersen hash function. Each node in the tree is represented by a triplet $(length, path, bottom)$. The actual data is placed in the leaves, and a leaf node with data $x$ is encoded by the triplet $(0,0,x)$. Empty nodes (leaves or internal) are encoded by the zero triplet $(0,0,0)$. A subtree rooted at a node $(length, path, bottom)$ has a single non-empty subtree, rooted at the node obtained by following the path specified by $path$.

$path$ is an integer in $[0, 2^{length}-1]$, and the binary expansion of $path$ indicates how should we proceed along the tree, where the first step is indicated by the most significant bit, and $0,1$ are interpreted as left, right correspondingly. Note that the reason that length is specified and cannot be deduced from $path$ is that we’re dealing with field elements of fixed size (251 bits each). For a node with $length>0$, following $path$ leads the highest node whose both right and left child are none empty.

The following rules specify how the tree is constructed from a given set of leaves:

The hash of a node $N =(length, path, bottom)$, denoted by $H(N)$, is:

$$
H(N)=\begin{cases}
bottom, & \text{if } length = 0 \\
h(bottom, path) + length, & \text{otherwise}
\end{cases}
$$

Note that any arithmetic operations in the above are done in our field.

We can now proceed to recursively define the nodes in the trie. The triplet representing the parent of the nodes
$left=(\ell_L, p_L, b_L)$, $right=(\ell_R, p_R, b_R)$ is given by:

$$
parent=
\begin{cases}
(0,0,0), & \text{if } left=right=(0,0,0)\\
(\ell_L + 1, p_L, b_L), & \text{if } right=(0,0,0) \text{ and } left \neq (0,0,0)\\
(\ell_R + 1, p_R + 2^{\ell_R}, b_R), & \text{if } right\neq (0,0,0) \text{ and } left = (0,0,0)\\
(0, 0, h(H(left), H(right))), & \text{otherwise}
\end{cases}
$$

#### Example Trie

We now show an example of the construction of a height 3 Merkle-Patricia tree from the leaves $[0,0,1,0,0,1,0,0]$:

![trie](../../static/img/trie.png)

Where $r=h(H(2,2,1),H((2,1,1))$. Note that in our example there is no skipping from the root (length is zero), so the final commitment to the tree will be $H((0,0,r))=r$.

Suppose that we want to prove, with respect to the commitment we have just computed, that the value of the leaf whose path is given by $101$ is $1$. In a standard Merkle tree, the proof would have consisted of data from three nodes (siblings along the path to the root). Here, since the tree is sparse, we only need to send the two children of the root $(2,2,1), (2,1,1)$. This suffices to reproduce the commitment $r$, and since the height of the tree, $3$, is known and fixed, we know that the path $01$ of length $2$ specified by the right child $(2,1,1)$ leads us to the desired leaf.
