import { test } from '@japa/runner'

/**
 * .env.test sets CORS_ORIGINS=http://localhost:5173,https://app.example.com
 */
test.group('CORS', () => {
  test('accetta le origini elencate in CORS_ORIGINS', async ({ client }) => {
    const response = await client.get('/api/health').header('Origin', 'https://app.example.com')

    response.assertHeader('access-control-allow-origin', 'https://app.example.com')
    response.assertHeader('access-control-allow-credentials', 'true')
  })

  test('rifiuta le origini non elencate', async ({ client, assert }) => {
    const response = await client.get('/api/health').header('Origin', 'https://evil.example.com')

    assert.isUndefined(response.header('access-control-allow-origin'))
  })

  test('accetta le richieste senza header Origin', async ({ client }) => {
    const response = await client.get('/api/health')

    response.assertStatus(200)
  })
})
