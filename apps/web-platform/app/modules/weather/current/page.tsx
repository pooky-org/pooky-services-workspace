"use client";

import type { IWeather } from "@/src/interfaces";
import Image from "next/image";
import { useState } from "react";
import WeatherCard from "./components/WeatherCard";
import { useEventSource } from "@/src/hooks";

export default function WeatherPage() {
  const [weather, setWeather] = useState<IWeather | null>(null);

  useEventSource({
    valueSetter: setWeather,
    endpoint: "/api/weather/current",
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6">
      <div className="w-full max-w-[600px]">
        {weather ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/30">
            {/* Location */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {weather.location.name}
              </h2>
              <p className="text-white/80 text-sm">
                {weather.location.region}, {weather.location.country}
              </p>
            </div>

            {/* Main weather info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Image
                  src={`https:${weather.current.condition.icon}`}
                  alt={weather.current.condition.text}
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
                <div>
                  <div className="text-4xl font-bold text-white">
                    {Math.round(weather.current.temp_c)}°C
                  </div>
                  <div className="text-white/80 text-sm">
                    Ressenti {Math.round(weather.current.feelslike_c)}°C
                  </div>
                </div>
              </div>
            </div>

            {/* Weather condition */}
            <div className="text-center mb-6">
              <p className="text-lg text-white font-medium">
                {weather.current.condition.text}
              </p>
            </div>

            {/* Weather details grid */}
            <div className="grid grid-cols-2 gap-4">
              <WeatherCard
                title="Vent"
                description={`${weather.current.wind_kph} km/h`}
              />

              <WeatherCard
                title="Humidité"
                description={`${weather.current.humidity}%`}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              <span className="text-white font-medium">
                Chargement des données météo...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
