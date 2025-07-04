import swaggerJSDoc from 'swagger-jsdoc'
import type { ApplicationService } from '@adonisjs/core/types'
import env from '#start/env'

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'TechVision HR Scanning API',
    version: '1.0.0',
    description: `
      ## TechVision HR Scanning API

      A comprehensive API for managing job applications, CV submissions, and progressive assessment workflows.

      ### Features
      - **File Upload**: Support for PDF, DOC, and DOCX CV uploads with text extraction
      - **Progressive Assessment**: Multi-step questionnaire system with scoring
      - **Job Management**: Complete job posting and application management
      - **Real-time Processing**: Automated text extraction and analysis

      ### Authentication
      This API uses CSRF tokens for security. Include the X-CSRF-Token header in your requests.
    `,
    contact: {
      name: 'TechVision Solutions',
      email: 'support@techvision.com',
      url: 'https://techvision.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: env.get('APP_URL', 'http://localhost:3333'),
      description: env.get('NODE_ENV') === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description: 'CSRF token for form submissions'
      }
    },
    schemas: {
      Job: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          jobTitle: { type: 'string', example: 'Senior Software Engineer' },
          numberOfEmployees: { type: 'integer', example: 2 },
          startTime: { type: 'string', example: '9:00 AM' },
          endTime: { type: 'string', example: '5:00 PM' },
          workingTime: { type: 'string', example: 'Full-time' },
          workLocation: { type: 'string', example: 'Remote' },
          salaryRange: { type: 'string', example: '$120k - $180k' },
          responsibilities: { type: 'string' },
          requirements: { type: 'string' },
          preferredQualifications: { type: 'string' },
          benefits: { type: 'string' },
          probationPolicy: { type: 'string' },
          equipmentProvided: { type: 'string' },
          otherPerks: { type: 'string' },
          isActive: { type: 'boolean', example: true },
          sortOrder: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CvSubmission: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          submissionId: { type: 'string', example: 'clx1234567890' },
          filename: { type: 'string', example: 'cv_john_doe.pdf' },
          originalFilename: { type: 'string', example: 'John_Doe_CV.pdf' },
          filePath: { type: 'string', example: 'uploads/cvs/cv_john_doe.pdf' },
          fileSize: { type: 'integer', example: 1024000 },
          mimeType: { type: 'string', example: 'application/pdf' },
          applicantName: { type: 'string', example: 'John Doe' },
          applicantEmail: { type: 'string', example: 'john.doe@email.com' },
          status: { type: 'string', enum: ['pending', 'submitted', 'reviewed', 'accepted', 'rejected'], example: 'pending' },
          extractedText: { type: 'string' },
          jobId: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AssessmentQuestion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          key: { type: 'string', example: 'work_style_environment' },
          type: { type: 'string', enum: ['multiple_choice', 'text', 'rating'], example: 'multiple_choice' },
          required: { type: 'boolean', example: true },
          title: { type: 'string', example: 'What is your preferred work style and environment?' },
          description: { type: 'string', example: 'Select the work arrangement that best suits your productivity and lifestyle.' },
          placeholder: { type: 'string', example: 'Enter your answer here...' },
          options: {
            type: 'array',
            items: { type: 'string' },
            example: ['Remote work from home', 'Traditional office environment', 'Hybrid (mix of remote and office)', 'Flexible arrangement based on project needs']
          },
          validation: {
            type: 'object',
            properties: {
              minLength: { type: 'integer', example: 50 },
              maxLength: { type: 'integer', example: 500 },
              options: {
                type: 'array',
                items: { type: 'string' },
                example: ['remote', 'office', 'hybrid', 'flexible']
              }
            }
          }
        }
      },
      AssessmentProgress: {
        type: 'object',
        properties: {
          assessmentId: { type: 'string', example: 'clx1234567890' },
          currentQuestion: { type: 'integer', example: 3 },
          totalQuestions: { type: 'integer', example: 6 },
          questionsCompleted: { type: 'integer', example: 2 },
          progress: { type: 'integer', example: 33 },
          isCompleted: { type: 'boolean', example: false },
          isExpired: { type: 'boolean', example: false },
          startedAt: { type: 'string', format: 'date-time' },
          lastActivityAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      QuestionnaireResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          submissionId: { type: 'string', example: 'clx1234567890' },
          cvSubmissionId: { type: 'integer', example: 1 },
          responses: {
            type: 'object',
            additionalProperties: true,
            example: {
              work_style_environment: 'hybrid',
              overtime_commitment: 'reasonable_notice',
              recognition_reward: 'career_advancement'
            }
          },
          currentQuestion: { type: 'integer', example: 4 },
          questionsCompleted: { type: 'integer', example: 3 },
          isCompleted: { type: 'boolean', example: false },
          languagePreference: { type: 'string', enum: ['en', 'vi'], example: 'en' },
          totalScore: { type: 'integer', example: 85, nullable: true },
          assessmentResult: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'], example: 'good', nullable: true },
          notes: { type: 'string', nullable: true },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          lastActivityAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object', additionalProperties: true }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'An error occurred' },
          error: { type: 'string', example: 'Detailed error message' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Jobs',
      description: 'Job listing and management endpoints'
    },
    {
      name: 'CV Submissions',
      description: 'CV upload and submission management endpoints'
    },
    {
      name: 'Assessment',
      description: 'Progressive assessment system endpoints'
    },
    {
      name: 'Management',
      description: 'Administrative endpoints for managing applications'
    }
  ]
}

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [
    './app/controllers/*.ts',
    './start/routes.ts',
    './docs/swagger/*.yaml',
    './app/models/*.ts' // Include models for better schema generation
  ],
  swaggerDefinition: {
    ...swaggerDefinition,
    // Additional swagger-jsdoc specific options
    basePath: '/',
    produces: ['application/json'],
    consumes: ['application/json', 'multipart/form-data']
  }
}

// Generate the swagger specification with error handling
export const swaggerSpec = (() => {
  try {
    const spec = swaggerJSDoc(options)
    console.log('✅ Swagger documentation generated successfully')
    return spec
  } catch (error) {
    console.error('❌ Failed to generate Swagger documentation:', error)
    // Return a minimal spec to prevent crashes
    return {
      openapi: '3.0.3',
      info: {
        title: 'TechVision HR Scanning API',
        version: '1.0.0',
        description: 'API documentation generation failed. Please check server logs.'
      },
      paths: {},
      components: {}
    }
  }
})()

/**
 * Setup function for Swagger integration
 * Can be used for additional middleware or configuration
 */
export function setupSwagger(_app: ApplicationService) {
  console.log('📚 Swagger documentation configured')
  console.log(`📖 API docs available at: ${env.get('APP_URL', 'http://localhost:3333')}/api/docs`)

  // Log available endpoints in development
  if (env.get('NODE_ENV') === 'development') {
    console.log('🔗 Swagger endpoints:')
    console.log('  - UI: /api/docs')
    console.log('  - JSON: /api/docs/json')
    console.log('  - YAML: /api/docs/yaml')
  }
}
