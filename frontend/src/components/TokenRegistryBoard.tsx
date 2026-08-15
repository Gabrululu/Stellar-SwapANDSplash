import { useEffect, useState } from "react";
import { registryConfig, tokenConfig } from "../config/tokenConfig";
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
  onSelect: (token: TokenInfo) => void;
  selected: TokenInfo | null;
}

export function TokenRegistryBoard({ wallet, onSelect, selected }: Props) {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const missingRegistry = !registryConfig.contractId;
  const missingPool = !tokenConfig.swapPoolContractId;

  async function loadTokens() {
    if (missingRegistry) return;
    try {
      const result = (await invokeContract({
        contractId: registryConfig.contractId,
        method: "list_tokens",
        sourceAddress: wallet.address,
        submit: false,
      })) as TokenInfo[];
      setTokens(result ?? []);
    } catch (err) {
      setStatus(`❌ ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  useEffect(() => {
    loadTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address]);

  async function handleRegister() {
    setStatus(null);
    setBusy(true);
    try {
      await invokeContract({
        contractId: registryConfig.contractId,
        method: "register",
        args: [
          addressArg(tokenConfig.contractId),
          addressArg(tokenConfig.swapPoolContractId),
          tokenConfig.symbol,
          tokenConfig.name,
          addressArg(wallet.address),
        ],
        sourceAddress: wallet.address,
      });
      setStatus("✅ Token registrado en el mini DEX");
      await loadTokens();
    } catch (err) {
      setStatus(`❌ ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>3. Regístrate en el mini DEX</h2>
      {missingRegistry ? (
        <p className="warn">
          Falta <code>VITE_TOKEN_REGISTRY_CONTRACT_ID</code>. Pídele a quien facilita el taller el
          CONTRACT_ID del registro compartido.
        </p>
      ) : (
        <>
          <button onClick={handleRegister} disabled={busy || !tokenConfig.contractId || missingPool}>
            {busy ? "Registrando…" : `Registrar ${tokenConfig.symbol}`}
          </button>
          {missingPool && (
            <p className="warn">
              Falta <code>VITE_SWAP_POOL_CONTRACT_ID</code>. Despliega tu pool con{" "}
              <code>pnpm run deploy:testnet</code> antes de registrar.
            </p>
          )}
          {status && <p>{status}</p>}

          <h3>Tokens de la sala</h3>
          <ul className="token-list">
            {tokens.length === 0 && <li>Todavía nadie registró un token 👀</li>}
            {tokens.map((t) => (
              <li
                key={t.contract_id}
                className={selected?.contract_id === t.contract_id ? "selected" : ""}
                onClick={() => onSelect(t)}
              >
                <strong>{t.symbol}</strong> — {t.name}
                <span className="mono small">{t.contract_id}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
