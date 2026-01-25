import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Module } from "src/database/schemas/module.schema";
import { GetRootModulesQuery } from "../../definitions/modules/get-root-modules.query";

@QueryHandler(GetRootModulesQuery)
export class GetRootModulesHandler
	implements IQueryHandler<GetRootModulesQuery>
{
	constructor(@InjectModel(Module.name) private moduleModel: Model<Module>) {}

	async execute(_query: GetRootModulesQuery): Promise<Module[]> {
		return this.moduleModel.find({ parent: null }).exec();
	}
}
