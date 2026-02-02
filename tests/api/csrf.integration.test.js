process.env.FORCE_CSRF = '1';

// Use test DB setup hooks
require('../helpers/setup');

const { createClient } = require('../helpers/testClient');

function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(16).slice(2)}@test.com`;
}
function uniqueUser() {
  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// Helper to extract CSRF token from HTML meta
function extractCsrf(html) {
  const m = html.match(/<meta name="csrf-token" content="([^"]+)"/);
  return m ? m[1] : null;
}

describe('CSRF integration (FORCE_CSRF=1)', () => {
  it('fetches token, signs up, creates character and item using same agent', async () => {
    const agent = createClient();

    // Get signup page to fetch CSRF token for signup
    const signupGet = await agent.get('/signup');
    expect(signupGet.status).toBe(200);
    const signupToken = extractCsrf(signupGet.text);
    expect(signupToken).toBeTruthy();

    const username = uniqueUser();
    const email = uniqueEmail();

    // Post signup form (include token as _csrf)
    const signupRes = await agent.post('/signup').type('form').send({
      username,
      email,
      password: 'test1234',
      confirmPassword: 'test1234',
      _csrf: signupToken,
    });

    expect([302, 200]).toContain(signupRes.status);

    // Fetch main page to obtain a CSRF token for API requests
    const mainGet = await agent.get('/');
    expect(mainGet.status).toBe(200);
    const mainToken = extractCsrf(mainGet.text);
    expect(mainToken).toBeTruthy();

    // Create a character (include token in body)
    const charRes = await agent.post('/characters/add').send({
      name: 'IntegrationChar',
      characterClass: 'Monk',
      classIconUrl: 'https://example.com/monk.png',
      _csrf: mainToken,
    });

    expect(charRes.status).toBe(200);
    expect(charRes.body.success).toBe(true);
    const character = charRes.body.character;
    expect(character).toBeDefined();

    // Create an item for the character
    const itemRes = await agent.post('/items').send({
      name: 'Integration Item',
      description: 'desc',
      slot: 'Head',
      boss: 'TestBoss',
      character_id: character.id,
      icon: 'inv_helm_01',
      _csrf: mainToken,
    });

    expect([200, 201]).toContain(itemRes.status);
    expect(itemRes.body.id).toBeDefined();
  }, 20000);
});
