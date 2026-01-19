import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])

    const user = await User.create({
      email,
      password,
      fullName,
    })

    await auth.use('web').login(user)

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      })
    } catch {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out successfully' })
  }

  async me({ auth, response }: HttpContext) {
    return response.ok({
      user: {
        id: auth.user!.id,
        email: auth.user!.email,
        fullName: auth.user!.fullName,
      },
    })
  }
}
