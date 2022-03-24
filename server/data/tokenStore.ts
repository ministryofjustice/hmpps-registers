import redis from 'redis'
import { promisify } from 'util'

import logger from '../../logger'
import { createRedisClient } from './redisClient'

export default class TokenStore {
  private getRedisAsync: (key: string) => Promise<string>

  private setRedisAsync: (key: string, value: string, mode: string, durationSeconds: number) => Promise<void>

  constructor(redisClient: redis.RedisClient = createRedisClient('index/tokenStore.ts', 'systemToken:')) {
    redisClient.on('error', error => {
      logger.error(error, `Redis error`)
    })

    this.getRedisAsync = promisify(redisClient.get).bind(redisClient)
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    this.setRedisAsync(key, token, 'EX', durationSeconds)
  }

  public async getToken(key: string): Promise<string | null | undefined> {
    return this.getRedisAsync(key)
  }
}
