import { useState } from "react";
import { addressArg, invokeContract } from "../lib/contracts";
import type { WalletState } from "../lib/freighter";

interface TokenInfo {
  contract_id: string;
  pool_id: string;
  symbol: string;
  name: string;
  owner: string;
}

interface Props {
  wallet: WalletState;
  selectedToken: TokenInfo | null;
}

export function SwapPanel({ wallet, selectedToken }: Props) {
  const [amountIn, setAmountIn] = useState("100");
  const [buyA, setBuyA] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSwap() {
    if (!selectedToken) return;
    setStatus(null);
    setBusy(true);
    try {
      const out = await invokeContract({
        contractId: selectedToken.pool_id,
        method: "swap",
        args: [addressArg(wallet.address), BigInt(amountIn), 0n, buyA],
        sourceAddress: wallet.address,
      });
      setStatus(`✅ Recibiste ${String(out)} unidades`);
    } catch (err) {
      setStatus(`❌ ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>4. Intercambia en la sala</h2>
      {!selectedToken ? (
        <p>Elige un token del tablero para intercambiar contra su pool.</p>
      ) : (
        <>
          <p>
            Vas a intercambiar contra el pool de <strong>{selectedToken.symbol}</strong>{" "}
            <span className="mono small">({selectedToken.pool_id})</span>
          </p>
          <label>
            Cantidad a intercambiar
            <input
              type="number"
              min={1}
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
          </label>
          <label>
            <input type="checkbox" checked={buyA} onChange={(e) => setBuyA(e.target.checked)} />
            Comprar {selectedToken.symbol} con XLM (desmarca para vender {selectedToken.symbol} por XLM)
          </label>
          <button onClick={handleSwap} disabled={busy}>
            {busy ? "Intercambiando…" : "Swap"}
          </button>
          {status && <p>{status}</p>}
        </>
      )}
    </div>
  );
}
