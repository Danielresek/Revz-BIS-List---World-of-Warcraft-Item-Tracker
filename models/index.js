require("dotenv").config();
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

console.log("🗄️ Initializing database...");

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  isProduction
    ? process.env.DATABASE_URL_INTERNAL
    : process.env.DATABASE_URL_EXTERNAL,
  {
    dialect: process.env.DB_DIALECT || "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: isProduction ? false : console.log,
  }
);

const db = {};

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    console.log(`➡️ Loading model file: ${file}`);
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    console.log(`🔗 Associating model: ${modelName}`);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

(async () => {
  try {
    console.log("🗄️ Connecting to the database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established!");

    console.log("🔧 Syncing models...");
    await sequelize.sync({ alter: true });
    console.log("✅ Models synchronized!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();

module.exports = db;
