import { test } from '@japa/runner'
import CvSubmission from '#models/cv_submission'
import QuestionnaireResponse from '#models/questionnaire_response'
import Job from '#models/job'
import { DateTime } from 'luxon'

test.group('Assessment API', (group) => {
  let testJob: Job
  let testSubmission: CvSubmission

  group.setup(async () => {
    // Create a test job
    testJob = await Job.create({
      jobTitle: 'Test Software Engineer',
      numberOfEmployees: 1,
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      workingTime: 'Full-time',
      workLocation: 'Remote',
      salaryRange: '$100k - $150k',
      responsibilities: 'Test responsibilities',
      requirements: 'Test requirements',
      isActive: true,
      sortOrder: 0,
    })
  })

  group.teardown(async () => {
    // Clean up test data
    await QuestionnaireResponse.query().delete()
    await CvSubmission.query().delete()
    await Job.query().delete()
  })

  test('should start a new assessment session', async ({ client, assert }) => {
    // First create a CV submission with a mock PDF file
    const testFileContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF'
    )

    const uploadResponse = await client
      .post('/api/cv/upload')
      .file('cv_file', testFileContent, { filename: 'test-cv.pdf' })
      .field('applicant_name', 'John Doe')
      .field('applicant_email', 'john.doe@test.com')
      .field('job_id', testJob.id.toString())

    uploadResponse.assertStatus(200)
    const uploadData = uploadResponse.body()
    assert.isTrue(uploadData.success)

    const submissionId = uploadData.data.submissionId

    // Start assessment
    const response = await client.post('/api/assessment/start').json({
      submission_id: submissionId,
      language: 'en',
    })

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

  test('should get current question for assessment', async ({ client, assert }) => {
    // Create test submission and assessment
    testSubmission = await CvSubmission.create({
      submissionId: 'test-submission-123',
      filename: 'test-cv.pdf',
      originalFilename: 'test-cv.pdf',
      filePath: 'uploads/test-cv.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      applicantName: 'Jane Doe',
      applicantEmail: 'jane.doe@test.com',
      status: 'pending',
      jobId: testJob.id,
    })

    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-assessment-123',
      cvSubmissionId: testSubmission.id,
      responses: {},
      currentQuestion: 2,
      questionsCompleted: 1,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .get(`/api/assessment/${questionnaireResponse.submissionId}/question`)
      .qs({ language: 'en' })

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

  test('should submit answer and move to next question', async ({ client, assert }) => {
    // Create test assessment
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-assessment-456',
      cvSubmissionId: testSubmission.id,
      responses: {},
      currentQuestion: 1,
      questionsCompleted: 0,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 1,
        answer: 'hybrid',
        action: 'next',
      })

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.exists(data.data.question)
    assert.equal(data.data.question.id, 2)
    assert.isFalse(data.data.completed)

    // Verify the response was saved
    await questionnaireResponse.refresh()
    assert.equal(questionnaireResponse.questionsCompleted, 1)
    assert.equal(questionnaireResponse.responses.work_style_environment, 'hybrid')
  })

  test('should complete assessment after all questions', async ({ client, assert }) => {
    // Create assessment with 5 questions completed
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-assessment-789',
      cvSubmissionId: testSubmission.id,
      responses: {
        work_style_environment: 'hybrid',
        overtime_commitment: 'reasonable_notice',
        recognition_reward: 'career_advancement',
        feedback_communication: 'embrace_learn',
        learning_growth: 'This is a test answer for learning and growth opportunities.',
      },
      currentQuestion: 6,
      questionsCompleted: 5,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 6,
        answer: 'growth_opportunities',
        action: 'next',
      })

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.isTrue(data.data.completed)
    assert.exists(data.data.totalScore)
    assert.exists(data.data.assessmentResult)

    // Verify the assessment is marked as completed
    await questionnaireResponse.refresh()
    assert.isTrue(questionnaireResponse.isCompleted)
    assert.exists(questionnaireResponse.completedAt)
    assert.exists(questionnaireResponse.totalScore)
    assert.exists(questionnaireResponse.assessmentResult)
  })

  test('should get assessment progress', async ({ client, assert }) => {
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-progress-123',
      cvSubmissionId: testSubmission.id,
      responses: { work_style_environment: 'remote' },
      currentQuestion: 3,
      questionsCompleted: 2,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client.get(
      `/api/assessment/${questionnaireResponse.submissionId}/progress`
    )

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

  test('should handle previous question navigation', async ({ client, assert }) => {
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-previous-123',
      cvSubmissionId: testSubmission.id,
      responses: { work_style_environment: 'office' },
      currentQuestion: 3,
      questionsCompleted: 2,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 3,
        answer: null,
        action: 'previous',
      })

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.exists(data.data.question)
    assert.equal(data.data.question.id, 2)
  })

  test('should handle question skipping', async ({ client, assert }) => {
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-skip-123',
      cvSubmissionId: testSubmission.id,
      responses: {},
      currentQuestion: 1,
      questionsCompleted: 0,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 1,
        answer: null,
        action: 'skip',
      })

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)

    // Verify no answer was saved for skipped question
    await questionnaireResponse.refresh()
    assert.isUndefined(questionnaireResponse.responses.work_style_environment)
  })

  test('should validate required questions', async ({ client, assert }) => {
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-validation-123',
      cvSubmissionId: testSubmission.id,
      responses: {},
      currentQuestion: 1,
      questionsCompleted: 0,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 1,
        answer: '', // Empty answer for required question
        action: 'next',
      })

    response.assertStatus(400)
    const data = response.body()

    assert.isFalse(data.success)
    assert.include(data.message.toLowerCase(), 'required')
  })

  test('should return 404 for non-existent assessment', async ({ client, assert }) => {
    const response = await client.get('/api/assessment/non-existent-id/question')

    response.assertStatus(404)
    const data = response.body()

    assert.isFalse(data.success)
    assert.include(data.message.toLowerCase(), 'not found')
  })

  test('should return 400 for already completed assessment', async ({ client, assert }) => {
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-completed-123',
      cvSubmissionId: testSubmission.id,
      responses: {
        work_style_environment: 'hybrid',
        overtime_commitment: 'reasonable_notice',
        recognition_reward: 'career_advancement',
        feedback_communication: 'embrace_learn',
        learning_growth: 'Test answer',
        longterm_motivation: 'growth_opportunities',
      },
      currentQuestion: 7,
      questionsCompleted: 6,
      isCompleted: true,
      languagePreference: 'en',
      totalScore: 95,
      assessmentResult: 'excellent',
      startedAt: DateTime.now(),
      completedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 1,
        answer: 'test',
        action: 'next',
      })

    response.assertStatus(400)
    const data = response.body()

    assert.isFalse(data.success)
    assert.include(data.message.toLowerCase(), 'completed')
  })

  test('should skip all remaining questions with skip_all action', async ({ client, assert }) => {
    // Create assessment with only 2 questions completed
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-skip-all-123',
      cvSubmissionId: testSubmission.id,
      responses: {
        work_style_environment: 'hybrid',
        overtime_commitment: 'reasonable_notice',
      },
      currentQuestion: 3,
      questionsCompleted: 2,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    const response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 3,
        answer: null,
        action: 'skip_all',
      })

    response.assertStatus(200)
    const data = response.body()

    assert.isTrue(data.success)
    assert.isTrue(data.data.completed)
    assert.exists(data.data.totalScore)
    assert.exists(data.data.assessmentResult)

    // Verify the assessment is marked as completed
    await questionnaireResponse.refresh()
    assert.isTrue(questionnaireResponse.isCompleted)
    assert.exists(questionnaireResponse.completedAt)
    assert.exists(questionnaireResponse.totalScore)
    assert.exists(questionnaireResponse.assessmentResult)
    assert.equal(questionnaireResponse.questionsCompleted, 6) // Should be set to total questions
    assert.equal(questionnaireResponse.currentQuestion, 7) // Should be set to total + 1
  })

  test('should properly calculate progress when skipping individual questions', async ({
    client,
    assert,
  }) => {
    // Create assessment starting from question 1
    const questionnaireResponse = await QuestionnaireResponse.create({
      submissionId: 'test-skip-progress-123',
      cvSubmissionId: testSubmission.id,
      responses: {},
      currentQuestion: 1,
      questionsCompleted: 0,
      isCompleted: false,
      languagePreference: 'en',
      startedAt: DateTime.now(),
      lastActivityAt: DateTime.now(),
    })

    // Skip question 1 - should increment questionsCompleted to 1
    let response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 1,
        answer: null,
        action: 'skip',
      })

    response.assertStatus(200)
    let data = response.body()
    assert.isTrue(data.success)
    assert.equal(data.data.currentQuestion, 2)
    assert.equal(data.data.progress, 17) // 1/6 * 100 = 16.67 rounded to 17

    // Verify questionsCompleted was incremented
    await questionnaireResponse.refresh()
    assert.equal(questionnaireResponse.questionsCompleted, 1)

    // Answer question 2 - should increment questionsCompleted to 2
    response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 2,
        answer: 'reasonable_notice',
        action: 'next',
      })

    response.assertStatus(200)
    data = response.body()
    assert.equal(data.data.progress, 33) // 2/6 * 100 = 33.33 rounded to 33

    // Skip questions 3, 4, 5 to get to the final question
    for (let questionId = 3; questionId <= 5; questionId++) {
      response = await client
        .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
        .json({
          question_id: questionId,
          answer: null,
          action: 'skip',
        })

      response.assertStatus(200)
      data = response.body()
      assert.isFalse(data.data.completed)
    }

    // Verify we're at question 6 with 83% progress (5/6)
    await questionnaireResponse.refresh()
    assert.equal(questionnaireResponse.currentQuestion, 6)
    assert.equal(questionnaireResponse.questionsCompleted, 5)
    assert.equal(questionnaireResponse.getProgressPercentage(), 83) // 5/6 * 100 = 83.33 rounded to 83

    // Skip the final question - should complete the assessment with 100% progress
    response = await client
      .post(`/api/assessment/${questionnaireResponse.submissionId}/answer`)
      .json({
        question_id: 6,
        answer: null,
        action: 'skip',
      })

    response.assertStatus(200)
    data = response.body()

    // This should now complete the assessment
    assert.isTrue(data.data.completed)
    assert.equal(data.data.progress, 100)
    assert.exists(data.data.totalScore)
    assert.exists(data.data.assessmentResult)

    // Verify the assessment is marked as completed
    await questionnaireResponse.refresh()
    assert.isTrue(questionnaireResponse.isCompleted)
    assert.equal(questionnaireResponse.questionsCompleted, 6)
    assert.equal(questionnaireResponse.getProgressPercentage(), 100)
  })
})
