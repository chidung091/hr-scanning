import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AdminUser from '#models/admin_user'
import AiCriteria from '#models/ai_criteria'

export default class extends BaseSeeder {
  async run() {
    // Create default admin user
    await AdminUser.updateOrCreate(
      { username: 'admin' },
      {
        username: 'admin',
        password: await AdminUser.hashPassword('admin'),
        isActive: true,
      }
    )

    // Create default AI criteria
    const defaultCriteria = [
      {
        name: 'Technical Skills',
        weight: 0.3,
        description: 'Programming languages, frameworks, and technical expertise',
        sortOrder: 1,
      },
      {
        name: 'Experience Level',
        weight: 0.25,
        description: 'Years of experience and project complexity',
        sortOrder: 2,
      },
      {
        name: 'Education Background',
        weight: 0.2,
        description: 'Relevant degrees and certifications',
        sortOrder: 3,
      },
      {
        name: 'Communication Skills',
        weight: 0.15,
        description: 'Written and verbal communication abilities',
        sortOrder: 4,
      },
      {
        name: 'Cultural Fit',
        weight: 0.1,
        description: 'Alignment with company values and team dynamics',
        sortOrder: 5,
      },
    ]

    for (const criteria of defaultCriteria) {
      await AiCriteria.updateOrCreate(
        { name: criteria.name },
        {
          ...criteria,
          isActive: true,
        }
      )
    }
  }
}
