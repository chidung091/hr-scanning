import OpenAI from 'openai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import CvSubmission from '#models/cv_submission'
import AiCriteria from '#models/ai_criteria'
import CandidateEvaluation from '#models/candidate_evaluation'
import { ExtractedCvData } from './openai_service.js'

/**
 * Interface for AI evaluation input data
 */
interface EvaluationInput {
  candidateData: ExtractedCvData
  questionnaireResponses: any
  jobRequirements: any
  aiCriteria: AiCriteria[]
  candidateId: number
  jobId: number
  cvSubmissionId: number
}

/**
 * Interface for AI evaluation result
 */
interface EvaluationResult {
  candidateId: number
  jobId: number
  score: number
  strengths: string[]
  weaknesses: string[]
  explanation: string
  recommendation: 'Proceed to next round' | 'Consider with caution' | 'Do not proceed'
  linkedCriteriaIds: number[]
  linkedQuestionnaireResponseIds: number[]
}

/**
 * Interface for AI evaluation processing result
 */
interface EvaluationProcessingResult {
  success: boolean
  data?: EvaluationResult
  error?: string
  tokensUsed?: number
  processingTime?: number
}

/**
 * AI Evaluation Service for candidate assessment
 */
export class AiEvaluationService {
  private client: OpenAI
  private config: {
    maxRetries: number
    retryDelay: number
    timeout: number
    model: string
  }

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
      retryDelay: 1000,
      timeout: 60000, // 60 seconds for evaluation
      model: 'gpt-4o-mini',
    }
  }

  /**
   * Evaluate a candidate for a specific job
   */
  async evaluateCandidate(cvSubmissionId: number): Promise<EvaluationProcessingResult> {
    const startTime = Date.now()

    try {
      // Gather all required data with retry mechanism
      const inputData = await this.gatherEvaluationDataWithRetry(cvSubmissionId)

      if (!inputData) {
        return {
          success: false,
          error: 'Unable to gather required data for evaluation',
          processingTime: Date.now() - startTime,
        }
      }

      logger.info('Starting AI candidate evaluation', {
        candidateId: inputData.candidateId,
        jobId: inputData.jobId,
        cvSubmissionId: inputData.cvSubmissionId,
        model: this.config.model,
      })

      const systemPrompt = this.buildSystemPrompt(inputData)
      const userPrompt = this.buildUserPrompt(inputData)

      const result = await this.callOpenAIWithRetry(systemPrompt, userPrompt, inputData)

      const processingTime = Date.now() - startTime

      logger.info('AI candidate evaluation completed', {
        success: result.success,
        processingTime,
        tokensUsed: result.tokensUsed,
        candidateId: inputData.candidateId,
        jobId: inputData.jobId,
      })

      return {
        ...result,
        processingTime,
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      logger.error('AI candidate evaluation failed', {
        error: error.message,
        processingTime,
        cvSubmissionId,
      })

      return {
        success: false,
        error: error.message,
        processingTime,
      }
    }
  }

  /**
   * Gather all required data for evaluation with retry mechanism
   */
  private async gatherEvaluationDataWithRetry(
    cvSubmissionId: number
  ): Promise<EvaluationInput | null> {
    const maxRetries = 3
    const retryDelay = 2000 // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const data = await this.gatherEvaluationData(cvSubmissionId)

      if (data) {
        return data
      }

      if (attempt < maxRetries) {
        logger.info(
          `Retrying evaluation data gathering (attempt ${attempt + 1}/${maxRetries}) in ${retryDelay}ms`,
          {
            cvSubmissionId,
          }
        )
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }

    return null
  }

  /**
   * Gather all required data for evaluation
   */
  private async gatherEvaluationData(cvSubmissionId: number): Promise<EvaluationInput | null> {
    try {
      // Get CV submission with related data
      const cvSubmission = await CvSubmission.query()
        .where('id', cvSubmissionId)
        .preload('processedCv', (processedQuery) => {
          processedQuery.where('processing_status', 'completed')
        })
        .preload('questionnaireResponse')
        .preload('job')
        .first()

      logger.info('CV submission found', {
        cvSubmissionId,
        hasProcessedCv: !!cvSubmission?.processedCv,
        processingStatus: cvSubmission?.processedCv?.processingStatus,
        hasJob: !!cvSubmission?.job,
        hasQuestionnaire: !!cvSubmission?.questionnaireResponse,
      })

      if (!cvSubmission) {
        logger.error('CV submission not found', { cvSubmissionId })
        return null
      }

      // Check if CV is processed
      if (!cvSubmission.processedCv || cvSubmission.processedCv.processingStatus !== 'completed') {
        logger.error('CV not processed yet', {
          cvSubmissionId,
          hasProcessedCv: !!cvSubmission.processedCv,
          processingStatus: cvSubmission.processedCv?.processingStatus || 'no processed CV found',
        })
        return null
      }

      // Get AI criteria
      const aiCriteria = await AiCriteria.getForEvaluation()

      if (aiCriteria.length === 0) {
        logger.error('No AI criteria found for evaluation')
        return null
      }

      // Extract candidate data
      const candidateData = cvSubmission.processedCv.extractedData as ExtractedCvData
      const questionnaireResponses = cvSubmission.questionnaireResponse?.responses || {}
      const jobRequirements = cvSubmission.job

      return {
        candidateData,
        questionnaireResponses,
        jobRequirements,
        aiCriteria,
        candidateId: cvSubmission.id, // Using submission ID as candidate ID
        jobId: cvSubmission.jobId || 0,
        cvSubmissionId: cvSubmission.id,
      }
    } catch (error) {
      logger.error('Error gathering evaluation data', { error: error.message, cvSubmissionId })
      return null
    }
  }

  /**
   * Build system prompt for AI evaluation
   */
  private buildSystemPrompt(inputData: EvaluationInput): string {
    const criteriaList = inputData.aiCriteria
      .map(
        (criteria) =>
          `- ${criteria.name} (Weight: ${(criteria.weight * 100).toFixed(1)}%): ${criteria.description}`
      )
      .join('\n')

    return `Role: Expert HR AI Assistant for candidate evaluation

Task: Evaluate a job candidate based on their CV data, questionnaire responses, and job requirements using company-specific criteria.

Evaluation Criteria:
${criteriaList}

Instructions:
1. Analyze the candidate's qualifications against the job requirements
2. Evaluate based on the weighted criteria provided
3. Consider both technical skills and cultural fit
4. Provide a balanced assessment with specific examples
5. Score from 1-10 (1=Poor, 4=Below Average, 6=Average, 8=Good, 10=Excellent)
6. Provide 2-5 specific strengths with examples
7. Provide 1-3 areas for improvement or concerns
8. Write a concise explanation of your reasoning
9. Make a clear recommendation based on the evaluation

Recommendation Guidelines:
- "Proceed to next round": Score 7-10, strong match with minimal concerns
- "Consider with caution": Score 5-6, some strengths but notable concerns
- "Do not proceed": Score 1-4, significant gaps or misalignment

Return ONLY valid JSON following the exact schema. Be professional, fair, and objective in your assessment.`
  }

  /**
   * Build user prompt with candidate data
   */
  private buildUserPrompt(inputData: EvaluationInput): string {
    return `Please evaluate this candidate for the following position:

JOB INFORMATION:
Position: ${inputData.jobRequirements.jobTitle}
Requirements: ${inputData.jobRequirements.requirements}
Preferred Qualifications: ${inputData.jobRequirements.preferredQualifications}
Responsibilities: ${inputData.jobRequirements.responsibilities}

CANDIDATE DATA:
Name: ${inputData.candidateData.PersonalInformation.Name}
Experience: ${inputData.candidateData.YearExperience} years
Desired Position: ${inputData.candidateData.JobObjective.DesiredPosition}
Career Goals: ${inputData.candidateData.JobObjective.CareerGoals}

Education: ${JSON.stringify(inputData.candidateData.Education, null, 2)}
Work Experience: ${JSON.stringify(inputData.candidateData.WorkExperience, null, 2)}
Technical Skills: ${inputData.candidateData.Skills.Technical.join(', ')}
Soft Skills: ${inputData.candidateData.Skills.Soft.join(', ')}
Certifications: ${JSON.stringify(inputData.candidateData.Certifications, null, 2)}
Projects: ${JSON.stringify(inputData.candidateData.Projects, null, 2)}
Languages: ${JSON.stringify(inputData.candidateData.Languages, null, 2)}

QUESTIONNAIRE RESPONSES:
${JSON.stringify(inputData.questionnaireResponses, null, 2)}

EVALUATION CRITERIA IDS (for linking):
${inputData.aiCriteria.map((c) => `${c.id}: ${c.name}`).join(', ')}

QUESTIONNAIRE RESPONSE IDS (for linking):
Available response IDs: [1, 2, 3, 4, 5, 6] (standard questionnaire responses)

Required JSON Schema:
{
  "candidateId": ${inputData.candidateId},
  "jobId": ${inputData.jobId},
  "score": "integer 1-10",
  "strengths": ["array of 2-5 specific strength points"],
  "weaknesses": ["array of 1-3 specific weakness points"],
  "explanation": "brief paragraph explaining the reasoning",
  "recommendation": "Proceed to next round | Consider with caution | Do not proceed",
  "linkedCriteriaIds": [array of relevant criteria IDs from evaluation],
  "linkedQuestionnaireResponseIds": [array of relevant questionnaire response IDs]
}`
  }

  /**
   * Call OpenAI API with retry logic
   */
  private async callOpenAIWithRetry(
    systemPrompt: string,
    userPrompt: string,
    _inputData: EvaluationInput
  ): Promise<EvaluationProcessingResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.info(`OpenAI evaluation API call attempt ${attempt}/${this.config.maxRetries}`)

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
          temperature: 0.3, // Some creativity for evaluation insights
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error('No content received from OpenAI')
        }

        const evaluationData = JSON.parse(content) as EvaluationResult
        this.validateEvaluationData(evaluationData)

        return {
          success: true,
          data: evaluationData,
          tokensUsed: completion.usage?.total_tokens || 0,
        }
      } catch (error) {
        lastError = error as Error

        logger.warn(`OpenAI evaluation API call attempt ${attempt} failed`, {
          error: error.message,
          attempt,
          maxRetries: this.config.maxRetries,
        })

        if (error.message.includes('JSON') || error.message.includes('validation')) {
          break
        }

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
   * Validate the evaluation data structure
   */
  private validateEvaluationData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid evaluation data structure')
    }

    const requiredProperties = [
      'candidateId',
      'jobId',
      'score',
      'strengths',
      'weaknesses',
      'explanation',
      'recommendation',
      'linkedCriteriaIds',
      'linkedQuestionnaireResponseIds',
    ]

    for (const prop of requiredProperties) {
      if (!(prop in data)) {
        throw new Error(`Missing required property: ${prop}`)
      }
    }

    if (!Number.isInteger(data.score) || data.score < 1 || data.score > 10) {
      throw new Error('Score must be an integer between 1 and 10')
    }

    if (!Array.isArray(data.strengths) || data.strengths.length < 2 || data.strengths.length > 5) {
      throw new Error('Strengths must be an array with 2-5 items')
    }

    if (
      !Array.isArray(data.weaknesses) ||
      data.weaknesses.length < 1 ||
      data.weaknesses.length > 3
    ) {
      throw new Error('Weaknesses must be an array with 1-3 items')
    }

    const validRecommendations = [
      'Proceed to next round',
      'Consider with caution',
      'Do not proceed',
    ]
    if (!validRecommendations.includes(data.recommendation)) {
      throw new Error('Invalid recommendation value')
    }

    if (
      !Array.isArray(data.linkedCriteriaIds) ||
      !Array.isArray(data.linkedQuestionnaireResponseIds)
    ) {
      throw new Error('Linked IDs must be arrays')
    }
  }

  /**
   * Save evaluation result to database
   */
  async saveEvaluation(
    evaluationData: EvaluationResult,
    metadata: {
      tokensUsed?: number
      processingTime?: number
      evaluationModel?: string
    }
  ): Promise<CandidateEvaluation> {
    const evaluation = await CandidateEvaluation.create({
      candidateId: evaluationData.candidateId,
      jobId: evaluationData.jobId,
      cvSubmissionId: evaluationData.candidateId, // Using submission ID as candidate ID
      score: evaluationData.score,
      strengths: evaluationData.strengths,
      weaknesses: evaluationData.weaknesses,
      explanation: evaluationData.explanation,
      recommendation: evaluationData.recommendation,
      linkedCriteriaIds: evaluationData.linkedCriteriaIds,
      linkedQuestionnaireResponseIds: evaluationData.linkedQuestionnaireResponseIds,
      evaluationModel: metadata.evaluationModel || this.config.model,
      tokensUsed: metadata.tokensUsed || null,
      evaluationTimeMs: metadata.processingTime || null,
      status: 'completed',
    })

    return evaluation
  }
}

// Export singleton instance
export default new AiEvaluationService()
