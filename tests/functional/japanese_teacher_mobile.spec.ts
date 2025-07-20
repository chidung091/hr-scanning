import { test } from '@japa/runner'

test.group('Japanese Teacher Mobile Swipe Interface', (group) => {
  group.setup(async () => {
    // Setup test environment
  })

  test('should load Japanese Teacher section with mobile swipe layout', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('japanese-teacher-mobile-layout')
    response.assertTextIncludes('japanese-teacher-swipe-wrapper')
    response.assertTextIncludes('japanese-teacher-slide')
  })

  test('should have proper mobile responsive classes', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('japanese-teacher-desktop-layout')
    response.assertTextIncludes('japanese-teacher-mobile-container')
    response.assertTextIncludes('japanese-teacher-slide-content')
  })

  test('should include navigation arrows for accessibility', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('japanese-teacher-prev')
    response.assertTextIncludes('japanese-teacher-next')
    response.assertTextIncludes('aria-label="Previous section"')
    response.assertTextIncludes('aria-label="Next section"')
  })

  test('should have pagination dots with proper ARIA attributes', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('japanese-teacher-pagination')
    response.assertTextIncludes('japanese-teacher-dot')
    response.assertTextIncludes('role="tab"')
    response.assertTextIncludes('aria-selected="true"')
  })

  test('should include progress bar with ARIA attributes', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('japanese-teacher-progress')
    response.assertTextIncludes('japanese-teacher-progress-bar')
    response.assertTextIncludes('role="progressbar"')
    response.assertTextIncludes('aria-valuenow="1"')
  })

  test('should have all six slides with proper content sections', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('result-input-mobile')
    response.assertTextIncludes('result-romaji-mobile')
    response.assertTextIncludes('result-furigana-mobile')
    response.assertTextIncludes('result-pronunciation-mobile')
    response.assertTextIncludes('result-meaning-mobile')
    response.assertTextIncludes('result-example-jp-mobile')
    response.assertTextIncludes('result-example-vn-mobile')
    response.assertTextIncludes('result-note-mobile')
  })

  test('should have proper slide ARIA labels', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('aria-label="Japanese word and furigana"')
    response.assertTextIncludes('aria-label="Pronunciation guide"')
    response.assertTextIncludes('aria-label="Vietnamese meaning"')
    response.assertTextIncludes('aria-label="Japanese example sentence"')
    response.assertTextIncludes('aria-label="Vietnamese example translation"')
    response.assertTextIncludes('aria-label="Usage notes and tips"')
  })

  test('should preserve desktop layout alongside mobile layout', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('result-input-desktop')
    response.assertTextIncludes('result-romaji-desktop')
    response.assertTextIncludes('result-meaning-desktop')
    response.assertTextIncludes('result-example-jp-desktop')
    response.assertTextIncludes('result-note-desktop')
  })

  test('should have proper responsive breakpoint CSS classes', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('md:grid-cols-2')
    response.assertTextIncludes('sm:px-6')
    response.assertTextIncludes('lg:px-8')
  })

  test('should include Japanese Teacher API endpoint', async ({ client }) => {
    const response = await client.post('/api/japanese-teacher').json({ input: '' })

    // Should return bad request for empty input
    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Input is required. Please provide a Japanese word or grammar pattern.',
    })
  })
})
