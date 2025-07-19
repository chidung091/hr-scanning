/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const HomeController = () => import('#controllers/home_controller')

router.get('/', [HomeController, 'index'])

// Japanese Quiz API routes
router.post('/api/quiz/start', [HomeController, 'startQuiz'])
router.get('/api/quiz/:sessionId/question', [HomeController, 'getQuestion'])
router.post('/api/quiz/:sessionId/answer', [HomeController, 'submitAnswer'])
router.get('/api/quiz/:sessionId/progress', [HomeController, 'getProgress'])
