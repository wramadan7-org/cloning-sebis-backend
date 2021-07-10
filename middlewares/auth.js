const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const { authorization } = req.headers

  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7, authorization.length)
    // const payload = jwtDecode(token, { payload: true })

    try {
      jwt.verify(token, '7bdb4096da637aaa', (err, decoded) => {
        if (err) {
          // return response(res, 'Not verify', '', false)
          res.json({
            status: 401,
            message: 'Not verify'
          })
        } else {
          // decode berisi payload, ambil payload dan masukkan ke dalam req.user
          req.jwt = decoded.id
          // console.log(req.user)
          next()
        }
      })
    } catch (err) {
      // return response(res, `${err}`, '', false)
      res.json({
        status: 500,
        message: err.message
      })
    }
  } else {
    // return response(res, 'Forbidden access', '', false)
    res.json({
      status: 403,
      message: 'Forbidden access',
    })
  }
}