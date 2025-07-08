import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import env from '#start/env'
import { DatabaseMockManager } from '#tests/utils/database_mocks'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Global database mock manager instance
 */
const databaseMockManager = new DatabaseMockManager()

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [assert(), apiClient(), pluginAdonisJS(app)]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    async () => {
      // Ensure NODE_ENV is set to 'test' for proper rate limiting configuration
      process.env.NODE_ENV = 'test'

      // Initialize database mocks for all tests
      await databaseMockManager.initializeMocks()

      // Set up global environment variable stub for OpenAI API key
      if (!env.get('OPENAI_API_KEY')) {
        const originalGet = env.get.bind(env)
        sinon.stub(env, 'get').callsFake((key: string, defaultValue?: any) => {
          if (key === 'OPENAI_API_KEY') return 'test-api-key'
          if (key === 'NODE_ENV') return 'test'
          return originalGet(key, defaultValue) || defaultValue
        })
      }
    },
  ],
  teardown: [
    () => {
      // Restore database mocks
      databaseMockManager.restore()

      // Restore all sinon stubs
      sinon.restore()
    },
  ],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
