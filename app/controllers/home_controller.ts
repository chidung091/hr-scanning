import type { HttpContext } from '@adonisjs/core/http'
// Ensure Edge module augmentation is loaded
import '@adonisjs/core/providers/edge_provider'
import logger from '@adonisjs/core/services/logger'
import OpenAIService from '#services/openai_service'
import QuizSessionService from '#services/quiz_session_service'

export default class HomeController {
  /**
   * @index
   * @summary Display the Japanese learning quiz homepage
   * @description Renders the main quiz interface where users can start Hiragana or Katakana quizzes
   * @tag Quiz Interface
   */
  async index({ view }: HttpContext) {
    return view.render('pages/home')
  }

  /**
   * @startQuiz
   * @summary Start a new Japanese character quiz session
   * @description Creates a new quiz session with 20 questions and 3 hearts/lives. Returns the first question and session details.
   * @tag Quiz Management
   */
  async startQuiz({ request, response }: HttpContext) {
    const { type } = request.only(['type'])

    if (!type || (type !== 'hiragana' && type !== 'katakana')) {
      return response.badRequest({ error: 'Invalid quiz type. Must be "hiragana" or "katakana"' })
    }

    const result = QuizSessionService.startSession(type)
    return response.json(result)
  }

  /**
   * @getQuestion
   * @summary Get the current question for a quiz session
   * @description Retrieves the current question or completion status for an active quiz session
   * @tag Quiz Management
   * @paramPath sessionId - Quiz session identifier
   */
  async getQuestion({ params, response }: HttpContext) {
    const { sessionId } = params
    const result = QuizSessionService.getQuestion(sessionId)
    if (!result) {
      return response.notFound({ error: 'Quiz session not found' })
    }
    return response.json(result)
  }

  /**
   * @submitAnswer
   * @summary Submit an answer for the current question
   * @description Processes the user's answer, updates score and hearts, and returns feedback. Incorrect answers reduce hearts by 1.
   * @tag Quiz Management
   * @paramPath sessionId - Quiz session identifier
   */
  async submitAnswer({ params, request, response }: HttpContext) {
    const { sessionId } = params
    const { answer } = request.only(['answer'])

    const result = QuizSessionService.submitAnswer(sessionId, answer)
    if (!result) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    if ('error' in result) {
      return response.badRequest({ error: result.error })
    }

    return response.json(result)
  }

  /**
   * @getProgress
   * @summary Get current progress for a quiz session
   * @description Returns detailed progress information including score, completion status, and health status
   * @tag Quiz Management
   * @paramPath sessionId - Quiz session identifier
   */
  async getProgress({ params, response }: HttpContext) {
    const { sessionId } = params
    const result = QuizSessionService.getProgress(sessionId)

    if (!result) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    return response.json(result)
  }

  /**
   * @japaneseTeacher
   * @summary Japanese Teacher - Explain Japanese words/grammar for Vietnamese learners
   * @description Takes a Japanese word or grammar pattern and returns detailed explanation in Vietnamese with romaji, furigana, examples, and usage notes
   * @tag Japanese Teacher
   */
  async japaneseTeacher({ request, response }: HttpContext) {
    try {
      const { input } = request.only(['input'])

      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        return response.badRequest({
          error: 'Input is required. Please provide a Japanese word or grammar pattern.',
        })
      }

      const openaiService = OpenAIService.getInstance()

      if (!openaiService.configured) {
        return response.internalServerError({
          error: 'OpenAI service is not properly configured. Please check API key.',
        })
      }

      const aiResponse = await openaiService.explainJapaneseForVietnamese(input.trim())
      logger.info('aiResponse: %s', aiResponse)
      // Try to parse the JSON response
      let parsedResponse
      try {
        parsedResponse = JSON.parse(aiResponse)
        logger.info('parsedResponse: %o', parsedResponse)
      } catch (parseError) {
        logger.error('Failed to parse OpenAI response as JSON:', parseError)
        return response.internalServerError({
          error: 'Failed to parse AI response. Please try again.',
        })
      }

      // Validate the response structure
      const requiredFields = [
        'input',
        'romaji',
        'furigana',
        'meaning_vietnamese',
        'pronunciation_guide',
        'example_japanese',
        'example_vietnamese',
        'note',
      ]
      const missingFields = requiredFields.filter((field) => !parsedResponse[field])

      if (missingFields.length > 0) {
        console.error('Missing fields in AI response:', missingFields)
        return response.internalServerError({
          error: 'Incomplete response from AI. Please try again.',
        })
      }

      return response.ok({
        success: true,
        data: parsedResponse,
      })
    } catch (error) {
      console.error('Japanese Teacher API Error:', error)
      return response.internalServerError({
        error: 'An error occurred while processing your request. Please try again.',
      })
    }
  }
}
