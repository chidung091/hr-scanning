import OpenAI from 'openai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

/**
 * Interface for the structured CV data that OpenAI should extract
 */
export interface ExtractedCvData {
  PersonalInformation: {
    Name: string
    DateOfBirth: string | null
    Gender: 'male' | 'female' | 'other' | null
    PhoneNumber: string | null
    Email: string | null
    Address: string | null
  }
  JobObjective: {
    DesiredPosition: string | null
    CareerGoals: string | null
  }
  Education: Array<{
    School: string
    Major: string | null
    DegreeLevel: string | null
    StartDate: string | null
    EndDate: string | null
    GPA: string | null
  }>
  WorkExperience: Array<{
    Company: string
    JobTitle: string | null
    Duration: string | null
    Description: string | null
    KeyAchievements: string | null
  }>
  Skills: {
    Technical: string[]
    Soft: string[]
  }
  Certifications: Array<{
    Name: string
    Issuer: string | null
    DateIssued: string | null
    ExpirationDate: string | null
  }>
  Projects: Array<{
    ProjectName: string
    Role: string | null
    Description: string | null
    Technologies: string[]
  }>
  Languages: Array<{
    Name: string
    Proficiency: string | null
  }>
  ExtracurricularAwards: Array<{
    Name: string
    Date: string | null
    RoleOrAchievement: string | null
  }>
  Interests: string[]
  YearExperience: number | null
  TechnologyExperience: string[]
  CareerPath: string | null
}

/**
 * OpenAI service configuration
 */
interface OpenAIServiceConfig {
  maxRetries: number
  retryDelay: number
  timeout: number
  model: string
}

/**
 * Result of OpenAI processing
 */
export interface OpenAIProcessingResult {
  success: boolean
  data?: ExtractedCvData
  error?: string
  tokensUsed?: number
  processingTime?: number
}

/**
 * OpenAI Service for CV data extraction and cleaning
 */
export class OpenAIService {
  private client: OpenAI
  private config: OpenAIServiceConfig

