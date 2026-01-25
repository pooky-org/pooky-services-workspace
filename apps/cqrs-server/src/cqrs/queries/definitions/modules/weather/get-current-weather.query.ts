import { Query } from "@nestjs/cqrs";
import type { ICurrentWeather } from "../../../interfaces";

export class GetCurrentWeatherQuery extends Query<ICurrentWeather> {
	constructor(public readonly forceRefresh = false) {
		super();
	}
}
