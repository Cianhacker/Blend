import React, { useState } from 'react';
import {
  GraduationCap,
  Crown,
  BookOpen,
  Wrench,
  HeartPulse,
  Flame,
  Trophy,
  Award,
  Sliders,
  Play,
  User,
  Sparkles,
  Dices,
  Lock,
  Building2,
  Check,
} from 'lucide-react';
import {
  CharacterProfile,
  Role,
  Gender,
  GradeTier,
  GameSettings,
  GameMode,
  GAME_MODES,
} from '../types/game';
import { SettingsModal } from './SettingsModal';
import { generateRandomName } from '../utils/nameGenerator';

interface CharacterCreatorProps {
  onStartGame: (profile: CharacterProfile, settings: GameSettings, schoolId: string) => void;
  initialSettings: GameSettings;
}

const ROLES: {
  id: Role;
  name: string;
  icon: any;
  color: string;
  desc: string;
  defaultAge: number;
  perk: string;
}[] = [
  {
    id: 'student',
    name: 'Student (K-12)',
    icon: GraduationCap,
    color: 'from-blue-600 to-cyan-500',
    desc: 'Attend classes across 12 floors, pass quizzes, make friends, and dodge hallway bullies.',
    defaultAge: 16,
    perk: 'Agile Runner & Note Pass',
  },
  {
    id: 'principal',
    name: 'Principal',
    icon: Crown,
    color: 'from-amber-600 to-yellow-500',
    desc: 'Top authority! Broadcast schoolwide PA announcements and send any troublemakers to detention.',
    defaultAge: 52,
    perk: 'Executive Command & PA Access',
  },
  {
    id: 'teacher',
    name: 'Teacher',
    icon: BookOpen,
    color: 'from-indigo-600 to-purple-500',
    desc: 'Teach courses, grade assignments, pop surprise exams, and enforce classroom discipline.',
    defaultAge: 38,
    perk: 'Pop Quiz Dispenser & Detention Slips',
  },
  {
    id: 'janitor',
    name: 'Janitor',
    icon: Wrench,
    color: 'from-sky-700 to-blue-600',
    desc: 'Master of the school! Unlock all locked rooms with Master Key and clean slippery messes.',
    defaultAge: 58,
    perk: 'Master Keys & Floor Polish',
  },
  {
    id: 'staff',
    name: 'Staff & Clinic',
    icon: HeartPulse,
    color: 'from-emerald-600 to-teal-500',
    desc: 'Infirmary nurse & cafeteria staff. Heal bruised students and distribute energy meals.',
    defaultAge: 32,
    perk: 'First Aid Pack & Nutrition Boost',
  },
  {
    id: 'delinquent',
    name: 'Delinquent',
    icon: Flame,
    color: 'from-rose-600 to-red-500',
    desc: 'Hallway rebel. Powerful punch strength, locker break-in skills, and street charisma.',
    defaultAge: 17,
    perk: 'Heavy Knuckle Hit & Lockpick',
  },
  {
    id: 'athlete',
    name: 'Varsity Athlete',
    icon: Trophy,
    color: 'from-orange-600 to-amber-500',
    desc: 'Sports star! Superior stamina regeneration, basketball skills, and gym clout.',
    defaultAge: 17,
    perk: '2x Sprint Stamina & Gym Clout',
  },
  {
    id: 'honor_student',
    name: 'Honor Student',
    icon: Award,
    color: 'from-violet-600 to-fuchsia-500',
    desc: 'Top academic prodigy. Effortlessly answers quizzes and earns high rewards from teachers.',
    defaultAge: 16,
    perk: 'Instant Quiz Solver & Extra Tokens',
  },
];

const SCHOOL_TYPES = [
  {
    id: 'bell_school',
    name: 'Bell School',
    tagline: '12 Floors • K-12 Academy • Playable Now',
    desc: 'Classic towering brick academy with bell tower, 12 interactive floors, cafeteria, gym, detention rooftop and outdoor sports courtyard.',
    isLocked: false,
    themeColor: '#0284c7',
    icon: '🔔',
  },
  {
    id: 'cyber_tech',
    name: 'XXXX - CyberTech Float Academy',
    tagline: 'Chained & Locked • Coming Soon',
    desc: 'XXXX - Classified futuristic floating research campus with zero-G athletic arenas and AI hologram tutors. XXXX',
    isLocked: true,
    themeColor: '#8b5cf6',
  },
  {
    id: 'blackwood_manor',
    name: 'XXXX - Blackwood Gothic Manor',
    tagline: 'Chained & Locked • Coming Soon',
    desc: 'XXXX - Victorian stone castle with secret passage dungeons, gargoyles, and shifting midnight clock towers. XXXX',
    isLocked: true,
    themeColor: '#64748b',
  },
  {
    id: 'olympia_sports',
    name: 'XXXX - St. Olympia Sports Institute',
    tagline: 'Chained & Locked • Coming Soon',
    desc: 'XXXX - World-class Olympic sports campus featuring Olympic-sized pools, stadium, and martial arts dojos. XXXX',
    isLocked: true,
    themeColor: '#f59e0b',
  },
];

