import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import './App.css'
import { useAccount, useWalletClient } from 'wagmi';
import { encodeFunctionData, parseUnits, zeroAddress } from 'viem';
import { useState } from 'react';

function App() {
  const { signMessage } = useSolanaWallet();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signature, setSignature] = useState<string>('');
  const [txhash, setTxhash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSignMessage = async () => {
    const message = new TextEncoder().encode(address ?? zeroAddress);
    try {
      const signature = await signMessage?.(message)
      setSignature(signature ? Buffer.from(signature).toString('base64') : '');
      setTxhash('');
      setError('');
    } catch (error) {
      setError(error?.toString() ?? '');
    }
  }

  const handleCall = async () => {
    const data = encodeFunctionData({
      abi: [{
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      }],
      functionName: 'transfer',
      args: [address ?? zeroAddress, parseUnits('0.1', 6)],
    });

    try {
      if (walletClient && address) {
        const txHash = await walletClient?.sendTransaction({
          to: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // testnet usdc
          data,
          value: 0n,
          account: address,
        });
        setTxhash(txHash);
      }
    } catch (err) {
      setError(err?.toString() ?? '');
    }
  }

  return (
    <div className="wallets">
      <div className="wallet">
        <WalletMultiButton />
        <button className="sign" onClick={handleSignMessage} disabled={!address}>
          Sign Message
        </button>
      </div>
      <div className="wallet">
        <ConnectButton />
        <button className="call" onClick={handleCall} disabled={!signature}>
          Call function
        </button>
      </div>
      <div className="infos">
        {[signature, txhash, error].filter(Boolean).map(msg => <p>{msg}</p>)}
      </div>
    </div>
  )
}

export default App
