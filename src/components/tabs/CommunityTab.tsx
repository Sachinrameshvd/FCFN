import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  LayoutGrid, 
  Activity, 
  Store, 
  Share2, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  MessageCircle, 
  Heart, 
  Check, 
  X, 
  Award, 
  Navigation,
  ArrowRight,
  HandHeart,
  HelpCircle,
  Send,
  Zap,
  CheckCheck,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { CommunityHealth } from '../CommunityHealth';
import { VendorMap } from '../VendorMap';
import type { FridgeItem } from '../../services/geminiService';

interface CommunityTabProps {
  communityBoard: any[];
  fridgeItems?: FridgeItem[];
  onShareItem?: (item: FridgeItem) => void;
}

interface NormalizedSurplus {
  id: string;
  name: string;
  donor: string;
  distance: string;
  time: string;
  expiry: string;
  note: string;
  category: string;
  status: string;
  emoji: string;
  otp: string;
}

interface CommunityRequest {
  id: string;
  item_needed: string;
  requester: string;
  location: string;
  urgency: string;
  reason: string;
  status: 'pending' | 'fulfilled' | 'completed';
  fulfilled_by?: string | null;
  responder_note?: string | null;
  created_at?: string;
  emoji?: string;
}

const DEFAULT_SURPLUS_ITEMS: NormalizedSurplus[] = [
  {
    id: 'comm-1',
    name: 'Fresh Country Tomatoes (1.2 kg)',
    donor: 'Plot 02 · Kotturpuram',
    distance: '350m away · 4m walk',
    time: 'Posted 2h ago',
    expiry: 'Expires in 4 days',
    note: 'Harvested from rooftop terrace garden this morning. Excess quantity, free for any neighbor.',
    category: 'Garden Harvest',
    status: 'Available',
    emoji: '🍅',
    otp: '#8492'
  },
  {
    id: 'comm-2',
    name: 'Tender Drumsticks / Murungakkai (6 nos)',
    donor: 'Plot 01 · Anna Nagar',
    distance: '800m away · 8m walk',
    time: 'Posted 4h ago',
    expiry: 'Expires in 6 days',
    note: 'Freshly cut today from home tree. Crisp, sweet, and tender. Great for evening sambar.',
    category: 'Garden Harvest',
    status: 'Available',
    emoji: '🥒',
    otp: '#3921'
  },
  {
    id: 'comm-3',
    name: 'Aavin Toned Milk (500ml Unopened)',
    donor: 'Plot 05 · Velachery',
    distance: '1.1km away · 12m walk',
    time: 'Posted 5h ago',
    expiry: 'Expires in 2 days',
    note: 'Traveling for 3 days for work. Unopened chilled packet sitting in Top Chiller, ready for porch pickup.',
    category: 'Chilled Dairy',
    status: 'Available',
    emoji: '🥛',
    otp: '#7164'
  },
  {
    id: 'comm-4',
    name: 'Palak Spinach (2 Bunches)',
    donor: 'Plot 03 · Besant Nagar',
    distance: '450m away · 5m walk',
    time: 'Posted 1h ago',
    expiry: 'Expires in 3 days',
    note: 'Washed and pre-chilled in DoWhy back airflow zone. Extremely crisp and fresh.',
    category: 'Greens',
    status: 'Available',
    emoji: '🥬',
    otp: '#5290'
  }
];

