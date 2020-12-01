import multer from 'multer'

const storage = multer.memoryStorage({
   destination: function (req, file, cb) {
      cb(null, '')
   }
})
export default multer({ storage: storage })