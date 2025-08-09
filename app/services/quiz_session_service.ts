import JapaneseCharactersService, { type QuizQuestion } from '#services/japanese_characters_service'

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
  lastActivity: Date
}

class QuizSessionService {
  private sessions: Map<string, QuizSession> = new Map()
  private readonly SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startCleanup()
  }

  startSession(type: 'hiragana' | 'katakana') {
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
      lastActivity: new Date(),
    }

    this.sessions.set(sessionId, session)

    return {
      sessionId,
      type,
      totalQuestions: questions.length,
      currentQuestion: questions[0],
      hearts: session.hearts,
      maxHearts: session.maxHearts,
      isGameOver: session.isGameOver,
    }
  }

  getQuestion(sessionId: string) {
    const session = this.getSessionWithActivity(sessionId)
    if (!session) {
      return null
    }

    if (session.currentQuestionIndex >= session.questions.length || session.isGameOver) {
      return {
        completed: true,
        score: session.score,
        totalQuestions: session.questions.length,
        answers: session.answers,
        hearts: session.hearts,
        maxHearts: session.maxHearts,
        isGameOver: session.isGameOver,
        gameOverReason: session.hearts === 0 ? 'no_hearts' : 'completed',
      }
    }

    const currentQuestion = session.questions[session.currentQuestionIndex]

    return {
      question: currentQuestion,
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questions.length,
      score: session.score,
      hearts: session.hearts,
      maxHearts: session.maxHearts,
      isGameOver: session.isGameOver,
    }
  }

  submitAnswer(sessionId: string, answer: string) {
    const session = this.getSessionWithActivity(sessionId)
    if (!session) {
      return null
    }

    if (session.currentQuestionIndex >= session.questions.length || session.isGameOver) {
      return { error: 'Quiz already completed or game over' }
    }

    const currentQuestion = session.questions[session.currentQuestionIndex]
    const isCorrect = answer === currentQuestion.correctAnswer

    if (isCorrect) {
      session.score++
    } else {
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

    return {
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
    }
  }

  getProgress(sessionId: string) {
    const session = this.getSessionWithActivity(sessionId)
    if (!session) {
      return null
    }

    return {
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
    }
  }

  cleanupExpired() {
    const now = new Date()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime()
      if (timeSinceLastActivity > this.SESSION_TTL_MS) {
        expiredSessions.push(sessionId)
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId)
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired quiz sessions`)
    }
  }

  private startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 5 * 60 * 1000)
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private updateSessionActivity(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
  }

  private getSessionWithActivity(sessionId: string): QuizSession | undefined {
    const session = this.sessions.get(sessionId)
    if (session) {
      this.updateSessionActivity(sessionId)
      return session
    }
    return undefined
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

export default new QuizSessionService()
export type { QuizSession }
