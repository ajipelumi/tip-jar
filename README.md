# Tip Jar

This repository contains a smart contract for a tip jar, written in Clarity, and tests for the contract, written in TypeScript.

## Smart Contract

The smart contract allows users to send tips to a specified recipient with a message. The contract ensures that the tip amount is at least 10 microSTX.

### Functions

- `send-tip(recipient principal, message (string-ascii 100), amount uint)`: Sends a tip to the specified recipient with a message. The amount must be at least 10 microSTX.

### Error Constants

- `ERR-MINIUM-TIP-AMOUNT`: Error code for when the tip amount is less than the minimum required amount.

## Tests

The tests for the smart contract are written in TypeScript using the Vitest framework. The tests ensure that the contract is deployed correctly and that the `send-tip` function works as expected.

### Test Cases

- Ensures the contract is deployed.
- Allows a user to send a tip.
- Fails if the tip amount is less than the minimum required amount.

## License

This project is licensed under the MIT License.
