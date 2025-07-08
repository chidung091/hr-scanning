import { test } from '@japa/runner'
import sinon from 'sinon'
import { OpenAIService } from '#services/openai_service'
import env from '#start/env'
import {
  OpenAIMockManager,
  mockExtractedCvData,
  mockMinimalCvData,
  mockOpenAIErrors,
  sampleCvTexts,
} from '#tests/utils/openai_mocks'

test.group('OpenAI Service', (group) => {
  let mockManager: OpenAIMockManager

  group.setup(() => {
    mockManager = new OpenAIMockManager()
  })

  group.teardown(() => {
    mockManager.restore()
  })

  group.each.teardown(() => {
    mockManager.restore()
  })

  test('should initialize with API key', ({ assert }) => {
    const service = new OpenAIService()
    assert.isDefined(service)
  })

  test('should throw error without API key', ({ assert }) => {
    // Temporarily remove API key by restoring and re-stubbing
    sinon.restore()
    const noKeyStub = sinon.stub(env, 'get').callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') return undefined
      return defaultValue
    })

    assert.throws(() => {
      new OpenAIService()
    }, 'OPENAI_API_KEY environment variable is required')

    // Restore for other tests
    noKeyStub.restore()
    sinon.stub(env, 'get').callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') return 'test-api-key'
      return defaultValue
    })
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
    const service = new OpenAIService()
    const result = await service.extractCvData('')

    assert.isFalse(result.success)
    assert.include(result.error!, 'empty or contains no meaningful content')
    assert.isDefined(result.processingTime)
    assert.equal(result.tokensUsed, 0)
  })

  test('should handle very short CV text with mocked response', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock successful response for minimal data
    const mockStub = mockManager.mockSuccessfulResponse(mockMinimalCvData, 500)

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.minimal)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.PersonalInformation.Name, 'Jane Smith')
    assert.isDefined(result.processingTime)
    assert.equal(result.tokensUsed, 500)
  })

  test('should handle OpenAI API errors with retry', async ({ assert }) => {
    // Mock response that fails twice then succeeds
    const mockStub = mockManager.mockResponseWithRetries(
      2,
      mockExtractedCvData,
      mockOpenAIErrors.rateLimitError
    )
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.PersonalInformation.Name, 'John Doe')
    assert.isDefined(result.tokensUsed)
  })

  test('should fail after max retries', async ({ assert }) => {
    // Mock response that always fails
    const mockStub = mockManager.mockErrorResponse(mockOpenAIErrors.rateLimitError)
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Rate limit exceeded')
    assert.isDefined(result.processingTime)
  })

  test('should handle malformed JSON response', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock malformed JSON response
    const mockStub = mockManager.mockMalformedJsonResponse()

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'JSON')
    assert.isDefined(result.processingTime)
  })

  test('should handle empty OpenAI response', async ({ assert }) => {
    // Mock empty response
    const mockStub = mockManager.mockEmptyResponse()
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'No content received from OpenAI')
    assert.isDefined(result.processingTime)
  })
})

test.group('OpenAI Service Mocked Integration', (group) => {
  let mockManager: OpenAIMockManager

  group.setup(() => {
    mockManager = new OpenAIMockManager()
  })

  group.teardown(() => {
    mockManager.restore()
  })

  group.each.teardown(() => {
    mockManager.restore()
  })

  test('should extract data from comprehensive CV text', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock successful response with comprehensive data
    const mockStub = mockManager.mockSuccessfulResponse(mockExtractedCvData, 2000)

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.isDefined(result.tokensUsed)
    assert.isDefined(result.processingTime)

    // Validate structure
    assert.isDefined(result.data!.PersonalInformation)
    assert.isDefined(result.data!.WorkExperience)
    assert.isDefined(result.data!.Education)
    assert.isDefined(result.data!.Skills)

    // Check if basic information was extracted
    assert.equal(result.data!.PersonalInformation.Name, 'John Doe')
    assert.equal(result.data!.PersonalInformation.Email, 'john.doe@email.com')

    // Check skills arrays
    assert.isArray(result.data!.Skills.Technical)
    assert.isArray(result.data!.Skills.Soft)
    assert.include(result.data!.Skills.Technical, 'JavaScript')
    assert.include(result.data!.Skills.Soft, 'Leadership')

    // Check work experience
    assert.isArray(result.data!.WorkExperience)
    assert.isAtLeast(result.data!.WorkExperience.length, 1)
    assert.equal(result.data!.WorkExperience[0].Company, 'TechCorp Inc')

    // Check token usage
    assert.equal(result.tokensUsed, 2000)
  })

  test('should handle malformed CV text gracefully', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock response with minimal data for malformed input
    const mockStub = mockManager.mockSuccessfulResponse(mockMinimalCvData, 300)

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.malformed)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.isDefined(result.processingTime)

    // Should still follow the schema even with malformed input
    assert.isDefined(result.data!.PersonalInformation)
    assert.isDefined(result.data!.Skills)
    assert.isArray(result.data!.Skills.Technical)
    assert.isArray(result.data!.Skills.Soft)

    // Should have minimal data
    assert.equal(result.data!.PersonalInformation.Name, 'Jane Smith')
    assert.equal(result.tokensUsed, 300)
  })

  test('should validate response data structure', async ({ assert }) => {
    // Mock response with invalid data structure
    const invalidData = {
      PersonalInformation: null, // Invalid structure
      Skills: { Technical: [], Soft: [] },
    }

    const mockStub = sinon.stub().resolves({
      choices: [{ message: { content: JSON.stringify(invalidData) } }],
      usage: { total_tokens: 100 },
    })

    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Missing required property')
    assert.isDefined(result.processingTime)
  })
})
