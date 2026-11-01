import React, { useState, useEffect, useRef } from 'react';
import {
  CharacterProfile,
  GameSettings,
  InventoryItem,
  NPCData,
  Quest,
  DynamicSchoolEvent,
  SCHOOL_FLOORS,
  SCHOOL_SCHEDULE,
  SchoolPeriod,
  WeatherType,
  WeatherState,
  GameMode,
} from './types/game';
import { SchoolWorld, ActiveNPCInteraction } from './game/SchoolWorld';
import { InteractableObject } from './game/FloorBuilder';
import { CharacterCreator } from './components/CharacterCreator';
import { TouchControls } from './components/TouchControls';
import { InventoryBar } from './components/InventoryBar';
import { DialogueModal } from './components/DialogueModal';
import { ElevatorModal } from './components/ElevatorModal';
import { PopQuizModal } from './components/PopQuizModal';
import { QuestTracker } from './components/QuestTracker';
import { EventBanner } from './components/EventBanner';
import { SettingsModal } from './components/SettingsModal';
import { ActionMenuModal, ActionDef } from './components/ActionMenuModal';
import { ClassScheduleModal } from './components/ClassScheduleModal';
import { WeatherWidget } from './components/WeatherWidget';
import { DismissalReportModal } from './components/DismissalReportModal';
import { soundManager } from './audio/soundManager';
import {
  Building2,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  TreePine,
  DollarSign,
  Heart,
  Zap,
  Clock,
  Bus,
} from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  gameMode: 'normal',
  popQuizRate: 35,
  bullyAmbushRate: 40,
  foodFightRate: 50,
  hallMonitorStrictness: 45,
  fireDrillRate: 25,
  spillFrequency: 30,
  christmasEventRate: 10,
  pepRallyRate: 30,
  spookyGhostRate: 20,
  soundVolume: 75,
  graphicsQuality: 'medium',
};

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [schoolId, setSchoolId] = useState('bell_school');

  // Player Stats
  const [hp, setHp] = useState(100);
  const [maxHp] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [maxStamina] = useState(100);
  const [cash, setCash] = useState(25);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isSitting, setIsSitting] = useState(false);

  // Sound Muted state
  const [isMuted, setIsMuted] = useState(false);

  // Inventory & Selection
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // Quests
  const [quests, setQuests] = useState<Quest[]>([]);

  // Classroom Times & Timetable state
  const [periodIndex, setPeriodIndex] = useState(0);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Dynamic School Events
  const [activeEvent, setActiveEvent] = useState<DynamicSchoolEvent | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // Interaction Prompts & Active Modals
  const [interactable, setInteractable] = useState<InteractableObject | null>(null);
  const [nearbyNpc, setNearbyNpc] = useState<NPCData | null>(null);
  const [dialogueNpc, setDialogueNpc] = useState<NPCData | null>(null);
  const [elevatorOpen, setElevatorOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // World canvas ref
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<SchoolWorld | null>(null);

  // Movement vector for loop
  const moveVecRef = useRef({ x: 0, z: 0 });

  const currentPeriod: SchoolPeriod = SCHOOL_SCHEDULE[periodIndex];

  // Handle Starting Game from Character Creator
  const handleStartGame = (userProfile: CharacterProfile, userSettings: GameSettings, selectedSchool: string) => {
    setProfile(userProfile);
    setSettings(userSettings);
    setSchoolId(selectedSchool);
    soundManager.setVolume(userSettings.soundVolume);

    // Initial role-based starting items
    let startingItems: InventoryItem[] = [];
    if (userProfile.role === 'janitor') {
      startingItems = [
        { id: 'master_key', name: 'Master Key', description: 'Opens any locked classroom or utility closet.', icon: '🔑', category: 'key', count: 1, actionType: 'unlock', value: 50 },
        { id: 'floor_mop', name: 'Industrial Mop', description: 'Cleans up slippery spills and messes.', icon: '🧹', category: 'tool', count: 1, actionType: 'clean', value: 20 },
        { id: 'energy_soda', name: 'Fizzy Soda', description: 'Restores 40 stamina.', icon: '🥤', category: 'consumable', count: 2, actionType: 'stamina', value: 5 },
      ];
    } else if (userProfile.role === 'principal') {
      startingItems = [
        { id: 'pa_key', name: 'PA Broadcast Pass', description: 'Allows announcements to all 12 floors.', icon: '📢', category: 'key', count: 1, actionType: 'unlock', value: 100 },
        { id: 'gold_pen', name: 'Executive Gold Pen', description: 'Sign hall passes and detention pardons.', icon: '✒️', category: 'tool', count: 1, actionType: 'equip', value: 60 },
        { id: 'gourmet_coffee', name: 'Lounge Espresso', description: 'Restores full stamina & HP.', icon: '☕', category: 'consumable', count: 3, actionType: 'heal', value: 15 },
      ];
    } else if (userProfile.role === 'delinquent') {
      startingItems = [
        { id: 'lockpick', name: 'Hairpin Lockpick', description: 'Search locked student lockers.', icon: '🪛', category: 'tool', count: 3, actionType: 'unlock', value: 10 },
        { id: 'boxing_gloves', name: 'Padded Hand Wraps', description: 'Increases punch knockback power.', icon: '🥊', category: 'weapon', count: 1, actionType: 'equip', value: 30 },
        { id: 'stink_bomb', name: 'Stink Bomb', description: 'Distracts hall monitors and teachers.', icon: '💣', category: 'consumable', count: 2, actionType: 'distract', value: 12 },
      ];
    } else {
      startingItems = [
        { id: 'hall_pass', name: 'Official Hall Pass', description: 'Shows hall monitors you are allowed in hallways.', icon: '🎫', category: 'key', count: 1, actionType: 'unlock', value: 10 },
        { id: 'crunchy_apple', name: 'Fresh Apple', description: 'Restores 25 Health.', icon: '🍎', category: 'consumable', count: 2, actionType: 'heal', value: 3 },
        { id: 'energy_soda', name: 'Energy Drink', description: 'Instantly refills 50 stamina.', icon: '🥤', category: 'consumable', count: 1, actionType: 'stamina', value: 4 },
        { id: 'quiz_study_guide', name: 'Study Notes', description: 'Guarantees hints on pop quizzes.', icon: '📓', category: 'quest', count: 1, actionType: 'equip', value: 15 },
      ];
    }
    setInventory(startingItems);

    setQuests([
      {
        id: 'q_explore_bell',
        giverId: 'school_guide',
        giverName: 'Campus Guide',
        title: 'Explore Bell School',
        description: 'Take the elevator to visit Floor 2 Cafeteria and Floor 9 Gymnasium.',
        floor: 2,
        targetType: 'explore',
        targetCount: 2,
        currentCount: 1,
        isCompleted: false,
        reward: { xp: 50, cash: 15, repType: 'nerd', repAmount: 5 },
      },
      {
        id: 'q_punch_bag',
        giverId: 'coach',
        giverName: 'Coach',
        title: 'Punching Bag Training',
        description: 'Test your punch combo on the gym punching bag or bullies (3 punches).',
        floor: 9,
        targetType: 'punch',
        targetCount: 3,
        currentCount: 0,
        isCompleted: false,
        reward: { xp: 40, cash: 10, repType: 'jock', repAmount: 10 },
      },
      {
        id: 'q_pass_quiz',
        giverId: 'teacher',
        giverName: 'Academic Council',
        title: 'Ace the Pop Quiz',
        description: 'Interact with a classroom blackboard on Floor 3 to pass the quiz.',
        floor: 3,
        targetType: 'quiz',
        targetCount: 1,
        currentCount: 0,
        isCompleted: false,
        reward: { xp: 60, cash: 20, repType: 'nerd', repAmount: 15 },
      },
    ]);

    setInGame(true);
    soundManager.playSchoolBell();
  };

  const handleAdvanceQuest = (targetType: string, count = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (!q.isCompleted && (q.targetType === targetType || targetType === 'any')) {
          const nextCount = q.currentCount + count;
          const isCompleted = nextCount >= q.targetCount;
          if (isCompleted && !q.isCompleted) {
            soundManager.playQuestComplete();
          }
          return { ...q, currentCount: nextCount, isCompleted };
        }
        return q;
      })
    );
  };

  // Mount Three.js 3D School World when inGame becomes true
  useEffect(() => {
    if (!inGame || !canvasMountRef.current || !profile) return;

    const world = new SchoolWorld(
      canvasMountRef.current,
      profile,
      settings,
      {
        onInteractPrompt: (inter, npc) => {
          setInteractable(inter);
          setNearbyNpc(npc);
        },
        onFloorChange: (newFloor) => {
          setCurrentFloor(newFloor);
        },
        onPlayerHpChange: (newHp) => {
          setHp(newHp);
        },
        onPlayerStaminaChange: (newStam) => {
          setStamina(newStam);
        },
        onTriggerEventNotification: (title, desc, floor) => {
          setActiveEvent({
            id: 'event_' + Date.now(),
            type: 'food_fight',
            title,
            description: desc,
            floor,
            activeUntil: Date.now() + 60000,
          });
        },
        onQuestProgress: (targetType, count = 1) => {
          handleAdvanceQuest(targetType, count);
        },
      }
    );

    worldRef.current = world;

    let lastTime = performance.now();
    let moveAnimId = 0;
    const updatePhysics = (now: number) => {
      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      if (worldRef.current) {
        worldRef.current.updateMovement(
          moveVecRef.current.x,
          moveVecRef.current.z,
          isRunning,
          delta
        );
      }
      moveAnimId = requestAnimationFrame(updatePhysics);
    };
    moveAnimId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(moveAnimId);
      world.destroy();
      worldRef.current = null;
    };
  }, [inGame, profile, settings]);

  // Classroom Period Progression Loop (Bell rings every ~75 seconds)
  useEffect(() => {
    if (!inGame) return;

    const periodTimer = setInterval(() => {
      setPeriodIndex((prev) => {
        const nextIdx = (prev + 1) % SCHOOL_SCHEDULE.length;
        const nextPeriod = SCHOOL_SCHEDULE[nextIdx];

        soundManager.playSchoolBell();

        setActiveEvent({
          id: 'bell_period_' + Date.now(),
          type: 'pop_quiz',
          title: `🔔 CLASS BELL: ${nextPeriod.name}`,
          description: `${nextPeriod.startTime} - Head to Floor ${nextPeriod.targetFloor} (${nextPeriod.roomName})!`,
          floor: nextPeriod.targetFloor,
          activeUntil: Date.now() + 60000,
        });

        return nextIdx;
      });
    }, 75000);

    return () => clearInterval(periodTimer);
  }, [inGame]);

  // Periodic Dynamic Events Roller (Christmas party, Food fight, Pop quiz)
  useEffect(() => {
    if (!inGame) return;

    if (settings.christmasEventRate > 0 && Math.random() * 100 < settings.christmasEventRate) {
      setTimeout(() => {
        soundManager.playChristmasJingle();
        setActiveEvent({
          id: 'christmas_party_' + Date.now(),
          type: 'christmas_party',
          title: '🎄 CHRISTMAS HOLIDAY CELEBRATION!',
          description: 'Festive Christmas trees & wrapped gift boxes placed on Floor 1 & Floor 2! Open your gifts!',
          floor: 1,
          activeUntil: Date.now() + 180000,
        });
      }, 3000);
    }

    const interval = setInterval(() => {
      const roll = Math.random() * 100;
      if (roll < settings.foodFightRate) {
        soundManager.playFoodSplat();
        setActiveEvent({
          id: 'food_fight_' + Date.now(),
          type: 'food_fight',
          title: '⚠️ CAFETERIA FOOD FIGHT!',
          description: 'Students are hurling mashed potatoes and apples on Floor 2!',
          floor: 2,
          activeUntil: Date.now() + 60000,
        });
      } else if (roll < settings.fireDrillRate) {
        if (worldRef.current) worldRef.current.triggerAlarmEvent(true);
        setActiveEvent({
          id: 'fire_drill_' + Date.now(),
          type: 'fire_drill',
          title: '🔥 EMERGENCY FIRE DRILL!',
          description: 'Alarms sounding! Evacuate to the Ground Floor (Floor 1) Playground immediately!',
          floor: 1,
          activeUntil: Date.now() + 60000,
        });
        setTimeout(() => {
          if (worldRef.current) worldRef.current.triggerAlarmEvent(false);
        }, 15000);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [inGame, settings]);

  // Player Actions
  const handlePunch = () => {
    if (worldRef.current) {
      worldRef.current.punch();
    }
  };

  const handleSit = () => {
    if (worldRef.current) {
      worldRef.current.toggleSit();
      setIsSitting(worldRef.current.isSitting);
    }
  };

  const handleToggleRun = () => {
    setIsRunning((prev) => !prev);
  };

  const handlePerformAction = (action: ActionDef) => {
    if (worldRef.current) {
      worldRef.current.playerMesh.performAction(action.animation);
    }
    if (action.cashDelta) {
      setCash((c) => c + action.cashDelta!);
    }
    setLastActionMessage(`Executed "${action.name}"!`);
    setTimeout(() => setLastActionMessage(null), 3500);
  };

  const handleUse = () => {
    if (!interactable) return;

    if (interactable.type === 'elevator') {
      setElevatorOpen(true);
      return;
    }

    if (interactable.type === 'blackboard') {
      setQuizOpen(true);
      return;
    }

    if (interactable.type === 'door') {
      soundManager.playPickupItem();
      setLastActionMessage('Opened classroom door!');
      setTimeout(() => setLastActionMessage(null), 2500);
      return;
    }

    if (interactable.type === 'seat' || interactable.type === 'bed') {
      handleSit();
      return;
    }

    if (interactable.type === 'vending_machine') {
      if (cash >= 2) {
        setCash((c) => c - 2);
        soundManager.playPickupItem();
        setInventory((prev) => [
          ...prev,
          {
            id: 'soda_' + Date.now(),
            name: 'Energy Soda',
            description: 'Ice-cold soda that refills 50 stamina.',
            icon: '🥤',
            category: 'consumable',
            count: 1,
            actionType: 'stamina',
            value: 4,
          },
        ]);
      }
      return;
    }

    if (interactable.type === 'gift_box') {
      soundManager.playPickupItem();
      soundManager.playChristmasJingle();
      setCash((c) => c + 10);
      setInventory((prev) => [
        ...prev,
        {
          id: 'holiday_gift_' + Date.now(),
          name: 'Holiday Secret Gift',
          description: 'A festive gift wrapped under the Bell School Christmas tree.',
          icon: '🎁',
          category: 'consumable',
          count: 1,
          actionType: 'heal',
          value: 25,
        },
      ]);
      return;
    }

    if (interactable.type === 'locker') {
      soundManager.playPickupItem();
      setCash((c) => c + 5);
      return;
    }

    if (interactable.type === 'piano') {
      soundManager.playChristmasJingle();
      return;
    }
  };

  const handleTalk = () => {
    if (nearbyNpc) {
      setDialogueNpc(nearbyNpc);
    }
  };

  const handleUseInventoryItem = (item: InventoryItem, index: number) => {
    if (item.actionType === 'heal') {
      setHp((h) => Math.min(maxHp, h + 30));
    } else if (item.actionType === 'stamina') {
      setStamina((s) => Math.min(maxStamina, s + 50));
    }
    soundManager.playPickupItem();

    setInventory((prev) => {
      const copy = [...prev];
      if (copy[index].count > 1) {
        copy[index] = { ...copy[index], count: copy[index].count - 1 };
      } else {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const handleDropInventoryItem = (index: number) => {
    setInventory((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleClaimQuestReward = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q) return;
    setCash((c) => c + q.reward.cash);
    soundManager.playQuestComplete();
    setQuests((prev) => prev.filter((item) => item.id !== questId));
  };

  const currentFloorDef = SCHOOL_FLOORS.find((f) => f.number === currentFloor) || SCHOOL_FLOORS[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Character Creator & School Selection Screen */}
      {!inGame && (
        <CharacterCreator
          onStartGame={handleStartGame}
          initialSettings={settings}
        />
      )}

      {/* 2. Three.js 3D Viewport Canvas Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 3. In-Game HUD Overlays */}
      {inGame && (
        <>
          {/* Top-Left: Player Identity & Health / Stamina Bars */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-xl">
              <div
                style={{ backgroundColor: profile?.appearance.shirtColor || '#2563eb' }}
                className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-lg shadow-sm"
              >
                {profile?.role === 'principal' ? '👑' : profile?.role === 'teacher' ? '📚' : profile?.role === 'janitor' ? '🧹' : '🎒'}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white">{profile?.name}</span>
                  <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-600/40">
                    {profile?.gradeName || profile?.role}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono font-bold">
                  <div className="flex items-center gap-1 text-rose-300">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        style={{ width: `${(hp / maxHp) * 100}%` }}
                        className="h-full bg-rose-500 transition-all duration-200"
                      />
                    </div>
                    <span>{Math.round(hp)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-cyan-300">
                    <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        style={{ width: `${(stamina / maxStamina) * 100}%` }}
                        className="h-full bg-cyan-400 transition-all duration-200"
                      />
                    </div>
                    <span>{Math.round(stamina)}</span>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-300 ml-1">
                    <DollarSign className="w-3 h-3 text-amber-400" />
                    <span>{cash}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top-Center: Live Classroom Period & Timetable Pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
            {/* Classroom Period Badge */}
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="bg-amber-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-400/50 shadow-xl flex items-center gap-2 hover:bg-amber-900 transition-all active:scale-95 group"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="font-mono text-xs font-black text-amber-300">
                {currentPeriod.startTime}
              </span>
              <span className="text-xs font-bold text-white group-hover:text-amber-200 truncate max-w-[200px]">
                {currentPeriod.name}
              </span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                F{currentPeriod.targetFloor}
              </span>
            </button>

            {/* Floor Navigation Button */}
            <button
              onClick={() => setElevatorOpen(true)}
              className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-sky-400/40 shadow-md flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-[11px] text-white">
                {currentFloorDef.name}
              </span>
              <span className="text-[10px] bg-sky-600/30 text-sky-300 px-1.5 rounded font-bold font-mono">
                ELEVATOR ▲▼
              </span>
            </button>
          </div>

          {/* Top-Right: Sound, Christmas & Settings */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            {settings.christmasEventRate > 0 && (
              <div className="bg-red-950/80 border border-red-500/50 text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/30">
                <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Christmas</span>
              </div>
            )}

            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                soundManager.setMuted(nextMuted);
              }}
              className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center justify-center shadow-lg transition-all active:scale-95"
              title="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center justify-center shadow-lg transition-all active:scale-95"
              title="Pause & Settings"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Action Notification Toast */}
          {lastActionMessage && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-amber-500 text-slate-950 font-black text-sm px-4 py-2 rounded-2xl shadow-2xl border-2 border-white animate-bounce">
              ✨ {lastActionMessage}
            </div>
          )}

          {/* Active Quests Tracker */}
          <QuestTracker
            quests={quests}
            onClaimReward={handleClaimQuestReward}
          />

          {/* Dynamic Events Banner */}
          <EventBanner
            event={activeEvent}
            onGoToFloor={(floor) => {
              if (worldRef.current) worldRef.current.loadFloor(floor);
              setActiveEvent(null);
            }}
            onDismiss={() => setActiveEvent(null)}
          />

          {/* Virtual Mobile Joystick + Action Buttons (PUNCH, SIT, RUN, USE, TALK, ACTION) */}
          <TouchControls
            onMove={(x, z) => {
              moveVecRef.current = { x, z };
            }}
            onPunch={handlePunch}
            onSit={handleSit}
            onToggleRun={handleToggleRun}
            onUse={handleUse}
            onTalk={handleTalk}
            onAction={() => setActionMenuOpen(true)}
            isRunning={isRunning}
            isSitting={isSitting}
            interactable={interactable}
            nearbyNpc={nearbyNpc}
          />

          {/* Inventory Hotbar & Backpack */}
          <InventoryBar
            items={inventory}
            selectedIndex={selectedSlotIndex}
            onSelectSlot={setSelectedSlotIndex}
            onUseItem={handleUseInventoryItem}
            onDropItem={handleDropInventoryItem}
          />

          {/* AI-Driven Action Menu (Bully, Cheating, Normal, Good) */}
          {actionMenuOpen && (
            <ActionMenuModal
              onSelectAction={handlePerformAction}
              onClose={() => setActionMenuOpen(false)}
            />
          )}

          {/* Classroom Times & Timetable Modal */}
          {scheduleModalOpen && (
            <ClassScheduleModal
              currentPeriodId={currentPeriod.id}
              onGoToPeriodFloor={(floor) => {
                if (worldRef.current) worldRef.current.loadFloor(floor);
              }}
              onClose={() => setScheduleModalOpen(false)}
            />
          )}

          {/* Interactive AI Dialogue Modal */}
          {dialogueNpc && profile && (
            <DialogueModal
              npc={dialogueNpc}
              playerRole={profile.role}
              playerName={profile.name}
              playerReputation={{ nerd: 50, jock: 50, rebel: 50, authority: 50 }}
              currentFloor={currentFloor}
              playerInventory={inventory}
              onClose={() => setDialogueNpc(null)}
              onGiveItem={(item) => {
                setInventory((prev) => prev.filter((i) => i.id !== item.id));
              }}
              onAcceptQuest={(npc) => {
                setQuests((prev) => [
                  ...prev,
                  {
                    id: 'quest_' + Date.now(),
                    giverId: npc.id,
                    giverName: npc.name,
                    title: `Favor for ${npc.name}`,
                    description: `Complete an errand for ${npc.name} on Floor ${npc.floor}.`,
                    floor: npc.floor,
                    targetType: 'any',
                    targetCount: 1,
                    currentCount: 0,
                    isCompleted: false,
                    reward: { xp: 45, cash: 12, repType: 'nerd', repAmount: 10 },
                  },
                ]);
              }}
            />
          )}

          {/* Campus Elevator Modal (12 Floors) */}
          {elevatorOpen && (
            <ElevatorModal
              currentFloor={currentFloor}
              onSelectFloor={(floor) => {
                if (worldRef.current) {
                  worldRef.current.loadFloor(floor);
                }
              }}
              onClose={() => setElevatorOpen(false)}
            />
          )}

          {/* Pop Quiz Blackboard Minigame */}
          {quizOpen && (
            <PopQuizModal
              onComplete={(passed, rewardScore) => {
                if (passed) {
                  setCash((c) => c + rewardScore * 5);
                  handleAdvanceQuest('quiz', 1);
                }
              }}
              onClose={() => setQuizOpen(false)}
            />
          )}

          {/* In-Game Settings Modal */}
          {settingsOpen && (
            <SettingsModal
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                soundManager.setVolume(newSettings.soundVolume);
                if (worldRef.current) {
                  worldRef.current.settings = newSettings;
                }
              }}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
