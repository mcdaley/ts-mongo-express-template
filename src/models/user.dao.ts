//-----------------------------------------------------------------------------
// src/models/user.dao.ts
//-----------------------------------------------------------------------------
import { MongoClient, Collection, ObjectId }    from 'mongodb'
import logger                                   from '../config/winston'

/**
 * @interface IUser
 */
export interface IUser {
  _id?:             ObjectId,
  email:            string,
  password:         string,
}

export interface IRegisterUser {
  email:            string,
  password:         string,
  confirmPassword:  string,
}

export interface IUserAuthToken {
  _id:              string,
  email:            string,
  expires:          number,
}

/**
 * @class UserDAO
 */
export default class UserDAO {
  public static users: Collection

  /**
   * Link the DB connection to the users collection
   * @param {MongoClient} conn - 
   */
   public static async injectDB(conn: MongoClient) {
    if (this.users) {
      return
    }
    try {
      this.users = await conn.db().collection(`users`)
      logger.info(
        `Connected to the [users] collection`
      )
    } 
    catch (error) {
      logger.error(`
        Failed to establish collection handles in UserDAO: error= %o`, error
      )
      throw(error)
    }
  }

  /**
   * Create a new user in the DB.
   * @param   {IUser} user 
   * @returns {Promise<IUser}
   */
  public static create(user: IUser): Promise<IUser> {
    logger.info(`Create a new user = %o`, user)

    return new Promise( async (resolve, reject) => {
      try {
        const  result  = await this.users.insertOne(user)
        let    endUser = result.ops[0]
        delete endUser.password         // Remove password from response

        logger.debug(`Success, created a new user = %o`, endUser)
        resolve(endUser)
      }
      catch(error) {
        logger.error(`Failed to create user= %o, error= %o`, user, error)
        reject(error)
      }
    })
  }

  /**
   * Find a user using their email address, if the email is not found then
   * return null. Also, it does not return the password in the response.
   * @param   {string} email 
   * @returns {Promise<IUser>}
   */
  public static findByEmail(email: string) : Promise<IUser> {
    logger.info(`Find user w/ email = [%s]`, email)

    return new Promise( async (resolve, reject) => {
      try {
        const query   = {email: email}
        //* const options = {projection: {password: 0}}
        const options = {}
        const result  = await this.users.findOne(query, options)

        //* if(result == null) {
        //*   logger.info(`User w/ email = [%s] - Not Found`, email)
        //*   reject({
        //*     code:     404,
        //*     message:  `User w/ email = ${email} - Not Found`
        //*   })
        //* }

        resolve(result)
      }
      catch(error) {
        logger.error(`Failed to find user w/ email=[%s], error= %o`, email, error)
        reject({
          code:     400,
          message:  `Oops, something went wrong`
        })
      }
    })
  }
}
