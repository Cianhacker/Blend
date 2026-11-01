import React from 'react';
import { X, Clock, MapPin, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import { SCHOOL_SCHEDULE, SchoolPeriod } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface ClassScheduleModalProps {
  currentPeriodId: string;
  onGoToPeriodFloor: (floor: number) => void;
  onClose: () => void;
}

export const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({
  currentPeriodId,
  onGoToPeriodFloor,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide">BELL SCHOOL TIMETABLE</h3>
              <p className="text-xs text-slate-400">Classroom Times & Floor Periods</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {SCHOOL_SCHEDULE.map((period) => {
            const isCurrent = period.id === currentPeriodId;
            return (
              <div
                key={period.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {period.startTime} - {period.endTime}
                    </span>
                    <span className="font-bold text-sm text-white">{period.name}</span>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                      CURRENT CLASS
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Floor {period.targetFloor} • {period.roomName}</span>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playElevatorDing();
                      onGoToPeriodFloor(period.targetFloor);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    <span>GO TO CLASS</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {period.activity}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/90 border-t border-slate-700 text-xs text-slate-400 flex items-center justify-between">
          <span>School bells chime between periods. Attend class for XP & bonus reputation!</span>
        </div>
      </div>
    </div>
  );
};
