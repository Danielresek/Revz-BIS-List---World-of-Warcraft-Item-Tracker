const request = require("supertest");
const app = require("../../app");

// supertest agent retains cookies between calls (session)
function createClient() {
  return request.agent(app);
}

module.exports = { createClient };
