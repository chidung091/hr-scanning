import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSchema {
  protected tableName = 'jobs'

  async up() {
    const now = DateTime.local().toSQL()

    await Database.table('jobs').insert([
      {
        job_title: 'Fullstack Developer (NodeJS/NestJS)',
        number_of_employees: 1,
        start_time: 'Flexible (8AM–10AM)',
        end_time: 'Flexible (8 hours/day)',
        working_time: 'Full-time',
        work_location: 'Hanoi: 16th Floor, IC Building, 82 Duy Tan, Cau Giay',
        salary_range: '$1000 - $2000',
        responsibilities:
          'Understand and analyze requirements clearly,\nFollow software development processes,\nWork with BrSE and stakeholders to find solutions,\nDevelop features and fix bugs,\nGuide team members,\nMaintain and improve existing systems as well as develop new systems when needed,\nParticipate in code reviews.',
        requirements:
          'Good organizational and problem-solving skills,\nTeamwork skills, clear logic explanation,\nSolid knowledge of SQL databases (PostgreSQL),\nAround 3 years of backend/web experience,\nProficient in NodeJS, preferably with NestJS,\nKnowledge of HTML5, CSS3, SASS/SCSS,\nKnow how to use Docker,\nWrite unit tests independently.',
        preferred_qualifications:
          'Understanding of infrastructure or project analysis,\nKnow how to build Microservices, communicate via Redis, Kafka, GRPC, TCP, RabbitMQ,\nExperience working with Git, AWS, Linux, Redis, Nginx,\nKnow how to use templates like Nunjucks, Blade,\nExperience handling performance of large systems,\nKnowledge of micro-frontend/microservice is an advantage.',
        benefits:
          'Full salary during probation period,\n13th month bonus, salary review twice a year,\nFull salary insurance (Social, Health, Unemployment),\nCompany trips, periodic health checkups,\nMonthly happy lunch.',
        probation_policy: 'Full salary during probation period',
        equipment_provided: 'Macbook + external monitor',
        other_perks: 'No overtime, flexible working hours',
        is_active: true,
        sort_order: 0,
        created_at: now,
        updated_at: now,
      },
      {
        job_title: 'Bridge Software Engineer (BrSE)',
        number_of_employees: 1,
        start_time: 'Flexible (8AM–10AM)',
        end_time: 'Flexible (8 hours/day)',
        working_time: 'Full-time',
        work_location: 'Hanoi: 16th Floor, IC Building, 82 Duy Tan, Cau Giay',
        salary_range: '$2000 - $3000',
        responsibilities:
          'Act as intermediary between Japanese and Vietnamese teams,\nCoordinate team members to ensure project success,\nWrite design documents and necessary documentation,\nEvaluate priorities and manage team progress,\nEnsure product quality.',
        requirements:
          'Good Japanese communication skills (reading, writing), JLPT N2 or higher,\nAt least 3 years of BrSE position experience,\nExperience writing requirements, basic design, detail design,\nExperience in project progress management,\nSoftware development background.',
        preferred_qualifications:
          'Experience working at product companies,\nExperience working in Japan or Japanese companies in Vietnam,\nTeam management experience.',
        benefits:
          '2-month probation with 100% salary,\n13th month salary bonus,\nSalary increase twice a year,\nSocial, Health, Unemployment insurance on 100% salary,\nCompany trips, periodic health checkups, monthly happy lunch.',
        probation_policy: '2-month probation, 100% salary',
        equipment_provided: 'Macbook + external monitor',
        other_perks: 'Monthly happy lunch',
        is_active: true,
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
    ])
  }

  async down() {
    await Database.from('jobs')
      .whereIn('job_title', [
        'Fullstack Developer (NodeJS/NestJS)',
        'Bridge Software Engineer (BrSE)',
      ])
      .del()
  }
}
