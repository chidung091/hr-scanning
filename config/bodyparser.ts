import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  /**
   * The bodyparser middleware will parse the request body for the following
   * HTTP methods.
   */
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Config for the JSON parser
   */
  json: {
    encoding: 'utf8',
    limit: '1mb',
    strict: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  /**
   * Config for the URL encoded parser
   */
  form: {
    encoding: 'utf8',
    limit: '1mb',
    queryString: {},
    types: ['application/x-www-form-urlencoded'],
  },

  /**
   * Config for the multipart parser
   */
  multipart: {
    autoProcess: true,
    processManually: [],
    encoding: 'utf8',
    maxFields: 1000,
    limit: '20mb',
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
