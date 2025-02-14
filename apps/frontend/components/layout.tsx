import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-start sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-md h-[100vh] sm:h-[85vh] sm:border sm:border-white/10 sm:rounded-3xl sm:overflow-hidden sm:backdrop-blur-sm flex flex-col">
          <Header />
          <main className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
      <SonnerToaster visibleToasts={9} />
    </>
  );
}
