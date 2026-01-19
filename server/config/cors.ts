import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // Allow requests from React dev server
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173',
    ]
    return allowedOrigins.includes(origin || '') || !origin
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
