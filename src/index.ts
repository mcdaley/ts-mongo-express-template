//-----------------------------------------------------------------------------
// index.ts
//-----------------------------------------------------------------------------
import express, { Application }   from 'express'

/**
 * main()
 */
const app: Application  = express()

// Start the server
const PORT: number = 3000
app.listen(PORT, () => {
  console.log(`TS-Mongo-Express app running on port ${PORT}`)
})

// Export the app
export { app }