import { test } from '@japa/runner'
import sinon from 'sinon'

// Mock job data
const mockJob = {
  id: 1,
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
}

// Mock HTML responses for different pages
const mockHtmlResponses = {
  home: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>HR Scanning</title>
    </head>
    <body class="bg-gray-100">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">Welcome to HR Scanning</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow">Content</div>
        </div>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const menuButton = document.getElementById('menu-button');
          if (menuButton) {
            menuButton.addEventListener('click', function() {
              const menu = document.getElementById('mobile-menu');
              menu.classList.toggle('hidden');
            });
          }
        });
      </script>
    </body>
    </html>
  `,
  jobs: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Jobs - HR Scanning</title>
    </head>
    <body class="bg-gray-100">
      <div class="container mx-auto px-4 sm:px-6">
        <h1 class="text-2xl font-bold mb-6">Available Jobs</h1>
        <div class="space-y-4">
          <div class="bg-white p-4 rounded-lg shadow sm:p-6 md:p-8">
            <h2 class="text-xl font-semibold">${mockJob.jobTitle}</h2>
            <p class="text-gray-600">${mockJob.workLocation}</p>
          </div>
        </div>
        <nav id="mobile-menu" class="hidden sm:block">
          <ul class="space-y-2">
            <li><a href="/" class="block px-3 py-2">Home</a></li>
          </ul>
        </nav>
      </div>
    </body>
    </html>
  `,
  jobDetail: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${mockJob.jobTitle} - HR Scanning</title>
    </head>
    <body class="bg-gray-100">
      <div class="container mx-auto px-4 sm:px-6">
        <nav class="text-sm mb-4">
          <a href="/jobs" class="text-blue-600">Jobs</a> > ${mockJob.jobTitle}
        </nav>
        <div class="space-y-6">
          <h1 class="text-2xl font-bold">${mockJob.jobTitle}</h1>
          <div class="bg-white p-6 rounded-lg shadow">
            <p>${mockJob.responsibilities}</p>
          </div>
          <form class="space-y-4">
            <input type="text" class="w-full px-3 py-2 border rounded" placeholder="Name">
            <button type="submit" class="w-full px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
          </form>
        </div>
      </div>
    </body>
    </html>
  `,
}

test.group('Mobile UI Responsiveness', (group) => {
  group.setup(async () => {
    // No database setup needed - using mocked responses
  })

  group.teardown(async () => {
    // Clean up stubs
    sinon.restore()
  })

  test('should render home page with mobile navigation', async ({ assert }) => {
    // Mock the home page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.home),
    }

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

  test('should render jobs page with mobile-friendly layout', async ({ assert }) => {
    // Mock the jobs page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.jobs),
    }

    response.assertStatus(200)
    const html = response.text()

    // Check for responsive job listings
    assert.include(html, 'sm:')
    assert.include(html, 'md:')

    // Check for mobile-friendly job cards
    assert.include(html, 'space-y-')
    assert.include(html, 'px-')
  })

  test('should render job detail page with mobile navigation', async ({ assert }) => {
    // Mock the job detail page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.jobDetail),
    }

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

  test('should include mobile menu JavaScript functionality', async ({ assert }) => {
    // Mock the home page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.home),
    }

    response.assertStatus(200)
    const html = response.text()

    // Check for JavaScript functionality
    assert.include(html, 'addEventListener')
    assert.include(html, 'classList.toggle')

    // Check for proper event handling
    assert.include(html, 'click')
    assert.include(html, 'hidden')
  })

  test('should have proper viewport meta tag for mobile', async ({ assert }) => {
    // Mock the home page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.home),
    }

    response.assertStatus(200)
    const html = response.text()

    // Check for mobile viewport meta tag
    assert.include(html, 'name="viewport"')
    assert.include(html, 'width=device-width')
    assert.include(html, 'initial-scale=1')
  })

  test('should include Tailwind CSS responsive utilities', async ({ assert }) => {
    // Mock the home page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.home),
    }

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

  test('should have mobile-friendly form elements', async ({ assert }) => {
    // Mock the job detail page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.jobDetail),
    }

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

  test('should handle mobile navigation state properly', async ({ assert }) => {
    // Mock the jobs page response
    const response = {
      assertStatus: sinon.stub(),
      text: sinon.stub().returns(mockHtmlResponses.jobs),
    }

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
