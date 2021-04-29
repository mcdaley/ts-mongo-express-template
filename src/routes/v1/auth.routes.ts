//-----------------------------------------------------------------------------
// src/routes/v1/auth.routes.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }      from 'express'

import logger                             from '../../config/winston'
import AuthMiddleware                     from '../../middleware/auth.middleware'
import UserDAO, { IUser }                 from '../../models/user.dao'
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

// Export the routes.
export default router
