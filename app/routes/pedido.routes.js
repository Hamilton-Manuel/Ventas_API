module.exports = app => {
  const pedidos = require("../controllers/pedido.controller.js");
  const router = require("express").Router();

  router.post("/create", pedidos.create);
  router.get("/", pedidos.findAll);
  router.get("/:id", pedidos.findOne);
  router.put("/update/:id", pedidos.update);
  router.delete("/delete/:id", pedidos.delete);
  router.delete("/delete", pedidos.deleteAll);

  app.use("/api/pedido", router);
};
