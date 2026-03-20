"use client";

import { useState } from "react";
import { type SlideData, SwiperCarousel } from "@/src/components";
import { useEventSource } from "@/src/hooks";
import type { IParsedRss } from "@/src/interfaces";

export default function RssFoundersPage() {
	const [rssData, setRssData] = useState<IParsedRss[] | null>(null);

	useEventSource({
		valueSetter: setRssData,
		endpoint: "/api/rss/founders",
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
		sourceLabel: "FOUNDERS RSS",
		date: new Date(rssItem.date),
		actionButton: {
			text: "Lire l'article",
			href: rssItem.link,
		},
	}));

	return (
		<SwiperCarousel
			data={slideData}
			loading="Loading RSS founders news..."
			indicator={{
				text: "RSS FOUNDERS",
				color: "emerald",
			}}
			sourceLabelColor="text-emerald-400"
			gradientColors="bg-gradient-to-br from-emerald-900 via-teal-900 to-black"
		/>
	);
}
