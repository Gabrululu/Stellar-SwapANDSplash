#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

// Registro compartido: aquí aparecen todos los tokens del
// taller para que el frontend los liste en el selector del swap.
// Se despliega UNA sola vez (lo hace quien facilita el taller) y
// cada participante registra su propio token contra esta misma
// instancia.

#[contracttype]
#[derive(Clone)]
pub struct TokenInfo {
    pub contract_id: Address,
    pub pool_id: Address,
    pub symbol: String,
    pub name: String,
    pub owner: Address,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Tokens,
}

#[contract]
pub struct TokenRegistry;

#[contractimpl]
impl TokenRegistry {
    /// Fija al admin del registro (quien facilita el taller). Solo
    /// se puede llamar una vez.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("el registro ya fue inicializado");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Registra un token nuevo junto con el pool donde se puede
    /// intercambiar (SplashToken/XLM). Solo el `owner` firmante
    /// puede registrar su propio contrato (evita que alguien más
    /// registre tokens ajenos a su nombre).
    pub fn register(
        env: Env,
        contract_id: Address,
        pool_id: Address,
        symbol: String,
        name: String,
        owner: Address,
    ) {
        owner.require_auth();

        let mut tokens = Self::list_tokens(env.clone());
        for t in tokens.iter() {
            if t.contract_id == contract_id {
                panic!("este token ya esta registrado");
            }
        }
        tokens.push_back(TokenInfo {
            contract_id,
            pool_id,
            symbol,
            name,
            owner,
        });
        env.storage().instance().set(&DataKey::Tokens, &tokens);
    }

    /// Quita un token de la lista. Solo el admin del registro
    /// puede hacerlo (ej. para limpiar tokens de pruebas viejas o
    /// contratos reemplazados).
    pub fn unregister(env: Env, admin: Address, contract_id: Address) {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("el registro no tiene admin inicializado");
        assert_eq!(admin, stored_admin, "solo el admin puede remover tokens");
        admin.require_auth();

        let tokens = Self::list_tokens(env.clone());
        let mut updated = Vec::new(&env);
        let mut found = false;
        for t in tokens.iter() {
            if t.contract_id == contract_id {
                found = true;
            } else {
                updated.push_back(t);
            }
        }
        assert!(found, "ese token no esta registrado");
        env.storage().instance().set(&DataKey::Tokens, &updated);
    }

    pub fn list_tokens(env: Env) -> Vec<TokenInfo> {
        env.storage()
            .instance()
            .get(&DataKey::Tokens)
            .unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test;
