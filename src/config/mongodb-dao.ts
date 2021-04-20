//-----------------------------------------------------------------------------
// src/config/mongodb-dao.ts
//-----------------------------------------------------------------------------
import { MongoClient }    from 'mongodb'

import logger             from './winston'
import DocumentDAO        from '../models/document.dao'

/**
 * MongoDAO manages the connection to the MongoDB for the app. First, it
 * connects to the MongoDB specified in the .env file and then it links 
 * all of the DAO objects to the client.
 */
class MongoDAO {
  private client: MongoClient

  constructor() {
    logger.info(`Connecting to DB: %s`, process.env.MONGODB_URI)

    this.client = new MongoClient(<string>process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    })
  }

  public connect(): Promise<boolean> {
    return new Promise( async (resolve, reject) => {
      try {
        await this.client.connect()
        logger.info(`Success, Connected to DB`)

        await this.injectDb()

        resolve(true)
      }
      catch(error) {
        logger.error(`Failed to connect to MongoDB, error= %o`, error)
        reject(false)
      }
    })
  }

  public injectDb() {
    return new Promise( async (resolve, reject) => {
      logger.info(`Linking DAOs to mongoDB connection`)
      try {
        // Link to all of the DAOs
        await DocumentDAO.injectDB(this.client)

        resolve(true)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  public close() {
    logger.info(`Close connection to DB: %s`, process.env.MONGODB_URI)
    this.client.close()
  }
}

// Export MongoDAO
export default MongoDAO

