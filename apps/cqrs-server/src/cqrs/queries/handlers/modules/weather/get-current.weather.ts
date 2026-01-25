import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RedisService } from "src/cache/redis";
import { GetCurrentWeatherQuery } from "../../../definitions";
import type { ICurrentWeather } from "../../../interfaces";

@QueryHandler(GetCurrentWeatherQuery)
export class GetCurrentWeatherHandler
	implements IQueryHandler<GetCurrentWeatherQuery>
{
	constructor(
		@Inject(RedisService) private readonly redisService: RedisService,
	) {}

	async execute(query: GetCurrentWeatherQuery): Promise<ICurrentWeather> {
		const intervalTime =
			Number(process.env.WEATHER_FETCH_INTERVAL_IN_MINUTES) || 1;
		const redisKey = "weather:latest";
		const ttlSeconds = intervalTime * 60;

		// If force refresh, skip cache and fetch new data
		if (query.forceRefresh) {
			const freshData = await this.fetchWeatherFromApi();
			await this.redisService.setWithTTL(redisKey, freshData, ttlSeconds);
			return freshData;
		}

		// Check cache first
		const cached = await this.redisService.get<ICurrentWeather>(redisKey);
		if (cached) {
			return cached;
		}

		// Cache miss - fetch new data and cache with TTL
		const freshData = await this.fetchWeatherFromApi();
		await this.redisService.setWithTTL(redisKey, freshData, ttlSeconds);
		return freshData;
	}

	private async fetchWeatherFromApi(): Promise<ICurrentWeather> {
		const url = `${process.env.WEATHER_API_URL}?q=Paris&lang=fr&key=${process.env.WEATHER_API_KEY}`;
		const response: ICurrentWeather = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((res) => res.json());
		return response;
	}
}
