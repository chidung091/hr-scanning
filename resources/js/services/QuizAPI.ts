import type {
  QuizType,
  QuizStartResponse,
  QuestionResponse,
  AnswerResponse,
  JapaneseExplanation,
} from '../types/index.ts'

interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

/**
 * QuizAPI Service - Handles all quiz-related API calls
 */
export class QuizAPI {
  private baseURL: string
  private csrfToken: string | null

  constructor() {
    this.baseURL = '/api'
    this.csrfToken =
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null
  }

  /**
   * Start a new quiz session
   */
  async startQuiz(type: QuizType): Promise<QuizStartResponse> {
    const response = await this._makeRequest('/quiz/start', {
      method: 'POST',
      body: JSON.stringify({ type }),
    })

    if (!response.ok) {
      throw new Error('Failed to start quiz')
    }

    return response.json()
  }

  /**
   * Get the current question for a session
   */
  async getQuestion(sessionId: string): Promise<QuestionResponse> {
    const response = await this._makeRequest(`/quiz/${sessionId}/question`)

    if (!response.ok) {
      throw new Error('Failed to get question')
    }

    return response.json()
  }

  /**
   * Submit an answer for the current question
   */
  async submitAnswer(sessionId: string, answer: string): Promise<AnswerResponse> {
    const response = await this._makeRequest(`/quiz/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit answer')
    }

    return response.json()
  }

  /**
   * Get progress for a quiz session
   */
  async getProgress(sessionId: string): Promise<any> {
    const response = await this._makeRequest(`/quiz/${sessionId}/progress`)

    if (!response.ok) {
      throw new Error('Failed to get progress')
    }

    return response.json()
  }

  /**
   * Submit text to Japanese Teacher for explanation
   */
  async getJapaneseExplanation(input: string): Promise<APIResponse<JapaneseExplanation>> {
    const response = await this._makeRequest('/japanese-teacher', {
      method: 'POST',
      body: JSON.stringify({ input }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get explanation')
    }

    return response.json()
  }

  /**
   * Private method to make API requests with common headers
   */
  private async _makeRequest(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const defaultOptions: RequestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.csrfToken && { 'X-CSRF-TOKEN': this.csrfToken }),
      },
    }

    const mergedOptions: RequestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    return fetch(`${this.baseURL}${endpoint}`, mergedOptions)
  }
}
