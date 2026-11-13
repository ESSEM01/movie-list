import env from '#start/env'

const BASE_URL = 'https://api.themoviedb.org/3'
const TIMEOUT_MS = 10_000

export class TmdbNotConfigured extends Error {}
export class TmdbNotFound extends Error {}
export class TmdbUnavailable extends Error {}

/**
 * Calls TMDB from the server so the API key never reaches the browser.
 * Accepts both a v3 API key (sent as `api_key`) and a v4 read access
 * token (a JWT, sent as a Bearer header).
 */
export async function tmdbGet(path: string, params: Record<string, string> = {}) {
  const key = env.get('TMDB_API_KEY')
  if (!key) throw new TmdbNotConfigured('TMDB_API_KEY is not set')

  const url = new URL(`${BASE_URL}${path}`)
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)

  const headers: Record<string, string> = { accept: 'application/json' }
  if (key.startsWith('eyJ')) {
    headers.authorization = `Bearer ${key}`
  } else {
    url.searchParams.set('api_key', key)
  }

  let response: Response
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch (error) {
    throw new TmdbUnavailable('TMDB request failed', { cause: error })
  }

  if (response.status === 404) throw new TmdbNotFound('Not found on TMDB')
  if (!response.ok) throw new TmdbUnavailable(`TMDB responded ${response.status}`)

  return response.json()
}
