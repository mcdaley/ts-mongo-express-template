//-----------------------------------------------------------------------------
// src/routes/v1/document.routes.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }      from 'express'
import logger                             from '../../config/winston'

const router = Router()

/**
 * @route POST /api/v1/documents
 */
router.post(`/v1/documents`, (req: Request, res: Response) => {
  logger.info(`POST /api/v1/documents`)

  res.status(201).send({message: `POST /api/v1/documents`})
})

/**
 * @route GET /api/v1/documents
 */
router.get(`/v1/documents`, (req: Request, res: Response) => {
  logger.info(`GET /api/v1/documents`)

  res.status(200).send({message: 'GET /api/v1/documents'})
})

/**
 * @routes GET /api/v1/documents/:id
 */
router.get(`/v1/documents/:id`, (req: Request, res: Response) => {
  logger.info(`GET /api/v1/couments/%s`, req.params.id)

  res.status(200).send({message: `GET /api/v1/documents/${req.params.id}`})
})

/**
 * @routes PUT /api/v1/documents/:id
 */
 router.put(`/v1/documents/:id`, (req: Request, res: Response) => {
  logger.info(`PUT /api/v1/couments/%s`, req.params.id)

  res.status(200).send({message: `PUT /api/v1/documents/${req.params.id}`})
})

/**
 * @routes DELETE /api/v1/documents/:id
 */
 router.delete(`/v1/documents/:id`, (req: Request, res: Response) => {
  logger.info(`DELETE /api/v1/couments/%s`, req.params.id)

  res.status(200).send({message: `DELETE /api/v1/documents/${req.params.id}`})
})

// Export the organizations routes
export default router