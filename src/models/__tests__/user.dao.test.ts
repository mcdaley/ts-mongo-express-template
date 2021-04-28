//-----------------------------------------------------------------------------
// src/models/__tests__/user.dao.tes.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { ObjectId }         from 'bson'

import MongoDAO             from '../../config/mongodb-dao'
import UserDAO, { IUser }   from '../user.dao'

describe(`UserDAO`, () => {
  let mongoClient: MongoDAO

  let users: IUser[] = [
    {
      _id:      new ObjectId().toHexString(),
      email:    "marv@bills.com",
      password: "secret123",
    },
    {
      _id:      new ObjectId().toHexString(),
      email:    "bruce@bills.com",
      password: "sackmaster",
    },
    {
      _id:      new ObjectId().toHexString(),
      email:    "thurmon@bills.com",
      password: "password123",
    }
  ]

  /**
   * Connect to MongoDB before running tests
   */
   beforeAll( async () => {
    mongoClient = new MongoDAO()
    await mongoClient.connect()
  })

  /**
   * Remove the data from the test DB and Close the MongoDB connection 
   * after running the tests.
   */
  afterAll( async () => {
    await mongoClient.conn(`users`).deleteMany({})
    mongoClient.close()
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      const docs = await mongoClient.conn(`users`).insertMany(users)
    })

    afterEach( async () => {
      await mongoClient.conn(`users`).deleteMany({})
    })

    ///////////////////////////////////////////////////////////////////////////
    // TODO: 04/27/2021
    //
    // NEED TO ADD THE FOLLOWING TEST CASES:
    //  1.) CANNOT ADD USER W/ DUPLICATE EMAIL ADDRESS
    //  2.) EMAIL AND PASSWORD ARE NON-BLANK FIELDS
    //  3.) A VALID EMAIL ADDRESS IS REQUIRED
    ///////////////////////////////////////////////////////////////////////////
    describe(`Create User`, () => {
      it(`Creates a user`, async () => {
        let user: IUser = {
          email:    `andre@bills.com`,
          password: `number83`,
        }

        const result = await UserDAO.create(user)
        expect(result).toMatchObject(user)

        // Verify user is written to DB
        let conn    = mongoClient.conn(`users`)
        let endUser = await conn.find({email: user.email}).toArray()

        expect(endUser.length).toBe(1)
        expect(endUser[0]).toMatchObject(user)
      })
    })

    describe(`Find User by Email`, () => {
      it(`Returns a user`, async () => {
        const email   = users[0].email
        const result  = await UserDAO.findByEmail(email)

        expect(result._id).toBe(users[0]._id)
        expect(result.email).toBe(users[0].email)
      })

      it(`Returns null if the user's email is not found`, async () => {
        const unknownEmail  = `unknown@email.com`
        const result        = await UserDAO.findByEmail(unknownEmail)

        expect(result).toBeNull()
      })
    })
  })
})