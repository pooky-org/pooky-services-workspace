import { Query } from "@nestjs/cqrs";
import type { IParsedRss } from "../../../../interfaces";

export class GetRssWebdevQuery extends Query<IParsedRss[]> {
	constructor(
		public readonly path = "",
		public readonly forceRefresh = false,
	) {
		super();
	}
}
