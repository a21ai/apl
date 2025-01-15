"use client";

import { ArrowLeft, AtSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout";

interface SendPageProps {
  params: {
    token: string; // Token symbol from dynamic route parameter
  };
}

/**
 * SendPage component handles the token sending interface.
 * It provides a form to input recipient address and amount,
 * with real-time USD conversion and available balance display.
 */
export default function SendPage({ params }: SendPageProps) {
  const router = useRouter();
  const token = params.token.toUpperCase();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with back button and title */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="flex-1 text-center text-2xl font-semibold mr-8">
            Send {token}
          </h1>
        </div>

        {/* Token logo display */}
        <div className="flex justify-center py-4">
          <div className="bg-white rounded-full p-4 w-20 h-20">
            <Image
              src="/placeholder.svg"
              alt={`${token} logo`}
              width={80}
              height={80}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Send form */}
        <div className="space-y-4">
          {/* Recipient address input */}
          <div className="relative">
            <Input
              placeholder={`Recipient's ${token} address`}
              className="bg-white/5 border-white/10 rounded-xl h-14 pl-4 pr-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-white/10"
            >
              <AtSign className="h-5 w-5" />
            </Button>
          </div>

          {/* Amount input with token symbol and max button */}
          <div className="relative">
            <Input
              type="number"
              placeholder="Amount"
              className="bg-white/5 border-white/10 rounded-xl h-14 pl-4 pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-white/60">{token}</span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                Max
              </Button>
            </div>
          </div>

          {/* USD value and available balance display */}
          <div className="flex justify-between text-sm py-2">
            <div className="text-white/60">$0.00</div>
            <div className="text-white/60">Available: 0 {token}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button className="h-12 rounded-xl bg-white/10 hover:bg-white/20">
            Next
          </Button>
        </div>
      </div>
    </Layout>
  );
}
