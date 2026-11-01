import React, { useState } from 'react';
import { CheckSquare, ChevronDown, ChevronUp, Trophy, MapPin, Gift } from 'lucide-react';
import { Quest } from '../types/game';

interface QuestTrackerProps {
  quests: Quest[];
  onClaimReward: (questId: string) => void;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ quests, onClaimReward }) => {
  const [collapsed, setCollapsed] = useState(false);

  const activeQuests = quests.filter((q) => !q.isCompleted);
  const completedUnclaimed = quests.filter((q) => q.isCompleted);

  return (
    <div className="absolute top-16 left-4 z-20 w-72 max-w-[85vw] select-none pointer-events-auto">
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden transition-all">
        {/* Header */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-750"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white tracking-wider">
              ACTIVE OBJECTIVES ({activeQuests.length})
            </span>
          </div>
          <button className="text-slate-400 hover:text-white">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Quest List */}
        {!collapsed && (
          <div className="p-3 space-y-2.5 max-h-60 overflow-y-auto">
            {quests.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-2">
                No active quests. Talk to teachers or students across all 12 floors to take on tasks!
              </p>
            )}

            {quests.map((q) => {
              const progressPct = Math.min(100, (q.currentCount / q.targetCount) * 100);
              return (
                <div
                  key={q.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    q.isCompleted
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="truncate pr-2">{q.title}</span>
                    <span className="text-[10px] font-mono text-sky-400 flex items-center gap-0.5 shrink-0">
                      <MapPin className="w-3 h-3" /> F{q.floor}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-1.5 leading-tight">{q.description}</p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full transition-all duration-300 ${
                        q.isCompleted ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {q.currentCount} / {q.targetCount} Completed
                    </span>

                    {q.isCompleted ? (
                      <button
                        onClick={() => onClaimReward(q.id)}
                        className="px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center gap-1 shadow-sm"
                      >
                        <Gift className="w-2.5 h-2.5" /> CLAIM
                      </button>
                    ) : (
                      <span className="text-amber-300 font-bold">
                        +{q.reward.xp} XP • ${q.reward.cash}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
