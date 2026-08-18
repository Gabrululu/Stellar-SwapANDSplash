/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK: string;
  readonly VITE_SOROBAN_RPC_URL: string;
  readonly VITE_NETWORK_PASSPHRASE: string;
  readonly VITE_TOKEN_REGISTRY_CONTRACT_ID: string;
  readonly VITE_TOKEN_CONTRACT_ID: string;
  readonly VITE_SWAP_POOL_CONTRACT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
