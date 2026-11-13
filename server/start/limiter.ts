/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/**
 * Brute-force protection for login and registration: 5 attempts per
 * minute for each IP + email pair. The email is lowercased so changing
 * its case does not reset the counter.
 */
export const authThrottle = limiter.define('auth', (ctx) => {
  const email = String(ctx.request.input('email', ''))
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')

  return limiter.allowRequests(5).every('1 minute').usingKey(`${ctx.request.ip()}_${email}`)
})

/**
 * Per-IP ceiling across all emails, against password spraying from a
 * single address.
 */
export const authIpThrottle = limiter.define('auth_ip', (ctx) => {
  return limiter.allowRequests(20).every('1 minute').usingKey(`ip_${ctx.request.ip()}`)
})
