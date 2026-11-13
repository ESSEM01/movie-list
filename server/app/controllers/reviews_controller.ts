import Review from '#models/review'
import type { HttpContext } from '@adonisjs/core/http'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type User from '#models/user'
import { createReviewValidator, listReviewsValidator } from '#validators/review'

/**
 * Only the public fields of the author: never expose the email
 */
const publicAuthor = (query: ModelQueryBuilderContract<typeof User>) =>
  query.select('id', 'full_name')

const isUniqueViolation = (error: unknown) => {
  const code = (error as { code?: string })?.code
  return code === 'ER_DUP_ENTRY' || code?.startsWith('SQLITE_CONSTRAINT') === true
}

export default class ReviewsController {
  // GET /api/reviews/:movieId
  public async index({ request, response }: HttpContext) {
    const {
      params: { movieId },
    } = await request.validateUsing(listReviewsValidator)

    const reviews = await Review.query().where('movieId', movieId).preload('user', publicAuthor)

    return response.ok({ reviews })
  }

  // POST /api/reviews
  public async store({ request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const { movieId, content, rating } = await request.validateUsing(createReviewValidator)

    const existing = await Review.query().where('userId', user.id).where('movieId', movieId).first()
    if (existing) {
      return response.conflict({ message: 'You have already reviewed this movie' })
    }

    let review: Review
    try {
      review = await Review.create({
        userId: user.id,
        movieId,
        comment: content,
        rating,
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return response.conflict({ message: 'You have already reviewed this movie' })
      }
      throw error
    }

    await review.load('user', publicAuthor)

    return response.created({ review })
  }
}
