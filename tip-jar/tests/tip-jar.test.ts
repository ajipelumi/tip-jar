// Import the necessary modules
import { describe, expect, it } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

// Define the test suite
describe("tip-jar contract", () => {
  // Define the sender and recipient accounts
  const accounts = simnet.getAccounts();
  const sender = accounts.get("wallet_1")!;
  const recipient = accounts.get("wallet_2")!;

  // This test ensures that the contract is deployed
  it("ensures the contract is deployed", () => {
    const contractSource = simnet.getContractSource("tip-jar");
    expect(contractSource).toBeDefined();
  });

  // This test ensures that a user can send a tip
  it("allows a user to send a tip", () => {
    // Define the tip amount
    const tipAmount = 100;
    const message = "Thanks for your work!";

    // Call the send-tip function of the tip-jar contract
    const { result } = simnet.callPublicFn(
        "tip-jar",
        "send-tip",
        [
          Cl.principal(recipient),
          Cl.stringAscii(message),
          Cl.uint(tipAmount),
        ],
        sender
    );

    // Check if the result is a response ok
    expect(result).toHaveClarityType(ClarityType.ResponseOk);
  });

  // This test ensures that an error is thrown if the tip amount is less than the minimum
  it("fails if tip amount is less than the minimum", () => {
    // Define the tip amount to be less than the minimum of 10 microSTX
    const tipAmount = 5;
    const message = "Thanks for your work!";

    // Call the send-tip function of the tip-jar contract
    const { result } = simnet.callPublicFn(
        "tip-jar",
        "send-tip",
        [
          Cl.principal(recipient),
          Cl.stringAscii(message),
          Cl.uint(tipAmount),
        ],
        sender
    );

    // Check if the result is a response error
    expect(result).toBeErr(Cl.uint(100));
  });

  // This test ensures that a tip of exactly the minimum amount can be sent
  it("allows a user to send a tip of the minimum amount", () => {
    // Define the tip amount to be the minimum of 10 microSTX
    const tipAmount = 10;
    const message = "Thanks for your work!";

    // Call the send-tip function of the tip-jar contract
    const { result } = simnet.callPublicFn(
        "tip-jar",
        "send-tip",
        [
          Cl.principal(recipient),
          Cl.stringAscii(message),
          Cl.uint(tipAmount),
        ],
        sender
    );

    // Check if the result is a response ok
    expect(result).toHaveClarityType(ClarityType.ResponseOk);
  });

  // This test ensures that the read-only function to get the minimum tip amount works
  it("allows a user to get the minimum tip amount", () => {
    // Call the get-minimum-tip function of the tip-jar contract
    const { result } = simnet.callReadOnlyFn(
        "tip-jar",
        "get-min-tip",
        [],
        sender
    );

    // Check if the result is the minimum tip amount of 10 microSTX
    expect(result).toEqual(Cl.uint(10));
  });
});
