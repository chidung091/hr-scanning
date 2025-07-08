# HR Scanning Project - Test Suite

This document describes the testing approach and mocking strategy for the HR Scanning project, particularly for OpenAI API integrations.

## Overview

The test suite is designed to run without making real API calls to external services like OpenAI. This approach provides:

- **Faster test execution** - No network latency or API response times
- **Reliable tests** - No dependency on external service availability
- **Cost efficiency** - No API credits consumed during testing
- **Predictable results** - Consistent test outcomes regardless of external factors
- **Comprehensive coverage** - Test both success and error scenarios easily

## Testing Framework

- **Test Runner**: Japa (AdonisJS testing framework)
- **Mocking Library**: Sinon.js for stubbing and mocking
- **Database**: PostgreSQL with transaction rollback for test isolation
- **Test Types**: Unit tests and functional tests

## OpenAI API Mocking Strategy

### Mock Utilities

The `tests/utils/openai_mocks.ts` file provides comprehensive mocking utilities:

#### Key Components

1. **Sample Data**: Pre-defined CV data structures for consistent testing
   - `mockExtractedCvData`: Comprehensive CV data with all fields populated
   - `mockMinimalCvData`: Minimal CV data for edge case testing
   - `sampleCvTexts`: Various CV text samples (comprehensive, minimal, malformed, empty)

2. **OpenAIMockManager**: Central class for managing OpenAI API mocks
   - `mockSuccessfulResponse()`: Mock successful API responses
   - `mockErrorResponse()`: Mock various error scenarios
   - `mockResponseWithRetries()`: Mock retry behavior
   - `mockMalformedJsonResponse()`: Mock invalid JSON responses
   - `mockEmptyResponse()`: Mock empty responses

3. **Error Scenarios**: Pre-defined error types
   - Rate limiting errors
   - Timeout errors
   - Invalid API key errors
   - Network connectivity issues
   - JSON parsing errors
   - Validation errors

### Usage Examples

#### Basic Mocking in Tests

```typescript
import { OpenAIMockManager, mockExtractedCvData } from '#tests/utils/openai_mocks'

test.group('My Test Group', (group) => {
  let mockManager: OpenAIMockManager

  group.setup(() => {
    mockManager = new OpenAIMockManager()
  })

  group.teardown(() => {
    mockManager.restore()
  })

  test('should process CV successfully', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Mock successful response
    const mockStub = mockManager.mockSuccessfulResponse(mockExtractedCvData, 1500)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData('sample cv text')
    
    assert.isTrue(result.success)
    assert.equal(result.tokensUsed, 1500)
  })
})
```

#### Mocking Service Dependencies

```typescript
import sinon from 'sinon'
import openaiService from '#services/openai_service'

test('should handle OpenAI service failure', async ({ assert }) => {
  // Mock the service method directly
  const openaiStub = sinon.stub(openaiService, 'extractCvData').resolves({
    success: false,
    error: 'API rate limit exceeded',
    processingTime: 1000,
  })

  // Your test logic here
  
  // Clean up
  openaiStub.restore()
})
```

## Test Structure

### Unit Tests

Located in `tests/unit/`, these test individual components in isolation:

- `openai_service.spec.ts`: Core OpenAI service functionality
- `openai_error_scenarios.spec.ts`: Error handling and retry logic
- `cv_data_scenarios.spec.ts`: Various CV data structure scenarios
- `cv_processing_service.spec.ts`: CV processing workflow
- `processed_cv_model.spec.ts`: Database model tests

### Functional Tests

Located in `tests/functional/`, these test complete workflows:

- `assessment.spec.ts`: End-to-end assessment workflow
- `mobile_ui.spec.ts`: UI responsiveness tests

## Test Scenarios Covered

### OpenAI Service Tests

1. **Success Scenarios**
   - Comprehensive CV data extraction
   - Minimal CV data handling
   - Various CV structures (academic, international, project-heavy)

2. **Error Scenarios**
   - Rate limiting with exponential backoff
   - Timeout errors
   - Invalid API key
   - Malformed JSON responses
   - Empty responses
   - Network connectivity issues
   - Data validation failures

3. **Edge Cases**
   - Empty CV text
   - Very short CV text
   - Malformed CV text
   - High token usage
   - Zero token usage
   - Missing usage information

### CV Processing Service Tests

1. **Workflow Tests**
   - Successful processing with mocked OpenAI
   - OpenAI processing failures
   - Batch processing with mixed results
   - Retry logic and maximum attempts

2. **Data Handling**
   - CV submissions without extracted text
   - Non-existent CV submissions
   - Already processed CVs
   - Processing statistics

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm test -- --grep "unit"
```

### Specific Test File
```bash
npm test tests/unit/openai_service.spec.ts
```

### With Coverage
```bash
npm test -- --coverage
```

## Best Practices

### 1. Always Mock External APIs
- Never make real API calls in tests
- Use the provided mock utilities for consistency
- Test both success and failure scenarios

### 2. Test Isolation
- Each test should be independent
- Use database transactions that rollback after each test
- Clean up mocks and stubs in teardown hooks

### 3. Comprehensive Coverage
- Test happy paths and edge cases
- Include error scenarios and retry logic
- Validate data structures and business logic

### 4. Maintainable Tests
- Use descriptive test names
- Group related tests logically
- Keep test data in reusable fixtures

### 5. Performance
- Mock external dependencies to keep tests fast
- Use appropriate timeouts for async operations
- Avoid unnecessary database operations

## Debugging Tests

### Common Issues

1. **Stub not being called**: Ensure the stub is properly attached to the service instance
2. **Database state**: Check if transactions are properly rolled back
3. **Mock cleanup**: Ensure mocks are restored in teardown hooks
4. **Async operations**: Use proper async/await patterns

### Debugging Tips

- Use `console.log()` to inspect mock call counts and arguments
- Check stub call history with `stub.callCount` and `stub.getCall(0).args`
- Verify database state with direct queries in tests
- Use test timeouts appropriately for async operations

## Contributing

When adding new tests:

1. Follow the existing mocking patterns
2. Add new mock data to `openai_mocks.ts` if needed
3. Include both success and error scenarios
4. Update this documentation for new testing patterns
5. Ensure tests are fast and reliable

## Future Improvements

- Add integration tests with test database
- Implement visual regression testing for UI components
- Add performance benchmarking tests
- Consider contract testing for API integrations
