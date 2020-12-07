import moment from 'moment'
let level = 'info'

switch (process.env.NODE_ENV) {
   case 'development':
      level = 'debug'
      break
   case 'test':
      level = 'info'
      break
   case 'production':
      level = 'info'
      break
}

export const loggerConfig = {
   appenders: {
      console: {
         type: 'console',
         category: 'console'
      },
      file: {
         type: 'dateFile',
         category: 'file',
         filename: `logs/${moment().format('DD-MM-YYYY')}.log`,
         maxLogSize: 10240,
         backups: 3,
         // pattern: "%d{dd/MM hh:mm} %-5p %m"
      }
   },
   categories: {
      default: { appenders: ['console', 'file'], level: level },
      file: { appenders: ['file'], level: level }
   }
}