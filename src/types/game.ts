export type GradeTier = 'kindergarten' | 'elementary' | 'middle' | 'high';

export interface StudentGrade {
  tier: GradeTier;
  gradeName: string; // 'Kindergarten' | 'Grade 1' ... 'Grade 12'
  gradeNumber: number; // 0 for Kinder, 1-12
  ageRange: [number, number];
}

export type Role =
  | 'student'
  | 'principal'
  | 'teacher'
  | 'janitor'
  | 'staff'
  | 'delinquent'
  | 'athlete'
  | 'honor_student';

export type Gender = 'male' | 'female' | 'nonbinary';

export interface CharacterAppearance {
  hairStyle: 'short' | 'curly' | 'ponytail' | 'spiky' | 'bald';
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  hasGlasses: boolean;
  hasBackpack: boolean;
  clothingStyle?:
    | 'male_uniform'
    | 'female_uniform'
    | 'kinder_uniform'
    | 'principal_suit'
    | 'teacher_cardigan'
    | 'janitor_overalls'
    | 'nurse_scrubs'
    | 'varsity_jacket'
    | 'rebel_leather';
}

export interface CharacterProfile {
  name: string;
  role: Role;
  gender: Gender;
  age: number;
  gradeTier?: GradeTier;
  gradeName?: string;
  gradeNumber?: number;
  appearance: CharacterAppearance;
  bio: string;
  perk: string;
}

export type WeatherType = 'clear_sunny' | 'rain' | 'snow';

export interface WeatherState {
  type: WeatherType;
  name: string;
  temperature: string;
  description: string;
  icon: string;
  isAuto: boolean;
}

export interface SchoolPeriod {
  id: string;
  name: string;
  subject: string;
  targetFloor: number;
  roomName: string;
  startTime: string;
  endTime: string;
  activity: string;
  bonusRepType: 'nerd' | 'jock' | 'rebel' | 'authority';
  weather: WeatherType;
  temperature: string;
}

export const SCHOOL_SCHEDULE: SchoolPeriod[] = [
  {
    id: 'homeroom',
    name: 'Period 1: Morning Homeroom & Math',
    subject: 'Calculus & Algebra',
    targetFloor: 3,
    roomName: 'Classroom 101',
    startTime: '08:00 AM',
    endTime: '09:15 AM',
    activity: 'Take your seat and complete the morning pop quiz.',
    bonusRepType: 'nerd',
    weather: 'clear_sunny',
    temperature: '19°C / 66°F',
  },
  {
    id: 'science_lab',
    name: 'Period 2: Advanced Science & Chemistry',
    subject: 'Chemistry & Biology',
    targetFloor: 5,
    roomName: 'Science Lab 501',
    startTime: '09:20 AM',
    endTime: '10:35 AM',
    activity: 'Examine chemical flasks and Bunsen burners.',
    bonusRepType: 'nerd',
    weather: 'clear_sunny',
    temperature: '21°C / 70°F',
  },
  {
    id: 'recess',
    name: 'Morning Recess & Outdoor Play',
    subject: 'Break Time',
    targetFloor: 1,
    roomName: 'Courtyard & Playground',
    startTime: '10:35 AM',
    endTime: '11:00 AM',
    activity: 'Shoot hoops or relax on the playground benches in the bright sunshine.',
    bonusRepType: 'jock',
    weather: 'clear_sunny',
    temperature: '23°C / 73°F',
  },
  {
    id: 'history_lit',
    name: 'Period 3: World History & Literature',
    subject: 'History & Arts',
    targetFloor: 4,
    roomName: 'Classroom 201',
    startTime: '11:00 AM',
    endTime: '12:15 PM',
    activity: 'Study historical archives as gentle rain showers begin outside.',
    bonusRepType: 'nerd',
    weather: 'rain',
    temperature: '16°C / 61°F',
  },
  {
    id: 'cafeteria_lunch',
    name: 'Lunch Period: Cafeteria Social',
    subject: 'Lunch & Nutrition',
    targetFloor: 2,
    roomName: 'Dining Hall',
    startTime: '12:15 PM',
    endTime: '01:15 PM',
    activity: 'Eat lunch, grab soda, and watch the rain pour down on the basketball court.',
    bonusRepType: 'rebel',
    weather: 'rain',
    temperature: '15°C / 59°F',
  },
  {
    id: 'fine_arts',
    name: 'Period 4: Fine Arts, Music & Tech',
    subject: 'Music & Robotics',
    targetFloor: 8,
    roomName: 'Music Studio 801',
    startTime: '01:15 PM',
    endTime: '02:30 PM',
    activity: 'Play music as a cold front arrives with soft snowflakes fluttering outside.',
    bonusRepType: 'nerd',
    weather: 'snow',
    temperature: '-1°C / 30°F',
  },
  {
    id: 'athletics_gym',
    name: 'Period 5: Physical Education & Varsity',
    subject: 'Athletics & Fitness',
    targetFloor: 9,
    roomName: 'Gymnasium Arena',
    startTime: '02:35 PM',
    endTime: '03:45 PM',
    activity: 'Practice basketball drills while winter snow dusts the outdoor playground.',
    bonusRepType: 'jock',
    weather: 'snow',
    temperature: '-2°C / 28°F',
  },
  {
    id: 'after_school',
    name: 'After-School & Detention Hour',
    subject: 'Clubs & Detention',
    targetFloor: 12,
    roomName: 'Detention Room 1201',
    startTime: '03:45 PM',
    endTime: '05:00 PM',
    activity: 'Study in the library or gaze from the roof as golden evening sunshine clears the skies.',
    bonusRepType: 'authority',
    weather: 'clear_sunny',
    temperature: '17°C / 63°F',
  },
];

