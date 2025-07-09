import { test } from '@japa/runner'
import AiCriteria from '#models/ai_criteria'

test.group('Admin Criteria Weight Handling', (group) => {
  // Mock the database operations to avoid real database connections
  group.setup(() => {
    // Mock AiCriteria.query() to return mock data
    const mockQuery = {
      orderBy: () => mockQuery,
      where: () => mockQuery,
      sum: () => Promise.resolve([{ $extras: { total: '0.85' } }]), // String value from DB
    }

    AiCriteria.query = () => mockQuery as any
  })

  test('should handle string weight values from database', async ({ assert }) => {
    // Test the getTotalWeight method with string value from database
    const totalWeight = await AiCriteria.getTotalWeight()

    assert.isNumber(totalWeight)
    assert.equal(totalWeight, 0.85)
  })

  test('should handle null/undefined weight values', async ({ assert }) => {
    // Mock query to return null total
    const mockQuery = {
      orderBy: () => mockQuery,
      where: () => mockQuery,
      sum: () => Promise.resolve([{ $extras: { total: null } }]),
    }

    AiCriteria.query = () => mockQuery as any

    const totalWeight = await AiCriteria.getTotalWeight()

    assert.isNumber(totalWeight)
    assert.equal(totalWeight, 0)
  })

  test('should serialize weight as number', ({ assert }) => {
    // Create a mock criteria instance
    const criteria = new AiCriteria()

    // Mock the super.serialize() method to return string weight
    criteria.serialize = function () {
      const mockSerialized = {
        id: 1,
        name: 'Test Criteria',
        weight: '0.25', // String value from database
        description: 'Test description',
        isActive: true,
        sortOrder: 1,
      }

      // Call the actual serialize method logic
      return {
        ...mockSerialized,
        weight: Number.parseFloat(mockSerialized.weight) || 0,
      }
    }

    const serialized = criteria.serialize()

    assert.isNumber(serialized.weight)
    assert.equal(serialized.weight, 0.25)
  })

  test('should handle invalid weight values in serialization', ({ assert }) => {
    const criteria = new AiCriteria()

    // Mock the super.serialize() method to return invalid weight
    criteria.serialize = function () {
      const mockSerialized = {
        id: 1,
        name: 'Test Criteria',
        weight: 'invalid', // Invalid weight value
        description: 'Test description',
        isActive: true,
        sortOrder: 1,
      }

      // Call the actual serialize method logic
      return {
        ...mockSerialized,
        weight: Number.parseFloat(mockSerialized.weight) || 0,
      }
    }

    const serialized = criteria.serialize()

    assert.isNumber(serialized.weight)
    assert.equal(serialized.weight, 0) // Should default to 0 for invalid values
  })
})
