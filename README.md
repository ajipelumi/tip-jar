# Tip Jar

This repository contains a smart contract for a tip jar, written in Clarity, and tests for the contract, written in TypeScript.

## Smart Contract

The smart contract allows users to send tips to a specified recipient with a message and category. The contract ensures that the tip amount is at least 10 microSTX and validates the category.

### Functions

- `send-tip(recipient principal, message (string-ascii 100), amount uint, category (string-ascii 20))`: Sends a tip to the specified recipient with a message and category. The amount must be at least 10 microSTX, and the category must be one of the predefined valid categories.
- `get-min-tip()`: Returns the current minimum tip amount.
- `get-tip-by-id(tx-id uint)`: Retrieves tip history by transaction ID.
- `get-category-stats(recipient principal, category (string-ascii 20))`: Gets statistics for a specific category for a recipient.
- `get-all-category-stats(recipient principal)`: Gets statistics for all categories for a recipient.
- `get-available-categories()`: Returns a list of all available tip categories.
- `set-min-tip(new-min-tip uint)`: Updates the minimum tip amount (owner only).

### Tip Categories

The contract supports the following predefined categories:

- `content` - For content creators, writers, artists
- `service` - For professional services, consulting
- `donation` - For charitable donations, causes
- `education` - For educational content, tutorials, courses
- `entertainment` - For entertainment, gaming, streaming
- `help` - For helpful advice, support, assistance
- `other` - For miscellaneous tips

### Error Constants

- `ERR-MINIMUM-TIP-AMOUNT`: Error code for when the tip amount is less than the minimum required amount.
- `ERR-NOT-AUTHORIZED`: Error code for unauthorized operations.
- `ERR-CANNOT-TIP-SELF`: Error code for when trying to tip yourself.
- `ERR-EMPTY-MESSAGE`: Error code for when the message is empty.
- `ERR-INVALID-CATEGORY`: Error code for when an invalid category is provided.

## Tests

The tests for the smart contract are written in TypeScript using the Vitest framework. The tests ensure that the contract is deployed correctly and that all functions work as expected.

### Test Cases

- Ensures the contract is deployed.
- Allows a user to send a tip with a valid category.
- Fails if the tip amount is less than the minimum required amount.
- Fails if an invalid category is provided.
- Validates all predefined categories are accepted.
- Tracks category statistics correctly.
- Stores tip history with category information.
- Allows retrieval of available categories.
- Allows retrieval of category statistics for recipients.

## License

This project is licensed under the MIT License.
