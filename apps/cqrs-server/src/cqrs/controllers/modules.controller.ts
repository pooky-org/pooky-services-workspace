import {
	Body,
	Controller,
	Get,
	Inject,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiParam,
	ApiQuery,
} from "@nestjs/swagger";
import { CreateModuleCommand } from "../commands/definitions/create-module.command";
import { CreateModuleDto } from "../commands/dto/create-module.dto";
import {
	GetAllModulesQuery,
	GetModuleChildrenQuery,
	GetRootModulesQuery,
} from "../queries/definitions";
import { GetModulePathsQuery } from "../queries/definitions/modules/get-module-paths.query";

@Controller("modules")
export class ModulesController {
	constructor(
		@Inject(QueryBus) private readonly queryBus: QueryBus,
		@Inject(CommandBus) private readonly commandBus: CommandBus,
	) {}

	@Get()
	@ApiQuery({
		name: "all",
		required: false,
		type: Boolean,
		example: true,
		description:
			"When true, returns all modules including disabled ones. Default: false",
	})
	@ApiOkResponse({
		description: "Returns all modules",
	})
	async getModules(@Query("all") all?: string) {
		const includeAll = all === "true";

		return await this.queryBus.execute(new GetAllModulesQuery(includeAll));
	}

	@Get("roots")
	@ApiOkResponse({
		description: "Returns all root modules (modules without a parent)",
	})
	async getRootModules() {
		return await this.queryBus.execute(new GetRootModulesQuery());
	}

	@Get("paths")
	@ApiOkResponse({
		description:
			"Returns all possible module paths from roots to each module node",
		example: [["rss"], ["rss", "tech"]],
	})
	async getModulePaths() {
		return await this.queryBus.execute(new GetModulePathsQuery());
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
					color: "#6366F1",
					icon: "https://cdn.example.com/icons/dashboard.svg",
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
					color: "#0EA5E9",
					icon: "https://cdn.example.com/icons/weather.svg",
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
