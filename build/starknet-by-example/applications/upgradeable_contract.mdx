# Upgradeable Contract

In Starknet, contracts are divided into two parts: contract classes and contract
instances. This division follows a similar concept used in object-oriented
programming languages, where we distinguish between the definition and implementation
of objects.

A contract class is the definition of a contract: it specifies how the contract
behaves. It contains essential information like the Cairo byte code, hint
information, entry point names, and everything that defines its semantics
unambiguously.

To identify different contract classes, Starknet assigns a unique identifier to each
class: the class hash. A contract instance is a deployed contract that corresponds to
a specific contract class. Think of it as an instance of an object in languages like
Java.

Each class is identified by its class hash, which is analogous to a class name in an object-oriented programming language. A contract instance is a deployed contract corresponding to a class.

You can upgrade a deployed contract to a newer version by calling the `replace_class_syscall` function. By using this function, you can update the class hash associated with a deployed contract, effectively upgrading its implementation. However, this will not modify the contract's storage, so all the data stored in the contract will remain the same.

To illustrate this concept, let's consider an example with two contracts: `UpgradeableContract_V0`, and `UpgradeableContract_V1`.
Start by deploying `UpgradeableContract_V0` as the initial version. Next, send a transaction that invokes the `upgrade` function, with the class hash of `UpgradeableContract_V1` as parameter to upgrade the class hash of the deployed contract to the `UpgradeableContract_V1` one. Then, call the `version` method on the contract to see that the contract was upgraded to the V1 version.

```cairo
// [!include ~/listings/applications/upgradeable_contract/src/upgradeable_contract_v0.cairo:contract]
```

```cairo
// [!include ~/listings/applications/upgradeable_contract/src/upgradeable_contract_v1.cairo]
```
