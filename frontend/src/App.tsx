import { useState } from "react";
import { ConnectWallet } from "./components/ConnectWallet";
import { MintPanel } from "./components/MintPanel";
import { SwapPanel } from "./components/SwapPanel";
import { TokenRegistryBoard } from "./components/TokenRegistryBoard";
import type { WalletState } from "./lib/freighter";

interface TokenInfo {
  contract_id: string;
  pool_id: string;
  symbol: string;
  name: string;
  owner: string;
}

export default function App() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

  return (
    <main className="app">
      <header>
        <h1>Stellar: Swap &amp; Splash 🌊</h1>
        <p>Diseña, despliega y personaliza tu propio token en Stellar Testnet.</p>
      </header>

      <ConnectWallet wallet={wallet} onConnected={setWallet} />

      {wallet && (
        <>
          <MintPanel wallet={wallet} />
          <TokenRegistryBoard wallet={wallet} selected={selectedToken} onSelect={setSelectedToken} />
          <SwapPanel wallet={wallet} selectedToken={selectedToken} />
        </>
      )}
    </main>
  );
}
