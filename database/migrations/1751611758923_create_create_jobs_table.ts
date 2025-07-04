import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'jobs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Basic job information
      table.string('job_title').notNullable()
      table.integer('number_of_employees').defaultTo(1)
      table.string('start_time').nullable() // e.g., "9:00 AM" or "Flexible"
      table.string('end_time').nullable()   // e.g., "5:00 PM" or "Flexible"
      table.string('working_time').nullable() // e.g., "Full-time", "Part-time", "Contract"
      table.string('work_location').nullable() // e.g., "Remote", "San Francisco, CA", "Hybrid"
      table.string('salary_range').nullable() // e.g., "$120k - $180k"

      // Job details
      table.text('responsibilities').nullable()
      table.text('requirements').nullable()
      table.text('preferred_qualifications').nullable()
      table.text('benefits').nullable()
      table.text('probation_policy').nullable()
      table.text('equipment_provided').nullable()
      table.text('other_perks').nullable()

      // Job status and metadata
      table.boolean('is_active').defaultTo(true)
      table.integer('sort_order').defaultTo(0)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}