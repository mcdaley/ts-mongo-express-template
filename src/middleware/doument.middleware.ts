//-----------------------------------------------------------------------------
// src/middleware/document.middleware.ts
//-----------------------------------------------------------------------------
import { Request, Response, NextFunction }    from 'express'
import Joi                                    from 'joi'
import { ObjectID }                           from 'bson'

import logger                                 from '../config/winston'
import DocumentDAO                            from '../models/document.dao'

/**
 * Joi schema for validating a request to create a new document.
 */
const  documentSchema = Joi.object({
  title:    Joi.string().required(),
  author:   Joi.string().required(),
  summary:  Joi.string().required(),
})

/**
 * Joi schema for validating a request to update a document.
 */
const  updateDocumentSchema = Joi.object({
  title:    Joi.string().optional(),
  author:   Joi.string().optional(),
  summary:  Joi.string().optional(),
})

/**
 * Middleware for validating Document API requests.
 */
export default class DocumentMiddleware {
  /**
   * Manually validating the title is required for creating a new document.
   * @param req 
   * @param res 
   * @param next 
   */
  public static validateRequiredDocumentFields(req: Request, res: Response, next: NextFunction) {
    if(req.body && req.body.title) {
      logger.debug(`DocumentMiddleware.validateRequiredDocumentFields is OK, req.body= %o`, req.body)
      next()
    }
    else {
      res.status(400).send({message: `Missing required field [title]`})
    }
  }

  /**
   * Validate the request to create a new document has all of the required
   * fields in the body of the request. 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public static validateDocument(req: Request, res: Response, next: NextFunction) {
    const { error } = documentSchema.validate(req.body)
    if(error) {
      logger.error(`Invalid Document, error= %o`, error)
      return res.status(400).send({message: error.message})
    }

    next()
  }

  /**
   * Validate the request to update  document has one or more of the required fields
   * in the body of the request.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public static validateUpdateDocument(req: Request, res: Response, next: NextFunction) {
    const { error } = updateDocumentSchema.validate(req.body)
    if(error) {
      logger.error(`Invalid Update Document, error= %o`, error)
      return res.status(400).send({message: error.message})
    }

    next()
  }

  /**
   * Validate the documentId passed in the request query parameters is a valid
   * MongoDB ObjectID.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public static validateDocumentId(req: Request, res: Response, next: NextFunction) {
    if(!ObjectID.isValid(req.params.documentId)) {
      const message = `Invalid ObjectID=[${req.params.documentId}]`
      logger.error(`${message}`)
      return res.status(400).send({message: message})
    }

    next()
  }

  /**
   * Validate the Document for the documentId in the request query exists
   * in the documents collection.
   * @param req 
   * @param res 
   * @param next 
   */
  public static validateDocumentExists = async (req: Request, res: Response, next: NextFunction) => {
    const { documentId } = req.params

    try {
      const response = await DocumentDAO.findById(documentId)
      next()
    }
    catch(error) {
      logger.error(`Document Id= [%s] - Not Found`, documentId)
      res.status(404).send({message: error.message})
    }
  }
}