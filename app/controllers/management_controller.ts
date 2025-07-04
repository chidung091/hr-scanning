import type { HttpContext } from '@adonisjs/core/http'
import CvSubmission from '#models/cv_submission'
import QuestionnaireResponse from '#models/questionnaire_response'
import { DateTime } from 'luxon'

export default class ManagementController {
  /**
   * @swagger
   * /api/management/submissions:
   *   get:
   *     tags: [Management]
   *     summary: Get all CV submissions with assessment data
   *     description: Retrieve a paginated list of all CV submissions with their assessment status and scores
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, submitted, reviewed, accepted, rejected]
   *         description: Filter by submission status
   *       - in: query
   *         name: job_id
   *         schema:
   *           type: integer
   *         description: Filter by job ID
   *       - in: query
   *         name: assessment_completed
   *         schema:
   *           type: boolean
   *         description: Filter by assessment completion status
   *     responses:
   *       200:
   *         description: List of CV submissions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         submissions:
   *                           type: array
   *                           items:
   *                             allOf:
   *                               - $ref: '#/components/schemas/CvSubmission'
   *                               - type: object
   *                                 properties:
   *                                   job:
   *                                     $ref: '#/components/schemas/Job'
   *                                   questionnaireResponse:
   *                                     $ref: '#/components/schemas/QuestionnaireResponse'
   *                         pagination:
   *                           type: object
   *                           properties:
   *                             currentPage:
   *                               type: integer
   *                               example: 1
   *                             perPage:
   *                               type: integer
   *                               example: 20
   *                             total:
   *                               type: integer
   *                               example: 150
   *                             lastPage:
   *                               type: integer
   *                               example: 8
   */
  async getSubmissions({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)
      const status = request.input('status')
      const jobId = request.input('job_id')
      const assessmentCompleted = request.input('assessment_completed')

      let query = CvSubmission.query()
        .preload('job', (jobQuery) => {
          jobQuery.select('id', 'job_title', 'work_location', 'salary_range')
        })
        .preload('questionnaireResponse', (responseQuery) => {
          responseQuery.select('id', 'cv_submission_id', 'is_completed', 'total_score', 'assessment_result', 'completed_at')
        })
        .orderBy('created_at', 'desc')

      // Apply filters
      if (status) {
        query = query.where('status', status)
      }

      if (jobId) {
        query = query.where('job_id', jobId)
      }

      if (assessmentCompleted !== undefined) {
        if (assessmentCompleted === 'true' || assessmentCompleted === true) {
          query = query.whereHas('questionnaireResponse', (subQuery) => {
            subQuery.where('is_completed', true)
          })
        } else {
          query = query.whereDoesntHave('questionnaireResponse', (subQuery) => {
            subQuery.where('is_completed', true)
          })
        }
      }

      const submissions = await query.paginate(page, limit)

      return response.json({
        success: true,
        data: {
          submissions: submissions.all(),
          pagination: {
            currentPage: submissions.currentPage,
            perPage: submissions.perPage,
            total: submissions.total,
            lastPage: submissions.lastPage,
          },
        },
      })
    } catch (error) {
      console.error('Get submissions error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to retrieve submissions',
      })
    }
  }

  /**
   * @swagger
   * /api/management/submissions/{submissionId}:
   *   get:
   *     tags: [Management]
   *     summary: Get detailed submission information
   *     description: Retrieve detailed information about a specific CV submission including assessment responses
   *     parameters:
   *       - in: path
   *         name: submissionId
   *         required: true
   *         schema:
   *           type: string
   *         description: The submission ID
   *     responses:
   *       200:
   *         description: Submission details retrieved successfully
   *       404:
   *         description: Submission not found
   */
  async getSubmissionDetails({ request, response }: HttpContext) {
    try {
      const submissionId = request.param('submissionId')

      const submission = await CvSubmission.query()
        .where('submission_id', submissionId)
        .preload('job')
        .preload('questionnaireResponse')
        .first()

      if (!submission) {
        return response.status(404).json({
          success: false,
          message: 'Submission not found',
        })
      }

      return response.json({
        success: true,
        data: {
          submission,
        },
      })
    } catch (error) {
      console.error('Get submission details error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to retrieve submission details',
      })
    }
  }

  /**
   * @swagger
   * /api/management/submissions/{submissionId}/status:
   *   put:
   *     tags: [Management]
   *     summary: Update submission status
   *     description: Update the status of a CV submission (e.g., reviewed, accepted, rejected)
   *     parameters:
   *       - in: path
   *         name: submissionId
   *         required: true
   *         schema:
   *           type: string
   *         description: The submission ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, submitted, reviewed, accepted, rejected]
   *                 description: New status for the submission
   *               notes:
   *                 type: string
   *                 description: Optional notes about the status change
   *     responses:
   *       200:
   *         description: Status updated successfully
   *       404:
   *         description: Submission not found
   *       400:
   *         description: Invalid status value
   */
  async updateSubmissionStatus({ request, response }: HttpContext) {
    try {
      const submissionId = request.param('submissionId')
      const status = request.input('status')
      const notes = request.input('notes')

      const validStatuses = ['pending', 'submitted', 'reviewed', 'accepted', 'rejected']
      if (!validStatuses.includes(status)) {
        return response.status(400).json({
          success: false,
          message: 'Invalid status value',
        })
      }

      const submission = await CvSubmission.findBy('submissionId', submissionId)
      if (!submission) {
        return response.status(404).json({
          success: false,
          message: 'Submission not found',
        })
      }

      submission.status = status
      await submission.save()

      // Update notes in questionnaire response if provided
      if (notes) {
        const questionnaireResponse = await QuestionnaireResponse.findBy('cvSubmissionId', submission.id)
        if (questionnaireResponse) {
          questionnaireResponse.notes = notes
          await questionnaireResponse.save()
        }
      }

      return response.json({
        success: true,
        message: 'Status updated successfully',
        data: {
          submissionId: submission.submissionId,
          status: submission.status,
        },
      })
    } catch (error) {
      console.error('Update submission status error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update submission status',
      })
    }
  }

  /**
   * @swagger
   * /api/management/analytics:
   *   get:
   *     tags: [Management]
   *     summary: Get analytics dashboard data
   *     description: Retrieve analytics data for the management dashboard including submission counts, assessment completion rates, and score distributions
   *     parameters:
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [week, month, quarter, year]
   *           default: month
   *         description: Time period for analytics
   *     responses:
   *       200:
   *         description: Analytics data retrieved successfully
   */
  async getAnalytics({ request, response }: HttpContext) {
    try {
      const period = request.input('period', 'month')
      
      // Calculate date range based on period
      let startDate: DateTime
      switch (period) {
        case 'week':
          startDate = DateTime.now().minus({ weeks: 1 })
          break
        case 'quarter':
          startDate = DateTime.now().minus({ months: 3 })
          break
        case 'year':
          startDate = DateTime.now().minus({ years: 1 })
          break
        default:
          startDate = DateTime.now().minus({ months: 1 })
      }

      // Execute all analytics queries in parallel for better performance
      const [
        submissionCounts,
        totalSubmissions,
        completedAssessments,
        scoreDistribution,
        jobApplications
      ] = await Promise.all([
        // Get submission counts by status
        CvSubmission.query()
          .where('created_at', '>=', startDate.toSQL()!)
          .groupBy('status')
          .count('* as count')
          .select('status'),

        // Get total submissions count
        CvSubmission.query()
          .where('created_at', '>=', startDate.toSQL()!)
          .count('* as total'),

        // Get completed assessments count
        QuestionnaireResponse.query()
          .where('is_completed', true)
          .where('created_at', '>=', startDate.toSQL()!)
          .count('* as completed'),

        // Get score distribution
        QuestionnaireResponse.query()
          .where('is_completed', true)
          .where('created_at', '>=', startDate.toSQL()!)
          .groupBy('assessment_result')
          .count('* as count')
          .select('assessment_result'),

        // Get job application counts with job details using optimized join
        CvSubmission.query()
          .where('created_at', '>=', startDate.toSQL()!)
          .whereNotNull('job_id')
          .join('jobs', 'cv_submissions.job_id', 'jobs.id')
          .groupBy('cv_submissions.job_id', 'jobs.job_title')
          .count('cv_submissions.id as count')
          .select('cv_submissions.job_id as job_id', 'jobs.job_title')
      ])

      const completionRate = totalSubmissions[0]?.$extras.total > 0 
        ? Math.round((completedAssessments[0]?.$extras.completed / totalSubmissions[0]?.$extras.total) * 100)
        : 0

      return response.json({
        success: true,
        data: {
          period,
          submissionCounts: submissionCounts.map((item: any) => ({
            status: item.status,
            count: item.$extras.count
          })),
          assessmentCompletion: {
            total: totalSubmissions[0]?.$extras.total || 0,
            completed: completedAssessments[0]?.$extras.completed || 0,
            rate: completionRate
          },
          scoreDistribution: scoreDistribution.map((item: any) => ({
            result: item.assessmentResult,
            count: item.$extras.count
          })),
          jobApplications: jobApplications.map((item: any) => ({
            jobId: item.jobId,
            count: item.$extras.count
          }))
        },
      })
    } catch (error) {
      console.error('Get analytics error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics data',
      })
    }
  }
}
