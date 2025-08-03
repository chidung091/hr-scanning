/**
 * Animation utilities for smooth UI interactions
 */
export class AnimationUtils {
  /**
   * Animate button press effect
   */
  static animateButtonPress(button: HTMLElement | null, duration: number = 150): Promise<void> {
    if (!button) return Promise.resolve()

    return new Promise((resolve) => {
      button.classList.add('animate-button-press')

      setTimeout(() => {
        button.classList.remove('animate-button-press')
        resolve()
      }, duration)
    })
  }

  /**
   * Animate correct answer feedback
   */
  static animateCorrectAnswer(element: HTMLElement | null, duration: number = 600): Promise<void> {
    if (!element) return Promise.resolve()

    return new Promise((resolve) => {
      element.classList.add('animate-correct-answer')

      setTimeout(() => {
        element.classList.remove('animate-correct-answer')
        resolve()
      }, duration)
    })
  }

  /**
   * Animate incorrect answer feedback
   */
  static animateIncorrectAnswer(
    element: HTMLElement | null,
    duration: number = 500
  ): Promise<void> {
    if (!element) return Promise.resolve()

    return new Promise((resolve) => {
      element.classList.add('animate-incorrect-answer')

      setTimeout(() => {
        element.classList.remove('animate-incorrect-answer')
        resolve()
      }, duration)
    })
  }

  /**
   * Animate heart loss
   */
  static animateHeartLoss(heartElement: HTMLElement | null): void {
    if (!heartElement) return

    heartElement.classList.add('animate-heart-loss')
    // Don't remove the class as it should stay in the lost state
  }

  /**
   * Animate question transition
   */
  static animateQuestionTransition(
    questionDisplay: HTMLElement,
    answerOptions: HTMLElement
  ): Promise<void> {
    return new Promise((resolve) => {
      // Fade out current content
      questionDisplay.style.opacity = '0'
      answerOptions.style.opacity = '0'

      setTimeout(() => {
        // Fade in new content
        questionDisplay.style.opacity = '1'
        answerOptions.style.opacity = '1'
        questionDisplay.classList.add('animate-slide-in-right')
        answerOptions.classList.add('animate-fade-in-up')

        // Clean up animation classes
        setTimeout(() => {
          questionDisplay.classList.remove('animate-slide-in-right')
          answerOptions.classList.remove('animate-fade-in-up')
          resolve()
        }, 500)
      }, 200)
    })
  }

  /**
   * Animate progress bar update
   */
  static animateProgressBar(progressBar: HTMLElement | null, percentage: number): void {
    if (!progressBar) return

    progressBar.style.width = `${percentage}%`
    progressBar.classList.add('animate-pulse-gentle')

    setTimeout(() => {
      progressBar.classList.remove('animate-pulse-gentle')
    }, 1000)
  }

  /**
   * Fade in element
   */
  static fadeIn(element: HTMLElement | null, duration: number = 300): Promise<void> {
    if (!element) return Promise.resolve()

    return new Promise((resolve) => {
      element.style.opacity = '0'
      element.style.display = 'block'

      setTimeout(() => {
        element.style.transition = `opacity ${duration}ms ease`
        element.style.opacity = '1'

        setTimeout(() => {
          element.style.transition = ''
          resolve()
        }, duration)
      }, 10)
    })
  }

  /**
   * Fade out element
   */
  static fadeOut(element: HTMLElement | null, duration: number = 300): Promise<void> {
    if (!element) return Promise.resolve()

    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`
      element.style.opacity = '0'

      setTimeout(() => {
        element.style.display = 'none'
        element.style.transition = ''
        resolve()
      }, duration)
    })
  }

  /**
   * Smooth scroll to element
   */
  static smoothScrollToElement(element: HTMLElement | null, offset: number = 0): void {
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }

  /**
   * Get a promise that resolves on the next animation frame
   */
  static requestAnimationFramePromise(): Promise<number> {
    return new Promise((resolve) => requestAnimationFrame(resolve))
  }
}
