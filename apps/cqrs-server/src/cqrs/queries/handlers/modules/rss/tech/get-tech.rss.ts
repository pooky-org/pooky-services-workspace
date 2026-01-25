import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RedisService } from "src/cache/redis";
import { GetRssTechQuery } from "src/cqrs/queries/definitions/modules/rss/tech/get-rss-tech.query";
import { TldrRssParserService } from "../../../../../../rss/parser/tldr/tldr-rss-parser.service";
import type { IParsedRss } from "../../../../interfaces";

@QueryHandler(GetRssTechQuery)
export class GetRssTechHandler implements IQueryHandler<GetRssTechQuery> {
	constructor(
		private readonly rssParserService: TldrRssParserService,
		private readonly redisService: RedisService,
	) {}

	async execute(query: GetRssTechQuery): Promise<IParsedRss[]> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;
		const redisKey = `rss:tech:${query.path || "webdev"}`;
		const ttlSeconds = intervalTime * 60;

		// If force refresh, skip cache and fetch new data
		if (query.forceRefresh) {
			const freshData = await this.fetchRssFromApi(query.path);
			await this.redisService.setWithTTL(redisKey, freshData, ttlSeconds);
			return freshData;
		}

		// Check cache first
		const cached = await this.redisService.get<IParsedRss[]>(redisKey);
		if (cached) {
			return cached;
		}

		// Cache miss - fetch new data and cache with TTL
		const freshData = await this.fetchRssFromApi(query.path);
		await this.redisService.setWithTTL(redisKey, freshData, ttlSeconds);
		return freshData;
	}

	private async fetchRssFromApi(path?: string): Promise<IParsedRss[]> {
		const rssPath = path || "webdev";
		const url = new URL(`rss/${rssPath}`, process.env.TLDR_API_URL);
		return await this.rssParserService.getNewestItems(url.toString());
	}
}
