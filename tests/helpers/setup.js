const db = require("../../models");

beforeAll(async () => {
  // Ensures that the DB is up before the tests start
  await db.sequelize.authenticate();
});

beforeEach(async () => {
  // Force sync ensures clean DB per test
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});
