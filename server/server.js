import express from 'express'
import ooorrr from './ooorrr'

const app = express()
app.use(ooorrr.middleware())

const page = () => {
  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve(`<p>Delayed string here</p>`)
    }, 10000)
  })
  return ooorrr`
    <!doctype html>
    <html>
      <head>
        <title>OOORRR</title>
        ${ooorrr.runtime}
      </head>
      <body>
        ${p}
        <p>Plain numbers: 123${5}56</p>
        <p>Plain strings: hello, ${'world'}</p>
      </body>
    </html>
  `
}

app.get('/', (req, res) => {
  res.ooorrr(page())
})

export default app