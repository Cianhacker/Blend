import React from 'react';
import { Award, Bus, CheckCircle2, Star, Sparkles, X, RotateCcw } from 'lucide-react';
import { CharacterProfile, Quest } from '../types/game';

interface DismissalReportModalProps {
  profile: CharacterProfile;
  quests: Quest[];
  cash: number;
  hp: number;
  onNextDay: () => void;
  onContinueFreeRoam: () => void;
}

export const DismissalReportModal: React.FC<DismissalReportModalProps> = ({
  profile,
  quests,
  cash,
  hp,
  onNextDay,
  onContinueFreeRoam,
}) => {
  const completedQuests = quests.filter((q) => q.isCompleted).length;
  const gradeLabel = profile.gradeName || 'Standard Enrollee';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-2xl shadow-xl">
              <Bus className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">BELL SCHOOL DISMISSAL</h2>
              <p className="text-xs font-bold text-slate-900 opacity-90">
                03:30 PM Final Bell • Daily Attendance & Report
              </p>
            </div>
          </div>
        </div>

        {/* Report Card Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Student Profile Row */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div>
              <span className="text-[10px] font-mono text-sky-400 uppercase font-black block">
                STUDENT RECORD
              </span>
              <span className="font-bold text-base text-white">{profile.name}</span>
              <span className="text-xs text-slate-400 block">{gradeLabel} • Age {profile.age}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-black block">
                OVERALL GRADE
              </span>
              <span className="text-2xl font-black text-amber-300 flex items-center justify-end gap-1">
                <Star className="w-5 h-5 fill-amber-300" /> A+
              </span>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">ATTENDANCE</span>
              <span className="text-emerald-400 font-bold text-base flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">TASKS COMPLETED</span>
              <span className="text-sky-400 font-bold text-base">
                {completedQuests} / {quests.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">ALLOWANCE</span>
              <span className="text-amber-400 font-bold text-base">${cash}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Yellow School Buses Have Departed
            </p>
            <p className="text-slate-400 leading-relaxed">
              You completed the full school day! You can board the bus to begin the next school day, or stay in the courtyard and roam Bell School's 12 floors freely.
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onContinueFreeRoam}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all active:scale-95"
            >
              Continue Free Roam
            </button>
            <button
              onClick={onNextDay}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Start Next Day
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
