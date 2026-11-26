export class RecipeModal {
  public element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'modal-center-backdrop';
    this.render();
    this.initEvents();
  }

  private render() {
    this.element.innerHTML = `
      <div class="modal-card">
        <button class="close-btn" id="recipe-modal-close" title="Close Modal">&times;</button>

        <div class="chapter-tag">AI ZERO-WASTE CHEF // GEMINI 2.0 FLASH</div>
        <h2 style="font-family: var(--font-display); font-size: 26px; margin-bottom: 8px; color: #fff;">
          Tamil Nadu Zero-Waste Recipe Engine
        </h2>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
          Automatically prioritize fridge items with the lowest freshness scores to generate authentic, high-flavor Tamil Nadu recipes that eliminate household food waste.
        </p>

        <!-- Rescued Ingredients Highlight -->
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-emerald); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
            RESCUED INVENTORY (EXPIRING IN &lt; 24 HOURS)
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <span class="spec-value gold" style="font-size: 12px; background: rgba(250, 204, 21, 0.12); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(250, 204, 21, 0.3);">
              🍅 3x Street Tomatoes (Freshness: 18%)
            </span>
            <span class="spec-value emerald" style="font-size: 12px; background: rgba(16, 185, 129, 0.12); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
              🌿 1x Organic Keerai Bunch (Freshness: 24%)
            </span>
            <span class="spec-value cyan" style="font-size: 12px; background: rgba(56, 189, 248, 0.12); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3);">
              🧅 2x Shallots / Sambhar Vengayam
            </span>
          </div>
        </div>

        <!-- Generated Recipe Card -->
        <div style="background: #030712; border: 1px solid var(--border-glass-hover); border-radius: 14px; padding: 22px 26px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <div style="font-family: var(--font-display); font-size: 20px; font-weight: 800; color: #fff;">
                Authentic Chettinad Thakkali Thokku (Spiced Tomato Chutney)
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); margin-top: 4px;">
                Prep Time: 15 mins &bull; Shelf Extension: +14 Days as Preserve
              </div>
            </div>
            <span class="spec-value emerald" style="font-size: 12px; border: 1px solid var(--accent-emerald); padding: 4px 10px; border-radius: 999px;">
              Zero Waste: 100%
            </span>
          </div>

          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.7; margin-bottom: 16px;">
            <strong>Why This Works in Tamil Nadu:</strong> Over-ripe tomatoes soften and develop natural sugars that make acidic preserves shelf-stable. Cooking with mustard seeds, fenugreek, and sesame oil extends their usable life from 1 day to 2+ weeks without synthetic preservatives.
          </div>

          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-gold); font-weight: 700; margin-bottom: 6px; text-transform: uppercase;">
            QUICK PREPARATION STEPS:
          </div>
          <ol style="font-size: 12.5px; color: var(--text-muted); padding-left: 20px; line-height: 1.8;">
            <li>Wash street-vendor tomatoes in mild saline water to eliminate chemical pesticide residue.</li>
            <li>Heat gingelly (sesame) oil in a kadai; splutter mustard seeds and curry leaves.</li>
            <li>Add crushed garlic and chopped ripe tomatoes; cook down until oil separates.</li>
            <li>Stir in turmeric, Kashmiri chilli powder, and roasted fenugreek powder.</li>
            <li>Cool and store in a clean glass jar — ready to pair with idli, dosa, or curd rice!</li>
          </ol>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-emerald);">
            🌱 Rescues 420g produce &bull; Prevents 0.84 kg CO₂ equivalent
          </div>
          <button class="btn-interactive" id="recipe-done-btn">
            Save to Fridge Notes &rarr;
          </button>
        </div>
      </div>
    `;
  }

  private initEvents() {
    const closeBtn = this.element.querySelector('#recipe-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });

    const doneBtn = this.element.querySelector('#recipe-done-btn');
    doneBtn?.addEventListener('click', () => this.close());
  }

  public open() {
    this.element.classList.add('open');
  }

  public close() {
    this.element.classList.remove('open');
  }
}

