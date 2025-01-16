import * as React from "react";
// import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-start sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-md sm:border sm:border-white/10 sm:rounded-3xl sm:overflow-hidden sm:backdrop-blur-sm">
          <main className="p-4 sm:p-6 space-y-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
