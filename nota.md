## Antes del taller

1. Instalar los requisitos del `README.md` (pnpm, Rust + target `wasm32v1-none`, [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli)).

2. Desplegar el registro compartido **una sola vez**, antes de que lleguen los asistentes:
   ```bash
   pnpm run deploy:registry -- facilitador
   ```
   Esto crea la identidad `facilitador` (financiada con [Friendbot](https://friendbot.stellar.org/)) y la deja como **administradora** del registro. El comando también llama a `initialize` automáticamente.

3. Compartir con la sala el `CONTRACT_ID` resultante — cada asistente lo pegará como `VITE_TOKEN_REGISTRY_CONTRACT_ID` en su `frontend/.env`.

4. **⚠️ Antes de repartir el repositorio**, revertir `transfer_with_burn` en `contracts/splash_token/src/lib.rs` al `panic!` de plantilla, y volver a comentar los tests `test_transfer_with_burn_charges_fee` / `test_transfer_with_burn_insufficient_balance_panics` en `contracts/splash_token/src/test.rs`, para que sea un ejercicio real del Commit 1 y no una copia ya resuelta.

   > **Estado actual de esta copia de trabajo:** ambos ya están resueltos (se implementó y probó `transfer_with_burn` con comisión del 1% que se quema, ver sección "Cambios del kit" abajo). Esto fue a propósito, para validar el flujo de punta a punta antes del taller — no lo repartas así.

## Durante el taller

- Si hace falta quitar un token viejo o de pruebas del tablero del mini DEX:
  ```bash
  stellar contract invoke --id <REGISTRY_ID> --source facilitador --network testnet \
    -- unregister --admin <address-del-administrador> --contract_id <CONTRACT_ID-a-remover>
  ```
- Ver la dirección de la identidad `facilitador` en cualquier momento:
  ```bash
  stellar keys address facilitador
  ```
- Para inspeccionar o invocar un contrato a mano sin usar la terminal, el [Stellar Laboratory](https://laboratory.stellar.org/) permite construir y enviar transacciones de forma visual.

## Cambios del kit (de esta sesión, importante para quien lo mantiene)

Se detectaron y corrigieron dos problemas del starter kit original antes de usarlo en el taller:

1. **El swap siempre operaba contra tu propio pool**, sin importar qué token eligieras en el tablero — no había forma real de intercambiar con otra persona. Se corrigió agregando `pool_id` al `token_registry` (`register()` ahora recibe `contract_id, pool_id, symbol, name, owner`, un argumento más que antes) y conectando `SwapPanel` para que use `selectedToken.pool_id` en vez de tu propio `VITE_SWAP_POOL_CONTRACT_ID`.

   **⚠️ Esto es un cambio de interfaz del contrato `token_registry`**: cualquier `CONTRACT_ID` de registro desplegado con la versión vieja del contrato ya no es compatible (el `register()` viejo esperaba 4 argumentos). Si ya habías compartido un `CONTRACT_ID` de registro con alguien, hay que redesplegar (`pnpm run deploy:registry -- facilitador`) y volver a compartir el nuevo.

2. **`scripts/initialize.sh` nunca sembraba liquidez en el pool** (le faltaba el `deposit`) — todo swap habría fallado con "el pool no tiene liquidez todavía". Ahora, tras inicializar token y pool, el script deposita automáticamente 10% del `total_supply` del token + 50 XLM como liquidez inicial.

## Referencia: despliegues de esta sesión (Testnet)

Identidades usadas: `facilitador` (admin del registro compartido), `admin` (token personal de prueba, nombrado "Stellar en acción"), y `participante`/`bob_test` (usadas solo para probar el swap cruzado — ya **desregistradas** del tablero, no hace falta limpiar nada más).

| Contrato | CONTRACT_ID |
|---|---|
| `token_registry` (admin: `facilitador`) — **vigente, con `pool_id`** | [`CBLSOKKOQP4LJZUOEQKYJ2YR3RTCZK2GLFHZ7JLGQUCFIW4MNTNORP4F`](https://stellar.expert/explorer/testnet/contract/CBLSOKKOQP4LJZUOEQKYJ2YR3RTCZK2GLFHZ7JLGQUCFIW4MNTNORP4F) |
| `splash_token` "Stellar en acción" (admin: `admin`) | [`CDBGG6WBJXHHFIKZGHXL4IVHA5JXW3FBH2ORCVJJIUFIBEN6WSXPHZBY`](https://stellar.expert/explorer/testnet/contract/CDBGG6WBJXHHFIKZGHXL4IVHA5JXW3FBH2ORCVJJIUFIBEN6WSXPHZBY) |
| `swap_pool` (con liquidez: 100,000 tokens + 50 XLM) | [`CDUIFHNQY5XSA3FDL7BDDE4TKRJVGL2XYVUNGPVGPFVX7QWCW4EVWC3G`](https://stellar.expert/explorer/testnet/contract/CDUIFHNQY5XSA3FDL7BDDE4TKRJVGL2XYVUNGPVGPFVX7QWCW4EVWC3G) |

Estos son los valores que ya están cargados en `frontend/.env` en esta copia de trabajo. El registro anterior (`CBFGJCBIKB...`) y un primer deploy del token propio (antes de renombrarlo) quedaron obsoletos en Testnet — no hace falta limpiarlos, simplemente no se usan más.

Para el taller real, cada asistente (incluida quien facilita, si desea su propio token) desplegará su propia instancia de `splash_token` y `swap_pool` siguiendo el `README.md`.

## Recursos útiles

- [stellar.org](https://stellar.org/) — sitio oficial de la red Stellar.
- [developers.stellar.org](https://developers.stellar.org/) — documentación técnica de Stellar y Soroban.
- [Stellar Laboratory](https://laboratory.stellar.org/) — construir y enviar transacciones a mano, explorar cuentas y consultar el estado de la red en Testnet.
- [Freighter](https://www.freighter.app/) — extensión de wallet para el navegador.
- [Friendbot](https://friendbot.stellar.org/) — grifo que financia cuentas de Testnet con XLM de prueba.
- [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet) — explorador para ver cuentas, contratos y transacciones de Testnet.
