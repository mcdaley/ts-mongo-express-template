//-----------------------------------------------------------------------------
// src/models/user.messages.ts
//-----------------------------------------------------------------------------
import logger       from '../config/winston'
import { IUser }    from './user.dao'

export default class UserMessages {
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
   * Build the API response message the contains a single user.
   * @param user 
   * @returns 
   */
   public static buildUser(user: IUser) {
    const message = {
      ...UserMessages.responseHeader(),
      results: {
        user: user
      }
    }

    return message
  }
}