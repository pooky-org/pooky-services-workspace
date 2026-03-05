export interface Module {
	_id: string;
	name: string;
	slug: string;
	color: string;
	icon: string;
	enabled: boolean;
	parent: string | null;
}
