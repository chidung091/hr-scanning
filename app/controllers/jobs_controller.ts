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

    const job = await Job.activeJobs()
      .where('id', jobId)
      .first()

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

    const job = await Job.activeJobs()
      .where('id', jobId)
      .first()

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
}