import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'

test.group('Auth | rate limit', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => () => limiter.clear())

  test('blocca il sesto tentativo di login in un minuto con 429', async ({ client }) => {
    await User.create({ email: 'bruteforce@example.com', password: 'password-sicura' })

    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await client
        .post('/api/auth/login')
        .json({ email: 'bruteforce@example.com', password: 'password-sbagliata' })
      response.assertStatus(401)
    }

    const blocked = await client
      .post('/api/auth/login')
      .json({ email: 'bruteforce@example.com', password: 'password-sicura' })
    blocked.assertStatus(429)
  })

  test('il limite e per email: un altro account dallo stesso IP non e bloccato', async ({
    client,
  }) => {
    await User.create({ email: 'altro@example.com', password: 'password-sicura' })

    for (let attempt = 0; attempt < 5; attempt++) {
      await client
        .post('/api/auth/login')
        .json({ email: 'vittima@example.com', password: 'password-sbagliata' })
    }

    const response = await client
      .post('/api/auth/login')
      .json({ email: 'altro@example.com', password: 'password-sicura' })
    response.assertStatus(200)
  })

  test("il limite ignora maiuscole e minuscole nell'email", async ({ client }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await client
        .post('/api/auth/login')
        .json({ email: 'case@example.com', password: 'password-sbagliata' })
    }

    const response = await client
      .post('/api/auth/login')
      .json({ email: 'CASE@example.com', password: 'password-sbagliata' })
    response.assertStatus(429)
  })

  test("il limite ignora gli accenti nell'email", async ({ client }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await client
        .post('/api/auth/login')
        .json({ email: 'accento@example.com', password: 'password-sbagliata' })
    }

    const response = await client
      .post('/api/auth/login')
      .json({ email: 'accénto@example.com', password: 'password-sbagliata' })
    response.assertStatus(429)
  })

  test('blocca oltre 20 tentativi al minuto dallo stesso IP anche con email diverse', async ({
    client,
  }) => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const response = await client
        .post('/api/auth/login')
        .json({ email: `spray${attempt}@example.com`, password: 'password-sbagliata' })
      response.assertStatus(401)
    }

    const blocked = await client
      .post('/api/auth/login')
      .json({ email: 'spray-ultimo@example.com', password: 'password-sbagliata' })
    blocked.assertStatus(429)
  })

  test('blocca la sesta registrazione in un minuto con 429', async ({ client }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await client.post('/api/auth/register').json({ email: 'spam@example.com', password: 'corta' })
    }

    const response = await client
      .post('/api/auth/register')
      .json({ email: 'spam@example.com', password: 'password-sicura' })
    response.assertStatus(429)
  })
})
