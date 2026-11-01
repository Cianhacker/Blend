import React from 'react';
import { TreePine, Flame, Utensils, BookOpen, ShieldAlert, Ghost, Bell, ArrowRight } from 'lucide-react';
import { DynamicSchoolEvent } from '../types/game';

interface EventBannerProps {
  event: DynamicSchoolEvent | null;
  onGoToFloor: (floor: number) => void;
  onDismiss: () => void;
}

export const EventBanner: React.FC<EventBannerProps> = ({ event, onGoToFloor, onDismiss }) => {
  if (!event) return null;

  const getEventIcon = () => {
    switch (event.type) {
      case 'christmas_party':
        return <TreePine className="w-5 h-5 text-emerald-400" />;
      case 'food_fight':
        return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'pop_quiz':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'fire_drill':
        return <Flame className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'bully_ambush':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'ghost_hour':
        return <Ghost className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getBorderColor = () => {
    if (event.type === 'christmas_party') return 'border-red-500/60 shadow-red-500/20';
    if (event.type === 'food_fight') return 'border-orange-500/60 shadow-orange-500/20';
    if (event.type === 'fire_drill') return 'border-amber-500/60 shadow-amber-500/20';
    return 'border-sky-500/60 shadow-sky-500/20';
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 select-none max-w-xl w-[92vw]">
      <div
        className={`bg-slate-900/90 backdrop-blur-md border ${getBorderColor()} text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
            {getEventIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-amber-300 uppercase tracking-wide">
                {event.title}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-sky-400 px-2 py-0.5 rounded-md border border-slate-700">
                Floor {event.floor}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{event.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onGoToFloor(event.floor)}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <span>GO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white px-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
