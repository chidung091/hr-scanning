import { test } from '@japa/runner'
import ProcessedCv from '#models/processed_cv'
import CvSubmission from '#models/cv_submission'
import type { ExtractedCvData } from '#services/openai_service'
import { DatabaseMockManager, mockExtractedCvDataForDb } from '#tests/utils/database_mocks'

test.group('ProcessedCv Model', (group) => {
  let dbMockManager: DatabaseMockManager

  group.setup(async () => {
    dbMockManager = new DatabaseMockManager()
    await dbMockManager.initializeMocks()
  })

  group.teardown(() => {
    dbMockManager.restore()
  })

  group.each.setup(() => {
    // Clear mock data for each test but keep the stubs
    dbMockManager.clearMockData()
  })

  test('should create processed CV with basic properties', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-model-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    const processedCv = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'pending',
      retryCount: 0,
    })

    // Refresh from database to get default values
    await processedCv.refresh()

    assert.isDefined(processedCv.id)
    assert.equal(processedCv.cvSubmissionId, cvSubmission.id)
    assert.equal(processedCv.processingStatus, 'pending')
    assert.equal(processedCv.retryCount, 0)
    // dataValidated should be false by default
    assert.equal(processedCv.dataValidated, false)
  })

  test('should handle JSON serialization of extracted data', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-json-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    const processedCv = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'completed',
      extractedData: mockExtractedCvDataForDb,
      dataValidated: true,
    })

    // Reload from database to test serialization
    await processedCv.refresh()

    assert.isDefined(processedCv.extractedData)
    assert.equal(processedCv.extractedData!.PersonalInformation.Name, 'John Doe')
    assert.equal(processedCv.extractedData!.PersonalInformation.Email, 'john.doe@example.com')
    assert.equal(processedCv.extractedData!.WorkExperience[0].JobTitle, 'Senior Developer')
    assert.equal(processedCv.extractedData!.Skills.Technical.length, 4)
    assert.include(processedCv.extractedData!.Skills.Technical, 'JavaScript')
    assert.equal(processedCv.extractedData!.YearExperience, 5)
    assert.equal(processedCv.dataValidated, true)
  })

  test('should mark as processing correctly', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-processing-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    const processedCv = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'pending',
    })

    processedCv.markAsProcessing()

    assert.equal(processedCv.processingStatus, 'processing')
    assert.isDefined(processedCv.processingStartedAt)
  })

  test('should mark as completed correctly', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-completed-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    const extractedData: ExtractedCvData = {
      PersonalInformation: {
        Name: 'Jane Doe',
        DateOfBirth: null,
        Gender: null,
        PhoneNumber: null,
        Email: 'jane@example.com',
        Address: null,
      },
      JobObjective: { DesiredPosition: null, CareerGoals: null },
      Education: [],
      WorkExperience: [],
      Skills: { Technical: ['Python'], Soft: [] },
      Certifications: [],
      Projects: [],
      Languages: [],
      ExtracurricularAwards: [],
      Interests: [],
      YearExperience: 2,
      TechnologyExperience: ['Python'],
      CareerPath: null,
    }

    const processedCv = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'processing',
    })

    processedCv.markAsCompleted(extractedData, 1500, 5000, 'gpt-4o-mini')

    assert.equal(processedCv.processingStatus, 'completed')
    assert.isDefined(processedCv.processingCompletedAt)
    assert.equal(processedCv.tokensUsed, 1500)
    assert.equal(processedCv.processingTimeMs, 5000)
    assert.equal(processedCv.openaiModel, 'gpt-4o-mini')
    assert.isTrue(processedCv.dataValidated)
    assert.isDefined(processedCv.extractedData)
    assert.isDefined(processedCv.searchableText)
  })

  test('should mark as failed correctly', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-failed-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    const processedCv = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'processing',
      retryCount: 0,
    })

    processedCv.markAsFailed('OpenAI API error')

    assert.equal(processedCv.processingStatus, 'failed')
    assert.isDefined(processedCv.processingCompletedAt)
    assert.equal(processedCv.errorMessage, 'OpenAI API error')
    assert.equal(processedCv.retryCount, 1)
    assert.isDefined(processedCv.lastRetryAt)
  })

  test('should determine retry eligibility correctly', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-retry-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    // Test with low retry count
    const processedCv1 = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'failed',
      retryCount: 1,
    })

    assert.isTrue(processedCv1.canRetry())

    // Test with max retry count
    const processedCv2 = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'failed',
      retryCount: 3,
    })

    assert.isFalse(processedCv2.canRetry())

    // Test with completed status
    const processedCv3 = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'completed',
      retryCount: 1,
    })

    assert.isFalse(processedCv3.canRetry())
  })

  test('should generate searchable text correctly', async ({ assert }) => {
    const cvSubmission = await CvSubmission.create({
      submissionId: 'test-search-123',
      filename: 'test.pdf',
      originalFilename: 'test.pdf',
      filePath: 'test/test.pdf',
      fileSize: 1000,
      mimeType: 'application/pdf',
      applicantName: 'Test User',
      applicantEmail: 'test@example.com',
      extractedText: 'Test CV content',
      status: 'pending',
    })

    const extractedData: ExtractedCvData = {
      PersonalInformation: {
        Name: 'Alice Smith',
        DateOfBirth: null,
        Gender: null,
        PhoneNumber: null,
        Email: 'alice@example.com',
        Address: null,
      },
      JobObjective: {
        DesiredPosition: 'Data Scientist',
        CareerGoals: 'Machine Learning Expert',
      },
      Education: [
        {
          School: 'MIT',
          Major: 'Computer Science',
          DegreeLevel: 'PhD',
          StartDate: null,
          EndDate: null,
          GPA: null,
        },
      ],
      WorkExperience: [
        {
          Company: 'Google',
          JobTitle: 'Senior Engineer',
          Duration: null,
          Description: 'AI Research',
          KeyAchievements: null,
        },
      ],
      Skills: {
        Technical: ['Python', 'TensorFlow', 'PyTorch'],
        Soft: ['Research', 'Analysis'],
      },
      Certifications: [],
      Projects: [
        {
          ProjectName: 'Neural Network Framework',
          Role: 'Lead Developer',
          Description: 'Deep learning framework',
          Technologies: ['Python', 'CUDA'],
        },
      ],
      Languages: [{ Name: 'English', Proficiency: 'Native' }],
      ExtracurricularAwards: [],
      Interests: ['AI', 'Machine Learning'],
      YearExperience: 5,
      TechnologyExperience: ['Python', 'TensorFlow', 'PyTorch', 'CUDA'],
      CareerPath: 'AI Research',
    }

    const processedCv = await ProcessedCv.create({
      cvSubmissionId: cvSubmission.id,
      processingStatus: 'completed',
      extractedData: extractedData,
      dataValidated: true,
    })

    // Manually trigger searchable text generation
    // @ts-ignore - Testing private method
    processedCv.generateSearchableText()

    assert.isDefined(processedCv.searchableText)
    assert.include(processedCv.searchableText!, 'alice smith')
    assert.include(processedCv.searchableText!, 'data scientist')
    assert.include(processedCv.searchableText!, 'python')
    assert.include(processedCv.searchableText!, 'google')
    assert.include(processedCv.searchableText!, 'mit')
    assert.include(processedCv.searchableText!, 'neural network')
  })
})
