//-----------------------------------------------------------------------------
// src/routes/v1/__tests__/document.routes.test.ts
//-----------------------------------------------------------------------------
import '../../../config/config'

import request                        from 'supertest'
import { ObjectId }                   from 'bson'

import { app }                        from '../../../index'
import MongoDAO                       from '../../../config/mongodb-dao'
import DocumentDAO, { IDocument }     from '../../../models/document.dao'

describe(`Document Routes`, () => {
  let mongoClient: MongoDAO

  let books: IDocument[] = [
    {
      _id:      new ObjectId().toHexString(),
      title:    "Harry Potter and the Sorcerers Stone",
      author:   "J. K. Rowling",
      summary:  "A young wizard goes to Hogwarts",
    },
    {
      _id:      new ObjectId().toHexString(),
      title:    "The Old Man and the Sea",
      author:   "Earnest Hemingway",
      summary:  "The one that got away",
    },
    {
      _id:      new ObjectId().toHexString(),
      title:    "A Tale of Two Cities",
      author:   "Charles Dickens",
      summary:  "The French Revolution",
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
    const docs = await mongoClient.conn(`documents`).insertMany(books)
  })

  /**
   * Delete the data after every test.
   */
  afterEach( async () => {
    await mongoClient.conn(`documents`).deleteMany({})
  })

  describe(`POST /api/v1/documents`, () => {
    it(`Returns 400 error for an invalid document request`, async () => {
      const invalidDocument = {
        title:  `Missing Author and Summary`
      }

      const response = await request(app).post(`/api/v1/documents`).send(invalidDocument)
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/is required/i)
    })

    it(`Returns 400 error when document contains undefined fields`, async () => {
      const invalidDocument = {
        title:    `Othello`,
        author:   `William Shakespeare`,
        summary:  `I am just a jealous guy`,
        isbn:     `jafh324`,
      }

      const response = await request(app).post(`/api/v1/documents`).send(invalidDocument)
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/not allowed/i)
    })

    it(`Creates a new document`, async () => {
      const doc = {
        title:    `Othello`,
        author:   `William Shakespeare`,
        summary:  `I am just a jealous guy`,
      }

      const response = await request(app).post(`/api/v1/documents`).send(doc)
      const { document }  = response.body.results

      expect(response.status).toBe(201)
      expect(document).toMatchObject(doc)
    })
  })

  describe(`GET /api/v1/documents`, () => {
    it(`Returns an array of all the documents`, async () => {
      const response      = await request(app).get(`/api/v1/documents`)
      const { documents } = response.body.results
      
      expect(response.status).toBe(200)
      expect(documents.length).toBe(3)
      expect(documents).toMatchObject(books)
    })
  })

  describe(`GET /api/v1/documets/:documentId`, () => {
    it(`Returns a 400 error for an invalid documentId`, async () => {
      const invalidDocumentId = `bad`
      const response          = await request(app).get(`/api/v1/documents/${invalidDocumentId}`)

      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(/invalid document id/i)
    })

    it(`Returns a 404 error when the document Id is not found`, async () => {
      const notFoundDocumentId  = new ObjectId().toHexString()
      const response            = await request(app).get(`/api/v1/documents/${notFoundDocumentId}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toMatch(/not found/i)
    })

    it(`Returns the document`, async () => {
      const documentId    = <string>books[1]._id
      const response      = await request(app).get(`/api/v1/documents/${documentId}`)
      const { document }  = response.body.results

      expect(response.status).toBe(200)
      expect(document).toMatchObject(books[1])
    })
  })

  /**
   * [x] 400 error for invalid documentId
   * [x] 404 error for document not found
   * 400 error for invalid updated document
   * 200 for successful update
   */
  describe(`PUT /api/v1/documents/:documentId`, () => {
    it(`Returns a 400 error for an invalid document Id`, async () => {
      const invalidDocumentId = 'bad'
      const response          = await request(app).put(`/api/v1/documents/${invalidDocumentId}`).send({})
      const { message }       = response.body

      expect(response.status).toBe(400)
      expect(message).toMatch(/invalid document id/i)
    })

    it(`Returns 404 error for document Id that is not found`, async () => {
      const unknownDocumentId   = new ObjectId().toHexString()
      const response            = await request(app).put(`/api/v1/documents/${unknownDocumentId}`).send({})
      const { message }         = response.body
  
      expect(response.status).toBe(404)
      expect(message).toMatch(/not found/i)
    })

    it(`Returns 400 error for an invalid update document`, async () => {
      const documentId            = books[2]._id
      const invalidUpdateDocument = {
        title:    "Great Expectations",
        isbn:     "BadField",
      }

      const response    = await request(app).put(`/api/v1/documents/${documentId}`).send(invalidUpdateDocument)
      const { message } = response.body

      expect(response.status).toBe(400)
      expect(message).toMatch(/not allowed/i)
    })

    it(`Updates a document`, async () => {
      const documentId      = books[2]._id
      const updateDocument  = {
        title:  "Great Expectations",
      }

      const response      = await request(app).put(`/api/v1/documents/${documentId}`).send(updateDocument)
      const { document }  = response.body.results

      // Verify response returns the updated document
      expect(response.status).toBe(200)
      expect(document.title).toBe('Great Expectations')
      expect(document.author).toBe(books[2].author)
      expect(document.summary).toBe(books[2].summary)

      // Verify document was updated in the DB
      const book = await DocumentDAO.findById(<string>books[2]._id)
      expect(document).toMatchObject(book)
    })
  })

  describe(`DELETE /api/vi/documents/:documentId`, () => {
    it(`Returns a 400 error for an invalid document Id`, async () => {
      const invalidDocumentId = 'bad'
      const response          = await request(app).delete(`/api/v1/documents/${invalidDocumentId}`)
      const { message }       = response.body

      expect(response.status).toBe(400)
      expect(message).toMatch(/invalid document id/i)
    })

    it(`Returns 404 error for document Id that is not found`, async () => {
      const unknownDocumentId   = new ObjectId().toHexString()
      const response            = await request(app).delete(`/api/v1/documents/${unknownDocumentId}`)
      const { message }         = response.body
  
      expect(response.status).toBe(404)
      expect(message).toMatch(/not found/i)
    })

    it(`Deletes a document`, async () => {
      const documentId  = books[1]._id
      const response    = await request(app).delete(`/api/v1/documents/${documentId}`)

      // Verify response status is 204
      expect(response.status).toBe(204)
      
      // Verify document is deleted from the DB
      const documents = await DocumentDAO.find()
      expect(documents.length).toBe(books.length - 1)
    })
  })
})