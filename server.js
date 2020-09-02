import app from "./app";
import { environment } from "./config/environment";

// db config
import db from './models';

app.listen(environment.PORT, () => {
  db.sequelize.sync({force: true}).then((data) => {
    console.log('Postgres server started and tables created successfully...')
  }).catch((error) => {
    console.log('Error... Postgres connection error, not connect with db')
  })
  console.log(`GlobalHome server listen on port ${environment.PORT}...`);
});
