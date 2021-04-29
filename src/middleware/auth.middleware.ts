//-----------------------------------------------------------------------------
// src/middleware/auth.middleware.ts
//-----------------------------------------------------------------------------
import { Request, Response, NextFunction }    from 'express'
import Joi                                    from 'joi'
import { ObjectID }                           from 'bson'

import logger                                 from '../config/winston'
import UserDAO                                from '../models/user.dao'

// Schema for user signing up for an account
const registerUserSchema = Joi.object({
  email:            Joi.string().email().lowercase().required(),
  password:         Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,30}$')).required().strict(),
  confirmPassword:  Joi.string().valid(Joi.ref('password')).required().strict()
})

// Schema for user signing into their account
const loginUserSchema = Joi.object({
  email:            Joi.string().email().lowercase().required(),
  password:         Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,30}$')).required().strict(),
})

/**
 * @class AuthMiddleware
 */
export default class AuthMiddleware {
  /**
   * Verify the register user request has valid input fields.
   */
  public static validateRegisterUserFields(req: Request, res: Response, next: NextFunction) {
    const { error } = registerUserSchema.validate(req.body)
    if(error) {
      logger.error(`Invalid User, error= %o`, error)
      return res.status(400).send({message: error.message})
    }

    next()
  }

  /**
   * Validates the email being used to sign up for an account is not already 
   * registered.
   */
  public static validateEmailDoesNotExist = async (
    req: Request, res: Response, next: NextFunction
  ) => {
    const { email } = req.body
    const result    = await UserDAO.findByEmail(email)

    if(result !== null) {
      logger.error(`Email [%s] already exists in the DB`, email)
      return res.status(400).send({message: `email already exists`})
    }

    next()
  }

  /**
   * Verify the user enters a valid email and password when signing into their
   * account.
   */
   public static validateLoginUserFields(req: Request, res: Response, next: NextFunction) {
    const { error } = loginUserSchema.validate(req.body)
    if(error) {
      logger.error(`Invalid User, error= %o`, error)
      return res.status(400).send({message: error.message})
    }

    next()
  }

  /**
   * Validates the email being used to login is registered to an account.
   */
   public static validateEmailExists = async (
    req: Request, res: Response, next: NextFunction
  ) => {
    const { email } = req.body
    const result    = await UserDAO.findByEmail(email)

    if(result == null) {
      logger.error(`Email [%s] is not found in the DB`, email)
      return res.status(404).send({message: `email not found`})
    }

    next()
  }
}
