import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Sparkles, 
  Clock, 
  Leaf, 
  ChefHat, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Flame, 
  Heart, 
  TrendingUp, 
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import type { FridgeItem } from '../../services/geminiService';

interface RecipesTabProps {
  recipes: string | null;
  isProcessing: boolean;
  onGenerate: (prompt?: string) => void;
  items?: FridgeItem[];
  onCookItem?: (rescuedItems: string[]) => void;
}

interface RecipeData {
  id: string;
  title: string;
  tamilName: string;
  category: 'quick' | 'main' | 'healthy' | 'preserve';
  categoryLabel: string;
  time: string;
  minutes: number;
  servings: string;
  urgency: string;
  rescuedItems: string[];
  imageUrl: string;
  tags: string[];
  description: string;
  ingredients: { name: string; amount: string; fromFridge: boolean }[];
  steps: string[];
  timerMinutes?: number;
  savings: string;
  scienceNote: string;
}

const CURATED_RECIPES: RecipeData[] = [
  {
    id: 'rec-1',
    title: 'Chennai Keerai Poriyal',
    tamilName: 'செட்டிநாடு கீரை பொரியல்',
    category: 'quick',
    categoryLabel: '15-Min Express',
    time: '15 mins',
    minutes: 15,
    servings: '2-3 Servings',
    urgency: 'Uses Palak Spinach expiring in 2 days',
    rescuedItems: ['Palak Spinach', 'Small Onions', 'Curry Leaves'],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    tags: ['⚡ 15-Min', '🍳 1-Pan', '🌱 100% Veg', '💪 Vitamin-Rich'],
    description: 'Crisp stir-fried tender greens tempered with crackling mustard seeds, urad dal, dried red chillies, and freshly grated coconut. Locks in 94% cellular vitamins before moisture loss.',
    ingredients: [
      { name: 'Palak Spinach (washed & chopped)', amount: '1 fresh bunch (250g)', fromFridge: true },
      { name: 'Small Onions / Shallots (sliced)', amount: '6-8 bulbs', fromFridge: true },
      { name: 'Curry Leaves', amount: '1 sprig', fromFridge: true },
      { name: 'Cold-Pressed Sesame Oil', amount: '1 tbsp', fromFridge: false },
      { name: 'Mustard Seeds & Urad Dal', amount: '1 tsp each', fromFridge: false },
      { name: 'Dried Red Chillies', amount: '2 pieces', fromFridge: false },
      { name: 'Freshly Grated Coconut', amount: '2 tbsp', fromFridge: false }
    ],
    steps: [
      'Rinse spinach thoroughly in cold water to remove any field soil, drain well, and roughly chop.',
      'Heat 1 tbsp sesame oil in a kadai. Add mustard seeds; once they crackle, add urad dal, dried chillies, and curry leaves.',
      'Sauté the sliced small onions on medium flame until translucent and fragrant (approx. 2 mins).',
      'Add chopped spinach, a pinch of turmeric, and salt. Sauté uncovered for 4 minutes to preserve vibrant chlorophyll and cellular crispness.',
      'Turn off heat, fold in freshly grated coconut, and serve hot with steamed rice or rasam.'
    ],
    timerMinutes: 4,
    savings: 'Saves 250g produce (₹45)',
    scienceNote: 'Cooking spinach within 48h prevents chlorophyll degradation and preserves water-soluble vitamin C that otherwise oxidizes rapidly in humid air.'
  },
  {
    id: 'rec-2',
    title: 'Uzhavar Sandhai Thakkali Thokku',
    tamilName: 'நாட்டு தக்காளி தொக்கு',
    category: 'preserve',
    categoryLabel: 'Preserves & Relishes',
    time: '25 mins',
    minutes: 25,
    servings: 'Yields 400ml Jar (Keeps 3 Weeks)',
    urgency: 'Uses Country Tomatoes at peak ripeness',
    rescuedItems: ['Country Tomatoes', 'Curry Leaves', 'Shallots'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    tags: ['🫙 Shelf-Stable', '🌶️ Spicy & Tangy', '🌿 Slow-Reduced'],
    description: 'Rich, spicy slow-reduced tomato relish infused with roasted fenugreek, asafoetida, and generous gingelly oil. Naturally preserves ripe tomatoes for up to 3 weeks without refrigeration.',
    ingredients: [
      { name: 'Ripe Country Tomatoes (diced)', amount: '500g (4-5 tomatoes)', fromFridge: true },
      { name: 'Curry Leaves (fresh)', amount: '2 sprigs', fromFridge: true },
      { name: 'Shallots / Small Onions (crushed)', amount: '4 bulbs', fromFridge: true },
      { name: 'Gingelly (Sesame) Oil', amount: '3 tbsp', fromFridge: false },
      { name: 'Mustard Seeds', amount: '1 tsp', fromFridge: false },
      { name: 'Red Chilli Powder & Turmeric', amount: '1.5 tsp', fromFridge: false },
      { name: 'Roasted Fenugreek Powder (Methi)', amount: '1/2 tsp', fromFridge: false }
    ],
    steps: [
      'Coarsely chop tomatoes into chunks. Heat 3 tbsp gingelly oil in a thick kadai until warm.',
      'Splutter mustard seeds, crushed shallots, and fresh curry leaves until aromatic.',
      'Add the tomatoes, turmeric, red chilli powder, and sea salt. Stir well on medium heat.',
      'Cover and simmer on low-medium flame for 12 minutes until tomatoes break down into a luscious jammy consistency and oil floats to the edges.',
      'Sprinkle roasted fenugreek powder and a pinch of asafoetida. Let cool completely and bottle in an airtight glass jar.'
    ],
    timerMinutes: 12,
    savings: 'Saves 500g tomatoes (₹40)',
    scienceNote: 'Natural lycopene content peaks at full redness. Slow oil-reduction halts fungal growth and acidifies the paste, naturally extending shelf-life by 21 days.'
  },
  {
    id: 'rec-3',
    title: 'Creamy Mor Kuzhambu & Brinjal Roast',
    tamilName: 'மோர் குழம்பு & கத்திரிக்காய் வறுவல்',
    category: 'main',
    categoryLabel: 'Main Course Comfort',
    time: '20 mins',
    minutes: 20,
    servings: '3-4 Servings',
    urgency: 'Uses Natural Set Curd & Purple Brinjal',
    rescuedItems: ['Natural Set Curd', 'Purple Brinjal', 'Curry Leaves'],
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    tags: ['🥣 Probiotic', '🍆 Pan-Roasted', '☀️ Coastal Cooling'],
    description: 'Traditional spiced buttermilk curry with coconut-cumin aromatics, served with crispy spiced brinjal cutlets. Highly soothing, probiotic-rich comfort food for coastal climates.',
    ingredients: [
      { name: 'Natural Set Curd (whisked with water)', amount: '1.5 cups (350g)', fromFridge: true },
      { name: 'Purple Brinjal / Eggplant (sliced rounds)', amount: '2 medium (200g)', fromFridge: true },
      { name: 'Fresh Curry Leaves', amount: '1 sprig', fromFridge: true },
      { name: 'Fresh Coconut & Cumin Seeds', amount: '3 tbsp + 1 tsp', fromFridge: false },
      { name: 'Green Chillies & Ginger', amount: '2 chillies + 1 inch piece', fromFridge: false },
      { name: 'Turmeric & Salt', amount: 'To taste', fromFridge: false }
    ],
    steps: [
      'Blend coconut, cumin seeds, green chillies, and ginger into a fine paste with 3 tbsp water.',
      'Whisk the set curd with turmeric, salt, and blended paste. Set aside.',
      'Coat sliced brinjal rounds with chilli powder, turmeric, and salt; shallow-fry on a tawa with 1 tsp oil until golden-crisp on both sides.',
      'Warm the curd mixture in a saucepan over low heat for 3 minutes until frothy (do not allow to boil, or curd will split).',
      'Temper with mustard and curry leaves in hot coconut oil, pour over the mor kuzhambu, and serve with hot rice and the crispy roasted brinjal.'
    ],
    timerMinutes: 3,
    savings: 'Saves 400g curd + brinjal (₹65)',
    scienceNote: 'Using mature curd before acidity peaks delivers live lactobacillus cultures while rescuing brinjals before interior seed browning occurs.'
  }
];

export const RecipesTab: React.FC<RecipesTabProps> = ({
  recipes,
  isProcessing,
  onGenerate,
  items = [],
  onCookItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userQuery, setUserQuery] = useState<string>('');
  const [activeCookRecipe, setActiveCookRecipe] = useState<RecipeData | null>(null);
  
  // Interactive Cooking Checklist state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Built-in Kitchen Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8']
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleOpenCookMode = (recipe: RecipeData) => {
    setActiveCookRecipe(recipe);
    setCheckedIngredients({});
    setIsTimerRunning(false);
    setTimerSeconds(recipe.timerMinutes ? recipe.timerMinutes * 60 : 0);
  };

  const handleFinishCooking = () => {
    if (activeCookRecipe) {
      if (onCookItem) {
        onCookItem(activeCookRecipe.rescuedItems);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#06b6d4']
      });
      setActiveCookRecipe(null);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onGenerate(userQuery);
  };

  const handleQuickPill = (craving: string) => {
    setUserQuery(craving);
    onGenerate(craving);
  };

  const filteredRecipes = CURATED_RECIPES.filter(r => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'quick') return r.category === 'quick';
    if (selectedCategory === 'main') return r.category === 'main';
    if (selectedCategory === 'healthy') return r.category === 'healthy' || r.tags.includes('🥣 Probiotic');
    if (selectedCategory === 'preserve') return r.category === 'preserve';
    return true;
  });

  return (
    <motion.div 
      id="recipes-tab"
      key="recipes"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* =========================================================================
          1. KITCHEN IMPACT & SAVINGS TELEMETRY HERO
          ========================================================================= */}
      <div className="glass-panel p-6 border-emerald-500/25 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 text-2xl">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Zero-Waste Culinary AI</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/40">
                Tamil Nadu Kitchen Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Real-time culinary matchmaking: dishes specifically engineered to cook and rescue produce sitting at peak ripeness in your fridge today.
            </p>
          </div>
        </div>

        {/* Real-time Kitchen Impact Numbers */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3">
            <span className="text-xl">🌿</span>
            <div>
              <div className="text-sm font-bold text-emerald-300 font-mono">3 Items Rescued</div>
              <div className="text-[10px] text-slate-400">Palak, Tomatoes, Curd</div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-3">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-sm font-bold text-amber-300 font-mono">₹150 Saved</div>
              <div className="text-[10px] text-slate-400">Grocery Waste Kept</div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3">
            <span className="text-xl">🌍</span>
            <div>
              <div className="text-sm font-bold text-cyan-300 font-mono">1.15 kg CO₂</div>
              <div className="text-[10px] text-slate-400">Emissions Prevented</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. "WHAT ARE YOU IN THE MOOD FOR?" AI PROMPT BAR & QUICK PILLS
          ========================================================================= */}
      <div className="glass-panel p-5 border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Tell Gemini AI What You Feel Like Eating</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Prioritizes expiring fridge stock</span>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g. 'Make something spicy with curd and tomatoes' or 'Quick 10-minute breakfast'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 shrink-0"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Menu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Custom Menu</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Inspiration Cravings Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Try:</span>
          {[
            { label: '🌶️ Extra Spicy Curry', val: 'Extra spicy Chettinad style curry' },
            { label: '⚡ Under 15 Mins', val: 'Fast under 15 minute express meal' },
            { label: '🍲 Coastal Comfort Stew', val: 'Warm comfort rasam or stew' },
            { label: '🫙 Long-Term Thokku', val: 'Preservable tangy tomato thokku' },
            { label: '👶 Mild & Kid Friendly', val: 'Mild comforting snack for kids' }
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPill(pill.val)}
              className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 whitespace-nowrap transition-all"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. GEMINI AI CUSTOM MENU REPORT (IF GENERATED)
          ========================================================================= */}
      {recipes && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 border-emerald-500/30 bg-emerald-500/5 space-y-4 shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Gemini AI Freshness Suggestions</span>
            </div>
            <button 
              onClick={() => onGenerate()}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
          <div className="prose prose-invert prose-emerald max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed">
            <ReactMarkdown>{recipes}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          4. CATEGORY FILTER TABS
          ========================================================================= */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Rescues (${CURATED_RECIPES.length})` },
            { id: 'quick', label: '⚡ 15-Min Express' },
            { id: 'main', label: '🍛 Main Course Comfort' },
            { id: 'preserve', label: '🫙 Preserves & Relishes' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedCategory(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === f.id
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white border-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          5. MOUTHWATERING DISH CARDS GRID
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div 
            key={recipe.id} 
            className="glass-card overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl"
          >
            {/* Top Dish Image with Gradient Header */}
            <div className="relative h-44 w-full overflow-hidden">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Urgency Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/90 text-slate-950 shadow-lg flex items-center gap-1 backdrop-blur-md">
                  <AlertCircle className="w-3 h-3" />
                  {recipe.urgency}
                </span>
              </div>

              {/* Cook Time Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900/80 text-white border border-white/20 backdrop-blur-md flex items-center gap-1 shadow-lg">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {recipe.time}
                </span>
              </div>

              {/* Dish Name Overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors drop-shadow-md">
                  {recipe.title}
                </h3>
                <p className="text-xs text-emerald-300 font-serif italic drop-shadow">{recipe.tamilName}</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Visual Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {recipe.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {recipe.description}
                </p>

                {/* Rescued Produce Pill Box */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
                  <div className="text-[10px] font-mono uppercase font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Leaf className="w-3 h-3" /> Rescued From Your Fridge:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.rescuedItems.map((item, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 font-medium">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">{recipe.savings}</span>

                <button
                  onClick={() => handleOpenCookMode(recipe)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Start Cooking →</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          6. INTERACTIVE "START COOKING" MODE DRAWER / MODAL
          ========================================================================= */}
      <AnimatePresence>
        {activeCookRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 25 }}
              className="glass-panel p-6 md:p-8 max-w-2xl w-full border-emerald-500/40 bg-[#0d1321] text-white space-y-6 shadow-2xl relative my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveCookRecipe(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Hero */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                <img 
                  src={activeCookRecipe.imageUrl} 
                  alt={activeCookRecipe.title} 
                  className="w-20 h-20 rounded-2xl object-cover border border-emerald-500/40 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{activeCookRecipe.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeCookRecipe.servings}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-serif italic">{activeCookRecipe.tamilName}</p>
                  <p className="text-xs text-emerald-400 font-mono mt-1 font-semibold">{activeCookRecipe.savings}</p>
                </div>
              </div>

              {/* Kitchen Checklist: Tap Ingredients as You Prep */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Kitchen Checklist · Tap to Check Off</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {Object.values(checkedIngredients).filter(Boolean).length} of {activeCookRecipe.ingredients.length} ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCookRecipe.ingredients.map((ing, i) => {
                    const isChecked = !!checkedIngredients[ing.name];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleIngredient(ing.name)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 line-through'
                            : 'bg-white/[0.03] border-white/10 text-slate-200 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-500'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="font-medium">{ing.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{ing.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Instructions with Built-In Live Kitchen Timer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Step-by-Step Cooking Method</span>
                  </h4>

                  {/* Live Kitchen Timer Pill */}
                  {activeCookRecipe.timerMinutes && (
                    <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                        title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                      >
                        {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => startTimer(activeCookRecipe.timerMinutes || 4)}
                        className="p-1 rounded bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {activeCookRecipe.steps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Freshness Benefit */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 font-semibold mb-0.5">Nutrient Preservation Science:</strong>
                  {activeCookRecipe.scienceNote}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleFinishCooking}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>🎉 Mark as Cooked & Deduct from Fridge</span>
                </button>

                <button
                  onClick={() => setActiveCookRecipe(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase font-mono tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
