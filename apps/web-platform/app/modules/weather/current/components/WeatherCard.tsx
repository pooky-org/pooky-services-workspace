interface WeatherCardProps {
	title: string;
	description: string;
}

export default function WeatherCard({ title, description }: WeatherCardProps) {
	return (
		<div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
			<div className="text-white/80 text-sm mb-1">{title}</div>
			<div className="text-white text-lg font-semibold">{description}</div>
		</div>
	);
}
