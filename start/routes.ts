/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import {
  fileUploadThrottle,
  assessmentStartThrottle,
  assessmentActionThrottle,
  assessmentViewThrottle,
  managementThrottle,
  managementViewThrottle,
  managementUpdateThrottle,
  managementAnalyticsThrottle
} from '#start/limiter'
const HomeController = () => import('#controllers/home_controller')
const CvSubmissionsController = () => import('#controllers/cv_submissions_controller')
const JobsController = () => import('#controllers/jobs_controller')
const AssessmentController = () => import('#controllers/assessment_controller')
const SwaggerController = () => import('#controllers/swagger_controller')
const ManagementController = () => import('#controllers/management_controller')

router.get('/', [HomeController, 'index'])

// Job routes
router.get('/careers', [JobsController, 'careers'])
router.get('/jobs/:id', [JobsController, 'show'])

// Legacy route for backward compatibility (redirect to careers)
router.get('/jobs', ({ response }) => response.redirect('/careers'))

// Job API routes
router.get('/api/jobs', [JobsController, 'apiIndex'])
router.get('/api/jobs/:id', [JobsController, 'apiShow'])

// CV Upload routes (with rate limiting for file uploads)
router.post('/api/cv/upload', [CvSubmissionsController, 'upload']).use(fileUploadThrottle)
router.post('/api/cv/questionnaire', [CvSubmissionsController, 'submitQuestionnaire']) // Legacy endpoint
router.get('/success/:id', [CvSubmissionsController, 'success'])

// Progressive Assessment API routes (with rate limiting for assessment actions)
router.post('/api/assessment/start', [AssessmentController, 'startAssessment']).use(assessmentStartThrottle)
router.get('/api/assessment/:assessmentId/question', [AssessmentController, 'getCurrentQuestion']).use(assessmentViewThrottle)
router.post('/api/assessment/:assessmentId/answer', [AssessmentController, 'submitAnswer']).use(assessmentActionThrottle)
router.get('/api/assessment/:assessmentId/progress', [AssessmentController, 'getProgress']).use(assessmentViewThrottle)

// Management API routes (with rate limiting for admin operations)
router.get('/api/management/submissions', [ManagementController, 'getSubmissions']).use(managementThrottle)
router.get('/api/management/submissions/:submissionId', [ManagementController, 'getSubmissionDetails']).use(managementViewThrottle)
router.put('/api/management/submissions/:submissionId/status', [ManagementController, 'updateSubmissionStatus']).use(managementUpdateThrottle)
router.get('/api/management/analytics', [ManagementController, 'getAnalytics']).use(managementAnalyticsThrottle)

// API Documentation routes
router.get('/api/docs', [SwaggerController, 'ui'])
router.get('/api/docs/json', [SwaggerController, 'json'])
router.get('/api/docs/yaml', [SwaggerController, 'yaml'])
