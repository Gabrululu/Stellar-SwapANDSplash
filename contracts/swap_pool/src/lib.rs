#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, IntoVal, Symbol, Vec};

// Pool de liquidez de producto constante (x*y=k) genérico entre
// dos tokens SEP-41 compatibles (funciona tanto con el token del
// taller como con el XLM nativo vía su Stellar Asset Contract).
// Cada par Token/XLM del taller despliega su propia instancia de
// este contrato.

#[contracttype]
pub enum DataKey {
    Admin,
    TokenA,
    TokenB,
    ReserveA,
    ReserveB,
}

const FEE_BPS: i128 = 30; // 0.3%, estilo Uniswap v2

#[contract]
pub struct SwapPool;

#[contractimpl]
impl SwapPool {
    pub fn initialize(env: Env, admin: Address, token_a: Address, token_b: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenA, &token_a);
        env.storage().instance().set(&DataKey::TokenB, &token_b);
        env.storage().instance().set(&DataKey::ReserveA, &0i128);
        env.storage().instance().set(&DataKey::ReserveB, &0i128);
    }

    /// Aporta liquidez en la proporción que decida el primer
    /// depositante (versión simplificada, sin LP tokens).
    pub fn deposit(env: Env, from: Address, amount_a: i128, amount_b: i128) {
        from.require_auth();
        assert!(amount_a > 0 && amount_b > 0, "montos deben ser positivos");

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();
        let pool = env.current_contract_address();

        Self::xfer(&env, &token_a, &from, &pool, amount_a);
        Self::xfer(&env, &token_b, &from, &pool, amount_b);

        let ra = Self::reserve_a(env.clone());
        let rb = Self::reserve_b(env.clone());
        env.storage().instance().set(&DataKey::ReserveA, &(ra + amount_a));
        env.storage().instance().set(&DataKey::ReserveB, &(rb + amount_b));
    }

    /// Intercambia `amount_in` de un lado del par por el otro.
    /// `buy_a = true` vende token B y compra token A.
    pub fn swap(env: Env, from: Address, amount_in: i128, min_out: i128, buy_a: bool) -> i128 {
        from.require_auth();
        assert!(amount_in > 0, "el monto debe ser positivo");

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();
        let mut ra = Self::reserve_a(env.clone());
        let mut rb = Self::reserve_b(env.clone());
        assert!(ra > 0 && rb > 0, "el pool no tiene liquidez todavía");

        let (reserve_in, reserve_out, token_in, token_out) = if buy_a {
            (rb, ra, token_b.clone(), token_a.clone())
        } else {
            (ra, rb, token_a.clone(), token_b.clone())
        };

        let amount_in_with_fee = amount_in * (10_000 - FEE_BPS);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = reserve_in * 10_000 + amount_in_with_fee;
        let amount_out = numerator / denominator;
        assert!(amount_out >= min_out, "slippage excedido");
        assert!(amount_out < reserve_out, "liquidez insuficiente");

        let pool = env.current_contract_address();
        Self::xfer(&env, &token_in, &from, &pool, amount_in);
        Self::xfer(&env, &token_out, &pool, &from, amount_out);

        if buy_a {
            rb += amount_in;
            ra -= amount_out;
        } else {
            ra += amount_in;
            rb -= amount_out;
        }
        env.storage().instance().set(&DataKey::ReserveA, &ra);
        env.storage().instance().set(&DataKey::ReserveB, &rb);

        amount_out
    }

    pub fn reserve_a(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0)
    }

    pub fn reserve_b(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0)
    }

    fn xfer(env: &Env, token: &Address, from: &Address, to: &Address, amount: i128) {
        let args: Vec<soroban_sdk::Val> = (from.clone(), to.clone(), amount).into_val(env);
        let _: () = env.invoke_contract(token, &Symbol::new(env, "transfer"), args);
    }
}

#[cfg(test)]
mod test;
