import { Controller, Sse } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { from, interval, type Observable, startWith, switchMap } from "rxjs";
import { GetRssDevopsQuery } from "src/cqrs/queries/definitions/modules/rss/devops/get-rss-devops.query";
import { GetRssFoundersQuery } from "src/cqrs/queries/definitions/modules/rss/founders/get-rss-founders.query";
import { GetRssInfosecQuery } from "src/cqrs/queries/definitions/modules/rss/infosec/get-rss-infosec.query";
import { GetRssMarketingQuery } from "src/cqrs/queries/definitions/modules/rss/marketing/get-rss-marketing.query";
import { GetRssProductQuery } from "src/cqrs/queries/definitions/modules/rss/product/get-rss-product.query";
import { GetRssTechQuery } from "src/cqrs/queries/definitions/modules/rss/tech/get-rss-tech.query";
import { GetRssWebdevQuery } from "src/cqrs/queries/definitions/modules/rss/webdev/get-rss-webdev.query";

@Controller("rss")
export class RssController {
	constructor(private readonly queryBus: QueryBus) {}

	@Sse("tech")
	getTechRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(this.queryBus.execute(new GetRssTechQuery("tech", tick > 0))).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}

	@Sse("webdev")
	getWebdevRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(new GetRssWebdevQuery("webdev", tick > 0)),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}

	@Sse("infosec")
	getInfosecRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(new GetRssInfosecQuery("infosec", tick > 0)),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}

	@Sse("marketing")
	getMarketingRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(
						new GetRssMarketingQuery("marketing", tick > 0),
					),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}

	@Sse("product")
	getProductRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(new GetRssProductQuery("product", tick > 0)),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}

	@Sse("founders")
	getFoundersRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(new GetRssFoundersQuery("founders", tick > 0)),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}

	@Sse("devops")
	getDevopsRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(new GetRssDevopsQuery("devops", tick > 0)),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}
}
