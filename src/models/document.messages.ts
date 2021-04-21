//-----------------------------------------------------------------------------
// src/models/document.messages.ts
//-----------------------------------------------------------------------------
import logger           from '../config/winston'
import { IDocument }    from './document.dao'


/**
 * Build the JSON response messages for the Document CRUD routes.
 */
export default class DocumentMessages {
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

  public static buildDocumentList(documents: IDocument[]) {
    logger.debug(`Build the API response for a list of documents`)

    const message = {
      ...DocumentMessages.responseHeader(),
      results: {
        documents: [...documents]
      }
    }

    const response = {
      status:   200,
      message:  message,
    }

    return response
  }
}

