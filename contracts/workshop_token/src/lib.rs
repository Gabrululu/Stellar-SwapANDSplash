#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

// ============================================================
// 🎨 PERSONALIZA TU TOKEN AQUÍ — Commit 1 del taller
// ============================================================
// Cambia estos valores por los de tu propio token antes de
// desplegar. `INITIAL_SUPPLY` ya incluye los `TOKEN_DECIMALS`
// decimales (ej. 1_000_000 tokens con 7 decimales = 1_000_000 * 10^7).
pub const TOKEN_NAME: &str = "Stellar en acción";
pub const TOKEN_SYMBOL: &str = "SPLASH";
pub const TOKEN_DECIMALS: u32 = 7;
pub const INITIAL_SUPPLY: i128 = 1_000_000 * 10_000_000; // 1,000,000 SPLASH

// Comisión de quema aplicada en `transfer_with_burn`, en basis
// points (100 = 1%). Ajústala como parte de la función especial.
pub const BURN_FEE_BPS: i128 = 100;
// ============================================================

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
    Initialized,
}

#[contract]
pub struct WorkshopToken;

#[contractimpl]
impl WorkshopToken {
    /// Inicializa el contrato: fija al admin y le acuña el
    /// suministro inicial completo. Solo se puede llamar una vez.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("el contrato ya fue inicializado");
        }
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &INITIAL_SUPPLY);
        env.storage()
            .persistent()
            .set(&DataKey::Balance(admin), &INITIAL_SUPPLY);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    pub fn name(env: Env) -> String {
        String::from_str(&env, TOKEN_NAME)
    }

    pub fn symbol(env: Env) -> String {
        String::from_str(&env, TOKEN_SYMBOL)
    }

    pub fn decimals(_env: Env) -> u32 {
        TOKEN_DECIMALS
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(id))
            .unwrap_or(0)
    }

    /// Solo el admin puede acuñar tokens nuevos (útil para el
    /// airdrop inicial del taller o recargas de demo).
    pub fn mint(env: Env, to: Address, amount: i128) {
        assert!(amount > 0, "el monto debe ser positivo");
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to), &(balance + amount));
        let supply = Self::total_supply(env.clone());
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply + amount));
    }

    /// Transferencia estándar, sin comisiones. La usa el swap pool.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        assert!(amount > 0, "el monto debe ser positivo");
        from.require_auth();

        let from_balance = Self::balance(env.clone(), from.clone());
        assert!(from_balance >= amount, "saldo insuficiente");

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from), &(from_balance - amount));
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to), &(to_balance + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        assert!(amount > 0, "el monto debe ser positivo");
        from.require_auth();

        let balance = Self::balance(env.clone(), from.clone());
        assert!(balance >= amount, "saldo insuficiente");

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from), &(balance - amount));
        let supply = Self::total_supply(env.clone());
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply - amount));
    }

    // ========================================================
    // 🛠️ FUNCIÓN ESPECIAL — LA COMPLETAS TÚ (Commit 1 del taller)
    // ========================================================
    // Objetivo: transferir tokens cobrando una comisión que se
    // quema (reduce `total_supply`), simulando un token
    // "deflacionario" en cada intercambio.
    //
    // Pasos sugeridos:
    //   1. Calcula `fee = amount * BURN_FEE_BPS / 10_000`.
    //   2. Descuenta `amount` completo del balance de `from`.
    //   3. Acredita `amount - fee` al balance de `to`.
    //   4. Reduce `total_supply` en `fee` (la quema real).
    //   5. No olvides `from.require_auth()` y validar `amount > 0`
    //      y saldo suficiente, igual que en `transfer`.
    pub fn transfer_with_burn(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "el monto debe ser positivo");

        // TODO(taller): reemplaza este panic por tu implementación.
        let _ = (env, to);
        panic!("transfer_with_burn: función pendiente de implementar");
    }
}

#[cfg(test)]
mod test;
