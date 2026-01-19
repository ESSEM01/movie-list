import Review from '#models/review'
import type { HttpContext } from '@adonisjs/core/http'

export default class ReviewsController {
  // GET /api/reviews/:movieId
  public async index({ params, response }: HttpContext) {
    const movieId = params.movieId

    const reviews = await Review.query().where('movieId', movieId).preload('user')

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

    await review.load('user')

    return response.created({ review })
  }
}
