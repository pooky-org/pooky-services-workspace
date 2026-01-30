import { registerAs } from "@nestjs/config";

export const KURRENT_CONFIG_TOKEN = "KurrentConfig";

export interface KurrentConfig {
	baseUrl?: string;
}

export const kurrentConfig = registerAs(
	KURRENT_CONFIG_TOKEN,
	(): KurrentConfig => {
		return {
			baseUrl: process.env["KURRENT_BASE_URL"],
		};
	},
);
