import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RedisService } from "src/cache/redis";
import { GetRssMarketingQuery } from "src/cqrs/queries/definitions/modules/rss/marketing/get-rss-marketing.query";
import { TldrRssParserService } from "../../../../../../rss/parser/tldr/tldr-rss-parser.service";
import type { IParsedRss } from "../../../../interfaces";

@QueryHandler(GetRssMarketingQuery)
export class GetRssMarketingHandler
	implements IQueryHandler<GetRssMarketingQuery>
{
	constructor(
		private readonly rssParserService: TldrRssParserService,
		private readonly redisService: RedisService,
	) {}

	async execute(query: GetRssMarketingQuery): Promise<IParsedRss[]> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;
		const redisKey = `rss:marketing:${query.path || "marketing"}`;
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
		const rssPath = path || "marketing";
		const url = new URL(`rss/${rssPath}`, process.env.TLDR_API_URL);
		return await this.rssParserService.getNewestItems(url.toString());
	}
}
