/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

const HomeController = () => import('#controllers/home_controller')

router.get('/', [HomeController, 'index'])

// Japanese Quiz API routes
router.post('/api/quiz/start', [HomeController, 'startQuiz'])
router.get('/api/quiz/:sessionId/question', [HomeController, 'getQuestion'])
router.post('/api/quiz/:sessionId/answer', [HomeController, 'submitAnswer'])
router.get('/api/quiz/:sessionId/progress', [HomeController, 'getProgress'])

// Japanese Teacher API route
router.post('/api/japanese-teacher', [HomeController, 'japaneseTeacher'])

// Swagger API Documentation routes
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})
