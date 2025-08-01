// Cargamos el archivo de configuración que contiene los datos de conexión a la base de datos
const dbConfig = require("../config/db.config.js");

// Importamos Sequelize, el ORM que nos permite trabajar con PostgreSQL como objetos JS
const Sequelize = require("sequelize");

// Creamos una instancia de Sequelize con los parámetros de conexión, incluyendo SSL para NeonDB
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,            // Dirección del servidor (host) de la base de datos
  dialect: dbConfig.dialect,      // El tipo de base de datos, en este caso 'postgres'

  // Configuraciones específicas del dialecto (PostgreSQL), incluyendo la conexión segura SSL
  dialectOptions: {
    ssl: {
      require: true,              // Indica que la conexión debe usar SSL obligatoriamente
      rejectUnauthorized: false   // Acepta certificados autofirmados o no verificados (útil en entornos no productivos)
    }
  },

  // Configuración del pool de conexiones para optimizar el rendimiento
  pool: {
    max: dbConfig.pool.max,       // Máximo de conexiones simultáneas
    min: dbConfig.pool.min,       // Mínimo de conexiones
    acquire: dbConfig.pool.acquire, // Tiempo máximo para obtener una conexión antes de lanzar error
    idle: dbConfig.pool.idle      // Tiempo que una conexión puede estar inactiva antes de ser liberada
  }
});

// Creamos un objeto `db` que exportaremos para acceder a Sequelize y los modelos desde otras partes del proyecto
const db = {};

// Asignamos la clase Sequelize al objeto `db`, útil si se requiere usar métodos del ORM manualmente
db.Sequelize = Sequelize;

// Asignamos la instancia de conexión Sequelize con los parámetros definidos
db.sequelize = sequelize;

// Importamos el modelo de cliente desde la carpeta 'models' y lo registramos en el objeto `db`
// Le pasamos la instancia de conexión `sequelize` y la clase `Sequelize` como argumentos
db.clientes = require("./cliente.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);
db.pedidos = require("./pedido.model.js")(sequelize, Sequelize);
db.detalle_pedido = require("./detalle_pedido.model.js")(sequelize, Sequelize);


// relaciones

// Cliente 1:N Pedido
db.clientes.hasMany(db.pedidos, { foreignKey: "id_cliente" });
db.pedidos.belongsTo(db.clientes, { foreignKey: "id_cliente" });

// Pedido 1:N DetallePedido
db.pedidos.hasMany(db.detalle_pedido, { foreignKey: "id_pedido" });
db.detalle_pedido.belongsTo(db.pedidos, { foreignKey: "id_pedido" });

// Producto 1:N DetallePedido
db.productos.hasMany(db.detalle_pedido, { foreignKey: "id_producto" });
db.detalle_pedido.belongsTo(db.productos, { foreignKey: "id_producto" });


// Aquí puedes seguir importando otros modelos de forma similar
// Ejemplo: db.productos = require("./producto.model.js")(sequelize, Sequelize);

// Exportamos el objeto `db` para que pueda ser usado por otros módulos (por ejemplo, en el `server.js`)
module.exports = db;