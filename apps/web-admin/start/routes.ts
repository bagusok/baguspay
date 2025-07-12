/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')

import router from '@adonisjs/core/services/router'
router.get('/', async ({ response }) => {
  return response.send('Hmm, sepertinya ada yang salah.')
})

router
  .group(() => {
    router.get('/register', [AuthController, 'register']).as('auth.register')
    router.post('/register', [AuthController, 'postRegister']).as('auth.postRegister')
    router.get('/login', [AuthController, 'login']).as('auth.login')
    router.post('/login', [AuthController, 'postLogin']).as('auth.postLogin')
    router.get('/logout', [AuthController, 'logout']).as('auth.logout')
  })

  .prefix('/auth')

router
  .group(() => {
    router.get('/', [HomeController, 'index']).as('home.index')
  })
  .prefix('/admin')
