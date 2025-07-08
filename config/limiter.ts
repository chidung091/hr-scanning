import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

/**
 * Check if we're running in test mode
 */
function isTestEnvironment(): boolean {
  return (
    env.get('NODE_ENV') === 'test' ||
    process.env.NODE_ENV === 'test' ||
    process.argv.some((arg) => arg.includes('test')) ||
    process.argv.some((arg) => arg.includes('japa')) ||
    !!process.env.CI ||
    !!process.env.GITHUB_ACTIONS
  )
}

const limiterConfig = defineConfig({
  default: isTestEnvironment() ? 'memory' : env.get('LIMITER_STORE'),
  stores: {
    /**
     * Database store to save rate limiting data inside a
     * MYSQL or PostgreSQL database.
     */
    database: stores.database({
      tableName: 'rate_limits',
    }),

    /**
     * Memory store used during testing for faster,
     * isolated rate limiting (bypassed anyway during tests)
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
