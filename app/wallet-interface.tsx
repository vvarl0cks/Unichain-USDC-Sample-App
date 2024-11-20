'use client'

import {
    http,
    createPublicClient,
    createWalletClient,
    custom,
    stringify,
    encodeFunctionData,
  } from 'viem';
  import { unichainSepolia } from 'viem/chains';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Wallet } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import type { Address, Hash, TransactionReceipt } from 'viem'

declare global {
  interface Window {
    ethereum?: any;
  }
}

const publicClient = createPublicClient({
    chain: unichainSepolia,
    transport: http()
  });
  
  const walletClient = createWalletClient({
    chain: unichainSepolia,
    transport: custom(window.ethereum ?? {})
  });
  
  const USDC_CONTRACT_ADDRESS = '0x31d0220469e10c4E71834a79b1f276d740d3768F';
  const USDC_ABI = [
    {
      constant: false,
      inputs: [
        { name: '_to', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function',
    }
  ];

// Add this helper function before the Component
const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export default function Component() {
  const [account, setAccount] = useState<Address>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()
  const [balance, setBalance] = useState<string>()
  
  const addressInput = useRef<HTMLInputElement>(null)
  const valueInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setReceipt(receipt);
      }
    })();
  }, [hash]);
  
  useEffect(() => {
    if (account && receipt) {
      fetchBalance(account);
    }
  }, [receipt]);

  // Using the functions from the provided code
  const connect = async () => {
    const [address] = await walletClient.requestAddresses();
    setAccount(address);
    await fetchBalance(address);
  };

  const fetchBalance = async (address: Address) => {
    const balance = await publicClient.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    
    const formattedBalance = (Number(balance) / 10 ** 6).toFixed(2);
    setBalance(formattedBalance);
  };

  const sendTransaction = async () => {
    if (!account) return;
    const to = addressInput.current!.value as Address;
    const value = valueInput.current!.value;
    const valueInWei = BigInt(parseFloat(value) * 10 ** 6); // Assuming USDC has 6 decimals
  
    const data = encodeFunctionData({
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [to, valueInWei],
    });
  
    const hash = await walletClient.sendTransaction({
      account,
      to: USDC_CONTRACT_ADDRESS,
      data,
    });
    setHash(hash);
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
                <div>
                  <div className="text-4xl font-bold">${balance || '0.00'}</div>
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
                        onClick={sendTransaction}
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
      </div>
    </div>
  )
}