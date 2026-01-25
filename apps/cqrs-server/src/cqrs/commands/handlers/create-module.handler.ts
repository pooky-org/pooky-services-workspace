import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Module } from "src/database/schemas/module.schema";
import { CreateModuleCommand } from "../definitions/create-module.command";

@CommandHandler(CreateModuleCommand)
export class CreateModuleHandler
	implements ICommandHandler<CreateModuleCommand>
{
	constructor(@InjectModel(Module.name) private moduleModel: Model<Module>) {}

	async execute(command: CreateModuleCommand): Promise<Module> {
		// Find the parent module if parentId is provided
		let parent: Module | null = null;
		if (command.module.parent) {
			parent = await this.moduleModel.findById(command.module.parent).exec();
			if (!parent) {
				throw new Error(
					`Parent module with ID ${command.module.parent} not found`,
				);
			}
		}

		const createdModule = new this.moduleModel({
			...command.module,
			parent: parent || null,
		});

		return createdModule.save();
	}
}
