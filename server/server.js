import express from 'express'
import Promise from 'bluebird'
import ooorrr from './ooorrr'

const app = express()
app.use(ooorrr.middleware())

const page = () => {
  const q = Promise.delay(5000).thenReturn(`
    <p>Delayed for 5s string here</p>
  `)

  const p1 = Promise.delay(1000).thenReturn(`<strong>Delayed for 1s fragment here</strong>`)
  const p2 = Promise.delay(15000).thenReturn(`<strong>Delayed for 15s fragment here</strong>`)

  const p = Promise.delay(10000).thenReturn(ooorrr`
    <p>
      Delayed for 10s string here, but also:
      <ul>
        <li>${p1} (should be available instantly with the parent fragment)</li>
        <li>${p2} (should be delayed)</li>
      </ul>
    </p>
  `)

  return ooorrr`
    <!doctype html>
    <html>
      <head>
        <title>OOORRR</title>
        ${ooorrr.runtime}
      </head>
      <body>
        ${p}
        ${q}
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