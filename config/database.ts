import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const databaseConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),

  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USERNAME'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE'),
        ssl: env.get('DB_SSL', false),
      },
      pool: {
        min: env.get('DB_POOL_MIN', 2),
        max: env.get('DB_POOL_MAX', 10),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: env.get('DB_DEBUG', false),
    },
  },
})

export default databaseConfig
