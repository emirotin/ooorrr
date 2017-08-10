const ooorrr = (strings, ...values) => {
  return {
    __ooorrr: true,
    strings,
    values
  }
}

const finishResponseIfNeeded = (res, context) => {
  if (!context.pendingPromises) {
    res.end(context.lastString)
  }
}

const renderPlaceholder = (res, id) => {
  res.write(`
    <span data-ooorrr-placeholder="${id}"></span>
  `)
}

const renderReplacement = (res, id, result, context) => {
  res.write(`<div data-ooorrr-replacement="${id}">`)
  renderValue(res, result, context)
  res.write(`
    </div>
    <script>__oorr.replace(${id});</script>
  `)
}

const renderValue = (res, value, context) => {
  if (value == null || value === '' || value === false) {
    return
  }

  if (value.__ooorrr) {
    return renderTemplate(res, value.strings, value.values, context)
  }

  if (typeof value.then === 'function') {
    const id = context.lastChunkId++
    context.pendingPromises += 1

    renderPlaceholder(res, id)

    value.then((result) => {
      renderReplacement(res, id, result, context)
      context.pendingPromises -= 1
      finishResponseIfNeeded(res, context)
    })

    return
  }

  res.write(value.toString())
}

const renderTemplate = (res, strings, values, context) => {
  const l = values.length

  for (let i = 0; i < l; i++) {
    res.write(strings[i])
    renderValue(res, values[i], context)
  }
  res.write(strings[l])

  finishResponseIfNeeded(res, context)
}

const buildContext = ({ strings, values }) => {
  const l = values.length

  if (values[l - 1] !== ooorrr.end) {
    throw new Error('In the top-level template your last interpolated value MUST be `${ooorrr.end}`')
  }

  return [
    strings.slice(0, l),
    values.slice(0, l - 1),
    {
      lastChunkId: 0,
      pendingPromises: 0,
      lastString: strings[l]
    }
  ]
}

ooorrr.middleware = () => (req, res, next) => {
  res.ooorrr = (payload) => {
    if (!payload.__ooorrr) {
      console.error('Invalid ooorrr payload!')
      res.status(500).send()
    }

    try {
      const [ strings, values, context ] = buildContext(payload)
      renderTemplate(res, strings, values, context)
    } catch (e) {
      console.error('Invalid ooorrr payload!', e)
      res.status(500).send()
    }
  }
  next()
}

ooorrr.runtime = `
  <style>
    [data-ooorrr-placeholder], [data-ooorrr-replacement] {
      display: none !important;
    }
  </style>
  <script>
    window.__oorr = {
      replace: function(id) {
        var placeholder = document.querySelector("[data-ooorrr-placeholder='" + id + "']"),
          replacement = document.querySelector("[data-ooorrr-replacement='" + id + "']"),
          fragment = document.createDocumentFragment();

          while (replacement.firstChild) {
            fragment.appendChild(replacement.firstChild);
          }
          replacement.parentNode.removeChild(replacement);

          placeholder.parentNode.insertBefore(fragment, placeholder);
          placeholder.parentNode.removeChild(placeholder);
      }
    };
  </script>
`

ooorrr.end = `___OOORRR_END___`

export default ooorrr
