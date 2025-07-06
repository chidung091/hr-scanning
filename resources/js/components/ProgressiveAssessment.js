/**
 * Progressive Assessment Component
 * Handles the 6-question assessment flow with progress tracking
 */
class ProgressiveAssessment {
  constructor(options = {}) {
    this.options = {
      containerId: 'progressiveAssessmentModal',
      language: 'en',
      onComplete: null,
      onError: null,
      ...options
    }
    
    this.assessmentId = null
    this.currentQuestion = null
    this.currentAnswer = null
    this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    
    this.init()
  }

  init() {
    this.createModal()
    this.bindEvents()
  }

  createModal() {
    const modalHTML = `
      <div id="${this.options.containerId}" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Assessment Questionnaire</h3>
                <p class="text-sm text-gray-600 mt-1">Please answer all questions to complete your application</p>
              </div>
              <button id="closeAssessmentModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="px-6 py-4 bg-gray-50 border-b">
              <div class="flex justify-between items-center mb-2">
                <span id="progressText" class="text-sm font-medium text-gray-700">Question 1 of 6</span>
                <span id="progressPercentage" class="text-sm text-gray-500">0% Complete</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div id="progressBar" class="bg-primary-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
              </div>
            </div>

            <!-- Loading State -->
            <div id="assessmentLoading" class="hidden p-8 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Loading question...</p>
            </div>

            <!-- Question Content -->
            <div id="questionContent" class="p-6">
              <div id="questionTitle" class="text-lg font-semibold text-gray-900 mb-3"></div>
              <div id="questionDescription" class="text-gray-600 mb-6"></div>
              
              <!-- Multiple Choice Options -->
              <div id="multipleChoiceOptions" class="space-y-3 mb-6 hidden">
                <!-- Options will be dynamically inserted here -->
              </div>

              <!-- Text Input -->
              <div id="textInputContainer" class="mb-6 hidden">
                <textarea id="textAnswer" rows="4" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                         placeholder=""></textarea>
                <div class="flex justify-between mt-2">
                  <span id="charCount" class="text-xs text-gray-500">0 characters</span>
                  <span id="charLimit" class="text-xs text-gray-500"></span>
                </div>
              </div>

              <!-- Error Message -->
              <div id="errorMessage" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-800"></p>
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between items-center p-6 border-t bg-gray-50">
              <button id="previousBtn" class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                ← Previous
              </button>
              
              <div class="flex space-x-3">
                <button id="skipBtn" class="px-4 py-2 text-gray-600 hover:text-gray-800 hidden">
                  Skip Question
                </button>
                <button id="skipAllBtn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Not Answer Question
                </button>
                <button id="nextBtn" class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next →
                </button>
              </div>
            </div>

            <!-- Completion Screen -->
            <div id="completionScreen" class="hidden p-8 text-center">
              <div class="mb-6">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Assessment Complete!</h3>
                <p class="text-gray-600">Thank you for completing the questionnaire. Your application has been submitted successfully.</p>
              </div>
              
              <div id="scoreDisplay" class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="text-sm text-gray-600 mb-1">Assessment Score</div>
                <div id="finalScore" class="text-2xl font-bold text-primary-600">--</div>
                <div id="assessmentResult" class="text-sm text-gray-600 capitalize">--</div>
              </div>

              <button id="finishBtn" class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Continue to Success Page
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
  }

  bindEvents() {
    const modal = document.getElementById(this.options.containerId)
    const closeBtn = document.getElementById('closeAssessmentModal')
    const previousBtn = document.getElementById('previousBtn')
    const nextBtn = document.getElementById('nextBtn')
    const skipBtn = document.getElementById('skipBtn')
    const skipAllBtn = document.getElementById('skipAllBtn')
    const finishBtn = document.getElementById('finishBtn')
    const textAnswer = document.getElementById('textAnswer')

    // Close modal
    closeBtn?.addEventListener('click', () => this.close())
    
    // Close on outside click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.close()
    })

    // Navigation
    previousBtn?.addEventListener('click', () => this.goToPrevious())
    nextBtn?.addEventListener('click', () => this.goToNext())
    skipBtn?.addEventListener('click', () => this.skipQuestion())
    skipAllBtn?.addEventListener('click', () => this.skipAllQuestions())
    finishBtn?.addEventListener('click', () => this.finish())

    // Text input character counting
    textAnswer?.addEventListener('input', () => this.updateCharCount())
  }

  async startAssessment(submissionId, language = 'en') {
    try {
      this.show()
      this.showLoading()

      const response = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          submission_id: submissionId,
          language: language
        })
      })

      const result = await response.json()

      if (result.success) {
        this.assessmentId = result.data.assessmentId
        this.options.language = language
        this.displayQuestion(result.data)
      } else {
        throw new Error(result.message || 'Failed to start assessment')
      }
    } catch (error) {
      console.error('Start assessment error:', error)
      this.showError('Failed to start assessment: ' + error.message)
    }
  }

  async getCurrentQuestion() {
    if (!this.assessmentId) return

    try {
      this.showLoading()

      const response = await fetch(`/api/assessment/${this.assessmentId}/question?language=${this.options.language}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      const result = await response.json()

      if (result.success) {
        if (result.data.completed) {
          this.showCompletion(result.data)
        } else {
          this.displayQuestion(result.data)
        }
      } else {
        throw new Error(result.message || 'Failed to get question')
      }
    } catch (error) {
      console.error('Get question error:', error)
      this.showError('Failed to load question: ' + error.message)
    }
  }

  async submitAnswer(action = 'next') {
    if (!this.assessmentId || !this.currentQuestion) return

    try {
      this.showLoading()

      const answer = this.getCurrentAnswer()
      
      const response = await fetch(`/api/assessment/${this.assessmentId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          question_id: this.currentQuestion.id,
          answer: answer,
          action: action
        })
      })

      const result = await response.json()

      if (result.success) {
        if (result.data.completed) {
          this.showCompletion(result.data)
        } else {
          this.displayQuestion(result.data)
        }
      } else {
        throw new Error(result.message || 'Failed to submit answer')
      }
    } catch (error) {
      console.error('Submit answer error:', error)
      this.showError('Failed to submit answer: ' + error.message)
    }
  }

  displayQuestion(data) {
    this.hideLoading()
    this.hideError()
    
    this.currentQuestion = data.question
    
    // Update progress
    this.updateProgress(data.currentQuestion, data.totalQuestions, data.progress)
    
    // Update question content
    document.getElementById('questionTitle').textContent = data.question.title
    document.getElementById('questionDescription').textContent = data.question.description || ''
    
    // Show appropriate input type
    this.setupQuestionInput(data.question, data.previousAnswer)
    
    // Update navigation
    this.updateNavigation(data.canGoBack, data.canSkip)
    
    // Show question content
    document.getElementById('questionContent').classList.remove('hidden')
    document.getElementById('completionScreen').classList.add('hidden')
  }

  setupQuestionInput(question, previousAnswer) {
    const multipleChoice = document.getElementById('multipleChoiceOptions')
    const textInput = document.getElementById('textInputContainer')
    const textAnswer = document.getElementById('textAnswer')

    // Hide all input types first
    multipleChoice.classList.add('hidden')
    textInput.classList.add('hidden')

    if (question.type === 'multiple_choice') {
      multipleChoice.classList.remove('hidden')
      this.setupMultipleChoice(question.options, question.key, previousAnswer)
    } else if (question.type === 'text') {
      textInput.classList.remove('hidden')
      textAnswer.placeholder = question.placeholder || ''
      textAnswer.value = previousAnswer || ''
      this.updateCharCount()
      this.setupTextValidation(question.validation)
    }
  }

  setupMultipleChoice(options, questionKey, previousAnswer) {
    const container = document.getElementById('multipleChoiceOptions')
    container.innerHTML = ''

    options.forEach((option, index) => {
      const optionValue = this.getOptionValue(questionKey, index)
      const isSelected = previousAnswer === optionValue

      const optionHTML = `
        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}">
          <input type="radio" name="${questionKey}" value="${optionValue}" class="sr-only" ${isSelected ? 'checked' : ''}>
          <div class="flex-shrink-0 w-4 h-4 border-2 rounded-full mr-3 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}">
            ${isSelected ? '<div class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>' : ''}
          </div>
          <span class="text-gray-900">${option}</span>
        </label>
      `
      container.insertAdjacentHTML('beforeend', optionHTML)
    })

    // Add event listeners
    container.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.updateMultipleChoiceUI(questionKey)
      })
    })
  }

  getOptionValue(questionKey, index) {
    // Map option indices to values based on question key
    const optionMappings = {
      'work_style_environment': ['remote', 'office', 'hybrid', 'flexible'],
      'overtime_commitment': ['always_available', 'reasonable_notice', 'emergency_only', 'prefer_avoid'],
      'recognition_reward': ['public_recognition', 'financial_rewards', 'career_advancement', 'personal_feedback', 'team_appreciation'],
      'feedback_communication': ['embrace_learn', 'analyze_improve', 'discuss_clarify', 'defensive_initially', 'prefer_positive'],
      'longterm_motivation': ['growth_opportunities', 'company_culture', 'work_life_balance', 'compensation_benefits', 'meaningful_work', 'team_relationships']
    }

    return optionMappings[questionKey]?.[index] || `option_${index}`
  }

  updateMultipleChoiceUI(questionKey) {
    const container = document.getElementById('multipleChoiceOptions')
    const labels = container.querySelectorAll('label')
    
    labels.forEach(label => {
      const radio = label.querySelector('input[type="radio"]')
      const circle = label.querySelector('div')
      
      if (radio.checked) {
        label.className = 'flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-primary-500 bg-primary-50'
        circle.className = 'flex-shrink-0 w-4 h-4 border-2 rounded-full mr-3 border-primary-500 bg-primary-500'
        circle.innerHTML = '<div class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>'
      } else {
        label.className = 'flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-gray-200'
        circle.className = 'flex-shrink-0 w-4 h-4 border-2 rounded-full mr-3 border-gray-300'
        circle.innerHTML = ''
      }
    })
  }

  setupTextValidation(validation) {
    const charLimit = document.getElementById('charLimit')
    if (validation.minLength || validation.maxLength) {
      let limitText = ''
      if (validation.minLength && validation.maxLength) {
        limitText = `${validation.minLength} - ${validation.maxLength} characters`
      } else if (validation.minLength) {
        limitText = `Min: ${validation.minLength} characters`
      } else if (validation.maxLength) {
        limitText = `Max: ${validation.maxLength} characters`
      }
      charLimit.textContent = limitText
    }
  }

  updateCharCount() {
    const textAnswer = document.getElementById('textAnswer')
    const charCount = document.getElementById('charCount')
    
    if (textAnswer && charCount) {
      const count = textAnswer.value.length
      charCount.textContent = `${count} characters`
      
      // Update color based on validation
      if (this.currentQuestion?.validation) {
        const { minLength, maxLength } = this.currentQuestion.validation
        if ((minLength && count < minLength) || (maxLength && count > maxLength)) {
          charCount.className = 'text-xs text-red-500'
        } else if (minLength && count >= minLength) {
          charCount.className = 'text-xs text-green-600'
        } else {
          charCount.className = 'text-xs text-gray-500'
        }
      }
    }
  }

  getCurrentAnswer() {
    if (!this.currentQuestion) return null

    if (this.currentQuestion.type === 'multiple_choice') {
      const selected = document.querySelector(`input[name="${this.currentQuestion.key}"]:checked`)
      return selected ? selected.value : null
    } else if (this.currentQuestion.type === 'text') {
      const textAnswer = document.getElementById('textAnswer')
      return textAnswer ? textAnswer.value.trim() : null
    }

    return null
  }

  updateProgress(current, total, percentage) {
    document.getElementById('progressText').textContent = `Question ${current} of ${total}`
    document.getElementById('progressPercentage').textContent = `${percentage}% Complete`
    document.getElementById('progressBar').style.width = `${percentage}%`
  }

  updateNavigation(canGoBack, canSkip) {
    const previousBtn = document.getElementById('previousBtn')
    const skipBtn = document.getElementById('skipBtn')

    previousBtn.disabled = !canGoBack
    
    if (canSkip) {
      skipBtn.classList.remove('hidden')
    } else {
      skipBtn.classList.add('hidden')
    }
  }

  showCompletion(data) {
    this.hideLoading()
    document.getElementById('questionContent').classList.add('hidden')
    document.getElementById('completionScreen').classList.remove('hidden')
    
    if (data.totalScore !== undefined) {
      document.getElementById('finalScore').textContent = data.totalScore
      document.getElementById('assessmentResult').textContent = data.assessmentResult || 'Completed'
    }
    
    this.completionData = data
  }

  async goToPrevious() {
    await this.submitAnswer('previous')
  }

  async goToNext() {
    await this.submitAnswer('next')
  }

  async skipQuestion() {
    await this.submitAnswer('skip')
  }

  async skipAllQuestions() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to skip all remaining questions and complete the assessment? This action cannot be undone.')) {
      await this.submitAnswer('skip_all')
    }
  }

  finish() {
    if (this.completionData?.submissionId) {
      window.location.href = `/success/${this.completionData.submissionId}`
    } else {
      this.close()
      if (this.options.onComplete) {
        this.options.onComplete(this.completionData)
      }
    }
  }

  show() {
    document.getElementById(this.options.containerId).classList.remove('hidden')
  }

  close() {
    document.getElementById(this.options.containerId).classList.add('hidden')
    this.reset()
  }

  reset() {
    this.assessmentId = null
    this.currentQuestion = null
    this.currentAnswer = null
    this.completionData = null
  }

  showLoading() {
    document.getElementById('assessmentLoading').classList.remove('hidden')
    document.getElementById('questionContent').classList.add('hidden')
    document.getElementById('completionScreen').classList.add('hidden')
  }

  hideLoading() {
    document.getElementById('assessmentLoading').classList.add('hidden')
  }

  showError(message) {
    this.hideLoading()
    const errorDiv = document.getElementById('errorMessage')
    const errorText = errorDiv.querySelector('p')
    
    errorText.textContent = message
    errorDiv.classList.remove('hidden')
    
    if (this.options.onError) {
      this.options.onError(message)
    }
  }

  hideError() {
    document.getElementById('errorMessage').classList.add('hidden')
  }
}

// Export for use in other files
window.ProgressiveAssessment = ProgressiveAssessment
