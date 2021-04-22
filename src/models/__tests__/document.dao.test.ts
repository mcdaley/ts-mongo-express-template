//-----------------------------------------------------------------------------
// src/models/__tests__/document.dao.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { ObjectId }                 from 'bson'

//* import logger                       from '../../config/winston'
import MongoDAO                     from '../../config/mongodb-dao'
import DocumentDAO, { IDocument }   from '../document.dao'

describe(`DocumentDAO`, () => {
  let mongoClient: MongoDAO

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
    await mongoClient.conn(`documents`).deleteMany({})
    mongoClient.close()
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      const docs = await mongoClient.conn(`documents`).insertMany(books)
    })

    afterEach( async () => {
      await mongoClient.conn(`documents`).deleteMany({})
    })

    describe(`Create Document`, () => {
      it(`Creates a document`, async () => {
        // Verify DAO returns the created book
        let book      = {
          title:    `Emma`,
          author:   `Jane Austen`,
          summary:  `A comedy about manners`,

        }
        let response  = await DocumentDAO.create(book)
        
        expect(response.title).toBe(book.title)
        expect(response.author).toBe(book.author)

        // Verify DAO is saved to the DB
        let conn   = mongoClient.conn(`documents`)
        let result = await conn.find({title: book.title}).toArray()

        expect(result.length).toBe(1)
        expect(result[0].title).toBe(book.title)
      })
    })

    describe(`Fetch a List of Documents`, () => {
      it(`Returns a list of ducuments`, async () => {
        const result = await DocumentDAO.find()
        expect(result.length).toBe(3)
      })
    })

    describe(`Find Document by Id`, () => {
      it(`Returns the document`, async () => {
        const id      = books[0]._id?.toHexString()
        const result  = await DocumentDAO.findById(<string>id)
        expect(result.title).toBe(books[0].title)
        expect(result.author).toBe(books[0].author)
      })
    })

    describe(`Update a Document`, () => {
      it(`Updates a document`, async () => {
        const id      = <string>books[1]._id?.toHexString()
        const update  = { 
          title:    `A Farewell To Arms`,
          summary:  `Another war novel`,
        }

        const result  = await DocumentDAO.update(id, update)
        expect(result.title).toBe(update.title)
        expect(result.summary).toBe(update.summary)

        const doc = await DocumentDAO.findById(id)
        expect(doc.title).toBe(update.title)
        expect(doc.summary).toBe(update.summary)
      })
    })

    describe(`Delete a Document`, () => {
      it(`Deletes a document`, async () => {
        const id      = <string>books[2]._id?.toHexString()
        const result  = await DocumentDAO.delete(id)
        expect(result).toBe(true)

        const list    = await DocumentDAO.find({})
        expect(list.length).toBe(2)
      })
    })
  })
})

