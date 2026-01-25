import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import * as Parser from "rss-parser";
import type { IParsedRss } from "src/cqrs/queries/interfaces";

@Injectable()
export class TldrRssParserService {
	private readonly parser: Parser;

	constructor() {
		this.parser = new Parser();
	}

	async getNewestItems(url: string): Promise<IParsedRss[]> {
		const source = await this.getNewestSource(url);

		if (!source?.link) {
			return [];
		}

		const date = new Date(source.isoDate || "");
		const parsedArticles: IParsedRss[] = [];

		const sourceHtml = await fetch(source.link).then((res) => res.text());
		const $ = cheerio.load(sourceHtml);
		const articles = $("article");

		articles.each((_, element) => {
			const link = $(element).find("a");
			const title = link.text() || "";
			const href = link.attr("href") || "";
			const content = $(element).find("div").text();
			parsedArticles.push({ title, link: href, content, date });
		});

		return parsedArticles;
	}

	private async getNewestSource(url: string): Promise<Parser.Item | null> {
		const feed = await this.parse(url);
		return feed.items.find(Boolean) || null;
	}

	private async parse(url: string): Promise<Parser.Output<Parser.Item>> {
		return this.parser.parseURL(url);
	}
}
