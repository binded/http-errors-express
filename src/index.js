/* eslint-disable no-console */
export const defaults = {
  before: (err, req, isExposed, cb) => {
    if (isExposed) return cb()
    console.error(err)
    cb()
  },
  formatError: (err, req, isExposed) => {
    if (isExposed) {
      return {
        error: {
          name: err.name,
          message: err.message,
          detail: err.detail,
        },
      }
    }
    return {
      error: {
        name: err.name,
      },
    }
  },
}

const noop = () => {}

const isPromise = v => !!(v && typeof v.then === 'function')

const httpErrors = (opts = {}) => {
  // for backwards compatibility, httpErrors used to take
  // a single logError argument which was called only on
  // unexposed errors
  if (typeof opts === 'function') {
    const logError = opts
    return httpErrors({
      before: (err, req, isExposed, cb) => {
        if (isExposed) return cb()
        logError(err, req, true)
        return cb()
      },
    })
  }

  const {
    before = defaults.before,
    formatError = defaults.formatError,
  } = opts

  /* eslint-disable no-unused-vars */
  return (err, req, res, next) => {
    const maybeJson = res.headersSent
      ? noop
      : json => res.json(json)

    if (!res.headersSent) {
      if (err.status) {
        res.status(err.status)
      } else {
        res.status(500)
      }

      res.set('Cache-Control', null)
    }

    const isExposed = err.expose

    let cbWasCalled = false
    const cb = (beforeErr) => {
      if (beforeErr) {
        console.warn('http-errors-express: error in before() function: ')
        console.warn(err)
      }
      if (cbWasCalled) return
      cbWasCalled = true
      maybeJson(formatError(err, req, isExposed))
    }

    const maybePromise = before(err, req, isExposed, cb)
    if (isPromise(maybePromise)) {
      maybePromise.then(() => { cb() }, cb)
    }
  }
}

export default httpErrors
