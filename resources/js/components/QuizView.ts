import { AnimationUtils } from '../utils/animations'
import type { QuizType, Question } from '../types/index'

/**
 * Handles all DOM manipulation and animations for the quiz
 */
export class QuizView {
  public heroSection: HTMLElement | null = null
  public quizInterface: HTMLElement | null = null
  public quizResults: HTMLElement | null = null
  public aboutSection: HTMLElement | null = null
  public progressSection: HTMLElement | null = null

  public quizTitle: HTMLElement | null = null
  public questionCounter: HTMLElement | null = null
  public scoreDisplay: HTMLElement | null = null
  public heartsDisplay: HTMLElement | null = null
  public progressBar: HTMLElement | null = null
  public characterDisplay: HTMLElement | null = null
  public answerOptions: HTMLElement | null = null
  public feedbackDisplay: HTMLElement | null = null
  public feedbackMessage: HTMLElement | null = null
  public correctAnswer: HTMLElement | null = null
  public nextButton: HTMLElement | null = null

  public finalScore: HTMLElement | null = null
  public finalPercentage: HTMLElement | null = null

  public gameOverModal: HTMLElement | null = null
  public gameOverScore: HTMLElement | null = null
  public gameOverPercentage: HTMLElement | null = null

  public startHiraganaBtn: HTMLElement | null = null
  public startKatakanaBtn: HTMLElement | null = null
  public restartBtn: HTMLElement | null = null
  public switchModeBtn: HTMLElement | null = null
  public gameOverRestartBtn: HTMLElement | null = null
  public gameOverHomeBtn: HTMLElement | null = null

  constructor() {
    this.initializeElements()
  }

  /** Initialize DOM references */
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

  /** Show quiz interface and hide home/progress sections */
  public showQuizInterface(type: QuizType): void {
    this.heroSection?.classList.add('hidden')
    this.aboutSection?.classList.add('hidden')
    this.progressSection?.classList.add('hidden')
    this.quizResults?.classList.add('hidden')
    this.quizInterface?.classList.remove('hidden')

    if (this.quizTitle) {
      this.quizTitle.textContent = type === 'hiragana' ? 'Hiragana Quiz' : 'Katakana Quiz'
    }
  }

  /** Display current question and options */
  public displayQuestion(
    questionNumber: number,
    totalQuestions: number,
    score: number,
    question: Question,
    hearts: number,
    maxHearts: number,
    onSelect: (answer: string, btn: HTMLElement) => void
  ): void {
    if (this.questionCounter) {
      this.questionCounter.textContent = `Question ${questionNumber} of ${totalQuestions}`
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Score: ${score}`
    }

    this.updateHeartsDisplay(hearts, maxHearts)

    const progressPercentage = (questionNumber / totalQuestions) * 100
    if (this.progressBar) {
      AnimationUtils.animateProgressBar(this.progressBar as HTMLElement, progressPercentage)
    }

    if (this.characterDisplay) {
      this.characterDisplay.textContent = question.character
    }

    this.createAnswerOptions(question.options, onSelect)

    this.feedbackDisplay?.classList.add('hidden')
    this.nextButton?.classList.add('hidden')
  }

  /** Create answer option buttons */
  private createAnswerOptions(
    options: string[],
    onSelect: (answer: string, btn: HTMLElement) => void
  ): void {
    if (!this.answerOptions) return

    this.answerOptions.innerHTML = ''

    options.forEach((option) => {
      const button = document.createElement('button')
      button.className =
        'answer-option bg-gray-100 hover:bg-primary-50 active:bg-primary-100 border-2 border-transparent hover:border-primary-300 focus:border-primary-500 rounded-lg p-4 sm:p-4 text-base sm:text-lg font-medium transition-colors-smooth transform hover:scale-[1.02] active:scale-[0.98] min-h-[44px] quiz-button'
      button.textContent = option
      button.addEventListener('click', () => onSelect(option, button))
      this.answerOptions?.appendChild(button)
    })
  }

  /** Update hearts display */
  public updateHeartsDisplay(hearts: number, maxHearts: number): void {
    if (!this.heartsDisplay) return

    const previousHearts = this.heartsDisplay.querySelectorAll('.heart.text-red-500').length
    this.heartsDisplay.innerHTML = ''

    for (let i = 0; i < maxHearts; i++) {
      const heart = document.createElement('span')
      heart.className = 'heart text-xl transition-all-smooth'

      if (i < hearts) {
        heart.textContent = '❤️'
        heart.classList.add('text-red-500')
      } else {
        heart.textContent = '🤍'
        heart.classList.add('text-gray-300')

        if (i === hearts && previousHearts > hearts) {
          setTimeout(() => AnimationUtils.animateHeartLoss(heart), 100)
        }
      }

      this.heartsDisplay.appendChild(heart)
    }
  }

  /** Show answer feedback */
  public showFeedback(
    isCorrect: boolean,
    correctAnswer: string,
    selectedButton: HTMLElement
  ): void {
    const allButtons = this.answerOptions?.querySelectorAll(
      '.answer-option'
    ) as NodeListOf<HTMLButtonElement>
    allButtons?.forEach((btn) => {
      btn.disabled = true
      btn.classList.remove('hover:bg-primary-50', 'hover:border-primary-300')
      if (btn.textContent === correctAnswer) {
        btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800')
        AnimationUtils.animateCorrectAnswer(btn)
      } else if (btn === selectedButton && !isCorrect) {
        btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800')
        AnimationUtils.animateIncorrectAnswer(btn)
      }
    })

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

  /** Show final quiz results */
  public showResults(finalScore: number, totalQuestions: number, heartsRemaining: number): void {
    this.quizInterface?.classList.add('hidden')
    this.quizResults?.classList.remove('hidden')

    const percentage = Math.round((finalScore / totalQuestions) * 100)
    if (this.finalScore) {
      this.finalScore.textContent = `Score: ${finalScore}/${totalQuestions}`
    }
    if (this.finalPercentage) {
      this.finalPercentage.textContent = `${percentage}% Correct • ${heartsRemaining} ❤️ remaining`
    }
  }

  /** Show game over modal */
  public showGameOverModal(score: number, questionNumber: number): void {
    const percentage = Math.round((score / questionNumber) * 100)

    if (this.gameOverScore) {
      this.gameOverScore.textContent = `Score: ${score}/${questionNumber}`
    }
    if (this.gameOverPercentage) {
      this.gameOverPercentage.textContent = `${percentage}% Correct`
    }

    this.gameOverModal?.classList.remove('hidden')
  }

  /** Hide game over modal */
  public hideGameOverModal(): void {
    this.gameOverModal?.classList.add('hidden')
  }

  /** Show home screen */
  public showHome(): void {
    this.quizInterface?.classList.add('hidden')
    this.quizResults?.classList.add('hidden')
    this.heroSection?.classList.remove('hidden')
    this.aboutSection?.classList.remove('hidden')
    this.progressSection?.classList.remove('hidden')
  }

  /** Show next button */
  public showNextButton(): void {
    this.nextButton?.classList.remove('hidden')
  }

  /** Animate button press */
  public animateButtonPress(el: HTMLElement): void {
    AnimationUtils.animateButtonPress(el)
  }

  /** Animate question transition */
  public async animateQuestionTransition(
    questionDisplay: HTMLElement,
    answerOptions: HTMLElement
  ): Promise<void> {
    await AnimationUtils.animateQuestionTransition(questionDisplay, answerOptions)
  }
}

export default QuizView

