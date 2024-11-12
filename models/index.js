require("dotenv").config();
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.ADMIN_USERNAME,
  process.env.ADMIN_PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: console.log, // Legg til logging for SQL-spørringer
  }
);
const db = {};

// Start med en enkel test for å se om dette kjører
console.log("Loading models...");

// Last inn alle modellene
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    console.log(`Loading model file: ${file}`);
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    console.log(`Associating model: ${modelName}`);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("Attempting to connect and sync models...");
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL database successfully!");
    await sequelize.sync({ force: false });
    console.log("Database synchronized!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = db;
