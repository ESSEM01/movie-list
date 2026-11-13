import vine from '@vinejs/vine'

const id = () => vine.number().withoutDecimals().positive()

export const searchValidator = vine.compile(
  vine.object({
    query: vine.string().trim().minLength(1).maxLength(200),
  })
)

export const movieValidator = vine.compile(
  vine.object({
    params: vine.object({ id: id() }),
  })
)

export const genreValidator = vine.compile(
  vine.object({
    params: vine.object({ genreId: id() }),
  })
)
