# http-errors-express

[![Build Status](https://travis-ci.org/blockai/http-errors-express.svg?branch=master)](https://travis-ci.org/blockai/http-errors-express)

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

**httpErrors([logFn])**

Returns an Express middleware. `logFn` is an optional parameter which
will be called on unexpected errors (those that don't have the `expose`
property set to `true`, e.g. >500 errors), defaults to `console.error`

```javascript
import express from 'express'
import httpErrors from 'http-errors-express'

const app = express()
// ...
// This should be the last middleware
app.use(httpErrors())
```

See [./test/index.js](./test/index.js) for more examples.
