import { useState } from "react";
import { tokenConfig } from "../config/tokenConfig";
import { addressArg, invokeContract } from "../lib/contracts";
import type { WalletState } from "../lib/freighter";

interface Props {
  wallet: WalletState;
}

export function MintPanel({ wallet }: Props) {
  const [amount, setAmount] = useState("1000");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const missingContract = !tokenConfig.contractId;

  async function handleMint() {
    setStatus(null);
    setBusy(true);
    try {
      await invokeContract({
        contractId: tokenConfig.contractId,
        method: "mint",
        args: [addressArg(wallet.address), BigInt(amount)],
        sourceAddress: wallet.address,
      });
      setStatus(`✅ Minteados ${amount} ${tokenConfig.symbol}`);
    } catch (err) {
      setStatus(`❌ ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>2. Mintea tu token</h2>
      <div className="token-header">
        <span className="logo">{tokenConfig.logo}</span>
        <div>
          <strong>
            {tokenConfig.name} ({tokenConfig.symbol})
          </strong>
          <p className="tagline">{tokenConfig.tagline}</p>
        </div>
      </div>

      {missingContract ? (
        <p className="warn">
          Falta <code>VITE_SPLASH_TOKEN_CONTRACT_ID</code> en tu <code>.env</code>. Despliega tu
          contrato con <code>pnpm run deploy:testnet</code> y pega el CONTRACT_ID (Commit 2).
        </p>
      ) : (
        <>
          <label>
            Cantidad
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button onClick={handleMint} disabled={busy}>
            {busy ? "Minteando…" : "Mint"}
          </button>
        </>
      )}
      {status && <p>{status}</p>}
    </div>
  );
}
