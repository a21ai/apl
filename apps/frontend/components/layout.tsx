import * as React from "react"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
          <main className="p-6 space-y-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </>
  )
}

