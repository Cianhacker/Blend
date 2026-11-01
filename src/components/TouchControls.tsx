import React, { useRef, useState, useEffect } from 'react';
import {
  Hand,
  MessageSquare,
  ShieldAlert,
  Flame,
  ArrowUpCircle,
  Sparkles,
  Keyboard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InteractableObject } from '../game/FloorBuilder';
import { NPCData } from '../types/game';

interface TouchControlsProps {
  onMove: (x: number, y: number) => void;
  onPunch: () => void;
  onSit: () => void;
  onToggleRun: () => void;
  onUse: () => void;
  onTalk: () => void;
  onAction: () => void;
  isRunning: boolean;
  isSitting: boolean;
  interactable: InteractableObject | null;
  nearbyNpc: NPCData | null;
  actionName?: string;
  selectedItemName?: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onPunch,
  onSit,
  onToggleRun,
  onUse,
  onTalk,
  onAction,
  isRunning,
  isSitting,
  interactable,
  nearbyNpc,
  actionName = 'ACTION',
  selectedItemName,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickOffset, setStickOffset] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const basePosRef = useRef({ x: 0, y: 0 });

  // PC Controls Guide collapsed state
  const [showPcGuide, setShowPcGuide] = useState(false);

  // Touch handlers for joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      basePosRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    setJoystickActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const maxRadius = 45;
        const dx = touch.clientX - basePosRef.current.x;
        const dy = touch.clientY - basePosRef.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const nx = Math.cos(angle) * clampedDist;
        const ny = Math.sin(angle) * clampedDist;

        setStickOffset({ x: nx, y: ny });
        onMove(nx / maxRadius, ny / maxRadius);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setStickOffset({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // Keyboard controls listener (WASD, Space, Shift, E, F, C, Q)
  useEffect(() => {
    const keysDown = new Set<string>();

    const updateKeys = () => {
      let mx = 0;
      let mz = 0;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) mz -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) mz += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;

      const len = Math.hypot(mx, mz);
      if (len > 0) {
        onMove(mx / len, mz / len);
      } else if (!joystickActive) {
        onMove(0, 0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysDown.add(e.code);

      if (e.code === 'Space') {
        e.preventDefault();
        onPunch();
      } else if (e.code === 'KeyE') {
        onUse();
      } else if (e.code === 'KeyF') {
        onTalk();
      } else if (e.code === 'KeyQ' || e.code === 'KeyR') {
        onAction();
      } else if (e.code === 'KeyC') {
        onSit();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        onToggleRun();
      }
      updateKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      updateKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [joystickActive, onMove, onPunch, onSit, onToggleRun, onUse, onTalk, onAction]);

  return (
    <div className="pointer-events-none select-none">
      {/* Interactive Proximity Prompt */}
      {(interactable || nearbyNpc) && (
        <div className="pointer-events-auto absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-sky-400/50 backdrop-blur-md animate-bounce">
          {nearbyNpc ? (
            <>
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <div className="text-sm">
                <span className="font-bold text-purple-300">{nearbyNpc.name}</span>
                <span className="text-slate-300 text-xs ml-2 font-mono bg-purple-950 px-1.5 py-0.5 rounded border border-purple-500/40">
                  TALK [F]
                </span>
              </div>
            </>
          ) : (
            <>
              <Hand className="w-5 h-5 text-emerald-400" />
              <div className="text-sm">
                <span className="font-bold text-emerald-300">{interactable?.prompt}</span>
                <span className="text-slate-300 text-xs ml-2 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  [E]
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* PC Keyboard Controls Guide (Toggleable Pill on Bottom-Left) */}
      <div className="pointer-events-auto absolute bottom-40 left-6 z-20">
        <button
          onClick={() => setShowPcGuide(!showPcGuide)}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 border border-slate-700/80 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md"
        >
          <Keyboard className="w-4 h-4 text-sky-400" />
          <span>PC CONTROLS</span>
          {showPcGuide ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {showPcGuide && (
          <div className="mt-2 p-3 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-xs text-slate-300 w-64 backdrop-blur-md space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between">
              <span className="font-bold text-white">WASD / Arrows</span>
              <span className="text-slate-400">Move Character</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-cyan-400">[Shift]</span>
              <span className="text-slate-400">Toggle Sprint / Run</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-emerald-400">[E]</span>
              <span className="text-slate-400">USE / Open Doors</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-purple-400">[F]</span>
              <span className="text-slate-400">TALK to Character</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-amber-400">[Q]</span>
              <span className="text-slate-400">Special ACTION</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-red-400">[Space]</span>
              <span className="text-slate-400">PUNCH Attack</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-amber-300">[C]</span>
              <span className="text-slate-400">SIT / Stand</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono font-bold text-sky-400">[1-6]</span>
              <span className="text-slate-400">Hotbar Inventory</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-white">Mouse Drag</span>
              <span className="text-slate-400">Orbit Camera</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-white">Mouse Wheel</span>
              <span className="text-slate-400">Zoom In / Out</span>
            </div>
          </div>
        )}
      </div>

      {/* Virtual Joystick (Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto absolute bottom-6 left-6 z-20 w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-600/60 flex items-center justify-center touch-none backdrop-blur-sm shadow-xl active:border-sky-400"
      >
        <div
          style={{
            transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
          }}
          className={`w-12 h-12 rounded-full ${
            joystickActive ? 'bg-sky-500 scale-110 shadow-lg shadow-sky-500/50' : 'bg-slate-400/80'
          } border border-white/60 transition-transform duration-75`}
        />
        <span className="absolute bottom-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          WASD
        </span>
      </div>

      {/* Action Buttons Cluster (Right) */}
      <div className="pointer-events-auto absolute bottom-6 right-6 z-20 flex flex-col gap-2.5">
        {/* Top row: TALK & USE */}
        <div className="flex gap-2.5 justify-end">
          {/* TALK Button [F] */}
          <button
            onClick={onTalk}
            className={`w-14 h-14 rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
              nearbyNpc
                ? 'bg-purple-600 text-white ring-4 ring-purple-400 animate-pulse'
                : 'bg-purple-900/80 text-purple-200 border border-purple-500/40 hover:bg-purple-800'
            }`}
            title="Talk to nearby character (Key: F)"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] uppercase font-black tracking-wider mt-0.5">TALK</span>
            <span className="text-[8px] font-mono opacity-75">[F]</span>
          </button>

          {/* USE Button [E] */}
          <button
            onClick={onUse}
            className={`w-14 h-14 rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
              interactable
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-400 animate-pulse'
                : selectedItemName
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-2 ring-emerald-300 shadow-emerald-500/30 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-800'
            }`}
            title={interactable ? `Interact [E]` : selectedItemName ? `Use ${selectedItemName} [E]` : 'USE (Key: E)'}
          >
            <Hand className="w-4 h-4" />
            <span className="text-[8px] uppercase font-black tracking-wider mt-0.5 text-center leading-tight">
              {selectedItemName && !interactable ? 'USE ITEM' : 'USE'}
            </span>
            <span className="text-[8px] font-mono opacity-75">[E]</span>
          </button>
        </div>

        {/* Middle row: SIT, RUN & SPECIAL ACTION */}
        <div className="flex gap-2.5 justify-end">
          {/* SPECIAL AI ACTION Button [Q] */}
          <button
            onClick={onAction}
            className="w-14 h-14 rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 bg-gradient-to-tr from-amber-600 to-yellow-500 text-white border border-amber-300/50 hover:brightness-110"
            title="Execute dynamic AI Role Action (Key: Q or R)"
          >
            <Sparkles className="w-4 h-4 animate-spin text-amber-100" />
            <span className="text-[9px] uppercase font-black tracking-wider mt-0.5">{actionName}</span>
            <span className="text-[8px] font-mono opacity-80">[Q]</span>
          </button>

          {/* SIT Button [C] */}
          <button
            onClick={onSit}
            className={`w-14 h-14 rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isSitting
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                : 'bg-amber-950/80 text-amber-200 border border-amber-500/40 hover:bg-amber-900'
            }`}
            title="Sit down or stand up (Key: C)"
          >
            <ArrowUpCircle className={`w-4 h-4 ${isSitting ? 'rotate-180' : ''}`} />
            <span className="text-[9px] uppercase font-black tracking-wider mt-0.5">
              {isSitting ? 'STAND' : 'SIT'}
            </span>
            <span className="text-[8px] font-mono opacity-75">[C]</span>
          </button>

          {/* RUN Button [Shift] */}
          <button
            onClick={onToggleRun}
            className={`w-14 h-14 rounded-2xl font-bold flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isRunning
                ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-cyan-500/40'
                : 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-900'
            }`}
            title="Toggle Sprint / Run (Key: Shift)"
          >
            <Flame className={`w-4 h-4 ${isRunning ? 'animate-bounce' : ''}`} />
            <span className="text-[9px] uppercase font-black tracking-wider mt-0.5">
              {isRunning ? 'RUN' : 'WALK'}
            </span>
            <span className="text-[8px] font-mono opacity-75">[Shift]</span>
          </button>
        </div>

        {/* Bottom row: PUNCH [Space / Left-Click] */}
        <div className="flex justify-end">
          <button
            onClick={onPunch}
            className="w-16 h-16 rounded-2xl font-black flex flex-col items-center justify-center shadow-xl transition-all active:scale-90 bg-gradient-to-tr from-red-700 to-rose-500 text-white border-2 border-red-300/60 hover:brightness-110"
            title="Throw a punch attack! (Key: Space or Left-Click)"
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest mt-0.5">PUNCH</span>
            <span className="text-[8px] font-mono opacity-80">[Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
