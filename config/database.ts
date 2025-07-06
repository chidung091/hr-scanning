import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION', 'postgres'),
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST', 'localhost'),
        port: env.get('DB_PORT', 5432),
        user: env.get('DB_USERNAME', 'hr_user'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE', 'hr_scanning_dev'),
        ssl: env.get('DB_SSL', false) ? {
          rejectUnauthorized: env.get('DB_SSL_REJECT_UNAUTHORIZED', true)
        } : false,
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      pool: {
        min: env.get('DB_POOL_MIN', 2),
        max: env.get('DB_POOL_MAX', 10),
        acquireTimeoutMillis: env.get('DB_ACQUIRE_TIMEOUT', 60000),
        createTimeoutMillis: env.get('DB_CREATE_TIMEOUT', 30000),
        idleTimeoutMillis: env.get('DB_IDLE_TIMEOUT', 30000),
        reapIntervalMillis: env.get('DB_REAP_INTERVAL', 1000),
        createRetryIntervalMillis: env.get('DB_CREATE_RETRY_INTERVAL', 200),
      },
      debug: env.get('DB_DEBUG', false),
    },
  },
})

export default dbConfig