import vine from '@vinejs/vine'

/**
 * Bcrypt-compatible upper bound: longer passwords are truncated by
 * many hashers and make hashing a cheap DoS vector.
 */
const password = () => vine.string().minLength(8).maxLength(72)

export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .maxLength(254)
      .unique({ table: 'users', column: 'email', caseInsensitive: true }),
    password: password(),
    fullName: vine.string().trim().maxLength(255).nullable().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().maxLength(254),
    password: vine.string().maxLength(72),
  })
)
