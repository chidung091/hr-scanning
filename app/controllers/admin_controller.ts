import type { HttpContext } from '@adonisjs/core/http'
import Job from '#models/job'
import CvSubmission from '#models/cv_submission'
import AiCriteria from '#models/ai_criteria'

export default class AdminController {
  /**
   * Display admin dashboard
   */
  async dashboard({ view }: HttpContext) {
    return view.render('pages/admin/dashboard')
  }

  /**
   * Get jobs data for admin dashboard
   */
  async getJobs({ response }: HttpContext) {
    try {
      const jobs = await Job.query().withCount('cvSubmissions').orderBy('created_at', 'desc')

      return response.json({
        success: true,
        data: jobs,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message,
      })
    }
  }

  /**
   * Get applicants data for admin dashboard
   */
  async getApplicants({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)
      const status = request.input('status')
      const jobId = request.input('job_id')

      let query = CvSubmission.query()
        .preload('job', (jobQuery) => {
          jobQuery.select('id', 'job_title', 'work_location', 'salary_range')
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
        .orderBy('created_at', 'desc')

      // Apply filters
      if (status) {
        query = query.where('status', status)
      }

      if (jobId) {
        query = query.where('job_id', jobId)
      }

      const applicants = await query.paginate(page, limit)

      return response.json({
        success: true,
        data: applicants,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch applicants',
        error: error.message,
      })
    }
  }

  /**
   * Get AI criteria
   */
  async getCriteria({ response }: HttpContext) {
    try {
      const criteria = await AiCriteria.query().orderBy('name', 'asc')

      return response.json({
        success: true,
        data: criteria,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch criteria',
        error: error.message,
      })
    }
  }

  /**
   * Create new AI criteria
   */
  async createCriteria({ request, response }: HttpContext) {
    try {
      const { name, weight, description } = request.only(['name', 'weight', 'description'])

      // Validate weight constraints
      const weightValidation = await AiCriteria.validateWeights()
      if (weightValidation.remaining < weight) {
        return response.status(400).json({
          success: false,
          message: `Weight exceeds remaining capacity. Available: ${weightValidation.remaining.toFixed(2)}`,
        })
      }

      const criteria = await AiCriteria.create({
        name,
        weight: Number.parseFloat(weight),
        description: description || null,
        isActive: true,
      })

      return response.json({
        success: true,
        data: criteria,
        message: 'Criteria created successfully',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to create criteria',
        error: error.message,
      })
    }
  }

  /**
   * Update AI criteria
   */
  async updateCriteria({ params, request, response }: HttpContext) {
    try {
      const criteria = await AiCriteria.findOrFail(params.id)
      const { name, weight, description, isActive } = request.only([
        'name',
        'weight',
        'description',
        'isActive',
      ])

      // Validate weight constraints if weight is being updated
      if (weight !== undefined && Number.parseFloat(weight) !== criteria.weight) {
        const weightValidation = await AiCriteria.validateWeights(criteria.id)
        if (weightValidation.remaining < Number.parseFloat(weight)) {
          return response.status(400).json({
            success: false,
            message: `Weight exceeds remaining capacity. Available: ${weightValidation.remaining.toFixed(2)}`,
          })
        }
      }

      criteria.merge({
        name: name || criteria.name,
        weight: weight ? Number.parseFloat(weight) : criteria.weight,
        description: description !== undefined ? description : criteria.description,
        isActive: isActive !== undefined ? isActive : criteria.isActive,
      })

      await criteria.save()

      return response.json({
        success: true,
        data: criteria,
        message: 'Criteria updated successfully',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to update criteria',
        error: error.message,
      })
    }
  }

  /**
   * Delete AI criteria
   */
  async deleteCriteria({ params, response }: HttpContext) {
    try {
      const criteria = await AiCriteria.findOrFail(params.id)
      await criteria.delete()

      return response.json({
        success: true,
        message: 'Criteria deleted successfully',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to delete criteria',
        error: error.message,
      })
    }
  }

  /**
   * Update applicant status
   */
  async updateApplicantStatus({ params, request, response }: HttpContext) {
    try {
      const applicant = await CvSubmission.findOrFail(params.id)
      const { status } = request.only(['status'])

      applicant.status = status
      await applicant.save()

      return response.json({
        success: true,
        data: applicant,
        message: 'Applicant status updated successfully',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to update applicant status',
        error: error.message,
      })
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus({ params, request, response }: HttpContext) {
    try {
      const job = await Job.findOrFail(params.id)
      const { isActive } = request.only(['isActive'])

      job.isActive = isActive
      await job.save()

      return response.json({
        success: true,
        data: job,
        message: 'Job status updated successfully',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to update job status',
        error: error.message,
      })
    }
  }
}
