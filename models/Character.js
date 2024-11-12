module.exports = (sequelize, DataTypes) => {
  const Character = sequelize.define("Character", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    classIconUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  Character.associate = function (models) {
    Character.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Character;
};
