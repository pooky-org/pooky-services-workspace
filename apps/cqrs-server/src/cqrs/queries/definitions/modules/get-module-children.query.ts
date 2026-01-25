import { Query } from "@nestjs/cqrs";
import type { Module } from "src/database/schemas/module.schema";

export class GetModuleChildrenQuery extends Query<Module[]> {
	constructor(public readonly parentId: string) {
		super();
	}
}