export type GameMode =
  | 'normal'
  | 'normal_dismissal'
  | 'night_school'
  | 'day_to_night';

export interface GameModeDef {
  id: GameMode;
  name: string;
  tagline: string;
  desc: string;
  icon: string;
  badgeColor: string;
  startTime: string;
  hasDismissal: boolean;
  dismissalTime?: string;
  isNightTheme: boolean;
  isCycle: boolean;
}

export const GAME_MODES: GameModeDef[] = [
  {
    id: 'normal',
    name: 'Normal',
    tagline: 'Standard Daytime Academy',
    desc: 'Regular morning-to-afternoon school schedule across all 12 floors. Infinite free-roam and classroom periods.',
    icon: '☀️',
    badgeColor: 'from-blue-600 to-cyan-500',
    startTime: '08:00 AM',
    hasDismissal: false,
    isNightTheme: false,
    isCycle: false,
  },
  {
    id: 'normal_dismissal',
    name: 'Normal with Dismissal Time',
    tagline: 'Dismissal Bell at 03:30 PM & Buses',
    desc: 'Counts down to the 03:30 PM final dismissal bell! Hear the school bell chime, catch the yellow school bus in the courtyard, and view your daily report card.',
    icon: '🔔',
    badgeColor: 'from-emerald-600 to-teal-500',
    startTime: '08:00 AM',
    hasDismissal: true,
    dismissalTime: '03:30 PM',
    isNightTheme: false,
    isCycle: false,
  },
  {
    id: 'night_school',
    name: 'Night School',
    tagline: 'Stars, Moonlit Courtyard & Night Curfew',
    desc: 'Bell School under the stars and midnight moon (07:00 PM - 02:00 AM). Glowing playground floodlights, night classes, and mystery curfew monitor patrols.',
    icon: '🌙',
    badgeColor: 'from-indigo-700 to-purple-900',
    startTime: '07:00 PM',
    hasDismissal: false,
    isNightTheme: true,
    isCycle: false,
  },
  {
    id: 'day_to_night',
    name: 'School Day to Night',
    tagline: 'Dynamic 24-Hour Lighting Cycle',
    desc: 'Continuous real-time time-lapse! Watch sunrise at homeroom, bright afternoon playground sun, sunset golden hour, and starry nighttime with outdoor lamps.',
    icon: '🌅',
    badgeColor: 'from-amber-600 to-rose-600',
    startTime: '08:00 AM',
    hasDismissal: false,
    isNightTheme: false,
    isCycle: true,
  },
];

export interface GameSettings {
  gameMode: GameMode;
  popQuizRate: number; // 0 - 100%
  bullyAmbushRate: number; // 0 - 100%
  foodFightRate: number; // 0 - 100%
  hallMonitorStrictness: number; // 0 - 100%
  fireDrillRate: number; // 0 - 100%
  spillFrequency: number; // 0 - 100%
  christmasEventRate: number; // 0 - 100% (Christmas tree, snow, presents, Santa hats)
  pepRallyRate: number; // 0 - 100% (Gym pep rally, cheer, loud crowd)
  spookyGhostRate: number; // 0 - 100% (Mystery lights flicker, spooky rumors on Floor 12)
  soundVolume: number; // 0 - 100%
  graphicsQuality: 'low' | 'medium' | 'high';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consumable' | 'tool' | 'key' | 'quest' | 'weapon';
  count: number;
  actionType: 'heal' | 'stamina' | 'unlock' | 'clean' | 'distract' | 'equip' | 'open_gift';
  value: number;
}

export interface Reputation {
  nerd: number;
  jock: number;
  rebel: number;
  authority: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  cash: number;
  reputation: Reputation;
  isSitting: boolean;
  isRunning: boolean;
  isPunching: boolean;
  currentFloor: number;
  detentionSeconds: number;
}

