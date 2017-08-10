OOORRR wut!?
===

It's an experiment of the Out Of Order RendeReR
based on promises, with easy to use interface
and streaming (chunked) rendering.

It allows you to render the page skeleton
and let the thing fill the gaps
when the async pieces are figured out.

## Try locally

```sh
git clone
yarn install # or npm install
yarn dev # or npm run dev
```

Then visit http://localhost:3000 and watch.

## How does it work?

The core of this project is based on a bunch of
old and new exciting APIs:
- chunked response
- promises
- ES tagged template literals (optional)

The project provides the Express middleware and the template literal tag.

The entire usage example looks like this:

```js
import express from 'express'
import Promise from 'bluebird'
import ooorrr from './ooorrr'

const app = express()
app.use(ooorrr.middleware()) // (1)

const page = () => {
  const q = Promise.delay(5000).thenReturn(`
    <p>Delayed for 5s string here</p>
  `)

  const p1 = Promise.delay(1000).thenReturn(`<strong>Delayed for 1s fragment here</strong>`)
  const p2 = Promise.delay(15000).thenReturn(`<strong>Delayed for 15s fragment here</strong>`)

  // (2)
  const p = Promise.delay(10000).thenReturn(ooorrr`
    <p>Delayed for 10s string here, but also:</p>
    <ul>
      <li>${p1} (should be available instantly with the parent fragment)</li>
      <li>${p2} (should be delayed)</li>
    </ul>
  `)

  // (3)
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
        ${ooorrr.end}
      </body>
    </html>
  `
}

app.get('/', (req, res) => {
  res.ooorrr(page()) // (4)
})

export default app

```

Here are the key pieces of the puzzle:

1) we use the middleware that provides the `res.ooorrr` method used in (4)
2) we also make use of the template tag `ooorrr` that marks the template literal
as OOORRR-compatible
3) we use the same tag for the top-level template. Inside of it we can interpolate
any objects. Numbers and strings are output verbatim, objects and arrays are stringified,
_other ooorrr literals_ are handled recursively, and _pomises_ are handled asynchronously (see below),
4) we use the method added in (1) to render the given _ooorrr template_ to the response.

### So how are promises handled?

If the interpolated value is a promise a _placeholder_ is rendered.

When the promise is resolved another chunk is sent to the browser containing:
a) the resolved markup wrapped in a hidden container, and
b) a single line of script that causes this markup placed into the proper place.

### How does recusion work?

If the interpolated value is another _ooorrr template_ (or a promise eventually resolving to such template)
it's handeld recursively: any markup instantly available is rendered as soon as possible, and the async values
are rendered when they're available (see the previous paragraph).

## What about `runtime` and `end`?

In order for the entire thing to work _before any_ interpolations one need to include the OOORRR runtime.
It's tiny bit of CSS (that hides the pieces yet to be processed) and JS (that defines the method to put the
async pieces in place).

The `end` piece is used to delay rendering the closing part of the HTML (in our example the closing tags for BODY and HTML)
until all the content is rendered.

## Formal rules

Formally these are the simple but mandatory rules that have to be followed to get the system working:

1) Add `ooorrr.middleware()` to express app
2) Use `res.ooorrr(content)` to render the response in chunks
3) The argument passed to `res.ooorrr` MUST be the _ooorrr template_,
that is a template literal tagged with `ooorrr` (obviously `ooorrr` is just a function which can
be used directly: `ooorrr(strings, ...values)`)
4) This top-level template MUST include `${ooorrr.runtime}` _before_ any othe rinterpolations
(good place - beginning of HEAD or BODY)
5) This top-level template MUST include `${ooorrr.end}` after all the content you want to be rendered ASAP
(good place - end of BODY or before any JS you only want to run when the DOM is built in its entirety)

As already said before, the string literals can include the following interpolated values:
- numbers - always rendered
- strings - empty strings are ignored, the rest are rendered
- booleans - `false` is ignored (just as React is doing), `true` is rendered (have no idea why you need this)
- null, undefined - ignored
- nested _ooorrr templates_ - rendered recursively, with nested promises properly handled
- promises - special placeholders are rendered, which are later replaced with whatever the promise resolves to
(including the proper handling for nested _ooorrr templates_ and promises in any combinations)
- other values - rendered stringified (doesn't make much sense to me, better stringify yourself)

## Open problems

The browsers have built-in buffers preventing chunks from being parsed if they're too small.

I'm still looking into a non-obtrusive way to solve this without pusihing extra 2Kb of spaces :)
