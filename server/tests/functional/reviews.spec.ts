import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Review from '#models/review'

const createUser = (email = 'recensore@example.com') =>
  User.create({ email, password: 'password-sicura', fullName: 'Anna Bianchi' })

test.group('Reviews | index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test("non espone l'email dell'autore", async ({ client, assert }) => {
    const author = await createUser()
    await Review.create({ userId: author.id, movieId: 42, rating: 4, comment: 'Bello' })
    const reader = await createUser('lettore@example.com')

    const response = await client.get('/api/reviews/42').loginAs(reader)

    response.assertStatus(200)
    const [review] = response.body().reviews
    assert.deepEqual(review.user, { id: author.id, fullName: 'Anna Bianchi' })
  })

  test('rifiuta un movieId non positivo nel percorso con 422', async ({ client }) => {
    const user = await createUser()

    const response = await client.get('/api/reviews/-1').loginAs(user)

    response.assertStatus(422)
  })
})

test.group('Reviews | store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('crea una recensione valida', async ({ client, assert }) => {
    const user = await createUser()

    const response = await client
      .post('/api/reviews')
      .json({ movieId: 42, rating: 5, content: 'Capolavoro' })
      .loginAs(user)

    response.assertStatus(201)
    response.assertBodyContains({ review: { movieId: 42, rating: 5, comment: 'Capolavoro' } })
    assert.deepEqual(response.body().review.user, { id: user.id, fullName: 'Anna Bianchi' })
  })

  test('rifiuta un movieId non positivo con 422', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/api/reviews')
      .json({ movieId: 0, rating: 3, content: 'Ok' })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'movieId' }] })
  })

  test('rifiuta un rating fuori dal range 1-5 con 422', async ({ client }) => {
    const user = await createUser()

    for (const rating of [0, 6, 2.5]) {
      const response = await client
        .post('/api/reviews')
        .json({ movieId: 42, rating, content: 'Ok' })
        .loginAs(user)

      response.assertStatus(422)
      response.assertBodyContains({ errors: [{ field: 'rating' }] })
    }
  })

  test('rifiuta un contenuto oltre 2000 caratteri con 422', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/api/reviews')
      .json({ movieId: 42, rating: 3, content: 'a'.repeat(2001) })
      .loginAs(user)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'content', rule: 'maxLength' }] })
  })
})

test.group('Reviews | una recensione per utente e film', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('il database rifiuta due recensioni dello stesso utente sullo stesso film', async ({
    assert,
  }) => {
    const user = await createUser()
    await Review.create({ userId: user.id, movieId: 7, rating: 3, comment: 'Prima' })

    await assert.rejects(() =>
      Review.create({ userId: user.id, movieId: 7, rating: 5, comment: 'Seconda' })
    )
  })

  test('POST di una seconda recensione sullo stesso film risponde 409', async ({ client }) => {
    const user = await createUser()
    await Review.create({ userId: user.id, movieId: 7, rating: 3, comment: 'Prima' })

    const response = await client
      .post('/api/reviews')
      .json({ movieId: 7, rating: 5, content: 'Seconda' })
      .loginAs(user)

    response.assertStatus(409)
    response.assertBodyContains({ message: 'You have already reviewed this movie' })
  })
})
