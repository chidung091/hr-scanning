import type { HttpContext } from '@adonisjs/core/http'
import JapaneseCharactersService, { type QuizQuestion } from '#services/japanese_characters_service'
import OpenAIService from '#services/openai_service'

interface QuizSession {
  id: string
  type: 'hiragana' | 'katakana'
  questions: QuizQuestion[]
  currentQuestionIndex: number
  score: number
  hearts: number
  maxHearts: number
  answers: Array<{
    question: QuizQuestion
    userAnswer: string
    isCorrect: boolean
  }>
  startTime: Date
  isGameOver: boolean
}

export default class HomeController {
  private static quizSessions: Map<string, QuizSession> = new Map()

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

    const questions = JapaneseCharactersService.generateQuizQuestions(type, 20)
    const sessionId = this.generateSessionId()

    const session: QuizSession = {
      id: sessionId,
      type,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      hearts: 3,
      maxHearts: 3,
      answers: [],
      startTime: new Date(),
      isGameOver: false,
    }

    HomeController.quizSessions.set(sessionId, session)

    return response.json({
      sessionId,
      type,
      totalQuestions: questions.length,
      currentQuestion: questions[0],
      hearts: session.hearts,
      maxHearts: session.maxHearts,
      isGameOver: session.isGameOver,
    })
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
    const session = HomeController.quizSessions.get(sessionId)

    if (!session) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    if (session.currentQuestionIndex >= session.questions.length || session.isGameOver) {
      return response.json({
        completed: true,
        score: session.score,
        totalQuestions: session.questions.length,
        answers: session.answers,
        hearts: session.hearts,
        maxHearts: session.maxHearts,
        isGameOver: session.isGameOver,
        gameOverReason: session.hearts === 0 ? 'no_hearts' : 'completed',
      })
    }

    const currentQuestion = session.questions[session.currentQuestionIndex]

    return response.json({
      question: currentQuestion,
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      score: session.score,
      hearts: session.hearts,
      maxHearts: session.maxHearts,
      isGameOver: session.isGameOver,
    })
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

    const session = HomeController.quizSessions.get(sessionId)

    if (!session) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    if (session.currentQuestionIndex >= session.questions.length || session.isGameOver) {
      return response.badRequest({ error: 'Quiz already completed or game over' })
    }

    const currentQuestion = session.questions[session.currentQuestionIndex]
    const isCorrect = answer === currentQuestion.correctAnswer

    if (isCorrect) {
      session.score++
    } else {
      // Lose a heart for incorrect answer
      session.hearts--
      if (session.hearts <= 0) {
        session.isGameOver = true
      }
    }

    session.answers.push({
      question: currentQuestion,
      userAnswer: answer,
      isCorrect,
    })

    session.currentQuestionIndex++

    const isCompleted =
      session.currentQuestionIndex >= session.questions.length || session.isGameOver

    return response.json({
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      score: session.score,
      questionNumber: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      completed: isCompleted,
      hearts: session.hearts,
      maxHearts: session.maxHearts,
      isGameOver: session.isGameOver,
      gameOverReason: session.isGameOver && session.hearts === 0 ? 'no_hearts' : null,
      ...(isCompleted && {
        finalScore: session.score,
        percentage: Math.round((session.score / session.questions.length) * 100),
        answers: session.answers,
        heartsRemaining: session.hearts,
      }),
    })
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
    const session = HomeController.quizSessions.get(sessionId)

    if (!session) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    return response.json({
      sessionId: session.id,
      type: session.type,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      score: session.score,
      percentage:
        session.questions.length > 0
          ? Math.round((session.score / session.currentQuestionIndex) * 100)
          : 0,
      completed: session.currentQuestionIndex >= session.questions.length || session.isGameOver,
      hearts: session.hearts,
      maxHearts: session.maxHearts,
      isGameOver: session.isGameOver,
      gameOverReason: session.isGameOver && session.hearts === 0 ? 'no_hearts' : null,
    })
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

      const openaiService = new OpenAIService()

      if (!openaiService.isConfigured()) {
        return response.internalServerError({
          error: 'OpenAI service is not properly configured. Please check API key.',
        })
      }

      const aiResponse = await openaiService.explainJapaneseForVietnamese(input.trim())

      // Try to parse the JSON response
      let parsedResponse
      try {
        parsedResponse = JSON.parse(aiResponse)
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError)
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

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
