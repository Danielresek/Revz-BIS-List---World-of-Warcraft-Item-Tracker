module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Characters", "class", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn("Characters", "classIconUrl", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Characters", "class");
    await queryInterface.removeColumn("Characters", "classIconUrl");
  },
};