const DEFAULT_REQUESTS: CommunityRequest[] = [
  {
    id: 'req-1',
    item_needed: '2 Fresh Lemons & Ginger Piece',
    requester: 'Plot 04 · Adyar (Flat 2B)',
    location: 'Adyar, Chennai',
    urgency: 'Urgent (Cooking Now!)',
    reason: 'Making evening rasam & ginger lemon tea, ran out of lemons mid-cooking!',
    status: 'fulfilled',
    fulfilled_by: 'Plot 02 · Kotturpuram (Lakshmi)',
    responder_note: 'I have extra country lemons from my terrace tree! Kept 3 on the shoe rack outside Flat 2B.',
    created_at: '25m ago',
    emoji: '🍋'
  },
  {
    id: 'req-2',
    item_needed: '1 Packet Natural Set Curd (500ml)',
    requester: 'Plot 01 · Anna Nagar (Priya)',
    location: 'Anna Nagar, Chennai',
    urgency: 'Urgent (Cooking Now!)',
    reason: 'Need for dinner curd rice, supermarket delivery delayed by 45 minutes.',
    status: 'pending',
    fulfilled_by: null,
    responder_note: null,
    created_at: '12m ago',
    emoji: '🥣'
  },
  {
    id: 'req-3',
    item_needed: 'Few Stems of Fresh Mint (Pudina)',
    requester: 'Plot 03 · Besant Nagar (Karthik)',
    location: 'Besant Nagar, Chennai',
    urgency: 'Sometime Today',
    reason: 'Garnishing biryani tonight, nearby vendor was out of fresh mint.',
    status: 'pending',
    fulfilled_by: null,
    responder_note: null,
    created_at: '45m ago',
    emoji: '🌿'
  }
];

const getEmojiForName = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('lemon')) return '🍋';
  if (n.includes('curd') || n.includes('yogurt') || n.includes('buttermilk')) return '🥣';
  if (n.includes('mint') || n.includes('pudina') || n.includes('coriander') || n.includes('curry')) return '🌿';
  if (n.includes('ginger') || n.includes('garlic')) return '🫚';
  if (n.includes('chilli') || n.includes('pepper')) return '🌶️';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('drumstick') || n.includes('murungai')) return '🥒';
  if (n.includes('milk') || n.includes('dairy')) return '🥛';
  if (n.includes('spinach') || n.includes('palak') || n.includes('keerai') || n.includes('greens')) return '🥬';
  if (n.includes('banana')) return '🍌';
  if (n.includes('brinjal') || n.includes('eggplant')) return '🍆';
  if (n.includes('onion') || n.includes('shallot')) return '🧅';
  if (n.includes('mango') || n.includes('apple')) return '🍎';
  return '🥗';
};

