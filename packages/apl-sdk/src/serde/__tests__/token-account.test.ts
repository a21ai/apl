import {
  TokenAccount,
  AccountState,
  deserialize,
  serialize,
  ACCOUNT_LEN,
} from "../token-account.js";
import { serializeOptionPubkey } from "../pubkey.js";

describe("token-account", () => {
  const mockAccount: TokenAccount = {
    mint: Buffer.alloc(32),
    owner: Buffer.alloc(32),
    amount: BigInt(1000000),
    delegate: Buffer.alloc(32),
    state: AccountState.Initialized,
    delegated_amount: BigInt(500000),
    close_authority: Buffer.alloc(32),
  };

  const mockAccountNoOptionals: TokenAccount = {
    mint: Buffer.alloc(32),
    owner: Buffer.alloc(32),
    amount: BigInt(1000000),
    delegate: null,
    state: AccountState.Initialized,
    delegated_amount: BigInt(0),
    close_authority: null,
  };

  describe("serialize", () => {
    it("should serialize account with all fields", () => {
      const buffer = serialize(mockAccount);
      expect(buffer.length).toBe(ACCOUNT_LEN);

      // Check mint
      expect(Buffer.from(buffer.slice(0, 32))).toEqual(mockAccount.mint);
      // Check owner
      expect(Buffer.from(buffer.slice(32, 64))).toEqual(mockAccount.owner);
      // Check amount (8 bytes)
      expect(buffer.readBigUInt64LE(64)).toBe(mockAccount.amount);
      // Check delegate (4 byte tag + 32 byte pubkey)
      const expectedDelegateBytes = serializeOptionPubkey(mockAccount.delegate);
      expect(buffer.slice(72, 108)).toEqual(expectedDelegateBytes);
      // Check state
      expect(buffer[108]).toBe(mockAccount.state);
      // Check delegated amount
      expect(buffer.readBigUInt64LE(109)).toBe(mockAccount.delegated_amount);
      // Check close authority
      const expectedCloseAuthorityBytes = serializeOptionPubkey(
        mockAccount.close_authority
      );
      expect(buffer.slice(117, 153)).toEqual(expectedCloseAuthorityBytes);
    });

    it("should serialize account without optional fields", () => {
      const buffer = serialize(mockAccountNoOptionals);
      expect(buffer.length).toBe(ACCOUNT_LEN);

      // Check mint and owner are present
      expect(Buffer.from(buffer.slice(0, 32))).toEqual(
        mockAccountNoOptionals.mint
      );
      expect(Buffer.from(buffer.slice(32, 64))).toEqual(
        mockAccountNoOptionals.owner
      );

      // Check delegate is null (None tag)
      expect(buffer[72]).toBe(0);
      // Check close authority is null (None tag)
      expect(buffer[117]).toBe(0);
    });

    it("should serialize account with frozen state", () => {
      const frozenAccount = {
        ...mockAccount,
        state: AccountState.Frozen,
      };
      const buffer = serialize(frozenAccount);
      expect(buffer[108]).toBe(AccountState.Frozen);
    });

    it("should serialize account with uninitialized state", () => {
      const uninitializedAccount = {
        ...mockAccount,
        state: AccountState.Uninitialized,
      };
      const buffer = serialize(uninitializedAccount);
      expect(buffer[108]).toBe(AccountState.Uninitialized);
    });

    it("should serialize account with zero amounts", () => {
      const zeroAmountAccount = {
        ...mockAccount,
        amount: BigInt(0),
        delegated_amount: BigInt(0),
      };
      const buffer = serialize(zeroAmountAccount);
      expect(buffer.readBigUInt64LE(64)).toBe(BigInt(0));
      expect(buffer.readBigUInt64LE(109)).toBe(BigInt(0));
    });

    it("should serialize account with max amounts", () => {
      const maxAmountAccount = {
        ...mockAccount,
        amount: BigInt("18446744073709551615"), // 2^64 - 1
        delegated_amount: BigInt("18446744073709551615"),
      };
      const buffer = serialize(maxAmountAccount);
      expect(buffer.readBigUInt64LE(64)).toBe(BigInt("18446744073709551615"));
      expect(buffer.readBigUInt64LE(109)).toBe(BigInt("18446744073709551615"));
    });
  });

  describe("deserialize", () => {
    it("should deserialize account with all fields", () => {
      const buffer = serialize(mockAccount);
      const deserialized = deserialize(buffer);

      expect(Buffer.from(deserialized.mint)).toEqual(mockAccount.mint);
      expect(Buffer.from(deserialized.owner)).toEqual(mockAccount.owner);
      expect(deserialized.amount).toBe(mockAccount.amount);
      expect(
        deserialized.delegate && Buffer.from(deserialized.delegate)
      ).toEqual(mockAccount.delegate);
      expect(deserialized.state).toBe(mockAccount.state);
      expect(deserialized.delegated_amount).toBe(mockAccount.delegated_amount);
      expect(
        deserialized.close_authority &&
          Buffer.from(deserialized.close_authority)
      ).toEqual(mockAccount.close_authority);
    });

    it("should deserialize account without optional fields", () => {
      const buffer = serialize(mockAccountNoOptionals);
      const deserialized = deserialize(buffer);

      expect(Buffer.from(deserialized.mint)).toEqual(
        mockAccountNoOptionals.mint
      );
      expect(Buffer.from(deserialized.owner)).toEqual(
        mockAccountNoOptionals.owner
      );
      expect(deserialized.amount).toBe(mockAccountNoOptionals.amount);
      expect(deserialized.delegate).toBeNull();
      expect(deserialized.state).toBe(mockAccountNoOptionals.state);
      expect(deserialized.delegated_amount).toBe(
        mockAccountNoOptionals.delegated_amount
      );
      expect(deserialized.close_authority).toBeNull();
    });

    it("should throw error for invalid buffer length", () => {
      const buffer = Buffer.alloc(ACCOUNT_LEN - 1);
      expect(() => deserialize(buffer)).toThrow("Invalid buffer length");
    });

    it("should throw error for invalid account state", () => {
      const buffer = serialize(mockAccount);
      buffer[108] = 255; // Invalid state
      expect(() => deserialize(buffer)).toThrow("Invalid account state");
    });

    it("should deserialize account with frozen state", () => {
      const frozenAccount = {
        ...mockAccount,
        state: AccountState.Frozen,
      };
      const buffer = serialize(frozenAccount);
      const deserialized = deserialize(buffer);
      expect(deserialized.state).toBe(AccountState.Frozen);
    });

    it("should deserialize account with uninitialized state", () => {
      const uninitializedAccount = {
        ...mockAccount,
        state: AccountState.Uninitialized,
      };
      const buffer = serialize(uninitializedAccount);
      const deserialized = deserialize(buffer);
      expect(deserialized.state).toBe(AccountState.Uninitialized);
    });

    it("should deserialize account with max amounts", () => {
      const maxAmountAccount = {
        ...mockAccount,
        amount: BigInt("18446744073709551615"),
        delegated_amount: BigInt("18446744073709551615"),
      };
      const buffer = serialize(maxAmountAccount);
      const deserialized = deserialize(buffer);
      expect(deserialized.amount).toBe(BigInt("18446744073709551615"));
      expect(deserialized.delegated_amount).toBe(
        BigInt("18446744073709551615")
      );
    });

    it("should throw error for invalid delegate option tag", () => {
      const buffer = serialize(mockAccount);
      buffer[72] = 2; // Invalid option tag
      expect(() => deserialize(buffer)).toThrow("Invalid option tag");
    });

    it("should throw error for invalid close authority option tag", () => {
      const buffer = serialize(mockAccount);
      buffer[117] = 2; // Invalid option tag
      expect(() => deserialize(buffer)).toThrow("Invalid option tag");
    });

    it("should handle invalid buffer types", () => {
      expect(() => deserialize(null as unknown as Buffer)).toThrow();
      expect(() => deserialize(undefined as unknown as Buffer)).toThrow();
      expect(() => deserialize("not a buffer" as unknown as Buffer)).toThrow();
    });

    it("should handle invalid account fields", () => {
      const invalidAccount = {
        ...mockAccount,
        amount: "not a bigint" as unknown as bigint,
      };
      expect(() => serialize(invalidAccount)).toThrow();
    });

    it("should handle invalid delegate pubkey", () => {
      const buffer = serialize(mockAccount);
      buffer[72] = 1; // Set option tag to Some
      buffer[73] = 1; // Invalid pubkey length
      expect(() => deserialize(buffer)).toThrow();
    });

    it("should handle invalid close authority pubkey", () => {
      const buffer = serialize(mockAccount);
      buffer[117] = 1; // Set option tag to Some
      buffer[118] = 1; // Invalid pubkey length
      expect(() => deserialize(buffer)).toThrow();
    });

    it("should throw error for buffer too short for mint", () => {
      const buffer = Buffer.alloc(31); // Less than 32 bytes needed for mint
      expect(() => deserialize(buffer)).toThrow("Buffer too short for mint");
    });

    it("should throw error for buffer too short for owner", () => {
      const buffer = Buffer.alloc(33); // Less than 64 bytes needed for owner
      expect(() => deserialize(buffer)).toThrow("Buffer too short for owner");
    });

    it("should throw error for buffer too short for amount", () => {
      const buffer = Buffer.alloc(65); // Less than 72 bytes needed for amount
      expect(() => deserialize(buffer)).toThrow("Buffer too short for amount");
    });

    it("should throw error for buffer too short for delegate", () => {
      const buffer = Buffer.alloc(73); // Less than 108 bytes needed for delegate
      expect(() => deserialize(buffer)).toThrow(
        "Buffer too short for delegate"
      );
    });

    it("should throw error for buffer too short for state", () => {
      const buffer = Buffer.alloc(108); // Exactly 108 bytes, but need more for state
      expect(() => deserialize(buffer)).toThrow("Buffer too short for state");
    });

    it("should throw error for buffer too short for delegated amount", () => {
      const buffer = Buffer.alloc(110); // Less than 117 bytes needed for delegated amount
      expect(() => deserialize(buffer)).toThrow(
        "Buffer too short for delegated amount"
      );
    });

    it("should throw error for buffer too short for close authority", () => {
      const buffer = Buffer.alloc(120); // Less than 153 bytes needed for close authority
      expect(() => deserialize(buffer)).toThrow(
        "Buffer too short for close authority"
      );
    });
  });

  describe("AccountState", () => {
    it("should have correct values", () => {
      expect(AccountState.Uninitialized).toBe(0);
      expect(AccountState.Initialized).toBe(1);
      expect(AccountState.Frozen).toBe(2);
    });

    it("should not allow invalid state values", () => {
      const buffer = serialize(mockAccount);
      buffer[108] = 3; // Invalid state
      expect(() => deserialize(buffer)).toThrow("Invalid account state");
    });
  });
});
