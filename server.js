import dotenv from "dotenv";
dotenv.config();
import { config } from "./config/config";
import app from "./app";

// Database
import db from './config/db';
// Test DB
db.authenticate()
  .then(() => console.log('Connect to Postgres Database...'))
  .catch(err => console.log('Error: ' + err))

app.listen(config.port, () => {
  console.log(`GlobalHome server listen on port ${config.port}...`);
});
