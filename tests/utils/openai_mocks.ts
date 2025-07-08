import sinon from 'sinon'
import type { ExtractedCvData } from '#services/openai_service'

/**
 * Mock OpenAI API responses and utilities for testing
 */

/**
 * Sample extracted CV data for testing
 */
export const mockExtractedCvData: ExtractedCvData = {
  PersonalInformation: {
    Name: 'John Doe',
    DateOfBirth: '1990-05-15',
    Gender: 'male',
    PhoneNumber: '+1-555-0123',
    Email: 'john.doe@email.com',
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
      StartDate: '2008-09',
      EndDate: '2012-06',
      GPA: '3.8',
    },
  ],
  WorkExperience: [
    {
      Company: 'TechCorp Inc',
      JobTitle: 'Software Engineer',
      Duration: '2020-01 to Present',
      Description: 'Develop and maintain web applications using React and Node.js',
      KeyAchievements: 'Led migration to microservices architecture, improved performance by 40%',
    },
    {
      Company: 'StartupXYZ',
      JobTitle: 'Junior Developer',
      Duration: '2018-06 to 2019-12',
      Description: 'Built mobile applications using React Native',
      KeyAchievements: 'Delivered 3 mobile apps with 100k+ downloads',
    },
  ],
  Skills: {
    Technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    Soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'],
  },
  Certifications: [
    {
      Name: 'AWS Certified Solutions Architect',
      Issuer: 'Amazon Web Services',
      DateIssued: '2021-03',
      ExpirationDate: '2024-03',
    },
  ],
  Projects: [
    {
      ProjectName: 'E-commerce Platform',
      Role: 'Lead Developer',
      Description: 'Built scalable e-commerce platform handling 10k+ daily users',
      Technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
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
      Name: 'Hackathon Winner',
      Date: '2021-10',
      RoleOrAchievement: 'First place in company hackathon',
    },
  ],
  Interests: ['Open Source', 'Machine Learning', 'Photography'],
  YearExperience: 5,
  TechnologyExperience: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  CareerPath: 'Full-stack development with focus on scalable web applications',
}

/**
 * Minimal extracted CV data for testing edge cases
 */
export const mockMinimalCvData: ExtractedCvData = {
  PersonalInformation: {
    Name: 'Jane Smith',
    DateOfBirth: null,
    Gender: null,
    PhoneNumber: null,
    Email: 'jane@email.com',
    Address: null,
  },
  JobObjective: {
    DesiredPosition: null,
    CareerGoals: null,
  },
  Education: [],
  WorkExperience: [],
  Skills: {
    Technical: [],
    Soft: [],
  },
  Certifications: [],
  Projects: [],
  Languages: [],
  ExtracurricularAwards: [],
  Interests: [],
  YearExperience: null,
  TechnologyExperience: [],
  CareerPath: null,
}

/**
 * Mock OpenAI completion response
 */
export const createMockOpenAIResponse = (data: ExtractedCvData, tokensUsed: number = 1500) => ({
  choices: [
    {
      message: {
        content: JSON.stringify(data),
      },
    },
  ],
  usage: {
    total_tokens: tokensUsed,
  },
})

/**
 * Mock OpenAI error responses
 */
export const mockOpenAIErrors = {
  rateLimitError: new Error('Rate limit exceeded'),
  timeoutError: new Error('Request timeout'),
  invalidApiKeyError: new Error('Invalid API key'),
  malformedResponseError: new Error('Malformed response from OpenAI'),
  jsonParseError: new Error('Failed to parse JSON response'),
  validationError: new Error('Response validation failed'),
}

/**
 * OpenAI Mock Manager for consistent mocking across tests
 */
export class OpenAIMockManager {
  private stubs: sinon.SinonStub[] = []

  /**
   * Mock successful OpenAI response
   */
  mockSuccessfulResponse(data: ExtractedCvData = mockExtractedCvData, tokensUsed: number = 1500) {
    const mockResponse = createMockOpenAIResponse(data, tokensUsed)
    const stub = sinon.stub().resolves(mockResponse)
    this.stubs.push(stub)
    return stub
  }

