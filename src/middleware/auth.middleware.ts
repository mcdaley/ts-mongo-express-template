//-----------------------------------------------------------------------------
// src/middleware/auth.middleware.ts
//-----------------------------------------------------------------------------
import { Request, Response, NextFunction }    from 'express'
import Joi                                    from 'joi'
import { ObjectID }                           from 'bson'

import logger                                 from '../config/winston'
import UserDAO                                from '../models/user.dao'

const registerUserSchema = Joi.object({
  email:            Joi.string().email().lowercase().required(),
  password:         Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,30}$')).required().strict(),
  confirmPassword:  Joi.string().valid(Joi.ref('password')).required().strict()
})

/**
 * @class AuthMiddleware
 */
export default class AuthMiddleware {
  /**
   * Verify the register user request has valid input fields.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public static validateRegisterUserFields(req: Request, res: Response, next: NextFunction) {
    const { error } = registerUserSchema.validate(req.body)
    if(error) {
      logger.error(`Invalid User, error= %o`, error)
      return res.status(400).send({message: error.message})
    }

    next()
  }

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
}
