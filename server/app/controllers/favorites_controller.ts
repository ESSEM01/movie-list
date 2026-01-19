import type { HttpContext } from '@adonisjs/core/http'
import Favorite from '#models/favorite'

export default class FavoritesController {
  /**
   * Get all favorites for authenticated user
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const favorites = await Favorite.query().where('user_id', user.id).orderBy('created_at', 'desc')

    return response.ok({
      favorites: favorites.map((fav) => ({
        id: fav.movieId,
        title: fav.title,
        release_date: fav.releaseDate,
        poster_path: fav.posterPath,
      })),
    })
  }

  /**
   * Add a movie to favorites
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const {
      id,
      title,
      release_date: releaseDate,
      poster_path: posterPath,
    } = request.only(['id', 'title', 'release_date', 'poster_path'])

    try {
      // Check if already exists
      const existing = await Favorite.query()
        .where('user_id', user.id)
        .where('movie_id', id)
        .first()

      if (existing) {
        return response.conflict({
          message: 'Movie already in favorites',
        })
      }

      const favorite = await Favorite.create({
        userId: user.id,
        movieId: id,
        title,
        releaseDate: releaseDate,
        posterPath: posterPath,
      })

      return response.created({
        favorite: {
          id: favorite.movieId,
          title: favorite.title,
          release_date: favorite.releaseDate,
          poster_path: favorite.posterPath,
        },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Unable to add favorite',
        error: error.message,
      })
    }
  }

  /**
   * Remove a movie from favorites
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { movieId } = params

    const favorite = await Favorite.query()
      .where('user_id', user.id)
      .where('movie_id', movieId)
      .first()

    if (!favorite) {
      return response.notFound({
        message: 'Favorite not found',
      })
    }

    await favorite.delete()

    return response.ok({
      message: 'Favorite removed successfully',
    })
  }
}
