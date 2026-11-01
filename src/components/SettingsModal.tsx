import React from 'react';
import {
  X,
  Sliders,
  TreePine,
  Sparkles,
  AlertTriangle,
  Utensils,
  BookOpen,
  Volume2,
  Tv,
  Flame,
  ShieldAlert,
  Ghost,
} from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const update = (key: keyof GameSettings, val: any) => {
    onUpdateSettings({ ...settings, [key]: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-black tracking-wide">DYNAMIC EVENTS & GAME SETTINGS</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Dynamic Event Frequencies */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Dynamic School Events Chances
            </h4>

            <div className="space-y-4">
              {/* Christmas Event Chance */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-red-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-red-300">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    Christmas Holiday Event
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.christmasEventRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.christmasEventRate}
                  onChange={(e) => update('christmasEventRate', Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Decorated Christmas tree, Santa hats on NPCs, snow particles & opening presents!
                </p>
              </div>

              {/* Cafeteria Food Fight */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-orange-300">
                    <Utensils className="w-4 h-4 text-orange-400" />
                    Cafeteria Food Fight Chance
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.foodFightRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.foodFightRate}
                  onChange={(e) => update('foodFightRate', Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Flying food, pudding splats, chaos in Floor 2 Cafeteria.
                </p>
              </div>

              {/* Pop Quiz Rate */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-blue-300">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    Surprise Pop Quiz Frequency
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.popQuizRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.popQuizRate}
                  onChange={(e) => update('popQuizRate', Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Surprise blackboard quizzes and trivia challenges.
                </p>
              </div>

              {/* Bully Ambush Rate */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Bully Ambush & Shakedowns
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.bullyAmbushRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.bullyAmbushRate}
                  onChange={(e) => update('bullyAmbushRate', Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Bully Spike confronting students in hallways for lunch money.
                </p>
              </div>

              {/* Fire Drill / Emergency Alarm */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-amber-300">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Fire Drill / Alarm Frequency
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.fireDrillRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.fireDrillRate}
                  onChange={(e) => update('fireDrillRate', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Alarm sirens, flashing red emergency lights, outdoor playground evacuation!
                </p>
              </div>

              {/* Spooky Ghost / Mystery Hour */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-purple-300">
                    <Ghost className="w-4 h-4 text-purple-400" />
                    Urban Legend / Spooky Mystery Hour
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.spookyGhostRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.spookyGhostRate}
                  onChange={(e) => update('spookyGhostRate', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Flickering lights and urban legends on Floor 12 Detention & Library.
                </p>
              </div>

              {/* Hall Monitor Strictness */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-2 text-cyan-300">
                    <AlertTriangle className="w-4 h-4 text-cyan-400" />
                    Hall Monitor Pass Checks
                  </span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    {settings.hallMonitorStrictness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.hallMonitorStrictness}
                  onChange={(e) => update('hallMonitorStrictness', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Audio & Graphics Quality */}
          <div className="pt-4 border-t border-slate-700 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Tv className="w-4 h-4" /> Audio & Performance
            </h4>

            {/* Sound Volume */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm flex items-center gap-2 text-slate-200">
                  <Volume2 className="w-4 h-4 text-sky-400" /> Sound Effects Volume
                </span>
                <span className="text-sm font-mono font-black text-amber-300">
                  {settings.soundVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.soundVolume}
                onChange={(e) => update('soundVolume', Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Graphics Preset */}
            <div>
              <span className="font-bold text-sm text-slate-200 block mb-2">Graphics Quality</span>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => update('graphicsQuality', q)}
                    className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      settings.graphicsQuality === q
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm tracking-wide shadow-lg shadow-sky-600/30"
          >
            APPLY SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
