import { Command } from "@nestjs/cqrs";
import type { Module } from "src/database/schemas/module.schema";
import type { CreateModuleDto } from "../dto/create-module.dto";

export class CreateModuleCommand extends Command<Module> {
	constructor(public readonly module: CreateModuleDto) {
		super();
	}
}
