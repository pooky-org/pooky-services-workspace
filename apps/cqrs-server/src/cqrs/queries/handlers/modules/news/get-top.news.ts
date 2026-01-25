import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RedisService } from "src/cache/redis";
import { GetTopNewsQuery } from "../../../definitions";
import type { INews } from "../../../interfaces";

@QueryHandler(GetTopNewsQuery)
export class GetTopNewsHandler implements IQueryHandler<GetTopNewsQuery> {
	constructor(
		@Inject(RedisService) private readonly redisService: RedisService,
	) {}

	async execute(query: GetTopNewsQuery): Promise<INews[]> {
		const intervalTime =
			Number(process.env.NEWS_FETCH_INTERVAL_IN_MINUTES) || 1;
		const redisKey = "news:latest";
		const ttlSeconds = intervalTime * 60;

		// If force refresh, skip cache and fetch new data
		if (query.forceRefresh) {
			const freshData = await this.fetchNewsFromApi();
			await this.redisService.setWithTTL(redisKey, freshData, ttlSeconds);
			return freshData;
		}

		// Check cache first
		const cached = await this.redisService.get<INews[]>(redisKey);
		if (cached) {
			return cached;
		}

		// Cache miss - fetch new data and cache with TTL
		const freshData = await this.fetchNewsFromApi();
		await this.redisService.setWithTTL(redisKey, freshData, ttlSeconds);
		return freshData;
	}

	private async fetchNewsFromApi(): Promise<INews[]> {
		const url = `${process.env.NEWS_API_URL}?category=world&lang=fr&apikey=${process.env.NEWS_API_KEY}`;
		const response: { totalArticles: number; articles: INews[] } = await fetch(
			url,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((res) => res.json());
		return response.articles;
	}
}
