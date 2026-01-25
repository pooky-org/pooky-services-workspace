export interface INews {
	id: string;
	title: string;
	description: string;
	content: string;
	url: string;
	image: string;
	publishedAt: string;
	source: {
		id: string;
		name: string;
		url: string;
	};
}