  constructor() {
    const apiKey = env.get('OPENAI_API_KEY')

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    })

    this.config = {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      timeout: 30000, // 30 seconds
      model: 'gpt-4o-mini', // Cost-effective model for CV processing
    }
  }

  /**
   * Extract structured data from CV text using OpenAI
   */
  async extractCvData(cvText: string): Promise<OpenAIProcessingResult> {
    const startTime = Date.now()

    try {
      // Validate input text
      if (!cvText || cvText.trim().length === 0) {
        const processingTime = Date.now() - startTime
        return {
          success: false,
          error: 'CV text is empty or contains no meaningful content',
          processingTime,
          tokensUsed: 0,
        }
      }

      logger.info('Starting OpenAI CV data extraction', {
        textLength: cvText.length,
        model: this.config.model,
      })

      const systemPrompt = this.buildSystemPrompt()
      const userPrompt = this.buildUserPrompt(cvText)

      const result = await this.callOpenAIWithRetry(systemPrompt, userPrompt)

      const processingTime = Date.now() - startTime

      logger.info('OpenAI CV data extraction completed', {
        success: result.success,
        processingTime,
        tokensUsed: result.tokensUsed,
      })

      return {
        ...result,
        processingTime,
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      logger.error('OpenAI CV data extraction failed', {
        error: error.message,
        processingTime,
        textLength: cvText.length,
      })

      return {
        success: false,
        error: error.message,
        processingTime,
      }
    }
  }

  /**
   * Build the system prompt for CV data extraction
   */
  private buildSystemPrompt(): string {
    return `Role: Professional CV data extraction assistant

Task: Clean and extract structured data from raw CV text

Input: Raw text extracted from PDF/DOCX CV files

Output: Structured JSON data following the specified schema

Instructions:
- Extract all available information according to the defined schema
- Use "Not found" or appropriate null values for missing information
- Maintain data accuracy and consistency
- Format dates as YYYY-MM-DD or YYYY-MM where applicable
- Calculate years of experience based on work history
- Aggregate technology experience from all sections
- Ensure all arrays are properly formatted
- Be conservative with data extraction - only include information that is clearly present
- For skills, separate technical skills (programming languages, frameworks, tools) from soft skills (communication, leadership, etc.)
- For work experience, extract key achievements separately from general job descriptions
- Calculate total years of experience by analyzing all work experience entries

Return ONLY valid JSON that matches the exact schema structure. Do not include any explanatory text before or after the JSON.`
  }

  /**
   * Build the user prompt with CV text
   */
  private buildUserPrompt(cvText: string): string {
    return `Please extract structured data from the following CV text and return it as JSON following the specified schema:

CV Text:
${cvText}

Required JSON Schema:
{
  "PersonalInformation": {
    "Name": "string",
    "DateOfBirth": "YYYY-MM-DD or null",
    "Gender": "male/female/other or null",
    "PhoneNumber": "string or null",
    "Email": "string or null",
    "Address": "string or null"
  },
  "JobObjective": {
    "DesiredPosition": "string or null",
    "CareerGoals": "string or null"
  },
  "Education": [
    {
      "School": "string",
      "Major": "string or null",
      "DegreeLevel": "string or null",
      "StartDate": "YYYY-MM or null",
      "EndDate": "YYYY-MM or null",
      "GPA": "string or null"
    }
  ],
  "WorkExperience": [
    {
      "Company": "string",
      "JobTitle": "string or null",
      "Duration": "string or null",
      "Description": "string or null",
      "KeyAchievements": "string or null"
    }
  ],
  "Skills": {
    "Technical": ["string array"],
    "Soft": ["string array"]
  },
  "Certifications": [
    {
      "Name": "string",
      "Issuer": "string or null",
      "DateIssued": "YYYY-MM or null",
      "ExpirationDate": "YYYY-MM or null"
    }
  ],
  "Projects": [
    {
      "ProjectName": "string",
      "Role": "string or null",
      "Description": "string or null",
      "Technologies": ["string array"]
    }
  ],
  "Languages": [
    {
      "Name": "string",
      "Proficiency": "string or null"
    }
  ],
  "ExtracurricularAwards": [
    {
      "Name": "string",
      "Date": "YYYY-MM or null",
      "RoleOrAchievement": "string or null"
    }
  ],
  "Interests": ["string array"],
  "YearExperience": "integer or null",
  "TechnologyExperience": ["string array"],
  "CareerPath": "string or null"
}`
  }

  /**
   * Call OpenAI API with retry logic
   */
  private async callOpenAIWithRetry(
    systemPrompt: string,
    userPrompt: string
  ): Promise<OpenAIProcessingResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.info(`OpenAI API call attempt ${attempt}/${this.config.maxRetries}`)

        const completion = await this.client.chat.completions.create({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.1, // Low temperature for consistent extraction
          max_tokens: 4000, // Sufficient for structured CV data
          response_format: { type: 'json_object' }, // Ensure JSON response
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error('No content received from OpenAI')
        }

        // Parse and validate JSON response
        const extractedData = JSON.parse(content) as ExtractedCvData
        this.validateExtractedData(extractedData)

        return {
          success: true,
          data: extractedData,
          tokensUsed: completion.usage?.total_tokens || 0,
        }
      } catch (error) {
        lastError = error as Error

        logger.warn(`OpenAI API call attempt ${attempt} failed`, {
          error: error.message,
          attempt,
          maxRetries: this.config.maxRetries,
        })

        // Don't retry on JSON parsing errors or validation errors
        if (error.message.includes('JSON') || error.message.includes('validation')) {
          break
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error occurred',
    }
  }

  /**
   * Validate the extracted data structure
   */
  private validateExtractedData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure: Expected object')
    }

    // Check required top-level properties
    const requiredProperties = [
      'PersonalInformation',
      'JobObjective',
      'Education',
      'WorkExperience',
      'Skills',
      'Certifications',
      'Projects',
      'Languages',
      'ExtracurricularAwards',
      'Interests',
      'YearExperience',
      'TechnologyExperience',
      'CareerPath',
    ]

    for (const prop of requiredProperties) {
      if (!(prop in data)) {
        throw new Error(`Missing required property: ${prop}`)
      }
    }

    // Validate array properties
    const arrayProperties = [
      'Education',
      'WorkExperience',
      'Certifications',
      'Projects',
      'Languages',
      'ExtracurricularAwards',
      'Interests',
      'TechnologyExperience',
    ]
    for (const prop of arrayProperties) {
      if (!Array.isArray(data[prop])) {
        throw new Error(`Property ${prop} must be an array`)
      }
    }

    // Validate Skills structure
    if (!data.Skills || typeof data.Skills !== 'object') {
      throw new Error('Skills must be an object')
    }
    if (!Array.isArray(data.Skills.Technical) || !Array.isArray(data.Skills.Soft)) {
      throw new Error('Skills.Technical and Skills.Soft must be arrays')
    }
  }
}

// Export singleton instance
export default new OpenAIService()
