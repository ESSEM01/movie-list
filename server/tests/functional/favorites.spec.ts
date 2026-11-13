import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Favorite from '#models/favorite'

const createUser = () => User.create({ email: 'fan@example.com', password: 'password-sicura' })

const movie = { id: 550, title: 'Fight Club', release_date: '1999-10-15', poster_path: '/a.jpg' }

test.group('Favorites | store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('aggiunge un film ai preferiti', async ({ client }) => {
    const user = await createUser()

    const response = await client.post('/api/favorites').json(movie).loginAs(user)

    response.assertStatus(201)
    response.assertBodyContains({ favorite: { id: 550, title: 'Fight Club' } })
  })

  test('in caso di errore non restituisce i dettagli interni al client', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    const originalCreate = Favorite.create
    Favorite.create = (async () => {
      throw new Error("ER_NO_SUCH_TABLE: Table 'movie-list.favorites' doesn't exist")
    }) as typeof Favorite.create

    try {
      const response = await client.post('/api/favorites').json(movie).loginAs(user)

      response.assertStatus(400)
      assert.deepEqual(response.body(), { message: 'Unable to add favorite' })
    } finally {
      Favorite.create = originalCreate
    }
  })
})
