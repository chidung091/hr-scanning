import { StorageService } from '../services/StorageService'
import { AnimationUtils } from '../utils/animations'
import type { QuizType, ProgressStats } from '../types/index'

interface ProgressElements {
  accuracy: HTMLElement | null
  progressBar: HTMLElement | null
  quizzes: HTMLElement | null
  best: HTMLElement | null
}

interface QuizCompletedEvent extends CustomEvent {
  detail: {
    type: QuizType
    score: number
    total: number
  }
}

/**
 * Progress Tracker Component - Handles progress display and tracking
 */
export class ProgressTracker {
  private storageService: StorageService

  // Hiragana progress elements
  private hiraganaAccuracy: HTMLElement | null = null
  private hiraganaProgressBar: HTMLElement | null = null
  private hiraganaQuizzes: HTMLElement | null = null
  private hiraganaBest: HTMLElement | null = null

  // Katakana progress elements
  private katakanaAccuracy: HTMLElement | null = null
  private katakanaProgressBar: HTMLElement | null = null
  private katakanaQuizzes: HTMLElement | null = null
  private katakanaBest: HTMLElement | null = null

  // Overall stats elements
  private totalQuestions: HTMLElement | null = null
  private totalCorrect: HTMLElement | null = null
  private overallAccuracy: HTMLElement | null = null

  constructor() {
    this.storageService = new StorageService()

    this.initializeElements()
    this.bindEvents()
    this.loadProgress()
  }

  /**
   * Initialize DOM elements
   */
  private initializeElements(): void {
    // Hiragana progress elements
    this.hiraganaAccuracy = document.getElementById('hiragana-accuracy')
    this.hiraganaProgressBar = document.getElementById('hiragana-progress-bar')
    this.hiraganaQuizzes = document.getElementById('hiragana-quizzes')
    this.hiraganaBest = document.getElementById('hiragana-best')

    // Katakana progress elements
    this.katakanaAccuracy = document.getElementById('katakana-accuracy')
    this.katakanaProgressBar = document.getElementById('katakana-progress-bar')
    this.katakanaQuizzes = document.getElementById('katakana-quizzes')
    this.katakanaBest = document.getElementById('katakana-best')

    // Overall stats elements
    this.totalQuestions = document.getElementById('total-questions')
    this.totalCorrect = document.getElementById('total-correct')
    this.overallAccuracy = document.getElementById('overall-accuracy')
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Listen for quiz completion events
    window.addEventListener('quizCompleted', (e: Event) => {
      const quizEvent = e as QuizCompletedEvent
      this.updateProgress(quizEvent.detail.type, quizEvent.detail.score, quizEvent.detail.total)
    })

    // Optional: Add export/import functionality
    this.setupDataManagement()
  }

