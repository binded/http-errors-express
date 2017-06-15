# http-errors-express

[![Build Status](https://travis-ci.org/binded/http-errors-express.svg?branch=master)](https://travis-ci.org/binded/http-errors-express)

[Express](http://expressjs.com) middleware for handling errors generated or compatible with the [http-errors](https://github.com/jshttp/http-errors) module. Sends errors to client using JSON, for example:

```javascript
import createError from 'http-errors'

// ...

app.post('/pay', (req, res, next) => {
  next(createError(402, 'Your balance is too low.', {
    detail: {
      currentBalance: 100,
      price: 150,
    },
  }))
})

// ...
```

would send the following JSON response payload to the client:

```json
{
  "error": {
    "name": "PaymentRequiredError",
    "message": "Your balance is too low.",
    "detail": {
      "currentBalance": 100,
      "price": 150
    }
  }
}
```

See [./test/index.js](./test/index.js) for more examples.

## Install

```
npm install --save http-errors-express
```

## Usage

**httpErrors(opts)**

All options are optional.

- `opts.before` function with `(err, req, isExposed, cb)` signature that can
    be used to log errors for example. Defaults to logging with `console.error`
    for unexposed errors. Can ignore the `cb` and instead return a
    promise.
- `opts.formatError` function with `(err, req, isExposed)` signature which formats errors
    before passing to `res.json`

Returns an Express middleware. The HTTP response is only sent after the
`before` function's callback is called. This is useful if we want to
include an error ID received from a remote error logging service (e.g.
service) as part of the response.

If an exposed error has a `detail` property, it will by default be
included as part of the JSON response.

```javascript
import express from 'express'
import httpErrors from 'http-errors-express'

const app = express()
// ...
// This should be the last middleware
app.use(httpErrors())
```

See [./test/index.js](./test/index.js) for more examples.
