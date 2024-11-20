# Unichain USDC Sample App

This sample application demonstrates how to create a frontend interface that allows users to connect their wallets and seamlessly transfer USDC on [Unichain](https://www.unichain.org/).

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

Follow these steps to clone and run the sample app:

### 1. Clone the Repository

Open your terminal and run the following command to clone the repository:

```bash
git clone https://github.com/circle-ccooper/Unichain-USDC-Sample-App.git
```

### 2. Navigate to the Project Directory

Change into the project directory:

```bash
cd unichain-usdc-sample-app
```

### 3. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

### 4. Run the Development Server

Start the development server with the following command:

```bash
npm run dev
```

This will start the application in development mode. You can view it in your browser at http://localhost:3000.

### 5. Connect Your Wallet

Once the app is running, you can connect your wallet by clicking the "Connect Wallet" button in the interface. Make sure you have a compatible wallet extension installed (e.g., Uniswap Wallet).

### 6. Transfer USDC
After connecting your wallet, you can enter the recipient's address and the amount of USDC you wish to send. Click the "Send" button to initiate the transaction.

### USDC Token Contract

This code located in `./app/features/wallet/constants/contracts.ts`, defines the address and the Application Binary Interface (ABI) for the USDC token contract on the Unichain Sepolia network. It allows interaction with the contract to transfer USDC tokens and check balances.

./app/features/wallet/constants/contracts.ts

```javascript
// The address of the USDC token contract on the Unichain Sepolia network
export const USDC_CONTRACT_ADDRESS = '0x31d0220469e10c4E71834a79b1f276d740d3768F';

// The ABI (Application Binary Interface) for the USDC token contract
export const USDC_ABI = [
  {
    // Function to transfer USDC tokens from the caller's address to a specified address
    constant: false,
    inputs: [
      { name: '_to', type: 'address' }, // The recipient's address
      { name: '_value', type: 'uint256' }, // The amount of USDC to transfer
    ],
    name: 'transfer', // The name of the function
    outputs: [{ name: '', type: 'bool' }], // Returns true if the transfer was successful
    type: 'function', // Indicates that this is a function
  },
  {
    // Function to get the balance of USDC tokens for a specific address
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }], // The address to check the balance for
    name: 'balanceOf', // The name of the function
    outputs: [{ name: 'balance', type: 'uint256' }], // Returns the balance of USDC tokens for the specified address
    type: 'function', // Indicates that this is a function
  }
];
```
