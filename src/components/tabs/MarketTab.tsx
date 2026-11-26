import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Share2, 
  Send, 
  Copy, 
  CheckCircle2, 
  Zap, 
  Clock, 
  MapPin, 
  X,
  Minus
} from 'lucide-react';
import { ForecastWidget, type Forecast } from '../ForecastWidget';
import confetti from 'canvas-confetti';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  reason: string;
  urgency: 'High' | 'Medium' | 'Low';
  unitPrice: number;
  quantity: number;
  unit: string;
  isChecked?: boolean;
}

interface MarketCommodity {
  item: string;
  market: string;
  price: string;
  priceNum: number;
  change: string;
  trend: 'drop' | 'rise' | 'stable';
  note: string;
  sparkline: number[]; // 7 days of price points for visual mini-chart
  category: 'veg' | 'greens' | 'dairy' | 'fruit';
}

interface MarketTabProps {
  shoppingList?: any[];
  marketTrends?: any[];
  forecasts?: any[];
  isProcessing?: boolean;
  onSyncExpired?: () => void;
  onDeleteShopping?: (id: string | number) => void;
  onRestockItem?: (item: { name: string; category: string; zone: string }) => void;
}

const DEFAULT_MARKET_TRENDS: MarketCommodity[] = [
  {
    item: 'Country Tomatoes',
    market: 'Koyambedu Wholesale',
    price: '₹28/kg',
    priceNum: 28,
    change: '-18%',
    trend: 'drop',
    note: 'Surplus harvest trucks from Salem & Dharmapuri arrived this morning.',
    sparkline: [38, 36, 35, 32, 30, 29, 28],
    category: 'veg'
  },
  {
    item: 'Palak / Spinach',
    market: 'Uzhavar Sandhai',
    price: '₹20/bunch',
    priceNum: 20,
    change: '+12%',
    trend: 'rise',
    note: 'Rain in Hosur reduced fresh arrivals; prices expected to ease by Monday.',
    sparkline: [16, 16, 18, 18, 19, 20, 20],
    category: 'greens'
  },
  {
    item: 'Shallots (Small Onions)',
    market: 'Koyambedu Wholesale',
    price: '₹55/kg',
    priceNum: 55,
    change: '-10%',
    trend: 'drop',
    note: 'Heavy harvest inflow from Perambalur; great wholesale rate for sambar.',
    sparkline: [68, 65, 62, 60, 58, 56, 55],
    category: 'veg'
  },
  {
    item: 'Purple Brinjal',
    market: 'Mylapore Rythu Bazar',
    price: '₹30/kg',
    priceNum: 30,
    change: '0%',
    trend: 'stable',
    note: 'Consistent daily supply from local Chengalpattu farmers.',
    sparkline: [30, 30, 31, 30, 30, 30, 30],
    category: 'veg'
  },
  {
    item: 'Robusta Bananas',
    market: 'Koyambedu Wholesale',
    price: '₹40/dozen',
    priceNum: 40,
    change: '-15%',
    trend: 'drop',
    note: 'Trichy banana mandi supply peaking; recommended for daily smoothies.',
    sparkline: [50, 48, 46, 45, 42, 40, 40],
    category: 'fruit'
  },
  {
    item: 'Aavin Toned Milk',
    market: 'Aavin Milk Parlor',
    price: '₹25/500ml',
    priceNum: 25,
    change: '0%',
    trend: 'stable',
    note: 'Standard state cooperative fixed pricing.',
    sparkline: [25, 25, 25, 25, 25, 25, 25],
    category: 'dairy'
  }
];

const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Aavin Toned Milk',
    category: 'Dairy',
    reason: 'Depletes in 14h (household consumption peaking)',
    urgency: 'High',
    unitPrice: 25,
    quantity: 2,
    unit: 'packets'
  },
  {
    id: 'shop-2',
    name: 'Salem Country Tomatoes',
    category: 'Vegetable',
    reason: '18% Price drop at Koyambedu wholesale today',
    urgency: 'Medium',
    unitPrice: 28,
    quantity: 1,
    unit: 'kg'
  },
  {
    id: 'shop-3',
    name: 'Fresh Coriander Bunch',
    category: 'Greens',
    reason: 'Current bunch at day 3 maturity',
    urgency: 'Medium',
    unitPrice: 15,
    quantity: 1,
    unit: 'bunch'
  },
  {
    id: 'shop-4',
    name: 'Small Onions / Shallots',
    category: 'Vegetable',
    reason: 'Low stock in vegetable crisper',
    urgency: 'Low',
    unitPrice: 55,
    quantity: 1,
    unit: 'kg'
  }
];

const getItemEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('milk')) return '🥛';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('coriander') || n.includes('spinach') || n.includes('keerai') || n.includes('palak')) return '🌿';
  if (n.includes('onion') || n.includes('shallot')) return '🧅';
  if (n.includes('brinjal') || n.includes('eggplant')) return '🍆';
  if (n.includes('banana')) return '🍌';
  if (n.includes('apple')) return '🍎';
  if (n.includes('paneer') || n.includes('cheese')) return '🧀';
  return '🥗';
};

export const MarketTab: React.FC<MarketTabProps> = ({ 
  shoppingList, 
  marketTrends, 
  forecasts = [],
  isProcessing = false, 
  onSyncExpired, 
  onDeleteShopping,
  onRestockItem
}) => {
  const [itemsList, setItemsList] = useState<ShoppingItem[]>(INITIAL_SHOPPING_ITEMS);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetable');
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState<'all' | 'drops' | 'greens' | 'dairy'>('all');
  
  // Modals & Feedback
  const [copiedToast, setCopiedToast] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Cart calculations
  const totalCartCost = itemsList.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name: newItemText.trim(),
      category: newItemCategory,
      reason: 'Manually queued by homeowner',
      urgency: 'Medium',
      unitPrice: 30,
      quantity: 1,
      unit: 'kg'
    };

    setItemsList([newItem, ...itemsList]);
    setNewItemText('');
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#10b981']
    });
  };

  const handleAddCommodityToCart = (c: MarketCommodity) => {
    const existing = itemsList.find(i => i.name.toLowerCase().includes(c.item.toLowerCase()));
    if (existing) {
      setItemsList(itemsList.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      const newItem: ShoppingItem = {
        id: `shop-${Date.now()}`,
        name: c.item,
        category: c.category === 'veg' ? 'Vegetable' : c.category === 'greens' ? 'Greens' : c.category === 'dairy' ? 'Dairy' : 'Fruit',
        reason: `${c.change} rate drop at ${c.market}`,
        urgency: c.trend === 'drop' ? 'High' : 'Medium',
        unitPrice: c.priceNum,
        quantity: 1,
        unit: c.item.includes('Milk') ? 'packets' : c.item.includes('Spinach') || c.item.includes('Coriander') ? 'bunch' : 'kg'
      };
      setItemsList([newItem, ...itemsList]);
    }
    confetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.65 },
      colors: ['#10b981', '#f59e0b']
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItemsList(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const handleToggleCheck = (id: string) => {
    setItemsList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    }));
  };

  const handleRemove = (id: string) => {
    setItemsList(itemsList.filter(item => item.id !== id));
    if (onDeleteShopping) onDeleteShopping(id);
  };

  // 1-Click WhatsApp Checklist Generator
  const handleCopyWhatsApp = () => {
    const header = `🛒 *Smart Fridge Restock List* (FedCausalFreshNet)\n📅 ${new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}\n\n`;
    const itemsText = itemsList.map(i => `${i.isChecked ? '✅' : '⬜'} *${i.name}* — ${i.quantity} ${i.unit} (₹${i.unitPrice * i.quantity})`).join('\n');
    const footer = `\n\n💰 *Estimated Total: ₹${totalCartCost}*\n📍 Rates verified via Koyambedu & Uzhavar Sandhai.`;
    
    navigator.clipboard.writeText(header + itemsText + footer);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2800);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#10b981', '#ffffff']
    });
  };

  // Instant Delivery Simulation
  const handleSimulateDelivery = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderComplete(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#10b981', '#f59e0b']
      });
      setTimeout(() => {
        setOrderComplete(false);
        setShowDeliveryModal(false);
      }, 3000);
    }, 1800);
  };

  // Filtered market trends
  const filteredTrends = DEFAULT_MARKET_TRENDS.filter(c => {
    if (selectedCommodityFilter === 'all') return true;
    if (selectedCommodityFilter === 'drops') return c.trend === 'drop';
    if (selectedCommodityFilter === 'greens') return c.category === 'greens' || c.category === 'veg';
    if (selectedCommodityFilter === 'dairy') return c.category === 'dairy' || c.category === 'fruit';
    return true;
  });

  return (
    <motion.div 
      id="market-tab"
      key="market"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* =========================================================================
          1. "DEAL OF THE DAY" / FLASH WHOLESALE SAVINGS HERO BANNER
          ========================================================================= */}
      <div className="glass-panel p-6 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-emerald-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Flash Wholesale Drop
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Koyambedu Live Telemetry
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Salem Country Tomatoes Down to ₹28/kg (-18%)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Surplus truck arrivals from Salem &amp; Dharmapuri. Best day this month to stock up 2-3 kg for curries, rasam, and long-term Thokku.
            </p>
          </div>
        </div>

        {/* Action Button inside Hero */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => handleAddCommodityToCart(DEFAULT_MARKET_TRENDS[0])}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add 1 kg to Restock List (₹28)</span>
          </button>

          {onSyncExpired && (
            <button 
              onClick={onSyncExpired}
              disabled={isProcessing}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Auto-Sync Low Produce</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. HOUSEHOLD DEPLETION VELOCITY (FUEL TANK STYLE GAUGES)
          ========================================================================= */}
      <div className="glass-panel p-6 border-white/10">
        <ForecastWidget 
          forecasts={forecasts} 
          onAddToList={(item) => {
            const newItem: ShoppingItem = {
              id: `shop-${Date.now()}`,
              name: item.name,
              category: item.category,
              reason: item.reason,
              urgency: 'High',
              unitPrice: item.price,
              quantity: 1,
              unit: item.name.includes('Milk') ? 'packets' : 'kg'
            };
            setItemsList([newItem, ...itemsList]);
            confetti({
              particleCount: 30,
              spread: 40,
              origin: { y: 0.7 },
              colors: ['#f59e0b', '#10b981']
            });
          }}
        />
      </div>

      {/* =========================================================================
          3. MAIN SPLIT: SMART INTERACTIVE GROCERY CART VS REGIONAL MANDI COMMODITIES
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE SMART SHOPPING CART (6 COLS) */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between space-y-5">
          <div>
            {/* Header Strip */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Smart Auto-Replenishment Cart</h3>
                  <p className="text-xs text-slate-400">Calculates household restock quantities &amp; price</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">ESTIMATED BILL</span>
                <span className="text-lg font-bold font-mono text-cyan-300">₹{totalCartCost}</span>
              </div>
            </div>

            {/* Quick Add Custom Item Form */}
            <form onSubmit={handleAddItem} className="flex gap-2 my-4">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add produce (e.g., Gingelly Oil, Green Chillies)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="Vegetable">Veg</option>
                <option value="Greens">Greens</option>
                <option value="Dairy">Dairy</option>
                <option value="Fruit">Fruit</option>
                <option value="Pantry">Pantry</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono uppercase flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            {/* Interactive Shopping Items List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {itemsList.map((item) => {
                const subtotal = item.unitPrice * item.quantity;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      item.isChecked 
                        ? 'bg-slate-950/40 border-white/5 opacity-50' 
                        : 'bg-slate-900/70 border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    {/* Checkbox & Details */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleCheck(item.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          item.isChecked 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                            : 'border-slate-600 hover:border-cyan-400'
                        }`}
                      >
                        {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="text-2xl">{getItemEmoji(item.name)}</div>

                      <div>
                        <div className={`font-semibold text-xs transition-colors ${
                          item.isChecked ? 'line-through text-slate-500' : 'text-white group-hover:text-cyan-300'
                        }`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>₹{item.unitPrice}/{item.unit.includes('pack') ? 'pack' : 'kg'}</span>
                          <span>•</span>
                          <span className="text-slate-500 truncate max-w-[210px]">{item.reason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-950/80 rounded-xl border border-white/10 p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right w-14">
                        <div className="text-xs font-mono font-bold text-cyan-300">₹{subtotal}</div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{item.unit}</span>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-white/5"
                        title="Remove from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* WhatsApp Export Button */}
            <button
              onClick={handleCopyWhatsApp}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
            >
              {copiedToast ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy WhatsApp List'}</span>
            </button>

            {/* Quick Delivery Checkout */}
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4" />
              <span>Order via Zepto / Blinkit (10m) →</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REGIONAL MANDI COMMODITY PRICE INDICES (6 COLS) */}
        <div className="lg:col-span-6 glass-card p-6 flex flex-col justify-between space-y-5">
          <div>
            {/* Header Strip & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Regional Mandi Price Indices</h3>
                  <p className="text-xs text-slate-400">Live wholesale telemetry across Chennai markets</p>
                </div>
              </div>

              {/* Commodity Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'drops', label: '🔥 Best Drops' },
                  { id: 'greens', label: 'Greens & Veg' },
                  { id: 'dairy', label: 'Dairy & Fruit' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedCommodityFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      selectedCommodityFilter === f.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Commodity Price Cards with Visual Sparklines */}
            <div className="space-y-3 mt-4 max-h-[440px] overflow-y-auto pr-1">
              {filteredTrends.map((c, idx) => {
                const isDrop = c.trend === 'drop';
                const isRise = c.trend === 'rise';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getItemEmoji(c.item)}</span>
                        <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                          {c.item}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                          {c.market}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                        {c.note}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {/* Mini 7-Day Sparkline SVG */}
                      <div className="flex flex-col items-end">
                        <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 20">
                          <polyline
                            fill="none"
                            stroke={isDrop ? '#10b981' : isRise ? '#f43f5e' : '#94a3b8'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={c.sparkline.map((val, i) => {
                              const x = (i / 6) * 60;
                              // Normalize points between 2 and 18
                              const min = Math.min(...c.sparkline);
                              const max = Math.max(...c.sparkline);
                              const range = max - min || 1;
                              const y = 18 - ((val - min) / range) * 14;
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </svg>
                        <span className="text-[9px] font-mono text-slate-500">7-Day Trend</span>
                      </div>

                      {/* Current Rate & Recommendation */}
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          {c.price}
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          isDrop
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isRise
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {isDrop ? (
                            <>
                              <TrendingDown className="w-2.5 h-2.5" />
                              <span>{c.change} BUY NOW</span>
                            </>
                          ) : isRise ? (
                            <>
                              <TrendingUp className="w-2.5 h-2.5" />
                              <span>{c.change} PEAK RATE</span>
                            </>
                          ) : (
                            <span>STABLE</span>
                          )}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddCommodityToCart(c)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all border border-white/10"
                        title="Add to shopping cart"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5" /> Direct APMC Mandi Wire active
            </span>
            <span className="text-slate-400 text-[11px]">
              Auto-refreshed every morning at 05:30 AM
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. INSTANT DELIVERY (ZEPTO / BLINKIT) SIMULATION MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showDeliveryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel p-6 md:p-8 max-w-lg w-full border-cyan-500/40 bg-[#0d1321] text-white space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Instant Restock Dispatch</h3>
                  <p className="text-xs text-slate-400">Connected to 10-minute dark stores across Chennai</p>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {itemsList.map(i => (
                  <div key={i.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{getItemEmoji(i.name)}</span>
                      <span className="font-semibold text-white">{i.name}</span>
                      <span className="text-slate-400 text-[11px]">x {i.quantity}</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">₹{i.unitPrice * i.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Delivery ETA & Bill */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Guaranteed ETA</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4" /> 11 Minutes (Anna Nagar Hub)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Order Total</div>
                  <div className="text-lg font-bold font-mono text-white">₹{totalCartCost}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {orderComplete ? (
                  <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="font-bold text-emerald-300 text-sm">Order Dispatched Successfully!</div>
                    <p className="text-xs text-slate-300">Driver assigned. Produce will be placed in your fridge within 11 minutes.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateDelivery}
                    disabled={isOrdering}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                  >
                    {isOrdering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Transmitting to Zepto API...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Confirm 10-Minute Dispatch (₹{totalCartCost})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
