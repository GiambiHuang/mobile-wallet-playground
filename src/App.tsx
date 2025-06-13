import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useAccount, useWalletClient } from 'wagmi';
import { getContract, parseUnits, zeroAddress } from 'viem';
import { useState } from 'react';
import './App.css'

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
      const signature = await signMessage?.(message);
      
      setSignature(signature ? btoa(String.fromCharCode(...signature)) : '');
      setTxhash('');
      setError('');
    } catch (error) {
      setError(error?.toString() ?? '');
    }
  }

  const handleCall = async () => {
    try {
      if (walletClient && address) {
        const contract = getContract({
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
          address: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
          client: walletClient,
        })

        const tx = await contract.write.transfer([
          address, // myself
          parseUnits('0.001', 18)
        ])
        setTxhash(tx);
      }
    } catch (err) {
      setError(err?.toString() ?? '');
    }
  }

  return (
    <div className="wallets">
      <div className="wallet">
        {/* {'solana wallet connection'} */}
        <WalletMultiButton />
        <button className="sign" onClick={handleSignMessage} disabled={!address}>
          Sign Message
        </button>
      </div>
      <div className="wallet">
        {/* {'ethereum wallet connection'} */}
        <ConnectButton />
        <button className="call" onClick={handleCall} disabled={!signature}>
          Call function
        </button>
      </div>
      <div className="infos">
        {[signature, txhash, error].filter(Boolean).map(msg => <p key={msg}>{msg}</p>)}
      </div>
    </div>
  )
}

export default App
