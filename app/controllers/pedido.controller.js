const db = require("../models");
const Pedido = db.pedidos;
const Cliente = db.clientes;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {
    const { id_cliente } = req.body;

    // Sólo falla si realmente no viene en el cuerpo
    if (id_cliente === undefined || id_cliente === null) {
      return res.status(400).send({ message: "El id_cliente es obligatorio" });
    }

    // Ahora sí hay Cliente importado, podemos buscarlo
    const clienteExiste = await Cliente.findByPk(id_cliente);
    if (!clienteExiste) {
      return res.status(404).send({ message: "El cliente no existe" });
    }

    const pedido = await Pedido.create({
      id_cliente,
      fecha: new Date(),
      total: 0
    });

    res.status(201).send(pedido);

  } catch (err) {
    console.error(" Error creando pedido:", err);
    res.status(500).send({
      message: err.message || "Error creando el pedido."
    });
  }
};


// Obtener todos los pedidos (puedes filtrar por id_cliente opcionalmente)
exports.findAll = (req, res) => {
  const id_cliente = req.query.id_cliente;
  const condition = id_cliente ? { id_cliente: id_cliente } : null;

  Pedido.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error obteniendo los pedidos."
    }));
};

// Obtener un pedido por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Pedido.findByPk(id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Pedido no encontrado" });
    })
    .catch(err => res.status(500).send({
      message: "Error al buscar pedido con id=" + id
    }));
};

// Actualizar pedido por ID
exports.update = async (req, res) => {
  const id = req.params.id;
  const { id_cliente, fecha, total } = req.body;

  try {
    // 1) Verifico que el pedido exista
    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).send({ message: "Pedido no encontrado" });
    }

    // 2) Si enviaron id_cliente, compruebo que el cliente exista
    if (id_cliente !== undefined) {
      // id_cliente puede ser 0, null o un número válido
      if (id_cliente === null) {
        return res.status(400).send({ message: "id_cliente no puede ser null" });
      }
      const cliente = await Cliente.findByPk(id_cliente);
      if (!cliente) {
        return res.status(404).send({ message: "El cliente no existe" });
      }
    }

    // 3) Armo el objeto con los campos a actualizar
    const cambios = {};
    if (id_cliente !== undefined) cambios.id_cliente = id_cliente;
    if (fecha        !== undefined) cambios.fecha       = fecha;
    if (total        !== undefined) cambios.total       = total;

    // 4) Aplico el update
    await Pedido.update(cambios, { where: { id } });

    // 5) Devuelvo el pedido actualizado
    const actualizado = await Pedido.findByPk(id);
    res.send(actualizado);

  } catch (err) {
    console.error("Error actualizando pedido:", err);
    res.status(500).send({ message: err.message });
  }
};


// Eliminar pedido por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Pedido.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Pedido eliminado correctamente." });
      else res.send({ message: `No se pudo eliminar pedido con id=${id}.` });
    })
    .catch(err => res.status(500).send({
      message: "Error eliminando pedido con id=" + id
    }));
};

// Eliminar todos los pedidos
exports.deleteAll = (req, res) => {
  Pedido.destroy({ where: {}, truncate: false })
    .then(nums => res.send({ message: `${nums} pedidos eliminados.` }))
    .catch(err => res.status(500).send({
      message: err.message || "Error eliminando todos los pedidos."
    }));
};
