import { Quiz } from './components/Quiz'
import { QuizState } from './components/QuizState'
import { QuizView } from './components/QuizView'
import { JapaneseTeacher } from './components/JapaneseTeacher'
import { ProgressTracker } from './components/ProgressTracker'
import { MobileDetection } from './utils/mobileDetection'
import { AnimationUtils } from './utils/animations'
import type { AppState, Orientation } from './types/index'

/**
 * Main Application Class
 * Coordinates all components and handles global functionality
 */
class JapaneseQuizApp {
  private quiz: Quiz | null = null
  private japaneseTeacher: JapaneseTeacher | null = null
  private progressTracker: ProgressTracker | null = null

  constructor() {
    this.init()
  }

  /**
   * Initialize the application
   */
  private init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady())
    } else {
      this.onDOMReady()
    }
  }

  /**
   * Handle DOM ready event
   */
  private onDOMReady(): void {
    console.log('Japanese Learning Quiz - Application Loaded')

    // Initialize mobile enhancements
    this.initializeMobileEnhancements()

    // Initialize components
    this.initializeComponents()

    // Setup navigation
    this.setupNavigation()

    // Setup global event listeners
    this.setupGlobalEvents()

    console.log('DOM fully loaded and parsed')
  }

  /**
   * Initialize mobile-specific enhancements
   */
  private initializeMobileEnhancements(): void {
    MobileDetection.initializeMobileEnhancements({
      preventDoubleTab: true,
      enableHapticFeedback: true,
      hapticSelectors: ['.quiz-button', '.answer-option'],
    })

    MobileDetection.initializeTouchFeedback([
      '.quiz-button',
      '.answer-option',
      '.japanese-teacher-nav',
      '.japanese-teacher-dot',
    ])
  }

  /**
   * Initialize all components
   */
  private initializeComponents(): void {
    // Initialize Quiz component
    const quizState = new QuizState()
    const quizView = new QuizView()
    this.quiz = new Quiz(quizState, quizView)

    // Initialize Japanese Teacher component
    this.japaneseTeacher = new JapaneseTeacher()

    // Initialize Progress Tracker component
    this.progressTracker = new ProgressTracker()

    console.log('All components initialized')
  }

  /**
   * Setup navigation functionality
   */
  private setupNavigation(): void {
    this.setupMobileMenu()
    this.setupSmoothScrolling()
    this.setupIntersectionObserver()
  }

  /**
   * Setup mobile menu functionality
   */
  private setupMobileMenu(): void {
    const mobileMenuButton = document.querySelector('.mobile-menu-button') as HTMLButtonElement
    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement

    if (!mobileMenuButton || !mobileMenu) return

    const hamburgerIcon = mobileMenuButton.querySelector('svg:first-child') as SVGElement
    const closeIcon = mobileMenuButton.querySelector('svg:last-child') as SVGElement

    // Toggle menu
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true'

      mobileMenu.classList.toggle('hidden')
      hamburgerIcon?.classList.toggle('hidden')
      hamburgerIcon?.classList.toggle('block')
      closeIcon?.classList.toggle('hidden')
      closeIcon?.classList.toggle('block')

      mobileMenuButton.setAttribute('aria-expanded', (!isExpanded).toString())
    })

    // Close menu when clicking on links
    const mobileMenuLinks = mobileMenu.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>
    mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden')
        hamburgerIcon?.classList.remove('hidden')
        hamburgerIcon?.classList.add('block')
        closeIcon?.classList.add('hidden')
        closeIcon?.classList.remove('block')
        mobileMenuButton.setAttribute('aria-expanded', 'false')
      })
    })
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  private setupSmoothScrolling(): void {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault()
        const href = (anchor as HTMLAnchorElement).getAttribute('href')
        if (href) {
          const target = document.querySelector(href) as HTMLElement

          if (target) {
            AnimationUtils.smoothScrollToElement(target, 20)
          }
        }
      })
    })
  }

  /**
   * Setup intersection observer for animations
   */
  private setupIntersectionObserver(): void {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up')
        }
      })
    }, observerOptions)

    // Observe elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-on-scroll')
    fadeElements.forEach((el) => observer.observe(el))
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalEvents(): void {
    // Handle orientation changes
    MobileDetection.onOrientationChange((orientation: Orientation) => {
      console.log('Orientation changed to:', orientation)

      // Dispatch custom event for components that need to handle orientation changes
      window.dispatchEvent(
        new CustomEvent('orientationChanged', {
          detail: { orientation },
        })
      )
    })

    // Handle visibility changes (for pause/resume functionality)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onAppPause()
      } else {
        this.onAppResume()
      }
    })

    // Handle beforeunload for cleanup
    window.addEventListener('beforeunload', () => {
      this.onAppDestroy()
    })

    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error)
      this.handleGlobalError(e.error)
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason)
      this.handleGlobalError(e.reason)
    })
  }

  /**
   * Handle app pause (when tab becomes inactive)
   */
  private onAppPause(): void {
    console.log('App paused')
    // Could pause timers, save state, etc.
  }

  /**
   * Handle app resume (when tab becomes active)
   */
  private onAppResume(): void {
    console.log('App resumed')
    // Could resume timers, refresh data, etc.
  }

  /**
   * Handle app destruction/cleanup
   */
  private onAppDestroy(): void {
    console.log('App cleanup')
    // Cleanup resources, save state, etc.
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(error: Error): void {
    // Log error details
    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    // Show user-friendly error message (avoid showing in production)
    if (process.env.NODE_ENV === 'development') {
      this.showErrorMessage(`An error occurred: ${error.message}`)
    } else {
      this.showErrorMessage('Something went wrong. Please refresh the page and try again.')
    }
  }

  /**
   * Show error message to user
   */
  private showErrorMessage(message: string): void {
    // Create error notification
    const errorEl = document.createElement('div')
    errorEl.className =
      'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 max-w-sm'
    errorEl.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="ml-4 text-red-500 hover:text-red-700" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `

    document.body.appendChild(errorEl)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove()
      }
    }, 5000)
  }

  /**
   * Get application state for debugging
   */
  public getAppState(): AppState {
    return {
      quiz: this.quiz
        ? {
            sessionId: this.quiz.getSessionId(),
            quizType: this.quiz.getQuizType(),
            score: this.quiz.getScore(),
            questionNumber: this.quiz.getQuestionNumber(),
            hearts: this.quiz.getHearts(),
            isGameOver: this.quiz.getIsGameOver(),
          }
        : undefined,
      isMobile: MobileDetection.isMobile(),
      isMobileViewport: MobileDetection.isMobileViewport(),
      orientation: MobileDetection.getOrientation(),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Reset application to initial state
   */
  public resetApp(): void {
    // Show home screen
    this.quiz?.showHome()

    // Hide any error messages
    document.querySelectorAll('.error-message, .notification').forEach((el) => {
      el.remove()
    })

    console.log('Application reset to initial state')
  }
}

// Initialize the application
const app = new JapaneseQuizApp()

// Make app available globally for debugging
declare global {
  interface Window {
    JapaneseQuizApp: JapaneseQuizApp
  }
}

window.JapaneseQuizApp = app

// Export for module systems
export default JapaneseQuizApp
