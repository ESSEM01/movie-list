import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'

type Call = { url: URL; headers: Headers }

/**
 * Replaces global fetch for TMDB URLs only, recording each upstream call.
 */
function fakeTmdb(reply: (url: URL) => { status: number; body: unknown }) {
  const original = globalThis.fetch
  const calls: Call[] = []

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input.toString())
    if (url.hostname !== 'api.themoviedb.org') return original(input, init)

    calls.push({ url, headers: new Headers(init?.headers) })
    const { status, body } = reply(url)
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch

  return { calls, restore: () => (globalThis.fetch = original) }
}

const createUser = () => User.create({ email: 'cinefilo@example.com', password: 'password-sicura' })

test.group('TMDB proxy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => () => limiter.clear())

  test('richiede il login', async ({ client }) => {
    const response = await client.get('/api/tmdb/movies/popular')

    response.assertStatus(401)
  })

  test('inoltra i film popolari aggiungendo la chiave lato server', async ({ client, assert }) => {
    const tmdb = fakeTmdb(() => ({ status: 200, body: { results: [{ id: 1, title: 'Film' }] } }))
    const user = await createUser()

    try {
      const response = await client.get('/api/tmdb/movies/popular').loginAs(user)

      response.assertStatus(200)
      response.assertBodyContains({ results: [{ id: 1, title: 'Film' }] })
      assert.lengthOf(tmdb.calls, 1)
      assert.equal(tmdb.calls[0].url.pathname, '/3/movie/popular')
      assert.equal(tmdb.calls[0].url.searchParams.get('api_key'), 'test-tmdb-key')
      assert.notInclude(JSON.stringify(response.body()), 'test-tmdb-key')
    } finally {
      tmdb.restore()
    }
  })

  test('passa la query di ricerca codificata', async ({ client, assert }) => {
    const tmdb = fakeTmdb(() => ({ status: 200, body: { results: [] } }))
    const user = await createUser()

    try {
      const response = await client
        .get('/api/tmdb/search')
        .qs({ query: 'la vita è bella&api_key=altra' })
        .loginAs(user)

      response.assertStatus(200)
      assert.equal(tmdb.calls[0].url.pathname, '/3/search/movie')
      assert.equal(tmdb.calls[0].url.searchParams.get('query'), 'la vita è bella&api_key=altra')
      assert.deepEqual(tmdb.calls[0].url.searchParams.getAll('api_key'), ['test-tmdb-key'])
    } finally {
      tmdb.restore()
    }
  })

  test('rifiuta una ricerca vuota con 422', async ({ client }) => {
    const user = await createUser()

    const response = await client.get('/api/tmdb/search').qs({ query: '  ' }).loginAs(user)

    response.assertStatus(422)
  })

  test('chiede i dettagli con crediti e video', async ({ client, assert }) => {
    const tmdb = fakeTmdb(() => ({ status: 200, body: { id: 550, title: 'Fight Club' } }))
    const user = await createUser()

    try {
      const response = await client.get('/api/tmdb/movies/550').loginAs(user)

      response.assertStatus(200)
      assert.equal(tmdb.calls[0].url.pathname, '/3/movie/550')
      assert.equal(tmdb.calls[0].url.searchParams.get('append_to_response'), 'credits,videos')
    } finally {
      tmdb.restore()
    }
  })

  test('rifiuta un id non valido senza chiamare TMDB', async ({ client, assert }) => {
    const tmdb = fakeTmdb(() => ({ status: 200, body: {} }))
    const user = await createUser()

    try {
      const response = await client.get('/api/tmdb/movies/..%2Fconfiguration').loginAs(user)

      response.assertStatus(422)
      assert.lengthOf(tmdb.calls, 0)
    } finally {
      tmdb.restore()
    }
  })

  test('inoltra generi e scoperta per genere', async ({ client, assert }) => {
    const tmdb = fakeTmdb((url) =>
      url.pathname === '/3/genre/movie/list'
        ? { status: 200, body: { genres: [{ id: 18, name: 'Dramma' }] } }
        : { status: 200, body: { results: [{ id: 2 }] } }
    )
    const user = await createUser()

    try {
      const genres = await client.get('/api/tmdb/genres').loginAs(user)
      const discover = await client.get('/api/tmdb/genres/18/movies').loginAs(user)

      genres.assertBodyContains({ genres: [{ id: 18, name: 'Dramma' }] })
      discover.assertBodyContains({ results: [{ id: 2 }] })
      assert.equal(tmdb.calls[1].url.pathname, '/3/discover/movie')
      assert.equal(tmdb.calls[1].url.searchParams.get('with_genres'), '18')
    } finally {
      tmdb.restore()
    }
  })

  test('un film inesistente su TMDB risponde 404', async ({ client }) => {
    const tmdb = fakeTmdb(() => ({ status: 404, body: { status_message: 'not found' } }))
    const user = await createUser()

    try {
      const response = await client.get('/api/tmdb/movies/999999999').loginAs(user)

      response.assertStatus(404)
    } finally {
      tmdb.restore()
    }
  })

  test('un errore di TMDB diventa 502 senza dettagli', async ({ client, assert }) => {
    const tmdb = fakeTmdb(() => ({ status: 401, body: { status_message: 'Invalid API key' } }))
    const user = await createUser()

    try {
      const response = await client.get('/api/tmdb/movies/popular').loginAs(user)

      response.assertStatus(502)
      assert.notInclude(JSON.stringify(response.body()), 'Invalid API key')
    } finally {
      tmdb.restore()
    }
  })
})
