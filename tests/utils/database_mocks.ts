import sinon from 'sinon'
import { DateTime } from 'luxon'
import ProcessedCv from '#models/processed_cv'
import CvSubmission from '#models/cv_submission'
import Database from '@adonisjs/lucid/services/db'
import type { ExtractedCvData } from '#services/openai_service'

/**
 * Mock data for testing
 */
export const mockCvSubmissionData = {
  id: 1,
  submissionId: 'test-123',
  filename: 'test.pdf',
  originalFilename: 'test.pdf',
  filePath: 'test/test.pdf',
  fileSize: 1000,
  mimeType: 'application/pdf',
  applicantName: 'Test User',
  applicantEmail: 'test@example.com',
  extractedText: 'Test CV content',
  status: 'pending',
  base64Content: null,
  jobId: null,
  createdAt: DateTime.now(),
  updatedAt: DateTime.now(),
}

export const mockProcessedCvData = {
  id: 1,
  cvSubmissionId: 1,
  processingStatus: 'pending' as const,
  processingStartedAt: null,
  processingCompletedAt: null,
  openaiModel: null,
  tokensUsed: null,
  processingTimeMs: null,
  extractedData: null,
  errorMessage: null,
  retryCount: 0,
  lastRetryAt: null,
  dataValidated: false,
  validationNotes: null,
  searchableText: null,
  createdAt: DateTime.now(),
  updatedAt: DateTime.now(),
}

export const mockExtractedCvDataForDb: ExtractedCvData = {
  PersonalInformation: {
    Name: 'John Doe',
    DateOfBirth: '1990-01-01',
    Gender: 'male',
    PhoneNumber: '+1234567890',
    Email: 'john.doe@example.com',
    Address: '123 Main St, City, State 12345',
  },
  JobObjective: {
    DesiredPosition: 'Senior Software Engineer',
    CareerGoals: 'Lead development teams and architect scalable solutions',
  },
  Education: [
    {
      School: 'University of Technology',
      Major: 'Computer Science',
      DegreeLevel: 'Bachelor',
      StartDate: '2016-09',
      EndDate: '2020-06',
      GPA: '3.8',
    },
  ],
  WorkExperience: [
    {
      Company: 'Tech Corp',
      JobTitle: 'Senior Developer',
      Duration: '2020-2023',
      Description: 'Led development team and built scalable applications',
      KeyAchievements: 'Improved system performance by 40%',
    },
  ],
  Skills: {
    Technical: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
    Soft: ['Leadership', 'Communication', 'Problem Solving'],
  },
  Certifications: [
    {
      Name: 'AWS Certified Developer',
      Issuer: 'Amazon Web Services',
      DateIssued: '2022-03',
      ExpirationDate: '2025-03',
    },
  ],
  Projects: [
    {
      ProjectName: 'E-commerce Platform',
      Role: 'Lead Developer',
      Description: 'Built scalable e-commerce solution',
      Technologies: ['React', 'Node.js', 'PostgreSQL'],
    },
  ],
  Languages: [
    {
      Name: 'English',
      Proficiency: 'Native',
    },
    {
      Name: 'Spanish',
      Proficiency: 'Intermediate',
    },
  ],
  ExtracurricularAwards: [
    {
      Name: 'Best Developer Award',
      Date: '2023-01',
      RoleOrAchievement: 'Outstanding performance in team projects',
    },
  ],
  Interests: ['Open Source', 'Machine Learning', 'Photography'],
  YearExperience: 5,
  TechnologyExperience: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'PostgreSQL'],
  CareerPath: 'Full Stack Development',
}

/**
 * Database Mock Manager for unit tests
 */
