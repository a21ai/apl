"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  id?: string;
  children: React.ReactNode;
}

export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, children, id, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = e.currentTarget;
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        dialog.close();
      }
    };

    return (
      <dialog
        ref={ref}
        id={id}
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 backdrop:bg-black/50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </dialog>
    );
  }
);

Dialog.displayName = "Dialog";