const GRADES = [
  { name: 'Kindergarten', tier: 'kindergarten' as GradeTier, age: 5, number: 0 },
  { name: 'Grade 1 (Elementary)', tier: 'elementary' as GradeTier, age: 6, number: 1 },
  { name: 'Grade 2 (Elementary)', tier: 'elementary' as GradeTier, age: 7, number: 2 },
  { name: 'Grade 3 (Elementary)', tier: 'elementary' as GradeTier, age: 8, number: 3 },
  { name: 'Grade 4 (Elementary)', tier: 'elementary' as GradeTier, age: 9, number: 4 },
  { name: 'Grade 5 (Elementary)', tier: 'elementary' as GradeTier, age: 10, number: 5 },
  { name: 'Grade 6 (Middle School)', tier: 'middle' as GradeTier, age: 11, number: 6 },
  { name: 'Grade 7 (Middle School)', tier: 'middle' as GradeTier, age: 12, number: 7 },
  { name: 'Grade 8 (Middle School)', tier: 'middle' as GradeTier, age: 13, number: 8 },
  { name: 'Grade 9 (Freshman)', tier: 'high' as GradeTier, age: 14, number: 9 },
  { name: 'Grade 10 (Sophomore)', tier: 'high' as GradeTier, age: 15, number: 10 },
  { name: 'Grade 11 (Junior)', tier: 'high' as GradeTier, age: 16, number: 11 },
  { name: 'Grade 12 (Senior)', tier: 'high' as GradeTier, age: 17, number: 12 },
];

