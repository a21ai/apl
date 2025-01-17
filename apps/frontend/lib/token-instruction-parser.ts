import { Instruction } from "../../../packages/arch-sdk/src/struct/instruction";
import { TOKEN_PROGRAM_ID } from "../../../packages/apl-sdk/src/constants";

// Token instruction types based on the first byte of instruction data
enum TokenInstructionType {
  InitializeMint = 0,
  InitializeAccount = 1,
  InitializeMultisig = 2,
  Transfer = 3,
  Approve = 4,
  Revoke = 5,
  SetAuthority = 6,
  MintTo = 7,
  Burn = 8,
  CloseAccount = 9,
  FreezeAccount = 10,
  ThawAccount = 11,
  TransferChecked = 12,
  ApproveChecked = 13,
  MintToChecked = 14,
  BurnChecked = 15,
  InitializeAccount2 = 16,
  InitializeAccount3 = 17,
  InitializeMint2 = 18,
}

interface ParsedTokenInstruction {
  type: string;
  info: Record<string, string | number>;
}

export function parseTokenInstruction(instruction: Instruction): ParsedTokenInstruction | null {
  // Check if this is a token program instruction
  if (Array.from(instruction.program_id).join(',') !== Array.from(TOKEN_PROGRAM_ID).join(',')) {
    return null;
  }

  const data = instruction.data;
  if (data.length === 0) return null;

  const instructionType = data[0];
  const remainingData = data.slice(1);

  switch (instructionType) {
    case TokenInstructionType.Transfer:
    case TokenInstructionType.TransferChecked: {
      // Transfer instructions contain a u64 amount
      const amount = new DataView(remainingData.buffer).getBigUint64(0, true);
      return {
        type: instructionType === TokenInstructionType.Transfer ? 'Transfer' : 'TransferChecked',
        info: {
          amount: amount.toString(),
        },
      };
    }

    case TokenInstructionType.MintTo:
    case TokenInstructionType.MintToChecked: {
      // MintTo instructions contain a u64 amount
      const amount = new DataView(remainingData.buffer).getBigUint64(0, true);
      return {
        type: instructionType === TokenInstructionType.MintTo ? 'MintTo' : 'MintToChecked',
        info: {
          amount: amount.toString(),
        },
      };
    }

    case TokenInstructionType.Burn:
    case TokenInstructionType.BurnChecked: {
      // Burn instructions contain a u64 amount
      const amount = new DataView(remainingData.buffer).getBigUint64(0, true);
      return {
        type: instructionType === TokenInstructionType.Burn ? 'Burn' : 'BurnChecked',
        info: {
          amount: amount.toString(),
        },
      };
    }

    case TokenInstructionType.InitializeMint:
    case TokenInstructionType.InitializeMint2: {
      // Initialize mint contains decimals (u8)
      return {
        type: instructionType === TokenInstructionType.InitializeMint ? 'InitializeMint' : 'InitializeMint2',
        info: {
          decimals: remainingData[0],
        },
      };
    }

    default:
      return {
        type: TokenInstructionType[instructionType] || 'Unknown',
        info: {},
      };
  }
}
