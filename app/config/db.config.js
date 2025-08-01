module.exports = {
  HOST: "ep-aged-hill-af4dh6nw-pooler.c-2.us-west-2.aws.neon.tech",
  USER: "neondb_owner",
  PASSWORD: "npg_FMhamK6pwk7n",
  DB: "neondb",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

//psql 'postgresql://neondb_owner:npg_FMhamK6pwk7n@ep-aged-hill-af4dh6nw-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'