export const CommunityTab: React.FC<CommunityTabProps> = ({ 
  communityBoard, 
  fridgeItems = [], 
  onShareItem 
}) => {
  // Navigation & Sub-tab View
  const [activeView, setActiveView] = useState<'board' | 'health' | 'vendors'>('board');
  const [exchangeMode, setExchangeMode] = useState<'surplus' | 'requests'>('requests'); // default to requests to immediately highlight feature

  // Surplus Sharing state
  const [selectedSurplusFilter, setSelectedSurplusFilter] = useState<'all' | 'garden' | 'dairy' | 'nearby'>('all');
  const [claimedSurplusIds, setClaimedSurplusIds] = useState<string[]>([]);
  const [activePickupPass, setActivePickupPass] = useState<NormalizedSurplus | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedResponseMsg, setCopiedResponseMsg] = useState(false);

  // Custom surplus share form state
  const [selectedFridgeItemId, setSelectedFridgeItemId] = useState<string>('');
  const [shareNote, setShareNote] = useState<string>('Leaving town for a few days, free for neighbors!');
  const [shareLocation, setShareLocation] = useState<string>('Plot 04 · Adyar (Flat 2B)');

  // Requests state (Two-Way Wishlist)
  const [requests, setRequests] = useState<CommunityRequest[]>(DEFAULT_REQUESTS);
  const [selectedRequestFilter, setSelectedRequestFilter] = useState<'all' | 'urgent' | 'pending' | 'fulfilled'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [respondingToRequest, setRespondingToRequest] = useState<CommunityRequest | null>(null);

  // New Request Form state
  const [reqItemNeeded, setReqItemNeeded] = useState('');
  const [reqUrgency, setReqUrgency] = useState<'Urgent (Cooking Now!)' | 'In 2-3 Hours' | 'Sometime Today'>('Urgent (Cooking Now!)');
  const [reqReason, setReqReason] = useState('');
  const [reqRequester, setReqRequester] = useState('Plot 04 · Adyar (Flat 2B)');

  // Response Form state
  const [respSelectedFridgeItem, setRespSelectedFridgeItem] = useState('');
  const [respNote, setRespNote] = useState('I have this in my fridge! Kept outside Flat 2B on the shoe rack.');
  const [respName, setRespName] = useState('Plot 04 · Adyar (You)');

  // Fetch live requests on mount
  useEffect(() => {
    fetch('/api/community/requests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            item_needed: d.item_needed,
            requester: d.requester,
            location: d.location,
            urgency: d.urgency,
            reason: d.reason,
            status: d.status || 'pending',
            fulfilled_by: d.fulfilled_by,
            responder_note: d.responder_note,
            created_at: d.created_at ? 'Recently' : 'Just now',
            emoji: getEmojiForName(d.item_needed)
          }));
          setRequests(mapped);
        }
      })
      .catch(err => console.log('Using default requests:', err));
  }, []);

  // Normalize Surplus items from SQLite or default
  const normalizedSurplusItems: NormalizedSurplus[] = (communityBoard && communityBoard.length > 0 
    ? communityBoard.map((raw, idx) => {
        const name = raw.name || raw.item || 'Fresh Produce';
        const donor = raw.donor || (raw.donor_id ? `Plot ${raw.donor_id.replace('Node-', '0')} · ${raw.location || 'Chennai'}` : 'Plot 02 · Kotturpuram');
        const distance = raw.distance || `${300 + (idx * 250)}m away · ${3 + idx * 3}m walk`;
        const time = raw.time || 'Posted 2h ago';
        const expiry = raw.expiry || (raw.expiry_at 
          ? `Expires in ${Math.max(1, differenceInDays(new Date(raw.expiry_at), new Date()))} days` 
          : 'Fresh for 3 days');
        const note = raw.note || (name.includes('Tomato') 
          ? 'Harvested from rooftop terrace garden this morning. Free for any neighbor.' 
          : name.includes('Drumstick') 
          ? 'Freshly cut today from home tree. Crisp and tender.' 
          : name.includes('Milk')
          ? 'Unopened chilled packet, traveling for 3 days.'
          : 'Organic home produce, free for neighbor pickup.');
        const category = raw.category || (name.includes('Milk') ? 'Chilled Dairy' : name.includes('Harvest') || name.includes('Tomato') || name.includes('Drumstick') ? 'Garden Harvest' : 'Greens');
        const otp = raw.otp || `#${1000 + Math.floor(Math.random() * 8999)}`;

        return {
          id: String(raw.id || `comm-${idx}`),
          name,
          donor,
          distance,
          time,
          expiry,
          note,
          category,
          status: raw.status || 'Available',
          emoji: getEmojiForName(name),
          otp
        };
      })
    : DEFAULT_SURPLUS_ITEMS);

  // Filter Surplus items
  const filteredSurplus = normalizedSurplusItems.filter(item => {
    if (selectedSurplusFilter === 'all') return true;
    if (selectedSurplusFilter === 'garden') return item.category === 'Garden Harvest' || item.name.includes('Tomato') || item.name.includes('Drumstick');
    if (selectedSurplusFilter === 'dairy') return item.category === 'Chilled Dairy' || item.name.includes('Milk');
    if (selectedSurplusFilter === 'nearby') return item.distance.includes('350m') || item.distance.includes('450m') || item.distance.includes('300m') || item.distance.includes('500m');
    return true;
  });

  // Filter Requests
  const filteredRequests = requests.filter(req => {
    if (selectedRequestFilter === 'all') return true;
    if (selectedRequestFilter === 'urgent') return req.urgency.toLowerCase().includes('urgent');
    if (selectedRequestFilter === 'pending') return req.status === 'pending';
    if (selectedRequestFilter === 'fulfilled') return req.status === 'fulfilled' || req.status === 'completed';
    return true;
  });

  const handleOpenPickupPass = (item: NormalizedSurplus) => {
    setActivePickupPass(item);
  };

  const handleConfirmPickup = () => {
    if (activePickupPass) {
      setClaimedSurplusIds([...claimedSurplusIds, activePickupPass.id]);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#ffffff']
      });
      setActivePickupPass(null);
    }
  };

  const handleCopyWhatsAppMessage = () => {
    if (!activePickupPass) return;
    const msg = `Hi neighbor! 👋 I just claimed your *${activePickupPass.name}* on FedCausalFreshNet.\n🔑 My Safe Pickup Code is: *${activePickupPass.otp}*\nWalking over to ${activePickupPass.donor} in 5-10 minutes. Thanks a lot!`;
    navigator.clipboard.writeText(msg);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleSubmitSurplusShare = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedItem = fridgeItems.find(i => String(i.id) === selectedFridgeItemId) || fridgeItems[0];
    if (matchedItem && onShareItem) {
      onShareItem(matchedItem);
    }
    setShowShareModal(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#3b82f6', '#10b981']
    });
  };

  // Submit New Neighbor Request
  const handleSubmitNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqItemNeeded.trim()) return;

    const newReqObj: CommunityRequest = {
      id: `req-${Date.now()}`,
      item_needed: reqItemNeeded.trim(),
      requester: reqRequester || 'Plot 04 · Adyar (Flat 2B)',
      location: 'Adyar, Chennai',
      urgency: reqUrgency,
      reason: reqReason.trim() || 'Need ingredient for cooking',
      status: 'pending',
      fulfilled_by: null,
      responder_note: null,
      created_at: 'Just now',
      emoji: getEmojiForName(reqItemNeeded)
    };

    setRequests([newReqObj, ...requests]);
    setShowRequestModal(false);
    setReqItemNeeded('');
    setReqReason('');

    try {
      await fetch('/api/community/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_needed: newReqObj.item_needed,
          requester: newReqObj.requester,
          location: newReqObj.location,
          urgency: newReqObj.urgency,
          reason: newReqObj.reason
        })
      });
    } catch (err) {
      console.log('Saved locally:', err);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b']
    });
  };

  // Submit Response ("I Have This!")
  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingToRequest) return;

    const noteToUse = respSelectedFridgeItem 
      ? `I have fresh ${respSelectedFridgeItem} in my fridge! ${respNote}` 
      : respNote;

    const updated = requests.map(r => {
      if (r.id === respondingToRequest.id) {
        return {
          ...r,
          status: 'fulfilled' as const,
          fulfilled_by: respName || 'Plot 04 · Adyar (You)',
          responder_note: noteToUse
        };
      }
      return r;
    });

    setRequests(updated);
    setRespondingToRequest(null);
    setRespSelectedFridgeItem('');

    try {
      await fetch(`/api/community/requests/${respondingToRequest.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responder_name: respName || 'Plot 04 · Adyar (You)',
          responder_note: noteToUse
        })
      });
    } catch (err) {
      console.log('Updated locally:', err);
    }

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#ec4899']
    });
  };

  // Mark Request Completed ("Got it!")
  const handleCompleteRequest = async (requestId: string) => {
    const updated = requests.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'completed' as const };
      }
      return r;
    });
    setRequests(updated);

    try {
      await fetch(`/api/community/requests/${requestId}/complete`, { method: 'POST' });
    } catch (err) {
      console.log('Completed locally:', err);
    }

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#ffffff']
    });
  };

  // Copy WhatsApp pickup note for responder
  const handleCopyResponderWhatsApp = (req: CommunityRequest) => {
    const msg = `Hi neighbor! 👋 Saw your offer for *${req.item_needed}* on FedCausalFreshNet!\n"${req.responder_note || ''}"\nWalking over to pick it up now. Thank you so much! 🙏`;
    navigator.clipboard.writeText(msg);
    setCopiedResponseMsg(true);
    setTimeout(() => setCopiedResponseMsg(false), 2500);
  };

  return (
    <motion.div
      id="community-tab"
      key="community"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* =========================================================================
          1. COMMUNITY IMPACT & KARMA TELEMETRY HERO
          ========================================================================= */}
      <div className="glass-panel p-6 border-blue-500/25 bg-gradient-to-r from-blue-500/10 via-slate-900/60 to-teal-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/25 to-cyan-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10 text-3xl">
            🤝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Gated Society P2P Kitchen Exchange</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-mono font-semibold border border-blue-500/40">
                Plots 01–05 Swarm
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Hyper-local food rescue & neighbor sharing: offer extra groceries or ask nearby plots for cooking ingredients you ran out of!
            </p>
          </div>
        </div>

        {/* Telemetry Strip & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex items-center gap-3">
            <span className="text-xl">🌿</span>
            <div>
              <div className="text-sm font-bold text-blue-300 font-mono">48.5 kg Rescued</div>
              <div className="text-[10px] text-slate-400">Society Food Saved</div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <div className="text-sm font-bold text-emerald-300 font-mono">+120 Karma</div>
              <div className="text-[10px] text-slate-400">Your Green Score</div>
            </div>
          </div>

          {exchangeMode === 'requests' ? (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Ask Neighbors for Ingredient</span>
            </button>
          ) : (
            <button
              onClick={() => setShowShareModal(true)}
              className="px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Share My Surplus Produce</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. VIEW SWITCHER (SHARING BOARD, SOCIETY HEALTH, VENDOR MAP)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Main 3 High-Level Tabs */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 gap-1 shadow-inner self-start sm:self-auto">
          {[
            { id: 'board', label: 'Sharing Board', icon: LayoutGrid },
            { id: 'health', label: 'Society Health', icon: Activity },
            { id: 'vendors', label: 'Vendor Map', icon: Store }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-2 transition-all ${
                activeView === tab.id 
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* In Sharing Board: TWO-WAY SEGMENTED PILL (GIVE vs NEED) */}
        {activeView === 'board' && (
          <div className="flex items-center bg-[#070b13] p-1.5 rounded-2xl border border-blue-500/30 gap-1.5 shadow-xl">
            <button
              onClick={() => setExchangeMode('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-2 transition-all ${
                exchangeMode === 'requests'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HandHeart className="w-4 h-4" />
              <span>Neighbor Requests ({requests.length})</span>
            </button>

            <button
              onClick={() => setExchangeMode('surplus')}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-2 transition-all ${
                exchangeMode === 'surplus'
                  ? 'bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/25 scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Available Surplus ({normalizedSurplusItems.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. VIEW A: SHARING BOARD (TWO-WAY EXCHANGE)
          ========================================================================= */}
      {activeView === 'board' && (
        <div className="space-y-6">

          {/* -----------------------------------------------------------------------
              SUB-VIEW 1: NEIGHBOR REQUESTS / WISHLIST (NEED AN INGREDIENT)
              ----------------------------------------------------------------------- */}
          {exchangeMode === 'requests' && (
            <div className="space-y-5">
              {/* Context Banner & Filter Pills */}
              <div className="glass-panel p-4 border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                    🥣
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Emergency Cooking Wishlist</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                        Borrow a Cup of Sugar
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Ran out of lemons, curd, or chillies mid-recipe? Ask neighbors in Plots 01–05, or offer what you have in your fridge!
                    </p>
                  </div>
                </div>

                {/* Filter Pills for Requests */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: 'all', label: `All Requests (${requests.length})` },
                    { id: 'urgent', label: '⚡ Urgent (Cooking Now!)' },
                    { id: 'pending', label: '⏳ Seeking Help' },
                    { id: 'fulfilled', label: '✅ Responded' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedRequestFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        selectedRequestFilter === f.id
                          ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/50 shadow-sm'
                          : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.08]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Requests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredRequests.map((req) => {
                  const isFulfilled = req.status === 'fulfilled';
                  const isCompleted = req.status === 'completed';
                  const isPending = req.status === 'pending';

                  return (
                    <div 
                      key={req.id} 
                      className={`glass-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 shadow-xl relative overflow-hidden ${
                        isFulfilled ? 'border-emerald-500/40 bg-emerald-500/[0.04]' : 
                        isCompleted ? 'border-cyan-500/40 bg-cyan-500/[0.04]' : 
                        'border-white/10'
                      }`}
                    >
                      <div>
                        {/* Top Meta Strip */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{req.emoji || '🥗'}</span>
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                Seeking from Neighbors
                              </span>
                            )}
                            {isFulfilled && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Neighbor Offered!
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                                <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                                Handed Off & Completed
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {req.created_at || 'Just now'}
                          </span>
                        </div>

                        {/* Item Needed Title */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                            {req.item_needed}
                          </h3>
                        </div>

                        {/* Requester & Urgency Details */}
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mt-2 mb-3">
                          <span className="flex items-center gap-1 text-slate-200 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" /> {req.requester}
                          </span>
                          <span>•</span>
                          <span className="text-amber-300 font-mono font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            {req.urgency}
                          </span>
                        </div>

                        {/* Reason / Cooking Context Quote Box */}
                        <p className="text-xs text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 italic">
                          "{req.reason}"
                        </p>

                        {/* FULFILLED CALLOUT (When another user offered to help) */}
                        {isFulfilled && (
                          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                {req.fulfilled_by || 'Neighbor'} responded:
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400/80 uppercase">Ready on Porch</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed">
                              "{req.responder_note || 'I have extra in my fridge! Kept outside door.'}"
                            </p>
                          </div>
                        )}

                        {/* COMPLETED CALLOUT */}
                        {isCompleted && (
                          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-cyan-300">
                            <CheckCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>Successfully shared within society · 0 km food miles · Zero food waste.</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-amber-400" />
                          Within Society Compound
                        </span>

                        {isPending && (
                          <button
                            onClick={() => {
                              setRespondingToRequest(req);
                              setRespNote(`I have extra ${req.item_needed.toLowerCase()} in my fridge! Kept outside Flat 2B on the shoe rack.`);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                          >
                            <HandHeart className="w-3.5 h-3.5" />
                            <span>I Have This! Offer to Neighbor →</span>
                          </button>
                        )}

                        {isFulfilled && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleCopyResponderWhatsApp(req)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                            >
                              {copiedResponseMsg ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                              <span>{copiedResponseMsg ? 'Copied Note!' : 'WhatsApp Neighbor'}</span>
                            </button>

                            <button
                              onClick={() => handleCompleteRequest(req.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Got It! Mark Received</span>
                            </button>
                          </div>
                        )}

                        {isCompleted && (
                          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> +25 Karma Awarded
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              SUB-VIEW 2: AVAILABLE SURPLUS (GIVE AWAY PRODUCE)
              ----------------------------------------------------------------------- */}
          {exchangeMode === 'surplus' && (
            <div className="space-y-5">
              {/* Filter Pills for Surplus */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-blue-400 text-xs font-mono">
                  <Sparkles className="w-4 h-4" /> Available Surplus within 1.5 km Radius
                </span>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: `All Surplus (${normalizedSurplusItems.length})` },
                    { id: 'garden', label: '🌱 Garden Harvest' },
                    { id: 'dairy', label: '🥛 Chilled Dairy' },
                    { id: 'nearby', label: '⚡ Nearby (<500m)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedSurplusFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        selectedSurplusFilter === f.id
                          ? 'bg-white/10 text-white font-bold border-blue-400 shadow-sm'
                          : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.08]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Surplus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredSurplus.map((surplus) => {
                  const isClaimed = claimedSurplusIds.includes(surplus.id);

                  return (
                    <div 
                      key={surplus.id} 
                      className={`glass-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 shadow-xl ${
                        isClaimed ? 'border-emerald-500/40 bg-emerald-500/5' : ''
                      }`}
                    >
                      <div>
                        {/* Top Strip */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{surplus.emoji}</span>
                            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold uppercase">
                              {surplus.category}
                            </span>
                          </div>

                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {surplus.time}
                          </span>
                        </div>

                        {/* Produce Title */}
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                          {surplus.name}
                        </h3>

                        {/* Donor Details & Freshness */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 mb-3.5">
                          <span className="flex items-center gap-1 text-slate-200 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" /> {surplus.donor}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {surplus.expiry}
                          </span>
                        </div>

                        {/* Donor Note Quote Box */}
                        <p className="text-xs text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 italic">
                          "{surplus.note}"
                        </p>
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-400" />
                          {surplus.distance}
                        </span>

                        {isClaimed ? (
                          <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Pickup Pass Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenPickupPass(surplus)}
                            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Request Surplus Item →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          4. VIEW B: SOCIETY HEALTH (NEIGHBORHOOD RESCUE DATA)
          ========================================================================= */}
      {activeView === 'health' && (
        <div className="glass-panel p-6 border-white/10">
          <CommunityHealth />
        </div>
      )}

      {/* =========================================================================
          5. VIEW C: CHENNAI VENDOR HEALTH MAP
          ========================================================================= */}
      {activeView === 'vendors' && (
        <div className="glass-panel p-6 border-white/10">
          <VendorMap vendors={[
            { name: "Koyambedu Wholesale Farmers Hub", location: "Koyambedu, Chennai", score: 96, status: "premium", trend: "up" },
            { name: "Uzhavar Sandhai Direct Growers", location: "Mylapore, Chennai", score: 94, status: "premium", trend: "up" },
            { name: "Adyar Organic Growers Co-op", location: "Adyar, Chennai", score: 88, status: "good", trend: "stable" },
            { name: "Street Vendor Cluster Plot-04", location: "T. Nagar, Chennai", score: 74, status: "average", trend: "down" }
          ]} />
        </div>
      )}

      {/* =========================================================================
          6. MODAL: ASK NEIGHBORS FOR AN INGREDIENT (TWO-WAY REQUEST)
          ========================================================================= */}
      <AnimatePresence>
        {showRequestModal && (
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
              className="glass-panel p-6 md:p-8 max-w-lg w-full border-amber-500/40 bg-[#0d1321] text-white space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg">
                  🙋
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Ask Neighbors for an Ingredient</h3>
                  <p className="text-xs text-slate-400">Emergency kitchen rescue from nearby plots (Plots 01–05)</p>
                </div>
              </div>

              <form onSubmit={handleSubmitNewRequest} className="space-y-4">
                {/* Ingredient Needed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    What Ingredient Do You Need?
                  </label>
                  <input
                    type="text"
                    required
                    value={reqItemNeeded}
                    onChange={(e) => setReqItemNeeded(e.target.value)}
                    placeholder="e.g. 2 Lemons & Ginger piece, or 1 Cup Curd"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                  {/* Quick Suggestions Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      '🍋 2 Lemons',
                      '🥣 1 Cup Curd',
                      '🌿 Fresh Mint',
                      '🫚 Ginger Piece',
                      '🌶️ 3 Green Chillies',
                      '🧅 2 Shallots'
                    ].map(chip => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => setReqItemNeeded(chip.substring(3))}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    How Urgent Is It?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Urgent (Cooking Now!)', label: '⚡ Cooking Now', color: 'border-amber-500 text-amber-300' },
                      { id: 'In 2-3 Hours', label: '⏳ In 2-3 Hours', color: 'border-blue-500 text-blue-300' },
                      { id: 'Sometime Today', label: '📅 Today', color: 'border-slate-500 text-slate-300' }
                    ].map(u => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => setReqUrgency(u.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold border transition-all text-center ${
                          reqUrgency === u.id
                            ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason / Cooking Context */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    What are you making? (Reason):
                  </label>
                  <input
                    type="text"
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    placeholder="e.g. Making dinner rasam, forgot to buy lemons!"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                </div>

                {/* Apartment / Plot */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Your Apartment / Door:
                  </label>
                  <input
                    type="text"
                    value={reqRequester}
                    onChange={(e) => setReqRequester(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Neighbors in Plots 01–05 will see this request and can offer what they have immediately!</span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Request to Swarm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase font-mono tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          7. MODAL: "I HAVE THIS! OFFER TO NEIGHBOR" (RESPOND TO A REQUEST)
          ========================================================================= */}
      <AnimatePresence>
        {respondingToRequest && (
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
              className="glass-panel p-6 md:p-8 max-w-lg w-full border-emerald-500/40 bg-[#0d1321] text-white space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setRespondingToRequest(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-lg">
                  🤝
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Offer Ingredient to Neighbor</h3>
                  <p className="text-xs text-slate-400">Help {respondingToRequest.requester} with their cooking request</p>
                </div>
              </div>

              {/* Target Request Info */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Neighbor is requesting</div>
                  <div className="text-base font-bold text-white mt-0.5">{respondingToRequest.item_needed}</div>
                  <p className="text-xs text-emerald-300 italic mt-0.5">"{respondingToRequest.reason}"</p>
                </div>
                <span className="text-2xl">{respondingToRequest.emoji || '🍋'}</span>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                {/* Pick from Fridge (optional) */}
                {fridgeItems.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                      Offer Item From Your Fridge (Optional):
                    </label>
                    <select
                      value={respSelectedFridgeItem}
                      onChange={(e) => setRespSelectedFridgeItem(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="">-- Custom / Don't deduct from inventory --</option>
                      {fridgeItems.map(item => (
                        <option key={item.id} value={item.name}>
                          {item.name} ({item.category}) — In {item.zone} shelf
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Pickup Instructions / Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Pickup Note for Neighbor:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={respNote}
                    onChange={(e) => setRespNote(e.target.value)}
                    placeholder="e.g. I have 2 lemons! Kept in a small cloth bag outside Flat 2B door."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 shadow-inner resize-none"
                  />
                </div>

                {/* Responder Identity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Your Plot / Name:
                  </label>
                  <input
                    type="text"
                    value={respName}
                    onChange={(e) => setRespName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Responding to neighbor requests earns <strong>+25 Community Karma</strong>!</span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <HandHeart className="w-4 h-4" />
                    <span>Send Offer to Neighbor (+25 Karma)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRespondingToRequest(null)}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase font-mono tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          8. MODAL: INTERACTIVE NEIGHBOR PICKUP PASS (SURPLUS CLAIM)
          ========================================================================= */}
      <AnimatePresence>
        {activePickupPass && (
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
              className="glass-panel p-6 md:p-8 max-w-lg w-full border-blue-500/40 bg-[#0d1321] text-white space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActivePickupPass(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-3xl shadow-lg">
                  {activePickupPass.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                      Handoff Pass Ready
                    </span>
                    <span className="text-xs font-mono text-slate-400">{activePickupPass.distance}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">{activePickupPass.name}</h3>
                  <p className="text-xs text-blue-300 font-mono">{activePickupPass.donor}</p>
                </div>
              </div>

              {/* Safe Handoff OTP Code Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Safe Pickup Verification OTP</div>
                  <div className="text-2xl font-mono font-bold text-blue-400 tracking-wider mt-0.5">
                    {activePickupPass.otp}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Show this OTP to your neighbor at the door</p>
                </div>

                <button
                  onClick={handleCopyWhatsAppMessage}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  <span>{copiedOtp ? 'Copied Message!' : 'WhatsApp Neighbor'}</span>
                </button>
              </div>

              {/* Porch Handoff Instructions */}
              <div className="space-y-2 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Porch Handoff Instructions:</span>
                </div>
                <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                  <li>Walk over to <strong>{activePickupPass.donor}</strong>.</li>
                  <li>Produce is pre-chilled and placed in a clean cotton bag outside the door.</li>
                  <li>Zero contact needed — show or message code <strong>{activePickupPass.otp}</strong>.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleConfirmPickup}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Award className="w-4 h-4" />
                  <span>✅ Claimed Produce (+25 Karma)</span>
                </button>

                <button
                  onClick={() => setActivePickupPass(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase font-mono tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          9. MODAL: "SHARE MY SURPLUS PRODUCE"
          ========================================================================= */}
      <AnimatePresence>
        {showShareModal && (
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
              className="glass-panel p-6 md:p-8 max-w-lg w-full border-blue-500/40 bg-[#0d1321] text-white space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Post Produce for Neighbors</h3>
                  <p className="text-xs text-slate-400">Rescue fresh groceries by offering them to nearby plots</p>
                </div>
              </div>

              <form onSubmit={handleSubmitSurplusShare} className="space-y-4">
                {/* Select from Fridge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Choose from your Fridge Inventory:
                  </label>
                  <select
                    value={selectedFridgeItemId}
                    onChange={(e) => setSelectedFridgeItemId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    {fridgeItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category}) — Currently in {item.zone} shelf
                      </option>
                    ))}
                  </select>
                </div>

                {/* Friendly Neighbor Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Note for Neighbors:
                  </label>
                  <input
                    type="text"
                    value={shareNote}
                    onChange={(e) => setShareNote(e.target.value)}
                    placeholder="e.g. 'Leaving for weekend, fresh unopened packet ready outside door!'"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 shadow-inner"
                  />
                </div>

                {/* Apartment Pickup Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Your Apartment / Pickup Spot:
                  </label>
                  <input
                    type="text"
                    value={shareLocation}
                    onChange={(e) => setShareLocation(e.target.value)}
                    placeholder="e.g. 'Plot 04, Flat 2B, Adyar'"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 shadow-inner"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sharing surplus awards <strong>+25 Community Karma</strong> to your household score.</span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Post Surplus to Swarm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase font-mono tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
