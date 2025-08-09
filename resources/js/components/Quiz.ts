import { QuizState } from './QuizState'
import { QuizView } from './QuizView'
import { StorageService } from '../services/StorageService'
import { MobileDetection } from '../utils/mobileDetection'
import type {
  QuizType,
  AnswerResponse,
  QuestionResponse,
} from '../types/index'

/**
 * Orchestrates quiz state and view modules
 */
export class Quiz {
  private state: QuizState
  private view: QuizView
  private storageService: StorageService

  constructor(state?: QuizState, view?: QuizView) {
    this.state = state || new QuizState()
    this.view = view || new QuizView()
    this.storageService = new StorageService()

    this.bindEvents()
    this.initializeKeyboardNavigation()
  }

  /** Bind UI events */
  private bindEvents(): void {
    this.view.startHiraganaBtn?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.startQuiz('hiragana')
    })

    this.view.startKatakanaBtn?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.startQuiz('katakana')
    })

    this.view.nextButton?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.nextQuestion()
    })

    this.view.restartBtn?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.restartQuiz()
    })

    this.view.switchModeBtn?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.switchMode()
    })

    this.view.gameOverRestartBtn?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.restartFromGameOver()
    })

    this.view.gameOverHomeBtn?.addEventListener('click', (e) => {
      this.view.animateButtonPress(e.target as HTMLElement)
      this.goHome()
    })
  }

  /** Keyboard navigation */
  private initializeKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const answerButtons = document.querySelectorAll(
          '.answer-option'
        ) as NodeListOf<HTMLButtonElement>
        const buttonIndex = parseInt(e.key) - 1
        if (answerButtons[buttonIndex] && !answerButtons[buttonIndex].disabled) {
          answerButtons[buttonIndex].click()
        }
      }

      if ((e.key === 'Enter' || e.key === ' ') && !(e.target as HTMLElement).matches('button')) {
        const nextButton = this.view.nextButton
        if (nextButton && !nextButton.classList.contains('hidden')) {
          e.preventDefault()
          nextButton.click()
        }
      }
    })
  }

  /** Start a new quiz */
  public async startQuiz(type: QuizType): Promise<void> {
    try {
      await this.state.startQuiz(type)
      this.view.showQuizInterface(type)

      const question = this.state.getCurrentQuestion()
      if (question) {
        this.view.displayQuestion(
          this.state.getQuestionNumber(),
          this.state.getTotalQuestions(),
          this.state.getScore(),
          question,
          this.state.getHearts(),
          this.state.getMaxHearts(),
          (answer, btn) => this.selectAnswer(answer, btn)
        )
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Failed to start quiz. Please try again.')
    }
  }

  /** Handle answer selection */
  private async selectAnswer(selectedAnswer: string, buttonElement: HTMLElement): Promise<void> {
    if (this.state.getIsAnswered() || !this.state.getSessionId()) return
    this.state.setAnswered(true)

    this.view.animateButtonPress(buttonElement)

    if (MobileDetection.isMobile()) {
      MobileDetection.vibrate(50)
    }

    try {
      const data: AnswerResponse = await this.state.submitAnswer(selectedAnswer)

      this.view.showFeedback(data.isCorrect, data.correctAnswer, buttonElement)
      this.view.updateHeartsDisplay(this.state.getHearts(), this.state.getMaxHearts())

      if (data.isGameOver && data.gameOverReason === 'no_hearts') {
        setTimeout(() => {
          this.view.showGameOverModal(this.state.getScore(), this.state.getQuestionNumber())
        }, 2000)
      } else if (data.completed) {
        this.handleQuizCompletion(data.finalScore || this.state.getScore(), data.heartsRemaining || this.state.getHearts())
      } else {
        this.view.showNextButton()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
      this.state.setAnswered(false)
    }
  }

  /** Retrieve next question */
  private async nextQuestion(): Promise<void> {
    if (!this.state.getSessionId()) return

    try {
      const data: QuestionResponse = await this.state.getNextQuestion()

      if (data.completed) {
        if (data.isGameOver && data.gameOverReason === 'no_hearts') {
          this.view.showGameOverModal(this.state.getScore(), this.state.getQuestionNumber())
        } else {
          this.handleQuizCompletion(data.finalScore || this.state.getScore(), data.heartsRemaining || this.state.getHearts())
        }
      } else {
        const question = this.state.getCurrentQuestion()
        const questionDisplay = this.view.characterDisplay?.parentElement as HTMLElement
        const answerOptions = this.view.answerOptions as HTMLElement

        if (questionDisplay && answerOptions) {
          await this.view.animateQuestionTransition(questionDisplay, answerOptions)
        }

        setTimeout(() => {
          if (question) {
            this.view.displayQuestion(
              this.state.getQuestionNumber(),
              this.state.getTotalQuestions(),
              this.state.getScore(),
              question,
              this.state.getHearts(),
              this.state.getMaxHearts(),
              (answer, btn) => this.selectAnswer(answer, btn)
            )
          }
        }, 200)
      }
    } catch (error) {
      console.error('Error getting next question:', error)
      alert('Failed to load next question. Please try again.')
    }
  }

  /** Handle quiz completion */
  private handleQuizCompletion(finalScore: number, heartsRemaining: number): void {
    this.view.showResults(finalScore, this.state.getTotalQuestions(), heartsRemaining)

    const type = this.state.getQuizType()
    if (type) {
      this.storageService.updateStats(type, finalScore, this.state.getTotalQuestions())
      window.dispatchEvent(
        new CustomEvent('quizCompleted', {
          detail: { type, score: finalScore, total: this.state.getTotalQuestions() },
        })
      )
    }
  }

  /** Restart the current quiz */
  private restartQuiz(): void {
    const type = this.state.getQuizType()
    if (type) {
      this.startQuiz(type)
    }
  }

  /** Switch quiz mode */
  private switchMode(): void {
    this.showHome()
  }

  /** Restart after game over */
  private restartFromGameOver(): void {
    this.view.hideGameOverModal()
    this.restartQuiz()
  }

  /** Return to home screen */
  private goHome(): void {
    this.view.hideGameOverModal()
    this.showHome()
  }

  /** Show home screen */
  public showHome(): void {
    this.view.showHome()
  }

  // Getters for app.ts
  public getSessionId(): string | null {
    return this.state.getSessionId()
  }

  public getQuizType(): QuizType | null {
    return this.state.getQuizType()
  }

  public getScore(): number {
    return this.state.getScore()
  }

  public getQuestionNumber(): number {
    return this.state.getQuestionNumber()
  }

  public getHearts(): number {
    return this.state.getHearts()
  }

  public getIsGameOver(): boolean {
    return this.state.getIsGameOver()
  }
}

export default Quiz

