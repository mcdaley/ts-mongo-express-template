//-----------------------------------------------------------------------------
// src/models/document.dao.ts
//-----------------------------------------------------------------------------
import { MongoClient, Collection, Cursor }    from 'mongodb'
import { ObjectId }                           from 'bson'
import logger                                 from '../config/winston'

/**
 * The interface specification for a Document object.
 * @interface IDocument
 */
export interface IDocument {
  _id?:       ObjectId,
  title:      string,
  author:     string,
  summary?:   string,
}

/**
 * Interface for updating a Document object
 * @interface IUpdateDocument
 */
export interface IUpdateDocument {
  title?:     string,
  author?:    string,
  summary?:   string,
}

export interface IDocumentList {
  documents:  IDocument[],
  totalCount: number,
}

/**
 * @class DocumentDAO
 */
export default class DocumentDAO {
  public static documents: Collection

  /**
   * Link the DB connection to the documents collection
   * @param {MongoClient} conn - 
   */
   public static async injectDB(conn: MongoClient) {
    if (this.documents) {
      return
    }
    try {
      this.documents = await conn.db().collection(`documents`)
      logger.info(
        `Connected to the [documents] collection`
      )
    } 
    catch (error) {
      logger.error(`
        Failed to establish collection handles in DocumentDAO: error= %o`, error
      )
      throw(error)
    }
  }

  /**
   * Creates a new document in the DB.
   * @param   {IDocument} document
   * @returns {Promise<IDocument>}
   */
   public static create(document: IDocument): Promise<IDocument> {
    logger.info(`Create a new document = %o`, document)

    return new Promise( async (resolve, reject) => {
      try {
        const  result = await this.documents.insertOne(document)
        const  doc    = result.ops[0]

        logger.debug(`Success, created a new document = %o`, document)
        resolve(doc)
      }
      catch(error) {
        logger.error(`Failed to create document, error= %o`, error)
        reject(error)
      }
    })
  }

  /**
   * Get list of documents from the DB by default it returns all of the
   * documents.
   * @param   {Object} query 
   * @param   {Object} options 
   * @returns {Promise<IDocument[]>}
   */
  public static find(query = {}, options = {}): Promise<IDocumentList> {
    logger.debug(`Get list of documents`)

    ///////////////////////////////////////////////////////////////////////////
    // NOTE: 04/19/2021
    // Only get the first 20 documents for development
    ///////////////////////////////////////////////////////////////////////////
    const page:         number = 0
    const docsPerPage:  number = 20

    return new Promise( async (resolve, reject) => {
      try {
        const count:   number      = await this.documents.countDocuments(query)
        const cursor:  Cursor      = await this.documents.find(query, options)
        const result:  IDocument[] = await cursor.limit(docsPerPage).skip(page * docsPerPage).toArray()
        logger.info(`Fetched [%d] of [%d] documents`, result.length, count)

        const documentList: IDocumentList = {
          documents:  result,
          totalCount: count,
        }

        resolve(documentList)
      }
      catch(error) {
        logger.error(`Failed to fetch documents, error= %o`, error)
        reject(error)
      }
    })
  }

  /**
   * Looks up a document by Id and returns it.
   * @param   {String} id 
   * @returns {Promise<IDocument>}
   */
  public static findById(id: string): Promise<IDocument> {
    logger.debug(`Find document w/ id=[%s]`, id)

    const query   = {
      _id: new ObjectId(id),
    }
    const options = {}

    return new Promise( async (resolve, reject) => {
      try {
        const result: IDocument = await this.documents.findOne(query, options)
        logger.info(`Fetched document w/ id=[%s], document= %o`, id, result)

        if(result == null) {
          reject({
            code:     404,
            message: `Document w/ id=[${id}] Not Found`
          })
        }
        else {
          resolve(result)
        }
      }
      catch(error) {
        logger.error(`Failed to find document w/ id=[%s], error= %o`, id, error)
        reject({
          code:     400,
          message:  `Oops, something went wrong`
        })
      }
    })
  }

  /**
   * Update the document w/ the specified fields.
   * @param id 
   * @param {IUpdateDocument} update 
   * @param options 
   * @returns 
   */
  public static update(id: string, update: IUpdateDocument = {}, options = {}): Promise<IDocument> {
    logger.debug(`Update document w/ id=[%s], update = %o`, id, update)

    options = {
      upsert:           false,
      returnOriginal:   false,
    }

    ///////////////////////////////////////////////////////////////////////////////
    // 04/20/2021
    // FIGURE OUT BEST WAY TO HANDLE THE UPDATE RESPONSE DEPENDING ON THE UPDATE
    // METHOD.
    //
    // updateOne:
    //  - Returns result.matchedCount, result.modifiedCount, and 
    //    result.upsertedCount and does not return the updated value
    //
    // findOneAndUpdate
    //  - Return the updated valueif the "returnOriginal" option is set to false
    //    otherwise, it returns null.
    ///////////////////////////////////////////////////////////////////////////////

    return new Promise( async (resolve, reject) => {
      try {
        /******* 
        const result = await this.documents.updateOne(
          { _id:  ObjectId.createFromHexString(id) },
          { $set: update },
          options,
        )
        *********/
        const filter = { _id:  new ObjectId(id) }
        const result = await this.documents.findOneAndUpdate(
          filter,
          { $set: update },
          options,
        )

        if(result.value == null) {
          reject({
            code: 404,
            message: `Document w/ id=[${id}] Not Found`
          })
        }
        else {
          logger.info(`Updated document w/ id=[%s], doc= %o`, id, result.value)
          resolve(result.value)
        }
      }
      catch(error) {
        logger.error(`Failed to update document w/ id=[%s], error= %o`)
        reject({
          code:     400,
          message:  `Oops, something went wrong`
        })
      }
    })
  }

  /**
   * Deletes a document.
   * @param {String} id 
   * @returns Promise<boolean>
   */
  public static delete(id: string): Promise<boolean> {
    logger.info(`Delete document w/ id=[%s]`, id)

    const query   = {
      _id:  new ObjectId(id),
    }
    const options = {}

    return new Promise( async (resolve, reject) => {
      try {
        const  finder  = await this.documents.findOne(query, options)
        const  result  = await this.documents.deleteOne(query, options)

        if(result.deletedCount === 0) {
          logger.error(`Failed to delete document w/ id=[%s] - Not Found`, id)
          reject({
            code:     404,
            message:  `Document w/ id=[${id}] - Not Found`
          })
        }
        else {
          logger.info(`Success, deleted document w/ id=[%s]`, id)
          resolve(true)
        }
      }
      catch(error) {
        logger.error(`Failed to delete document, id=[%s], error= %o`, id, error)
        reject({
          code:     400,
          message:  `Oops, something went wrong`
        })
      }
    })
  }
}