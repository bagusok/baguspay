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

  DATABASE_URL: Env.schema.string(),

  S3_REGION: Env.schema.string(),
  S3_ACCESS_KEY_ID: Env.schema.string(),
  S3_SECRET_ACCESS_KEY: Env.schema.string(),
  S3_BUCKET_NAME: Env.schema.string(),
  S3_URL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['s3', 'spaces', 'r2'] as const),
  AWS_ACCESS_KEY_ID: Env.schema.string(),
  AWS_SECRET_ACCESS_KEY: Env.schema.string(),
  AWS_REGION: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),
  S3_ENDPOINT: Env.schema.string(),

  // SPACES_KEY: Env.schema.string(),
  // SPACES_SECRET: Env.schema.string(),
  // SPACES_REGION: Env.schema.string(),
  // SPACES_BUCKET: Env.schema.string(),
  // SPACES_ENDPOINT: Env.schema.string(),
  // R2_KEY: Env.schema.string(),
  // R2_SECRET: Env.schema.string(),
  // R2_BUCKET: Env.schema.string(),
  // R2_ENDPOINT: Env.schema.string(),

  VITE_S3_URL: Env.schema.string({ format: 'url' }),
})
