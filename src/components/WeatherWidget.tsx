import React, { useState } from 'react';
import { Sun, CloudRain, Snowflake, Clock, Moon, Sunrise, ChevronDown } from 'lucide-react';
import { WeatherType, WeatherState, GameMode, GAME_MODES } from '../types/game';

interface WeatherWidgetProps {
  weatherState: WeatherState;
  gameMode: GameMode;
  formattedTime: string;
  periodName: string;
  onSetWeather: (weather: WeatherType, isAuto: boolean) => void;
  onOpenSchedule: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weatherState,
  gameMode,
  formattedTime,
  periodName,
  onSetWeather,
  onOpenSchedule,
}) => {
  const [controlsOpen, setControlsOpen] = useState(false);

  const modeDef = GAME_MODES.find((m) => m.id === gameMode) || GAME_MODES[0];

  const getWeatherIcon = (type: WeatherType) => {
    switch (type) {
      case 'clear_sunny':
        return <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-sky-400 animate-bounce" />;
      case 'snow':
        return <Snowflake className="w-4 h-4 text-cyan-200" />;
    }
  };

  const getModeIcon = (mode: GameMode) => {
    switch (mode) {
      case 'night_school':
        return <Moon className="w-3.5 h-3.5 text-indigo-300" />;
      case 'day_to_night':
        return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  return (
    <div className="relative pointer-events-auto">
      {/* Weather & Time Pill */}
      <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-900/85 border border-slate-700/80 shadow-xl backdrop-blur-md text-white text-xs">
        {/* Clock & Period Button */}
        <button
          onClick={onOpenSchedule}
          className="flex items-center gap-1.5 hover:text-sky-300 transition-colors pr-2 border-r border-slate-700"
          title="Open Bell School Timetable & Class Schedule"
        >
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono font-bold text-[11px] text-white tracking-wide">
            {formattedTime}
          </span>
        </button>

        {/* Current Weather Info */}
        <div className="flex items-center gap-1.5">
          {getWeatherIcon(weatherState.type)}
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[11px] text-slate-100 flex items-center gap-1">
              {weatherState.name}
              {weatherState.isAuto && (
                <span className="text-[8px] font-mono font-normal text-slate-400 uppercase">
                  (Auto)
                </span>
              )}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {weatherState.temperature}
            </span>
          </div>
        </div>

        {/* Mode Tag */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[9px] font-bold text-slate-300">
          {getModeIcon(gameMode)}
          <span>{modeDef.name}</span>
        </div>

        {/* Quick Weather Overrides Toggle */}
        <button
          onClick={() => setControlsOpen(!controlsOpen)}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
            controlsOpen ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
          title="Quick Weather Controls & Presets"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${controlsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Quick Weather Presets Dropdown */}
      {controlsOpen && (
        <div className="absolute right-0 top-12 z-30 p-3 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md w-56 space-y-2 animate-in fade-in slide-in-from-top-2 text-white">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-mono font-black uppercase text-sky-400">
              WEATHER EFFECT
            </span>
            <span className="text-[9px] font-mono text-slate-400">Floor 1 Playground</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                onSetWeather('clear_sunny', false);
                setControlsOpen(false);
              }}
              className={`p-2 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${
                weatherState.type === 'clear_sunny' && !weatherState.isAuto
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400 mb-0.5" />
              <span>Sunny</span>
            </button>

            <button
              onClick={() => {
                onSetWeather('rain', false);
                setControlsOpen(false);
              }}
              className={`p-2 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${
                weatherState.type === 'rain' && !weatherState.isAuto
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 ring-1 ring-sky-400'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              <CloudRain className="w-4 h-4 text-sky-400 mb-0.5" />
              <span>Rain</span>
            </button>

            <button
              onClick={() => {
                onSetWeather('snow', false);
                setControlsOpen(false);
              }}
              className={`p-2 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border transition-all ${
                weatherState.type === 'snow' && !weatherState.isAuto
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 ring-1 ring-cyan-300'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              <Snowflake className="w-4 h-4 text-cyan-200 mb-0.5" />
              <span>Snow</span>
            </button>
          </div>

          <button
            onClick={() => {
              onSetWeather(weatherState.type, true);
              setControlsOpen(false);
            }}
            className={`w-full py-1.5 rounded-xl text-[10px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
              weatherState.isAuto
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border-slate-700'
            }`}
          >
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Auto Sync (Time of Day)</span>
          </button>
        </div>
      )}
    </div>
  );
};
