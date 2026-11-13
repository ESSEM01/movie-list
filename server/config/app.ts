import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/core/http'

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
  generateRequestId: true,
  allowMethodSpoofing: false,

  /**
   * On Render the app is not reachable from the internet: every request
   * goes through Render's proxy, which connects from a private address
   * (the default only trusts loopback) and puts the client IP in
   * X-Forwarded-For. Trusting every hop makes request.ip() return the
   * leftmost X-Forwarded-For entry, the client IP, which the per-IP rate
   * limits in start/limiter.ts rely on. Render makes the same choice for
   * Python apps (FORWARDED_ALLOW_IPS=*). A client that sends its own
   * X-Forwarded-For could choose that entry if the proxy appends to the
   * header instead of replacing it: check it once deployed (see DEPLOY.md).
   * Do not keep this if the server is ever exposed without a proxy.
   */
  trustProxy: true,

  /**
   * Enabling async local storage will let you access HTTP context
   * from anywhere inside your application.
   */
  useAsyncLocalStorage: false,

  /**
   * Manage cookies configuration. The settings for the session id cookie are
   * defined inside the "config/session.ts" file.
   */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
})
