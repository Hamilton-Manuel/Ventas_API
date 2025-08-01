// Importamos el modulo express 
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");

//db.sequelize.sync(); //para crear tablas nuevas en la base de datos
 
//drop the table if it already exists

 /*db.sequelize.sync({ force: true }).then(() => {//para borrar todas las tablas y crear nuevamente todas las tablas en la base de datos
   console.log("Drop and re-sync db.");
 });*/

// simple route
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application" });
});

//require("./app/routes/turorial.routes")(app);
require("./app/routes/cliente.routes.js")(app);
require("./app/routes/producto.routes.js")(app);
require("./app/routes/pedido.routes.js")(app);
require("./app/routes/detalle_pedido.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});