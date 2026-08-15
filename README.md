# Stellar: Swap&Splash

Taller interactivo donde cada participante diseña, despliega y personaliza su propio token para intercambiarlo con la comunidad.

Dos capas: un **contrato Soroban** (Rust) que define el token, y un **frontend** (Vite + React) que lo conecta a Freighter, permite acuñarlo e intercambiarlo con los tokens de la sala.

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│  1. Clonar Repo │  ──>  │ 2. Editar y Compilar │  ──>  │ 3. Deploy & Mint │
│   Starter Kit   │       │  Rust (SAC / Soroban)│       │  Stellar Testnet │
└─────────────────┘       └──────────────────────┘       └──────────────────┘
                                                                   │
                                                                   ▼
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│ 5. Intercambios │  <──  │  4. Registrar Token  │ <─────┘  Frontend Local  │
│   entre pares   │       │   en Mini DEX común  │       │(Freighter Wallet)│
└─────────────────┘       └──────────────────────┘       └──────────────────┘
```

## ¿De qué trata este taller?

Este taller es una introducción práctica a interactuar con **contratos inteligentes** en una blockchain, usando la red **Stellar**.

**¿Qué es Stellar?** Es una red blockchain pública ([stellar.org](https://stellar.org/)), diseñada originalmente para pagos rápidos y de bajo costo. Su moneda nativa es el **XLM (Lumen)**, que además de usarse como medio de pago sirve para cubrir las comisiones de red. Stellar cuenta con [Soroban](https://developers.stellar.org/docs/build/smart-contracts/overview), su plataforma de contratos inteligentes: programas escritos en Rust, compilados a WebAssembly, que se publican ("despliegan") en la red y luego cualquiera puede invocar sus funciones.

**¿Qué es un contrato inteligente?** Es un programa que vive en la blockchain: su código y su estado (por ejemplo, cuántos tokens tiene cada dirección) quedan almacenados de forma pública y verificable por cualquiera. En este taller, cada token es un contrato inteligente propio, con reglas definidas en `contracts/splash_token/src/lib.rs`.

**¿Qué significa "interactuar" con un contrato?** Cada acción sobre un contrato (acuñar tokens, transferirlos, hacer un swap) es una **transacción**: se construye, se firma con una clave privada y se envía a la red. Una vez confirmada, queda registrada de forma permanente e inmodificable. Por eso todo el taller usa **Testnet**, la red de pruebas de Stellar: funciona igual que la red principal, pero con XLM sin valor real, pensado para practicar sin riesgo. El grifo [Friendbot](https://friendbot.stellar.org/) entrega XLM de prueba gratis a cualquier dirección de Testnet.

**¿Qué es una wallet y para qué sirve Freighter?** Una wallet guarda las claves que identifican una cuenta en la red y es la que firma las transacciones en nombre de la persona usuaria. [Freighter](https://www.freighter.app/) es una extensión de navegador que cumple ese rol: cuando el frontend necesita firmar algo (mintear, registrar, hacer swap), le pide la firma a Freighter en vez de manejar la clave privada directamente.

Con esa base, el taller propone: cada asistente escribe y despliega su propio contrato de token (Commit 1), lo conecta a una interfaz web (Commit 2), lo publica en Testnet (Commit 3) y finalmente lo registra e intercambia con los tokens de las demás personas a través de un mini DEX compartido — todo interactuando en vivo con contratos reales en la blockchain.

### Recursos útiles

- [stellar.org](https://stellar.org/) — sitio oficial de la red Stellar.
- [developers.stellar.org](https://developers.stellar.org/) — documentación técnica de Stellar y Soroban.
- [Stellar Laboratory](https://laboratory.stellar.org/) — herramienta oficial para construir y enviar transacciones a mano, explorar cuentas y consultar el estado de la red en Testnet.
- [Freighter](https://www.freighter.app/) — extensión de wallet para el navegador, necesaria para usar el frontend de este taller.
- [Friendbot](https://friendbot.stellar.org/) — grifo que financia cuentas de Testnet con XLM de prueba.
- [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet) — explorador para ver cuentas, contratos y transacciones de Testnet.

## Estructura

```
contracts/
  splash_token/    # El token — se edita y se despliega
  token_registry/  # Registro compartido (lo despliega quien facilita)
  swap_pool/       # Pool de liquidez x*y=k para el par SplashToken/XLM
scripts/           # deploy_registry.sh, deploy_testnet.sh, initialize.sh
frontend/          # Vite + React + TS, conecta con Freighter
```

## Requisitos

- [pnpm](https://pnpm.io/) (`corepack enable` o `npm i -g pnpm`)
- [Rust](https://rustup.rs/) + target wasm: `rustup target add wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli): `cargo install --locked stellar-cli`
- Extensión [Freighter](https://www.freighter.app/) en el navegador, configurada en red **Testnet**

## Cómo usar este repositorio

Antes de empezar, es necesario solicitar a quien facilita el taller el `CONTRACT_ID` del **registro compartido** (`token_registry`) — se usa en el paso 5. No hace falta desplegarlo: eso lo despliega una sola vez quien facilita.

1. **Clonar este repositorio** y ubicarse en la carpeta del proyecto.

2. **Instalar las dependencias del frontend:**
   ```bash
   pnpm install
   ```

3. **Commit 1 — personalizar el contrato** en `contracts/splash_token/src/lib.rs`:
   - Cambiar las constantes `TOKEN_NAME`, `TOKEN_SYMBOL`, `TOKEN_DECIMALS` e `INITIAL_SUPPLY` por las del token propio.
   - Completar la función `transfer_with_burn` (una transferencia que cobra una comisión y la quema) siguiendo la guía incluida en sus comentarios. Ejecutar `pnpm run test:contracts` para comprobar que la implementación pasa los tests.

4. **Commit 3 — compilar y desplegar el token:**
   ```bash
   pnpm run deploy:testnet -- <alias-propio>
   ```
   Este comando crea, si hace falta, una identidad de Testnet financiada con Friendbot y devuelve dos `CONTRACT_ID`: el de `splash_token` y el de `swap_pool`. Luego hay que inicializarlos (esto acuña el suministro inicial y crea el par SplashToken/XLM):
   ```bash
   pnpm run initialize -- <alias-propio> <TOKEN_ID> <POOL_ID>
   ```

5. **Commit 2 — configurar el frontend:**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   En `frontend/.env`, completar `VITE_TOKEN_REGISTRY_CONTRACT_ID` con el valor entregado por quien facilita, y `VITE_SPLASH_TOKEN_CONTRACT_ID` / `VITE_SWAP_POOL_CONTRACT_ID` con los valores obtenidos en el paso anterior. Luego, en `frontend/src/config/tokenConfig.ts`, definir el logo (un emoji, una URL, o un archivo colocado en `frontend/public/`) y el lema del token.

6. **Iniciar el frontend:**
   ```bash
   pnpm run dev
   ```

7. **En el navegador** (con Freighter instalado y configurado en Testnet):
   - Conectar la wallet y solicitar XLM de prueba con el botón de Friendbot.
   - Acuñar el token propio.
   - Registrarlo en el mini DEX compartido para que aparezca en el tablero de toda la sala.
   - Elegir el token de algún otro participante en el tablero y realizar un swap: la operación se ejecuta contra **el pool de esa persona** (cada quien tiene su propio pool SplashToken/XLM), así que estás intercambiando XLM por su token directamente.

## Tests de los contratos

```bash
pnpm run test:contracts
```
