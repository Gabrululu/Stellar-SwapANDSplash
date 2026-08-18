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

Con esa base, el taller propone: cada asistente escribe y personaliza su propio contrato de token, lo despliega en Testnet, lo conecta a una interfaz web y finalmente lo registra e intercambia con los tokens de las demás personas a través de un mini DEX compartido — todo interactuando en vivo con contratos reales en la blockchain.

> 📘 **Antes de empezar**, si es tu primera vez en el ecosistema Stellar te recomendamos leer [skills.stellar.org](https://skills.stellar.org/) — una guía introductoria oficial, pensada para quienes recién llegan, que explica los conceptos base (cuentas, red, Soroban) con más calma de la que da este README.

### Glosario rápido

Si nunca tocaste Stellar, estos son los términos que vas a ver todo el taller:

| Término | Qué es |
|---|---|
| **Testnet** | La red de pruebas de Stellar. Funciona igual que la red principal (Mainnet) pero el XLM que usa no tiene valor real — es donde vamos a trabajar todo el taller. |
| **XLM (Lumen)** | La moneda nativa de Stellar. En Testnet se consigue gratis con Friendbot. |
| **Soroban** | La plataforma de contratos inteligentes de Stellar (donde vive nuestro token). |
| **Contrato inteligente** | Un programa que vive en la blockchain; en este taller, cada `splash_token` es uno. |
| **CONTRACT_ID** | El "identificador" único de un contrato ya desplegado en la red (ej. `CBLSO...`). Lo vas a copiar y pegar varias veces. |
| **Identidad / alias** | Un par de claves (pública + secreta) que representa una cuenta en la red, generado con la Stellar CLI. No es lo mismo que tu wallet del navegador. |
| **Wallet** | Guarda tus claves y firma transacciones en tu nombre. En este taller la maneja la extensión Freighter. |
| **Freighter** | Extensión de navegador que actúa como wallet: cuando el frontend necesita firmar algo, se lo pide a Freighter. |
| **Deploy (desplegar)** | Publicar el contrato compilado en la red para que quede disponible con su propio CONTRACT_ID. |
| **Mint (acuñar)** | Crear unidades nuevas del token y asignárselas a una cuenta. Solo puede hacerlo el `admin` del contrato. |
| **Swap** | Intercambiar un token por otro a través de un pool de liquidez. |
| **Trustline** | Mecanismo de los **activos clásicos** de Stellar (no de Soroban): para poder tener un activo así en tu cuenta primero tienes que "confiar" en él, y eso bloquea una reserva mínima de XLM. Nuestro `splash_token` **no** usa trustlines — ver la sección [Ver tu token en Freighter](#ver-tu-token-en-freighter). |

### Recursos útiles

- [skills.stellar.org](https://skills.stellar.org/) — guía introductoria oficial de Stellar, recomendada antes de empezar si eres nuevo/a en el ecosistema.
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

Necesitas instalar estas cinco herramientas. Si nunca las usaste, aquí va para qué sirve cada una:

- **git** — para clonar (descargar) este repositorio.
- **Node.js (18+) con pnpm** — para instalar y correr el frontend (la página web).
- **Rust con el target `wasm32v1-none`** — para compilar el contrato de Rust a WebAssembly, el formato que Soroban ejecuta en la red.
- **Stellar CLI** (`stellar`) — la herramienta de línea de comandos oficial para crear identidades, desplegar contratos e interactuar con la red Stellar.
- **Freighter** — la wallet (extensión de navegador) que vas a usar para firmar transacciones desde el frontend.

A continuación, cómo instalar cada una según tu sistema operativo.

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
cargo install --locked stellar-cli --no-default-features
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
cargo install --locked stellar-cli --no-default-features
```
</details>

Después de instalar, verifica que todo esté en el `PATH` con:
```bash
git --version && node --version && pnpm --version && rustc --version && stellar --version
```
Si algún comando "no se encuentra" tras instalarlo, cierra y vuelve a abrir la terminal (o corre `source ~/.bashrc` / `source ~/.zshrc`) para que tome el `PATH` actualizado.

Por último, instala la extensión [Freighter](https://www.freighter.app/) en tu navegador (Chrome, Firefox o Brave) y, dentro de la extensión, cambia la red a **Testnet** (ícono de configuración → "Network").

## Cómo usar este repositorio

Sigue estos 9 pasos en orden. Todos los comandos se corren desde la terminal, parados en la carpeta del proyecto (salvo que se indique lo contrario).

> Antes de empezar, es necesario tener el `CONTRACT_ID` del **registro compartido** (`token_registry`) — se usa en el paso 7. No hace falta desplegarlo, eso ya lo hizo quien facilita el taller: [`CBLSOKKOQP4LJZUOEQKYJ2YR3RTCZK2GLFHZ7JLGQUCFIW4MNTNORP4F`](https://stellar.expert/explorer/testnet/contract/CBLSOKKOQP4LJZUOEQKYJ2YR3RTCZK2GLFHZ7JLGQUCFIW4MNTNORP4F)

### Paso 1 — Clonar este repositorio

```bash
git clone https://github.com/Gabrululu/Stellar-SwapANDSplash
cd Stellar-SwapANDSplash
```

### Paso 2 — Instalar las dependencias del frontend

```bash
pnpm install
```

### Paso 3 — Personalizar el contrato del token

Editar `contracts/splash_token/src/lib.rs`:
- Cambiar las constantes `TOKEN_NAME`, `TOKEN_SYMBOL`, `TOKEN_DECIMALS` e `INITIAL_SUPPLY` por las del token propio.
- Completar la función `transfer_with_burn` (una transferencia que cobra una comisión y la quema) siguiendo la guía incluida en sus comentarios.

Comprobar que la implementación pasa los tests:
```bash
pnpm run test:contracts
```

### Paso 4 — Crear tu identidad y fondearla en Testnet

Una **identidad** es un par de claves (alias local → clave pública/secreta) que la Stellar CLI usa para firmar comandos como `deploy` o `invoke`. No es la misma cuenta que usará tu wallet del navegador (eso viene en el paso 6). Elige un alias propio (por ejemplo, tu nombre) y créalo:

```bash
stellar keys generate mi-alias
```

Luego, financia esa cuenta con XLM de prueba (sin esto no puedes pagar las comisiones de red):

```bash
stellar keys fund mi-alias
```

> 💡 En el futuro, puedes generar la clave y fondearla de un solo golpe agregando la bandera `--fund`: `stellar keys generate mi-alias --fund`.

### Paso 5 — Compilar y desplegar el token

```bash
pnpm run deploy:testnet -- mi-alias
```

Este comando compila el contrato a WebAssembly y lo publica en Testnet. Si la identidad `mi-alias` ya existe (la creaste en el paso 4) la reutiliza; si no, la crea y financia automáticamente. Al terminar, imprime dos `CONTRACT_ID` — anótalos, los vas a necesitar en los pasos siguientes:

- `splash_token` → tu token.
- `swap_pool` → el pool de liquidez de tu token contra XLM.

Con esos dos IDs, inicializa los contratos (esto acuña el suministro inicial y crea el par SplashToken/XLM):

```bash
pnpm run initialize -- mi-alias <TOKEN_ID> <POOL_ID>
```

reemplazando `<TOKEN_ID>` y `<POOL_ID>` por los valores que imprimió el comando anterior. Esta identidad (`mi-alias`) queda como la **administradora** (`admin`) de tu `splash_token` — solo ella puede llamar a `mint` (ver paso 6), así que antes de usar el frontend hay que llevarla a Freighter.

### Paso 6 — Importar tu identidad admin en Freighter

Necesario para poder mintear tu token desde el frontend más adelante. Primero, muestra la clave secreta de tu identidad:

```bash
stellar keys show mi-alias
```

Copia la clave secreta que imprime (empieza con `S...`). Luego, en Freighter: menú (⋮) → **"Add account"** → **"Import a Stellar secret key"** → pégala. Verifica que la red siga en **Testnet** y deja esa cuenta seleccionada como activa — será la wallet que conectes en el paso 9.

⚠️ Esta clave es solo de **Testnet**, sin valor real, y es tuya: nunca la compartas ni la subas al repositorio. Cada participante genera y usa únicamente su propia identidad — nadie necesita la clave de nadie más.

### Paso 7 — Configurar el frontend

```bash
cp frontend/.env.example frontend/.env
```

Editar `frontend/.env` y completar:
- `VITE_TOKEN_REGISTRY_CONTRACT_ID` con el valor entregado por quien facilita el taller (ver nota al inicio de esta sección).
- `VITE_SPLASH_TOKEN_CONTRACT_ID` y `VITE_SWAP_POOL_CONTRACT_ID` con los `CONTRACT_ID` que obtuviste en el paso 5.

Luego, en `frontend/src/config/tokenConfig.ts`, definir el logo (un emoji, una URL, o un archivo colocado en `frontend/public/`) y el lema del token.

### Paso 8 — Iniciar el frontend

```bash
pnpm run dev
```

Abre la URL que imprime la terminal (normalmente `http://localhost:5173`).

### Paso 9 — Acuñar, registrar e intercambiar (en el navegador)

Con Freighter instalado, en red **Testnet**, y con la cuenta importada en el paso 6 seleccionada como activa:

1. Conectar la wallet en el frontend y solicitar XLM de prueba con el botón de Friendbot.
2. Acuñar el token propio.
3. Registrarlo en el mini DEX compartido para que aparezca en el tablero de toda la sala.
4. Elegir el token de algún otro participante en el tablero y realizar un swap: la operación se ejecuta contra **el pool de esa persona** (cada quien tiene su propio pool SplashToken/XLM), así que estás intercambiando XLM por su token directamente.

## Ver tu token en Freighter

El frontend ya te muestra tu balance de SPLASH, pero si además quieres verlo directamente **dentro de Freighter** (por ejemplo para confirmarlo tras un mint o un swap), hay que agregarlo a mano: a diferencia de XLM, Freighter no lo detecta solo.

**¿Por qué no hay que pagar ninguna "cuota" para agregarlo?** En Stellar existen dos tipos de activos, con reglas distintas:

- **Activos clásicos** (los emitidos con `código + cuenta emisora`, ej. la mayoría de stablecoins en la red): para poder tenerlos en tu cuenta primero necesitas abrir una **trustline** (`change_trust`). Mientras esa trustline exista, Stellar bloquea una **reserva mínima de ~0.5 XLM** en tu cuenta — esa es la "cuota" de la que probablemente escuchaste hablar en el ecosistema Stellar en general.
- **Tokens Soroban** como nuestro `splash_token`: no son un activo clásico, son un contrato inteligente que implementa las funciones de un token (`balance`, `transfer`, etc.). Tu saldo vive en el *storage* del contrato, no en una trustline de tu cuenta. Por eso **no hace falta abrir trustline ni reservar XLM** para "admitirlo" — solo hay que decirle a Freighter que muestre ese contrato.

**Cómo agregarlo:**
1. Abre Freighter y confirma que la red activa sea **Testnet**.
2. Ve al listado de activos → botón de administrar/agregar activo (**"Manage assets" → "Add an asset"**, el nombre exacto puede variar un poco según la versión de la extensión).
3. Busca la opción para agregarlo **manualmente por contrato** (en vez de buscar por código/emisor, que es el flujo de activos clásicos) y pega ahí el `CONTRACT_ID` de tu `splash_token` — el mismo valor que pusiste en `VITE_SPLASH_TOKEN_CONTRACT_ID` en el paso 7.
4. Freighter consulta `name`, `symbol` y `decimals` directamente del contrato, lo agrega a tu lista de activos y te muestra tu balance real.

Lo único que pagas es la comisión de red normal de la transacción que estés haciendo (mint, transfer, swap) — no hay ninguna reserva extra ni pago por "admitir" el token, a diferencia de un activo clásico con trustline.

## Tests de los contratos

```bash
pnpm run test:contracts
```

## Solución de problemas comunes

- **`❌ Transacción ... falló en la red` al presionar Mint**: casi siempre significa que la wallet conectada en Freighter no es la identidad admin de tu `splash_token` (la que corrió `initialize.sh` en el paso 5). Solo el admin puede mintear (`require_auth` en el contrato lo exige). Revisa el paso 6 — importa la clave secreta de tu identidad (`stellar keys show mi-alias`) en Freighter y conéctate con esa cuenta.
- **`error: target 'wasm32v1-none' not found` o similar al compilar**: falta el target de Rust. Corre `rustup target add wasm32v1-none`.
- **`stellar: command not found`** tras instalarlo: asegúrate de que `~/.cargo/bin` esté en tu `PATH` (`source "$HOME/.cargo/env"`) y abre una terminal nueva.
- **`pnpm: command not found`**: corre `corepack enable` (viene con Node 16.9+); si sigue sin aparecer, `npm i -g pnpm`.
- **Freighter no aparece / el frontend no detecta la wallet**: confirma que la extensión esté instalada, desbloqueada, y en red **Testnet** (no Mainnet ni Futurenet).
- **`Falta VITE_SPLASH_TOKEN_CONTRACT_ID en tu .env`**: te faltó completar `frontend/.env` con los `CONTRACT_ID` del paso 5 (ver paso 7).
- **En Windows, comandos que fallan de formas raras (paths, permisos, compilación de Rust)**: usa WSL2 en vez de PowerShell/CMD — ver la sección de Requisitos.
