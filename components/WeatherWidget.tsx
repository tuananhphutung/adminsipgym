
import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudLightning, MapPin } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // HCM Coordinates: 10.8231, 106.6297
  const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=10.8231&longitude=106.6297&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok";

  useEffect(() => {
    fetch(WEATHER_API)
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Weather fetch error", err);
        setLoading(false);
      });
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (code <= 48) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (code <= 82) return <CloudRain className="w-5 h-5 text-blue-400" />;
    return <CloudLightning className="w-5 h-5 text-purple-400" />;
  };

  const getWeatherText = (code: number) => {
     if (code <= 3) return "Nắng đẹp";
     if (code <= 48) return "Nhiều mây";
     if (code <= 82) return "Mưa rào";
     return "Giông";
  };

  if (loading) return <div className="h-10 bg-gray-100 rounded-full w-full animate-pulse"></div>;
  if (!weather) return null;

  const currentTemp = Math.round(weather.current.temperature_2m);
  const maxTemp = Math.round(weather.daily.temperature_2m_max[0]);
  const code = weather.current.weather_code;

  return (
    <div className="bg-white rounded-full px-4 py-2 flex items-center justify-between shadow-sm border border-gray-100">
       <div className="flex items-center gap-2">
          {getWeatherIcon(code)}
          <span className="font-black text-gray-800 text-sm">{currentTemp}°C</span>
          <span className="text-xs font-medium text-gray-500 hidden sm:inline">{getWeatherText(code)}</span>
       </div>
       
       <div className="flex items-center gap-1 text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase">Nhà Bè</span>
       </div>
    </div>
  );
};

export default WeatherWidget;
