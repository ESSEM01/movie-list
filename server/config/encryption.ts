import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

/**
 * The "legacy" driver keeps compatibility with data (cookies, sessions)
 * encrypted by AdonisJS v6 using the same APP_KEY.
 */
const encryptionConfig = defineConfig({
  default: 'legacy',
  list: {
    legacy: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),
  },
})

export default encryptionConfig
