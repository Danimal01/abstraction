import React, { useState, useEffect } from 'react';
import './App.css';
import { ECDSAValidator, ECDSAProvider } from "@zerodev/sdk";
import { PrivateKeySigner } from "@alchemy/aa-core";
import Wallet from 'ethereumjs-wallet';  // Import the ethereumjs-wallet library

function App() {
  const [ecdsaProvider, setEcdsaProvider] = useState(null);

  // Define projectId
  const projectId = 'a0ec3d87-0894-4a6f-b744-6314890b13b3';

  // Generate a new Ethereum wallet using ethereumjs-wallet
  const wallet = Wallet.generate();
  // Extract the private key WITH "0x" prefix and assign to PRIVATE_KEY
  const PRIVATE_KEY = wallet.getPrivateKeyString();

  useEffect(() => {
    let isMounted = true;  // To handle asynchronous operations within useEffect

    const initializeProvider = async () => {
      try {
        const provider = await ECDSAProvider.init({
          projectId,
          owner: PrivateKeySigner.privateKeyToAccountSigner(PRIVATE_KEY),
          opts: {
            paymasterConfig: {
              policy: "VERIFYING_PAYMASTER"
            }
          },
        });
        if (isMounted) setEcdsaProvider(provider);
      } catch (error) {
        console.error("Error initializing the provider:", error);
      }
    }

    initializeProvider();

    return () => {
      isMounted = false;  // To handle component unmount scenarios
    }
  }, []);  // The empty dependency array ensures this useEffect runs once when the component mounts.

  return (
    <div className="App">
      hi
    </div>
  );
}

export default App;
