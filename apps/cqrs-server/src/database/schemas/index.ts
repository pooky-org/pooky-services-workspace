import type { ModelDefinition } from "@nestjs/mongoose";
import { Module, ModuleSchema } from "./module.schema";

export const allSchemas = [
	{
		name: Module.name,
		schema: ModuleSchema,
	},
] satisfies ModelDefinition[];
