import app from "./app";
import { environment } from "./config/environment";

import cluster from "cluster";
import * as os from 'os';

// db config
import db from './models';

const numCPUs = os.cpus().length;

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);
//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }
//   cluster.on('exit', (worker, code, signal) => {
//     cluster.fork();
//     console.log(`worker ${worker.process.pid} died`);
//   });
//   db.sequelize.sync({ force: false }).then((data) => {
//     console.log('Postgres server started and tables created successfully...')
//   }).catch((error) => {
//     console.log('Error... Postgres connection error, not connect with db')
//   })
// } else {
//   app.listen(environment.PORT, () => {

//     console.log(`GlobalHome server listen on port ${environment.PORT}...`);
//   });
//   console.log(`Worker ${process.pid} started`);
// }

// For dev environment
app.listen(environment.PORT, () => {
  db.sequelize.sync({ force: false }).then((data) => {
    console.log('Postgres server started and tables created successfully...')
  }).catch((error) => {
    console.log('Error... Postgres connection error, not connect with db')
  })
  console.log(`GlobalHome server listen on port ${environment.PORT}...`);
});



