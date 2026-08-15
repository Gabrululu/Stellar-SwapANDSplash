import { useState } from "react";
import { connectFreighter, fundWithFriendbot, type WalletState } from "../lib/freighter";

interface Props {
  wallet: WalletState | null;
  onConnected: (wallet: WalletState) => void;
}

const URL_RE = /(https?:\/\/[^\s]+)/g;

function withLinks(text: string) {
  return text.split(URL_RE).map((part, i) =>
    part.startsWith("http") ? (
      <a key={i} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function ConnectWallet({ wallet, onConnected }: Props) {
  const [busy, setBusy] = useState<"connect" | "fund" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fundStatus, setFundStatus] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setBusy("connect");
    try {
      const state = await connectFreighter();
      onConnected(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleFund() {
    if (!wallet) return;
    setFundStatus(null);
    setBusy("fund");
    try {
      await fundWithFriendbot(wallet.address);
      setFundStatus("✅ Cuenta financiada con XLM de prueba.");
    } catch (err) {
      setFundStatus(`❌ ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  }

  if (!wallet) {
    return (
      <div className="card">
        <h2>1. Conecta tu wallet</h2>
        <button onClick={handleConnect} disabled={busy === "connect"}>
          {busy === "connect" ? "Conectando…" : "Conectar Freighter"}
        </button>
        {error && <p className="error">{withLinks(error)}</p>}
      </div>
    );
  }

  return (
    <div className="card">
      <h2>1. Wallet conectada</h2>
      <p className="mono">{wallet.address}</p>
      <p>
        Red: <strong>{wallet.network}</strong>
      </p>
      <button onClick={handleFund} disabled={busy === "fund"}>
        {busy === "fund" ? "Pidiendo XLM…" : "Pedir XLM de prueba (Friendbot)"}
      </button>
      {fundStatus && <p>{fundStatus}</p>}
    </div>
  );
}
