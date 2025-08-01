const db = require("../models");
const DetallePedido = db.detalle_pedido;
const Producto = db.productos; 
const Op = db.Sequelize.Op;

// Recalcula el total de un pedido y lo actualiza
async function recalcularTotalPedido(id_pedido) {
  const detalles = await db.detalle_pedido.findAll({ where: { id_pedido } });
  const total = detalles.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  await db.pedidos.update(
    { total },
    { where: { id: id_pedido } }
  );
}


// Crear detalle_pedido
exports.create = async (req, res) => {
  const { id_pedido, id_producto, cantidad } = req.body;

  if (!id_pedido || !id_producto || !cantidad) {
    return res.status(400).send({ message: "id_pedido, id_producto y cantidad son obligatorios" });
  }

  try {
    // Buscar el producto
    const producto = await Producto.findByPk(id_producto);
    if (!producto) {
      return res.status(404).send({ message: "Producto no encontrado" });
    }

    // Verificar stock disponible
    if (producto.stock < cantidad) {
      return res.status(400).send({
        message: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`
      });
    }

    // Calcular subtotal
    const subtotal = producto.precio * cantidad;

    // Crear el detalle del pedido
    const detalle = await DetallePedido.create({
      id_pedido,
      id_producto,
      cantidad,
      subtotal
    });

    // Actualizar el stock del producto
    producto.stock -= cantidad;
    await producto.save();

    res.send(detalle);

  } catch (err) {
    res.status(500).send({
      message: "Error creando detalle: " + err.message
    });
  }
  await recalcularTotalPedido(id_pedido);

};

// Obtener todos los detalles (puedes filtrar por id_pedido opcionalmente)
exports.findAll = (req, res) => {
  const id_pedido = req.query.id_pedido;
  const condition = id_pedido ? { id_pedido: id_pedido } : null;

  DetallePedido.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: err.message || "Error obteniendo los detalles del pedido."
    }));
};

// Obtener un detalle por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  DetallePedido.findByPk(id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Detalle no encontrado" });
    })
    .catch(err => res.status(500).send({
      message: "Error al buscar detalle con id=" + id
    }));
};

// Actualizar detalle por ID
exports.update = async (req, res) => {
  const id = req.params.id;
  const { id_producto, cantidad } = req.body;

  if (!id_producto || !cantidad) {
    return res.status(400).send({ message: "id_producto y cantidad son obligatorios" });
  }

  try {
    const detalle = await DetallePedido.findByPk(id);
    if (!detalle) {
      return res.status(404).send({ message: "Detalle no encontrado" });
    }

    const productoAnterior = await Producto.findByPk(detalle.id_producto);
    if (!productoAnterior) {
      return res.status(404).send({ message: "Producto anterior no encontrado" });
    }

    const productoNuevo = await Producto.findByPk(id_producto);
    if (!productoNuevo) {
      return res.status(404).send({ message: "Producto nuevo no encontrado" });
    }

    // Devolver stock del producto anterior
    productoAnterior.stock += detalle.cantidad;
    await productoAnterior.save();

    // Verificar stock del producto nuevo
    if (productoNuevo.stock < cantidad) {
      return res.status(400).send({
        message: `Stock insuficiente en el nuevo producto. Solo hay ${productoNuevo.stock} disponibles.`
      });
    }

    // Descontar stock del producto nuevo
    productoNuevo.stock -= cantidad;
    await productoNuevo.save();

    // Calcular nuevo subtotal
    const nuevoSubtotal = productoNuevo.precio * cantidad;

    // Actualizar el detalle
    await detalle.update({
      id_producto,
      cantidad,
      subtotal: nuevoSubtotal
    });

    await recalcularTotalPedido(detalle.id_pedido);

    res.send({
      message: "Detalle actualizado correctamente",
      detalle
    });

  } catch (err) {
    res.status(500).send({
      message: "Error actualizando detalle: " + err.message
    });
  }
};


// Eliminar detalle por ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Buscar el detalle
    const detalle = await DetallePedido.findByPk(id);
    if (!detalle) {
      return res.status(404).send({ message: "Detalle no encontrado" });
    }

    // Buscar el producto relacionado
    const producto = await db.productos.findByPk(detalle.id_producto);
    if (!producto) {
      return res.status(404).send({ message: "Producto no encontrado" });
    }

    // Devolver stock
    producto.stock += detalle.cantidad;
    await producto.save();

    // Eliminar el detalle
    await detalle.destroy();

    // Recalcular el total del pedido
    await recalcularTotalPedido(detalle.id_pedido);

    res.send({ message: "Detalle eliminado y stock devuelto correctamente." });

  } catch (err) {
    res.status(500).send({
      message: "Error eliminando detalle: " + err.message
    });
  }
};


exports.deleteAll = async (req, res) => {
  try {
    const detalles = await DetallePedido.findAll();

    // Guardar pedidos únicos para actualizar total después
    const pedidosAfectados = new Set();

    for (const detalle of detalles) {
      const producto = await db.productos.findByPk(detalle.id_producto);
      if (producto) {
        producto.stock += detalle.cantidad;
        await producto.save();
      }

      pedidosAfectados.add(detalle.id_pedido);
    }

    // Eliminar todos los detalles
    await DetallePedido.destroy({ where: {}, truncate: false });

    // Recalcular total de todos los pedidos afectados
    for (const id_pedido of pedidosAfectados) {
      await recalcularTotalPedido(id_pedido);
    }

    res.send({ message: `${detalles.length} detalles eliminados y stock restaurado.` });

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error eliminando todos los detalles y devolviendo stock."
    });
  }
};

