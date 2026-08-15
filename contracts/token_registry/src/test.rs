use super::*;
use soroban_sdk::testutils::Address as _;

#[test]
fn test_register_and_list() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TokenRegistry, ());
    let client = TokenRegistryClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let token = Address::generate(&env);

    client.register(
        &token,
        &String::from_str(&env, "SPLASH"),
        &String::from_str(&env, "Splash Token"),
        &owner,
    );

    let tokens = client.list_tokens();
    assert_eq!(tokens.len(), 1);
    assert_eq!(tokens.get(0).unwrap().contract_id, token);
}

#[test]
#[should_panic(expected = "este token ya esta registrado")]
fn test_register_duplicate_panics() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TokenRegistry, ());
    let client = TokenRegistryClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let token = Address::generate(&env);

    client.register(
        &token,
        &String::from_str(&env, "SPLASH"),
        &String::from_str(&env, "Splash Token"),
        &owner,
    );
    client.register(
        &token,
        &String::from_str(&env, "SPLASH"),
        &String::from_str(&env, "Splash Token"),
        &owner,
    );
}

#[test]
fn test_admin_unregisters_token() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TokenRegistry, ());
    let client = TokenRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let owner = Address::generate(&env);
    let old_token = Address::generate(&env);
    let new_token = Address::generate(&env);

    client.register(
        &old_token,
        &String::from_str(&env, "SPLASH"),
        &String::from_str(&env, "Splash Token"),
        &owner,
    );
    client.register(
        &new_token,
        &String::from_str(&env, "SPLASH"),
        &String::from_str(&env, "Splash Token"),
        &owner,
    );
    assert_eq!(client.list_tokens().len(), 2);

    client.unregister(&admin, &old_token);

    let tokens = client.list_tokens();
    assert_eq!(tokens.len(), 1);
    assert_eq!(tokens.get(0).unwrap().contract_id, new_token);
}

#[test]
#[should_panic(expected = "solo el admin puede remover tokens")]
fn test_non_admin_cannot_unregister() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TokenRegistry, ());
    let client = TokenRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let owner = Address::generate(&env);
    let token = Address::generate(&env);
    client.register(
        &token,
        &String::from_str(&env, "SPLASH"),
        &String::from_str(&env, "Splash Token"),
        &owner,
    );

    let impostor = Address::generate(&env);
    client.unregister(&impostor, &token);
}

#[test]
#[should_panic(expected = "ese token no esta registrado")]
fn test_unregister_missing_token_panics() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TokenRegistry, ());
    let client = TokenRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let ghost_token = Address::generate(&env);
    client.unregister(&admin, &ghost_token);
}
