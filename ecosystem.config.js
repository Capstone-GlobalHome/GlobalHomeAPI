var datetime = new Date();
var date = datetime.getDate() +"-"+  (datetime.getMonth() + 1) + "-" + datetime.getFullYear();
const fs = require("fs");
(function () {
  if(!fs.existsSync(__dirname+'/logs')) {
    fs.mkdirSync(__dirname+'/logs');
  }
})();

module.exports = {
  apps : [{
    name: "local",
    script: 'nodemon --exec babel-node server.js',
    log_file: "logs/" + date + ".log",
    env:  {
      "NODE_ENV": "development"
    }
  },
  {
    name: "prod",
    script: 'dist/server.js',
    log_file: "logs/" + date + ".log",
    env:  {
      "NODE_ENV": "production"
    }
  }
],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
