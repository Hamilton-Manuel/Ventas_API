module.exports = (sequelize, Sequelize) => {
  const Pedido = sequelize.define("pedido", {
    fecha: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    total: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    timestamps: false,
  });
  return Pedido;
};
