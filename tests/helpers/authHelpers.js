async function signup(agent, overrides = {}) {
  const payload = {
    username: "testuser",
    email: "test@test.com",
    password: "test1234",
    confirmPassword: "test1234",
    ...overrides,
  };

  return agent.post("/signup").type("form").send(payload);
}

module.exports = { signup };
