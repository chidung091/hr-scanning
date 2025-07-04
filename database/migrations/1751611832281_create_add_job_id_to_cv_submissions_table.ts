import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cv_submissions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('job_id').unsigned().nullable().references('id').inTable('jobs').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['job_id'])
      table.dropColumn('job_id')
    })
  }
}