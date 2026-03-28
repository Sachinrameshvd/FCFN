import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    category: string;
    vendor_type: 'street' | 'supermarket';
    zone: string;
  }) => Promise<void>;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Vegetable',
    vendor_type: 'street' as 'street' | 'supermarket',
    zone: 'middle'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    setIsProcessing(true);
    await onAdd(newItem);
    
    setNewItem({
      name: '',
      category: 'Vegetable',
      vendor_type: 'street',
      zone: 'middle'
    });
    setIsProcessing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-panel w-full max-w-md p-8 relative z-10 border-fridge-accent/30"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-fridge-accent" />
              Manual Entry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Item Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Mango, Curd, Spinach"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-fridge-accent transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Category</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-fridge-accent transition-colors appearance-none"
                  >
                    {['Vegetable', 'Fruit', 'Dairy', 'Greens', 'Meat', 'Bakery'].map(cat => (
                      <option key={cat} value={cat} className="bg-fridge-bg">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Vendor Type</label>
                  <select 
                    value={newItem.vendor_type}
                    onChange={(e) => setNewItem({...newItem, vendor_type: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-fridge-accent transition-colors appearance-none"
                  >
                    <option value="street" className="bg-fridge-bg">Street Vendor</option>
                    <option value="supermarket" className="bg-fridge-bg">Supermarket</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 mb-1 block">Storage Zone</label>
                <div className="grid grid-cols-3 gap-2">
                  {['front', 'middle', 'back'].map(z => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setNewItem({...newItem, zone: z})}
                      className={cn(
                        "py-2 rounded-lg text-[10px] font-mono uppercase border transition-all",
                        newItem.zone === z ? "bg-fridge-accent border-fridge-accent text-fridge-bg font-bold" : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
                      )}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="flex-2 py-4 rounded-xl bg-fridge-accent text-fridge-bg font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isProcessing ? "Adding..." : "Add to Inventory"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
