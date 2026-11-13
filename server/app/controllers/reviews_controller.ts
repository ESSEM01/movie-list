import Review from '#models/review'
import type { HttpContext } from '@adonisjs/core/http'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type User from '#models/user'

/**
 * Only the public fields of the author: never expose the email
 */
const publicAuthor = (query: ModelQueryBuilderContract<typeof User>) =>
  query.select('id', 'full_name')

export default class ReviewsController {
  // GET /api/reviews/:movieId
  public async index({ params, response }: HttpContext) {
    const movieId = params.movieId

    const reviews = await Review.query().where('movieId', movieId).preload('user', publicAuthor)

    return response.ok({ reviews })
  }

  // POST /api/reviews
  public async store({ request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const { movieId, content, rating } = request.only(['movieId', 'content', 'rating'])

    const review = await Review.create({
      userId: user.id,
      movieId,
      comment: content,
      rating,
    })

    await review.load('user', publicAuthor)

    return response.created({ review })
  }
}
