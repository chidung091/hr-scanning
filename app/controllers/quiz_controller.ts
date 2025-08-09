import type { HttpContext } from '@adonisjs/core/http'
import '@adonisjs/core/providers/edge_provider'
import QuizService, { QuizQuestion } from '#services/quiz_service'

export default class QuizController {
  viewIndex({ view }: HttpContext) {
    return view.render('quiz/index')
  }

  async newQuiz({ response }: HttpContext) {
    const data = await QuizService.generateQuiz()
    return response.json(data)
  }

  async explain({ request, response }: HttpContext) {
    const { question, selected } = request.only(['question', 'selected'])
    if (!question || typeof selected !== 'string') {
      return response.badRequest({ error: 'Invalid payload' })
    }
    const result = await QuizService.explain(question as QuizQuestion, selected)
    return response.json(result)
  }
}
