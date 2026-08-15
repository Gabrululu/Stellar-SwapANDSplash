#!/usr/bin/env bash
# Inicializa el splash_token y el swap_pool ya desplegados: acuña
# el suministro inicial y crea el pool SplashToken/XLM.
#
# Uso:
#   ./scripts/initialize.sh <alias-identidad> <TOKEN_ID> <POOL_ID> [XLM_SAC_ID]
set -euo pipefail

IDENTITY="${1:?Falta el alias de tu identidad}"
TOKEN_ID="${2:?Falta el CONTRACT_ID de splash_token}"
POOL_ID="${3:?Falta el CONTRACT_ID de swap_pool}"
NETWORK="testnet"

# SAC (Stellar Asset Contract) del XLM nativo en Testnet.
NATIVE_XLM_ID="${4:-CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC}"

if ! command -v stellar >/dev/null 2>&1; then
  echo "❌ No se encontró 'stellar' CLI. Instálala con: cargo install --locked stellar-cli" >&2
  exit 1
fi

ADMIN_ADDRESS="$(stellar keys address "$IDENTITY")"

echo "== Inicializando splash_token =="
stellar contract invoke \
  --id "$TOKEN_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN_ADDRESS"

echo "== Inicializando swap_pool (SplashToken/XLM) =="
stellar contract invoke \
  --id "$POOL_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN_ADDRESS" --token_a "$TOKEN_ID" --token_b "$NATIVE_XLM_ID"

echo "✅ Listo. Ya puedes mintear, registrar tu token y hacer swap desde el frontend."
