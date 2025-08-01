module.exports = app => {
  const detalles = require("../controllers/detalle_pedido.controller.js");
  const router = require("express").Router();

  router.post("/create", detalles.create);
  router.get("/", detalles.findAll);
  router.get("/:id", detalles.findOne);
  router.put("/update/:id", detalles.update);
  router.delete("/delete/:id", detalles.delete);
  router.delete("/delete", detalles.deleteAll);

  app.use("/api/detalle_pedido", router);
};
