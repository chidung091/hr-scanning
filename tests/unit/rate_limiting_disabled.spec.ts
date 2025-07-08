import { test } from '@japa/runner'
import {
  throttle,
  fileUploadThrottle,
  assessmentStartThrottle,
  assessmentActionThrottle,
  assessmentViewThrottle,
  managementThrottle,
  managementViewThrottle,
  managementUpdateThrottle,
  managementAnalyticsThrottle,
} from '#start/limiter'

test.group('Rate Limiting Disabled During Tests', () => {
  test('should bypass all rate limiting middleware during tests', async ({ assert }) => {
    // All rate limiting middleware should be bypass functions during tests
    // They should be functions that simply call next() without any rate limiting logic

    const middlewares = [
      throttle,
      fileUploadThrottle,
      assessmentStartThrottle,
      assessmentActionThrottle,
      assessmentViewThrottle,
      managementThrottle,
      managementViewThrottle,
      managementUpdateThrottle,
      managementAnalyticsThrottle,
    ]

    for (const middleware of middlewares) {
      assert.isFunction(middleware)

      // Test that the middleware is a bypass function (not a limiter instance)
      // Bypass functions should be simple async functions, not limiter objects
      const middlewareString = middleware.toString()

      // Should not contain limiter-specific methods or properties
      assert.isFalse(middlewareString.includes('allowRequests'))
      assert.isFalse(middlewareString.includes('every'))
      assert.isFalse(middlewareString.includes('blockFor'))

      // Should be a simple bypass function that calls next()
      assert.isTrue(middlewareString.includes('next'))
    }
  })

  test('should allow unlimited requests through bypass middleware', async ({ assert }) => {
    // Create a mock context and next function
    const mockContext = {}
    let nextCalled = false
    const mockNext = async () => {
      nextCalled = true
    }

    // Test that each middleware simply calls next() without any restrictions
    const middlewares = [
      throttle,
      fileUploadThrottle,
      assessmentStartThrottle,
      assessmentActionThrottle,
      assessmentViewThrottle,
      managementThrottle,
      managementViewThrottle,
      managementUpdateThrottle,
      managementAnalyticsThrottle,
    ]

    for (const middleware of middlewares) {
      nextCalled = false

      // Call the middleware
      await middleware(mockContext, mockNext)

      // Verify that next() was called (meaning no rate limiting occurred)
      assert.isTrue(nextCalled, `Middleware ${middleware.name || 'anonymous'} should call next()`)
    }
  })

  test('should handle rapid successive calls without rate limiting', async ({ assert }) => {
    // Test that we can make many rapid calls without any rate limiting
    const mockContext = {}
    const mockNext = async () => {}

    // Test with file upload throttle (most restrictive in production)
    const rapidCalls = Array.from({ length: 100 }, () => fileUploadThrottle(mockContext, mockNext))

    // All calls should complete without throwing rate limit errors
    const results = await Promise.allSettled(rapidCalls)

    // All promises should be fulfilled (not rejected due to rate limiting)
    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    assert.equal(fulfilled.length, 100, 'All rapid calls should succeed without rate limiting')
  })

  test('should verify NODE_ENV is set to test', ({ assert }) => {
    // Verify that the environment is properly configured for testing
    assert.equal(process.env.NODE_ENV, 'test')
  })
})
