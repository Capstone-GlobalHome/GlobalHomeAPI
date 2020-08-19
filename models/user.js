import Sequelize from 'sequelize'
import db from '../config/db'

const User = db.define('user', {
   name: { type: Sequelize.STRING },
   email: { type: Sequelize.STRING },
   verification_code: { type: Sequelize.INTEGER },
   resend_code_time: { type: Sequelize.INTEGER },
   password_reset_date: { type: Sequelize.DATE },
   password: { type: Sequelize.STRING },
   status: { type: Sequelize.INTEGER, defaultValue: 0 }
});

User.sync().then(() => {
   // console.log('table created');
});

export default User;


/*
status
0 for PENDING
1 for ACTIVE
2 for BLOCK
*/