import type { HttpContext } from '@adonisjs/core/http'
import Job from '#models/job'
import CvSubmission from '#models/cv_submission'
import AiCriteria from '#models/ai_criteria'
import vine from '@vinejs/vine'

export default class AdminController {
  /**
   * Show admin dashboard with tabs
   */
  async dashboard({ view, request, session, admin }: HttpContext) {
    const activeTab = request.input('tab', 'jobs')

    return view.render('admin/dashboard', {
      activeTab,
      adminUser: admin,
      adminUsername: session.get('admin_username') || admin?.username || 'Admin',
    })
  }

  /**
   * Get jobs data for jobs management tab
   */
  async getJobs({ response, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')

    let query = Job.query().orderBy('created_at', 'desc')

    if (search) {
      query = query.where('job_title', 'ILIKE', `%${search}%`)
    }

    const jobs = await query.paginate(page, limit)

    return response.json({
      success: true,
      data: {
        jobs: jobs.all(),
        pagination: {
          currentPage: jobs.currentPage,
          perPage: jobs.perPage,
          total: jobs.total,
          lastPage: jobs.lastPage,
        },
      },
    })
  }

  /**
   * Update job status (activate/deactivate)
   */
  async updateJobStatus({ params, request, response }: HttpContext) {
    const jobId = params.id
    const { isActive } = request.only(['isActive'])

    const job = await Job.find(jobId)
    if (!job) {
      return response.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    job.isActive = isActive
    await job.save()

    return response.json({
      success: true,
      message: `Job ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: job,
    })
  }

  /**
   * Get applicants data for applicants management tab
   */
  async getApplicants({ response, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const jobId = request.input('job_id')

    let query = CvSubmission.query()
      .preload('job', (jobQuery) => {
        jobQuery.select('id', 'job_title', 'work_location')
      })
      .preload('questionnaireResponse', (responseQuery) => {
        responseQuery.select(
          'id',
          'cv_submission_id',
          'is_completed',
          'total_score',
          'assessment_result',
          'completed_at'
        )
      })
      .preload('processedCv', (processedQuery) => {
        processedQuery.select('id', 'cv_submission_id', 'processing_status', 'extracted_data')
      })
      .orderBy('created_at', 'desc')

    if (status) {
      query = query.where('status', status)
    }

    if (jobId) {
      query = query.where('job_id', jobId)
    }

    const applicants = await query.paginate(page, limit)

    return response.json({
      success: true,
      data: {
        applicants: applicants.all(),
        pagination: {
          currentPage: applicants.currentPage,
          perPage: applicants.perPage,
          total: applicants.total,
          lastPage: applicants.lastPage,
        },
      },
    })
  }

  /**
   * Update applicant status
   */
  async updateApplicantStatus({ params, request, response }: HttpContext) {
    const submissionId = params.submissionId
    const { status } = request.only(['status'])

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected']
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
        message: 'Applicant not found',
      })
    }

    submission.status = status
    await submission.save()

    return response.json({
      success: true,
      message: 'Applicant status updated successfully',
      data: submission,
    })
  }

  /**
   * Get AI criteria for criteria management tab
   */
  async getCriteria({ response }: HttpContext) {
    const criteria = await AiCriteria.query().orderBy('sort_order', 'asc')

    const totalWeight = await AiCriteria.getTotalWeight()

    return response.json({
      success: true,
      data: {
        criteria,
        totalWeight,
      },
    })
  }

  /**
   * Create new AI criteria
   */
  async createCriteria({ request, response }: HttpContext) {
    const criteriaValidator = vine.compile(
      vine.object({
        name: vine.string().trim().minLength(1).maxLength(100),
        weight: vine.number().min(0).max(1),
        description: vine.string().trim().optional(),
        sortOrder: vine.number().optional(),
      })
    )

    try {
      const data = await request.validateUsing(criteriaValidator)

      // Check if total weight would exceed 1.0
      const currentTotalWeight = await AiCriteria.getTotalWeight()
      if (currentTotalWeight + data.weight > 1.0) {
        return response.status(400).json({
          success: false,
          message: `Total weight cannot exceed 1.0. Current total: ${currentTotalWeight}`,
        })
      }

      const criteria = await AiCriteria.create({
        ...data,
        isActive: true,
        sortOrder: data.sortOrder || 0,
      })

      return response.json({
        success: true,
        message: 'Criteria created successfully',
        data: criteria,
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.messages || ['Invalid input'],
      })
    }
  }

  /**
   * Update AI criteria
   */
  async updateCriteria({ params, request, response }: HttpContext) {
    const criteriaId = params.id

    const criteriaValidator = vine.compile(
      vine.object({
        name: vine.string().trim().minLength(1).maxLength(100).optional(),
        weight: vine.number().min(0).max(1).optional(),
        description: vine.string().trim().optional(),
        sortOrder: vine.number().optional(),
        isActive: vine.boolean().optional(),
      })
    )

    try {
      const data = await request.validateUsing(criteriaValidator)

      const criteria = await AiCriteria.find(criteriaId)
      if (!criteria) {
        return response.status(404).json({
          success: false,
          message: 'Criteria not found',
        })
      }

      // Check weight constraint if weight is being updated
      if (data.weight !== undefined) {
        const currentTotalWeight = await AiCriteria.getTotalWeight()
        const newTotalWeight = currentTotalWeight - criteria.weight + data.weight

        if (newTotalWeight > 1.0) {
          return response.status(400).json({
            success: false,
            message: `Total weight cannot exceed 1.0. New total would be: ${newTotalWeight}`,
          })
        }
      }

      criteria.merge(data)
      await criteria.save()

      return response.json({
        success: true,
        message: 'Criteria updated successfully',
        data: criteria,
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.messages || ['Invalid input'],
      })
    }
  }

  /**
   * Delete AI criteria
   */
  async deleteCriteria({ params, response }: HttpContext) {
    const criteriaId = params.id

    const criteria = await AiCriteria.find(criteriaId)
    if (!criteria) {
      return response.status(404).json({
        success: false,
        message: 'Criteria not found',
      })
    }

    await criteria.delete()

    return response.json({
      success: true,
      message: 'Criteria deleted successfully',
    })
  }
}
