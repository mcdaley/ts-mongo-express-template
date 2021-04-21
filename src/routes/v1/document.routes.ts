//-----------------------------------------------------------------------------
// src/routes/v1/document.routes.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }      from 'express'

import logger                             from '../../config/winston'
import DocumentDAO, { IDocument }         from '../../models/document.dao'
import DocumentMessages                   from '../../models/document.messages'

const router = Router()

/**
 * @route POST /api/v1/documents
 */
router.post(`/v1/documents`, async (req: Request, res: Response) => {
  logger.info(`POST /api/v1/documents`)

  const document: IDocument = {...req.body}

  try {
    const result = await DocumentDAO.create(document)
    logger.debug(`Created document = %o`, result)

    res.status(201).send(result)
  }
  catch(error) {
    logger.error(`Failed to create the document, error= %o`, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @route GET /api/v1/documents
 */
router.get(`/v1/documents`, async (req: Request, res: Response) => {
  logger.info(`GET /api/v1/documents`)

  try {
    const result    = await DocumentDAO.find()
    const response  = DocumentMessages.buildDocumentList(result)
    res.status(response.status).send(response.message)
  }
  catch(error) {
    logger.error(`Failed to get list of documents, error= %o`, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @routes GET /api/v1/documents/:id
 */
router.get(`/v1/documents/:id`, async (req: Request, res: Response) => {
  logger.info(`GET /api/v1/couments/%s`, req.params.id)  
  const id: string = req.params.id
  
  try {
    const result = await DocumentDAO.findById(id)
    logger.info(`Fetched document = %o`, result)

    if(result == null) {
      return res.status(404).send({message: `Not Found`})
    }
    
    res.status(200).send(result)
  }
  catch(error) {
    logger.error(`Error finding document w/ id=[%s], error= %o`, id, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @routes PUT /api/v1/documents/:id
 */
 router.put(`/v1/documents/:id`, async (req: Request, res: Response) => {
  logger.info(`PUT /api/v1/couments/%s, body= %o`, req.params.id, req.body)
  const id:     string  = req.params.id
  const update: any     = req.body

  try {
    const result = await DocumentDAO.update(id, update)
    logger.debug(`Updated document w/ id=[%s], result= %o`, id, result)

    res.status(200).send({message: `Update is OK`})
  }
  catch(error) {
    logger.error(`Failed to update the document w/ id=[%s], error= %o`, id, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @routes DELETE /api/v1/documents/:id
 */
 router.delete(`/v1/documents/:id`, async (req: Request, res: Response) => {
  logger.info(`DELETE /api/v1/couments/%s`, req.params.id)
  const id: string = req.params.id

  try {
    const result = await DocumentDAO.delete(id)
    res.status(200).send({id: id, deletedCount: result.deletedCount})
  }
  catch(error) {
    logger.error(`Failed to delete document w/ id=[%s], error= %s`, id, error)
    res.status(400).send(error)
  }
})

// Export the organizations routes
export default router