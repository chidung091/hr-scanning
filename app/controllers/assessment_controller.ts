import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import CvSubmission from '#models/cv_submission'
import QuestionnaireResponse from '#models/questionnaire_response'
import CandidateEvaluation from '#models/candidate_evaluation'
import { ASSESSMENT_CONFIG, getQuestionById } from '../config/assessment_questions.js'
import { DateTime } from 'luxon'
import { createQuestionAnswerValidator } from '#validators/assessment_validator'
import aiEvaluationService from '#services/ai_evaluation_service'
import logger from '@adonisjs/core/services/logger'

export default class AssessmentController {
  /**
   * Trigger AI evaluation for a candidate (background process)
   */
  private async triggerAiEvaluation(cvSubmissionId: number): Promise<void> {
    try {
      // Check if evaluation already exists
      const existingEvaluation = await CandidateEvaluation.query()
        .where('cv_submission_id', cvSubmissionId)
        .first()

      if (existingEvaluation) {
        logger.info('AI evaluation already exists for submission', { cvSubmissionId })
        return
      }

      logger.info('Starting automatic AI evaluation', { cvSubmissionId })

      // Run AI evaluation in background
      const evaluationResult = await aiEvaluationService.evaluateCandidate(cvSubmissionId)

      if (evaluationResult.success) {
        // Save evaluation to database
        const savedEvaluation = await aiEvaluationService.saveEvaluation(evaluationResult.data!, {
          tokensUsed: evaluationResult.tokensUsed,
          processingTime: evaluationResult.processingTime,
          evaluationModel: 'gpt-4o-mini',
        })

        logger.info('AI evaluation completed successfully', {
          cvSubmissionId,
          evaluationId: savedEvaluation.id,
          score: savedEvaluation.score,
          recommendation: savedEvaluation.recommendation,
        })
      } else {
        logger.error('AI evaluation failed', {
          cvSubmissionId,
          error: evaluationResult.error,
        })
      }
    } catch (error) {
      logger.error('Error in automatic AI evaluation', {
        cvSubmissionId,
        error: error.message,
      })
    }
  }
  /**
   * @swagger
   * /api/assessment/start:
   *   post:
   *     tags: [Assessment]
   *     summary: Start a new assessment session
   *     description: Initialize a progressive assessment session for a CV submission
   *     security:
   *       - csrfToken: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - submission_id
   *             properties:
   *               submission_id:
   *                 type: string
   *                 description: The CV submission ID
   *                 example: "clx1234567890"
   *               language:
   *                 type: string
   *                 enum: [en, vi]
   *                 default: en
   *                 description: Preferred language for the assessment
   *     responses:
   *       200:
   *         description: Assessment session started successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         assessmentId:
   *                           type: string
   *                           example: "clx1234567890"
   *                         currentQuestion:
   *                           type: integer
   *                           example: 1
   *                         totalQuestions:
   *                           type: integer
   *                           example: 6
   *                         progress:
   *                           type: integer
   *                           example: 0
   *                         question:
   *                           $ref: '#/components/schemas/AssessmentQuestion'
   *                         canGoBack:
   *                           type: boolean
   *                           example: false
   *                         canSkip:
   *                           type: boolean
   *                           example: false
   *       400:
   *         description: Bad request - missing or invalid parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: CV submission not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async startAssessment({ request, response }: HttpContext) {
    try {
      const submissionId = request.input('submission_id')
      const language = request.input('language', 'en')

      if (!submissionId) {
        return response.status(400).json({
          success: false,
          message: 'Submission ID is required',
        })
      }

      // Find the CV submission
      const cvSubmission = await CvSubmission.findBy('submissionId', submissionId)
      if (!cvSubmission) {
        return response.status(404).json({
          success: false,
          message: 'CV submission not found',
        })
      }

      // Check if assessment already exists
      let questionnaireResponse = await QuestionnaireResponse.findBy(
        'cvSubmissionId',
        cvSubmission.id
      )

      if (questionnaireResponse) {
        // If assessment is already completed, return error
        if (questionnaireResponse.isCompleted) {
          return response.status(400).json({
            success: false,
            message: 'Assessment has already been completed',
          })
        }

        // If assessment is expired, reset it
        if (questionnaireResponse.isExpired()) {
          questionnaireResponse.currentQuestion = 1
          questionnaireResponse.questionsCompleted = 0
          questionnaireResponse.responses = {}
          questionnaireResponse.startedAt = DateTime.now()
          questionnaireResponse.lastActivityAt = DateTime.now()
          await questionnaireResponse.save()
        }
      } else {
        // Create new assessment session
        questionnaireResponse = await QuestionnaireResponse.create({
          submissionId: cuid(),
          cvSubmissionId: cvSubmission.id,
          responses: {},
          currentQuestion: 1,
          questionsCompleted: 0,
          isCompleted: false,
          languagePreference: language,
          startedAt: DateTime.now(),
          lastActivityAt: DateTime.now(),
        })
      }

      // Get first question
      const firstQuestion = getQuestionById(1)
      if (!firstQuestion) {
        return response.status(500).json({
          success: false,
          message: 'Assessment configuration error',
        })
      }

      return response.json({
        success: true,
        data: {
          assessmentId: questionnaireResponse.submissionId,
          currentQuestion: questionnaireResponse.currentQuestion,
          totalQuestions: ASSESSMENT_CONFIG.totalQuestions,
          progress: questionnaireResponse.getProgressPercentage(),
          question: {
            id: firstQuestion.id,
            key: firstQuestion.key,
            type: firstQuestion.type,
            required: firstQuestion.required,
            title: firstQuestion.translations[language as 'en' | 'vi'].title,
            description: firstQuestion.translations[language as 'en' | 'vi'].description,
            placeholder: firstQuestion.translations[language as 'en' | 'vi'].placeholder,
            options: firstQuestion.translations[language as 'en' | 'vi'].options,
            validation: firstQuestion.validation,
          },
          canGoBack: false,
          canSkip: !firstQuestion.required,
        },
      })
    } catch (error) {
      console.error('Start assessment error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to start assessment',
      })
    }
  }

  /**
   * Get current question for assessment
   */
  async getCurrentQuestion({ request, response }: HttpContext) {
    try {
      const assessmentId = request.param('assessmentId')
      const language = request.input('language', 'en')

      const questionnaireResponse = await QuestionnaireResponse.findBy('submissionId', assessmentId)
      if (!questionnaireResponse) {
        return response.status(404).json({
          success: false,
          message: 'Assessment not found',
        })
      }

      if (questionnaireResponse.isCompleted) {
        return response.json({
          success: true,
          data: {
            completed: true,
            progress: 100,
            // Score and assessment result removed from user-facing API
          },
        })
      }

      if (questionnaireResponse.isExpired()) {
        return response.status(400).json({
          success: false,
          message: 'Assessment session has expired',
        })
      }

      const currentQuestion = getQuestionById(questionnaireResponse.currentQuestion)
      if (!currentQuestion) {
        return response.status(500).json({
          success: false,
          message: 'Question not found',
        })
      }

      return response.json({
        success: true,
        data: {
          assessmentId: questionnaireResponse.submissionId,
          currentQuestion: questionnaireResponse.currentQuestion,
          totalQuestions: ASSESSMENT_CONFIG.totalQuestions,
          progress: questionnaireResponse.getProgressPercentage(),
          question: {
            id: currentQuestion.id,
            key: currentQuestion.key,
            type: currentQuestion.type,
            required: currentQuestion.required,
            title: currentQuestion.translations[language as 'en' | 'vi'].title,
            description: currentQuestion.translations[language as 'en' | 'vi'].description,
            placeholder: currentQuestion.translations[language as 'en' | 'vi'].placeholder,
            options: currentQuestion.translations[language as 'en' | 'vi'].options,
            validation: currentQuestion.validation,
          },
          previousAnswer: questionnaireResponse.responses[currentQuestion.key] || null,
          canGoBack: questionnaireResponse.currentQuestion > 1,
          canSkip: !currentQuestion.required,
          completed: false,
        },
      })
    } catch (error) {
      console.error('Get current question error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get current question',
      })
    }
  }

  /**
   * Submit answer for current question and move to next
   */
  async submitAnswer({ request, response }: HttpContext) {
    try {
      const assessmentId = request.param('assessmentId')
      const questionId = request.input('question_id')
      const answer = request.input('answer')
      const action = request.input('action', 'next') // 'next', 'previous', 'skip', 'skip_all'

      const questionnaireResponse = await QuestionnaireResponse.findBy('submissionId', assessmentId)
      if (!questionnaireResponse) {
        return response.status(404).json({
          success: false,
          message: 'Assessment not found',
        })
      }

      if (questionnaireResponse.isCompleted) {
        return response.status(400).json({
          success: false,
          message: 'Assessment has already been completed',
        })
      }

      if (questionnaireResponse.isExpired()) {
        return response.status(400).json({
          success: false,
          message: 'Assessment session has expired',
        })
      }

      const currentQuestion = getQuestionById(questionId)
      if (!currentQuestion) {
        return response.status(400).json({
          success: false,
          message: 'Invalid question ID',
        })
      }

      // Validate required questions
      if (
        action === 'next' &&
        currentQuestion.required &&
        (answer === null || answer === undefined || answer === '')
      ) {
        return response.status(400).json({
          success: false,
          message: 'This question is required and cannot be empty',
        })
      }

      // Validate answer if provided and not skipping
      if (action !== 'skip' && answer !== null && answer !== undefined) {
        try {
          const answerValidator = createQuestionAnswerValidator(
            currentQuestion.type,
            currentQuestion.validation
          )
          await answerValidator.validate({ answer })
        } catch (validationError: any) {
          return response.status(400).json({
            success: false,
            message: validationError.messages?.[0]?.message || 'Invalid answer provided',
            errors: validationError.messages || [],
          })
        }
      }

      // Handle different actions
      let nextQuestionId = questionnaireResponse.currentQuestion

      if (action === 'previous') {
        nextQuestionId = Math.max(1, questionnaireResponse.currentQuestion - 1)
        // Update current question for previous navigation
        questionnaireResponse.currentQuestion = nextQuestionId
      } else if (action === 'skip_all') {
        // Skip all remaining questions and complete the assessment
        questionnaireResponse.currentQuestion = ASSESSMENT_CONFIG.totalQuestions + 1
        questionnaireResponse.questionsCompleted = ASSESSMENT_CONFIG.totalQuestions
        questionnaireResponse.isCompleted = true
        questionnaireResponse.completedAt = DateTime.now()

        // Calculate final score based on existing responses
        const scoring = questionnaireResponse.calculateScore()
        questionnaireResponse.totalScore = scoring.totalScore
        questionnaireResponse.assessmentResult = scoring.assessmentResult

        nextQuestionId = questionnaireResponse.currentQuestion
      } else if (action === 'next' || action === 'skip') {
        // Save answer if provided
        if (answer !== null && answer !== undefined && action !== 'skip') {
          const responseUpdate = { [currentQuestion.key]: answer }
          questionnaireResponse.updateProgress(questionId, responseUpdate)
          // updateProgress already increments currentQuestion, so use that value
          nextQuestionId = questionnaireResponse.currentQuestion
        } else {
          // For skip action or when no answer provided, manually increment
          nextQuestionId = questionnaireResponse.currentQuestion + 1
          questionnaireResponse.currentQuestion = nextQuestionId
          // IMPORTANT: Also increment questionsCompleted for skipped questions
          // This ensures progress calculation reaches 100% when all questions are processed
          questionnaireResponse.questionsCompleted = Math.max(
            questionnaireResponse.questionsCompleted,
            questionId
          )

          // Check if completed after skipping
          if (questionnaireResponse.questionsCompleted >= ASSESSMENT_CONFIG.totalQuestions) {
            questionnaireResponse.isCompleted = true
            questionnaireResponse.completedAt = DateTime.now()

            // Calculate final score based on existing responses
            const scoring = questionnaireResponse.calculateScore()
            questionnaireResponse.totalScore = scoring.totalScore
            questionnaireResponse.assessmentResult = scoring.assessmentResult
          }
        }
      }
      questionnaireResponse.lastActivityAt = DateTime.now()
      await questionnaireResponse.save()

      // Check if assessment is completed
      if (questionnaireResponse.isCompleted) {
        // Update CV submission status
        const cvSubmission = await questionnaireResponse
          .related('cvSubmission')
          .query()
          .select('id', 'submission_id', 'status')
          .first()
        if (cvSubmission) {
          cvSubmission.status = 'submitted'
          await cvSubmission.save()

          // Trigger AI evaluation automatically after assessment completion
          // Run in background without blocking the response
          this.triggerAiEvaluation(cvSubmission.id).catch((error) => {
            logger.error('Background AI evaluation failed', {
              cvSubmissionId: cvSubmission.id,
              error: error.message,
            })
          })
        }

        return response.json({
          success: true,
          data: {
            completed: true,
            progress: 100,
            submissionId: cvSubmission?.submissionId,
            // Score and assessment result removed from user-facing API
          },
        })
      }

      // Get next question
      const nextQuestion = getQuestionById(nextQuestionId)
      if (!nextQuestion) {
        return response.status(500).json({
          success: false,
          message: 'Next question not found',
        })
      }

      const language = questionnaireResponse.languagePreference as 'en' | 'vi'

      return response.json({
        success: true,
        data: {
          assessmentId: questionnaireResponse.submissionId,
          currentQuestion: nextQuestionId,
          totalQuestions: ASSESSMENT_CONFIG.totalQuestions,
          progress: questionnaireResponse.getProgressPercentage(),
          question: {
            id: nextQuestion.id,
            key: nextQuestion.key,
            type: nextQuestion.type,
            required: nextQuestion.required,
            title: nextQuestion.translations[language].title,
            description: nextQuestion.translations[language].description,
            placeholder: nextQuestion.translations[language].placeholder,
            options: nextQuestion.translations[language].options,
            validation: nextQuestion.validation,
          },
          previousAnswer: questionnaireResponse.responses[nextQuestion.key] || null,
          canGoBack: nextQuestionId > 1,
          canSkip: !nextQuestion.required,
          completed: false,
        },
      })
    } catch (error) {
      console.error('Submit answer error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to submit answer',
      })
    }
  }

  /**
   * Get assessment progress
   */
  async getProgress({ request, response }: HttpContext) {
    try {
      const assessmentId = request.param('assessmentId')

      const questionnaireResponse = await QuestionnaireResponse.findBy('submissionId', assessmentId)
      if (!questionnaireResponse) {
        return response.status(404).json({
          success: false,
          message: 'Assessment not found',
        })
      }

      return response.json({
        success: true,
        data: {
          assessmentId: questionnaireResponse.submissionId,
          currentQuestion: questionnaireResponse.currentQuestion,
          totalQuestions: ASSESSMENT_CONFIG.totalQuestions,
          questionsCompleted: questionnaireResponse.questionsCompleted,
          progress: questionnaireResponse.getProgressPercentage(),
          isCompleted: questionnaireResponse.isCompleted,
          isExpired: questionnaireResponse.isExpired(),
          startedAt: questionnaireResponse.startedAt,
          lastActivityAt: questionnaireResponse.lastActivityAt,
          completedAt: questionnaireResponse.completedAt,
        },
      })
    } catch (error) {
      console.error('Get progress error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get assessment progress',
      })
    }
  }
}
