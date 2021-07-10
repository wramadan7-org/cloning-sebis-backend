const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/assets/images/profile')
  },
  filename: (req, file, callback) => {
    const ext = file.originalname.split('.')[file.originalname.split('.').length - 1] // type file(jpg/png)
    const filename = new Date().getTime().toString().concat('.').concat(ext)
    callback(null, filename)
  }
})

module.exports = multer({ storage }).single('profile')
