import { Query } from "@nestjs/cqrs";
import type { INews } from "../.././../interfaces";

export class GetTopNewsQuery extends Query<INews[]> {
	constructor(public readonly forceRefresh = false) {
		super();
	}
}
