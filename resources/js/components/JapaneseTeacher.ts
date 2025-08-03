import { QuizAPI } from '../services/QuizAPI'
import { AnimationUtils } from '../utils/animations'
import { MobileDetection } from '../utils/mobileDetection'
import type { JapaneseExplanation } from '../types/index'

interface ResultElements {
  input: HTMLElement | null
  romaji: HTMLElement | null
  furigana: HTMLElement | null
  pronunciation: HTMLElement | null
  meaning: HTMLElement | null
  exampleJp: HTMLElement | null
  exampleVn: HTMLElement | null
  note: HTMLElement | null
}

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
  startTime: number
}

/**
 * Japanese Teacher Component - Handles Japanese text explanation functionality
 */
export class JapaneseTeacher {
  private quizAPI: QuizAPI

  // Swipe navigation state
  private currentSlide: number = 0
  private totalSlides: number = 6
  private swipeWrapper: HTMLElement | null = null
  private progressBar: HTMLElement | null = null
  private prevButton: HTMLButtonElement | null = null
  private nextButton: HTMLButtonElement | null = null
  private pagination: HTMLElement | null = null

  // Main elements
  private japaneseInput: HTMLInputElement | null = null
  private japaneseSubmit: HTMLButtonElement | null = null
  private japaneseError: HTMLElement | null = null
  private japaneseResults: HTMLElement | null = null
  private submitText: HTMLElement | null = null
  private submitLoading: HTMLElement | null = null
  private errorMessage: HTMLElement | null = null

  // Result elements
  private resultElements: {
    desktop: ResultElements
    mobile: ResultElements
  }

  constructor() {
    this.quizAPI = new QuizAPI()

    this.resultElements = {
      desktop: {
        input: null,
        romaji: null,
        furigana: null,
        pronunciation: null,
        meaning: null,
        exampleJp: null,
        exampleVn: null,
        note: null,
      },
      mobile: {
        input: null,
        romaji: null,
        furigana: null,
        pronunciation: null,
        meaning: null,
        exampleJp: null,
        exampleVn: null,
        note: null,
      },
    }

    this.initializeElements()
    this.bindEvents()
  }

