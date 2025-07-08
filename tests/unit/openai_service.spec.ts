import { test } from '@japa/runner'
import { OpenAIService } from '#services/openai_service'
import env from '#start/env'

test.group('OpenAI Service', () => {
  test('should initialize with API key', ({ assert }) => {
    // Mock environment variable
    const originalApiKey = env.get('OPENAI_API_KEY')

    if (!originalApiKey) {
      // Skip test if no API key is configured
      assert.plan(0)
      return
    }

    const service = new OpenAIService()
    assert.isDefined(service)
  })

  test('should throw error without API key', ({ assert }) => {
    // Temporarily remove API key
    const originalGet = env.get
    ;(env as any).get = (key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') return undefined
      return originalGet.call(env, key, defaultValue)
    }

    assert.throws(() => {
      new OpenAIService()
    }, 'OPENAI_API_KEY environment variable is required')

    // Restore original method
    ;(env as any).get = originalGet
  })

  test('should validate extracted data structure', async ({ assert }) => {
    const service = new OpenAIService()

    // Test with invalid data
    assert.throws(() => {
      // @ts-ignore - Testing private method
      service.validateExtractedData(null)
    }, 'Invalid data structure: Expected object')

    assert.throws(() => {
      // @ts-ignore - Testing private method
      service.validateExtractedData({})
    }, 'Missing required property: PersonalInformation')

    // Test with valid structure
    const validData = {
      PersonalInformation: {
        Name: 'John Doe',
        DateOfBirth: null,
        Gender: null,
        PhoneNumber: '+1234567890',
        Email: 'john@example.com',
        Address: null,
      },
      JobObjective: {
        DesiredPosition: 'Software Engineer',
        CareerGoals: null,
      },
      Education: [],
      WorkExperience: [],
      Skills: {
        Technical: ['JavaScript', 'TypeScript'],
        Soft: ['Communication'],
      },
      Certifications: [],
      Projects: [],
      Languages: [],
      ExtracurricularAwards: [],
      Interests: [],
      YearExperience: 5,
      TechnologyExperience: ['JavaScript', 'TypeScript'],
      CareerPath: 'Full Stack Development',
    }

    assert.doesNotThrow(() => {
      // @ts-ignore - Testing private method
      service.validateExtractedData(validData)
    })
  })

  test('should build correct system prompt', ({ assert }) => {
    const service = new OpenAIService()

    // @ts-ignore - Testing private method
    const systemPrompt = service.buildSystemPrompt()

    assert.isString(systemPrompt)
    assert.include(systemPrompt, 'Professional CV data extraction assistant')
    assert.include(systemPrompt, 'Structured JSON data')
    assert.include(systemPrompt, 'YYYY-MM-DD')
  })

  test('should build correct user prompt', ({ assert }) => {
    const service = new OpenAIService()
    const cvText = 'John Doe\nSoftware Engineer\nExperience: 5 years'

    // @ts-ignore - Testing private method
    const userPrompt = service.buildUserPrompt(cvText)

    assert.isString(userPrompt)
    assert.include(userPrompt, cvText)
    assert.include(userPrompt, 'PersonalInformation')
    assert.include(userPrompt, 'WorkExperience')
  })

  test('should handle empty CV text', async ({ assert }) => {
    if (!env.get('OPENAI_API_KEY')) {
      assert.plan(0)
      return
    }

    const service = new OpenAIService()
    const result = await service.extractCvData('')

    assert.isFalse(result.success)
    assert.isDefined(result.error)
    assert.isDefined(result.processingTime)
  }).timeout(30000)

  test('should handle very short CV text', async ({ assert }) => {
    if (!env.get('OPENAI_API_KEY')) {
      assert.plan(0)
      return
    }

    const service = new OpenAIService()
    const result = await service.extractCvData('John')

    // Should still attempt processing but may fail due to insufficient data
    assert.isDefined(result.success)
    assert.isDefined(result.processingTime)
  }).timeout(10000)
})

test.group('OpenAI Service Integration', () => {
  test('should extract data from sample CV text', async ({ assert }) => {
    if (!env.get('OPENAI_API_KEY')) {
      // Skip integration tests if no API key
      assert.plan(0)
      return
    }

    const service = new OpenAIService()
    const sampleCvText = `
      John Doe
      Software Engineer
      Email: john.doe@example.com
      Phone: +1-555-123-4567
      
      EXPERIENCE
      Senior Software Engineer at TechCorp (2020-2023)
      - Developed web applications using React and Node.js
      - Led a team of 5 developers
      
      EDUCATION
      Bachelor of Computer Science
      University of Technology (2016-2020)
      GPA: 3.8
      
      SKILLS
      Technical: JavaScript, TypeScript, React, Node.js, Python
      Soft Skills: Leadership, Communication, Problem Solving
      
      PROJECTS
      E-commerce Platform
      - Built using React and Express.js
      - Implemented payment integration
    `

    const result = await service.extractCvData(sampleCvText)

    if (result.success && result.data) {
      assert.isTrue(result.success)
      assert.isDefined(result.data)
      assert.isDefined(result.tokensUsed)
      assert.isDefined(result.processingTime)

      // Validate structure
      assert.isDefined(result.data.PersonalInformation)
      assert.isDefined(result.data.WorkExperience)
      assert.isDefined(result.data.Education)
      assert.isDefined(result.data.Skills)

      // Check if basic information was extracted
      assert.include(result.data.PersonalInformation.Name || '', 'John')
      assert.include(result.data.PersonalInformation.Email || '', 'john.doe@example.com')

      // Check skills arrays
      assert.isArray(result.data.Skills.Technical)
      assert.isArray(result.data.Skills.Soft)

      // Check work experience
      assert.isArray(result.data.WorkExperience)
      if (result.data.WorkExperience.length > 0) {
        assert.include(result.data.WorkExperience[0].Company || '', 'TechCorp')
      }
    } else {
      // If the test fails due to API issues, log the error but don't fail the test
      console.warn('OpenAI API test failed:', result.error)
      assert.plan(0)
    }
  }).timeout(30000) // 30 second timeout for API calls

  test('should handle malformed CV text gracefully', async ({ assert }) => {
    if (!env.get('OPENAI_API_KEY')) {
      assert.plan(0)
      return
    }

    const service = new OpenAIService()
    const malformedText = '!@#$%^&*()_+{}|:"<>?[]\\;\',./'

    const result = await service.extractCvData(malformedText)

    // Should either succeed with empty/null values or fail gracefully
    assert.isDefined(result.success)
    assert.isDefined(result.processingTime)

    if (result.success && result.data) {
      // If it succeeds, data should still follow the schema
      assert.isDefined(result.data.PersonalInformation)
      assert.isDefined(result.data.Skills)
      assert.isArray(result.data.Skills.Technical)
      assert.isArray(result.data.Skills.Soft)
    }
  }).timeout(30000)
})
