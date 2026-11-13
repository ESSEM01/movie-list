import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'

type TrustProxy = (address: string, distance: number) => boolean

test.group('Config | trustProxy', () => {
  test('si fida del proxy di Render, che arriva da un IP privato', ({ assert }) => {
    const trustProxy = app.config.get<TrustProxy>('app.http.trustProxy')

    assert.isTrue(trustProxy('10.0.0.5', 0))
  })
})
