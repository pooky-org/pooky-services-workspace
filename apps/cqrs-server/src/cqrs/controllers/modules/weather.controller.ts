import { Controller, type MessageEvent, Sse } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { from, interval, type Observable, startWith, switchMap } from "rxjs";
import { GetCurrentWeatherQuery } from "../../queries/definitions";

@Controller("weather")
export class WeatherController {
	constructor(private readonly queryBus: QueryBus) {}

	@Sse("current")
	getCurrentWeather(): Observable<MessageEvent> {
		const intervalTime =
			Number(process.env.WEATHER_FETCH_INTERVAL_IN_MINUTES) || 1;

		// The interval will force refresh to ensure fresh data at regular intervals
		return interval(intervalTime * 60 * 1000).pipe(
			startWith(0),
			switchMap((tick) =>
				from(this.queryBus.execute(new GetCurrentWeatherQuery(tick > 0))).pipe(
					switchMap((result) => Promise.resolve({ data: result })),
				),
			),
		);
	}
}
