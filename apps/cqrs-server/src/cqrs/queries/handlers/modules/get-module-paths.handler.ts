import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";
import { Module } from "src/database/schemas/module.schema";
import { GetModulePathsQuery } from "../../definitions/modules/get-module-paths.query";

type ModuleRecord = {
	_id: Types.ObjectId;
	slug: string;
	parent: Types.ObjectId | null;
};

@QueryHandler(GetModulePathsQuery)
export class GetModulePathsHandler
	implements IQueryHandler<GetModulePathsQuery>
{
	constructor(@InjectModel(Module.name) private moduleModel: Model<Module>) {}

	async execute(_query: GetModulePathsQuery): Promise<string[][]> {
		const modules = await this.moduleModel
			.find({ enabled: true })
			.select({ _id: 1, slug: 1, parent: 1 })
			.lean<ModuleRecord[]>()
			.exec();

		const childrenByParentId = new Map<string | null, ModuleRecord[]>();

		for (const module of modules) {
			const parentId = module.parent ? String(module.parent) : null;
			const siblings = childrenByParentId.get(parentId) ?? [];
			siblings.push(module);
			childrenByParentId.set(parentId, siblings);
		}

		const paths: string[][] = [];

		const walk = (module: ModuleRecord, path: string[]) => {
			const nextPath = [...path, module.slug];
			paths.push(nextPath);

			const children = childrenByParentId.get(String(module._id)) ?? [];
			for (const child of children) {
				walk(child, nextPath);
			}
		};

		const rootModules = childrenByParentId.get(null) ?? [];
		for (const rootModule of rootModules) {
			walk(rootModule, []);
		}

		return paths;
	}
}
