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

// Global throttle for general API usage
export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

// File upload throttle - more restrictive (but lenient for tests)
export const fileUploadThrottle = limiter.define('fileUpload', () => {
  if (env.get('NODE_ENV') === 'test') {
    return limiter.allowRequests(100).every('1 minute')
  }
  return limiter.allowRequests(5).every('15 minutes').blockFor('30 minutes')
})

// Assessment throttle - moderate restrictions
export const assessmentStartThrottle = limiter.define('assessmentStart', () => {
  if (env.get('NODE_ENV') === 'test') {
    return limiter.allowRequests(1000).every('1 minute')
  }
  return limiter.allowRequests(10).every('1 hour').blockFor('2 hours')
})

export const assessmentActionThrottle = limiter.define('assessmentAction', () => {
  if (env.get('NODE_ENV') === 'test') {
    return limiter.allowRequests(1000).every('1 minute')
  }
  return limiter.allowRequests(50).every('15 minutes')
})

export const assessmentViewThrottle = limiter.define('assessmentView', () => {
  if (env.get('NODE_ENV') === 'test') {
    return limiter.allowRequests(1000).every('1 minute')
  }
  return limiter.allowRequests(100).every('15 minutes')
})

// Management API throttle - for admin operations
export const managementThrottle = limiter.define('management', () => {
  return limiter.allowRequests(60).every('1 hour')
})

export const managementViewThrottle = limiter.define('managementView', () => {
  return limiter.allowRequests(100).every('1 hour')
})

export const managementUpdateThrottle = limiter.define('managementUpdate', () => {
  return limiter.allowRequests(30).every('1 hour')
})

export const managementAnalyticsThrottle = limiter.define('managementAnalytics', () => {
  return limiter.allowRequests(20).every('1 hour')
})
