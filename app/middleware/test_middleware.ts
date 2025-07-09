import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TestMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    console.log('TestMiddleware: This middleware is working!')

    ctx.response.header('X-Test-Middleware', 'working')

    await next()
  }
}
