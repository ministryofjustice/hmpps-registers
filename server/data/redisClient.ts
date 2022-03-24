import redis, { createClient } from 'redis'

import config from '../config'
import logger from '../../logger'

export type RedisClient = ReturnType<typeof createClient>

export const createRedisClient = (clientName: string, prefix: string | undefined): RedisClient => {
  const client = redis.createClient({
    port: config.redis.port,
    password: config.redis.password,
    host: config.redis.host,
    tls: config.redis.tls_enabled === 'true' ? {} : false,
    prefix: prefix || '',
  })

  client.on('error', error => {
    logger.error(`[${clientName}] Redis error`, error)
  })

  return client
}
