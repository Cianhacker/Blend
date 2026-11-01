import React from 'react';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import { SCHOOL_FLOORS } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface ElevatorModalProps {
  currentFloor: number;
  onSelectFloor: (floor: number) => void;
  onClose: () => void;
}

export const ElevatorModal: React.FC<ElevatorModalProps> = ({
  currentFloor,
  onSelectFloor,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center font-mono font-black text-emerald-400 text-lg">
              ▲▼
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide">CAMPUS ELEVATOR</h3>
              <p className="text-xs text-slate-400">12 Floors • Kindergarten to Grade 12 Academy</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Floor Selection Grid (Reverse order 12 down to 1 like real elevator!) */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {[...SCHOOL_FLOORS].reverse().map((floor) => {
            const isCurrent = floor.number === currentFloor;
            return (
              <button
                key={floor.number}
                onClick={() => {
                  soundManager.playElevatorDing();
                  onSelectFloor(floor.number);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border flex items-center gap-3.5 text-left transition-all ${
                  isCurrent
                    ? 'bg-emerald-600/20 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 hover:border-slate-500'
                }`}
              >
                {/* Floor number circle */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {floor.number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white truncate">{floor.shortName}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        HERE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {floor.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/90 border-t border-slate-700 text-xs text-slate-400 flex items-center justify-between">
          <span>Click any floor to ride the elevator.</span>
          <span className="font-mono text-emerald-400 font-bold">Floor {currentFloor} Active</span>
        </div>
      </div>
    </div>
  );
};
