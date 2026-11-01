import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Flame, HelpCircle, Gift, ShieldAlert, Sparkles } from 'lucide-react';
import { NPCData, Role, Reputation, InventoryItem } from '../types/game';
import { requestNPCChat } from '../services/aiChat';
import { soundManager } from '../audio/soundManager';

interface DialogueModalProps {
  npc: NPCData;
  playerRole: Role;
  playerName: string;
  playerReputation: Reputation;
  currentFloor: number;
  playerInventory: InventoryItem[];
  onClose: () => void;
  onGiveItem: (item: InventoryItem) => void;
  onAcceptQuest: (npc: NPCData) => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  playerRole,
  playerName,
  playerReputation,
  currentFloor,
  playerInventory,
  onClose,
  onGiveItem,
  onAcceptQuest,
}) => {
  const [messages, setMessages] = useState<{ sender: 'player' | 'npc'; text: string }[]>([
    { sender: 'npc', text: npc.greeting },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);

  const handleSendMessage = async (msg: string, context?: string) => {
    if (!msg.trim() || loading) return;

    // Add player message
    setMessages((prev) => [...prev, { sender: 'player', text: msg }]);
    setInputText('');
    setLoading(true);

    try {
      const reply = await requestNPCChat({
        npc,
        playerRole,
        playerName,
        playerReputation,
        currentFloor,
        playerMessage: msg,
        actionContext: context,
      });

      setMessages((prev) => [...prev, { sender: 'npc', text: reply }]);
      soundManager.playFootstep(false);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'npc', text: `*${npc.name} considers your words carefully...*` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMoodBadge = () => {
    switch (npc.mood) {
      case 'friendly':
        return <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Friendly 😊</span>;
      case 'angry':
        return <span className="text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Angry 💢</span>;
      case 'annoyed':
        return <span className="text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Annoyed 🙄</span>;
      case 'suspicious':
        return <span className="text-purple-400 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">Suspicious 🧐</span>;
      default:
        return <span className="text-slate-300 bg-slate-800 border border-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">Neutral 😐</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: npc.appearance.shirtColor }}
              className="w-10 h-10 rounded-2xl border-2 border-white/20 flex items-center justify-center text-xl shadow-md"
            >
              {npc.role === 'bully' ? '🥊' : npc.role === 'teacher' ? '📚' : npc.role === 'janitor' ? '🧹' : npc.role === 'principal' ? '👑' : npc.role === 'nurse' ? '🩺' : '🎒'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base leading-tight">{npc.name}</h3>
                {getMoodBadge()}
              </div>
              <p className="text-xs text-sky-400 capitalize font-medium">{npc.personality}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                  m.sender === 'player'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>{npc.name} is responding...</span>
              </div>
            </div>
          )}
        </div>

        {/* Fast Action Choice Buttons */}
        <div className="px-4 py-2 bg-slate-850 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => handleSendMessage('Hello there! How is your day going?', 'friendly')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Heart className="w-3.5 h-3.5" /> Friendly Chat
          </button>

          <button
            onClick={() => handleSendMessage('You better stay out of my way or else!', 'punched')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Flame className="w-3.5 h-3.5" /> Taunt / Intimidate
          </button>

          <button
            onClick={() => {
              handleSendMessage('Do you have any jobs, quests, or rumors for me?', 'quest');
              onAcceptQuest(npc);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Ask Quest
          </button>

          <button
            onClick={() => setShowItemPicker((p) => !p)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 font-bold whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Gift className="w-3.5 h-3.5" /> Give Item
          </button>
        </div>

        {/* Item Picker Tray */}
        {showItemPicker && (
          <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex gap-2 overflow-x-auto">
            {playerInventory.length === 0 ? (
              <span className="text-xs text-slate-400 py-1">No items in inventory to give.</span>
            ) : (
              playerInventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onGiveItem(item);
                    handleSendMessage(`Here, I want you to have this ${item.name}!`, 'give_item');
                    setShowItemPicker(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-500 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <span>🎁</span>
                  <span>{item.name}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-slate-800/90 border-t border-slate-700 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder={`Say something to ${npc.name}...`}
            className="flex-1 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
