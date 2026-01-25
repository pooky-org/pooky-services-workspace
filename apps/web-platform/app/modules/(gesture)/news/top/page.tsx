"use client";

import SwiperCarousel, {
	type SlideData,
} from "@/src/components/SwiperCarousel";
import { useEventSource } from "@/src/hooks";
import type { INews } from "@/src/interfaces";
import { useMemo, useState } from "react";

export default function NewsPage() {
	const [news, setNews] = useState<INews[] | null>(null);

	useEventSource({
		valueSetter: setNews,
		endpoint: "/api/news/top",
	});

	const slideData: SlideData[] = useMemo(() => {
		if (!news) return [];

		return news.map((newsItem) => ({
			id: newsItem.id,
			title: newsItem.title,
			description: newsItem.description || undefined,
			sourceLabel: newsItem.source.name,
			date: new Date(newsItem.publishedAt),
			backgroundImage: newsItem.image || undefined,
		}));
	}, [news]);

	return (
		<SwiperCarousel
			data={slideData}
			loading="Loading news..."
			indicator={{
				text: "LIVE",
				color: "red",
			}}
			sourceLabelColor="text-red-500"
			gradientColors="bg-gradient-to-br from-gray-800 to-black"
		/>
	);
}
