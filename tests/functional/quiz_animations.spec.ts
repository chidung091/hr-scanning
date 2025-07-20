import { test } from '@japa/runner'

test.group('Quiz Animations', (group) => {
  group.setup(async () => {
    // Setup test environment
  })

  test('should load quiz interface with proper mobile classes', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('quiz-container-mobile')
    response.assertTextIncludes('character-display-mobile')
    response.assertTextIncludes('min-h-[44px]')
  })

  test('should have proper answer button structure', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('answer-option')
    response.assertTextIncludes('quiz-button')
    response.assertTextIncludes('transition-colors-smooth')
  })

  test('should include animation CSS classes', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('animate-fade-in-up')
    response.assertTextIncludes('animate-slide-in-right')
    response.assertTextIncludes('transition-all-smooth')
  })

  test('should have proper mobile responsive grid', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('grid-cols-1 sm:grid-cols-2')
    response.assertTextIncludes('gap-3 sm:gap-4')
  })

  test('should include hearts display with animations', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('hearts-display')
    response.assertTextIncludes('transition-all-smooth')
    response.assertTextIncludes('❤️')
  })

  test('should have proper progress bar styling', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('progress-bar')
    response.assertTextIncludes('transition-all duration-500')
    response.assertTextIncludes('ease-out')
  })

  test('should include mobile menu functionality', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('mobile-menu')
    response.assertTextIncludes('md:hidden')
  })

  test('should have proper viewport meta tag', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('width=device-width, initial-scale=1')
  })
})
