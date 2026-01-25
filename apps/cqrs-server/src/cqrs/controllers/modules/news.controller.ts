import { Controller, type MessageEvent, Sse } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { from, interval, type Observable, startWith, switchMap } from "rxjs";
import { GetTopNewsQuery } from "../../queries/definitions";

@Controller("news")
export class NewsController {
	constructor(private readonly queryBus: QueryBus) {}

	@Sse("top")
	getTopNews(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.NEWS_FETCH_INTERVAL_IN_MINUTES) || 1;

		// The interval will force refresh to ensure fresh data at regular intervals
		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(this.queryBus.execute(new GetTopNewsQuery(tick > 0))).pipe(
					switchMap((result) => Promise.resolve({ data: result })),
				),
			),
		);
	}
}
