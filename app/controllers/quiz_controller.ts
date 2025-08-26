import type { HttpContext } from '@adonisjs/core/http'
import '@adonisjs/core/providers/edge_provider'
import N5QuizService, { N5QuizQuestion } from '#services/n5_quiz_service'

export default class QuizController {
  viewIndex({ view }: HttpContext) {
    return view.render('quiz/index')
  }

  async newQuiz({ response }: HttpContext) {
    const data = await N5QuizService.generateQuiz()
    return response.json(data)
  }

  async explain({ request, response }: HttpContext) {
    const { question, selected } = request.only(['question', 'selected'])
    if (!question || typeof selected !== 'string') {
      return response.badRequest({ error: 'Invalid payload' })
    }
    const result = await N5QuizService.explain(question as N5QuizQuestion, selected)
    return response.json(result)
  }
}
