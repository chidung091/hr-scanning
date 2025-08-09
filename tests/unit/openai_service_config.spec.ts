import { test } from '@japa/runner'
import sinon from 'sinon'
import env from '#start/env'
import OpenAIService from '#services/openai_service'

test.group('OpenAIService configuration', () => {
  test('configured flag is false when OPENAI_API_KEY is missing', ({ assert }) => {
    const getStub = env.get as unknown as sinon.SinonStub
    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') {
        return ''
      }
      if (key === 'NODE_ENV') {
        return 'test'
      }
      return defaultValue
    })

    const service = OpenAIService.getInstance()
    assert.isFalse(service.configured)

    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') {
        return 'test-api-key'
      }
      if (key === 'NODE_ENV') {
        return 'test'
      }
      return defaultValue
    })
    ;(OpenAIService as any).instance = null
  })

  test('configured flag is true when OPENAI_API_KEY is set', ({ assert }) => {
    const getStub = env.get as unknown as sinon.SinonStub
    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') {
        return 'test-key'
      }
      if (key === 'NODE_ENV') {
        return 'test'
      }
      return defaultValue
    })

    const service = OpenAIService.getInstance()
    assert.isTrue(service.configured)

    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') {
        return 'test-api-key'
      }
      if (key === 'NODE_ENV') {
        return 'test'
      }
      return defaultValue
    })
    ;(OpenAIService as any).instance = null
  })
})
