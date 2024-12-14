import { Module } from '@nestjs/common';
import { RedisModule as CacheManager } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheManager.forRoot({
      type: 'single',
      url: `redis://localhost:6379`,
      options: {
        keyPrefix: 'shopping',
      },
    }),
  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
