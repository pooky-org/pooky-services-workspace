import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
	private readonly redis: Redis;

	constructor() {
		this.redis = new Redis({
			host: process.env.REDIS_HOST,
			port: parseInt(process.env.REDIS_PORT || "6379", 10),
			password: process.env.REDIS_PASSWORD || undefined,
		});
	}

	async set(key: string, value: object): Promise<void> {
		await this.redis.set(key, JSON.stringify(value));
	}

	async setWithTTL(
		key: string,
		value: object,
		ttlSeconds: number,
	): Promise<void> {
		await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
	}

	async get<T = object>(key: string): Promise<T | null> {
		const value = await this.redis.get(key);
		return value ? JSON.parse(value) : null;
	}

	async onModuleDestroy() {
		await this.redis.quit();
	}
}