  /**
   * Mock OpenAI error response
   */
  mockErrorResponse(error: Error = mockOpenAIErrors.rateLimitError) {
    const stub = sinon.stub().rejects(error)
    this.stubs.push(stub)
    return stub
  }

  /**
   * Mock OpenAI response with retry behavior
   */
  mockResponseWithRetries(
    failCount: number,
    finalData: ExtractedCvData = mockExtractedCvData,
    error: Error = mockOpenAIErrors.rateLimitError
  ) {
    const stub = sinon.stub()
    
    // First `failCount` calls will fail
    for (let i = 0; i < failCount; i++) {
      stub.onCall(i).rejects(error)
    }
    
    // Final call succeeds
    stub.onCall(failCount).resolves(createMockOpenAIResponse(finalData))
    
    this.stubs.push(stub)
    return stub
  }

  /**
   * Mock malformed JSON response
   */
  mockMalformedJsonResponse() {
    const malformedResponse = {
      choices: [
        {
          message: {
            content: '{ invalid json content',
          },
        },
      ],
      usage: {
        total_tokens: 100,
      },
    }
    const stub = sinon.stub().resolves(malformedResponse)
    this.stubs.push(stub)
    return stub
  }

  /**
   * Mock empty response
   */
  mockEmptyResponse() {
    const emptyResponse = {
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
      usage: {
        total_tokens: 50,
      },
    }
    const stub = sinon.stub().resolves(emptyResponse)
    this.stubs.push(stub)
    return stub
  }

  /**
   * Clean up all stubs
   */
  restore() {
    this.stubs.forEach(stub => {
      if (stub && typeof stub.restore === 'function') {
        stub.restore()
      }
    })
    this.stubs = []
  }
}

/**
 * Helper function to create a mock OpenAI client
 */
export const createMockOpenAIClient = (mockManager: OpenAIMockManager) => {
  return {
    chat: {
      completions: {
        create: mockManager.mockSuccessfulResponse(),
      },
    },
  }
}

/**
 * Sample CV text for testing
 */
export const sampleCvTexts = {
  comprehensive: `
    John Doe
    Senior Software Engineer
    Email: john.doe@email.com
    Phone: +1-555-0123
    Address: 123 Main St, City, State 12345
    
    OBJECTIVE
    Seeking a senior software engineer position to lead development teams and architect scalable solutions.
    
    EDUCATION
    University of Technology
    Bachelor of Computer Science
    September 2008 - June 2012
    GPA: 3.8/4.0
    
    WORK EXPERIENCE
    TechCorp Inc - Software Engineer (January 2020 - Present)
    • Develop and maintain web applications using React and Node.js
    • Led migration to microservices architecture, improved performance by 40%
    
    StartupXYZ - Junior Developer (June 2018 - December 2019)
    • Built mobile applications using React Native
    • Delivered 3 mobile apps with 100k+ downloads
    
    SKILLS
    Technical: JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker
    Soft Skills: Leadership, Communication, Problem Solving, Team Collaboration
    
    CERTIFICATIONS
    AWS Certified Solutions Architect (March 2021 - March 2024)
    
    PROJECTS
    E-commerce Platform - Lead Developer
    Built scalable e-commerce platform handling 10k+ daily users
    Technologies: React, Node.js, PostgreSQL, Redis
    
    LANGUAGES
    English (Native), Spanish (Intermediate)
    
    AWARDS
    Hackathon Winner - First place in company hackathon (October 2021)
    
    INTERESTS
    Open Source, Machine Learning, Photography
  `,
  minimal: `
    Jane Smith
    Email: jane@email.com
  `,
  malformed: `
    !@#$%^&*()_+{}|:"<>?[]\\;',./ Random text with special characters
    No structured information here
  `,
  empty: '',
}
