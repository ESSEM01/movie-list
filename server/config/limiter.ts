import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE', 'memory'),
  stores: {
    /**
     * In-process store: counters are lost on restart and are not shared
     * between multiple server instances. Switch to a redis store when
     * running more than one process.
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
