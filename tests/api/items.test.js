// Boot test environment (SQLite in-memory + DB reset hooks)
require("../helpers/setup");

const { createClient } = require("../helpers/testClient");

// --- Test helpers ---------------------------------------------------------

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

// Create a character (required before creating items)
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

// Create an item for a character
async function createItem(agent, characterId, overrides = {}) {
  const payload = {
    name: "Test Item",
    description: "Some desc",
    slot: "Head",
    boss: "Test boss",
    character_id: characterId,
    icon: "inv_helmet_01",
    ...overrides,
  };

  const res = await agent.post("/items").send(payload);

  expect([200, 201]).toContain(res.status);
  expect(res.body.id).toBeDefined();

  return res.body;
}

// --- Items API tests ------------------------------------------------------

describe("Items API", () => {
  it("can create and list items for a character (session protected)", async () => {
    const agent = await signupAndGetAgent();
    const character = await createCharacter(agent);

    const created = await createItem(agent, character.id);

    const listRes = await agent.get(`/items/${character.id}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const ids = listRes.body.map((x) => x.id);
    expect(ids).toContain(created.id);
  });

  it("can update an item", async () => {
    const agent = await signupAndGetAgent();
    const character = await createCharacter(agent);
    const created = await createItem(agent, character.id);

    const updateRes = await agent.put(`/items/${created.id}`).send({
      name: "Updated Item",
      description: "Updated desc",
      slot: "Chest",
      boss: "New test boss",
      character_id: character.id,
      icon: "inv_chest_01",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("Updated Item");
  });

  it("can delete an item", async () => {
    const agent = await signupAndGetAgent();
    const character = await createCharacter(agent);
    const created = await createItem(agent, character.id);

    const delRes = await agent.delete(`/items/${created.id}`);
    expect(delRes.status).toBe(200);

    // Verify it no longer appears in the list
    const listRes = await agent.get(`/items/${character.id}`);
    expect(listRes.status).toBe(200);

    const ids = listRes.body.map((x) => x.id);
    expect(ids).not.toContain(created.id);
  });

  it("rejects item creation when not logged in", async () => {
    const anon = createClient();

    const res = await anon.post("/items").send({
      name: "Nope",
      character_id: 1,
    });

    // Your app redirects to /login when unauthenticated
    expect([302, 401, 403]).toContain(res.status);
  });
});
