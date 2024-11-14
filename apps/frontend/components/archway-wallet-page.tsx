"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Copy, ArrowUpRight, RefreshCcw, Moon, Sun } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";

export function ArchwayWalletPageComponent() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample token data - replace with API data later
  const tokens = [
    {
      name: "NUSD",
      symbol: "NUSD",
      balance: "2,180.00",
      value: 2180.0,
      change: 0.0,
      icon: "/placeholder.svg?height=32&width=32",
    },
    {
      name: "Arch",
      symbol: "ARCH",
      balance: "0.97646",
      value: 208.06,
      change: 3.57,
      icon: "/placeholder.svg?height=32&width=32",
    },
    {
      name: "Saturn",
      symbol: "SAT",
      balance: "1.00",
      value: 312.83,
      change: 15.64,
      icon: "/placeholder.svg?height=32&width=32",
    },
  ];

  // Sample created tokens data
  const createdTokens = [
    { createdAt: "2023-11-15", ticker: "AWE", supply: 1000000, minted: 750000 },
    { createdAt: "2023-11-16", ticker: "COOL", supply: 500000, minted: 500000 },
    {
      createdAt: "2023-11-17",
      ticker: "MOON",
      supply: 2000000,
      minted: 1000000,
    },
  ];

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating token:", { tokenName, tokenSymbol, tokenSupply });
    setTokenName("");
    setTokenSymbol("");
    setTokenSupply("");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Archway</h1>
          <div className="flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Trade</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-center items-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="text-2xl font-medium text-center">
                              Coming Soon
                            </div>
                            <p className="text-sm text-center text-muted-foreground mt-2">
                              Trading features will be available in the near
                              future.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-center items-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="text-2xl font-medium text-center">
                              Coming Soon
                            </div>
                            <p className="text-sm text-center text-muted-foreground mt-2">
                              Explore features will be available in the near
                              future.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button>Connect Wallet</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-2">
                <p className="text-5xl font-bold">$2,700.89</p>
                <p className="text-lg text-green-500">+$19.21 +0.72%</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Button
                  className="flex flex-col items-center justify-center h-20"
                  variant="outline"
                >
                  <Copy className="h-5 w-5 mb-1" />
                  <span className="text-xs">Receive</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20"
                  variant="outline"
                >
                  <ArrowUpRight className="h-5 w-5 mb-1" />
                  <span className="text-xs">Send</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20"
                  variant="outline"
                >
                  <RefreshCcw className="h-5 w-5 mb-1" />
                  <span className="text-xs">Swap</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20"
                  variant="outline"
                >
                  <span className="text-lg mb-1">$</span>
                  <span className="text-xs">Buy</span>
                </Button>
              </div>

              <div className="space-y-2 pt-4">
                {tokens.map((token) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium">{token.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {token.balance} {token.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${token.value.toFixed(2)}</p>
                      <p className={`text-sm text-green-500`}>
                        +${token.change.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Create New Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateToken} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="My Awesome Token"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="MAT"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSupply">Initial Supply</Label>
                  <Input
                    id="tokenSupply"
                    type="number"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(e.target.value)}
                    placeholder="1000000"
                    required
                  />
                </div>
                <Button type="submit" className="w-full py-6 text-lg">
                  Create Token
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Created Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created At</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Supply</TableHead>
                    <TableHead>Minted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {createdTokens.map((token) => (
                    <TableRow key={token.ticker}>
                      <TableCell>{token.createdAt}</TableCell>
                      <TableCell>{token.ticker}</TableCell>
                      <TableCell>{token.supply.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(token.minted / token.supply) * 100}
                            className="w-24"
                          />
                          <span>
                            {((token.minted / token.supply) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
