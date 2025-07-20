import path from 'node:path'
import url from 'node:url'

export default {
  // Path configuration for AdonisJS v6
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',

  // API Information
  info: {
    title: 'Japanese Learning Quiz API',
    version: '1.0.0',
    description:
      'Interactive Japanese character learning application with Hiragana and Katakana quizzes featuring health/lives system',
    contact: {
      name: 'Japanese Learning Quiz',
      email: 'support@japanese-quiz.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },

  // Configuration
  tagIndex: 2,
  productionEnv: 'production',
  snakeCase: true,
  debug: false,

  // Routes to ignore
  ignore: ['/swagger', '/docs', '/'],

  // Prefer PUT over PATCH when both are available
  preferredPutPatch: 'PUT',

  // Common parameters and headers
  common: {
    parameters: {
      sessionId: [
        {
          in: 'path',
          name: 'sessionId',
          required: true,
          schema: {
            type: 'string',
            example: 'abc123def456ghi789',
          },
          description: 'Unique quiz session identifier',
        },
      ],
    },
    headers: {
      quiz: {
        'X-Quiz-Session': {
          description: 'Quiz session identifier',
          schema: { type: 'string', example: 'abc123def456ghi789' },
        },
        'X-Hearts-Remaining': {
          description: 'Number of hearts/lives remaining',
          schema: { type: 'integer', example: 2 },
        },
      },
    },
  },

  // Security schemes
  securitySchemes: {
    SessionAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'X-Quiz-Session',
      description: 'Quiz session identifier for maintaining game state',
    },
  },

  // Default security scheme
  defaultSecurityScheme: 'SessionAuth',

  // Persist authorization between reloads
  persistAuthorization: true,

  // Show full path in endpoint summary
  showFullPath: false,
}
