/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import {
  fileUploadThrottle,
  assessmentStartThrottle,
  assessmentActionThrottle,
  assessmentViewThrottle,
  managementThrottle,
  managementViewThrottle,
  managementUpdateThrottle,
  managementAnalyticsThrottle,
} from '#start/limiter'
const HomeController = () => import('#controllers/home_controller')
const CvSubmissionsController = () => import('#controllers/cv_submissions_controller')
const JobsController = () => import('#controllers/jobs_controller')
const AssessmentController = () => import('#controllers/assessment_controller')
const SwaggerController = () => import('#controllers/swagger_controller')
const ManagementController = () => import('#controllers/management_controller')
const AdminAuthController = () => import('#controllers/admin_auth_controller')
const AdminController = () => import('#controllers/admin_controller')

router.get('/', [HomeController, 'index'])

// Job routes
router.get('/careers', [JobsController, 'careers'])
router.get('/jobs/:id', [JobsController, 'show'])

// Legacy route for backward compatibility (redirect to careers)
router.get('/jobs', ({ response }) => response.redirect('/careers'))

// Job API routes
router.get('/api/jobs', [JobsController, 'apiIndex'])
router.get('/api/jobs/:id', [JobsController, 'apiShow'])

// Test middleware on existing route
router.get('/api/jobs-protected', ({ response }) => {
  console.log('Route handler called for /api/jobs-protected')
  return response.json({ success: true, message: 'Route working without middleware' })
})

router
  .get('/api/jobs-protected-with-middleware', [JobsController, 'apiIndex'])
  .use(middleware.adminAuth)

// Test with direct middleware import
router
  .get('/api/jobs-protected-direct', [JobsController, 'apiIndex'])
  .use(() => import('#middleware/admin_auth_middleware'))

// Test with simple test middleware
router
  .get('/api/test-middleware', ({ response }) => {
    return response.json({ success: true, message: 'Test middleware route' })
  })
  .use(middleware.test)

// CV Upload routes (with rate limiting for file uploads)
router.post('/api/cv/upload', [CvSubmissionsController, 'upload']).use(fileUploadThrottle)
router.post('/api/cv/questionnaire', [CvSubmissionsController, 'submitQuestionnaire']) // Legacy endpoint
router.get('/success/:id', [CvSubmissionsController, 'success'])

// OpenAI CV Processing routes
router.get('/api/cv/:submissionId/processing-status', [
  CvSubmissionsController,
  'getProcessingStatus',
])
router.get('/api/cv/:submissionId/extracted-data', [CvSubmissionsController, 'getExtractedData'])
router.post('/api/cv/:submissionId/retry-processing', [CvSubmissionsController, 'retryProcessing'])
router.get('/api/cv/processing-stats', [CvSubmissionsController, 'getProcessingStats'])

// Progressive Assessment API routes (with rate limiting for assessment actions)
router
  .post('/api/assessment/start', [AssessmentController, 'startAssessment'])
  .use(assessmentStartThrottle)
router
  .get('/api/assessment/:assessmentId/question', [AssessmentController, 'getCurrentQuestion'])
  .use(assessmentViewThrottle)
router
  .post('/api/assessment/:assessmentId/answer', [AssessmentController, 'submitAnswer'])
  .use(assessmentActionThrottle)
router
  .get('/api/assessment/:assessmentId/progress', [AssessmentController, 'getProgress'])
  .use(assessmentViewThrottle)

// Management API routes (with rate limiting for admin operations)
router
  .get('/api/management/submissions', [ManagementController, 'getSubmissions'])
  .use(managementThrottle)
router
  .get('/api/management/submissions/:submissionId', [ManagementController, 'getSubmissionDetails'])
  .use(managementViewThrottle)
router
  .put('/api/management/submissions/:submissionId/status', [
    ManagementController,
    'updateSubmissionStatus',
  ])
  .use(managementUpdateThrottle)
router
  .get('/api/management/analytics', [ManagementController, 'getAnalytics'])
  .use(managementAnalyticsThrottle)

// API Documentation routes
router.get('/api/docs', [SwaggerController, 'ui'])
router.get('/api/docs/json', [SwaggerController, 'json'])
router.get('/api/docs/yaml', [SwaggerController, 'yaml'])

// Admin Authentication Routes
router.get('/admin/login', [AdminAuthController, 'showLogin'])
router.post('/admin/login', [AdminAuthController, 'login'])
router.get('/admin/logout', [AdminAuthController, 'logout'])

// Admin API Authentication Routes
router.post('/api/admin/login', [AdminAuthController, 'apiLogin'])
router.post('/api/admin/logout', [AdminAuthController, 'apiLogout'])

// Test route to check middleware
router
  .get('/api/admin/test', ({ response }) => {
    return response.json({ success: true, message: 'Test route working' })
  })
  .use(middleware.adminAuth)

// Admin Routes (protected by authentication middleware)
router
  .group(() => {
    // Admin Dashboard
    router.get('/', [AdminController, 'dashboard'])
  })
  .prefix('/admin')
  .use(middleware.adminAuth)

// Admin API Routes (protected by authentication middleware)
router
  .group(() => {
    router.get('/jobs', [AdminController, 'getJobs'])
    router.put('/jobs/:id/status', [AdminController, 'updateJobStatus'])

    router.get('/applicants', [AdminController, 'getApplicants'])
    router.put('/applicants/:submissionId/status', [AdminController, 'updateApplicantStatus'])

    router.get('/criteria', [AdminController, 'getCriteria'])
    router.post('/criteria', [AdminController, 'createCriteria'])
    router.put('/criteria/:id', [AdminController, 'updateCriteria'])
    router.delete('/criteria/:id', [AdminController, 'deleteCriteria'])

    router.post('/applicants/:submissionId/evaluate', [AdminController, 'evaluateCandidate'])
    router.get('/applicants/:submissionId/evaluation', [AdminController, 'getCandidateEvaluation'])
    router.post('/applicants/auto-evaluate', [AdminController, 'autoEvaluatePendingCandidates'])
  })
  .prefix('/api/admin')
  .use(middleware.adminAuth)
