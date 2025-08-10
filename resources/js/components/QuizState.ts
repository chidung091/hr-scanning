import { QuizAPI } from '../services/QuizAPI'
import type {
  QuizType,
  Question,
  N5QuizQuestion,
  QuizStartResponse,
  AnswerResponse,
  QuestionResponse,
} from '../types/index'

/**
 * Manages quiz session and state data
 */
export class QuizState {
  private quizAPI: QuizAPI
  private sessionId: string | null = null
  private quizType: QuizType | null = null
  private currentQuestion: Question | N5QuizQuestion | null = null
  private score = 0
  private questionNumber = 0
  private totalQuestions = 20
  private hearts = 3
  private maxHearts = 3
  private isGameOver = false
  private isAnswered = false

  constructor() {
    this.quizAPI = new QuizAPI()
  }

  /** Start a new quiz session */
  public async startQuiz(type: QuizType): Promise<QuizStartResponse> {
    const data = await this.quizAPI.startQuiz(type)

    this.sessionId = data.sessionId
    this.quizType = type
    this.totalQuestions = data.totalQuestions
    this.currentQuestion = data.currentQuestion
    this.score = 0
    this.hearts = data.hearts || 3
    this.maxHearts = data.maxHearts || 3
    this.isGameOver = data.isGameOver || false
    this.questionNumber = 1
    this.isAnswered = false

    return data
  }

  /** Submit an answer for the current question */
  public async submitAnswer(answer: string): Promise<AnswerResponse> {
    if (!this.sessionId) throw new Error('No active session')

    const data = await this.quizAPI.submitAnswer(this.sessionId, answer)

    this.score = data.score
    this.questionNumber = data.questionNumber
    this.hearts = data.hearts
    this.isGameOver = data.isGameOver
    this.isAnswered = true

    return data
  }

  /** Fetch the next question from the API */
  public async getNextQuestion(): Promise<QuestionResponse> {
    if (!this.sessionId) throw new Error('No active session')

    const data = await this.quizAPI.getQuestion(this.sessionId)

    if (!data.completed) {
      this.currentQuestion = data.question || null
      this.hearts = data.hearts
      this.isGameOver = data.isGameOver
      this.isAnswered = false
    }

    return data
  }

  /** Reset state to defaults */
  public restart(): void {
    this.sessionId = null
    this.quizType = null
    this.currentQuestion = null
    this.score = 0
    this.questionNumber = 0
    this.totalQuestions = 20
    this.hearts = 3
    this.maxHearts = 3
    this.isGameOver = false
    this.isAnswered = false
  }

  // Getters
  public getSessionId(): string | null {
    return this.sessionId
  }

  public getQuizType(): QuizType | null {
    return this.quizType
  }

  public getCurrentQuestion(): Question | N5QuizQuestion | null {
    return this.currentQuestion
  }

  public getScore(): number {
    return this.score
  }

  public getQuestionNumber(): number {
    return this.questionNumber
  }

  public getTotalQuestions(): number {
    return this.totalQuestions
  }

  public getHearts(): number {
    return this.hearts
  }

  public getMaxHearts(): number {
    return this.maxHearts
  }

  public getIsGameOver(): boolean {
    return this.isGameOver
  }

  public getIsAnswered(): boolean {
    return this.isAnswered
  }

  public setAnswered(value: boolean): void {
    this.isAnswered = value
  }
}

export default QuizState

