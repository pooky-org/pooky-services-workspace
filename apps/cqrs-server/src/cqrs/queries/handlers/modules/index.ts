import { GetModuleChildrenHandler } from "./get-module-children.handler";
import { GetModulePathsHandler } from "./get-module-paths.handler";
import { GetRootModulesHandler } from "./get-root-modules.handler";
import { GetTopNewsHandler } from "./news";
import {
	GetRssDevopsHandler,
	GetRssFoundersHandler,
	GetRssInfosecHandler,
	GetRssMarketingHandler,
	GetRssProductHandler,
	GetRssTechHandler,
	GetRssWebdevHandler,
} from "./rss";
import { GetCurrentWeatherHandler } from "./weather";

export * from "./get-all-modules.handler";
export * from "./get-module-children.handler";
export * from "./get-module-paths.handler";
export * from "./get-root-modules.handler";

export const allModulesHandlers = [
	GetCurrentWeatherHandler,
	GetTopNewsHandler,
	GetRssTechHandler,
	GetRssWebdevHandler,
	GetRssInfosecHandler,
	GetRssMarketingHandler,
	GetRssProductHandler,
	GetRssFoundersHandler,
	GetRssDevopsHandler,
	GetModuleChildrenHandler,
	GetModulePathsHandler,
	GetRootModulesHandler,
];
