//-----------------------------------------------------------------------------
// index.ts
//-----------------------------------------------------------------------------
import './config/config'
import express, { Application }   from 'express'
import cors                       from 'cors'

import logger                     from './config/winston'

/**
 * main()
 */
const app: Application  = express()

app.use(express.json())

app.use(cors({
  origin:         true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}))

// Start the server
const PORT: number | string = process.env.PORT || 4000
app.listen(PORT, () => {
  logger.info(`TS-Mongo-Express app running on port ${PORT}`)
})

// Export the app
export { app }