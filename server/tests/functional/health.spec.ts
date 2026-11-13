import { test } from '@japa/runner'

test.group('Health check', () => {
  test('GET /api/health risponde con il nome della API', async ({ client }) => {
    const response = await client.get('/api/health')

    response.assertStatus(200)
    response.assertBodyContains({ hello: 'Movie List API' })
  })
})
