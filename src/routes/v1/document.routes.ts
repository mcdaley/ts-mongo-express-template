//-----------------------------------------------------------------------------
// src/routes/v1/document.routes.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }      from 'express'

import logger                             from '../../config/winston'
import AuthMiddleware                     from '../../middleware/auth.middleware'
import DocumentMiddleware                 from '../../middleware/doument.middleware'
import DocumentDAO, { IDocument }         from '../../models/document.dao'
import DocumentMessages                   from '../../models/document.messages'

const router = Router()

/**
 * Verify the request is authenticated for all of the document routes.
 */
//* router.all(`/v1/documents`, AuthMiddleware.authenticateRequest)

/**
 * @route POST /api/v1/documents
 */
router.post(
  `/v1/documents`,
  AuthMiddleware.authenticateRequest,
  DocumentMiddleware.validateDocument, 
  async (req: Request, res: Response 
) => {
  logger.info(`POST /api/v1/documents`)

  const document: IDocument = {...req.body}

  try {
    const result    = await DocumentDAO.create(document)
    const response  = DocumentMessages.buildDocument(result)

    res.status(201).send(response)
  }
  catch(error) {
    logger.error(`Failed to create the document, error= %o`, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @route GET /api/v1/documents
 */
router.get(`/v1/documents`, 
  AuthMiddleware.authenticateRequest,
  async (req: Request, res: Response) => 
{
  logger.info(`GET /api/v1/documents`)

  try {
    const result    = await DocumentDAO.find()
    const response  = DocumentMessages.buildDocumentList(result)
    res.status(200).send(response)
  }
  catch(error) {
    logger.error(`Failed to get list of documents, error= %o`, error)
    res.status(400).send({message: `Oops, something went wrong`})
  }
})

/**
 * @routes GET /api/v1/documents/:documentId
 */
router.get(
  `/v1/documents/:documentId`, 
  AuthMiddleware.authenticateRequest,
  DocumentMiddleware.validateDocumentId,
  DocumentMiddleware.validateDocumentExists,
  async (req: Request, res: Response) => 
{
  logger.info(`GET /api/v1/couments/%s`, req.params.documentId)  
  const id: string = req.params.documentId
  
  try {
    const result    = await DocumentDAO.findById(id)
    const response  = DocumentMessages.buildDocument(result)
    
    res.status(200).send(response)
  }
  catch(error) {
    logger.error(`Error finding document w/ id=[%s], error= %o`, id, error)
    res.status(error.code).send({message: error.message})
  }
})

/**
 * @routes PUT /api/v1/documents/:documentId
 */
router.put(`/v1/documents/:documentId`, 
  AuthMiddleware.authenticateRequest,
  DocumentMiddleware.validateDocumentId,
  DocumentMiddleware.validateDocumentExists,
  DocumentMiddleware.validateUpdateDocument,
  async (req: Request, res: Response) => 
{
  logger.info(`PUT /api/v1/couments/%s, body= %o`, req.params.documentId, req.body)
  const id:     string  = req.params.documentId
  const update: any     = req.body

  try {
    const result    = await DocumentDAO.update(id, update)
    const response  = DocumentMessages.buildDocument(result)
    
    res.status(200).send(response)
  }
  catch(error) {
    logger.error(`Failed to update the document w/ id=[%s], error= %o`, id, error)
    res.status(error.code).send({message: error.message})
  }
})

/**
 * Delete the document from the DB and return an Http status of 204 w/ an empty
 * body if the delete was successful. If the record was not deleted then send
 * and error message w/ the corresponding Http error status.
 * 
 * NOTE:
 * Would I want to be able to return a message with the id of the deleted
 * document?
 * 
 * @routes DELETE /api/v1/documents/:documentId
 */
router.delete(`/v1/documents/:documentId`, 
  AuthMiddleware.authenticateRequest,
  DocumentMiddleware.validateDocumentId,
  DocumentMiddleware.validateDocumentExists,
  async (req: Request, res: Response) => 
{
  logger.info(`DELETE /api/v1/couments/%s`, req.params.documentId)
  const id: string = req.params.documentId

  try {
    const result = await DocumentDAO.delete(id)
    res.status(204).send(null)
  }
  catch(error) {
    logger.error(`Failed to delete document w/ id=[%s], error= %s`, id, error)
    res.status(error.code).send({message: error.message})
  }
})

// Export the organizations routes
export default router