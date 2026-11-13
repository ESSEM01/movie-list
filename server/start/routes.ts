/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { authIpThrottle, authThrottle } from './limiter.js'

// Health check
router.get('/', async () => {
  return {
    hello: 'Movie List API',
    version: '1.0.0',
  }
})

// API routes
// Auth routes (non protette)
router
  .group(() => {
    router
      .post('/register', '#controllers/auth_controller.register')
      .use([authIpThrottle, authThrottle])
    router.post('/login', '#controllers/auth_controller.login').use([authIpThrottle, authThrottle])
    router.post('/logout', '#controllers/auth_controller.logout').use(middleware.auth())
    router.get('/me', '#controllers/auth_controller.me').use(middleware.auth())
  })
  .prefix('/api/auth')

// Favorites routes (protette)
router
  .group(() => {
    router.get('/', '#controllers/favorites_controller.index')
    router.post('/', '#controllers/favorites_controller.store')
    router.delete('/:movieId', '#controllers/favorites_controller.destroy')
  })
  .prefix('/api/favorites')
  .use(middleware.auth())

// Reviews routes
router
  .group(() => {
    router.get('/:movieId', '#controllers/reviews_controller.index')
    router.post('/', '#controllers/reviews_controller.store')
  })
  .prefix('/api/reviews')
  .use(middleware.auth())
