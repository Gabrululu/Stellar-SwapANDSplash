import {
  Address,
  BASE_FEE,
  Contract,
  nativeToScVal,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { signXdr } from "./freighter";

const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL;
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE;

export function getServer(): rpc.Server {
  return new rpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });
}

type ScArg = string | number | bigint | boolean | Address;

function toScVal(arg: ScArg): xdr.ScVal {
  if (arg instanceof Address) {
    return arg.toScVal();
  }
  if (typeof arg === "bigint") {
    return nativeToScVal(arg, { type: "i128" });
  }
  return nativeToScVal(arg);
}

/**
 * Invoca una función de un contrato Soroban firmando con la
 * wallet conectada (Freighter). Sirve tanto para llamadas que
 * solo leen (simulación) como para las que necesitan someterse
 * a la red (mint, transfer, swap, register, ...).
 */
export async function invokeContract(opts: {
  contractId: string;
  method: string;
  args?: ScArg[];
  sourceAddress: string;
  submit?: boolean;
}): Promise<unknown> {
  const { contractId, method, args = [], sourceAddress, submit = true } = opts;
  const server = getServer();
  const account = await server.getAccount(sourceAddress);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args.map(toScVal)))
    .setTimeout(60)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulación falló en "${method}": ${simulated.error}`);
  }

  if (!submit) {
    return simulated.result ? scValToNative(simulated.result.retval) : undefined;
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  const signedXdr = await signXdr(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: sourceAddress,
  });

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status === "ERROR") {
    throw new Error(`Envío falló para "${method}": ${JSON.stringify(sendResult.errorResult)}`);
  }

  return pollTransaction(server, sendResult.hash);
}

async function pollTransaction(server: rpc.Server, hash: string): Promise<unknown> {
  for (let i = 0; i < 20; i++) {
    const res = await server.getTransaction(hash);
    if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return res.returnValue ? scValToNative(res.returnValue) : undefined;
    }
    if (res.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transacción ${hash} falló en la red`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Tiempo de espera agotado esperando la transacción ${hash}`);
}

export function addressArg(value: string): Address {
  return Address.fromString(value);
}
