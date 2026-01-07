const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

let sequelize;

if (isTest) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
} else {
  sequelize = new Sequelize(
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
}

const db = {};

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

if (!isTest) {
  (async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
    } catch (error) {
      console.error("❌ Unable to connect to the database:", error);
    }
  })();
}

module.exports = db;
