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
      console.log('🔧 Starting test setup...')

      // Ensure NODE_ENV is set to 'test' for proper rate limiting configuration
      process.env.NODE_ENV = 'test'
      console.log('✅ NODE_ENV set to test')

      try {
        // Initialize database mocks for all tests
        console.log('🗄️ Initializing database mocks...')
        await databaseMockManager.initializeMocks()
        console.log('✅ Database mocks initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize database mocks:', error)
        throw error
      }

      // Set up global environment variable stub for OpenAI API key
      if (!env.get('OPENAI_API_KEY')) {
        console.log('🔑 Setting up OpenAI API key stub...')
        const originalGet = env.get.bind(env)
        sinon.stub(env, 'get').callsFake((key: string, defaultValue?: any) => {
          if (key === 'OPENAI_API_KEY') return 'test-api-key'
          if (key === 'NODE_ENV') return 'test'
          return originalGet(key, defaultValue) || defaultValue
        })
        console.log('✅ OpenAI API key stub configured')
      }

      console.log('🎉 Test setup completed successfully')
    },
  ],
  teardown: [
    () => {
      console.log('🧹 Starting test teardown...')

      try {
        // Restore database mocks
        databaseMockManager.restore()
        console.log('✅ Database mocks restored')
      } catch (error) {
        console.error('⚠️ Error restoring database mocks:', error)
      }

      try {
        // Restore all sinon stubs
        sinon.restore()
        console.log('✅ Sinon stubs restored')
      } catch (error) {
        console.error('⚠️ Error restoring sinon stubs:', error)
      }

      console.log('🎉 Test teardown completed')
    },
  ],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  console.log(`🔧 Configuring suite: ${suite.name}`)

  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    console.log(`🌐 Setting up HTTP server for suite: ${suite.name}`)
    return suite
      .setup(async () => {
        try {
          console.log('🚀 Starting HTTP server with timeout...')

          // Add timeout to HTTP server startup
          const serverStartPromise = testUtils.httpServer().start()
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error('HTTP server startup timeout after 10 seconds')),
              10000
            )
          })

          await Promise.race([serverStartPromise, timeoutPromise])
          console.log('✅ HTTP server started successfully')
        } catch (error) {
          console.error('❌ Failed to start HTTP server:', error)
          console.error('Error details:', error.message)
          console.error('Stack trace:', error.stack)
          throw error
        }
      })
      .teardown(async () => {
        try {
          console.log('🛑 Cleaning up HTTP server resources...')
          // Note: testUtils.httpServer() doesn't have a stop method
          // The server will be cleaned up automatically by the test framework
          console.log('✅ HTTP server cleanup completed')
        } catch (error) {
          console.error('⚠️ Error during HTTP server cleanup:', error)
        }
      })
  }

  console.log(`✅ Suite ${suite.name} configured (no HTTP server needed)`)
}
