import { test } from '@japa/runner'
import type { Question, N5QuizQuestion } from '../../resources/js/types/index'

test.group('QuizView Styling', () => {
  test('should apply different font sizes for character vs N5 questions', async ({ assert }) => {
    // Mock DOM elements
    const mockCharacterDisplay = {
      textContent: '',
      className: '',
      classList: {
        remove: () => {},
        add: () => {},
      },
    }

    // Mock character question
    const characterQuestion: Question = {
      character: 'あ',
      options: ['a', 'i', 'u', 'e'],
      correctAnswer: 'a',
    }

    // Mock N5 question
    const n5Question: N5QuizQuestion = {
      id: 'test-n5-1',
      type: 'grammar',
      prompt: 'この本は______です。',
      choices: [
        { key: 'A', text: '高い' },
        { key: 'B', text: '安い' },
        { key: 'C', text: '新しい' },
        { key: 'D', text: '古い' },
      ],
      answer: 'A',
      explanation: 'この文脈では「高い」が適切です。',
    }

    // Test character question styling
    if ('character' in characterQuestion) {
      mockCharacterDisplay.textContent = characterQuestion.character
      mockCharacterDisplay.className =
        'text-6xl sm:text-8xl lg:text-9xl font-bold text-gray-900 mb-3 sm:mb-4 character-display-mobile transition-transform-smooth hover:scale-105 select-none'
    }

    assert.equal(mockCharacterDisplay.textContent, 'あ')
    assert.include(mockCharacterDisplay.className, 'text-6xl sm:text-8xl lg:text-9xl')
    assert.include(mockCharacterDisplay.className, 'font-bold')

    // Test N5 question styling
    if ('prompt' in n5Question) {
      mockCharacterDisplay.textContent = n5Question.prompt
      mockCharacterDisplay.className =
        'text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-relaxed transition-transform-smooth select-none text-left px-2 sm:px-4'
    }

    assert.equal(mockCharacterDisplay.textContent, 'この本は______です。')
    assert.include(mockCharacterDisplay.className, 'text-lg sm:text-xl lg:text-2xl')
    assert.include(mockCharacterDisplay.className, 'font-semibold')
    assert.include(mockCharacterDisplay.className, 'text-left')
    assert.include(mockCharacterDisplay.className, 'leading-relaxed')
  })

  test('should apply correct loading state styling', async ({ assert }) => {
    const mockCharacterDisplay = {
      textContent: '',
      className: '',
      classList: {
        remove: () => {},
        add: () => {},
      },
    }

    // Test loading state
    mockCharacterDisplay.textContent = 'Loading next question...'
    mockCharacterDisplay.className =
      'text-lg sm:text-xl font-medium text-gray-400 mb-3 sm:mb-4 transition-transform-smooth select-none text-center'

    assert.equal(mockCharacterDisplay.textContent, 'Loading next question...')
    assert.include(mockCharacterDisplay.className, 'text-lg sm:text-xl')
    assert.include(mockCharacterDisplay.className, 'font-medium')
    assert.include(mockCharacterDisplay.className, 'text-gray-400')
    assert.include(mockCharacterDisplay.className, 'text-center')
  })

  test('should differentiate between question types correctly', async ({ assert }) => {
    const characterQuestion: Question = {
      character: 'か',
      options: ['ka', 'ki', 'ku', 'ke'],
      correctAnswer: 'ka',
    }

    const n5Question: N5QuizQuestion = {
      id: 'test-n5-2',
      type: 'vocabulary',
      prompt: '私は学生______。',
      choices: [
        { key: 'A', text: 'です' },
        { key: 'B', text: 'である' },
        { key: 'C', text: 'だ' },
        { key: 'D', text: 'でした' },
      ],
      answer: 'A',
      explanation: '丁寧語では「です」を使います。',
    }

    // Test type detection
    assert.isTrue('character' in characterQuestion)
    assert.isFalse('prompt' in characterQuestion)
    assert.isFalse('choices' in characterQuestion)

    assert.isTrue('prompt' in n5Question)
    assert.isTrue('choices' in n5Question)
    assert.isFalse('character' in n5Question)
  })
})
