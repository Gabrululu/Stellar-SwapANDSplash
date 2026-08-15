// ============================================================
// 🎨 PERSONALIZA TU TOKEN AQUÍ — Commit 2 del taller
// ============================================================
// Después de compilar y desplegar tu contrato (`pnpm run
// deploy:testnet`), pega aquí el CONTRACT_ID que te dio la
// Stellar CLI y cuéntanos la historia de tu token.

export const tokenConfig = {
  /** CONTRACT_ID de tu splash_token en Testnet (Commit 2). */
  contractId: import.meta.env.VITE_SPLASH_TOKEN_CONTRACT_ID ?? "",

  /** CONTRACT_ID del swap pool SplashToken/XLM que desplegaste. */
  swapPoolContractId: import.meta.env.VITE_SWAP_POOL_CONTRACT_ID ?? "",

  /** Debe coincidir con TOKEN_SYMBOL en contracts/splash_token/src/lib.rs */
  symbol: "SPLASH",

  /** Debe coincidir con TOKEN_NAME en contracts/splash_token/src/lib.rs */
  name: "Splash Token",

  /** Lema o descripción corta de tu token. */
  tagline: "El primer paso de mi token en Stellar 🚀",

  /**
   * Logo de tu token: usa una URL, un emoji, o coloca un archivo
   * en `frontend/public/` y referencia "/tu-logo.png".
   */
  logo: "🪙",
} satisfies {
  contractId: string;
  swapPoolContractId: string;
  symbol: string;
  name: string;
  tagline: string;
  logo: string;
};

export const registryConfig = {
  contractId: import.meta.env.VITE_TOKEN_REGISTRY_CONTRACT_ID ?? "",
};
