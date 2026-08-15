# Notas para facilitar el taller

Indicaciones a seguir por quien organiza y dicta el taller "Stellar: Swap&Splash". El `README.md` está pensado para la persona asistente; este archivo es la guía propia de quien facilita.

## Antes del taller

1. Instalar los requisitos del `README.md` (pnpm, Rust + target `wasm32v1-none`, [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli)).

2. Desplegar el registro compartido **una sola vez**, antes de que lleguen los asistentes:
   ```bash
   pnpm run deploy:registry -- facilitador
   ```
   Esto crea la identidad `facilitador` (financiada con [Friendbot](https://friendbot.stellar.org/)) y la deja como **administradora** del registro. El comando también llama a `initialize` automáticamente.

3. Compartir con la sala el `CONTRACT_ID` resultante — cada asistente lo pegará como `VITE_TOKEN_REGISTRY_CONTRACT_ID` en su `frontend/.env`.

4. Antes de repartir el repositorio, confirmar que `transfer_with_burn` en `contracts/splash_token/src/lib.rs` esté sin resolver (el `panic!` de plantilla), para que sea un ejercicio real del Commit 1 y no una copia ya resuelta.

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

## Referencia: despliegue de prueba de esta sesión

Valores usados para validar el flujo completo antes del taller (identidad `participante`, financiada con Friendbot). El enlace de cada fila abre el contrato en Stellar Expert (Testnet):

| Contrato | CONTRACT_ID |
|---|---|
| `token_registry` (admin: `facilitador`) | [`CBFGJCBIKBRDX7R5PF4GUIQXGLUVWQUVUMVYJJTL5SYJSLZ6CEKWOIRT`](https://stellar.expert/explorer/testnet/contract/CBFGJCBIKBRDX7R5PF4GUIQXGLUVWQUVUMVYJJTL5SYJSLZ6CEKWOIRT) |
| `splash_token` (con el stub de `transfer_with_burn` sin resolver) | [`CCLW6AFKK62BAKJG35CK5T5TRDQIHKHRSDGVGBY4VNFUCAILA6KKA6AQ`](https://stellar.expert/explorer/testnet/contract/CCLW6AFKK62BAKJG35CK5T5TRDQIHKHRSDGVGBY4VNFUCAILA6KKA6AQ) |
| `swap_pool` (SplashToken/XLM, con liquidez de prueba) | [`CABVG5OD7KWYYFVAKCY5OJOV2QKQB2PUCR6ZTVDHSKLGO7CWKG4TRDTB`](https://stellar.expert/explorer/testnet/contract/CABVG5OD7KWYYFVAKCY5OJOV2QKQB2PUCR6ZTVDHSKLGO7CWKG4TRDTB) |

Estos son los valores que ya están cargados en `frontend/.env` en esta copia de trabajo. Para el taller real, cada asistente (incluida quien facilita, si desea su propio token) desplegará su propia instancia de `splash_token` y `swap_pool` siguiendo el `README.md`.

## Recursos útiles

- [stellar.org](https://stellar.org/) — sitio oficial de la red Stellar.
- [developers.stellar.org](https://developers.stellar.org/) — documentación técnica de Stellar y Soroban.
- [Stellar Laboratory](https://laboratory.stellar.org/) — construir y enviar transacciones a mano, explorar cuentas y consultar el estado de la red en Testnet.
- [Freighter](https://www.freighter.app/) — extensión de wallet para el navegador.
- [Friendbot](https://friendbot.stellar.org/) — grifo que financia cuentas de Testnet con XLM de prueba.
- [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet) — explorador para ver cuentas, contratos y transacciones de Testnet.
