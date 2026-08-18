#!/usr/bin/env bash
# Compila y despliega workshop_token + swap_pool en Stellar Testnet.
# Requiere: stellar-cli (`cargo install --locked stellar-cli`) y
# una identidad configurada (`stellar keys generate <alias>`).
#
# Uso:
#   ./scripts/deploy_testnet.sh <alias-de-tu-identidad>
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IDENTITY="${1:-taller}"
NETWORK="testnet"

if ! command -v stellar >/dev/null 2>&1; then
  echo "❌ No se encontró 'stellar' CLI. Instálala con: cargo install --locked stellar-cli" >&2
  exit 1
fi

echo "== 1/4: Compilando contratos a wasm =="
cd "$ROOT_DIR/contracts"
cargo build --target wasm32v1-none --release

WASM_DIR="$ROOT_DIR/contracts/target/wasm32v1-none/release"

if ! stellar keys address "$IDENTITY" >/dev/null 2>&1; then
  echo "== Creando identidad '$IDENTITY' y fondeándola en Testnet =="
  stellar keys generate "$IDENTITY" --network "$NETWORK" --fund
fi
ADMIN_ADDRESS="$(stellar keys address "$IDENTITY")"
echo "Admin: $ADMIN_ADDRESS"

echo "== 2/4: Desplegando workshop_token =="
# --salt aleatorio: sin esto, `stellar contract deploy` usa un salt fijo y
# la misma identidad siempre obtiene la MISMA dirección de contrato, sin
# importar que el código wasm haya cambiado (el contract_id depende de
# cuenta+salt, no del wasm). Eso rompe el `register` en token_registry
# si vuelves a desplegar (el contract_id ya estaría registrado).
TOKEN_ID="$(stellar contract deploy \
  --wasm "$WASM_DIR/workshop_token.wasm" \
  --source "$IDENTITY" \
  --network "$NETWORK" \
  --salt "$(openssl rand -hex 32)")"
echo "workshop_token CONTRACT_ID: $TOKEN_ID"

echo "== 3/4: Desplegando swap_pool =="
POOL_ID="$(stellar contract deploy \
  --wasm "$WASM_DIR/swap_pool.wasm" \
  --source "$IDENTITY" \
  --network "$NETWORK" \
  --salt "$(openssl rand -hex 32)")"
echo "swap_pool CONTRACT_ID: $POOL_ID"

echo "== 4/4: Listo =="
cat <<EOF

Copia estos valores en frontend/.env:

VITE_TOKEN_CONTRACT_ID=$TOKEN_ID
VITE_SWAP_POOL_CONTRACT_ID=$POOL_ID

Luego corre: pnpm run initialize $IDENTITY $TOKEN_ID $POOL_ID
EOF
