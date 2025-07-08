import { test } from '@japa/runner'
import sinon from 'sinon'
import { OpenAIService } from '#services/openai_service'
import {
  OpenAIMockManager,
  mockExtractedCvData,
  mockOpenAIErrors,
  sampleCvTexts,
} from '#tests/utils/openai_mocks'

test.group('OpenAI Service Error Scenarios', (group) => {
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

  test('should handle rate limiting with exponential backoff', async ({ assert }) => {
    // Mock rate limit error that succeeds on third attempt
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

    // Should have been called 3 times (2 failures + 1 success)
    assert.equal(mockStub.callCount, 3)
  })

  test('should fail after maximum retry attempts', async ({ assert }) => {
    // Mock persistent rate limit error
    const mockStub = mockManager.mockErrorResponse(mockOpenAIErrors.rateLimitError)
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Rate limit exceeded')
    assert.isDefined(result.processingTime)

    // Should have attempted maximum retries (3 attempts)
    assert.equal(mockStub.callCount, 3)
  })

  test('should handle timeout errors', async ({ assert }) => {
    // Mock timeout error
    const mockStub = mockManager.mockErrorResponse(mockOpenAIErrors.timeoutError)
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Request timeout')
    assert.isDefined(result.processingTime)
  })

  test('should handle invalid API key errors', async ({ assert }) => {
    // Mock invalid API key error
    const mockStub = mockManager.mockErrorResponse(mockOpenAIErrors.invalidApiKeyError)
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Invalid API key')
    assert.isDefined(result.processingTime)
  })

  test('should handle malformed JSON responses', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock malformed JSON response
    const mockStub = mockManager.mockMalformedJsonResponse()

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'JSON')
    assert.isDefined(result.processingTime)

    // Should not retry on JSON parsing errors
    assert.equal(mockStub.callCount, 1)
  })

  test('should handle empty responses from OpenAI', async ({ assert }) => {
    // Mock empty response
    const mockStub = mockManager.mockEmptyResponse()
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'No content received from OpenAI')
    assert.isDefined(result.processingTime)
  })

  test('should handle responses with invalid data structure', async ({ assert }) => {
    // Mock response with invalid data structure
    const invalidResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              PersonalInformation: null, // Invalid - should be object
              Skills: 'invalid', // Invalid - should be object with Technical/Soft arrays
            }),
          },
        },
      ],
      usage: {
        total_tokens: 100,
      },
    }

    const mockStub = sinon.stub().resolves(invalidResponse)
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Missing required property')
    assert.isDefined(result.processingTime)

    // Should retry on validation errors (it's treated as a retryable error)
    assert.equal(mockStub.callCount, 3)
  })

  test('should handle network connectivity issues', async ({ assert }) => {
    // Mock network error
    const networkError = new Error('Network request failed')
    const mockStub = mockManager.mockErrorResponse(networkError)
    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isFalse(result.success)
    assert.include(result.error!, 'Network request failed')
    assert.isDefined(result.processingTime)

    // Should retry on network errors
    assert.equal(mockStub.callCount, 3)
  })

  test('should handle mixed error scenarios in retry sequence', async ({ assert }) => {
    // Create a stub that fails with different errors then succeeds
    const mockStub = sinon.stub()
    mockStub.onCall(0).rejects(mockOpenAIErrors.rateLimitError)
    mockStub.onCall(1).rejects(mockOpenAIErrors.timeoutError)
    mockStub.onCall(2).resolves({
      choices: [{ message: { content: JSON.stringify(mockExtractedCvData) } }],
      usage: { total_tokens: 1800 },
    })

    const service = mockManager.createMockService(mockStub)

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.PersonalInformation.Name, 'John Doe')
    assert.equal(result.tokensUsed, 1800)

    // Should have been called 3 times
    assert.equal(mockStub.callCount, 3)
  })

  test('should handle very large token usage', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock response with high token usage
    const highTokenResponse = {
      choices: [{ message: { content: JSON.stringify(mockExtractedCvData) } }],
      usage: { total_tokens: 8000 }, // High token usage
    }

    const mockStub = sinon.stub().resolves(highTokenResponse)

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.tokensUsed, 8000)
    assert.isDefined(result.processingTime)
  })

  test('should handle zero token usage', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock response with zero token usage
    const zeroTokenResponse = {
      choices: [{ message: { content: JSON.stringify(mockExtractedCvData) } }],
      usage: { total_tokens: 0 },
    }

    const mockStub = sinon.stub().resolves(zeroTokenResponse)

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.tokensUsed, 0)
  })

  test('should handle missing usage information', async ({ assert }) => {
    const service = new OpenAIService()

    // Mock response without usage information
    const noUsageResponse = {
      choices: [{ message: { content: JSON.stringify(mockExtractedCvData) } }],
      // Missing usage property
    }

    const mockStub = sinon.stub().resolves(noUsageResponse)

    // Replace the OpenAI client's method
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.tokensUsed, 0) // Should default to 0
  })
})
