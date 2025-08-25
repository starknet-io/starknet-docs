# Testing with Cairo-test

<Warning>
Starknet Foundry provides a more comprehensive testing runner with Snforge, specifically designed for Starknet smart contracts.
It is highly recommended to use it instead of Cairo-test, see [Testing with Snforge](./testing-snforge).
</Warning>

Cairo-test is the included testing framework from Cairo, and can be run with `scarb test{:bash}` (or `scarb cairo-test{:bash}`).
You need to add it as a dev dependency with the following line in your `Scarb.toml`:
```toml
[dev-dependencies]
cairo_test = "2.10.1" // Version should be same as your Starknet/Scarb version
```

Testing is done similarly as shown in the [Testing with Snforge](./testing-snforge) section, but all the snforge specific features are not available.

You can learn more about using Cairo-test in the [Cairo Book - Testing Cairo Programs](https://book.cairo-lang.org/ch10-00-testing-cairo-programs.html#testing-cairo-programs).
