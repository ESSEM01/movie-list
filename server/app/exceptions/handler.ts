import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import { ExceptionHandler, errors } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (this.#isClientRoute(error, ctx)) {
      return ctx.response.download(app.publicPath('index.html'))
    }

    return super.handle(error, ctx)
  }

  /**
   * SPA fallback: a GET outside /api with no matching route and no static
   * file is a React Router route (/login, /movie/:id, ...), so it gets the
   * client's index.html. Unknown /api routes keep their 404 JSON.
   */
  #isClientRoute(error: unknown, { request }: HttpContext) {
    const url = request.url()

    return (
      error instanceof errors.E_ROUTE_NOT_FOUND &&
      ['GET', 'HEAD'].includes(request.method()) &&
      url !== '/api' &&
      !url.startsWith('/api/') &&
      existsSync(app.publicPath('index.html'))
    )
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    // A client route served as index.html is not an error worth logging
    if (this.#isClientRoute(error, ctx)) {
      return
    }

    return super.report(error, ctx)
  }
}
