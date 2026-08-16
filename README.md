# Stellar: Swap & Splash

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

Necesitas: **git**, **Node.js** (18+) con **pnpm**, **Rust** con el target `wasm32v1-none`, la **Stellar CLI**, y la extensión de navegador **Freighter**. A continuación, cómo instalar cada uno según tu sistema operativo.

> 🪟 **¿Usas Windows?** Se recomienda instalar [WSL2](https://learn.microsoft.com/es-es/windows/wsl/install) (Windows Subsystem for Linux) y ejecutar **todos** los comandos de este README dentro de tu distro WSL (ej. Ubuntu), no en PowerShell/CMD. La Stellar CLI y las herramientas de Rust no ofrecen soporte confiable en Windows nativo. Una vez dentro de WSL, sigue las instrucciones de "Linux" de abajo.

<details>
<summary><strong>Linux / WSL2 (Ubuntu/Debian)</strong></summary>

```bash
# git (normalmente ya viene instalado; si no):
sudo apt update && sudo apt install -y git build-essential pkg-config libssl-dev

# Node.js 18+ (via nvm, evita permisos raros de npm global)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts

# pnpm
corepack enable

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32v1-none

# Stellar CLI (tarda varios minutos en compilar)
cargo install --locked stellar-cli
```
</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
# Homebrew, si no lo tienes: https://brew.sh
brew install git node

# pnpm
corepack enable

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32v1-none

# Stellar CLI (tarda varios minutos en compilar)
cargo install --locked stellar-cli
```
</details>

Después de instalar, verifica que todo esté en el `PATH` con:
```bash
git --version && node --version && pnpm --version && rustc --version && stellar --version
```
Si algún comando "no se encuentra" tras instalarlo, cierra y vuelve a abrir la terminal (o corre `source ~/.bashrc` / `source ~/.zshrc`) para que tome el `PATH` actualizado.

Por último, instala la extensión [Freighter](https://www.freighter.app/) en tu navegador (Chrome, Firefox o Brave) y, dentro de la extensión, cambia la red a **Testnet** (ícono de configuración → "Network").

## Cómo usar este repositorio

Antes de empezar, es necesario tener el `CONTRACT_ID` del **registro compartido** (`token_registry`) — se usa en el paso 6. No hace falta desplegarlo, eso ya esta desplegado: [`CBLSOKKOQP4LJZUOEQKYJ2YR3RTCZK2GLFHZ7JLGQUCFIW4MNTNORP4F`](https://stellar.expert/explorer/testnet/contract/CBLSOKKOQP4LJZUOEQKYJ2YR3RTCZK2GLFHZ7JLGQUCFIW4MNTNORP4F)

1. **Clonar este repositorio** y ubicarse en la carpeta del proyecto:
   ```bash
   git clone https://github.com/Gabrululu/Stellar-SwapANDSplash
   cd Stellar-SwapANDSplash
   ```

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
   Estos comandos crearon una identidad **`<alias-propio>`** que es la administradora (`admin`) de tu `splash_token` — es una clave distinta a la que usa tu wallet en el navegador. Solo esa identidad puede llamar a `mint` (ver siguiente paso), así que antes de usar el frontend hay que llevarla a Freighter.

5. **Importar tu identidad admin en Freighter** (necesario para poder mintear desde el frontend más adelante):
   ```bash
   stellar keys show <alias-propio>
   ```
   Copia la clave secreta que imprime (empieza con `S...`). En Freighter: menú (⋮) → **"Add account"** → **"Import a Stellar secret key"** → pégala. Verifica que la red siga en **Testnet** y deja esa cuenta seleccionada como activa — será la wallet que conectes en el paso 8.

   ⚠️ Esta clave es solo de **Testnet**, sin valor real, y es tuya: nunca la compartas ni la subas al repositorio. Cada participante genera y usa únicamente su propia identidad — nadie necesita la clave de nadie más.

6. **Commit 2 — configurar el frontend:**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   En `frontend/.env`, completar `VITE_TOKEN_REGISTRY_CONTRACT_ID` con el valor entregado por quien facilita, y `VITE_SPLASH_TOKEN_CONTRACT_ID` / `VITE_SWAP_POOL_CONTRACT_ID` con los valores obtenidos en el paso anterior. Luego, en `frontend/src/config/tokenConfig.ts`, definir el logo (un emoji, una URL, o un archivo colocado en `frontend/public/`) y el lema del token.

7. **Iniciar el frontend:**
   ```bash
   pnpm run dev
   ```
   Abre la URL que imprime la terminal (normalmente `http://localhost:5173`).

8. **En el navegador** (con Freighter instalado, en Testnet, y con la cuenta importada en el paso 5 seleccionada):
   - Conectar la wallet y solicitar XLM de prueba con el botón de Friendbot.
   - Acuñar el token propio.
   - Registrarlo en el mini DEX compartido para que aparezca en el tablero de toda la sala.
   - Elegir el token de algún otro participante en el tablero y realizar un swap: la operación se ejecuta contra **el pool de esa persona** (cada quien tiene su propio pool SplashToken/XLM), así que estás intercambiando XLM por su token directamente.

## Tests de los contratos

```bash
pnpm run test:contracts
```

## Solución de problemas comunes

- **`❌ Transacción ... falló en la red` al presionar Mint**: casi siempre significa que la wallet conectada en Freighter no es la identidad admin de tu `splash_token` (la que corrió `initialize.sh`). Solo el admin puede mintear (`require_auth` en el contrato lo exige). Revisa el paso 5 — importa la clave secreta de tu `<alias-propio>` (`stellar keys show <alias-propio>`) en Freighter y conéctate con esa cuenta.
- **`error: target 'wasm32v1-none' not found` o similar al compilar**: falta el target de Rust. Corre `rustup target add wasm32v1-none`.
- **`stellar: command not found`** tras instalarlo: asegúrate de que `~/.cargo/bin` esté en tu `PATH` (`source "$HOME/.cargo/env"`) y abre una terminal nueva.
- **`pnpm: command not found`**: corre `corepack enable` (viene con Node 16.9+); si sigue sin aparecer, `npm i -g pnpm`.
- **Freighter no aparece / el frontend no detecta la wallet**: confirma que la extensión esté instalada, desbloqueada, y en red **Testnet** (no Mainnet ni Futurenet).
- **`Falta VITE_SPLASH_TOKEN_CONTRACT_ID en tu .env`**: te faltó completar `frontend/.env` con los `CONTRACT_ID` del paso 4 (ver paso 6).
- **En Windows, comandos que fallan de formas raras (paths, permisos, compilación de Rust)**: usa WSL2 en vez de PowerShell/CMD — ver la sección de Requisitos.
