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
    logging: console.log,
  }
);
const db = {};

// Load all models
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

// Associate models if associations are defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    console.log(`Associating model: ${modelName}`);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Attempt to connect and synchronize models
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
