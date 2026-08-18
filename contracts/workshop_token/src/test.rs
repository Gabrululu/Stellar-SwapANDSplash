use super::*;
use soroban_sdk::testutils::Address as _;

fn setup() -> (Env, WorkshopTokenClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(WorkshopToken, ());
    let client = WorkshopTokenClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client, admin)
}

#[test]
fn test_initialize_mints_supply_to_admin() {
    let (_env, client, admin) = setup();
    assert_eq!(client.balance(&admin), INITIAL_SUPPLY);
    assert_eq!(client.total_supply(), INITIAL_SUPPLY);
    assert_eq!(client.name(), String::from_str(&_env, TOKEN_NAME));
    assert_eq!(client.symbol(), String::from_str(&_env, TOKEN_SYMBOL));
    assert_eq!(client.decimals(), TOKEN_DECIMALS);
}

#[test]
#[should_panic(expected = "el contrato ya fue inicializado")]
fn test_initialize_twice_panics() {
    let (_env, client, admin) = setup();
    client.initialize(&admin);
}

#[test]
fn test_mint_and_transfer() {
    let (env, client, admin) = setup();
    let alice = Address::generate(&env);

    client.mint(&alice, &1_000);
    assert_eq!(client.balance(&alice), 1_000);
    assert_eq!(client.total_supply(), INITIAL_SUPPLY + 1_000);

    client.transfer(&admin, &alice, &500);
    assert_eq!(client.balance(&alice), 1_500);
    assert_eq!(client.balance(&admin), INITIAL_SUPPLY - 500);
}

#[test]
#[should_panic(expected = "saldo insuficiente")]
fn test_transfer_insufficient_balance_panics() {
    let (env, client, _admin) = setup();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    client.transfer(&alice, &bob, &1);
}

#[test]
fn test_burn_reduces_supply() {
    let (_env, client, admin) = setup();
    client.burn(&admin, &1_000);
    assert_eq!(client.total_supply(), INITIAL_SUPPLY - 1_000);
    assert_eq!(client.balance(&admin), INITIAL_SUPPLY - 1_000);
}

// Estos tests te sirven para validar tu implementación de la
// función especial del taller. Descoméntalos y ajusta las
// aserciones una vez completes `transfer_with_burn`.
//
// #[test]
// fn test_transfer_with_burn_charges_fee() {
//     let (env, client, admin) = setup();
//     let alice = Address::generate(&env);
//     client.transfer_with_burn(&admin, &alice, &1_000);
//     let fee = 1_000 * BURN_FEE_BPS / 10_000;
//     assert_eq!(client.balance(&alice), 1_000 - fee);
//     assert_eq!(client.balance(&admin), INITIAL_SUPPLY - 1_000);
//     assert_eq!(client.total_supply(), INITIAL_SUPPLY - fee);
// }
//
// #[test]
// #[should_panic(expected = "saldo insuficiente")]
// fn test_transfer_with_burn_insufficient_balance_panics() {
//     let (env, client, _admin) = setup();
//     let alice = Address::generate(&env);
//     let bob = Address::generate(&env);
//     client.transfer_with_burn(&alice, &bob, &1);
// }
