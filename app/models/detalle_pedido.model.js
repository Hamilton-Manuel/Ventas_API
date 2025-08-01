module.exports = (sequelize, Sequelize) => {
  const DetallePedido = sequelize.define("detalle_pedido", {
    cantidad: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    timestamps: false,
  });
  return DetallePedido;
};
