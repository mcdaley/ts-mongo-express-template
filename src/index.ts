//-----------------------------------------------------------------------------
// index.ts
//-----------------------------------------------------------------------------
import './config/config'
import express, { Application }   from 'express'
import cors                       from 'cors'

import logger                     from './config/winston'
import MongoDAO                   from './config/mongodb-dao'
import documents                  from './routes/v1/document.routes'

/**
 * main()
 */
const app: Application  = express()

app.use(express.json())

app.use(cors({
  origin:         true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}))

// Routes
app.use(`/api`, documents)

// Connect to MongoDB and start the Express server
const mongoClient = new MongoDAO()
mongoClient.connect()
  .then( () => {
    // Start the server after connecting to the DB
    const PORT: number | string = process.env.PORT || 4000
    app.listen(PORT, () => {
      logger.info(`TS-Mongo-Express app running on port ${PORT}`)
    })
  })
  .catch( (error) => {
    // Exit the app if cannot connect to DB
    logger.error(`Failed to connect to MongoDB`)
    logger.error(`Exiting the app...`)
    process.exit(-1)
  })

// Export the app
export { app }