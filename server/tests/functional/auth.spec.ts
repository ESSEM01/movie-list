import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Auth | register', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('registra un utente con dati validi', async ({ client, assert }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'mario@example.com',
      password: 'password-sicura',
      fullName: 'Mario Rossi',
    })

    response.assertStatus(201)
    response.assertBodyContains({ user: { email: 'mario@example.com', fullName: 'Mario Rossi' } })
    assert.notProperty(response.body().user, 'password')
  })

  test('rifiuta una email non valida con 422', async ({ client }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'non-una-email',
      password: 'password-sicura',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'email' }] })
  })

  test('rifiuta una email gia registrata con 422', async ({ client }) => {
    await User.create({ email: 'doppio@example.com', password: 'password-sicura' })

    const response = await client.post('/api/auth/register').json({
      email: 'doppio@example.com',
      password: 'altra-password',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'email', rule: 'database.unique' }] })
  })

  test('rifiuta una password piu corta di 8 caratteri', async ({ client }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'corta@example.com',
      password: 'corta',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'password', rule: 'minLength' }] })
  })

  test('rifiuta una password piu lunga di 72 caratteri', async ({ client }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'lunga@example.com',
      password: 'a'.repeat(73),
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'password', rule: 'maxLength' }] })
  })
})

test.group('Auth | login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('effettua il login con credenziali corrette', async ({ client }) => {
    await User.create({ email: 'login@example.com', password: 'password-sicura' })

    const response = await client.post('/api/auth/login').json({
      email: 'login@example.com',
      password: 'password-sicura',
    })

    response.assertStatus(200)
    response.assertBodyContains({ user: { email: 'login@example.com' } })
  })

  test('rifiuta credenziali errate con 401', async ({ client }) => {
    await User.create({ email: 'errata@example.com', password: 'password-sicura' })

    const response = await client.post('/api/auth/login').json({
      email: 'errata@example.com',
      password: 'password-sbagliata',
    })

    response.assertStatus(401)
  })

  test('rifiuta un payload senza email con 422', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({ password: 'password-sicura' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'email' }] })
  })
})
