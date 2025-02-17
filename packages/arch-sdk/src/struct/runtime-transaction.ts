import { Message } from './message.js';

// 64 bytes
export type Signature = Uint8Array;

export interface RuntimeTransaction {
  version: number;
  signatures: Array<Signature>;
  message: Message;
}
