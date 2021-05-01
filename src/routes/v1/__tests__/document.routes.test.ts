//-----------------------------------------------------------------------------
// src/routes/v1/__tests__/document.routes.test.ts
//-----------------------------------------------------------------------------
import '../../../config/config'

import request                        from 'supertest'
import { ObjectId }                   from 'bson'

import { app }                        from '../../../index'
import MongoDAO                       from '../../../config/mongodb-dao'
import DocumentDAO, { IDocument }     from '../../../models/document.dao'
import { IUser } from 'src/models/user.dao'

describe(`Document Routes`, () => {
  let mongoClient: MongoDAO

  let user: IUser[] = [
    {
      email:      `bruce@bills.com`,
      password:   `password123`,
    },
  ]

  let books: IDocument[] = [
    {
      _id:      new ObjectId(),
      title:    "Harry Potter and the Sorcerers Stone",
      author:   "J. K. Rowling",
      summary:  "A young wizard goes to Hogwarts",
    },
    {
      _id:      new ObjectId(),
      title:    "The Old Man and the Sea",
      author:   "Earnest Hemingway",
      summary:  "The one that got away",
    },
    {
      _id:      new ObjectId(),
      title:    "A Tale of Two Cities",
      author:   "Charles Dickens",
      summary:  "The French Revolution",
    }
  ]

  let   jwt: string
  let   credentials   = {email: user[0].email, password: user[0].password}

  const login = () => {
    return new Promise( async (resolve, reject) => {
      const response = await request(app).post(`/api/v1/login`).send(credentials)
    
      //* console.log(`[DEBUG] response.header["authorization"]= `, response.header[`authorization`])
      jwt = response.header[`authorization`]

      resolve(true)
    })
  }

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
   * Load the data before each test and login the user.
   */
  beforeEach( async () => {
    //* console.log(`[DEBUG] beforeEach() -> insertMany`)
    const docs  = await mongoClient.conn(`documents`).insertMany(books)
    const users = await mongoClient.conn(`users`).insertMany(user)
    await login()
  })

  /**
   * Delete the data after every test.
   */
  afterEach( async () => {
    //* console.log(`[DEBUG] afterEach() -> deleteMany`)
    await mongoClient.conn(`documents`).deleteMany({})
    await mongoClient.conn(`users`).deleteMany({})
  })

  describe(`POST /api/v1/documents`, () => {
    describe(`Unauthenticated Request`, () => {
      it(`Returns 401 for non-authenticated request`, (done) => {
        const documentId = books[0]._id
        request(app)
          .post(`/api/v1/documents`).send({})
          .expect(401)
          .expect( (res) => {
            expect(res.body.message).toMatch(/unauthorized/i)
          })
          .end(done)
      })
    })

    describe(`Authenticated Requests`, () => {
      it(`Returns 400 error for an invalid document request`, (done) => {
        const invalidDocument = {
          title:  `Missing Author and Summary`
        }

        request(app)
          .post(`/api/v1/documents`)
          .set(`Authorization`, jwt)
          .send(invalidDocument)
          .expect(400)
          .then( (response) => {
            expect(response.body.message).toMatch(/is required/i)
            done()
          })  
      })

      it(`Returns 400 error when document contains undefined fields`, (done) => {
        const invalidDocument = {
          title:    `Othello`,
          author:   `William Shakespeare`,
          summary:  `I am just a jealous guy`,
          isbn:     `jafh324`,
        }

        request(app)
          .post(`/api/v1/documents`)
          .set(`Authorization`, jwt)
          .send(invalidDocument)
          .expect(400)
          .then( (response) => {
            expect(response.body.message).toMatch(/not allowed/i)
            done()
          })
      })

      it(`Creates a new document`, async () => {
        const doc = {
          title:    `Othello`,
          author:   `William Shakespeare`,
          summary:  `I am just a jealous guy`,
        }

        const response      = await request(app).post(`/api/v1/documents`).set(`Authorization`, jwt).send(doc)
        const { document }  = response.body.results

        expect(response.status).toBe(201)
        expect(document).toMatchObject(doc)
      })
    })
  })

  describe(`GET /api/v1/documents`, () => {
    describe(`Unauthenticated Requests`, () => {
      it(`Returns 401 for non-authenticated request`, (done) => {
        const documentId = books[0]._id
        request(app)
          .get(`/api/v1/documents`)
          .expect(401)
          .expect( (res) => {
            expect(res.body.message).toMatch(/unauthorized/i)
          })
          .end(done)
      })
    })

    describe(`Authenticated Requests`, () => {
      it(`Returns an array of all the documents`, (done) => {
        request(app)
          .get(`/api/v1/documents`)
          .set('Authorization', jwt)
          .expect(200)
          .then( (response) => {
            const { documents } = response.body.results
            
            expect(documents.length).toBe(3)
            done()
          })
      })
    })
  })

  describe(`GET /api/v1/documets/:documentId`, () => {
    describe(`Unauthenticated Requests`, () => {
      it(`Returns 401 for non-authenticated request`, (done) => {
        const documentId = books[0]._id
        request(app)
          .get(`/api/v1/documents/${documentId}`)
          .expect(401)
          .expect( (res) => {
            expect(res.body.message).toMatch(/unauthorized/i)
          })
          .end(done)
      })
    })
    
    describe(`Authenticated Requests`, () => {
      it(`Returns a 400 error for an invalid documentId`, (done) => {
        const invalidDocumentId = `bad`
        request(app)
          .get(`/api/v1/documents/${invalidDocumentId}`)
          .set('Authorization', jwt)
          .expect(400)
          .then( (response) => {
            expect(response.body.message).toMatch(/invalid document id/i)
            done()
          })
      })

      it(`Returns a 404 error when the document Id is not found`, (done) => {
        const notFoundDocumentId  = new ObjectId().toHexString()
        request(app)
          .get(`/api/v1/documents/${notFoundDocumentId}`)
          .set(`Authorization`, jwt)
          .expect(404)
          .then( (response) => {
            expect(response.body.message).toMatch(/not found/i)
            done()
          })        
      })

      it(`Returns the document`, (done) => {
        const documentId    = <string>books[1]._id?.toHexString()
        request(app)
          .get(`/api/v1/documents/${documentId}`)
          .set('Authorization', jwt)
          .expect(200)
          .then( (response) => {
            const { document }  = response.body.results

            expect(document.title).toBe(books[1].title)
            expect(document.author).toBe(books[1].author)
            done()
          })
      })
    })
  })

  describe(`PUT /api/v1/documents/:documentId`, () => {
    describe(`Unauthenticated Requests`, () => {
      it(`Returns 401 for non-authenticated request`, (done) => {
        const documentId = books[0]._id
        request(app)
          .put(`/api/v1/documents/${documentId}`)
          .expect(401)
          .expect( (res) => {
            expect(res.body.message).toMatch(/unauthorized/i)
          })
          .end(done)
      })
    })

    describe(`Authenticated Requests`, () => {
      it(`Returns a 400 error for an invalid document Id`, (done) => {
        const invalidDocumentId = 'bad'

        request(app)
          .put(`/api/v1/documents/${invalidDocumentId}`)
          .set('Authorization', jwt)
          .send({})
          .expect(400)
          .then( (response) => {
            const { message }       = response.body

            expect(response.status).toBe(400)
            expect(message).toMatch(/invalid document id/i)
            done()
          })
      })

      it(`Returns 404 error for document Id that is not found`, (done) => {
        const unknownDocumentId   = new ObjectId().toHexString()
        
        request(app)
        .put(`/api/v1/documents/${unknownDocumentId}`)
        .set(`Authorization`, jwt)
        .send({})
        .expect(404)
        .then( (response) => {
          const { message } = response.body
    
          expect(message).toMatch(/not found/i)
          done()
        })
      })

      it(`Returns 400 error for an invalid update document`, (done) => {
        const documentId            = books[2]._id
        const invalidUpdateDocument = {
          title:    "Great Expectations",
          isbn:     "BadField",
        }

        request(app)
          .put(`/api/v1/documents/${documentId}`)
          .set(`Authorization`, jwt)
          .send(invalidUpdateDocument)
          .expect(400)
          .then( (response) => {
            const { message } = response.body
            expect(message).toMatch(/not allowed/i)
            done()
          })
      })

      it(`Updates a document`, (done) => {
        const documentId      = books[2]._id
        const updateDocument  = {
          title:  "Great Expectations",
        }

        request(app)
          .put(`/api/v1/documents/${documentId}`)
          .set(`Authorization`, jwt)
          .send(updateDocument)
          .expect(200)
          .then( (response) => {
            const { document } = response.body.results

            expect(document.title).toBe('Great Expectations')
            expect(document.author).toBe(books[2].author)
            expect(document.summary).toBe(books[2].summary)
            
            return document
          })
          .then( (document) => {
            // Verify document was updated in the DB
            DocumentDAO
              .findById(<string>books[2]._id?.toHexString())
              .then( (book) => {
                expect(document.title).toBe(book.title)
                expect(document.author).toBe(book.author)
                expect(document.summary).toBe(book.summary)
              })
            done()
          })
      })
    })
  })

  describe(`DELETE /api/vi/documents/:documentId`, () => {

    describe(`Unauthenticated Requests`, () => {
      it(`Returns 401 for non-authenticated request`, (done) => {
        const documentId = books[0]._id
        request(app)
          .put(`/api/v1/documents/${documentId}`)
          .expect(401)
          .then( (response) => {
            expect(response.body.message).toMatch(/unauthorized/i)
            done()
          })
      })
    })

    describe(`Authenticated Requests`, () => {
      it(`Returns a 400 error for an invalid document Id`, (done) => {
        const invalidDocumentId = 'bad'

        request(app)
          .delete(`/api/v1/documents/${invalidDocumentId}`)
          .set(`Authorization`, jwt)
          .expect(400)
          .then( response => {
            const { message } = response.body
            expect(message).toMatch(/invalid document id/i)
            done()
          })
      })

      it(`Returns 404 error for document Id that is not found`, (done) => {
        const unknownDocumentId   = new ObjectId().toHexString()

        request(app)
          .delete(`/api/v1/documents/${unknownDocumentId}`)
          .set(`Authorization`, jwt)
          .expect(404)
          .then( response => {
            const { message } = response.body
            expect(message).toMatch(/not found/i)
            done()
          })
      })

      it(`Deletes a document`, async () => {
        const documentId  = books[1]._id?.toHexString()
        const response    = await request(app).delete(`/api/v1/documents/${documentId}`).set(`Authorization`, jwt)

        expect(response.status).toBe(204)

        // Verify document is deleted from the DB
        const { documents } = await DocumentDAO.find()
        expect(documents.length).toBe(books.length - 1)
      })
    })
  })
})