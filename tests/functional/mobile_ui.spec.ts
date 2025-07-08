import { test } from '@japa/runner'
import Job from '#models/job'

test.group('Mobile UI Responsiveness', (group) => {
  let testJob: Job

  group.setup(async () => {
    // Create a test job
    testJob = await Job.create({
      jobTitle: 'Test Mobile Engineer',
      numberOfEmployees: 1,
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      workingTime: 'Full-time',
      workLocation: 'Remote',
      salaryRange: '$100k - $150k',
      responsibilities: 'Test mobile responsibilities',
      requirements: 'Test mobile requirements',
      isActive: true,
      sortOrder: 0,
    })
  })

  group.teardown(async () => {
    // Clean up test data
    await Job.query().delete()
  })

  test('should render home page with mobile navigation', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    const html = response.text()

    // Check for responsive classes
    assert.include(html, 'sm:')
    assert.include(html, 'md:')
    assert.include(html, 'lg:')

    // Check for mobile-first responsive typography
    assert.include(html, 'text-3xl')

    // Check for responsive grid layouts
    assert.include(html, 'grid-cols-1')
  })

  test('should render jobs page with mobile-friendly layout', async ({ client, assert }) => {
    const response = await client.get('/jobs')

    response.assertStatus(200)
    const html = response.text()

    // Check for responsive job listings
    assert.include(html, 'sm:')
    assert.include(html, 'md:')

    // Check for mobile-friendly job cards
    assert.include(html, 'space-y-')
    assert.include(html, 'px-')
  })

  test('should render job detail page with mobile navigation', async ({ client, assert }) => {
    const response = await client.get(`/jobs/${testJob.id}`)

    response.assertStatus(200)
    const html = response.text()

    // Check for responsive breadcrumbs
    assert.include(html, 'text-sm')

    // Check for mobile-friendly content layout
    assert.include(html, 'space-y-')
    assert.include(html, 'px-')

    // Check for responsive typography
    assert.include(html, 'text-2xl')
  })

  test('should include mobile menu JavaScript functionality', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    const html = response.text()

    // Check for JavaScript functionality
    assert.include(html, 'addEventListener')
    assert.include(html, 'classList.toggle')

    // Check for proper event handling
    assert.include(html, 'click')
    assert.include(html, 'hidden')
  })

  test('should have proper viewport meta tag for mobile', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    const html = response.text()

    // Check for mobile viewport meta tag
    assert.include(html, 'name="viewport"')
    assert.include(html, 'width=device-width')
    assert.include(html, 'initial-scale=1')
  })

  test('should include Tailwind CSS responsive utilities', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    const html = response.text()

    // Check for various responsive breakpoints
    const responsiveClasses = [
      'sm:block',
      'md:flex',
      'lg:grid',
      'xl:text',
      'sm:hidden',
      'md:space',
      'lg:p-',
      'sm:w-',
      'md:h-',
      'lg:max-w',
    ]

    let foundResponsiveClasses = 0
    responsiveClasses.forEach((className) => {
      if (html.includes(className)) {
        foundResponsiveClasses++
      }
    })

    // Should have at least some responsive classes
    assert.isTrue(foundResponsiveClasses > 0)
  })

  test('should have mobile-friendly form elements', async ({ client, assert }) => {
    const response = await client.get(`/jobs/${testJob.id}`)

    response.assertStatus(200)
    const html = response.text()

    // Check for mobile-friendly form styling
    if (html.includes('<form')) {
      // Check for responsive form elements
      assert.include(html, 'w-full')
      assert.include(html, 'px-3')
      assert.include(html, 'py-2')
    }

    // Check for mobile-friendly buttons
    if (html.includes('button') || html.includes('btn')) {
      assert.include(html, 'px-4')
      assert.include(html, 'py-2')
    }
  })

  test('should handle mobile navigation state properly', async ({ client, assert }) => {
    const response = await client.get('/jobs')

    response.assertStatus(200)
    const html = response.text()

    // Check that mobile menu starts hidden
    assert.include(html, 'hidden')

    // Check for proper ARIA attributes for accessibility
    if (html.includes('aria-')) {
      assert.include(html, 'aria-expanded')
    }

    // Check for responsive navigation
    assert.include(html, 'sm:')
    assert.include(html, 'md:')
  })
})
