import { Query } from "@nestjs/cqrs";
import type { Module } from "src/database/schemas/module.schema";

export class GetAllModulesQuery extends Query<Module[]> {
	constructor(public readonly includeAll = false) {
		super();
	}
}
