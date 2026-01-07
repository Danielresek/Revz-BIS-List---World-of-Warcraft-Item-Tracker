// Boot test environment (SQLite in-memory + DB reset hooks)
require("../helpers/setup");

const { createClient } = require("../helpers/testClient");

// Helpers (unique data to avoid collisions)
function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(16).slice(2)}@test.com`;
}
function uniqueUser() {
  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

describe("Auth API", () => {
  it("signs up and keeps a logged-in session", async () => {
    const agent = createClient();

    // Signup (auto-login)
    const signupRes = await agent.post("/signup").type("form").send({
      username: uniqueUser(),
      email: uniqueEmail(),
      password: "test1234",
      confirmPassword: "test1234",
    });

    expect(signupRes.status).toBe(302);

    // Session should work on protected route
    const res = await agent.get("/items/1");
    expect([200, 404]).toContain(res.status);
  });

  it("can login with valid credentials", async () => {
    const agent = createClient();

    const username = uniqueUser();
    const email = uniqueEmail();
    const password = "test1234";

    // Create user
    const signupRes = await agent.post("/signup").type("form").send({
      username,
      email,
      password,
      confirmPassword: password,
    });
    expect(signupRes.status).toBe(302);

    // Fresh client for login (no existing session)
    const loginAgent = createClient();

    const loginRes = await loginAgent.post("/login").type("form").send({
      identifier: username,
      password,
    });

    expect(loginRes.status).toBe(302);

    // Session should work on protected route
    const protectedRes = await loginAgent.get("/items/1");
    expect([200, 404]).toContain(protectedRes.status);
  });

  it("rejects login with wrong password", async () => {
    const agent = createClient();

    const username = uniqueUser();
    const email = uniqueEmail();

    // Create user
    const signupRes = await agent.post("/signup").type("form").send({
      username,
      email,
      password: "correctpass",
      confirmPassword: "correctpass",
    });
    expect(signupRes.status).toBe(302);

    // Login attempt (wrong password)
    const badLoginAgent = createClient();

    const badLogin = await badLoginAgent.post("/login").type("form").send({
      identifier: username,
      password: "wrongpass",
    });

    // Failed login typically re-renders login page
    expect(badLogin.status).toBe(200);

    // Should not have session
    const protectedRes = await badLoginAgent.get("/items/1");
    expect(protectedRes.status).toBe(302);
  });
});
