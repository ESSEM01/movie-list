import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Origins allowed to call the API with credentials. Configure them with
 * the comma separated CORS_ORIGINS env variable; defaults to the Vite
 * dev server.
 */
const allowedOrigins = env
  .get('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // Requests without an Origin header (curl, same-origin) are allowed
  origin: (origin) => !origin || allowedOrigins.includes(origin),
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