  /**
   * Initialize DOM elements
   */
  private initializeElements(): void {
    // Main elements
    this.japaneseInput = document.getElementById('japanese-input') as HTMLInputElement
    this.japaneseSubmit = document.getElementById('japanese-submit') as HTMLButtonElement
    this.japaneseError = document.getElementById('japanese-error')
    this.japaneseResults = document.getElementById('japanese-results')
    this.submitText = document.getElementById('submit-text')
    this.submitLoading = document.getElementById('submit-loading')
    this.errorMessage = document.getElementById('error-message')

    // Desktop result elements
    this.resultElements.desktop = {
      input: document.getElementById('result-input-desktop'),
      romaji: document.getElementById('result-romaji-desktop'),
      furigana: document.getElementById('result-furigana-desktop'),
      pronunciation: document.getElementById('result-pronunciation-desktop'),
      meaning: document.getElementById('result-meaning-desktop'),
      exampleJp: document.getElementById('result-example-jp-desktop'),
      exampleVn: document.getElementById('result-example-vn-desktop'),
      note: document.getElementById('result-note-desktop'),
    }

    // Mobile result elements
    this.resultElements.mobile = {
      input: document.getElementById('result-input-mobile'),
      romaji: document.getElementById('result-romaji-mobile'),
      furigana: document.getElementById('result-furigana-mobile'),
      pronunciation: document.getElementById('result-pronunciation-mobile'),
      meaning: document.getElementById('result-meaning-mobile'),
      exampleJp: document.getElementById('result-example-jp-mobile'),
      exampleVn: document.getElementById('result-example-vn-mobile'),
      note: document.getElementById('result-note-mobile'),
    }
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Submit button
    this.japaneseSubmit?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.submitJapaneseTeacher()
    })

    // Enter key on input
    this.japaneseInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.submitJapaneseTeacher()
      }
    })
  }

  /**
   * Submit Japanese text for explanation
   */
  private async submitJapaneseTeacher(): Promise<void> {
    const input = this.japaneseInput?.value.trim()

    if (!input) {
      this.showError('Please enter a Japanese word or grammar pattern.')
      return
    }

    this.setLoading(true)
    this.hideError()
    this.hideResults()

    try {
      const data = await this.quizAPI.getJapaneseExplanation(input)

      if (data.success && data.data) {
        this.displayResults(data.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Japanese Teacher Error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      this.showError(errorMessage)
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Display explanation results
   */
  private displayResults(data: JapaneseExplanation): void {
    // Populate desktop layout
    this.populateResults('desktop', data)

    // Populate mobile layout
    this.populateResults('mobile', data)

    // Initialize mobile swipe functionality
    this.initializeMobileSwipe()

    // Show results
    this.showResults()
  }

  /**
   * Populate result elements with data
   */
  private populateResults(layout: 'desktop' | 'mobile', data: JapaneseExplanation): void {
    const elements = this.resultElements[layout]
    if (!elements) return

    if (elements.input) elements.input.textContent = data.input || ''
    if (elements.romaji) elements.romaji.textContent = data.romaji || ''
    if (elements.furigana) elements.furigana.textContent = data.furigana || ''
    if (elements.pronunciation) elements.pronunciation.textContent = data.pronunciation || ''
    if (elements.meaning) elements.meaning.textContent = data.meaning || ''
    if (elements.exampleJp) elements.exampleJp.textContent = data.example_jp || ''
    if (elements.exampleVn) elements.exampleVn.textContent = data.example_vn || ''
    if (elements.note) elements.note.textContent = data.note || ''
  }

  /**
   * Initialize mobile swipe navigation
   */
  private initializeMobileSwipe(): void {
    this.currentSlide = 0
    this.swipeWrapper = document.getElementById('japanese-teacher-swipe-wrapper')
    this.progressBar = document.getElementById('japanese-teacher-progress-bar')
    this.prevButton = document.getElementById('japanese-teacher-prev') as HTMLButtonElement
    this.nextButton = document.getElementById('japanese-teacher-next') as HTMLButtonElement
    this.pagination = document.getElementById('japanese-teacher-pagination')

    if (!this.swipeWrapper) return

    // Initialize components
    this.initializeTouchEvents()
    this.initializeNavigationButtons()
    this.initializePaginationDots()
    this.initializeKeyboardNavigation()
    this.initializeResponsiveBehavior()

    // Update initial state
    this.updateSwipeState()
  }

  /**
   * Initialize touch events for swipe navigation
   */
  private initializeTouchEvents(): void {
    if (!this.swipeWrapper) return

    const touchState: TouchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      startTime: 0,
    }

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.touches[0]
      touchState.startX = touch.clientX
      touchState.startY = touch.clientY
      touchState.startTime = Date.now()
      touchState.isDragging = true
      if (this.swipeWrapper) {
        this.swipeWrapper.style.transition = 'none'
      }
    }

    const handleTouchMove = (e: TouchEvent): void => {
      if (!touchState.isDragging || !this.swipeWrapper) return

      const touch = e.touches[0]
      touchState.currentX = touch.clientX
      touchState.currentY = touch.clientY
      const deltaX = touchState.currentX - touchState.startX
      const deltaY = touchState.currentY - touchState.startY

      // Prevent vertical scrolling if horizontal swipe is detected
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
        const currentTransform = -this.currentSlide * 100
        const newTransform = currentTransform + (deltaX / this.swipeWrapper.offsetWidth) * 100
        this.swipeWrapper.style.transform = `translateX(${newTransform}%)`
      }
    }

    const handleTouchEnd = (): void => {
      if (!touchState.isDragging || !this.swipeWrapper) return
      touchState.isDragging = false

      const deltaX = touchState.currentX - touchState.startX
      const deltaY = touchState.currentY - touchState.startY
      const deltaTime = Date.now() - touchState.startTime
      const velocity = Math.abs(deltaX) / deltaTime

      // Restore transition
      this.swipeWrapper.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

      // Determine if swipe should trigger slide change
      const threshold = this.swipeWrapper.offsetWidth * 0.3
      const shouldSwipe = Math.abs(deltaX) > threshold || velocity > 0.5

      if (shouldSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && this.currentSlide > 0) {
          this.goToSlide(this.currentSlide - 1)
        } else if (deltaX < 0 && this.currentSlide < this.totalSlides - 1) {
          this.goToSlide(this.currentSlide + 1)
        } else {
          this.goToSlide(this.currentSlide)
        }
      } else {
        this.goToSlide(this.currentSlide)
      }
    }

    // Add event listeners
    this.swipeWrapper.addEventListener('touchstart', handleTouchStart, { passive: false })
    this.swipeWrapper.addEventListener('touchmove', handleTouchMove, { passive: false })
    this.swipeWrapper.addEventListener('touchend', handleTouchEnd)
  }

  /**
   * Initialize navigation buttons
   */
  private initializeNavigationButtons(): void {
    this.prevButton?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.previousSlide()
    })

    this.nextButton?.addEventListener('click', (e) => {
      AnimationUtils.animateButtonPress(e.target as HTMLElement)
      this.nextSlide()
    })
  }

  /**
   * Initialize pagination dots
   */
  private initializePaginationDots(): void {
    if (!this.pagination) return

    const dots = this.pagination.querySelectorAll('.japanese-teacher-dot')
    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        AnimationUtils.animateButtonPress(e.target as HTMLElement)
        this.goToSlide(index)
      })
    })
  }

  /**
   * Initialize keyboard navigation
   */
  private initializeKeyboardNavigation(): void {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Only handle when results are visible and on mobile
      if (
        this.japaneseResults?.classList.contains('hidden') ||
        !MobileDetection.isMobileViewport()
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          this.previousSlide()
          break
        case 'ArrowRight':
          e.preventDefault()
          this.nextSlide()
          break
        case 'Home':
          e.preventDefault()
          this.goToSlide(0)
          break
        case 'End':
          e.preventDefault()
          this.goToSlide(this.totalSlides - 1)
          break
        case 'Escape':
          e.preventDefault()
          this.hideResults()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
  }

  /**
   * Initialize responsive behavior
   */
  private initializeResponsiveBehavior(): void {
    const handleResize = MobileDetection.debounce(() => {
      const isMobile = MobileDetection.isMobileViewport()

      // Reset mobile swipe state when switching to desktop
      if (!isMobile && this.swipeWrapper) {
        this.currentSlide = 0
        this.swipeWrapper.style.transform = 'translateX(0%)'
        this.updateSwipeState()
      }
    }, 250)

    window.addEventListener('resize', handleResize)
  }

  /**
   * Go to specific slide
   */
  private goToSlide(slideIndex: number): void {
    if (slideIndex < 0 || slideIndex >= this.totalSlides) return

    this.currentSlide = slideIndex
    const translateX = -slideIndex * 100

    if (this.swipeWrapper) {
      this.swipeWrapper.style.transform = `translateX(${translateX}%)`
    }

    this.updateSwipeState()
  }

  /**
   * Go to next slide
   */
  private nextSlide(): void {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1)
    }
  }

  /**
   * Go to previous slide
   */
  private previousSlide(): void {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1)
    }
  }

  /**
   * Update swipe navigation state
   */
  private updateSwipeState(): void {
    // Update progress bar
    const progress = ((this.currentSlide + 1) / this.totalSlides) * 100
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`
      this.progressBar.setAttribute('aria-valuenow', (this.currentSlide + 1).toString())
    }

    // Update navigation buttons
    if (this.prevButton) {
      this.prevButton.disabled = this.currentSlide === 0
      this.prevButton.style.opacity = this.currentSlide === 0 ? '0.5' : '1'
      this.prevButton.setAttribute('aria-disabled', (this.currentSlide === 0).toString())
    }

    if (this.nextButton) {
      this.nextButton.disabled = this.currentSlide === this.totalSlides - 1
      this.nextButton.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.5' : '1'
      this.nextButton.setAttribute(
        'aria-disabled',
        (this.currentSlide === this.totalSlides - 1).toString()
      )
    }

    // Update pagination dots
    if (this.pagination) {
      const dots = this.pagination.querySelectorAll('.japanese-teacher-dot')
      dots.forEach((dot, index) => {
        if (index === this.currentSlide) {
          dot.classList.add('active')
          dot.setAttribute('aria-selected', 'true')
          dot.setAttribute('tabindex', '0')
        } else {
          dot.classList.remove('active')
          dot.setAttribute('aria-selected', 'false')
          dot.setAttribute('tabindex', '-1')
        }
      })
    }

    // Update slide visibility for screen readers
    const slides = this.swipeWrapper?.querySelectorAll('.japanese-teacher-slide')
    slides?.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.setAttribute('aria-hidden', 'false')
        slide.setAttribute('tabindex', '0')
      } else {
        slide.setAttribute('aria-hidden', 'true')
        slide.setAttribute('tabindex', '-1')
      }
    })
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    if (this.japaneseSubmit) {
      this.japaneseSubmit.disabled = loading
    }

    if (loading) {
      this.submitText?.classList.add('hidden')
      this.submitLoading?.classList.remove('hidden')
    } else {
      this.submitText?.classList.remove('hidden')
      this.submitLoading?.classList.add('hidden')
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    if (this.errorMessage) {
      this.errorMessage.textContent = message
    }
    this.japaneseError?.classList.remove('hidden')
  }

  /**
   * Hide error message
   */
  private hideError(): void {
    this.japaneseError?.classList.add('hidden')
  }

  /**
   * Show results
   */
  private showResults(): void {
    this.japaneseResults?.classList.remove('hidden')
  }

  /**
   * Hide results
   */
  private hideResults(): void {
    this.japaneseResults?.classList.add('hidden')
  }
}
