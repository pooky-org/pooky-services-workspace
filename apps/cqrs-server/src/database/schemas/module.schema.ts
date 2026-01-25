import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

export type ModuleDocument = mongoose.HydratedDocument<Module>;

@Schema()
export class Module {
	@Prop()
	name: string;

	@Prop()
	slug: string;

	@Prop()
	enabled: boolean;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Module", default: null })
	parent: Module | null;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
