use super::*;
use splash_token::{SplashToken, SplashTokenClient};
use soroban_sdk::testutils::Address as _;

fn setup_token(env: &Env, admin: &Address) -> Address {
    let id = env.register(SplashToken, ());
    let client = SplashTokenClient::new(env, &id);
    client.initialize(admin);
    id
}

#[test]
fn test_deposit_and_swap() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_a_id = setup_token(&env, &admin);
    let token_b_id = setup_token(&env, &admin);
    let token_a = SplashTokenClient::new(&env, &token_a_id);
    let token_b = SplashTokenClient::new(&env, &token_b_id);

    let pool_id = env.register(SwapPool, ());
    let pool = SwapPoolClient::new(&env, &pool_id);
    pool.initialize(&admin, &token_a_id, &token_b_id);

    pool.deposit(&admin, &1_000_000, &1_000_000);
    assert_eq!(pool.reserve_a(), 1_000_000);
    assert_eq!(pool.reserve_b(), 1_000_000);

    let trader = Address::generate(&env);
    token_a.transfer(&admin, &trader, &10_000);

    let out = pool.swap(&trader, &10_000, &0, &false);
    assert!(out > 0 && out < 10_000, "debe respetar la curva x*y=k con fee");
    assert_eq!(token_a.balance(&trader), 0);
    assert_eq!(token_b.balance(&trader), out);
}

#[test]
#[should_panic(expected = "slippage excedido")]
fn test_swap_respects_min_out() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_a_id = setup_token(&env, &admin);
    let token_b_id = setup_token(&env, &admin);
    let token_a = SplashTokenClient::new(&env, &token_a_id);

    let pool_id = env.register(SwapPool, ());
    let pool = SwapPoolClient::new(&env, &pool_id);
    pool.initialize(&admin, &token_a_id, &token_b_id);
    pool.deposit(&admin, &1_000_000, &1_000_000);

    let trader = Address::generate(&env);
    token_a.transfer(&admin, &trader, &10_000);
    pool.swap(&trader, &10_000, &1_000_000, &false);
}
