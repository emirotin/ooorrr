const middleware = () => (req, res, next) => {
  res.ooorrr = (payload) => {
    if (!payload.__ooorrr) {
      console.error('Invalid ooorrr payload!')
      res.status(500).send()
    }

    res.send(payload.body)
  }
  next()
}

const ooorrr = (strings, ...values) => {
  return {
    __ooorrr: true,
    body: strings.join('<br>')
  }
}

ooorrr.middleware = middleware

export default ooorrr