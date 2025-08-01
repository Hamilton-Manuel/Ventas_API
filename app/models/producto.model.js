module.exports = (sequelize, Sequelize) => {
  const Producto = sequelize.define("producto", {
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    precio: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    timestamps: false,
  });
  return Producto;
};
