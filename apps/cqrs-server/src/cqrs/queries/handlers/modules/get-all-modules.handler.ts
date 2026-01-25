import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Module } from "src/database/schemas/module.schema";
import { GetAllModulesQuery } from "../../definitions";

@QueryHandler(GetAllModulesQuery)
export class GetAllModulesHandler implements IQueryHandler<GetAllModulesQuery> {
	constructor(@InjectModel(Module.name) private moduleModel: Model<Module>) {}

	async execute(_: GetAllModulesQuery): Promise<Module[]> {
		return this.moduleModel.find();
	}
}
