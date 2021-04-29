//-----------------------------------------------------------------------------
// src/routes/v1/auth.routes.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }      from 'express'
import jwt                                from 'jsonwebtoken'

import logger                             from '../../config/winston'
import passport                           from '../../config/passport'
import AuthMiddleware                     from '../../middleware/auth.middleware'
import UserDAO, { IUserAuthToken }        from '../../models/user.dao'
import UserMessages                       from '../../models/user.messages'

const router = Router()

/**
 * @route POST /api/v1/register
 */
router.post(
  `/v1/register`, 
  AuthMiddleware.validateRegisterUserFields,
  AuthMiddleware.validateEmailDoesNotExist,
  async (req: Request, res: Response) => 
{
  logger.info(`POST /api/v1/register, body= %o`, req.body)

  const { email, password } = req.body
  try {
    const result    = await UserDAO.create({ email: email, password: password })
    const response  = UserMessages.buildUser(result)

    logger.info(`SUCCESS: registered user, email=[%s], response= %o`, email, response)
    res.status(201).send(response)
  }
  catch(error) {
    logger.error(`Failed to register user, email=[%s], error=[%0]`, email, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @route POST /api/v1/login
 */
router.post(
  `/v1/login`, 
  AuthMiddleware.validateLoginUserFields,
  AuthMiddleware.validateEmailExists,
  (req: Request, res: Response) => 
{
  passport.authenticate(
    'local',
    {session: false},
    (error, user, message) => {
      if(error || !user) {
        //* return res.status(400).send({error})
        return res.status(400).send(error)
      }
      
      logger.debug('[MCD] JWT_EXPIRATION_MS= %d', parseInt(<string>process.env.JWT_EXPIRATION_MS))
      const payload: IUserAuthToken = {
        _id:      user._id,
        email:    user.email,
        expires:  Date.now() + parseInt(<string>process.env.JWT_EXPIRATION_MS),
      };

      // Assign a payload to req.user
      req.login(payload, {session: false}, (error) => {
        if (error) {
          //* return res.status(400).send({error});
          return res.status(400).send(error);
        }

        // Generate a signed json web token and return it in the response
        const token = jwt.sign(JSON.stringify(payload), <string>process.env.SECRET);

        res.status(200).set({Authorization: `Bearer ${token}`}).send({user: payload})
      })
    }
  )(req, res)
})

// Export the routes.
export default router
