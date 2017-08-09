import express from 'express'
import ooorrr from './ooorrr'

const app = express()
app.use(ooorrr.middleware())

const page = ooorrr`
<!doctype html>
<html>
  <head>
    <title>OOORRR</title>
  </head>
  <body>
  123${1}456
  </body>
</html>
`


app.get('/', (req, res) => {
  res.ooorrr(page)
})

export default app