const HAIR_STYLES = ['short', 'curly', 'ponytail', 'spiky', 'bald'] as const;
const SKIN_COLORS = ['#fed7aa', '#fde047', '#fdba74', '#b45309', '#78350f'];
const HAIR_COLORS = ['#1e293b', '#78350f', '#facc15', '#dc2626', '#94a3b8', '#8b5cf6'];
const SHIRT_COLORS = ['#2563eb', '#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#0f172a', '#ec4899'];
const PANTS_COLORS = ['#1e293b', '#0f172a', '#334155', '#475569', '#1e3a8a'];

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onStartGame,
  initialSettings,
}) => {
  const [selectedSchool, setSelectedSchool] = useState('bell_school');
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialSettings.gameMode || 'normal');
  const [role, setRole] = useState<Role>('student');
  const [gender, setGender] = useState<Gender>('male');
  const [name, setName] = useState(() => generateRandomName('student', 'male'));
  const [selectedGrade, setSelectedGrade] = useState(GRADES[9]); // Grade 9
  const [age, setAge] = useState(15);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  // Appearance
  const [hairStyle, setHairStyle] = useState<'short' | 'curly' | 'ponytail' | 'spiky' | 'bald'>('short');
  const [skinColor, setSkinColor] = useState(SKIN_COLORS[0]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0]);
  const [pantsColor, setPantsColor] = useState(PANTS_COLORS[0]);
  const [hasGlasses, setHasGlasses] = useState(false);
  const [hasBackpack, setHasBackpack] = useState(true);

  const handleRandomizeName = () => {
    setName(generateRandomName(role, gender));
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setName(generateRandomName(newRole, gender));
    const roleObj = ROLES.find((r) => r.id === newRole);
    if (roleObj) {
      if (newRole === 'student') {
        setAge(selectedGrade.age);
      } else {
        setAge(roleObj.defaultAge);
      }
    }
  };

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    setName(generateRandomName(role, newGender));
  };

  const handleGradeChange = (gradeItem: typeof GRADES[0]) => {
    setSelectedGrade(gradeItem);
    setAge(gradeItem.age);
  };

  const getClothingStyleFor = (r: Role, g: Gender): any => {
    if (r === 'student' || r === 'honor_student') {
      return g === 'female' ? 'female_uniform' : 'male_uniform';
    }
    if (r === 'principal') return 'principal_suit';
    if (r === 'janitor') return 'janitor_overalls';
    if (r === 'staff') return 'nurse_scrubs';
    if (r === 'athlete') return 'varsity_jacket';
    if (r === 'delinquent') return 'rebel_leather';
    return g === 'female' ? 'female_uniform' : 'male_uniform';
  };

  const handleStart = () => {
    const roleObj = ROLES.find((r) => r.id === role);
    const clothingStyle = getClothingStyleFor(role, gender);

    const profile: CharacterProfile = {
      name: name.trim() || 'Hero',
      role,
      gender,
      age,
      gradeTier: role === 'student' ? selectedGrade.tier : undefined,
      gradeName: role === 'student' ? selectedGrade.name : undefined,
      gradeNumber: role === 'student' ? selectedGrade.number : undefined,
      appearance: {
        hairStyle,
        hairColor,
        skinColor,
        shirtColor,
        pantsColor,
        shoesColor: '#1e293b',
        hasGlasses,
        hasBackpack: role === 'student' ? hasBackpack : false,
        clothingStyle,
      },
      bio: roleObj?.desc || '',
      perk: roleObj?.perk || '',
    };

    onStartGame(profile, { ...settings, gameMode: selectedMode }, selectedSchool);
  };

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex flex-col overflow-y-auto">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xl shadow-lg shadow-sky-500/30">
            🔔
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              SchoolTime!
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Bell School 12 Floors
              </span>
            </h1>
            <p className="text-xs text-slate-400">Kindergarten to Grade 12 • AI Characters • Dynamic Events</p>
          </div>
        </div>

        <button
          onClick={() => setSettingsModalOpen(true)}
          className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>EVENTS & SETTINGS</span>
          {settings.christmasEventRate > 0 && <span className="text-xs">🎄</span>}
        </button>
      </header>

      {/* Main Body */}
      <div className="max-w-6xl mx-auto w-full p-6 space-y-8 my-auto">
        {/* 1. School Type Selector (Bell School vs Locked in Chains Coming Soon) */}
        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Choose School Campus
            </h2>
            <span className="text-xs text-slate-400">Bell School (Active) • Other Academies In Development</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCHOOL_TYPES.map((school) => {
              const isSelected = selectedSchool === school.id;
              if (school.isLocked) {
                return (
                  /* Coming soon school locked in chain representation */
                  <div
                    key={school.id}
                    className="relative p-4 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden select-none opacity-85 group cursor-not-allowed"
                  >
                    {/* Crossed Heavy Chains Graphic Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      {/* Diagonal Chain 1 */}
                      <div className="absolute w-[140%] h-5 bg-gradient-to-r from-slate-700 via-slate-400 to-slate-700 rotate-45 flex items-center justify-around shadow-2xl border-y-2 border-slate-900 opacity-90">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-2.5 h-3.5 border-2 border-slate-900 rounded-sm bg-slate-500 shadow-inner" />
                        ))}
                      </div>
                      {/* Diagonal Chain 2 */}
                      <div className="absolute w-[140%] h-5 bg-gradient-to-r from-slate-700 via-slate-400 to-slate-700 -rotate-45 flex items-center justify-around shadow-2xl border-y-2 border-slate-900 opacity-90">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-2.5 h-3.5 border-2 border-slate-900 rounded-sm bg-slate-500 shadow-inner" />
                        ))}
                      </div>
                      {/* Big Padlock in Center */}
                      <div className="relative z-20 w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-600 to-amber-800 border-2 border-amber-300 shadow-2xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-amber-100" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1 opacity-60">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <h3 className="font-bold text-sm text-slate-200">{school.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                      LOCKED IN CHAINS • COMING SOON
                    </span>
                    <p className="text-[11px] text-slate-400 leading-snug">{school.desc}</p>
                  </div>
                );
              }

              return (
                <button
                  key={school.id}
                  onClick={() => setSelectedSchool(school.id)}
                  className={`relative p-4 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-400 ring-2 ring-sky-400/50 shadow-xl shadow-sky-500/20'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{school.icon}</span>
                      <h3 className="font-black text-base text-white">{school.name}</h3>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">
                    ★ {school.tagline}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">{school.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Game Mode Selection (Night School, Normal, Normal with Dismissal time, School Day to Night) */}
        <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Choose School Mode
            </h2>
            <span className="text-xs text-slate-400">Night School • Normal • Dismissal Time • Day to Night</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GAME_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-4 rounded-2xl text-left border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{mode.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-white mb-0.5">{mode.name}</h3>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold block mb-1">
                      {mode.tagline}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mt-1">{mode.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Character Creation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Role, Name, Grade */}
          <div className="lg:col-span-7 space-y-6">
            {/* Name & Gender & Randomize */}
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Identity & Name
                </h2>
                <button
                  onClick={handleRandomizeName}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Dices className="w-3.5 h-3.5" /> Randomize Name
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Character Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Enter name..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'nonbinary'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => handleGenderChange(g)}
                        className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          gender === g
                            ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {g === 'nonbinary' ? 'Non-Binary' : g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Crown className="w-4 h-4" /> Choose Your Role
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleChange(r.id)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b ' + r.color + ' text-white border-white/40 ring-2 ring-white/50 scale-105 shadow-xl'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1.5" />
                      <span className="font-bold text-xs leading-tight">{r.name}</span>
                      <span className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{r.perk}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Student: Kindergarten to Grade 12 Selection */}
            {role === 'student' && (
              <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Student Grade Level (Kindergarten to Grade 12)
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-black">
                    {selectedGrade.name} (Age: {selectedGrade.age})
                  </span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => handleGradeChange(g)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedGrade.number === g.number
                          ? 'bg-cyan-600/90 text-white border-cyan-400 shadow-md ring-2 ring-cyan-300'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{g.name}</div>
                      <div className="text-[10px] text-cyan-200 opacity-80 mt-0.5">
                        Age {g.age} • {g.tier.toUpperCase()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Age Slider (For Non-Students) */}
            {role !== 'student' && (
              <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-300">Age: {age} Years Old</span>
                  <span className="text-xs text-slate-500">
                    {role === 'principal' ? 'Senior Executive' : 'Professional Staff'}
                  </span>
                </div>
                <input
                  type="range"
                  min={role === 'principal' ? 40 : 21}
                  max={role === 'janitor' ? 75 : 65}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Right Column: Visual Appearance & Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Appearance Studio
              </h2>

              {/* Hairstyle */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Hairstyle</label>
                <div className="grid grid-cols-5 gap-2">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs}
                      onClick={() => setHairStyle(hs)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        hairStyle === hs
                          ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Swatches */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Skin Tone</label>
                <div className="flex gap-2.5">
                  {SKIN_COLORS.map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setSkinColor(sc)}
                      style={{ backgroundColor: sc }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
                        skinColor === sc ? 'border-sky-400 ring-2 ring-white scale-110' : 'border-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Color Swatches */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Hair Color</label>
                <div className="flex gap-2.5">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc}
                      onClick={() => setHairColor(hc)}
                      style={{ backgroundColor: hc }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
                        hairColor === hc ? 'border-sky-400 ring-2 ring-white scale-110' : 'border-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Swatches */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Shirt / Uniform Color</label>
                <div className="flex gap-2 flex-wrap">
                  {SHIRT_COLORS.map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setShirtColor(sc)}
                      style={{ backgroundColor: sc }}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform active:scale-90 ${
                        shirtColor === sc ? 'border-sky-400 ring-2 ring-white scale-110' : 'border-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pants Swatches */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Pants Color</label>
                <div className="flex gap-2.5">
                  {PANTS_COLORS.map((pc) => (
                    <button
                      key={pc}
                      onClick={() => setPantsColor(pc)}
                      style={{ backgroundColor: pc }}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform active:scale-90 ${
                        pantsColor === pc ? 'border-sky-400 ring-2 ring-white scale-110' : 'border-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div className="pt-2 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasGlasses}
                    onChange={(e) => setHasGlasses(e.target.checked)}
                    className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                  />
                  Eyeglasses
                </label>

                {role === 'student' && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasBackpack}
                      onChange={(e) => setHasBackpack(e.target.checked)}
                      className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                    />
                    Backpack
                  </label>
                )}
              </div>
            </div>

            {/* Character Badge Preview */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl border border-slate-700 shadow-xl flex items-center gap-4">
              <div
                style={{ borderColor: shirtColor }}
                className="w-16 h-16 rounded-2xl bg-slate-950 border-2 flex items-center justify-center text-3xl shadow-lg relative overflow-hidden"
              >
                {role === 'student' ? '🎒' : role === 'principal' ? '👑' : role === 'teacher' ? '📚' : role === 'janitor' ? '🧹' : '⭐'}
              </div>
              <div>
                <h3 className="font-black text-lg text-white">{name || 'Your Hero'}</h3>
                <p className="text-xs text-sky-400 font-bold uppercase">
                  {role === 'student' ? `${selectedGrade.name} (${age} yrs)` : `${role.toUpperCase()} (${age} yrs)`}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {ROLES.find((r) => r.id === role)?.perk}
                </p>
              </div>
            </div>

            {/* Start Game Hero Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-lg tracking-wider shadow-xl shadow-sky-600/40 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>START AT BELL SCHOOL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsModalOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};
