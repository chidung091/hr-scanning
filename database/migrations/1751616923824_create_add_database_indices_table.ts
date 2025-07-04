import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add indexes for cv_submissions table
    this.schema.alterTable('cv_submissions', (table) => {
      table.index(['status'], 'cv_submissions_status_index')
      table.index(['submission_id'], 'cv_submissions_submission_id_index')
      table.index(['applicant_email'], 'cv_submissions_applicant_email_index')
      table.index(['job_id'], 'cv_submissions_job_id_index')
      table.index(['created_at'], 'cv_submissions_created_at_index')
      table.index(['status', 'created_at'], 'cv_submissions_status_created_at_index')
    })

    // Add indexes for questionnaire_responses table
    this.schema.alterTable('questionnaire_responses', (table) => {
      table.index(['submission_id'], 'questionnaire_responses_submission_id_index')
      table.index(['cv_submission_id'], 'questionnaire_responses_cv_submission_id_index')
      table.index(['is_completed'], 'questionnaire_responses_is_completed_index')
      table.index(['assessment_result'], 'questionnaire_responses_assessment_result_index')
      table.index(['created_at'], 'questionnaire_responses_created_at_index')
      table.index(['is_completed', 'created_at'], 'questionnaire_responses_completed_created_at_index')
      table.index(['last_activity_at'], 'questionnaire_responses_last_activity_at_index')
    })

    // Add indexes for jobs table
    this.schema.alterTable('jobs', (table) => {
      table.index(['is_active'], 'jobs_is_active_index')
      table.index(['sort_order'], 'jobs_sort_order_index')
      table.index(['is_active', 'sort_order', 'created_at'], 'jobs_active_sort_created_index')
    })
  }

  async down() {
    // Drop indexes for cv_submissions table
    this.schema.alterTable('cv_submissions', (table) => {
      table.dropIndex(['status'], 'cv_submissions_status_index')
      table.dropIndex(['submission_id'], 'cv_submissions_submission_id_index')
      table.dropIndex(['applicant_email'], 'cv_submissions_applicant_email_index')
      table.dropIndex(['job_id'], 'cv_submissions_job_id_index')
      table.dropIndex(['created_at'], 'cv_submissions_created_at_index')
      table.dropIndex(['status', 'created_at'], 'cv_submissions_status_created_at_index')
    })

    // Drop indexes for questionnaire_responses table
    this.schema.alterTable('questionnaire_responses', (table) => {
      table.dropIndex(['submission_id'], 'questionnaire_responses_submission_id_index')
      table.dropIndex(['cv_submission_id'], 'questionnaire_responses_cv_submission_id_index')
      table.dropIndex(['is_completed'], 'questionnaire_responses_is_completed_index')
      table.dropIndex(['assessment_result'], 'questionnaire_responses_assessment_result_index')
      table.dropIndex(['created_at'], 'questionnaire_responses_created_at_index')
      table.dropIndex(['is_completed', 'created_at'], 'questionnaire_responses_completed_created_at_index')
      table.dropIndex(['last_activity_at'], 'questionnaire_responses_last_activity_at_index')
    })

    // Drop indexes for jobs table
    this.schema.alterTable('jobs', (table) => {
      table.dropIndex(['is_active'], 'jobs_is_active_index')
      table.dropIndex(['sort_order'], 'jobs_sort_order_index')
      table.dropIndex(['is_active', 'sort_order', 'created_at'], 'jobs_active_sort_created_index')
    })
  }
}