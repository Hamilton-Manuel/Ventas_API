const db = require("../models");
const Producto = db.productos;
const Op = db.Sequelize.Op;

// Crear un producto
exports.create = (req, res) => {
  if (!req.body.nombre) {
    res.status(400).send({ message: "El nombre es obligatorio" });
    return;
  }

  const producto = {
    nombre: req.body.nombre,
    precio: req.body.precio || 0, 
    stock: req.body.stock || 0,
  };

  Producto.create(producto)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error creando el producto."
    }));
};

// Obtener todos los productos (puedes filtrar por nombre opcionalmente)
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Producto.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error obteniendo los productos."
    }));
};

// Obtener un producto por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Producto.findByPk(id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Producto no encontrado" });
    })
    .catch(err => res.status(500).send({
      message: "Error al buscar producto con id=" + id
    }));
};

// Actualizar producto por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Producto.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Producto actualizado correctamente." });
      else res.send({ message: `No se pudo actualizar producto con id=${id}.` });
    })
    .catch(err => res.status(500).send({
      message: "Error actualizando producto con id=" + id
    }));
};

// Eliminar producto por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Producto.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Producto eliminado correctamente." });
      else res.send({ message: `No se pudo eliminar producto con id=${id}.` });
    })
    .catch(err => res.status(500).send({
      message: "Error eliminando producto con id=" + id
    }));
};

// Eliminar todos los productos
exports.deleteAll = (req, res) => {
  Producto.destroy({ where: {}, truncate: false })
    .then(nums => res.send({ message: `${nums} productos eliminados.` }))
    .catch(err => res.status(500).send({
      message: err.message || "Error eliminando todos los productos."
    }));
};
