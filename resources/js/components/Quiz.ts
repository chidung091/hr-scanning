import { QuizAPI } from '../services/QuizAPI.ts'
import { StorageService } from '../services/StorageService.ts'
import { AnimationUtils } from '../utils/animations.ts'
import { MobileDetection } from '../utils/mobileDetection.ts'
import type {
  QuizType,
  Question,
  QuizStartResponse,
  AnswerResponse,
  QuestionResponse,
} from '../types/index.ts'

/**
 * Quiz Component - Handles the main quiz functionality
 */
export class Quiz {
  private quizAPI: QuizAPI
  private storageService: StorageService

  // Quiz state
  private sessionId: string | null = null
  private currentQuestion: Question | null = null
  private quizType: QuizType | null = null
  private score: number = 0
  private questionNumber: number = 0
  private totalQuestions: number = 20
  private hearts: number = 3
  private maxHearts: number = 3
  private isGameOver: boolean = false
  private isAnswered: boolean = false

  // DOM elements
  private heroSection: HTMLElement | null = null
  private quizInterface: HTMLElement | null = null
  private quizResults: HTMLElement | null = null
  private aboutSection: HTMLElement | null = null
  private progressSection: HTMLElement | null = null

  private quizTitle: HTMLElement | null = null
  private questionCounter: HTMLElement | null = null
  private scoreDisplay: HTMLElement | null = null
  private heartsDisplay: HTMLElement | null = null
  private progressBar: HTMLElement | null = null
  private characterDisplay: HTMLElement | null = null
  private answerOptions: HTMLElement | null = null
  private feedbackDisplay: HTMLElement | null = null
  private feedbackMessage: HTMLElement | null = null
  private correctAnswer: HTMLElement | null = null
  private nextButton: HTMLElement | null = null

  private finalScore: HTMLElement | null = null
  private finalPercentage: HTMLElement | null = null

  private gameOverModal: HTMLElement | null = null
  private gameOverScore: HTMLElement | null = null
  private gameOverPercentage: HTMLElement | null = null

  private startHiraganaBtn: HTMLElement | null = null
  private startKatakanaBtn: HTMLElement | null = null
  private restartBtn: HTMLElement | null = null
  private switchModeBtn: HTMLElement | null = null
  private gameOverRestartBtn: HTMLElement | null = null
  private gameOverHomeBtn: HTMLElement | null = null

  constructor() {
    this.quizAPI = new QuizAPI()
    this.storageService = new StorageService()

    this.initializeElements()
    this.bindEvents()
  }

