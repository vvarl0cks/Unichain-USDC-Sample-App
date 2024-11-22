'use client'

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Wallet } from "lucide-react"
import { useWallet } from "../hooks/useWallet"
import type { Address } from 'viem'

const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export default function WalletInterface() {
  const { account, balance, receipt, connect, sendTransaction } = useWallet();
  const addressInput = useRef<HTMLInputElement>(null)
  const valueInput = useRef<HTMLInputElement>(null)

  const handleSendTransaction = () => {
    if (!addressInput.current || !valueInput.current) return;
    sendTransaction(
      addressInput.current.value as Address,
      valueInput.current.value
    );
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-[#1c1c1c] text-green-500 p-2 rounded-lg text-sm flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          You are in testnet mode
        </div>

        <Card className="border-0 bg-[#1c1c1c] text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#2a2a2a] p-2 rounded-lg">
                  <Wallet className="h-6 w-6" />
                </div>
                {account ? (
                  <div>
                    <div className="font-bold">Wallet 1</div>
                    <div className="text-sm text-gray-400">
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </div>
                  </div>
                ) : (
                  <div>Connect Wallet</div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!account ? (
              <Button 
                onClick={connect}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="text-4xl font-bold">${balance || '0.00'}</div>
                  <img src="/usdc.png" alt="USDC Logo" className="ml-2 w-8 h-8" />
                </div>

                <Tabs defaultValue="send" className="w-full">
                  <TabsContent value="send" className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        ref={addressInput}
                        placeholder="Send to address"
                        className="bg-[#2a2a2a] border-0 text-white placeholder:text-gray-500"
                      />
                      <Input
                        ref={valueInput}
                        placeholder="Amount USDC"
                        type="number"
                        className="bg-[#2a2a2a] border-0 text-white placeholder:text-gray-500"
                      />
                      <Button 
                        onClick={handleSendTransaction}
                        className="w-full bg-purple-700 hover:bg-purple-600"
                      >
                        Send
                      </Button>
                    </div>

                    {receipt && (
                      <div className="mt-4 p-4 bg-[#2a2a2a] rounded-lg">
                        <div className="text-sm text-gray-400">Transaction Receipt:</div>
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(receipt, bigIntReplacer, 2)}
                        </pre>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-center items-center space-x-4 text-white text-sm mt-4">
        <a href="https://developers.circle.com/stablecoins/what-is-usdc" className="hover:text-purple-400 transition-colors">What is USDC</a>
        <a href="https://developers.circle.com/w3s/circle-programmable-wallets-an-overview" className="hover:text-purple-400 transition-colors">Developer Tools</a>
        <a href="https://www.circle.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Go to Circle.com</a>
      </div>
      </div>
    </div>
  )
}