  /**
   * Setup data management (export/import)
   */
  private setupDataManagement(): void {
    // Create export button (if needed)
    const exportBtn = document.getElementById('export-progress')
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportProgress()
      })
    }

    // Create import button (if needed)
    const importBtn = document.getElementById('import-progress')
    const importInput = document.getElementById('import-progress-input') as HTMLInputElement

    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => {
        importInput.click()
      })

      importInput.addEventListener('change', (e) => {
        const files = (e.target as HTMLInputElement).files
        if (files && files[0]) {
          this.importProgress(files[0])
        }
      })
    }

    // Create reset button (if needed)
    const resetBtn = document.getElementById('reset-progress')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetProgress()
      })
    }
  }

  /**
   * Load and display progress from storage
   */
  private loadProgress(): void {
    this.displayProgress()
  }

  /**
   * Update progress after quiz completion
   */
  private updateProgress(type: QuizType, score: number, total: number): void {
    this.storageService.updateStats(type, score, total)
    this.displayProgress()
    this.animateProgressUpdate(type)
  }

  /**
   * Display current progress
   */
  private displayProgress(): void {
    const stats = this.storageService.getStats()

    // Update Hiragana progress
    this.updateTypeProgress('hiragana', stats.hiragana, {
      accuracy: this.hiraganaAccuracy,
      progressBar: this.hiraganaProgressBar,
      quizzes: this.hiraganaQuizzes,
      best: this.hiraganaBest,
    })

    // Update Katakana progress
    this.updateTypeProgress('katakana', stats.katakana, {
      accuracy: this.katakanaAccuracy,
      progressBar: this.katakanaProgressBar,
      quizzes: this.katakanaQuizzes,
      best: this.katakanaBest,
    })

    // Update overall stats
    this.updateOverallStats()
  }

  /**
   * Update progress for specific quiz type
   */
  private updateTypeProgress(
    type: string,
    typeStats: ProgressStats | null,
    elements: ProgressElements
  ): void {
    if (!typeStats) {
      // No data yet
      this.setElementText(elements.accuracy, '0%')
      this.setElementStyle(elements.progressBar, 'width', '0%')
      this.setElementText(elements.quizzes, '0')
      this.setElementText(elements.best, '0')
      return
    }

    const accuracy = Math.round((typeStats.totalCorrect / typeStats.totalQuestions) * 100)

    this.setElementText(elements.accuracy, `${accuracy}%`)
    this.setElementStyle(elements.progressBar, 'width', `${accuracy}%`)
    this.setElementText(elements.quizzes, typeStats.quizzesTaken.toString())
    this.setElementText(elements.best, typeStats.bestScore.toString())
  }

  /**
   * Update overall statistics
   */
  private updateOverallStats(): void {
    const overallStats = this.storageService.getOverallStats()

    this.setElementText(this.totalQuestions, overallStats.totalQuestions.toString())
    this.setElementText(this.totalCorrect, overallStats.totalCorrect.toString())
    this.setElementText(this.overallAccuracy, `${overallStats.overallAccuracy}%`)
  }

  /**
   * Animate progress update
   */
  private animateProgressUpdate(type: QuizType): void {
    const progressBar = type === 'hiragana' ? this.hiraganaProgressBar : this.katakanaProgressBar

    if (progressBar) {
      // Add a subtle animation to highlight the update
      progressBar.classList.add('animate-pulse-gentle')
      setTimeout(() => {
        progressBar.classList.remove('animate-pulse-gentle')
      }, 1000)
    }

    // Animate the accuracy number
    const accuracyElement = type === 'hiragana' ? this.hiraganaAccuracy : this.katakanaAccuracy
    if (accuracyElement) {
      this.animateNumberUpdate(accuracyElement)
    }
  }

  /**
   * Animate number update
   */
  private animateNumberUpdate(element: HTMLElement): void {
    if (!element) return

    element.classList.add('animate-bounce-subtle')
    setTimeout(() => {
      element.classList.remove('animate-bounce-subtle')
    }, 600)
  }

  /**
   * Get progress statistics for display
   */
  public getProgressStats(): {
    hiragana: ProgressStats
    katakana: ProgressStats
    overall: { totalQuestions: number; totalCorrect: number; overallAccuracy: number }
  } {
    const stats = this.storageService.getStats()
    const overall = this.storageService.getOverallStats()

    return {
      hiragana: this.formatTypeStats(stats.hiragana),
      katakana: this.formatTypeStats(stats.katakana),
      overall,
    }
  }

  /**
   * Format type statistics for display
   */
  private formatTypeStats(typeStats: ProgressStats | null): ProgressStats {
    if (!typeStats) {
      return {
        accuracy: 0,
        quizzesTaken: 0,
        bestScore: 0,
        totalQuestions: 0,
        totalCorrect: 0,
      }
    }

    return {
      accuracy: Math.round((typeStats.totalCorrect / typeStats.totalQuestions) * 100),
      quizzesTaken: typeStats.quizzesTaken,
      bestScore: typeStats.bestScore,
      totalQuestions: typeStats.totalQuestions,
      totalCorrect: typeStats.totalCorrect,
    }
  }

  /**
   * Export progress data
   */
  private exportProgress(): void {
    try {
      const progressData = this.storageService.exportStats()
      const blob = new Blob([progressData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `japanese-quiz-progress-${new Date().toISOString().split('T')[0]}.json`
      link.click()

      URL.revokeObjectURL(url)

      this.showMessage('Progress exported successfully!', 'success')
    } catch (error) {
      console.error('Export error:', error)
      this.showMessage('Failed to export progress.', 'error')
    }
  }

  /**
   * Import progress data
   */
  private async importProgress(file: File): Promise<void> {
    if (!file) return

    try {
      const text = await file.text()
      this.storageService.importStats(text)
      this.displayProgress()
      this.showMessage('Progress imported successfully!', 'success')
    } catch (error) {
      console.error('Import error:', error)
      this.showMessage('Failed to import progress. Please check the file format.', 'error')
    }
  }

  /**
   * Reset all progress data
   */
  private resetProgress(): void {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      this.storageService.clearStats()
      this.displayProgress()
      this.showMessage('Progress reset successfully!', 'success')
    }
  }

  /**
   * Show a temporary message to the user
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create or get message element
    let messageEl = document.getElementById('progress-message')

    if (!messageEl) {
      messageEl = document.createElement('div')
      messageEl.id = 'progress-message'
      messageEl.className =
        'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300'
      document.body.appendChild(messageEl)
    }

    // Set message content and style
    messageEl.textContent = message
    messageEl.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      type === 'success'
        ? 'bg-green-100 text-green-800 border border-green-200'
        : type === 'error'
          ? 'bg-red-100 text-red-800 border border-red-200'
          : 'bg-blue-100 text-blue-800 border border-blue-200'
    }`

    // Show message
    messageEl.style.transform = 'translateX(0)'
    messageEl.style.opacity = '1'

    // Hide after 3 seconds
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)'
      messageEl.style.opacity = '0'
    }, 3000)
  }

  /**
   * Utility function to safely set element text content
   */
  private setElementText(element: HTMLElement | null, text: string): void {
    if (element) {
      element.textContent = text
    }
  }

  /**
   * Utility function to safely set element style
   */
  private setElementStyle(element: HTMLElement | null, property: string, value: string): void {
    if (element) {
      ;(element.style as any)[property] = value
    }
  }
}
