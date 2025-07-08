/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database
  |----------------------------------------------------------
  */
  DB_CONNECTION: Env.schema.enum(['postgres'] as const),
  DB_HOST: Env.schema.string.optional(),
  DB_PORT: Env.schema.number.optional(),
  DB_USERNAME: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),
  DB_SSL: Env.schema.boolean.optional(),
  DB_SSL_REJECT_UNAUTHORIZED: Env.schema.boolean.optional(),
  DB_POOL_MIN: Env.schema.number.optional(),
  DB_POOL_MAX: Env.schema.number.optional(),
  DB_ACQUIRE_TIMEOUT: Env.schema.number.optional(),
  DB_CREATE_TIMEOUT: Env.schema.number.optional(),
  DB_DESTROY_TIMEOUT: Env.schema.number.optional(),
  DB_IDLE_TIMEOUT: Env.schema.number.optional(),
  DB_REAP_INTERVAL: Env.schema.number.optional(),
  DB_CREATE_RETRY_INTERVAL: Env.schema.number.optional(),
  DB_DEBUG: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring OpenAI integration
  |----------------------------------------------------------
  */
  OPENAI_API_KEY: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),
})
