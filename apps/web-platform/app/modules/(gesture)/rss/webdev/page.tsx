"use client";

import { useState } from "react";
import { type SlideData, SwiperCarousel } from "@/src/components";
import { useEventSource } from "@/src/hooks";
import type { IParsedRss } from "@/src/interfaces";

export default function RssWebdevPage() {
	const [rssData, setRssData] = useState<IParsedRss[] | null>(null);

	useEventSource({
		valueSetter: setRssData,
		endpoint: "/api/rss/webdev",
	});

	if (!rssData) {
		return;
	}

	const slideData: SlideData[] = rssData.map((rssItem, index) => ({
		id: `${rssItem.link}-${index}`,
		title: rssItem.title,
		description:
			rssItem.content.length > 300
				? `${rssItem.content.substring(0, 300)}...`
				: rssItem.content,
		sourceLabel: "WEBDEV RSS",
		date: new Date(rssItem.date),
		actionButton: {
			text: "Lire l'article",
			href: rssItem.link,
		},
	}));

	return (
		<SwiperCarousel
			data={slideData}
			loading="Loading RSS webdev news..."
			indicator={{
				text: "RSS WEBDEV",
				color: "cyan",
			}}
			sourceLabelColor="text-cyan-400"
			gradientColors="bg-gradient-to-br from-cyan-900 via-blue-900 to-black"
		/>
	);
}
