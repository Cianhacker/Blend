import { NPCData, Role, Reputation } from '../types/game';

interface ChatRequestParams {
  npc: NPCData;
  playerRole: Role;
  playerName: string;
  playerReputation: Reputation;
  currentFloor: number;
  playerMessage: string;
  actionContext?: string;
}

export async function requestNPCChat(params: ChatRequestParams): Promise<string> {
  const { npc, playerRole, playerName, playerReputation, currentFloor, playerMessage, actionContext } = params;

  try {
    const response = await fetch('/api/npc-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        npcName: npc.name,
        npcRole: npc.role,
        npcPersonality: npc.personality,
        npcMood: npc.mood,
        playerRole,
        playerName,
        playerReputation,
        currentFloor,
        playerMessage,
        actionContext,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    // Graceful fallback to procedural generation
  }

  // Procedural personality dialogue generator
  return getProceduralFallbackReply(npc, playerRole, playerMessage, actionContext);
}

function getProceduralFallbackReply(
  npc: NPCData,
  playerRole: Role,
  playerMessage: string,
  actionContext?: string
): string {
  const msgLower = playerMessage.toLowerCase();

  // If provoked or punched
  if (actionContext === 'punched' || msgLower.includes('fight') || msgLower.includes('punch') || msgLower.includes('shut up')) {
    if (npc.role === 'bully') {
      return `You think you can take on Spike?! Put your dukes up, pal! You're gonna regret stepping on my turf!`;
    }
    if (npc.role === 'teacher') {
      return `Violence on my floor?! That's an immediate one-way ticket to Floor 12 Detention! Cease this right now!`;
    }
    if (npc.role === 'principal') {
      return `Assault in my institution?! Your academic record will reflect this treasonous misconduct!`;
    }
    if (npc.role === 'janitor') {
      return `Hey! Don't you dare scuff up the floor I just waxed! Get lost before I grab my industrial broom!`;
    }
    return `Ouch! What is your problem?! I'm reporting you to the hall monitor!`;
  }

  // Friendly greeting
  if (actionContext === 'friendly' || msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('friend')) {
    if (npc.role === 'bully') {
      return `What do you want, softie? Unless you've got lunch money or chocolate milk, scram.`;
    }
    if (npc.role === 'teacher') {
      return `Good day, ${playerRole === 'student' ? 'student' : playerRole}. Keep up the diligent focus, midterms are looming!`;
    }
    if (npc.role === 'janitor') {
      return `Howdy. Watch your step, wet floor signs don't lie. Say, you haven't seen any stray chewing gum, have ya?`;
    }
    if (npc.role === 'principal') {
      return `Greetings. Excellence, integrity, and discipline—remember our motto on every floor of this school.`;
    }
    if (npc.role === 'nurse') {
      return `Hello dear! Feeling dizzy, bruised, or exhausted? Hop on the examination bed and I'll patch you up in a flash.`;
    }
    if (npc.role === 'cook') {
      return `Fresh mystery stew is simmering! High protein, guaranteed to keep you moving through 6th period!`;
    }
    if (npc.role === 'hall_monitor') {
      return `Where's your hall pass?! Wait... you look calm. Just keep your pace at a brisk walk—NO RUNNING!`;
    }
    return `Hey there! Floor ${npc.floor} is bustling today. Did you hear about the rumors going on?`;
  }

  // Quests & rumors
  if (actionContext === 'quest' || msgLower.includes('quest') || msgLower.includes('help') || msgLower.includes('job')) {
    if (npc.role === 'janitor') {
      return `I've got a chore if you're eager for lunch tokens: someone spilled green slime over near the lockers. Wipe it up for me!`;
    }
    if (npc.role === 'teacher') {
      return `I require an assistant to verify the Pop Quiz questions on the blackboard. Pass it and I will boost your academic score.`;
    }
    if (npc.role === 'bully') {
      return `Fetch me a chilled Energy Soda from the cafeteria vending machines on Floor 2, and maybe I won't lock you in a locker.`;
    }
    if (npc.role === 'principal') {
      return `I need an honest soul to inspect the facilities and report any delinquent behavior on Floor 9 or 12.`;
    }
    return `Actually, I lost my study notes on the Library floor (Floor 7). If you find them, I'll pay you well!`;
  }

  // Item given
  if (actionContext === 'give_item') {
    return `Wow, thanks! This will really come in handy today. You're alright in my book!`;
  }

  // General Role-Based response
  switch (npc.role) {
    case 'bully':
      return `You got a problem with me or you just looking for a knuckle sandwich?`;
    case 'teacher':
      return `Class is in session shortly. Make sure your textbooks are open to Chapter 8.`;
    case 'janitor':
      return `40 years sweeping these 12 floors. If walls could talk, they'd ask for a mop.`;
    case 'principal':
      return `My office door is always open—unless you're on your way to detention.`;
    case 'hall_monitor':
      return `Hall rules: Section 4-B. No loitering, no skateboarding, and keep voices below 40 decibels!`;
    default:
      return `School days go by fast when you're busy exploring all 12 floors!`;
  }
}
