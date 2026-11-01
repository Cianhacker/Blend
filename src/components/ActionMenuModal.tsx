import React, { useState } from 'react';
import {
  X,
  Flame,
  EyeOff,
  UserCheck,
  HeartHandshake,
  Sparkles,
  Smile,
  ShieldAlert,
  BookOpen,
  DollarSign,
  Trash2,
  Lock,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface ActionDef {
  id: string;
  name: string;
  category: 'bully' | 'cheating' | 'normal' | 'good';
  desc: string;
  icon: string;
  animation: 'wave' | 'cheer' | 'flex' | 'sweep' | 'taunt' | 'whistle';
  repType?: 'rebel' | 'nerd' | 'jock' | 'authority';
  repDelta?: number;
  cashDelta?: number;
}

const SCHOOL_ACTIONS: ActionDef[] = [
  // 1. Bully Category
  {
    id: 'bully_shakedown',
    name: 'Shakedown for Lunch Money',
    category: 'bully',
    desc: 'Intimidate a student to demand lunch tokens ($3).',
    icon: '💰',
    animation: 'taunt',
    repType: 'rebel',
    repDelta: 8,
    cashDelta: 3,
  },
  {
    id: 'bully_flex',
    name: 'Flex Muscles & Taunt',
    category: 'bully',
    desc: 'Show off your strength to intimidate nearby students.',
    icon: '💪',
    animation: 'flex',
    repType: 'jock',
    repDelta: 5,
  },
  {
    id: 'bully_locker_slam',
    name: 'Locker Slam Scare',
    category: 'bully',
    desc: 'Slam a metal locker shut loudly to startle anyone nearby.',
    icon: '🚪',
    animation: 'taunt',
    repType: 'rebel',
    repDelta: 6,
  },
  {
    id: 'bully_trip',
    name: 'Hallway Prank / Trip',
    category: 'bully',
    desc: 'Stick out your foot as someone walks by.',
    icon: '👟',
    animation: 'taunt',
    repType: 'rebel',
    repDelta: 7,
  },

  // 2. Cheating Category
  {
    id: 'cheat_peek_answers',
    name: 'Peek at Quiz Answers',
    category: 'cheating',
    desc: 'Glance over at the top student\'s test sheet for quiz hints.',
    icon: '👀',
    animation: 'taunt',
    repType: 'rebel',
    repDelta: 5,
  },
  {
    id: 'cheat_pass_whisper',
    name: 'Whisper Secret Test Answers',
    category: 'cheating',
    desc: 'Pass clandestine answers to a friend during class.',
    icon: '🤫',
    animation: 'wave',
    repType: 'rebel',
    repDelta: 4,
  },
  {
    id: 'cheat_lockpick',
    name: 'Pick Locker Dial Lock',
    category: 'cheating',
    desc: 'Attempt to bypass a classmate\'s locker combination.',
    icon: '🪛',
    animation: 'taunt',
    repType: 'rebel',
    repDelta: 6,
    cashDelta: 2,
  },
  {
    id: 'cheat_fake_nurse_pass',
    name: 'Fake Sick Pass for Nurse',
    category: 'cheating',
    desc: 'Pretend to have a fever to skip the remainder of the period.',
    icon: '🤒',
    animation: 'wave',
    repType: 'rebel',
    repDelta: 3,
  },

  // 3. Normal Category
  {
    id: 'normal_wave',
    name: 'Friendly Wave & Greet',
    category: 'normal',
    desc: 'Raise your hand and warmly wave to classmates.',
    icon: '👋',
    animation: 'wave',
  },
  {
    id: 'normal_study_notes',
    name: 'Pass Clean Study Notes',
    category: 'normal',
    desc: 'Share textbook notes and study together.',
    icon: '📓',
    animation: 'wave',
    repType: 'nerd',
    repDelta: 4,
  },
  {
    id: 'normal_stretch',
    name: 'Stretch & Yawn',
    category: 'normal',
    desc: 'Take a deep breath and regain your focus.',
    icon: '🙆',
    animation: 'flex',
  },
  {
    id: 'normal_whistle',
    name: 'Cheerful Tune / Whistle',
    category: 'normal',
    desc: 'Hum a familiar school anthem melody.',
    icon: '🎶',
    animation: 'cheer',
  },

  // 4. Good Category
  {
    id: 'good_pick_trash',
    name: 'Pick Up Spilled Hallway Trash',
    category: 'good',
    desc: 'Help the school janitor by keeping the corridors tidy.',
    icon: '🧹',
    animation: 'sweep',
    repType: 'authority',
    repDelta: 8,
  },
  {
    id: 'good_tutor_help',
    name: 'Tutor Classmate with Math',
    category: 'good',
    desc: 'Explain difficult algebra problems before the pop quiz.',
    icon: '📚',
    animation: 'cheer',
    repType: 'nerd',
    repDelta: 10,
  },
  {
    id: 'good_compliment_teacher',
    name: 'Compliment Teacher',
    category: 'good',
    desc: 'Politely thank the teacher for an insightful lecture.',
    icon: '🍎',
    animation: 'wave',
    repType: 'authority',
    repDelta: 7,
  },
  {
    id: 'good_stand_up',
    name: 'Stand Up to Hallway Bully',
    category: 'good',
    desc: 'Intervene and protect students from bullying shakedowns.',
    icon: '🛡️',
    animation: 'flex',
    repType: 'jock',
    repDelta: 9,
  },
];

interface ActionMenuModalProps {
  onSelectAction: (action: ActionDef) => void;
  onClose: () => void;
}

export const ActionMenuModal: React.FC<ActionMenuModalProps> = ({ onSelectAction, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'bully' | 'cheating' | 'normal' | 'good'>('normal');

  const categories = [
    { id: 'bully', name: 'Bully', icon: Flame, color: 'text-rose-400 bg-rose-950/40 border-rose-600' },
    { id: 'cheating', name: 'Cheating', icon: EyeOff, color: 'text-purple-400 bg-purple-950/40 border-purple-600' },
    { id: 'normal', name: 'Normal', icon: Smile, color: 'text-sky-400 bg-sky-950/40 border-sky-600' },
    { id: 'good', name: 'Good', icon: HeartHandshake, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-600' },
  ] as const;

  const filteredActions = SCHOOL_ACTIONS.filter((a) => a.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-black text-lg tracking-wide">AI-DRIVEN SCHOOL ACTIONS</h3>
              <p className="text-xs text-slate-400">Choose an action to perform in 3D</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="p-3 bg-slate-850 border-b border-slate-800 grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-3 rounded-2xl border flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wider transition-all ${
                  isSelected
                    ? `${cat.color} ring-2 ring-white/30 scale-102 shadow-md`
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Actions Grid */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                soundManager.playPunchWhoosh();
                onSelectAction(action);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-left flex items-center justify-between gap-4 transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300">
                    {action.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{action.desc}</p>
                </div>
              </div>

              {/* Action tags */}
              <div className="text-right shrink-0">
                {action.cashDelta && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 block mb-1">
                    +${action.cashDelta}
                  </span>
                )}
                {action.repType && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    +{action.repDelta} {action.repType.toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/90 border-t border-slate-700 text-xs text-slate-400 flex items-center justify-between">
          <span>Keyboard shortcut: Press [Q] or [R] anytime to open Actions menu</span>
        </div>
      </div>
    </div>
  );
};
