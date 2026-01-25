import { Controller, Sse } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { from, interval, type Observable, startWith, switchMap } from "rxjs";
import { GetRssTechQuery } from "src/cqrs/queries/definitions/modules/rss/tech/get-rss-tech.query";

@Controller("rss")
export class RssController {
	constructor(private readonly queryBus: QueryBus) {}

	@Sse("tech")
	getTechRss(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.RSS_FETCH_INTERVAL_IN_MINUTES) || 60;

		// The interval will force refresh to ensure fresh data at regular intervals
		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(
					this.queryBus.execute(new GetRssTechQuery("webdev", tick > 0)),
				).pipe(
					switchMap((result) =>
						Promise.resolve({ data: result } as MessageEvent),
					),
				),
			),
		);
	}
}
