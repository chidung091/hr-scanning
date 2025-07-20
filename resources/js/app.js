// Main application JavaScript
console.log('Japanese Learning Quiz - Application Loaded')

// DOM Content Loaded handler
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed')

  // Initialize any interactive components
  initializeComponents()
})

// Initialize interactive components
function initializeComponents() {
  // Add smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault()
      const targetId = this.getAttribute('href').substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    })
  })

  // Enhanced intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up')
      }
    })
  }, observerOptions)

  // Observe elements with fade-in class
  const fadeElements = document.querySelectorAll('.fade-on-scroll')
  fadeElements.forEach((el) => observer.observe(el))

  // Initialize mobile-specific enhancements
  initializeMobileEnhancements()

  // Initialize Japanese character display enhancements
  initializeJapaneseCharacterDisplay()

  // Initialize touch feedback for mobile
  initializeTouchFeedback()
}

// Initialize Japanese character display enhancements
function initializeJapaneseCharacterDisplay() {
  // Add hover effects for character displays
  const characterDisplays = document.querySelectorAll('#character-display')
  characterDisplays.forEach((display) => {
    display.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.05)'
      this.style.transition = 'transform 0.2s ease'
    })

    display.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)'
    })
  })

  // Add keyboard navigation for quiz
  document.addEventListener('keydown', function (e) {
    // Allow 1-4 keys to select answers
    if (['1', '2', '3', '4'].includes(e.key)) {
      const answerButtons = document.querySelectorAll('.answer-option')
      const buttonIndex = parseInt(e.key) - 1
      if (answerButtons[buttonIndex] && !answerButtons[buttonIndex].disabled) {
        answerButtons[buttonIndex].click()
      }
    }

    // Allow Enter or Space to proceed to next question
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.matches('button')) {
      const nextButton = document.getElementById('next-question')
      if (nextButton && !nextButton.classList.contains('hidden')) {
        e.preventDefault()
        nextButton.click()
      }
    }
  })
}

// Initialize mobile-specific enhancements
function initializeMobileEnhancements() {
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  if (isMobile) {
    // Add mobile class to body for CSS targeting
    document.body.classList.add('mobile-device')

    // Prevent zoom on double tap for quiz buttons
    let lastTouchEnd = 0
    document.addEventListener(
      'touchend',
      function (event) {
        const now = new Date().getTime()
        if (now - lastTouchEnd <= 300) {
          event.preventDefault()
        }
        lastTouchEnd = now
      },
      false
    )

    // Add haptic feedback for supported devices
    if ('vibrate' in navigator) {
      document.addEventListener('click', function (e) {
        if (
          e.target.classList.contains('quiz-button') ||
          e.target.classList.contains('answer-option')
        ) {
          navigator.vibrate(50) // Short vibration for button press
        }
      })
    }
  }

  // Handle orientation changes
  window.addEventListener('orientationchange', function () {
    setTimeout(() => {
      // Recalculate layout after orientation change
      window.scrollTo(0, 0)

      // Trigger resize event for any components that need to adjust
      window.dispatchEvent(new Event('resize'))
    }, 100)
  })
}

// Initialize touch feedback for better mobile interaction
function initializeTouchFeedback() {
  // Add touch start/end events for better button feedback
  document.addEventListener('touchstart', function (e) {
    if (
      e.target.classList.contains('quiz-button') ||
      e.target.classList.contains('answer-option')
    ) {
      e.target.classList.add('touch-active')
    }
  })

  document.addEventListener('touchend', function (e) {
    if (
      e.target.classList.contains('quiz-button') ||
      e.target.classList.contains('answer-option')
    ) {
      e.target.classList.remove('touch-active')
    }
  })

  // Add visual feedback for touch interactions
  const style = document.createElement('style')
  style.textContent = `
    .touch-active {
      transform: scale(0.95) !important;
      opacity: 0.8 !important;
      transition: all 0.1s ease !important;
    }
  `
  document.head.appendChild(style)
}

// Enhanced animation utilities
function animateElement(element, animationClass, duration = 500) {
  if (!element) return Promise.resolve()

  return new Promise((resolve) => {
    element.classList.add(animationClass)

    setTimeout(() => {
      element.classList.remove(animationClass)
      resolve()
    }, duration)
  })
}

// Smooth scroll to element with offset for mobile
function smoothScrollToElement(element, offset = 0) {
  if (!element) return

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  const offsetPosition = elementPosition - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })
}

// Performance optimization for animations
function requestAnimationFramePromise() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

// Debounce function for performance
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
