// Import the necessary modules
import { describe, expect, it } from "vitest";
import { Cl, ClarityType, cvToString } from "@stacks/transactions";

// Define the test suite
describe("tip-jar contract", () => {
  // Define the sender and recipient accounts
  const accounts = simnet.getAccounts();
  const owner = accounts.get("deployer")!;
  const sender = accounts.get("wallet_1")!;
  const recipient = accounts.get("wallet_2")!;

  // This test ensures that the contract is deployed
  it("ensures the contract is deployed", () => {
    const contractSource = simnet.getContractSource("tip-jar");
    expect(contractSource).toBeDefined();
  });

  // This test ensures that the owner can update the minimum tip amount
  it("allows the owner to update the minimum tip amount", () => {
    const newMinTip = 20;
    const { result } = simnet.callPublicFn(
      "tip-jar",
      "set-min-tip",
      [Cl.uint(newMinTip)],
      owner
    );
    expect(result).toHaveClarityType(ClarityType.ResponseOk);
  });

  // This test ensures that the only the owner can update the minimum tip amount
  it("fails if a non-owner tries to update the minimum tip amount", () => {
    const newMinTip = 50;
    const { result } = simnet.callPublicFn(
      "tip-jar",
      "set-min-tip",
      [Cl.uint(newMinTip)],
      sender
    );
    expect(result).toBeErr(Cl.uint(101));
  });

  // This test ensures that the minimum tip amount updates correctly
  it("ensures the minimum tip amount updates correctly", () => {
    // Set the new minimum tip amount to 20 microSTX before calling the get-min-tip function
    simnet.callPublicFn("tip-jar", "set-min-tip", [Cl.uint(20)], owner);

    const { result } = simnet.callReadOnlyFn(
      "tip-jar",
      "get-min-tip",
      [],
      owner
    );
    expect(result).toEqual(Cl.uint(20));
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
      [Cl.principal(recipient), Cl.stringAscii(message), Cl.uint(tipAmount)],
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
      [Cl.principal(recipient), Cl.stringAscii(message), Cl.uint(tipAmount)],
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
      [Cl.principal(recipient), Cl.stringAscii(message), Cl.uint(tipAmount)],
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

  // This test ensures that the sender cannot send a tip to themselves
  it("fails if the sender sends a tip to themselves", () => {
    // Define the tip amount
    const tipAmount = 100;
    const message = "Thanks for your work!";

    // Call the send-tip function of the tip-jar contract
    const { result } = simnet.callPublicFn(
      "tip-jar",
      "send-tip",
      [Cl.principal(sender), Cl.stringAscii(message), Cl.uint(tipAmount)],
      sender
    );
    // Check if the result is a response error
    expect(result).toBeErr(Cl.uint(102));
  });

  // This test ensures that the message is not empty
  it("fails if the message is empty", () => {
    // Define the tip amount
    const tipAmount = 100;
    const message = "";

    // Call the send-tip function of the tip-jar contract
    const { result } = simnet.callPublicFn(
      "tip-jar",
      "send-tip",
      [Cl.principal(recipient), Cl.stringAscii(message), Cl.uint(tipAmount)],
      sender
    );

    // Check if the result is a response error
    expect(result).toBeErr(Cl.uint(103));
  });

  // Handle tests for tip history
  describe("tip history", () => {
    // This test ensures that the contract stores tip history when sending a tip
    it("stores tip history when sending a tip", () => {
      const tipAmount = 100;
      const message = "Thanks for the great content!";

      // Call the send-tip function of the tip-jar contract
      const sendResult = simnet.callPublicFn(
        "tip-jar",
        "send-tip",
        [Cl.principal(recipient), Cl.stringAscii(message), Cl.uint(tipAmount)],
        sender
      );
      // Check if the result is a response ok
      expect(sendResult.result).toHaveClarityType(ClarityType.ResponseOk);

      // Call the get-tip-by-id function of the tip-jar contract
      const { result } = simnet.callReadOnlyFn(
        "tip-jar",
        "get-tip-by-id",
        [Cl.uint(0)],
        sender
      );

      // Check if the result is the correct tip history
      const tipHistory = (result as any).value.data;
      expect(tipHistory.amount.value).toEqual(BigInt(tipAmount));
      expect(tipHistory.message.data).toEqual(message);
      expect(tipHistory.timestamp.value).toBeDefined();

      // Unwrap principals to address strings
      const senderPrincipal = cvToString(tipHistory.sender);
      const recipientPrincipal = cvToString(tipHistory.recipient);

      // Check if the sender and recipient are correct
      expect(senderPrincipal).toEqual(sender);
      expect(recipientPrincipal).toEqual(recipient);
    });

    // This test ensures that the contract increments the tip counter for each tip
    it("increments tip counter for multiple tips", () => {
      // Call the send-tip function of the tip-jar contract
      simnet.callPublicFn(
        "tip-jar",
        "send-tip",
        [Cl.principal(recipient), Cl.stringAscii("First tip"), Cl.uint(100)],
        sender
      );

      // Call the send-tip function of the tip-jar contract
      simnet.callPublicFn(
        "tip-jar",
        "send-tip",
        [Cl.principal(recipient), Cl.stringAscii("Second tip"), Cl.uint(200)],
        sender
      );

      // Call the get-tip-by-id function of the tip-jar contract
      const firstTip = simnet.callReadOnlyFn(
        "tip-jar",
        "get-tip-by-id",
        [Cl.uint(0)],
        sender
      ).result as any;

      // Call the get-tip-by-id function of the tip-jar contract
      const secondTip = simnet.callReadOnlyFn(
        "tip-jar",
        "get-tip-by-id",
        [Cl.uint(1)],
        sender
      ).result as any;

      expect(firstTip.value.data.message).toEqual(Cl.stringAscii("First tip"));
      expect(secondTip.value.data.message).toEqual(
        Cl.stringAscii("Second tip")
      );
    });

    // This test ensures that the contract returns an error if the tip ID is invalid
    it("returns an error if the tip ID is invalid", () => {
      // Call the get-tip-by-id function of the tip-jar contract
      const { result } = simnet.callReadOnlyFn(
        "tip-jar",
        "get-tip-by-id",
        [Cl.uint(9999)],
        sender
      );

      // Check if the result is a response error
      expect(result).toEqual(Cl.none());
    });
  });
});
