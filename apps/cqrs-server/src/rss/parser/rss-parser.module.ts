import { Module } from "@nestjs/common";
import { TldrRssParserService } from "./tldr/tldr-rss-parser.service";

@Module({ providers: [TldrRssParserService], exports: [TldrRssParserService] })
export class RssParserModule {}