export class DatabaseMockManager {
  private stubs: sinon.SinonStub[] = []
  private mockData: Map<string, any[]> = new Map()
  private isInitialized: boolean = false
  public createNewProcessedCv: (() => any) | null = null
  private originalProcessedCv: any = null
  private mockConnection: any = null
  private originalBaseModel: any = null

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    this.mockData.set('cv_submissions', [])
    this.mockData.set('processed_cvs', [])
  }

  /**
   * Initialize all database mocks (call once per test suite)
   */
  async initializeMocks() {
    if (this.isInitialized) {
      return
    }

    this.mockDatabaseConnection()
    await this.mockBaseModel()
    this.mockCvSubmissionModel()
    this.mockProcessedCvModel()
    this.isInitialized = true
  }

  /**
   * Mock Database connection and transaction methods
   */
  private mockDatabaseConnection() {
    // Create a comprehensive mock connection that satisfies all BaseModel requirements
    const mockQueryBuilder = {
      from: sinon.stub().returnsThis(),
      select: sinon.stub().returnsThis(),
      where: sinon.stub().returnsThis(),
      insert: sinon.stub().resolves([{ id: 1 }]),
      update: sinon.stub().resolves([]),
      delete: sinon.stub().resolves([]),
      first: sinon.stub().resolves(null),
      returning: sinon.stub().returnsThis(),
      transacting: sinon.stub().returnsThis(),
    }

    const mockConnection = {
      dialect: {
        name: 'postgres',
        client: 'pg',
        dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      client: {
        config: {
          client: 'pg',
        },
        modelQuery: sinon.stub().returns(mockQueryBuilder),
        query: sinon.stub().returns(mockQueryBuilder),
      },
      // Add more properties that BaseModel might need
      schema: {
        hasTable: sinon.stub().resolves(true),
        hasColumn: sinon.stub().resolves(true),
      },
      raw: sinon.stub().resolves([]),
      table: sinon.stub().returns(mockQueryBuilder),
      queryBuilder: sinon.stub().returns(mockQueryBuilder),
      // Mock transaction support
      transaction: sinon.stub().callsFake(async (callback) => {
        if (callback) {
          return await callback(mockConnection)
        }
        return mockConnection
      }),
    }

    // Store the mock connection for use in BaseModel mocking
    this.mockConnection = mockConnection

    // Only stub if not already stubbed
    if (!(Database.connection as any).isSinonProxy) {
      const connectionStub = sinon.stub(Database, 'connection').returns(mockConnection as any)
      this.stubs.push(connectionStub)
    }

    // Mock Database.manager to return a connection manager
    const mockManager = {
      get: sinon.stub().returns(mockConnection),
      connect: sinon.stub().resolves(mockConnection),
      close: sinon.stub().resolves(),
      closeAll: sinon.stub().resolves(),
    }

    if ((Database as any).manager && !((Database as any).manager as any).isSinonProxy) {
      const managerStub = sinon.stub(Database as any, 'manager').get(() => mockManager)
      this.stubs.push(managerStub)
    }

    // Mock transaction methods if they exist
    if (
      typeof (Database as any).beginGlobalTransaction === 'function' &&
      !((Database as any).beginGlobalTransaction as any).isSinonProxy
    ) {
      const beginTransactionStub = sinon.stub(Database as any, 'beginGlobalTransaction').resolves()
      this.stubs.push(beginTransactionStub)
    }

    if (
      typeof (Database as any).rollbackGlobalTransaction === 'function' &&
      !((Database as any).rollbackGlobalTransaction as any).isSinonProxy
    ) {
      const rollbackTransactionStub = sinon
        .stub(Database as any, 'rollbackGlobalTransaction')
        .resolves()
      this.stubs.push(rollbackTransactionStub)
    }
  }

  /**
   * Mock BaseModel to prevent any database connections during model instantiation
   */
  private async mockBaseModel() {
    try {
      // Import BaseModel dynamically and mock its connection-related properties
      const { BaseModel } = await import('@adonisjs/lucid/orm')

      if (BaseModel && !(BaseModel as any)._isMocked) {
        // Store original properties for restoration
        this.originalBaseModel = {
          connection: (BaseModel as any).connection,
          $adapter: (BaseModel as any).$adapter,
        }

        // Mock the connection property to return our mock connection
        Object.defineProperty(BaseModel, 'connection', {
          get: () => this.mockConnection,
          configurable: true,
        })

        // Mock the $adapter property
        ;(BaseModel as any).$adapter = {
          query: () => this.createMockQueryBuilder([], 'mock'),
          insert: sinon.stub().resolves({ id: 1 }),
          update: sinon.stub().resolves([]),
          delete: sinon.stub().resolves([]),
          find: sinon.stub().resolves(null),
          findOrFail: sinon.stub().rejects(new Error('Row not found')),
          first: sinon.stub().resolves(null),
          firstOrFail: sinon.stub().rejects(new Error('Row not found')),
        }

        // Mark as mocked
        ;(BaseModel as any)._isMocked = true

        // Add restoration stub
        this.stubs.push({
          restore: () => {
            if (this.originalBaseModel) {
              Object.defineProperty(BaseModel, 'connection', {
                value: this.originalBaseModel.connection,
                writable: true,
                configurable: true,
              })
              ;(BaseModel as any).$adapter = this.originalBaseModel.$adapter
              delete (BaseModel as any)._isMocked
            }
          },
        } as any)
      }
    } catch (error) {
      // If BaseModel mocking fails, continue with model-specific mocking
      console.warn('BaseModel mocking failed:', error)
    }
  }

  /**
   * Mock CvSubmission model methods
   */
  private mockCvSubmissionModel() {
    // Mock create method only if not already stubbed
    if (!(CvSubmission.create as any).isSinonProxy) {
      const createStub = sinon.stub(CvSubmission, 'create').callsFake(async (data: any) => {
        const submissions = this.mockData.get('cv_submissions') || []
        const newSubmission = {
          ...mockCvSubmissionData,
          ...data,
          id: submissions.length + 1,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        }
        submissions.push(newSubmission)
        this.mockData.set('cv_submissions', submissions)

        // Return a mock instance with the data
        const mockInstance = Object.assign(Object.create(CvSubmission.prototype), newSubmission)
        mockInstance.refresh = sinon.stub().resolves(mockInstance)
        return mockInstance
      })
      this.stubs.push(createStub)
    }

    // Mock query builder
    if (!(CvSubmission.query as any).isSinonProxy) {
      const queryStub = sinon.stub(CvSubmission, 'query').callsFake(() => {
        const submissions = this.mockData.get('cv_submissions') || []
        return this.createMockQueryBuilder(submissions, 'cv_submissions') as any
      })
      this.stubs.push(queryStub)
    }

    // Mock find method only if not already stubbed
    if (!(CvSubmission.find as any).isSinonProxy) {
      const findStub = sinon.stub(CvSubmission, 'find').callsFake(async (id: number) => {
        const submissions = this.mockData.get('cv_submissions') || []
        const found = submissions.find((s) => s.id === id)
        return found ? Object.assign(Object.create(CvSubmission.prototype), found) : null
      })
      this.stubs.push(findStub)
    }
  }

  /**
   * Mock ProcessedCv model methods
   */
  private mockProcessedCvModel() {
    // Mock create method only if not already stubbed
    if (!(ProcessedCv.create as any).isSinonProxy) {
      const createStub = sinon.stub(ProcessedCv, 'create').callsFake(async (data: any) => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        const newProcessedCv = {
          ...mockProcessedCvData,
          ...data,
          id: processedCvs.length + 1,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        }
        processedCvs.push(newProcessedCv)
        this.mockData.set('processed_cvs', processedCvs)

        // Return a mock instance with methods
        const mockInstance = this.createProcessedCvInstance(newProcessedCv)
        return mockInstance
      })
      this.stubs.push(createStub)
    }

    // Create a factory function for new ProcessedCv instances
    const createNewInstance = () => {
      const newProcessedCv = {
        ...mockProcessedCvData,
        id: null, // Will be set when saved
        createdAt: null,
        updatedAt: null,
      }

      // Create instance with methods
      const mockInstance = this.createProcessedCvInstance(newProcessedCv)

      // Override save method to actually persist to mock data
      mockInstance.save = sinon.stub().callsFake(async () => {
        if (!mockInstance.id) {
          const processedCvs = this.mockData.get('processed_cvs') || []
          mockInstance.id = processedCvs.length + 1
          mockInstance.createdAt = DateTime.now()
          mockInstance.updatedAt = DateTime.now()
          processedCvs.push({ ...mockInstance })
          this.mockData.set('processed_cvs', processedCvs)
        } else {
          // Update existing
          const processedCvs = this.mockData.get('processed_cvs') || []
          const index = processedCvs.findIndex((cv) => cv.id === mockInstance.id)
          if (index >= 0) {
            mockInstance.updatedAt = DateTime.now()
            processedCvs[index] = { ...mockInstance }
            this.mockData.set('processed_cvs', processedCvs)
          }
        }
        return mockInstance
      })

      return mockInstance
    }

    // Store the factory for use in tests
    this.createNewProcessedCv = createNewInstance

    // Mock the ProcessedCv constructor to prevent database connections
    const originalProcessedCv = ProcessedCv
    this.originalProcessedCv = originalProcessedCv

    // Create a constructor replacement that uses our factory
    const MockedProcessedCv = function (this: any, data?: any) {
      const instance = createNewInstance()
      if (data) {
        Object.assign(instance, data)
      }
      // Return the instance directly (not using 'new' semantics)
      return instance
    } as any

    // Copy all static methods and properties from the original
    Object.setPrototypeOf(MockedProcessedCv, originalProcessedCv)
    Object.assign(MockedProcessedCv, originalProcessedCv)
    MockedProcessedCv.prototype = originalProcessedCv.prototype

    // Replace the constructor in the global scope and try to intercept module imports
    ;(global as any).ProcessedCv = MockedProcessedCv

    // Also try to replace in the ProcessedCv module itself
    try {
      // Replace the default export if it exists
      if (ProcessedCv.constructor === Function) {
        Object.defineProperty(ProcessedCv, 'constructor', {
          value: MockedProcessedCv,
          writable: true,
          configurable: true,
        })
      }
    } catch (e) {
      // Ignore errors in constructor replacement
    }

    // Create a stub for ProcessedCv.create method if it exists and isn't already stubbed
    if (
      typeof (ProcessedCv as any).create === 'function' &&
      !(ProcessedCv as any).create.isSinonProxy
    ) {
      const processedCvCreateStub = sinon
        .stub(ProcessedCv as any, 'create')
        .callsFake(async (data: any) => {
          const instance = createNewInstance()
          Object.assign(instance, data)

          // Add to mock data
          const processedCvs = this.mockData.get('processed_cvs') || []
          const newRecord = { ...instance, id: processedCvs.length + 1 }
          processedCvs.push(newRecord)
          this.mockData.set('processed_cvs', processedCvs)

          return Object.assign(instance, newRecord)
        })
      this.stubs.push(processedCvCreateStub)
    }

    // Mock query builder
    if (!(ProcessedCv.query as any).isSinonProxy) {
      const queryStub = sinon.stub(ProcessedCv, 'query').callsFake(() => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        return this.createMockQueryBuilder(processedCvs, 'processed_cvs') as any
      })
      this.stubs.push(queryStub)
    }

    // Mock find method only if not already stubbed
    if (!(ProcessedCv.find as any).isSinonProxy) {
      const findStub = sinon.stub(ProcessedCv, 'find').callsFake(async (id: number) => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        const found = processedCvs.find((p) => p.id === id)
        if (!found) return null

        const mockInstance = Object.assign(Object.create(ProcessedCv.prototype), found)
        mockInstance.save = sinon.stub().resolves(mockInstance)
        mockInstance.markAsProcessing = ProcessedCv.prototype.markAsProcessing.bind(mockInstance)
        mockInstance.markAsCompleted = ProcessedCv.prototype.markAsCompleted.bind(mockInstance)
        mockInstance.markAsFailed = ProcessedCv.prototype.markAsFailed.bind(mockInstance)
        mockInstance.canRetry = ProcessedCv.prototype.canRetry.bind(mockInstance)
        // Access private method using type assertion
        mockInstance.generateSearchableText = (
          ProcessedCv.prototype as any
        ).generateSearchableText.bind(mockInstance)

        return mockInstance
      })
      this.stubs.push(findStub)
    }

    // Mock static query scope methods - these should return query builders
    if (!(ProcessedCv.completed as any).isSinonProxy) {
      const completedStub = sinon.stub(ProcessedCv, 'completed').callsFake(() => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        const filtered = processedCvs.filter((cv) => cv.processingStatus === 'completed')
        return this.createMockQueryBuilder(filtered, 'processed_cvs') as any
      })
      this.stubs.push(completedStub)
    }

    if (!(ProcessedCv.failed as any).isSinonProxy) {
      const failedStub = sinon.stub(ProcessedCv, 'failed').callsFake(() => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        const filtered = processedCvs.filter((cv) => cv.processingStatus === 'failed')
        return this.createMockQueryBuilder(filtered, 'processed_cvs') as any
      })
      this.stubs.push(failedStub)
    }

    if (!(ProcessedCv.canRetry as any).isSinonProxy) {
      const canRetryStub = sinon.stub(ProcessedCv, 'canRetry').callsFake(() => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        const filtered = processedCvs.filter(
          (cv) => cv.processingStatus === 'failed' && cv.retryCount < 3
        )
        return this.createMockQueryBuilder(filtered, 'processed_cvs') as any
      })
      this.stubs.push(canRetryStub)
    }

    if (!(ProcessedCv.withValidData as any).isSinonProxy) {
      const withValidDataStub = sinon.stub(ProcessedCv, 'withValidData').callsFake(() => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        const filtered = processedCvs.filter((cv) => cv.dataValidated === true)
        return this.createMockQueryBuilder(filtered, 'processed_cvs') as any
      })
      this.stubs.push(withValidDataStub)
    }
  }

  /**
   * Create a mock query builder that simulates Lucid ORM query methods
   */
  private createMockQueryBuilder(data: any[], tableName: string) {
    const filteredData = [...data]
    let currentData = filteredData

    const queryBuilder = {
      // Internal properties for tracking query state
      _preloadedRelations: [] as string[],
      _isGrouped: false,
      _hasCount: false,
      _groupColumn: null as string | null,
      where: sinon.stub().callsFake((column: string, operator: any, value?: any) => {
        if (arguments.length === 2) {
          value = operator
          operator = '='
        }

        currentData = currentData.filter((item) => {
          const columnValue = this.getNestedProperty(item, column)
          switch (operator) {
            case '=':
              return columnValue === value
            case '!=':
            case '<>':
              return columnValue !== value
            case '>':
              return columnValue > value
            case '>=':
              return columnValue >= value
            case '<':
              return columnValue < value
            case '<=':
              return columnValue <= value
            default:
              return columnValue === value
          }
        })
        return queryBuilder
      }),

      whereNotNull: sinon.stub().callsFake((column: string) => {
        currentData = currentData.filter((item) => {
          const columnValue = this.getNestedProperty(item, column)
          return columnValue !== null && columnValue !== undefined
        })
        return queryBuilder
      }),

      orderBy: sinon.stub().callsFake((column: string, direction: 'asc' | 'desc' = 'asc') => {
        currentData.sort((a, b) => {
          const aVal = this.getNestedProperty(a, column)
          const bVal = this.getNestedProperty(b, column)

          if (aVal < bVal) return direction === 'asc' ? -1 : 1
          if (aVal > bVal) return direction === 'asc' ? 1 : -1
          return 0
        })
        return queryBuilder
      }),

      first: sinon.stub().callsFake(async () => {
        const result = currentData[0] || null
        if (!result) return null

        // Return instance with prototype methods
        if (tableName === 'processed_cvs') {
          return this.createProcessedCvInstance(result)
        } else {
          const mockInstance = Object.assign(Object.create(CvSubmission.prototype), result)
          mockInstance.refresh = sinon.stub().resolves(mockInstance)
          return mockInstance
        }
      }),

      firstOrFail: sinon.stub().callsFake(async () => {
        const result = currentData[0]
        if (!result) {
          throw new Error('Row not found')
        }

        // Return instance with prototype methods
        if (tableName === 'processed_cvs') {
          const instance = this.createProcessedCvInstance(result)
          // Add preloaded cvSubmission if requested
          if (
            queryBuilder._preloadedRelations &&
            queryBuilder._preloadedRelations.includes('cvSubmission')
          ) {
            const submissions = this.mockData.get('cv_submissions') || []
            const cvSubmission = submissions.find((s) => s.id === result.cvSubmissionId)
            if (cvSubmission) {
              instance.cvSubmission = Object.assign(
                Object.create(CvSubmission.prototype),
                cvSubmission
              )
            }
          }
          return instance
        } else {
          return Object.assign(Object.create(CvSubmission.prototype), result)
        }
      }),

      exec: sinon.stub().callsFake(async () => currentData),

      count: sinon.stub().callsFake((_column: string = '* as count') => {
        if (queryBuilder._isGrouped) {
          // For grouped queries, return the query builder to allow chaining
          queryBuilder._hasCount = true
          return queryBuilder
        } else {
          // For non-grouped queries, return a promise
          return Promise.resolve([{ count: currentData.length }])
        }
      }),

      // Add more query methods as needed
      groupBy: sinon.stub().callsFake((column: string) => {
        // For groupBy, we need to return aggregated results
        const grouped = currentData.reduce(
          (acc, item) => {
            const key = this.getNestedProperty(item, column)
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(item)
            return acc
          },
          {} as Record<string, any[]>
        )

        // Transform to array format expected by count/select
        currentData = Object.entries(grouped).map(([key, items]) => ({
          [column]: key,
          count: (items as any[]).length,
          items: items,
        }))

        // Mark as grouped for count/select handling
        queryBuilder._isGrouped = true
        queryBuilder._groupColumn = column

        return queryBuilder
      }),

      select: sinon.stub().callsFake((_columns: string | string[]) => {
        if (queryBuilder._isGrouped && queryBuilder._hasCount) {
          // This is the final step in groupBy().count().select() chain
          // Return the grouped results with count
          const results = currentData.map((group) => {
            const groupColumn = queryBuilder._groupColumn!
            return {
              [groupColumn]: group[groupColumn],
              count: group.count,
            }
          })
          return Promise.resolve(results)
        } else {
          // For other select operations, just return the query builder
          return queryBuilder
        }
      }),

      preload: sinon.stub().callsFake((relation: string) => {
        if (!queryBuilder._preloadedRelations) {
          queryBuilder._preloadedRelations = []
        }
        queryBuilder._preloadedRelations.push(relation)
        return queryBuilder
      }),

      // Add static query scope methods for ProcessedCv
      completed: sinon.stub().callsFake(async () => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        return processedCvs
          .filter((cv) => cv.processingStatus === 'completed')
          .map((cv) => Object.assign(Object.create(ProcessedCv.prototype), cv))
      }),

      failed: sinon.stub().callsFake(async () => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        return processedCvs
          .filter((cv) => cv.processingStatus === 'failed')
          .map((cv) => Object.assign(Object.create(ProcessedCv.prototype), cv))
      }),

      canRetry: sinon.stub().callsFake(async () => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        return processedCvs
          .filter((cv) => cv.processingStatus === 'failed' && cv.retryCount < 3)
          .map((cv) => Object.assign(Object.create(ProcessedCv.prototype), cv))
      }),

      withValidData: sinon.stub().callsFake(async () => {
        const processedCvs = this.mockData.get('processed_cvs') || []
        return processedCvs
          .filter((cv) => cv.dataValidated === true)
          .map((cv) => Object.assign(Object.create(ProcessedCv.prototype), cv))
      }),
    }

    return queryBuilder
  }

  /**
   * Create a ProcessedCv instance with all methods
   */
  private createProcessedCvInstance(data: any) {
    const mockInstance = Object.assign(Object.create(ProcessedCv.prototype), data)
    mockInstance.refresh = sinon.stub().resolves(mockInstance)
    mockInstance.save = sinon.stub().resolves(mockInstance)
    mockInstance.markAsProcessing = ProcessedCv.prototype.markAsProcessing.bind(mockInstance)
    mockInstance.markAsCompleted = ProcessedCv.prototype.markAsCompleted.bind(mockInstance)
    mockInstance.markAsFailed = ProcessedCv.prototype.markAsFailed.bind(mockInstance)
    mockInstance.canRetry = ProcessedCv.prototype.canRetry.bind(mockInstance)
    // Access private method using type assertion
    mockInstance.generateSearchableText = (
      ProcessedCv.prototype as any
    ).generateSearchableText.bind(mockInstance)

    // Add cvSubmission preload mock
    mockInstance.cvSubmission = null

    return mockInstance
  }

  /**
   * Helper to get nested property values (e.g., 'processing_status' or 'cvSubmissionId')
   */
  private getNestedProperty(obj: any, path: string): any {
    // Convert snake_case to camelCase for property access
    const camelCasePath = path.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    return obj[camelCasePath] || obj[path]
  }

  /**
   * Add mock data to a table
   */
  addMockData(tableName: string, data: any[]) {
    this.mockData.set(tableName, [...(this.mockData.get(tableName) || []), ...data])
  }

  /**
   * Clear all mock data
   */
  clearMockData() {
    this.initializeMockData()
  }

  /**
   * Get current mock data for a table
   */
  getMockData(tableName: string): any[] {
    return this.mockData.get(tableName) || []
  }

  /**
   * Clean up all stubs
   */
  restore() {
    this.stubs.forEach((stub) => {
      if (stub && typeof stub.restore === 'function') {
        stub.restore()
      }
    })
    this.stubs = []
    this.clearMockData()

    // Restore original ProcessedCv constructor if it was mocked
    if (this.originalProcessedCv) {
      ;(global as any).ProcessedCv = this.originalProcessedCv
      this.originalProcessedCv = null
    }
  }
}
