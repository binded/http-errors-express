import test from 'blue-tape'
import request from 'supertest-as-promised'
import express from 'express'
import createError from 'http-errors'
import httpErrors from '../src'

const app = express()
app.get('/plain-error', (req, res, next) => {
  next(new Error('some plain error'))
})
app.get('/404', (req, res, next) => {
  next(new createError.NotFound('some custom message'))
})
app.get('/402-with-detail', (req, res, next) => {
  next(createError(402, 'Your balance is too low.', {
    detail: {
      currentBalance: 100,
      price: 150,
    },
  }))
})
app.get('/500-with-expose', (req, res, next) => {
  next(createError(500, 'exposed internal error', { expose: true }))
})
app.get('/after-headers-sent', (req, res, next) => {
  res.json({ test: true })
  next(new Error('after headers'))
})

const state = {
  logs: [],
}
const log = (err) => state.logs.push(err)
app.use(httpErrors(log))

/*
let httpPort
const httpServer = app.listen(() => port = httpServer.address().port)
*/


test('plain', (t) => request(app)
  .get('/plain-error')
  .expect(500)
  .expect('Content-Type', /json/)
  .then(({ body }) => {
    t.deepEqual(body, {
      error: {
        name: 'Error',
      },
    })
  })
)

test('404', (t) => request(app)
  .get('/404')
  .expect(404)
  .expect('Content-Type', /json/)
  .then(({ body }) => {
    t.deepEqual(body, {
      error: {
        name: 'NotFoundError',
        message: 'some custom message',
      },
    })
  })
)

test('expose', (t) => request(app)
  .get('/500-with-expose')
  .expect(500)
  .expect('Content-Type', /json/)
  .then(({ body }) => {
    t.deepEqual(body, {
      error: {
        name: 'InternalServerError',
        message: 'exposed internal error',
      },
    })
  })
)

test('detail', (t) => request(app)
  .get('/402-with-detail')
  .expect(402)
  .expect('Content-Type', /json/)
  .then(({ body }) => {
    t.deepEqual(body, {
      error: {
        name: 'PaymentRequiredError',
        message: 'Your balance is too low.',
        detail: {
          currentBalance: 100,
          price: 150,
        },
      },
    })
  })
)

test('after-headers-sent', (t) => {
  state.logs = []
  return request(app)
    .get('/after-headers-sent')
    .expect(200)
    .expect('Content-Type', /json/)
    .then(({ body }) => {
      t.deepEqual(body, {
        test: true,
      })
      t.equal(state.logs.length, 1)
      t.equal(state.logs[0].message, 'after headers')
    })
})
