import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AiCriterion from '#models/ai_criterion'

export default class extends BaseSeeder {
  async run() {
    await AiCriterion.createMany([
      {
        name: 'Technical Skills',
        weight: 0.3,
        description: "Evaluate candidate's technical proficiency and expertise",
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Experience Level',
        weight: 0.25,
        description: 'Years of relevant experience in the field',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Education Background',
        weight: 0.15,
        description: 'Formal education and relevant certifications',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Communication Skills',
        weight: 0.15,
        description: 'Written and verbal communication abilities',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Problem Solving',
        weight: 0.1,
        description: 'Analytical thinking and problem-solving capabilities',
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Cultural Fit',
        weight: 0.05,
        description: 'Alignment with company values and culture',
        isActive: true,
        sortOrder: 6,
      },
    ])
  }
}
