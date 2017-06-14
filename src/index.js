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

    if (err.expose) {
      // Expected errors...
      before(err, req, true, () => {
        maybeJson(formatError(err, req, true))
      })
    } else {
      before(err, req, false, () => {
        maybeJson(formatError(err, req, false))
      })
    }
  }
}

export default httpErrors
