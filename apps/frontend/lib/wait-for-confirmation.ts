import { toast } from "sonner";
import { waitForConfirmation } from "@repo/apl-sdk";
import { archConnection } from "@/lib/arch";

export async function waitForConfirmationWithToast(
  txId: string
): Promise<boolean> {
  // Show initial pending toast
  const toastId = toast.loading("Confirming transaction...", {
    description: `Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`,
  });

  try {
    // Wait for confirmation
    await waitForConfirmation(archConnection, txId);

    // Update toast on success
    toast.success("Transaction confirmed!", {
      id: toastId,
      description: `Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`,
    });
    return true;
  } catch (error) {
    // Update toast on error
    toast.error("Transaction failed", {
      id: toastId,
      description:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
    return false;
  }
}
