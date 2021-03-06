//-----------------------------------------------------------------------------
// src/config/passport.ts
//-----------------------------------------------------------------------------
import passport                       from 'passport'
import { Strategy as LocalStrategy }  from 'passport-local'
import { Strategy as JWTStrategy }    from 'passport-jwt'
import { ExtractJwt }                 from 'passport-jwt'

import logger                         from './winston'
import UserDAO, { IUserAuthToken }    from '../models/user.dao'

/**
 * Setup the passport Local strategy to handle the user login for the API.
 */
passport.use(new LocalStrategy({
  usernameField:  'email',
  passwordField:  'password',
  session:        false
}, 
async (email, password, done) => {
  try {
    const user = await UserDAO.findByEmail(email)
    
    if(!user) {
      logger.error('Unable to find user w/ email=[%s] in DB', email)
      return done({code: 400, message: 'Invalid credentials'})
    }
    else if(user.password !== password) {
      logger.info('User w/ email=[%s] entered invalid password=[%s]', email, password)
      return done({message: 'Invalid credentials'})
    }
    else {
      logger.info('Authenticated credential for user=[%o]', user)
      return done(null, user)
    }
  }
  catch(error) {
    logger.error('Failed to authenticate user w/ email=[%s], err=[%o]', email, error)
    return done(error)
  }
}))

/**
 * Setup up JSON Web Token strategy that will verify if a user has a
 * valid JSON Web Token by extracting the Bearer token in the 'Authorization'
 * header of the request.
 */
/********
 passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:    process.env.SECRET,
},
(jwtPayload, done) => {
  logger.debug(`[MIKE] Checking out the jwtPayload= %o`, jwtPayload)
  if(Date.now() > jwtPayload.expires) {
    return done({code: 401, message: 'authorization token expired'}, false)
  }

  return done(null, jwtPayload)
}
))
 *******/

// Export the passport module
export default passport