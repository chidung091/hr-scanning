import type { Orientation, MobileEnhancementOptions } from '../types/index.ts'

/**
 * Mobile detection and responsive utilities
 */
export class MobileDetection {
  /**
   * Check if current device is mobile
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  /**
   * Check if current viewport is mobile-sized
   */
  static isMobileViewport(breakpoint: number = 768): boolean {
    return window.innerWidth <= breakpoint
  }

  /**
   * Check if device supports touch
   */
  static isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    )
  }

  /**
   * Check if device supports vibration
   */
  static supportsVibration(): boolean {
    return 'vibrate' in navigator
  }

  /**
   * Trigger haptic feedback if supported
   */
  static vibrate(pattern: number | number[] = 50): void {
    if (this.supportsVibration()) {
      navigator.vibrate(pattern)
    }
  }

  /**
   * Get device orientation
   */
  static getOrientation(): Orientation {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }

  /**
   * Add event listener for orientation changes
   */
  static onOrientationChange(callback: (orientation: Orientation) => void): () => void {
    const handler = (): void => {
      setTimeout(() => {
        callback(this.getOrientation())
      }, 100)
    }

    window.addEventListener('orientationchange', handler)
    window.addEventListener('resize', handler)

    return () => {
      window.removeEventListener('orientationchange', handler)
      window.removeEventListener('resize', handler)
    }
  }

  /**
   * Initialize mobile-specific enhancements
   */
  static initializeMobileEnhancements(options: MobileEnhancementOptions = {}): void {
    const {
      preventDoubleTab = true,
      enableHapticFeedback = true,
      hapticSelectors = ['.quiz-button', '.answer-option'],
    } = options

    if (!this.isMobile()) {
      return
    }

    // Add mobile class to body
    document.body.classList.add('mobile-device')

    // Prevent zoom on double tap
    if (preventDoubleTab) {
      this._preventDoubleTabZoom()
    }

    // Enable haptic feedback
    if (enableHapticFeedback && this.supportsVibration()) {
      this._enableHapticFeedback(hapticSelectors)
    }

    // Handle orientation changes
    this.onOrientationChange(() => {
      window.scrollTo(0, 0)
      window.dispatchEvent(new Event('resize'))
    })
  }

  /**
   * Initialize touch feedback for better mobile interaction
   */
  static initializeTouchFeedback(selectors: string[] = ['.quiz-button', '.answer-option']): void {
    // Add touch start/end events for better button feedback
    document.addEventListener('touchstart', (e) => {
      const target = e.target as Element
      if (this._matchesAnySelector(target, selectors)) {
        target.classList.add('touch-active')
      }
    })

    document.addEventListener('touchend', (e) => {
      const target = e.target as Element
      if (this._matchesAnySelector(target, selectors)) {
        target.classList.remove('touch-active')
      }
    })

    // Add CSS for touch feedback if not already present
    this._addTouchFeedbackCSS()
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Check if element matches any of the provided selectors
   */
  private static _matchesAnySelector(element: Element, selectors: string[]): boolean {
    return selectors.some((selector) => element.classList.contains(selector.replace('.', '')))
  }

  /**
   * Prevent double tap zoom
   */
  private static _preventDoubleTabZoom(): void {
    let lastTouchEnd = 0
    document.addEventListener(
      'touchend',
      (event) => {
        const now = new Date().getTime()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      },
      false
    )
  }

  /**
   * Enable haptic feedback for specified selectors
   */
  private static _enableHapticFeedback(selectors: string[]): void {
    document.addEventListener('click', (e) => {
      const target = e.target as Element
      if (this._matchesAnySelector(target, selectors)) {
        this.vibrate(50)
      }
    })
  }

  /**
   * Add CSS for touch feedback
   */
  private static _addTouchFeedbackCSS(): void {
    const styleId = 'mobile-touch-feedback-styles'

    if (document.getElementById(styleId)) {
      return
    }

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .touch-active {
        transform: scale(0.95) !important;
        opacity: 0.8 !important;
        transition: all 0.1s ease !important;
      }
    `
    document.head.appendChild(style)
  }
}
