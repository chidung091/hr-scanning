import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Job from '#models/job'

export default class extends BaseSeeder {
  async run() {
    // Clear existing jobs
    await Job.query().delete()

    // Create Frontend Developer job
    await Job.create({
      jobTitle: 'Frontend Developer',
      numberOfEmployees: 2,
      workLocation: 'Ho Chi Minh City, Vietnam',
      workingTime: 'Full-time',
      startTime: '09:00',
      endTime: '18:00',
      salaryRange: '$1,500 - $2,500 USD/month',
      responsibilities: `• Develop and maintain responsive web applications using modern frontend frameworks
• Collaborate with UX/UI designers to implement pixel-perfect designs
• Write clean, maintainable, and well-documented code
• Optimize applications for maximum speed and scalability
• Participate in code reviews and maintain coding standards
• Work closely with backend developers to integrate APIs
• Stay up-to-date with the latest frontend technologies and best practices
• Debug and troubleshoot issues across different browsers and devices`,
      requirements: `• Bachelor's degree in Computer Science, Software Engineering, or related field
• 2+ years of experience in frontend development
• Proficiency in HTML5, CSS3, and JavaScript (ES6+)
• Experience with React.js or Vue.js
• Knowledge of responsive design and CSS frameworks (Tailwind CSS, Bootstrap)
• Familiarity with version control systems (Git)
• Understanding of RESTful APIs and AJAX
• Experience with build tools (Webpack, Vite) and package managers (npm, yarn)
• Strong problem-solving skills and attention to detail
• Good communication skills and ability to work in a team environment`,
      preferredQualifications: `• Experience with TypeScript
• Knowledge of state management libraries (Redux, Vuex)
• Familiarity with testing frameworks (Jest, Cypress)
• Experience with CSS preprocessors (Sass, Less)
• Understanding of web performance optimization
• Knowledge of accessibility standards (WCAG)
• Experience with design tools (Figma, Adobe XD)
• Familiarity with Agile/Scrum methodologies`,
      benefits: `• Competitive salary with performance-based bonuses
• Comprehensive health insurance coverage
• Annual leave: 15 days + public holidays
• Professional development budget for courses and conferences
• Flexible working hours and remote work options
• Modern office with ergonomic workstations
• Free lunch and snacks
• Team building activities and company retreats
• Career advancement opportunities`,
      probationPolicy: `• 2-month probation period
• Regular feedback sessions during probation
• Performance evaluation at the end of probation period
• Full benefits available after successful completion of probation`,
      equipmentProvided: `• MacBook Pro or high-spec Windows laptop
• External monitor (27" 4K display)
• Ergonomic keyboard and mouse
• Adjustable standing desk
• High-quality headphones
• All necessary software licenses`,
      otherPerks: `• Gym membership subsidy
• Language learning support (English/Japanese)
• Birthday bonus and gifts
• Employee referral bonus program
• Parking allowance
• Coffee and tea provided
• Casual dress code
• Pet-friendly office`,
      isActive: true,
      sortOrder: 1,
    })

    // Create Backend Developer job
    await Job.create({
      jobTitle: 'Backend Developer',
      numberOfEmployees: 1,
      workLocation: 'Ho Chi Minh City, Vietnam',
      workingTime: 'Full-time',
      startTime: '09:00',
      endTime: '18:00',
      salaryRange: '$1,800 - $3,000 USD/month',
      responsibilities: `• Design and develop scalable backend services and APIs
• Build and maintain database schemas and optimize queries
• Implement security best practices and data protection measures
• Integrate third-party services and APIs
• Write comprehensive unit and integration tests
• Monitor application performance and troubleshoot issues
• Collaborate with frontend developers to ensure seamless integration
• Participate in system architecture decisions and technical planning
• Maintain and improve existing codebase
• Document technical specifications and API endpoints`,
      requirements: `• Bachelor's degree in Computer Science, Software Engineering, or related field
• 3+ years of experience in backend development
• Proficiency in Node.js and TypeScript
• Experience with AdonisJS or similar MVC frameworks
• Strong knowledge of PostgreSQL and database design
• Understanding of RESTful API design principles
• Experience with version control systems (Git)
• Knowledge of authentication and authorization mechanisms
• Familiarity with cloud platforms (AWS, Google Cloud, or Azure)
• Understanding of microservices architecture
• Strong problem-solving and analytical skills`,
      preferredQualifications: `• Experience with Docker and containerization
• Knowledge of message queues (Redis, RabbitMQ)
• Familiarity with CI/CD pipelines
• Experience with monitoring tools (New Relic, DataDog)
• Knowledge of caching strategies
• Understanding of GraphQL
• Experience with serverless architectures
• Familiarity with DevOps practices
• Knowledge of security testing and vulnerability assessment`,
      benefits: `• Competitive salary with performance-based bonuses
• Comprehensive health insurance coverage
• Annual leave: 15 days + public holidays
• Professional development budget for courses and conferences
• Flexible working hours and remote work options
• Modern office with ergonomic workstations
• Free lunch and snacks
• Team building activities and company retreats
• Career advancement opportunities`,
      probationPolicy: `• 2-month probation period
• Regular feedback sessions during probation
• Performance evaluation at the end of probation period
• Full benefits available after successful completion of probation`,
      equipmentProvided: `• MacBook Pro or high-spec Windows laptop
• External monitor (27" 4K display)
• Ergonomic keyboard and mouse
• Adjustable standing desk
• High-quality headphones
• All necessary software licenses
• Development tools and IDE licenses`,
      otherPerks: `• Gym membership subsidy
• Language learning support (English/Japanese)
• Birthday bonus and gifts
• Employee referral bonus program
• Parking allowance
• Coffee and tea provided
• Casual dress code
• Pet-friendly office
• Technical book allowance`,
      isActive: true,
      sortOrder: 2,
    })

    console.log('✅ Jobs seeded successfully!')
  }
}