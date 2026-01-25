import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Module } from "src/database/schemas/module.schema";
import { GetModuleChildrenQuery } from "../../definitions/modules/get-module-children.query";

@QueryHandler(GetModuleChildrenQuery)
export class GetModuleChildrenHandler
	implements IQueryHandler<GetModuleChildrenQuery>
{
	constructor(@InjectModel(Module.name) private moduleModel: Model<Module>) {}

	async execute(query: GetModuleChildrenQuery): Promise<Module[]> {
		return this.moduleModel
			.find({ parent: query.parentId })
			.populate("parent")
			.exec();
	}
}
