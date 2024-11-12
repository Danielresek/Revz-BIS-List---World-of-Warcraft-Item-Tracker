const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Item = sequelize.define("Item", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    boss: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "received"),
      defaultValue: "pending",
      allowNull: false,
    },
  });

  // Definer relasjonen i associate-metoden
  Item.associate = (models) => {
    Item.belongsTo(models.Character, { foreignKey: "character_id" });
    models.Character.hasMany(Item, { foreignKey: "character_id" });
  };

  return Item;
};
