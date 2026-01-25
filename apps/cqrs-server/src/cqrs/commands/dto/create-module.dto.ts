import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsMongoId,
	IsOptional,
	IsString,
	MaxLength,
} from "class-validator";

export class CreateModuleDto {
	@ApiProperty({
		description: "The name of the module",
		example: "News Module",
		maxLength: 32,
	})
	@IsString()
	@MaxLength(32)
	name: string;

	@ApiProperty({
		description: "URL-friendly identifier for the module",
		example: "news",
		maxLength: 32,
	})
	@IsString()
	@MaxLength(32)
	slug: string;

	@ApiProperty({
		description: "Whether the module is enabled or not",
		example: true,
		required: false,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	enabled: boolean;

	@ApiProperty({
		description: "Parent module ObjectId (null for root modules)",
		example: "64f8a7b2c1234567890abcde",
		required: false,
		default: null,
	})
	@IsOptional()
	@IsMongoId()
	parent: string | null;
}
