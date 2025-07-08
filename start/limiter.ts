/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import env from '#start/env'

/**
 * Check if we're running in test mode or if tests are being executed
 * This includes checking for common test runners and CI environments
 */
function isTestEnvironment(): boolean {
  return (
    env.get('NODE_ENV') === 'test' ||
    process.env.NODE_ENV === 'test' ||
    process.argv.some((arg) => arg.includes('test')) ||
    process.argv.some((arg) => arg.includes('japa')) ||
    !!process.env.CI ||
    !!process.env.GITHUB_ACTIONS ||
    !!process.env.JEST_WORKER_ID
  )
}

/**
 * Create a no-op middleware that bypasses rate limiting entirely
 */
function createBypassMiddleware() {
  return async (_ctx: any, next: () => Promise<void>) => {
    await next()
  }
}

// Global throttle for general API usage - DISABLED FOR TESTS
export const throttle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('global', () => {
      return limiter.allowRequests(10).every('1 minute')
    })

// File upload throttle - DISABLED FOR TESTS
export const fileUploadThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('fileUpload', () => {
      return limiter.allowRequests(5).every('15 minutes').blockFor('30 minutes')
    })

// Assessment throttle - DISABLED FOR TESTS
export const assessmentStartThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('assessmentStart', () => {
      return limiter.allowRequests(10).every('1 hour').blockFor('2 hours')
    })

export const assessmentActionThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('assessmentAction', () => {
      return limiter.allowRequests(50).every('15 minutes')
    })

export const assessmentViewThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('assessmentView', () => {
      return limiter.allowRequests(100).every('15 minutes')
    })

// Management API throttle - DISABLED FOR TESTS
export const managementThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('management', () => {
      return limiter.allowRequests(60).every('1 hour')
    })

export const managementViewThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('managementView', () => {
      return limiter.allowRequests(100).every('1 hour')
    })

export const managementUpdateThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('managementUpdate', () => {
      return limiter.allowRequests(30).every('1 hour')
    })

export const managementAnalyticsThrottle = isTestEnvironment()
  ? createBypassMiddleware()
  : limiter.define('managementAnalytics', () => {
      return limiter.allowRequests(20).every('1 hour')
    })
