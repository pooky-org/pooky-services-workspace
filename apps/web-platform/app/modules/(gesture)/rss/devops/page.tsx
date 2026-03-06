"use client";

import { useState } from "react";
import { type SlideData, SwiperCarousel } from "@/src/components";
import { useEventSource } from "@/src/hooks";
import type { IParsedRss } from "@/src/interfaces";

export default function RssDevopsPage() {
	const [rssData, setRssData] = useState<IParsedRss[] | null>(null);

	useEventSource({
		valueSetter: setRssData,
		endpoint: "/api/rss/devops",
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
		sourceLabel: "DEVOPS RSS",
		date: new Date(rssItem.date),
		actionButton: {
			text: "Lire l'article",
			href: rssItem.link,
		},
	}));

	return (
		<SwiperCarousel
			data={slideData}
			loading="Loading RSS devops news..."
			indicator={{
				text: "RSS DEVOPS",
				color: "sky",
			}}
			sourceLabelColor="text-sky-400"
			gradientColors="bg-gradient-to-br from-sky-900 via-indigo-900 to-black"
		/>
	);
}
