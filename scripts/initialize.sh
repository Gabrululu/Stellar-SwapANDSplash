#!/usr/bin/env bash
# Inicializa el workshop_token y el swap_pool ya desplegados: acuña
# el suministro inicial y crea el pool Token/XLM.
#
# Uso:
#   ./scripts/initialize.sh <alias-identidad> <TOKEN_ID> <POOL_ID> [XLM_SAC_ID]
set -euo pipefail

IDENTITY="${1:?Falta el alias de tu identidad}"
TOKEN_ID="${2:?Falta el CONTRACT_ID de tu token}"
POOL_ID="${3:?Falta el CONTRACT_ID de swap_pool}"
NETWORK="testnet"

# SAC (Stellar Asset Contract) del XLM nativo en Testnet.
NATIVE_XLM_ID="${4:-CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC}"

if ! command -v stellar >/dev/null 2>&1; then
  echo "❌ No se encontró 'stellar' CLI. Instálala con: cargo install --locked stellar-cli" >&2
  exit 1
fi

ADMIN_ADDRESS="$(stellar keys address "$IDENTITY")"

echo "== Inicializando workshop_token =="
stellar contract invoke \
  --id "$TOKEN_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN_ADDRESS"

echo "== Inicializando swap_pool (Token/XLM) =="
stellar contract invoke \
  --id "$POOL_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- initialize --admin "$ADMIN_ADDRESS" --token_a "$TOKEN_ID" --token_b "$NATIVE_XLM_ID"

echo "== Sembrando liquidez inicial del pool (10% del supply + 50 XLM) =="
TOTAL_SUPPLY="$(stellar contract invoke \
  --id "$TOKEN_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- total_supply | tr -d '"')"
DEPOSIT_TOKEN_AMOUNT="$((TOTAL_SUPPLY / 10))"
DEPOSIT_XLM_AMOUNT="500000000"
stellar contract invoke \
  --id "$POOL_ID" --source "$IDENTITY" --network "$NETWORK" \
  -- deposit --from "$ADMIN_ADDRESS" --amount_a "$DEPOSIT_TOKEN_AMOUNT" --amount_b "$DEPOSIT_XLM_AMOUNT"

echo "✅ Listo. Ya puedes mintear, registrar tu token y hacer swap desde el frontend."
