import { test } from '@japa/runner'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'

/**
 * In production the client build lives in public/. The test creates a
 * minimal one when it is missing, and removes only what it created.
 */
const INDEX_HTML = '<!doctype html><html><body><div id="root"></div></body></html>'
const ASSET = 'assets/spa-test.js'

test.group('SPA', (group) => {
  group.setup(async () => {
    const created: string[] = []
    if (!existsSync(app.publicPath('index.html'))) {
      await mkdir(app.publicPath(), { recursive: true })
      await writeFile(app.publicPath('index.html'), INDEX_HTML)
      created.push(app.publicPath('index.html'))
    }
    await mkdir(app.publicPath('assets'), { recursive: true })
    await writeFile(app.publicPath(ASSET), 'console.log("spa")')
    created.push(app.publicPath(ASSET))

    return async () => {
      await Promise.all(created.map((file) => rm(file, { force: true })))
    }
  })

  test('GET / restituisce index.html', async ({ client, assert }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    assert.match(response.header('content-type') ?? '', /text\/html/)
    assert.include(response.text(), '<div id="root">')
  })

  test('le route del client restituiscono index.html', async ({ client, assert }) => {
    for (const url of ['/login', '/movie/123', '/favorites']) {
      const response = await client.get(url)

      response.assertStatus(200)
      assert.match(response.header('content-type') ?? '', /text\/html/)
      assert.include(response.text(), '<div id="root">')
    }
  })

  test('serve i file statici con il content-type corretto', async ({ client, assert }) => {
    const response = await client.get(`/${ASSET}`)

    response.assertStatus(200)
    assert.match(response.header('content-type') ?? '', /javascript/)
  })

  test('un percorso /api inesistente resta un 404 JSON', async ({ client, assert }) => {
    const response = await client.get('/api/nonesiste')

    response.assertStatus(404)
    assert.match(response.header('content-type') ?? '', /application\/json/)
  })

  test('un POST fuori da /api non restituisce index.html', async ({ client, assert }) => {
    const response = await client.post('/movie/123')

    response.assertStatus(404)
    assert.notInclude(response.text(), '<div id="root">')
  })
})
