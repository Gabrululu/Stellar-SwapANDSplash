import { useEffect, useState } from "react";
import { NATIVE_XLM_CONTRACT_ID } from "../config/tokenConfig";
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
  const [balanceIn, setBalanceIn] = useState<bigint | null>(null);

  // Balance de lo que vas a PAGAR: XLM si compras, el token si vendes.
  // Sirve para avisar antes de firmar en vez de dejar que el swap
  // "funcione" con un resultado de 0 (o falle confuso) porque no
  // tienes saldo de lo que quieres vender.
  useEffect(() => {
    if (!selectedToken || !wallet.address) {
      setBalanceIn(null);
      return;
    }
    const contractId = buyA ? NATIVE_XLM_CONTRACT_ID : selectedToken.contract_id;
    let cancelled = false;
    invokeContract({
      contractId,
      method: "balance",
      args: [addressArg(wallet.address)],
      sourceAddress: wallet.address,
      submit: false,
    })
      .then((res) => {
        if (!cancelled) setBalanceIn(BigInt(res as bigint | number | string));
      })
      .catch(() => {
        if (!cancelled) setBalanceIn(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedToken, wallet.address, buyA]);

  const symbolIn = buyA ? "XLM" : selectedToken?.symbol ?? "";
  const insufficientBalance =
    balanceIn !== null && amountIn !== "" && BigInt(amountIn || "0") > balanceIn;

  async function handleSwap() {
    if (!selectedToken) return;
    setStatus(null);

    if (insufficientBalance) {
      setStatus(
        `❌ No te alcanza: tienes ${balanceIn} ${symbolIn} y quieres pagar ${amountIn} ${symbolIn}.`,
      );
      return;
    }

    setBusy(true);
    try {
      const out = await invokeContract({
        contractId: selectedToken.pool_id,
        method: "swap",
        args: [addressArg(wallet.address), BigInt(amountIn), 0n, buyA],
        sourceAddress: wallet.address,
      });
      if (String(out) === "0") {
        setStatus(
          "⚠️ El swap se ejecutó pero recibiste 0 unidades: el monto es demasiado chico frente a la liquidez del pool. Prueba con un monto mayor.",
        );
      } else {
        setStatus(`✅ Recibiste ${String(out)} unidades`);
      }
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
            Pool <strong>{selectedToken.symbol} / XLM</strong>{" "}
            <span className="mono small">({selectedToken.pool_id})</span>
          </p>

          <div className="swap-direction">
            <button
              type="button"
              className={buyA ? "selected" : ""}
              onClick={() => setBuyA(true)}
            >
              Comprar {selectedToken.symbol}
            </button>
            <button
              type="button"
              className={!buyA ? "selected" : ""}
              onClick={() => setBuyA(false)}
            >
              Vender {selectedToken.symbol}
            </button>
          </div>

          <label>
            {buyA ? `Cantidad de XLM a pagar` : `Cantidad de ${selectedToken.symbol} a vender`}
            <input
              type="number"
              min={1}
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
          </label>
          <p className={`small ${insufficientBalance ? "error" : ""}`}>
            Tu balance de {symbolIn}: {balanceIn === null ? "cargando…" : String(balanceIn)}
            {insufficientBalance && " — no te alcanza para este monto"}
          </p>
          <p className="small">
            {buyA
              ? `Pagas ${amountIn || 0} XLM y recibes ${selectedToken.symbol} a cambio.`
              : `Pagas ${amountIn || 0} ${selectedToken.symbol} y recibes XLM a cambio.`}
          </p>

          <button onClick={handleSwap} disabled={busy || insufficientBalance}>
            {busy ? "Intercambiando…" : buyA ? `Comprar ${selectedToken.symbol}` : `Vender ${selectedToken.symbol}`}
          </button>
          {status && <p>{status}</p>}
        </>
      )}
    </div>
  );
}
