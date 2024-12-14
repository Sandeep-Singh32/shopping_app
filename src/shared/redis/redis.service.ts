// src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async set(key: string, value: any, expire?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (expire) {
      await this.redisClient.set(key, stringValue, 'EX', expire);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T> {
    const value = await this.redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async getAll<T>(): Promise<T[]> {
    const keys = await this.redisClient.keys('*');
    const values = await this.redisClient.mget(keys);
    return values.map((value) => JSON.parse(value)) as T[];
  }
}
