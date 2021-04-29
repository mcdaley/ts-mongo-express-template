//-----------------------------------------------------------------------------
// index.ts
//-----------------------------------------------------------------------------
import './config/config'
import express, { Application }   from 'express'
import cors                       from 'cors'
import { Server }                 from 'node:http'

import logger                     from './config/winston'
import MongoDAO                   from './config/mongodb-dao'
import documents                  from './routes/v1/document.routes'
import authentication             from './routes/v1/auth.routes'

/**
 * Shutdown the express server.
 */
function handleShutdownGracefully() {
  server.close(() => {
    logger.info(`Shutting down the express server`)
    process.exit(0)
  });
}

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
app.use(`/api`, authentication)

// Connect to MongoDB and start the Express server
let   server: Server
const mongoClient = new MongoDAO()
mongoClient.connect()
  .then( () => {
    // Start the server after connecting to the DB
    const PORT: number | string | undefined = process.env.PORT
    server = app.listen(PORT, () => {
      logger.info(`TS-Mongo-Express app running on port ${PORT}`)
    })
  })
  .catch( (error) => {
    // Exit the app if cannot connect to DB
    logger.error(`Failed to connect to MongoDB`)
    logger.error(`Exiting the app...`)
    process.exit(-1)
  })

// Gracefully shutdown the express server
process.on("SIGINT",  handleShutdownGracefully);
process.on("SIGTERM", handleShutdownGracefully);
process.on("SIGHUP",  handleShutdownGracefully);

// Export the app
export { app }