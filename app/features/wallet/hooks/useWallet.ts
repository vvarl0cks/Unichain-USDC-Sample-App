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

const publicClient = createPublicClient({
  chain: unichainSepolia,
  transport: http()
});

const walletClient = createWalletClient({
  chain: unichainSepolia,
  transport: custom(window.ethereum ?? {})
});

export function useWallet() {
  const [account, setAccount] = useState<Address>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [balance, setBalance] = useState<string>();

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

  const sendTransaction = async (to: Address, value: string) => {
    if (!account) return;
    const valueInWei = BigInt(parseFloat(value) * 10 ** 6);

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

  return {
    account,
    balance,
    receipt,
    connect,
    sendTransaction,
  };
}