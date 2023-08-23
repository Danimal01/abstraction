import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ECDSAProvider } from '@zerodev/sdk';
import { createSessionKeySigner, createSessionKey } from "@zerodevapp/sdk"

import { Wallet } from 'ethers';
import { ZeroDevWeb3Auth } from '@zerodev/web3auth';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jwt, setJWT] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const projectId = 'a0ec3d87-0894-4a6f-b744-6314890b13b3';

  useEffect(() => {
    if (email) {
      fetch(`https://jwt-issuer.onrender.com/create-jwt/${email}`)
        .then(response => response.text())
        .then(jwt => setJWT(jwt))
        .catch(error => console.error("Failed to fetch JWT:", error));
    }
  }, [email]);

  const setWallet = useCallback(async (provider) => {
    const ecdsaProvider = await ECDSAProvider.init({
      projectId,
      owner: provider,
    });
    setAddress(await ecdsaProvider.getAddress());
  }, [projectId]);

  const zeroDevWeb3Auth = useMemo(() => {
    const instance = new ZeroDevWeb3Auth([projectId]);
    instance.init({
      onConnect: async () => {
        setLoading(true);
        setWallet(instance.provider);
        setLoading(false);
      },
    });
    return instance;
  }, [setWallet, projectId]);

  const disconnect = async () => {
    await zeroDevWeb3Auth.logout();
    setAddress('');
    setJWT(''); // Resetting JWT upon disconnect
  };

  const handleLogin = async () => {
    setLoading(true);
  
    // Only connect after JWT is fetched
    if (jwt) {
      try {
        const provider = await zeroDevWeb3Auth.connect('jwt', { jwt });
  
        // Set wallet after successful authentication
        await setWallet(provider);
  
        // Create session key
        const whitelist = [
          {
            to: 'ContractAddressHere', // Replace with your contract address
            selectors: [
              // Add specific functions you'd allow for the user to interact with using the session key.
            ],
          },
          //... you can add more contracts and their functions if needed.
        ];
        const validUntil = Math.floor(Date.now() / 1000) + (3600 * 24 * 30); // Session key will be valid for 30 days.
  
        const sessionKey = await createSessionKey(provider, whitelist, validUntil);
        
        const sessionKeySigner = await createSessionKeySigner({
          projectId,
          sessionKeyData: sessionKey,
        });
        // You can now use the sessionKeySigner just like a regular Ethers signer.
  
        setIsLoggedIn(true);
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("JWT is not available");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    await disconnect();
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading || !email}> 
            {loading ? 'Loading...' : 'Login and Create Wallet'}
          </button>
        </div>
      ) : (
        <div>
          <div>Logged in as {email}</div>
          {address && (
            <div>
              <label>Wallet: {address}</label>
            </div>
          )}
          <button onClick={handleLogout} disabled={loading}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
