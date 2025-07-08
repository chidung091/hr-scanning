import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AiCriteria from '#models/ai_criteria'

export default class extends BaseSeeder {
  async run() {
    // Clear existing criteria
    await AiCriteria.query().delete()

    // Insert sample AI criteria
    await AiCriteria.createMany([
      {
        name: 'Technical Skills',
        weight: 0.35,
        description:
          'Programming languages, frameworks, and technical competencies relevant to the role',
        isActive: true,
      },
      {
        name: 'Work Experience',
        weight: 0.25,
        description: 'Years of relevant work experience and quality of previous roles',
        isActive: true,
      },
      {
        name: 'Education',
        weight: 0.15,
        description: 'Educational background, degrees, and academic achievements',
        isActive: true,
      },
      {
        name: 'Communication Skills',
        weight: 0.1,
        description: 'Written and verbal communication abilities, language proficiency',
        isActive: true,
      },
      {
        name: 'Problem Solving',
        weight: 0.1,
        description: 'Analytical thinking, problem-solving approach, and innovation',
        isActive: true,
      },
      {
        name: 'Cultural Fit',
        weight: 0.05,
        description: 'Alignment with company values and team collaboration potential',
        isActive: true,
      },
    ])
  }
}
