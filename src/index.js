/* eslint-disable no-console */
const defaultLogError = err => console.error(err)
const noop = () => {}

export default (logError = defaultLogError) => {
  if (logError && typeof logError !== 'function') {
    throw new Error('logError must be a function')
  }

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
      maybeJson({
        error: {
          name: err.name,
          message: err.message,
          detail: err.detail,
        },
      })
    } else {
      // Unexpected errors
      if (logError) {
        logError(err, req)
      }
      maybeJson({
        error: {
          name: err.name,
        },
      })
    }
  }
}
