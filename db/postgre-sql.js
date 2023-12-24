// Call all the Imports
const postgres = require("postgres");
const dotenv = require("dotenv");

// Initialize Env Variables
dotenv.config();

class Sql {
  static sql;
  constructor() {
    if (Sql.sql !== undefined) {
      // console.log("Reusing");
      return Sql.sql;
    } else {
      // console.log("New Sql");
      const connectionString = process.env.SUPABASE_DATABASE_URL;

      const sql = postgres(connectionString, {
        host: process.env.SUPABASE_HOST,
        port: process.env.SUPABASE_PORT,
        password: process.env.SUPABASE_PASSWORD,
        username: "postgres",
        database: "postgres",
      });
      
      Sql.sql = sql;
      return Sql.sql;
    }
  }
}

module.exports = Sql;
