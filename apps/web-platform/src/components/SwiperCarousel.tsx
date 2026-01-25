"use client";

import Image from "next/image";
// Import Swiper styles
import { useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useGesture } from "../contexts";
import { EGesture } from "../enums";

export interface SlideData {
	id: string;
	title: string;
	description?: string;
	sourceLabel: string;
	date: Date;
	backgroundImage?: string;
	actionButton?: {
		text: string;
		href: string;
	};
}

export interface SwiperCarouselProps {
	data: SlideData[];
	loading?: string;
	indicator?: {
		text: string;
		color: string;
	};
	sourceLabelColor?: string;
	gradientColors?: string;
}

export default function SwiperCarousel({
	data,
	loading = "Loading...",
	indicator = { text: "LIVE", color: "red" },
	sourceLabelColor = "text-red-500",
	gradientColors = "bg-gradient-to-br from-gray-800 to-black",
}: SwiperCarouselProps) {
	const swiperRef = useRef<SwiperType | null>(null);
	const { currentGesture, sendGestureToRoom } = useGesture();

	useEffect(() => {
		const swiperCurrent = swiperRef.current;

		if (!swiperCurrent) {
			return;
		}

		// Handle navigation gestures
		if (currentGesture === EGesture.SwipeLeft) {
			swiperCurrent.slideNext(); // Move to next slide (right slide) when swiping left
		}

		if (currentGesture === EGesture.SwipeRight) {
			swiperCurrent.slidePrev(); // Move to previous slide (left slide) when swiping right
		}

		// Handle tap gesture to navigate to iframe page
		if (currentGesture === EGesture.Tap) {
			const slideData = data[swiperCurrent.realIndex];

			if (slideData.actionButton?.href) {
				sendGestureToRoom(currentGesture, {
					href: slideData.actionButton.href,
				});
			}
		}
	}, [currentGesture, data, sendGestureToRoom]);

	if (!data || data.length === 0) {
		return (
			<div className="h-screen w-screen bg-black flex items-center justify-center text-white">
				<div className="text-2xl">{loading}</div>
			</div>
		);
	}

	return (
		<div className="h-screen w-screen bg-black relative overflow-hidden">
			<Swiper
				modules={[Autoplay]}
				speed={1000}
				// autoplay={{
				// 	delay: 10000,
				// 	disableOnInteraction: false,
				// }}
				loop={true}
				onSwiper={(swiper) => {
					swiperRef.current = swiper;
				}}
				className="h-full w-full"
			>
				{data.map((item, index) => (
					<SwiperSlide key={item.id} className="relative">
						{/* Background Image or Gradient */}
						{item.backgroundImage ? (
							<Image
								src={item.backgroundImage}
								alt=""
								fill
								className="object-cover"
								style={{ zIndex: 1 }}
								priority={index === 0}
							/>
						) : (
							<div className={`absolute inset-0 ${gradientColors}`} />
						)}

						{/* Content */}
						<div className="relative h-full w-full flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 z-[1]">
							<div className="max-w-6xl text-center text-white bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
								{/* Source and Date */}
								<div className="m-6 animate-fadeInUp">
									<span
										className={`font-bold text-xl mr-4 ${sourceLabelColor}`}
									>
										{item.sourceLabel}
									</span>
									<span className="text-gray-300 text-lg">
										{new Date(item.date).toLocaleDateString("en-US", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>

								{/* Main Title */}
								<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fadeInUp animation-delay-300 drop-shadow-lg">
									{item.title}
								</h1>

								{/* Description/Content */}
								{item.description && (
									<p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed animate-fadeInUp animation-delay-600 max-w-4xl mx-auto drop-shadow-md">
										{item.description}
									</p>
								)}

								{/* Action button */}
								{item.actionButton && (
									<div className="animate-fadeInUp animation-delay-900">
										<a
											href={item.actionButton.href}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
										>
											{item.actionButton.text}
										</a>
									</div>
								)}
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			{/* Indicator */}
			<div className="absolute top-4 left-4 flex items-center z-20">
				<div
					className={`w-3 h-3 bg-${indicator.color}-500 rounded-full animate-pulse mr-2`}
				/>
				<span className="text-white font-bold">{indicator.text}</span>
			</div>

			{/* Custom CSS for animations */}
			<style jsx>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fadeInUp {
					animation: fadeInUp 0.8s ease-out forwards;
				}

				.animation-delay-300 {
					animation-delay: 0.3s;
					opacity: 0;
				}

				.animation-delay-600 {
					animation-delay: 0.6s;
					opacity: 0;
				}

				.animation-delay-900 {
					animation-delay: 0.9s;
					opacity: 0;
				}
			`}</style>
		</div>
	);
}
