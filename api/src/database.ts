import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "postgres",
  database: process.env.DB_NAME || "your_database",
  username: process.env.DB_USER || "your_user",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,  
  logging: false
});

(async () => {
  sequelize.sync({ alter: true }).then(()=> {

  }).catch((error)=> {
    console.error("❌ Database sync failed:", error);
  process.exit(1);
  })
})();