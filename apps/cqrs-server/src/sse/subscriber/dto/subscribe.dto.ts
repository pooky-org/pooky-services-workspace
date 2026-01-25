import { IsUUID } from "class-validator";

export class SubscribeDto {
	@IsUUID()
	clientId: string;
}
