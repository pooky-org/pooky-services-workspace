import { GetModuleChildrenHandler } from "./get-module-children.handler";
import { GetRootModulesHandler } from "./get-root-modules.handler";
import { GetTopNewsHandler } from "./news";
import { GetRssTechHandler } from "./rss";
import { GetCurrentWeatherHandler } from "./weather";

export * from "./get-all-modules.handler";
export * from "./get-module-children.handler";
export * from "./get-root-modules.handler";

export const allModulesHandlers = [
	GetCurrentWeatherHandler,
	GetTopNewsHandler,
	GetRssTechHandler,
	GetModuleChildrenHandler,
	GetRootModulesHandler,
];
