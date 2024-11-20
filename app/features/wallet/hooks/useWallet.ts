import { useState, useEffect } from 'react';
import {
  http,
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
} from 'viem';
import { unichainSepolia } from 'viem/chains';
import type { Address, Hash, TransactionReceipt } from 'viem';
import { USDC_CONTRACT_ADDRESS, USDC_ABI } from '../constants/contracts';

// Create a public client to interact with the blockchain
const publicClient = createPublicClient({
  chain: unichainSepolia,
  transport: http()
});

// Create a wallet client to interact with the user's wallet
const walletClient = createWalletClient({
  chain: unichainSepolia,
  transport: custom(window.ethereum ?? {})
});

// Custom hook to manage wallet interactions
export function useWallet() {
  const [account, setAccount] = useState<Address>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [balance, setBalance] = useState<string>();

  // Effect to wait for the transaction receipt when a hash is available
  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setReceipt(receipt);
      }
    })();
  }, [hash]);

  // Effect to fetch the balance after the transaction receipt is available
  useEffect(() => {
    if (account && receipt) {
      fetchBalance(account);
    }
  }, [receipt]);

  // Function to connect to the user's wallet
  const connect = async () => {
    const [address] = await walletClient.requestAddresses();
    setAccount(address);
    await fetchBalance(address);
  };

  // Function to fetch the USDC balance for a given address
  const fetchBalance = async (address: Address) => {
    const balance = await publicClient.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    
    // Format the balance from the smallest unit (wei) to a human-readable format
    const formattedBalance = (Number(balance) / 10 ** 6).toFixed(2);
    setBalance(formattedBalance);
  };

  // Function to send a USDC transaction to a specified address
  const sendTransaction = async (to: Address, value: string) => {
    if (!account) return;

    // Convert the value from USDC to the smallest unit (wei)
    const valueInWei = BigInt(parseFloat(value) * 10 ** 6);

    // Encode the function call data for the transfer function
    const data = encodeFunctionData({
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [to, valueInWei],
    });

    // Send the transaction using the wallet client
    const hash = await walletClient.sendTransaction({
      account,
      to: USDC_CONTRACT_ADDRESS,
      data,
    });
    setHash(hash);
  };

  // Return the wallet state and functions for use in components
  return {
    account,
    balance,
    receipt,
    connect,
    sendTransaction,
  };
}