export interface FloorDef {
  number: number;
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  hasOutdoors?: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  role: Role | 'nurse' | 'cook' | 'bully' | 'hall_monitor';
  floor: number;
  position: [number, number, number];
  rotation: number;
  appearance: CharacterAppearance;
  personality: string;
  greeting: string;
  mood: 'friendly' | 'neutral' | 'annoyed' | 'angry' | 'suspicious';
  isHostile?: boolean;
  dialogueHistory?: { sender: 'player' | 'npc'; text: string }[];
  questId?: string;
  hp: number;
  maxHp: number;
}

export interface Quest {
  id: string;
  giverId: string;
  giverName: string;
  title: string;
  description: string;
  floor: number;
  targetType: 'talk' | 'collect' | 'clean' | 'punch' | 'deliver' | 'quiz' | 'explore' | 'sit' | 'any';
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  reward: {
    xp: number;
    cash: number;
    repType: keyof Reputation;
    repAmount: number;
    item?: InventoryItem;
  };
}

export interface DynamicSchoolEvent {
  id: string;
  type:
    | 'food_fight'
    | 'pop_quiz'
    | 'bully_ambush'
    | 'fire_drill'
    | 'inspection'
    | 'janitor_mess'
    | 'christmas_party'
    | 'pep_rally'
    | 'ghost_hour';
  title: string;
  description: string;
  floor: number;
  activeUntil: number;
  isResolved?: boolean;
}

export const SCHOOL_FLOORS: FloorDef[] = [
  {
    number: 1,
    name: 'Floor 1: Kindergarten & Playground',
    shortName: 'Kindergarten & Playground',
    description: 'Kindergarten activity room, nap mats, alphabet blocks, plus outdoor sports courtyard & swings.',
    themeColor: '#38bdf8',
    hasOutdoors: true,
  },
  {
    number: 2,
    name: 'Floor 2: Lower Elementary & Cafeteria',
    shortName: 'Grades 1-2 & Cafeteria',
    description: 'Grades 1 & 2 classrooms, dining tables, hot buffet counters, and vending machines.',
    themeColor: '#fb923c',
  },
  {
    number: 3,
    name: 'Floor 3: Upper Elementary Wing',
    shortName: 'Grades 3-5 Hall',
    description: 'Grades 3, 4, & 5 classrooms, student cubbies, project stations, and reading corners.',
    themeColor: '#3b82f6',
  },
  {
    number: 4,
    name: 'Floor 4: Middle School Junior Wing',
    shortName: 'Grades 6-7 Wing',
    description: 'Middle school introduction halls, blue metal lockers, geography charts, and study halls.',
    themeColor: '#6366f1',
  },
  {
    number: 5,
    name: 'Floor 5: Middle School 8th Grade & Tech',
    shortName: 'Grade 8 & Junior Tech',
    description: '8th Grade pre-high school prep rooms and computer/coding exploration stations.',
    themeColor: '#10b981',
  },
  {
    number: 6,
    name: 'Floor 6: High School Freshman Wing',
    shortName: 'Grade 9 Freshman',
    description: 'Freshman core academy, Biology & Chemistry laboratory counters, and science beakers.',
    themeColor: '#06b6d4',
  },
  {
    number: 7,
    name: 'Floor 7: High School Sophomore & Library',
    shortName: 'Grade 10 & Library',
    description: 'Sophomore honors halls, towering library bookshelves, and silent archive carrels.',
    themeColor: '#8b5cf6',
  },
  {
    number: 8,
    name: 'Floor 8: High School Junior Arts & Music',
    shortName: 'Grade 11 Arts & Music',
    description: 'Junior studio wing, painter easels, grand piano, drum set, and drama stage.',
    themeColor: '#ec4899',
  },
  {
    number: 9,
    name: 'Floor 9: High School Senior Arena & Gym',
    shortName: 'Grade 12 & Gymnasium',
    description: 'Senior varsity headquarters, full indoor basketball court, bleachers, and punching bags.',
    themeColor: '#f59e0b',
  },
  {
    number: 10,
    name: 'Floor 10: Faculty Lounge & Clinic',
    shortName: 'Teachers & Health Clinic',
    description: 'K-12 teacher workrooms, coffee lounge, counselors, and nurse infirmary examination beds.',
    themeColor: '#14b8a6',
  },
  {
    number: 11,
    name: "Floor 11: Principal & Boardroom Suite",
    shortName: 'Principal Executive Suite',
    description: 'Superintendent & Principal office, PA system microphone console, and academy trophies.',
    themeColor: '#d97706',
  },
  {
    number: 12,
    name: 'Floor 12: Detention & Rooftop Garden',
    shortName: 'Detention & Rooftop',
    description: 'Academy detention room, isolation cell, plus rooftop greenhouse and telescope observatory.',
    themeColor: '#ef4444',
  },
];
