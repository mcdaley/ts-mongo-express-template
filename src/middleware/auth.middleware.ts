//-----------------------------------------------------------------------------
// src/middleware/auth.middleware.ts
//-----------------------------------------------------------------------------
import { Request, Response, NextFunction }    from 'express'
import Joi                                    from 'joi'
import { ObjectID }                           from 'bson'
import { ExtractJwt }                         from 'passport-jwt'
import jwt                                    from 'jsonwebtoken'

import passport                               from '../config/passport'
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

  /**
   * Validate the jwt authorization token in the request's header.
   */
  public static authenticateRequest(req: Request, res: Response, next: NextFunction) {
    const authHeader  = req.headers['authorization']
    const token       = authHeader && authHeader.split(' ')[1]
    const secret      = <string>process.env.SECRET

    if(token == null) {
      return res.status(401).send({message: `Unauthorized`})
    }

    jwt.verify(token, secret, (err: any, user: any) => {
      if (err) {
        logger.error(`User is not authorized, err= %o`, err)
        return res.status(403).send({message: `Forbidden`})
      }
  
      req.user = user
      next()
    })
  }
  
  /****
  public static authenticateJwt(req: Request, res: Response, next: NextFunction) {
    logger.debug(`Authenticate the JWT token`)
    passport.authenticate('jwt', { session: false }, function(error, user, info) {
      if(error) {
        logger.error('Unauthorized access to protected route, error= %o', error)
        return res.status(401).send({error})
      }
  
      if(!user) {
        logger.error('Unauthorized access to protected route, error= %o', error)
        let authError = {code: 401, message: 'Not authorized'}
        return res.status(401).send({error: authError})
      }
  
      req.user = user;
      next();
    })(req, res, next);
  }
  *****/
}
