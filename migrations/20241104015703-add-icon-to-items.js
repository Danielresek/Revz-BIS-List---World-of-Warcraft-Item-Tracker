module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Items", "icon", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Items", "icon");
  },
};
