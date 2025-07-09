import { BaseSchema } from '@adonisjs/lucid/schema'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  async up() {
    const now = DateTime.local().toSQL()

    // Comprehensive AI evaluation criteria for HR screening
    const sampleCriteria = [
      {
        name: 'Technical Skills Assessment',
        weight: 0.25,
        description:
          'Evaluation of programming languages, frameworks, tools, and technical expertise relevant to the position. Includes depth of knowledge, practical application, and ability to solve technical problems.',
        sort_order: 1,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Professional Experience Relevance',
        weight: 0.2,
        description:
          'Assessment of work experience quality, duration, and relevance to the target role. Considers career progression, project complexity, and industry experience.',
        sort_order: 2,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Problem-Solving & Analytical Thinking',
        weight: 0.18,
        description:
          'Ability to analyze complex problems, think critically, and develop innovative solutions. Includes logical reasoning, debugging skills, and approach to challenges.',
        sort_order: 3,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Communication & Collaboration Skills',
        weight: 0.15,
        description:
          'Written and verbal communication abilities, teamwork skills, and capacity to work effectively in cross-functional teams. Includes presentation skills and stakeholder management.',
        sort_order: 4,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Cultural Fit & Adaptability',
        weight: 0.12,
        description:
          'Alignment with company values, work culture, and team dynamics. Includes adaptability to change, learning agility, and integration potential with existing team members.',
        sort_order: 5,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Leadership & Initiative Potential',
        weight: 0.1,
        description:
          'Demonstrated leadership qualities, ability to take initiative, mentor others, and drive projects forward. Includes decision-making skills and influence on team performance.',
        sort_order: 6,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]

    // Insert the sample criteria
    await Database.table('ai_criteria').insert(sampleCriteria)
  }

  async down() {
    // Remove the sample criteria by name
    const criteriaNames = [
      'Technical Skills Assessment',
      'Professional Experience Relevance',
      'Problem-Solving & Analytical Thinking',
      'Communication & Collaboration Skills',
      'Cultural Fit & Adaptability',
      'Leadership & Initiative Potential',
    ]

    await Database.from('ai_criteria').whereIn('name', criteriaNames).del()
  }
}
