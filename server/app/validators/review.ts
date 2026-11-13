import vine from '@vinejs/vine'

const movieId = () => vine.number().withoutDecimals().positive()

export const listReviewsValidator = vine.compile(
  vine.object({
    params: vine.object({
      movieId: movieId(),
    }),
  })
)

export const createReviewValidator = vine.compile(
  vine.object({
    movieId: movieId(),
    rating: vine.number().withoutDecimals().range([1, 5]),
    content: vine.string().trim().maxLength(2000),
  })
)