  /**
   * Initialize DOM elements
   */
  private initializeElements(): void {
    // Sections
    this.heroSection = document.querySelector('.bg-gradient-to-br')
    this.quizInterface = document.getElementById('quiz-interface')
    this.quizResults = document.getElementById('quiz-results')
    this.aboutSection = document.getElementById('about')
    this.progressSection = document.getElementById('progress')

    // Quiz elements
    this.quizTitle = document.getElementById('quiz-title')
    this.questionCounter = document.getElementById('question-counter')
    this.scoreDisplay = document.getElementById('score-display')
    this.heartsDisplay = document.getElementById('hearts-display')
    this.progressBar = document.getElementById('progress-bar')
    this.characterDisplay = document.getElementById('character-display')
    this.answerOptions = document.getElementById('answer-options')
    this.feedbackDisplay = document.getElementById('feedback-display')
    this.feedbackMessage = document.getElementById('feedback-message')
    this.correctAnswer = document.getElementById('correct-answer')
    this.nextButton = document.getElementById('next-question')

    // Results elements
    this.finalScore = document.getElementById('final-score')
    this.finalPercentage = document.getElementById('final-percentage')

    // Game Over Modal elements
    this.gameOverModal = document.getElementById('game-over-modal')
    this.gameOverScore = document.getElementById('game-over-score')
    this.gameOverPercentage = document.getElementById('game-over-percentage')

    // Buttons
    this.startHiraganaBtn = document.getElementById('start-hiragana-quiz')
    this.startKatakanaBtn = document.getElementById('start-katakana-quiz')
    this.restartBtn = document.getElementById('restart-quiz')
    this.switchModeBtn = document.getElementById('switch-mode')
    this.gameOverRestartBtn = document.getElementById('game-over-restart')
    this.gameOverHomeBtn = document.getElementById('game-over-home')
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Quiz start buttons
    this.startHiraganaBtn?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.startQuiz('hiragana')
    })

    this.startKatakanaBtn?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.startQuiz('katakana')
    })

    // Quiz control buttons
    this.nextButton?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.nextQuestion()
    })

    this.restartBtn?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.restartQuiz()
    })

    this.switchModeBtn?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.switchMode()
    })

    // Game Over Modal events
    this.gameOverRestartBtn?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.restartFromGameOver()
    })

    this.gameOverHomeBtn?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.goHome()
    })

    // Keyboard navigation
    this.initializeKeyboardNavigation()
  }

  /**
   * Initialize keyboard navigation
   */
  private initializeKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      // Allow 1-4 keys to select answers
      if (['1', '2', '3', '4'].includes(e.key)) {
        const answerButtons = document.querySelectorAll(
          '.answer-option'
        ) as NodeListOf<HTMLButtonElement>
        const buttonIndex = parseInt(e.key) - 1
        if (answerButtons[buttonIndex] && !answerButtons[buttonIndex].disabled) {
          answerButtons[buttonIndex].click()
        }
      }

      // Allow Enter or Space to proceed to next question
      if ((e.key === 'Enter' || e.key === ' ') && !(e.target as HTMLElement).matches('button')) {
        const nextButton = document.getElementById('next-question')
        if (nextButton && !nextButton.classList.contains('hidden')) {
          e.preventDefault()
          nextButton.click()
        }
      }
    })
  }

  /**
   * Start a new quiz
   */
  public async startQuiz(type: QuizType): Promise<void> {
    try {
      const data: QuizStartResponse = await this.quizAPI.startQuiz(type)

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

      this.showQuizInterface()
      this.displayQuestion()
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Failed to start quiz. Please try again.')
    }
  }

  /**
   * Show the quiz interface
   */
  private showQuizInterface(): void {
    this.heroSection?.classList.add('hidden')
    this.aboutSection?.classList.add('hidden')
    this.progressSection?.classList.add('hidden')
    this.quizResults?.classList.add('hidden')
    this.quizInterface?.classList.remove('hidden')

    if (this.quizTitle) {
      this.quizTitle.textContent = this.quizType === 'hiragana' ? 'Hiragana Quiz' : 'Katakana Quiz'
    }
  }

  /**
   * Display the current question
   */
  private displayQuestion(): void {
    if (!this.currentQuestion) return

    // Update UI elements
    if (this.questionCounter) {
      this.questionCounter.textContent = `Question ${this.questionNumber} of ${this.totalQuestions}`
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Score: ${this.score}`
    }

    this.updateHeartsDisplay()

    // Animate progress bar
    const progressPercentage = (this.questionNumber / this.totalQuestions) * 100
    if (this.progressBar) {
      AnimationUtils.animateProgressBar(this.progressBar as HTMLElement, progressPercentage)
    }

    // Display character
    if (this.characterDisplay) {
      this.characterDisplay.textContent = this.currentQuestion.character
    }

    // Create answer options
    this.createAnswerOptions()

    // Hide feedback and next button
    this.feedbackDisplay?.classList.add('hidden')
    this.nextButton?.classList.add('hidden')
    this.isAnswered = false
  }

  /**
   * Create answer option buttons
   */
  private createAnswerOptions(): void {
    if (!this.answerOptions || !this.currentQuestion) return

    this.answerOptions.innerHTML = ''

    this.currentQuestion.options.forEach((option) => {
      const button = document.createElement('button')
      button.className =
        'answer-option bg-gray-100 hover:bg-primary-50 active:bg-primary-100 border-2 border-transparent hover:border-primary-300 focus:border-primary-500 rounded-lg p-4 sm:p-4 text-base sm:text-lg font-medium transition-colors-smooth transform hover:scale-[1.02] active:scale-[0.98] min-h-[44px] quiz-button'
      button.textContent = option
      button.addEventListener('click', () => this.selectAnswer(option, button))
      this.answerOptions?.appendChild(button)
    })
  }

  /**
   * Update hearts display
   */
  private updateHeartsDisplay(): void {
    if (!this.heartsDisplay) return

    const previousHearts = this.heartsDisplay.querySelectorAll('.heart.text-red-500').length
    this.heartsDisplay.innerHTML = ''

    for (let i = 0; i < this.maxHearts; i++) {
      const heart = document.createElement('span')
      heart.className = 'heart text-xl transition-all-smooth'

      if (i < this.hearts) {
        heart.textContent = '❤️'
        heart.classList.add('text-red-500')
      } else {
        heart.textContent = '🤍'
        heart.classList.add('text-gray-300')

        // Animate heart loss if this heart was just lost
        if (i === this.hearts && previousHearts > this.hearts) {
          setTimeout(() => AnimationUtils.animateHeartLoss(heart), 100)
        }
      }

      this.heartsDisplay.appendChild(heart)
    }
  }

  /**
   * Handle answer selection
   */
  private async selectAnswer(selectedAnswer: string, buttonElement: HTMLElement): Promise<void> {
    if (this.isAnswered || !this.sessionId) return
    this.isAnswered = true

    // Animate button press
    AnimationUtils.animateButtonPress(buttonElement)

    // Add haptic feedback for mobile
    if (MobileDetection.isMobile()) {
      MobileDetection.vibrate(50)
    }

    try {
      const data: AnswerResponse = await this.quizAPI.submitAnswer(this.sessionId, selectedAnswer)

      this.score = data.score
      this.questionNumber = data.questionNumber
      this.hearts = data.hearts
      this.isGameOver = data.isGameOver

      // Show feedback
      this.showFeedback(data.isCorrect, data.correctAnswer, buttonElement)

      // Check for game over due to no hearts
      if (data.isGameOver && data.gameOverReason === 'no_hearts') {
        setTimeout(() => {
          this.showGameOverModal()
        }, 2000)
      } else if (data.completed) {
        this.showResults(data)
      } else {
        this.nextButton?.classList.remove('hidden')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
      this.isAnswered = false
    }
  }

  /**
   * Show answer feedback
   */
  private showFeedback(
    isCorrect: boolean,
    correctAnswer: string,
    selectedButton: HTMLElement
  ): void {
    // Disable all buttons
    const allButtons = this.answerOptions?.querySelectorAll(
      '.answer-option'
    ) as NodeListOf<HTMLButtonElement>
    allButtons?.forEach((btn) => {
      btn.disabled = true
      btn.classList.remove('hover:bg-primary-50', 'hover:border-primary-300')
    })

    // Highlight correct and incorrect answers with animations
    allButtons?.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800')
        AnimationUtils.animateCorrectAnswer(btn)
      } else if (btn === selectedButton && !isCorrect) {
        btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800')
        AnimationUtils.animateIncorrectAnswer(btn)
      }
    })

    // Show feedback message
    if (this.feedbackMessage) {
      this.feedbackMessage.textContent = isCorrect ? '✅ Correct!' : '❌ Wrong!'
      this.feedbackMessage.className = `text-lg font-semibold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`
    }

    if (!isCorrect && this.correctAnswer) {
      this.correctAnswer.textContent = `Correct answer: ${correctAnswer}`
      this.correctAnswer.classList.remove('hidden')
    } else if (this.correctAnswer) {
      this.correctAnswer.classList.add('hidden')
    }

    this.feedbackDisplay?.classList.remove('hidden')
  }

  /**
   * Move to next question
   */
  private async nextQuestion(): Promise<void> {
    if (!this.sessionId) return

    try {
      const data: QuestionResponse = await this.quizAPI.getQuestion(this.sessionId)

      if (data.completed) {
        if (data.isGameOver && data.gameOverReason === 'no_hearts') {
          this.showGameOverModal()
        } else {
          this.showResults(data)
        }
      } else {
        this.currentQuestion = data.question || null
        this.hearts = data.hearts
        this.isGameOver = data.isGameOver

        // Animate question transition
        const questionDisplay = this.characterDisplay?.parentElement
        const answerOptions = this.answerOptions

        if (questionDisplay && answerOptions) {
          await AnimationUtils.animateQuestionTransition(
            questionDisplay as HTMLElement,
            answerOptions as HTMLElement
          )
        }

        // Display question after animation
        setTimeout(() => {
          this.displayQuestion()
        }, 200)
      }
    } catch (error) {
      console.error('Error getting next question:', error)
      alert('Failed to load next question. Please try again.')
    }
  }

  /**
   * Show quiz results
   */
  private showResults(data: AnswerResponse | QuestionResponse): void {
    this.quizInterface?.classList.add('hidden')
    this.quizResults?.classList.remove('hidden')

    const finalScore = data.finalScore || this.score
    const percentage = Math.round((finalScore / this.totalQuestions) * 100)
    const heartsRemaining = data.heartsRemaining || this.hearts

    if (this.finalScore) {
      this.finalScore.textContent = `Score: ${finalScore}/${this.totalQuestions}`
    }
    if (this.finalPercentage) {
      this.finalPercentage.textContent = `${percentage}% Correct • ${heartsRemaining} ❤️ remaining`
    }

    // Update progress tracking
    if (this.quizType) {
      this.storageService.updateStats(this.quizType, finalScore, this.totalQuestions)

      // Dispatch custom event for progress update
      window.dispatchEvent(
        new CustomEvent('quizCompleted', {
          detail: { type: this.quizType, score: finalScore, total: this.totalQuestions },
        })
      )
    }
  }

  /**
   * Show game over modal
   */
  private showGameOverModal(): void {
    const percentage = Math.round((this.score / this.questionNumber) * 100)

    if (this.gameOverScore) {
      this.gameOverScore.textContent = `Score: ${this.score}/${this.questionNumber}`
    }
    if (this.gameOverPercentage) {
      this.gameOverPercentage.textContent = `${percentage}% Correct`
    }

    this.gameOverModal?.classList.remove('hidden')
  }

  /**
   * Hide game over modal
   */
  private hideGameOverModal(): void {
    this.gameOverModal?.classList.add('hidden')
  }

  /**
   * Restart quiz from game over state
   */
  private restartFromGameOver(): void {
    this.hideGameOverModal()
    this.restartQuiz()
  }

  /**
   * Restart current quiz
   */
  private restartQuiz(): void {
    if (this.quizType) {
      this.startQuiz(this.quizType)
    }
  }

  /**
   * Switch to different quiz mode
   */
  private switchMode(): void {
    this.showHome()
  }

  /**
   * Go back to home screen
   */
  private goHome(): void {
    this.hideGameOverModal()
    this.showHome()
  }

  /**
   * Show home screen
   */
  public showHome(): void {
    this.quizInterface?.classList.add('hidden')
    this.quizResults?.classList.add('hidden')
    this.heroSection?.classList.remove('hidden')
    this.aboutSection?.classList.remove('hidden')
    this.progressSection?.classList.remove('hidden')
  }

  // Public getters for app state
  public getSessionId(): string | null {
    return this.sessionId
  }

  public getQuizType(): QuizType | null {
    return this.quizType
  }

  public getScore(): number {
    return this.score
  }

  public getQuestionNumber(): number {
    return this.questionNumber
  }

  public getHearts(): number {
    return this.hearts
  }

  public getIsGameOver(): boolean {
    return this.isGameOver
  }
}
