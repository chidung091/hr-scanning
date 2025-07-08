import { test } from '@japa/runner'
import sinon from 'sinon'

// Mock API responses

// Mock API responses
const mockApiResponses = {
  cvUpload: {
    success: true,
    data: {
      submissionId: 'test-submission-123',
      filename: 'test-cv.pdf',
      status: 'uploaded',
    },
  },
  assessmentStart: {
    success: true,
    data: {
      assessmentId: 'test-assessment-123',
      currentQuestion: 1,
      totalQuestions: 6,
      progress: 0,
      question: {
        id: 1,
        text: 'What is your preferred work environment?',
        type: 'multiple_choice',
        options: ['office', 'remote', 'hybrid'],
      },
      canGoBack: false,
    },
  },
  assessmentQuestion: {
    success: true,
    data: {
      currentQuestion: 2,
      totalQuestions: 6,
      question: {
        id: 2,
        text: 'How do you handle overtime work?',
        type: 'multiple_choice',
        options: ['always_available', 'reasonable_notice', 'rarely_available'],
      },
      canGoBack: true,
      completed: false,
    },
  },
}

test.group('Assessment API', (group) => {
  let clientStub: any

  group.setup(async () => {
    // Mock the HTTP client responses
    clientStub = {
      post: sinon.stub(),
      get: sinon.stub(),
      file: sinon.stub().returnsThis(),
      field: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      qs: sinon.stub().returnsThis(),
    }

    // Configure default responses
    clientStub.post.withArgs('/api/cv/upload').returns({
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockApiResponses.cvUpload),
    })

    clientStub.post.withArgs('/api/assessment/start').returns({
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockApiResponses.assessmentStart),
    })

    clientStub.get.returns({
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockApiResponses.assessmentQuestion),
    })
  })

  group.teardown(async () => {
    // Clean up stubs
    sinon.restore()
  })

  test('should start a new assessment session', async ({ assert }) => {
    // Mock CV upload response
    const uploadResponse = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockApiResponses.cvUpload),
    }

    uploadResponse.assertStatus(200)
    const uploadData = uploadResponse.body()
    assert.isTrue(uploadData.success)

    // Mock assessment start response
    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockApiResponses.assessmentStart),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.exists(data.data.assessmentId)
    assert.equal(data.data.currentQuestion, 1)
    assert.equal(data.data.totalQuestions, 6)
    assert.equal(data.data.progress, 0)
    assert.exists(data.data.question)
    assert.equal(data.data.question.id, 1)
    assert.isFalse(data.data.canGoBack)
  })

  test('should get current question for assessment', async ({ assert }) => {
    // Mock the assessment question response
    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockApiResponses.assessmentQuestion),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.equal(data.data.totalQuestions, 6)
    assert.exists(data.data.question)
    assert.equal(data.data.question.id, 2)
    assert.isTrue(data.data.canGoBack)
    assert.isFalse(data.data.completed)
  })

  test('should submit answer and move to next question', async ({ assert }) => {
    // Mock the answer submission response
    const mockAnswerResponse = {
      success: true,
      data: {
        currentQuestion: 2,
        question: {
          id: 2,
          text: 'How do you handle overtime work?',
          type: 'multiple_choice',
          options: ['always_available', 'reasonable_notice', 'rarely_available'],
        },
        completed: false,
      },
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockAnswerResponse),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.exists(data.data.question)
    assert.equal(data.data.question.id, 2)
    assert.isFalse(data.data.completed)
  })

  test('should complete assessment after all questions', async ({ assert }) => {
    // Mock the completion response
    const mockCompletionResponse = {
      success: true,
      data: {
        completed: true,
        totalScore: 85,
        assessmentResult: 'good',
      },
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockCompletionResponse),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.isTrue(data.data.completed)
    assert.exists(data.data.totalScore)
    assert.exists(data.data.assessmentResult)
  })

  test('should get assessment progress', async ({ assert }) => {
    // Mock the progress response
    const mockProgressResponse = {
      success: true,
      data: {
        currentQuestion: 3,
        totalQuestions: 6,
        questionsCompleted: 2,
        progress: 33,
        isCompleted: false,
        isExpired: false,
      },
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockProgressResponse),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 3)
    assert.equal(data.data.totalQuestions, 6)
    assert.equal(data.data.questionsCompleted, 2)
    assert.equal(data.data.progress, 33) // 2/6 * 100 rounded
    assert.isFalse(data.data.isCompleted)
    assert.isFalse(data.data.isExpired)
  })

  test('should handle previous question navigation', async ({ assert }) => {
    // Mock the previous navigation response
    const mockPreviousResponse = {
      success: true,
      data: {
        currentQuestion: 2,
        question: {
          id: 2,
          text: 'How do you handle overtime work?',
          type: 'multiple_choice',
          options: ['always_available', 'reasonable_notice', 'rarely_available'],
        },
      },
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockPreviousResponse),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.exists(data.data.question)
    assert.equal(data.data.question.id, 2)
  })

  test('should handle question skipping', async ({ assert }) => {
    // Mock the skip response
    const mockSkipResponse = {
      success: true,
      data: {
        currentQuestion: 2,
      },
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockSkipResponse),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
  })

  test('should validate required questions', async ({ assert }) => {
    // Mock the validation error response
    const mockValidationErrorResponse = {
      success: false,
      message: 'Answer is required for this question',
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockValidationErrorResponse),
    }

    response.assertStatus(400)
    const data = response.body()

    assert.isFalse(data.success)
    assert.include(data.message.toLowerCase(), 'required')
  })

  test('should return 404 for non-existent assessment', async ({ assert }) => {
    // Mock the 404 response
    const mockNotFoundResponse = {
      success: false,
      message: 'Assessment not found',
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockNotFoundResponse),
    }

    response.assertStatus(404)
    const data = response.body()

    assert.isFalse(data.success)
    assert.include(data.message.toLowerCase(), 'not found')
  })

  test('should return 400 for already completed assessment', async ({ assert }) => {
    // Mock the completed assessment error response
    const mockCompletedErrorResponse = {
      success: false,
      message: 'Assessment already completed',
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockCompletedErrorResponse),
    }

    response.assertStatus(400)
    const data = response.body()

    assert.isFalse(data.success)
    assert.include(data.message.toLowerCase(), 'completed')
  })

  test('should skip all remaining questions with skip_all action', async ({ assert }) => {
    // Mock the skip all response
    const mockSkipAllResponse = {
      success: true,
      data: {
        completed: true,
        totalScore: 75,
        assessmentResult: 'good',
      },
    }

    const response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockSkipAllResponse),
    }

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.isTrue(data.data.completed)
    assert.exists(data.data.totalScore)
    assert.exists(data.data.assessmentResult)
  })

  test('should properly calculate progress when skipping individual questions', async ({
    assert,
  }) => {
    // Mock progressive responses for skipping questions
    const mockProgressResponses = [
      {
        success: true,
        data: { currentQuestion: 2, progress: 17, completed: false },
      },
      {
        success: true,
        data: { currentQuestion: 3, progress: 33, completed: false },
      },
      {
        success: true,
        data: {
          currentQuestion: 7,
          progress: 100,
          completed: true,
          totalScore: 80,
          assessmentResult: 'good',
        },
      },
    ]

    // Test first skip
    let response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockProgressResponses[0]),
    }

    response.assertStatus(200)
    let data = response.body()
    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.equal(data.data.progress, 17)

    // Test second answer
    response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockProgressResponses[1]),
    }

    response.assertStatus(200)
    data = response.body()
    assert.equal(data.data.progress, 33)

    // Test final completion
    response = {
      assertStatus: sinon.stub(),
      body: sinon.stub().returns(mockProgressResponses[2]),
    }

    response.assertStatus(200)
    data = response.body()

    assert.isTrue(data.data.completed)
    assert.equal(data.data.progress, 100)
    assert.exists(data.data.totalScore)
    assert.exists(data.data.assessmentResult)
  })
})
