//-----------------------------------------------------------------------------
// src/routes/v1/__tests__/auth.routes.test.ts
//-----------------------------------------------------------------------------
import '../../../config/config'

import request                from 'supertest'
import { ObjectId }           from 'bson'

import { app }                            from '../../../index'
import MongoDAO                           from '../../../config/mongodb-dao'
import UserDAO, { IUser, IRegisterUser }  from '../../../models/user.dao'
import { use } from 'passport'

describe(`User Routes`, () => {
  let mongoClient:  MongoDAO

  let users: IUser[] = [
    {
      _id:      new ObjectId(),
      email:    "marv@bills.com",
      password: "secret123",
    },
    {
      _id:      new ObjectId(),
      email:    "bruce@bills.com",
      password: "sackmaster",
    },
    {
      _id:      new ObjectId(),
      email:    "thurmon@bills.com",
      password: "password123",
    }
  ]

  /**
   * Connect to MongoDB before running tests.
   */
   beforeAll( async () => {
    mongoClient = new MongoDAO()
    await mongoClient.connect()
  })

  /**
   * Close the MongoDB connection after running all of the tests.
   */
  afterAll( async () => {
    mongoClient.close()
  })

  /**
   * Load the data before each test.
   */
  beforeEach( async () => {
    const docs = await mongoClient.conn(`users`).insertMany(users)
  })

  /**
   * Delete the data after every test.
   */
  afterEach( async () => {
    await mongoClient.conn(`users`).deleteMany({})
  })

  /**
   * POST /api/v1/register
   */
  describe(`POST /api/v1/register`, () => { 
    it(`Returns 400 error for an invalid user`, async () => {
      let response = await request(app).post(`/api/v1/register`).send({})
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)

      response = await request(app).post(`/api/v1/register`).send({
        email:    users[0].email
      })
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)

      response = await request(app).post(`/api/v1/register`).send({
        email:    users[0].email,
        password: users[0].password,
      })
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)
    })

    it(`Returns 400 error if user has an extra field`, async () => {
      let endUser  = {
        email:            users[0].email,
        password:         users[0].password,
        confirmPassword:  users[0].password
      }
      let response = await request(app).post(`/api/v1/register`).send({
        ...endUser,
        extraField: `invalid field`
      })

      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/\"extraField\" is not allowed/i)
    })

    it(`Returns 400 error if the email is invalid`, () => {
      const invalidEmails = [`bob`, `bob@com`, `@email.com`]
      
      invalidEmails.forEach( async (email) => {
        let endUser   = {
          email:            email,
          password:         users[0].password,
          confirmPassword:  users[0].password
        }
        let response  = await request(app).post(`/api/v1/register`).send(endUser)

        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/must be a valid email/i)
      })
    })

    it(`Returns 400 error if password and confirmPassword are different`, async () => {
      let endUser   = {
        email:            users[0].email,
        password:         users[0].password,
        confirmPassword:  `different-password`
      }
      let response  = await request(app).post(`/api/v1/register`).send(endUser)

      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/"confirmPassword"/i)
    })

    it(`Returns 400 error if email is already registered`, async () => {
      let response = await request(app).post(`/api/v1/register`).send({
        email:            users[1].email,
        password:         users[1].password,
        confirmPassword:  users[1].password,
      })

      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/email already exists/i)
    })

    it(`Creates a user account`, async () => {
      const user = {
        email:            `bobby.chandler@bills.com`,
        password:         `secret123`,
        confirmPassword:  `secret123`,
      }
      const response = await request(app).post(`/api/v1/register`).send(user)

      // Verify response contains user
      expect(response.status).toBe(201)
      expect(response.body.results.user.email).toBe(user.email)

      // Verify user is saved to the DB
      let conn   = mongoClient.conn(`users`)
      let result = await conn.find({email: user.email}).toArray()

      expect(result.length).toBe(1)
      expect(result[0].email).toBe(user.email)
    })
  })

  describe(`POST /api/v1/login`, () => {
    it(`Returns 400 error for an invalid user`, async () => {
      let response = await request(app).post(`/api/v1/login`).send({})
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)

      response = await request(app).post(`/api/v1/login`).send({
        email:    users[0].email
      })
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)

      response = await request(app).post(`/api/v1/login`).send({
        password: users[0].password,
      })
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)
    })

    it(`Returns 400 error if the email is invalid`, () => {
      const invalidEmails = [`bob`, `bob@com`, `@email.com`]
      
      invalidEmails.forEach( async (email) => {
        let endUser   = {
          email:    email,
          password: users[0].password,
        }
        let response  = await request(app).post(`/api/v1/login`).send(endUser)

        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/must be a valid email/i)
      })
    })

    it(`Returns 404 error if email is not found`, async () => {
      let response = await request(app).post(`/api/v1/login`).send({
        email:            `unregistered@bills.com`,
        password:         `password123`,
      })

      expect(response.status).toBe(404)
      expect(response.body.message).toMatch(/email not found/i)
    })

    it(`Returns 400 error if user enters wrong password`, async () => {
      let user = {
        email:    users[0].email,
        password: `wrongPassword`,
      }
      let response = await request(app).post(`/api/v1/login`).send(user)

      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/invalid credentials/i)
    })

    it(`Logs user into the application`, async () => {
      let response = await request(app).post(`/api/v1/login`).send({
        email:    users[1].email,
        password: users[1].password,
      })

      expect(response.status).toBe(200)
      expect(response.body.user.email).toBe(users[1].email)
      expect(response.body.user._id).toBe(users[1]._id?.toHexString())
      expect(response.header.authorization).toMatch(/Bearer/)
    })
  })
})
