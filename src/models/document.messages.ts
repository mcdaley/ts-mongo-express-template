//-----------------------------------------------------------------------------
// src/models/document.messages.ts
//-----------------------------------------------------------------------------
import logger           from '../config/winston'
import { IDocument }    from './document.dao'


/**
 * Build the JSON response messages for the Document CRUD routes.
 */
export default class DocumentMessages {
  /**
   * Build the API response header for the document messages.
   * @returns 
   */
  private  static responseHeader() {
    const responseHeader = {
      responseHeader: {
        responseTimestamp: {
          epochMillis:  new Date().getTime(),
        }
      }
    }

    return responseHeader
  }

  /**
   * Build the API response message the contains a single document.
   * @param document 
   * @returns 
   */
  public static buildDocument(document: IDocument) {
    const message = {
      ...DocumentMessages.responseHeader(),
      results: {
        document: document
      }
    }

    return message
  }

  /**
   * Build a API response message the contains a list of documents.
   * @param documents 
   * @returns 
   */
  public static buildDocumentList(documents: IDocument[]) {
    logger.debug(`Build the API response for a list of documents`)

    const message = {
      ...DocumentMessages.responseHeader(),
      results: {
        documents: [...documents]
      }
    }

    return message
  }
}

