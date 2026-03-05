import { Query } from "@nestjs/cqrs";

export class GetModulePathsQuery extends Query<string[][]> {
	constructor() {
		super();
	}
}
