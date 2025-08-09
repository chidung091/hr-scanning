import { test } from '@japa/runner'
import sinon from 'sinon'
import env from '#start/env'
import OpenAIService from '#services/openai_service'

test.group('OpenAIService configuration', (group) => {
  let getStub: sinon.SinonStub

  group.each.setup(() => {
    getStub = sinon.stub(env, 'get')
  })

  group.each.teardown(() => {
    getStub.restore()
    ;(OpenAIService as any).instance = null
  })

  test('configured flag is false when OPENAI_API_KEY is missing', ({ assert }) => {
    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') return ''
      if (key === 'NODE_ENV') return 'test'
      return defaultValue
    })

    const service = OpenAIService.getInstance()
    assert.isFalse(service.configured)
  })

  test('configured flag is true when OPENAI_API_KEY is set', ({ assert }) => {
    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') return 'test-key'
      if (key === 'NODE_ENV') return 'test'
      return defaultValue
    })

    const service = OpenAIService.getInstance()
    assert.isTrue(service.configured)
  })

  test('getInstance returns the same instance', ({ assert }) => {
    getStub.callsFake((key: string, defaultValue?: any) => {
      if (key === 'OPENAI_API_KEY') return 'test-key'
      if (key === 'NODE_ENV') return 'test'
      return defaultValue
    })

    const first = OpenAIService.getInstance()
    const second = OpenAIService.getInstance()
    assert.strictEqual(first, second)
  })
})
