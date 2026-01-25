import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiParam,
} from "@nestjs/swagger";
import { CreateModuleCommand } from "../commands/definitions/create-module.command";
import { CreateModuleDto } from "../commands/dto/create-module.dto";
import {
	GetAllModulesQuery,
	GetModuleChildrenQuery,
	GetRootModulesQuery,
} from "../queries/definitions";

@Controller("modules")
export class ModulesController {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus,
	) {}

	@Get()
	@ApiOkResponse({
		description: "Returns all modules",
	})
	async getModules() {
		return await this.queryBus.execute(new GetAllModulesQuery());
	}

	@Get("roots")
	@ApiOkResponse({
		description: "Returns all root modules (modules without a parent)",
	})
	async getRootModules() {
		return await this.queryBus.execute(new GetRootModulesQuery());
	}

	@Get(":parentId/children")
	@ApiParam({
		name: "parentId",
		description: "The MongoDB ObjectId of the parent module",
		example: "64f8a7b2c1234567890abcde",
	})
	@ApiOkResponse({
		description: "Returns all child modules of the specified parent",
	})
	async getModuleChildren(@Param("parentId") parentId: string) {
		return await this.queryBus.execute(new GetModuleChildrenQuery(parentId));
	}

	@Post()
	@ApiBody({
		description: "Create a new module with optional parent reference",
		type: CreateModuleDto,
		examples: {
			rootModule: {
				summary: "Root module example",
				description: "A root module without a parent",
				value: {
					name: "Dashboard",
					slug: "dashboard",
					enabled: true,
					parent: null,
				},
			},
			childModule: {
				summary: "Child module example",
				description: "A module with a parent reference",
				value: {
					name: "Weather Widget",
					slug: "weather",
					enabled: true,
					parent: "64f8a7b2c1234567890abcde",
				},
			},
		},
	})
	@ApiCreatedResponse({
		description:
			"Module successfully created with parent relationship established",
		type: CreateModuleDto,
	})
	async createModule(@Body() body: CreateModuleDto) {
		return await this.commandBus.execute(new CreateModuleCommand(body));
	}
}
