// Main application JavaScript
console.log('TechVision Solutions - Application Loaded')

// Import components
import './components/ProgressiveAssessment.js'

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

  // Add loading states for forms
  const forms = document.querySelectorAll('form')
  forms.forEach((form) => {
    form.addEventListener('submit', function () {
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Processing...'
      }
    })
  })

  // Add fade-in animation for elements
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
}
