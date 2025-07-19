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

  // Add fade-in animation for quiz elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in')
      }
    })
  }, observerOptions)

  // Observe elements with fade-in class
  const fadeElements = document.querySelectorAll('.fade-on-scroll')
  fadeElements.forEach((el) => observer.observe(el))

  // Initialize Japanese character display enhancements
  initializeJapaneseCharacterDisplay()
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
