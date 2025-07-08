import type { HttpContext } from '@adonisjs/core/http'
import Job from '#models/job'

export default class JobsController {
  /**
   * Display careers page with list of available jobs
   */
  async careers({ view }: HttpContext) {
    const jobs = await Job.activeJobs()

    return view.render('pages/careers', {
      jobs,
    })
  }

  /**
   * Display individual job details
   */
  async show({ params, view, response }: HttpContext) {
    const jobId = params.id

    const job = await Job.activeJobs().where('id', jobId).first()

    if (!job) {
      return response.status(404).redirect('/careers')
    }

    return view.render('pages/job-detail', {
      job,
    })
  }

  /**
   * API endpoint to get all active jobs
   */
  async apiIndex({ response }: HttpContext) {
    const jobs = await Job.activeJobs()

    return response.json({
      success: true,
      data: jobs,
    })
  }

  /**
   * API endpoint to get specific job details
   */
  async apiShow({ params, response }: HttpContext) {
    const jobId = params.id

    const job = await Job.activeJobs().where('id', jobId).first()

    if (!job) {
      return response.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    return response.json({
      success: true,
      data: job,
    })
  }

  /**
   * API endpoint to get all jobs for admin (including inactive)
   */
  async apiAdminIndex({ response }: HttpContext) {
    try {
      const jobs = await Job.query().orderBy('sortOrder', 'asc').orderBy('createdAt', 'desc')

      return response.json({
        success: true,
        data: jobs,
      })
    } catch (error) {
      console.error('Error fetching admin jobs:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
      })
    }
  }

  /**
   * API endpoint to create a new job
   */
  async apiStore({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'jobTitle',
        'numberOfEmployees',
        'startTime',
        'endTime',
        'workingTime',
        'workLocation',
        'salaryRange',
        'responsibilities',
        'requirements',
        'preferredQualifications',
        'benefits',
        'probationPolicy',
        'equipmentProvided',
        'otherPerks',
        'isActive',
        'sortOrder',
      ])

      const job = await Job.create(data)

      return response.status(201).json({
        success: true,
        data: job,
        message: 'Job created successfully',
      })
    } catch (error) {
      console.error('Error creating job:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to create job',
      })
    }
  }

  /**
   * API endpoint to update a job
   */
  async apiUpdate({ params, request, response }: HttpContext) {
    try {
      const job = await Job.findOrFail(params.id)

      const data = request.only([
        'jobTitle',
        'numberOfEmployees',
        'startTime',
        'endTime',
        'workingTime',
        'workLocation',
        'salaryRange',
        'responsibilities',
        'requirements',
        'preferredQualifications',
        'benefits',
        'probationPolicy',
        'equipmentProvided',
        'otherPerks',
        'isActive',
        'sortOrder',
      ])

      job.merge(data)
      await job.save()

      return response.json({
        success: true,
        data: job,
        message: 'Job updated successfully',
      })
    } catch (error) {
      console.error('Error updating job:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update job',
      })
    }
  }

  /**
   * API endpoint to delete a job
   */
  async apiDestroy({ params, response }: HttpContext) {
    try {
      const job = await Job.findOrFail(params.id)
      await job.delete()

      return response.json({
        success: true,
        message: 'Job deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting job:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to delete job',
      })
    }
  }
}
