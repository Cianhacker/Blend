import React, { useState, useEffect } from 'react';
import { Package, X, Check, Trash2, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface InventoryBarProps {
  items: InventoryItem[];
  selectedIndex: number;
  onSelectSlot: (index: number) => void;
  onUseItem: (item: InventoryItem, index: number) => void;
  onDropItem: (index: number) => void;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  items,
  selectedIndex,
  onSelectSlot,
  onUseItem,
  onDropItem,
}) => {
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<{ item: InventoryItem; index: number } | null>(null);

  // Quick slot keyboard shortcuts [1-6]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        onSelectSlot(num - 1);
      } else if (e.code === 'KeyB' || e.code === 'KeyI') {
        setBackpackOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectSlot]);

  // 6 hotbar slots
  const hotbarSlots = Array.from({ length: 6 }).map((_, i) => items[i] || null);

  const getItemEmoji = (item: InventoryItem | null) => {
    if (!item) return '';
    if (item.category === 'weapon') return '🥊';
    if (item.category === 'key') return '🔑';
    if (item.id.includes('soda')) return '🥤';
    if (item.id.includes('gift')) return '🎁';
    if (item.id.includes('pass')) return '🎫';
    if (item.id.includes('mop')) return '🧹';
    if (item.id.includes('book') || item.id.includes('quiz')) return '📓';
    if (item.id.includes('apple')) return '🍎';
    if (item.id.includes('ice')) return '🧊';
    return '📦';
  };

  return (
    <>
      {/* Bottom Center Hotbar Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-md">
        {/* Backpack Toggle Button */}
        <button
          onClick={() => setBackpackOpen(true)}
          className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex flex-col items-center justify-center border border-slate-600 transition-all active:scale-95"
          title="Open Backpack (Key: B or I)"
        >
          <Package className="w-5 h-5" />
          <span className="text-[9px] font-bold text-slate-300">BAG</span>
        </button>

        <div className="h-8 w-[1px] bg-slate-700 mx-0.5" />

        {/* 6 Quick Hotbar Slots */}
        {hotbarSlots.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              onClick={() => {
                onSelectSlot(index);
              }}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all active:scale-95 ${
                isSelected
                  ? 'bg-sky-600/90 text-white ring-2 ring-sky-300 scale-105 shadow-md shadow-sky-500/30'
                  : item
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/70'
                  : 'bg-slate-900/50 border border-dashed border-slate-700 text-slate-600'
              }`}
              title={item ? `${item.name} (${item.description}) - Click to select` : `Slot ${index + 1}`}
            >
              {/* Slot Number Badge */}
              <span className="absolute top-0.5 left-1 text-[9px] font-mono text-slate-400">
                {index + 1}
              </span>

              {/* Item Emoji / Icon */}
              {item && <span>{getItemEmoji(item)}</span>}

              {/* Item Count */}
              {item && item.count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[10px] font-black bg-slate-950/80 text-amber-300 px-1 rounded-sm">
                  x{item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Dedicated USE ITEM Button for the currently selected item */}
        {hotbarSlots[selectedIndex] && (
          <>
            <div className="h-8 w-[1px] bg-slate-700 mx-0.5" />
            <button
              onClick={() => {
                const item = hotbarSlots[selectedIndex];
                if (item) onUseItem(item, selectedIndex);
              }}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 animate-pulse"
              title={`Use selected item ${hotbarSlots[selectedIndex]?.name} (Key: E)`}
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <div className="text-left">
                <span className="block text-[8px] font-mono text-emerald-100 uppercase tracking-wider">
                  USE ITEM [E]
                </span>
                <span className="block text-xs font-bold truncate max-w-[85px]">
                  {hotbarSlots[selectedIndex]?.name}
                </span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Selected Item Tooltip Pill above Hotbar */}
      {hotbarSlots[selectedIndex] && (
        <div className="absolute bottom-[4.8rem] left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-200 flex items-center gap-2 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-1">
          <span className="text-sm">{getItemEmoji(hotbarSlots[selectedIndex])}</span>
          <span className="font-bold text-sky-300">{hotbarSlots[selectedIndex]?.name}</span>
          <span className="text-slate-400 hidden sm:inline">• {hotbarSlots[selectedIndex]?.description}</span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
            [E] USE ITEM
          </span>
        </div>
      )}

      {/* Full Backpack Modal */}
      {backpackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="w-6 h-6 text-sky-400" />
                <h3 className="text-lg font-black tracking-wide">STUDENT BACKPACK</h3>
              </div>
              <button
                onClick={() => setBackpackOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-4 gap-3 flex-1">
              {items.map((item, idx) => (
                <button
                  key={item.id + idx}
                  onClick={() => setDetailItem({ item, index: idx })}
                  className={`p-3 rounded-2xl flex flex-col items-center text-center transition-all border ${
                    detailItem?.index === idx
                      ? 'bg-sky-900/60 border-sky-400 ring-2 ring-sky-300'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="text-3xl mb-1">{getItemEmoji(item)}</div>
                  <span className="text-xs font-bold line-clamp-1">{item.name}</span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    {item.count > 1 ? `x${item.count}` : item.category}
                  </span>
                </button>
              ))}

              {items.length === 0 && (
                <div className="col-span-4 text-center py-12 text-slate-400">
                  <p>Your backpack is empty.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Search lockers, visit vending machines, or talk to NPCs to earn items!
                  </p>
                </div>
              )}
            </div>

            {/* Selected Item Detail Footer */}
            {detailItem && (
              <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                    <span>{getItemEmoji(detailItem.item)}</span>
                    {detailItem.item.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">{detailItem.item.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onUseItem(detailItem.item, detailItem.index);
                      soundManager.playPickupItem();
                      setDetailItem(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> USE
                  </button>
                  <button
                    onClick={() => {
                      onDropItem(detailItem.index);
                      setDetailItem(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DROP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
