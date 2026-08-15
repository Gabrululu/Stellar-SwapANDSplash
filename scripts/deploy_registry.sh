#!/usr/bin/env bash
# Despliega el token_registry compartido. Lo corre UNA sola vez
# quien facilita el taller; el CONTRACT_ID resultante se
# distribuye a todos los participantes como
# VITE_TOKEN_REGISTRY_CONTRACT_ID.
#
# Uso:
#   ./scripts/deploy_registry.sh <alias-identidad>
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IDENTITY="${1:-facilitador}"
NETWORK="testnet"

if ! command -v stellar >/dev/null 2>&1; then
  echo "❌ No se encontró 'stellar' CLI. Instálala con: cargo install --locked stellar-cli" >&2
  exit 1
fi

cd "$ROOT_DIR/contracts"
cargo build --target wasm32v1-none --release -p token_registry

if ! stellar keys address "$IDENTITY" >/dev/null 2>&1; then
  stellar keys generate "$IDENTITY" --network "$NETWORK" --fund
fi

REGISTRY_ID="$(stellar contract deploy \
  --wasm "$ROOT_DIR/contracts/target/wasm32v1-none/release/token_registry.wasm" \
  --source "$IDENTITY" \
  --network "$NETWORK")"

ADMIN_ADDRESS="$(stellar keys address "$IDENTITY")"
stellar contract invoke \
  --id "$REGISTRY_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN_ADDRESS"

echo "token_registry CONTRACT_ID: $REGISTRY_ID"
echo "Admin del registro (puede usar unregister): $ADMIN_ADDRESS"
echo "Compártelo con la sala como VITE_TOKEN_REGISTRY_CONTRACT_ID."
