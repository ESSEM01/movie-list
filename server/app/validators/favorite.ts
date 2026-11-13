import vine from '@vinejs/vine'

const movieId = () => vine.number().withoutDecimals().positive()

/**
 * Payload sent by the client: a subset of the TMDB movie object
 */
export const createFavoriteValidator = vine.compile(
  vine.object({
    id: movieId(),
    title: vine.string().trim().maxLength(255),
    release_date: vine.string().trim().maxLength(255).nullable().optional(),
    poster_path: vine.string().trim().maxLength(255).nullable().optional(),
  })
)

export const deleteFavoriteValidator = vine.compile(
  vine.object({
    params: vine.object({
      movieId: movieId(),
    }),
  })
)
