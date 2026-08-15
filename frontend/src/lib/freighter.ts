import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

export interface WalletState {
  address: string;
  network: string;
}

export async function connectFreighter(): Promise<WalletState> {
  const connected = await isConnected();
  if (!connected.isConnected) {
    throw new Error(
      "No se detectó Freighter. Instala la extensión: https://www.freighter.app/",
    );
  }

  const allowed = await isAllowed();
  if (!allowed.isAllowed) {
    const access = await requestAccess();
    if (access.error) {
      throw new Error(access.error);
    }
  }

  const addressResult = await getAddress();
  if (addressResult.error) {
    throw new Error(addressResult.error);
  }

  const networkResult = await getNetwork();
  if (networkResult.error) {
    throw new Error(networkResult.error);
  }

  return { address: addressResult.address, network: networkResult.network };
}

export async function signXdr(
  xdr: string,
  opts: { networkPassphrase: string; address: string },
): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase: opts.networkPassphrase,
    address: opts.address,
  });
  if (result.error) {
    throw new Error(result.error);
  }
  return result.signedTxXdr;
}

export async function fundWithFriendbot(address: string): Promise<void> {
  const res = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`,
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Friendbot falló: ${body}`);
  }
}
