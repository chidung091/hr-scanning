import type { HttpContext } from '@adonisjs/core/http'
import JapaneseCharactersService, { type QuizQuestion } from '#services/japanese_characters_service'

interface QuizSession {
  id: string
  type: 'hiragana' | 'katakana'
  questions: QuizQuestion[]
  currentQuestionIndex: number
  score: number
  answers: Array<{
    question: QuizQuestion
    userAnswer: string
    isCorrect: boolean
  }>
  startTime: Date
}

export default class HomeController {
  private static quizSessions: Map<string, QuizSession> = new Map()

  async index({ view }: HttpContext) {
    return view.render('pages/home')
  }

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
      answers: [],
      startTime: new Date(),
    }

    HomeController.quizSessions.set(sessionId, session)

    return response.json({
      sessionId,
      type,
      totalQuestions: questions.length,
      currentQuestion: questions[0],
    })
  }

  async getQuestion({ params, response }: HttpContext) {
    const { sessionId } = params
    const session = HomeController.quizSessions.get(sessionId)

    if (!session) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    if (session.currentQuestionIndex >= session.questions.length) {
      return response.json({
        completed: true,
        score: session.score,
        totalQuestions: session.questions.length,
        answers: session.answers,
      })
    }

    const currentQuestion = session.questions[session.currentQuestionIndex]

    return response.json({
      question: currentQuestion,
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      score: session.score,
    })
  }

  async submitAnswer({ params, request, response }: HttpContext) {
    const { sessionId } = params
    const { answer } = request.only(['answer'])

    const session = HomeController.quizSessions.get(sessionId)

    if (!session) {
      return response.notFound({ error: 'Quiz session not found' })
    }

    if (session.currentQuestionIndex >= session.questions.length) {
      return response.badRequest({ error: 'Quiz already completed' })
    }

    const currentQuestion = session.questions[session.currentQuestionIndex]
    const isCorrect = answer === currentQuestion.correctAnswer

    if (isCorrect) {
      session.score++
    }

    session.answers.push({
      question: currentQuestion,
      userAnswer: answer,
      isCorrect,
    })

    session.currentQuestionIndex++

    const isCompleted = session.currentQuestionIndex >= session.questions.length

    return response.json({
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      score: session.score,
      questionNumber: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      completed: isCompleted,
      ...(isCompleted && {
        finalScore: session.score,
        percentage: Math.round((session.score / session.questions.length) * 100),
        answers: session.answers,
      }),
    })
  }

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
      completed: session.currentQuestionIndex >= session.questions.length,
    })
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
