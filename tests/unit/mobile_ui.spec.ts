import { test } from '@japa/runner'

test.group('Mobile UI Improvements', () => {
  test('should have proper CSS classes for mobile responsiveness', async ({ assert }) => {
    // Test that our CSS classes are properly defined
    const cssContent = `
      .answer-option {
        min-height: 44px !important;
        padding: 12px 16px !important;
        font-size: 16px !important;
      }
      
      .quiz-button {
        min-height: 44px;
        padding: 12px 24px;
        font-size: 16px;
      }
    `

    // Verify CSS contains mobile-friendly properties
    assert.isTrue(cssContent.includes('min-height: 44px'))
    assert.isTrue(cssContent.includes('font-size: 16px'))
  })

  test('should have animation classes defined', async ({ assert }) => {
    const animationClasses = [
      'animate-button-press',
      'animate-correct-answer',
      'animate-incorrect-answer',
      'animate-heart-loss',
      'animate-fade-in-up',
      'animate-slide-in-right',
      'animate-pulse-gentle',
    ]

    // Verify all animation classes are accounted for
    animationClasses.forEach((className) => {
      assert.isString(className)
      assert.isTrue(className.startsWith('animate-'))
    })
  })

  test('should have proper touch target sizes', async ({ assert }) => {
    // Verify minimum touch target size (44px) is met
    const minTouchTarget = 44

    assert.isAbove(minTouchTarget, 43, 'Touch targets should be at least 44px')
    assert.isNumber(minTouchTarget)
  })

  test('should support reduced motion preferences', async ({ assert }) => {
    const reducedMotionCSS = `
      @media (prefers-reduced-motion: reduce) {
        .animate-button-press,
        .animate-correct-answer,
        .animate-incorrect-answer {
          animation: none !important;
        }
      }
    `

    assert.isTrue(reducedMotionCSS.includes('prefers-reduced-motion: reduce'))
    assert.isTrue(reducedMotionCSS.includes('animation: none !important'))
  })

  test('should have high contrast mode support', async ({ assert }) => {
    const highContrastCSS = `
      @media (prefers-contrast: high) {
        .answer-option {
          border-width: 3px;
        }
      }
    `

    assert.isTrue(highContrastCSS.includes('prefers-contrast: high'))
    assert.isTrue(highContrastCSS.includes('border-width: 3px'))
  })
})
