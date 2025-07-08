import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  async dashboard({ view }: HttpContext) {
    return view.render('pages/admin')
  }
}
