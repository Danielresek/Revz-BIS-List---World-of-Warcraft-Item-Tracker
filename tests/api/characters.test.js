// Boot test environment (SQLite in-memory + DB reset hooks)
require("../helpers/setup");

const { createClient } = require("../helpers/testClient");

// Test helpers
function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(16).slice(2)}@test.com`;
}

function uniqueUser() {
  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// Signup returns 302 and should leave the agent logged in (session cookie)
async function signupAndGetAgent() {
  const agent = createClient();

  const res = await agent.post("/signup").type("form").send({
    username: uniqueUser(),
    email: uniqueEmail(),
    password: "test1234",
    confirmPassword: "test1234",
  });

  expect(res.status).toBe(302);
  return agent;
}

// Create a character and return the created entity
async function createCharacter(agent, overrides = {}) {
  const payload = {
    name: "Revz",
    characterClass: "Monk",
    classIconUrl: "https://example.com/monk.png",
    ...overrides,
  };

  const res = await agent.post("/characters/add").send(payload);

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.character?.id).toBeDefined();

  return res.body.character;
}

// Characters API tests
describe("Characters API", () => {
  let agent;

  beforeEach(async () => {
    agent = await signupAndGetAgent();
  });

  it("can create a character (session protected)", async () => {
    const character = await createCharacter(agent);

    expect(character.name).toBe("Revz");
    // API returns `class`, but request uses `characterClass`
    expect(character.class).toBe("Monk");
  });

  it("lists characters for logged-in user", async () => {
    const created = await createCharacter(agent);

    const listRes = await agent.get("/characters");
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const ids = listRes.body.map((c) => c.id);
    expect(ids).toContain(created.id);
  });

  it("can update a character", async () => {
    const created = await createCharacter(agent);

    const updateRes = await agent.put(`/characters/${created.id}`).send({
      name: "Revz-Updated",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.character.name).toBe("Revz-Updated");
  });

  it("can delete a character", async () => {
    const created = await createCharacter(agent);

    const deleteRes = await agent.delete(`/characters/${created.id}`);
    expect(deleteRes.status).toBe(204);

    const listRes = await agent.get("/characters");
    expect(listRes.status).toBe(200);

    const ids = listRes.body.map((c) => c.id);
    expect(ids).not.toContain(created.id);
  });

  it("redirects when trying to access characters while logged out", async () => {
    const anon = createClient();

    const res = await anon.get("/characters");
    expect(res.status).toBe(302);
  });
});

// Negative tests
describe("Characters API - negative", () => {
  it("rejects creating character when not logged in", async () => {
    const anon = createClient();

    const res = await anon.post("/characters/add").send({
      name: "Nope",
      characterClass: "Monk",
      classIconUrl: "https://example.com/monk.png",
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  it("rejects listing characters when not logged in", async () => {
    const anon = createClient();

    const res = await anon.get("/characters");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  it("rejects updating character when not logged in", async () => {
    const anon = createClient();

    const res = await anon.put("/characters/1").send({ name: "Hacker" });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  it("rejects deleting character when not logged in", async () => {
    const anon = createClient();

    const res = await anon.delete("/characters/1");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });
});
