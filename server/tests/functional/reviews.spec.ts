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
})
