import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { tmdbGet, TmdbNotConfigured, TmdbNotFound } from '#services/tmdb'
import { genreValidator, movieValidator, searchValidator } from '#validators/tmdb'

/**
 * Read-only proxy towards TMDB: the client never sees the API key.
 */
export default class TmdbController {
  async popular(ctx: HttpContext) {
    return this.forward(ctx, '/movie/popular')
  }

  async search(ctx: HttpContext) {
    const { query } = await ctx.request.validateUsing(searchValidator)
    return this.forward(ctx, '/search/movie', { query })
  }

  async movie(ctx: HttpContext) {
    const { params } = await ctx.request.validateUsing(movieValidator)
    return this.forward(ctx, `/movie/${params.id}`, { append_to_response: 'credits,videos' })
  }

  async genres(ctx: HttpContext) {
    return this.forward(ctx, '/genre/movie/list')
  }

  async byGenre(ctx: HttpContext) {
    const { params } = await ctx.request.validateUsing(genreValidator)
    return this.forward(ctx, '/discover/movie', { with_genres: String(params.genreId) })
  }

  private async forward({ response }: HttpContext, path: string, params?: Record<string, string>) {
    try {
      return response.ok(await tmdbGet(path, params))
    } catch (error) {
      if (error instanceof TmdbNotFound) {
        return response.notFound({ message: 'Movie not found' })
      }
      if (error instanceof TmdbNotConfigured) {
        logger.error('TMDB_API_KEY is missing')
        return response.serviceUnavailable({ message: 'Movie catalogue unavailable' })
      }
      logger.error({ err: error, path }, 'TMDB request failed')
      return response.badGateway({ message: 'Movie catalogue unavailable' })
    }
  }
}
