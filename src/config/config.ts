//-----------------------------------------------------------------------------
// src/config/config.ts
//-----------------------------------------------------------------------------
import 'dotenv/config'

let env = process.env.NODE_ENV || 'development'

if(env === 'development') {
  process.env.NODE_ENV            = 'development'
  process.env.PORT                = process.env.DEV_PORT
  process.env.MONGODB_URI         = process.env.DEV_MONGODB_URI
  process.env.APP_NAME            = process.env.DEV_APP_NAME
  process.env.SECRET              = process.env.DEV_SECRET
  process.env.JWT_EXPIRATION_MS   = process.env.DEV_JWT_EXPIRATION_MS

}
else if(env === 'test') {
  process.env.NODE_ENV            = 'test'
  process.env.PORT                = process.env.TEST_PORT
  process.env.MONGODB_URI         = process.env.TEST_MONGODB_URI
  process.env.APP_NAME            = process.env.TEST_APP_NAME
  process.env.SECRET              = process.env.TEST_SECRET
  process.env.JWT_EXPIRATION_MS   = process.env.TEST_JWT_EXPIRATION_MS
}