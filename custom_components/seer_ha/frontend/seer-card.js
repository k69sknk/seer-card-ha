/**
 * Seer Card for Home Assistant
 * https://github.com/k69sknk/seer-card-ha
 *
 * UX: onglets → grille de posters → modal de détail
 */

// ─── STYLES ──────────────────────────────────────────────────────────────────

const SEER_STYLES = `
  ha-card {
    overflow: hidden;
    padding: 0;
    background: var(--card-background-color, #141414);
    border: none;
    display: flex;
    flex-direction: column;
    height: var(--seer-card-height, 640px);
  }

  /* ── Tab bar ── */
  .seer-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 8px;
    background: rgba(0,0,0,.35);
    border-bottom: 1px solid rgba(255,255,255,.07);
    overflow-x: auto;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .seer-tabs::-webkit-scrollbar { display: none; }

  .seer-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 10px 12px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    font-size: .8em;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: color .2s, border-color .2s;
    font-family: inherit;
    flex-shrink: 0;
  }
  .seer-tab ha-icon { --mdc-icon-size: 17px; }
  .seer-tab:hover { color: var(--primary-text-color); }
  .seer-tab.active {
    color: var(--primary-color, #6366f1);
    border-bottom-color: var(--primary-color, #6366f1);
  }

  /* ── Search bar ── */
  .seer-search-bar {
    padding: 8px 12px;
    background: rgba(0,0,0,.2);
    border-bottom: 1px solid rgba(255,255,255,.07);
    flex-shrink: 0;
  }
  .seer-search-wrap {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px;
    padding: 0 14px;
    gap: 8px;
    transition: border-color .2s;
  }
  .seer-search-wrap:focus-within {
    border-color: var(--primary-color, #6366f1);
    background: rgba(255,255,255,.11);
  }
  .seer-search-wrap ha-icon { --mdc-icon-size: 18px; opacity: .5; flex-shrink: 0; }
  .seer-search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    padding: 9px 0;
    color: var(--primary-text-color);
    font-size: .9em;
    font-family: inherit;
  }
  .seer-search-input::placeholder { color: var(--secondary-text-color); opacity: .5; }
  .seer-search-clear {
    background: none; border: none; cursor: pointer;
    color: var(--secondary-text-color); padding: 0; display: flex; align-items: center;
  }
  .seer-search-clear ha-icon { --mdc-icon-size: 17px; }

  /* ── Content area + grid ── */
  .seer-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.15) transparent;
  }
  .seer-content::-webkit-scrollbar { width: 4px; }
  .seer-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }

  .seer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
    padding: 12px;
  }

  /* ── Poster item ── */
  .poster-item {
    position: relative;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255,255,255,.05);
    aspect-ratio: 2/3;
    transition: transform .2s ease, box-shadow .2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,.4);
  }
  .poster-item:hover { transform: scale(1.04); box-shadow: 0 8px 20px rgba(0,0,0,.5); }
  .poster-item img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    border-radius: 8px;
  }
  .poster-item .no-img {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px; color: var(--secondary-text-color); opacity: .3; font-size: .7em;
  }
  .poster-item .no-img ha-icon { --mdc-icon-size: 32px; }

  .poster-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 28px 6px 6px;
    background: linear-gradient(transparent, rgba(0,0,0,.9));
    border-radius: 0 0 8px 8px;
  }
  .poster-title {
    font-size: .68em; font-weight: 500; color: white;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
    line-height: 1.2;
  }
  .poster-year { font-size: .58em; color: rgba(255,255,255,.55); margin-top: 1px; }

  /* Status dot */
  .poster-dot {
    position: absolute; top: 5px; left: 5px;
    width: 9px; height: 9px; border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,.4);
  }
  .dot-available  { background: #22c55e; }
  .dot-partial    { background: #f59e0b; }
  .dot-processing { background: #3b82f6; }
  .dot-pending    { background: #f59e0b; }
  .dot-declined   { background: #ef4444; }

  /* Type badge */
  .poster-type {
    position: absolute; top: 5px; right: 5px;
    font-size: .55em; font-weight: 700; letter-spacing: .4px;
    padding: 2px 5px; border-radius: 4px;
    background: rgba(0,0,0,.65); color: white; text-transform: uppercase;
  }

  /* Request badge (for requests section) */
  .poster-req {
    position: absolute; top: 5px; left: 5px;
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: .65em; font-weight: 700;
  }
  .req-pending  { background: #f59e0b; color: #000; }
  .req-approved { background: #22c55e; color: #000; }
  .req-declined { background: #ef4444; color: white; }

  /* ── Skeleton loader ── */
  .seer-skeletons { display: contents; }
  .skeleton {
    aspect-ratio: 2/3; border-radius: 8px;
    background: linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Empty / error states ── */
  .seer-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 200px; gap: 12px; color: var(--secondary-text-color); opacity: .5;
  }
  .seer-empty ha-icon { --mdc-icon-size: 40px; }
  .seer-empty p { margin: 0; font-size: .9em; text-align: center; }

  /* ── Modal overlay ── */
  .seer-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.75);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    padding: 16px;
    backdrop-filter: blur(6px);
    animation: fadeIn .15s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .seer-modal {
    position: relative;
    background: var(--card-background-color, #1e1e1e);
    border-radius: 14px;
    width: 100%;
    max-width: 480px;
    max-height: 88vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 80px rgba(0,0,0,.7);
    animation: slideUp .2s ease;
  }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

  /* Modal close button */
  .modal-close {
    position: absolute; top: 10px; right: 10px; z-index: 2;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(0,0,0,.6); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: white; transition: background .2s;
  }
  .modal-close:hover { background: rgba(0,0,0,.85); }
  .modal-close ha-icon { --mdc-icon-size: 18px; }

  /* Modal hero (backdrop image) */
  .modal-hero {
    position: relative;
    height: 180px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .modal-backdrop-img {
    width: 100%; height: 100%; object-fit: cover;
    filter: brightness(.6);
  }
  .modal-hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 30%, var(--card-background-color, #1e1e1e));
  }

  /* Poster + title row */
  .modal-header {
    display: flex;
    gap: 14px;
    padding: 0 16px;
    margin-top: -60px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }
  .modal-poster {
    width: 85px;
    height: 127px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(0,0,0,.5);
    border: 2px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.05);
  }
  .modal-poster-placeholder {
    width: 85px; height: 127px; border-radius: 8px;
    background: rgba(255,255,255,.07); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(255,255,255,.1);
  }
  .modal-poster-placeholder ha-icon { --mdc-icon-size: 28px; opacity: .3; }
  .modal-title-block {
    display: flex; flex-direction: column; justify-content: flex-end;
    padding-bottom: 8px; min-width: 0;
  }
  .modal-title {
    font-size: 1.15em; font-weight: 700; color: var(--primary-text-color);
    line-height: 1.2; margin: 0 0 6px; word-break: break-word;
  }
  .modal-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }

  /* Modal body (scrollable) */
  .modal-body {
    padding: 12px 16px 20px;
    overflow-y: auto;
    scrollbar-width: thin;
  }
  .modal-overview {
    font-size: .85em; line-height: 1.55; color: var(--secondary-text-color);
    margin: 0 0 14px;
  }
  .modal-actions { display: flex; flex-wrap: wrap; gap: 8px; }

  /* ── Badges ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: .75em; font-weight: 600; white-space: nowrap;
  }
  .badge ha-icon { --mdc-icon-size: 13px; }
  .b-available  { background: rgba(34,197,94,.2);  color: #4ade80; border: 1px solid rgba(34,197,94,.3); }
  .b-partial    { background: rgba(245,158,11,.2);  color: #fbbf24; border: 1px solid rgba(245,158,11,.3); }
  .b-processing { background: rgba(59,130,246,.2);  color: #60a5fa; border: 1px solid rgba(59,130,246,.3); }
  .b-pending    { background: rgba(245,158,11,.2);  color: #fbbf24; border: 1px solid rgba(245,158,11,.3); }
  .b-approved   { background: rgba(34,197,94,.2);   color: #4ade80; border: 1px solid rgba(34,197,94,.3); }
  .b-declined   { background: rgba(239,68,68,.2);   color: #f87171; border: 1px solid rgba(239,68,68,.3); }
  .b-type       { background: rgba(255,255,255,.1);  color: var(--secondary-text-color); border: 1px solid rgba(255,255,255,.15); }
  .b-rating     { background: rgba(251,191,36,.15);  color: #fbbf24; border: 1px solid rgba(251,191,36,.25); }
  .b-4k         { background: rgba(124,58,237,.25);  color: #a78bfa; border: 1px solid rgba(124,58,237,.35); }
  .b-requester  { background: rgba(255,255,255,.07); color: var(--secondary-text-color); border: 1px solid rgba(255,255,255,.1); font-weight: 400; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border: none; border-radius: 8px;
    cursor: pointer; font-size: .85em; font-weight: 600;
    transition: all .2s; font-family: inherit; color: white;
  }
  .btn ha-icon { --mdc-icon-size: 16px; }
  .btn:disabled { opacity: .5; cursor: default; }
  .btn-primary  { background: var(--primary-color, #6366f1); }
  .btn-primary:hover:not(:disabled)  { filter: brightness(1.15); }
  .btn-success  { background: #16a34a; }
  .btn-success:hover:not(:disabled)  { background: #15803d; }
  .btn-danger   { background: #dc2626; }
  .btn-danger:hover:not(:disabled)   { background: #b91c1c; }
  .btn-ghost    { background: rgba(255,255,255,.1); }
  .btn-ghost:hover:not(:disabled)    { background: rgba(255,255,255,.18); }

  /* ── Confirm / season picker modals ── */
  .seer-mini-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px;
    backdrop-filter: blur(4px);
  }
  .seer-mini-modal {
    background: var(--card-background-color, #1e1e1e);
    border-radius: 12px; width: 100%; max-width: 340px;
    box-shadow: 0 16px 60px rgba(0,0,0,.6); overflow: hidden;
  }
  .mini-header {
    padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.08);
    font-weight: 600; font-size: .95em;
    display: flex; justify-content: space-between; align-items: center;
  }
  .mini-close { background:none; border:none; cursor:pointer; color:var(--secondary-text-color); display:flex; padding:2px; }
  .mini-close ha-icon { --mdc-icon-size: 18px; }
  .mini-body { padding: 16px; }
  .mini-body p { margin: 0 0 14px; font-size: .9em; color: var(--primary-text-color); }
  .mini-options { display: flex; flex-direction: column; gap: 8px; }
  .mini-options .btn { justify-content: center; }
  .mini-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 4px; }

  /* ── Spin ── */
  @keyframes seer-spin { to { transform: rotate(360deg); } }
  .spin { display: inline-flex; animation: seer-spin .8s linear infinite; }

  /* ── Responsive ── */
  @media (min-width: 600px) {
    .seer-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
    .modal-hero { height: 220px; }
  }
  @media (max-width: 420px) {
    .seer-tab span { display: none; }
    .seer-tab { padding: 10px 10px; }
    .seer-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; padding: 8px; }
    .modal-poster { width: 70px; height: 105px; }
  }
`;

// ─── API ─────────────────────────────────────────────────────────────────────

const TMDB = 'https://image.tmdb.org/t/p';

class SeerApi {
  constructor(hass) { this._h = hass; this._c = new Map(); this._ttl = 60000; }
  updateHass(h) { this._h = h; }
  clearCache()  { this._c.clear(); }

  async _req(endpoint, opts) {
    const method = (opts && opts.method || 'GET').toUpperCase();
    const key = method + endpoint + (opts && opts.body || '');
    if (method === 'GET') {
      const hit = this._c.get(key);
      if (hit && Date.now() - hit.t < this._ttl) return hit.d;
    }
    const msg = { type: 'seer_ha/request', endpoint, method };
    if (opts && opts.body) msg.body = JSON.parse(opts.body);
    const d = await this._h.connection.sendMessagePromise(msg);
    if (method === 'GET') this._c.set(key, { d, t: Date.now() });
    return d;
  }

  img(p, s) { s = s||'w500';  if (!p) return null; return p.startsWith('http') ? p : TMDB+'/'+s+p; }
  bg(p, s)  { s = s||'w780';  if (!p) return null; return p.startsWith('http') ? p : TMDB+'/'+s+p; }

  getTrending(p)   { return this._req('/discover/trending?page='+(p||1)); }
  getMovies(p)     { return this._req('/discover/movies?page='+(p||1)); }
  getTV(p)         { return this._req('/discover/tv?page='+(p||1)); }
  getUpcoming(p)   { return this._req('/discover/movies/upcoming?page='+(p||1)); }
  getWatchlist(p)  { return this._req('/discover/watchlist?page='+(p||1)); }
  search(q, p)     { if (!q||!q.trim()) return Promise.resolve({results:[]}); return this._req('/search?query='+encodeURIComponent(q)+'&page='+(p||1)); }

  getRequests(f) {
    const q = new URLSearchParams({ take: 50, sort: 'added' });
    if (f && f !== 'all') q.set('filter', f);
    return this._req('/request?' + q.toString());
  }

  reqMovie(id, is4k) { return this._req('/request', { method:'POST', body: JSON.stringify({ mediaType:'movie', mediaId:id, is4k:!!is4k }) }); }
  reqTV(id, seasons, is4k) { return this._req('/request', { method:'POST', body: JSON.stringify({ mediaType:'tv', mediaId:id, seasons:seasons||'all', is4k:!!is4k }) }); }
  approve(id) { return this._req('/request/'+id+'/approve', { method:'POST' }); }
  decline(id) { return this._req('/request/'+id+'/decline', { method:'POST' }); }
  remove(id)  { return this._req('/request/'+id, { method:'DELETE' }); }

  normalizeMedia(item) {
    const mt = item.mediaType || (item.firstAirDate ? 'tv' : 'movie');
    const mi = item.mediaInfo || null;
    let year = '';
    try { const d = item.releaseDate||item.firstAirDate; if(d) year = ''+new Date(d).getFullYear(); } catch(e){}
    const reqStatus = mi && mi.requests && mi.requests.length ? mi.requests[mi.requests.length-1].status : 0;
    return {
      tmdbId:      item.id,
      title:       item.title || item.name || '',
      year,
      overview:    item.overview || '',
      mediaType:   mt,
      poster:      this.img(item.posterPath),
      backdrop:    this.bg(item.backdropPath),
      rating:      item.voteAverage ? Math.round(item.voteAverage*10)/10 : null,
      mediaStatus: mi ? (mi.status||0) : 0,
      reqStatus,
      requests:    mi ? (mi.requests||[]) : [],
    };
  }

  normalizeRequest(req) {
    const m = req.media || {};
    let year = '';
    try { const d = m.releaseDate||m.firstAirDate; if(d) year = ''+new Date(d).getFullYear(); } catch(e){}
    return {
      requestId:   req.id,
      tmdbId:      m.tmdbId,
      title:       m.title || m.name || req.subject || '',
      year,
      mediaType:   req.type || m.mediaType || 'movie',
      reqStatus:   req.status,          // 1=pending 2=approved 3=declined
      mediaStatus: m.status || 0,       // 5=available
      poster:      this.img(m.posterPath),
      backdrop:    this.bg(m.backdropPath || m.posterPath),
      requestedBy: (req.requestedBy && (req.requestedBy.displayName||req.requestedBy.email)) || '?',
      requestedAt: req.createdAt,
      is4k:        !!req.is4k,
      overview:    m.overview || '',
    };
  }
}

// ─── MAIN CARD ────────────────────────────────────────────────────────────────

const TABS = [
  { key:'trending',       icon:'mdi:fire',                label:'Tendances'  },
  { key:'discover_movies',icon:'mdi:movie-open',          label:'Films'      },
  { key:'discover_tv',    icon:'mdi:television-play',     label:'Séries'     },
  { key:'upcoming',       icon:'mdi:calendar-star',       label:'À venir'    },
  { key:'requests',       icon:'mdi:clipboard-list',      label:'Requêtes'   },
  { key:'watchlist',      icon:'mdi:bookmark-multiple',   label:'Watchlist'  },
  { key:'search',         icon:'mdi:magnify',             label:'Recherche'  },
];

class SeerCard extends HTMLElement {
  constructor() {
    super();
    this._api  = null;
    this._init = false;
    this._tab  = null;          // active tab key
    this._data = {};            // cache: tab key → items[]
    this._reqFilter = 'all';
    this._searchQ   = '';
    this._searchTimer = null;
  }

  setConfig(config) {
    this.config = Object.assign({
      max_items: 40,
      refresh_interval: 300,
    }, config);
    this._tabs = TABS.filter(t =>
      !config.sections || config.sections.includes(t.key)
    );
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._api) this._api = new SeerApi(hass);
    else this._api.updateHass(hass);
    if (!this._init) this._build();
  }

  // ── Build initial HTML ────────────────────────────────────────────────────

  _build() {
    this._init = true;

    const tabsHtml = this._tabs.map(t => `
      <button class="seer-tab" data-tab="${t.key}">
        <ha-icon icon="${t.icon}"></ha-icon>
        <span>${t.label}</span>
      </button>`).join('');

    this.innerHTML = `
      <ha-card>
        <div class="seer-tabs">${tabsHtml}</div>
        <div class="seer-search-bar" style="display:none">
          <div class="seer-search-wrap">
            <ha-icon icon="mdi:magnify"></ha-icon>
            <input class="seer-search-input" type="text" placeholder="Rechercher un film ou une série…" autocomplete="off">
            <button class="seer-search-clear" style="display:none"><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
        </div>
        <div class="seer-content">
          <div class="seer-grid" data-grid></div>
        </div>
      </ha-card>
      <style>${SEER_STYLES}</style>`;

    this._el = {
      tabs:    this.querySelector('.seer-tabs'),
      searchBar: this.querySelector('.seer-search-bar'),
      searchInput: this.querySelector('.seer-search-input'),
      searchClear: this.querySelector('.seer-search-clear'),
      content: this.querySelector('.seer-content'),
      grid:    this.querySelector('[data-grid]'),
    };

    this._bindTabs();
    this._bindSearch();

    // Load first tab
    const first = this._tabs[0];
    if (first) this._activateTab(first.key);

    // Auto-refresh
    if ((this.config.refresh_interval||0) > 0) {
      this._refreshTimer = setInterval(() => {
        this._api.clearCache();
        this._data = {};
        if (this._tab && this._tab !== 'search') this._loadTab(this._tab);
      }, this.config.refresh_interval * 1000);
    }
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────

  _bindTabs() {
    this.querySelector('.seer-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.seer-tab');
      if (!btn) return;
      this._activateTab(btn.dataset.tab);
    });
  }

  _activateTab(key) {
    this._tab = key;

    // Update visual state
    this.querySelectorAll('.seer-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === key);
    });

    // Toggle search bar
    const isSearch = key === 'search';
    this._el.searchBar.style.display = isSearch ? '' : 'none';

    if (isSearch) {
      this._el.searchInput.focus();
      // Show previous search results or empty state
      if (!this._searchQ) {
        this._el.grid.innerHTML = `
          <div class="seer-empty" style="grid-column:1/-1">
            <ha-icon icon="mdi:magnify"></ha-icon>
            <p>Tapez pour rechercher</p>
          </div>`;
      }
      return;
    }

    // Use cache if available
    if (this._data[key]) {
      const filter = key === 'requests' ? this._reqFilter : null;
      this._renderGrid(this._data[key], key);
    } else {
      this._loadTab(key);
    }
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  async _loadTab(key, showSkeleton = true) {
    if (showSkeleton) this._showSkeleton();
    try {
      let items = [];
      const max = this.config.max_items || 40;

      if (key === 'trending') {
        const d = await this._api.getTrending();
        items = (d.results||[]).slice(0,max).map(r => this._api.normalizeMedia(r));
      } else if (key === 'discover_movies') {
        const d = await this._api.getMovies();
        items = (d.results||[]).slice(0,max).map(r => this._api.normalizeMedia(r));
      } else if (key === 'discover_tv') {
        const d = await this._api.getTV();
        items = (d.results||[]).slice(0,max).map(r => this._api.normalizeMedia(r));
      } else if (key === 'upcoming') {
        const d = await this._api.getUpcoming();
        items = (d.results||[]).slice(0,max).map(r => this._api.normalizeMedia(r));
      } else if (key === 'watchlist') {
        const d = await this._api.getWatchlist();
        items = (d.results||[]).slice(0,max).map(r => this._api.normalizeMedia(r));
      } else if (key === 'requests') {
        const d = await this._api.getRequests(this._reqFilter);
        items = (d.results||[]).slice(0,max).map(r => this._api.normalizeRequest(r));
      }

      if (key !== 'requests') this._data[key] = items; // cache non-request sections
      this._renderGrid(items, key);
    } catch(err) {
      const msg = err && err.code === 'not_configured'
        ? 'Configurez l\'intégration Seer dans Paramètres → Intégrations'
        : 'Erreur de chargement';
      this._el.grid.innerHTML = `
        <div class="seer-empty" style="grid-column:1/-1">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <p>${msg}</p>
        </div>`;
    }
  }

  // ── Grid rendering ────────────────────────────────────────────────────────

  _showSkeleton() {
    this._el.grid.innerHTML = Array(12).fill('<div class="skeleton"></div>').join('');
  }

  _renderGrid(items, sectionKey) {
    if (!items || !items.length) {
      this._el.grid.innerHTML = `
        <div class="seer-empty" style="grid-column:1/-1">
          <ha-icon icon="mdi:filmstrip-off"></ha-icon>
          <p>Aucun contenu</p>
        </div>`;
      return;
    }

    // Requests section: add filter bar at top
    let filterHtml = '';
    if (sectionKey === 'requests') {
      const filters = [
        {k:'all',label:'Tout'},
        {k:'pending',label:'En attente'},
        {k:'approved',label:'Approuvé'},
        {k:'available',label:'Disponible'},
      ];
      filterHtml = `<div class="req-filters" style="grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;padding-bottom:4px;">
        ${filters.map(f => `<button class="req-chip${f.k===this._reqFilter?' chip-active':''}" data-filter="${f.k}"
          style="background:${f.k===this._reqFilter?'var(--primary-color,#6366f1)':'rgba(255,255,255,.08)'};
          color:${f.k===this._reqFilter?'white':'var(--secondary-text-color)'};
          border:none;border-radius:14px;padding:4px 10px;font-size:.72em;cursor:pointer;font-family:inherit;font-weight:500"
        >${f.label}</button>`).join('')}
      </div>`;
    }

    this._el.grid.innerHTML = filterHtml + items.map((item, i) => this._posterHtml(item, i, sectionKey)).join('');

    // Filter click handlers (requests only)
    this._el.grid.querySelectorAll('.req-chip').forEach(btn => {
      btn.onclick = () => {
        this._reqFilter = btn.dataset.filter;
        this._loadTab('requests', false);
      };
    });

    // Poster click handlers
    this._el.grid.querySelectorAll('.poster-item').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.idx);
        this._openModal(items[idx], sectionKey);
      };
    });
  }

  _posterHtml(item, idx, sectionKey) {
    // Status indicator
    let dot = '';
    if (sectionKey === 'requests') {
      const cls = { 1:'req-pending', 2:'req-approved', 3:'req-declined' }[item.reqStatus] || '';
      const lbl = { 1:'?', 2:'✓', 3:'✗' }[item.reqStatus] || '?';
      if (cls) dot = `<div class="poster-req ${cls}">${lbl}</div>`;
    } else {
      const ms = item.mediaStatus;
      const rc = item.reqStatus;
      let cls = '';
      if (ms === 5) cls = 'dot-available';
      else if (ms === 4) cls = 'dot-partial';
      else if (ms === 3) cls = 'dot-processing';
      else if (rc === 1 || rc === 2) cls = 'dot-pending';
      if (cls) dot = `<div class="poster-dot ${cls}"></div>`;
    }

    const typeLabel = item.mediaType === 'tv' ? 'TV' : 'Film';
    const imgHtml = item.poster
      ? `<img src="${item.poster}" alt="${this._esc(item.title)}" loading="lazy">`
      : `<div class="no-img"><ha-icon icon="mdi:image-off"></ha-icon><span>No image</span></div>`;

    return `
      <div class="poster-item" data-idx="${idx}">
        ${imgHtml}
        ${dot}
        <div class="poster-type">${typeLabel}</div>
        <div class="poster-overlay">
          <div class="poster-title">${this._esc(item.title)}</div>
          ${item.year ? `<div class="poster-year">${item.year}</div>` : ''}
        </div>
      </div>`;
  }

  // ── Modal ─────────────────────────────────────────────────────────────────

  _openModal(item, sectionKey) {
    // Remove any existing modal
    this._closeModal();

    const isRequest = sectionKey === 'requests';

    // Build badges
    const badges = [];
    if (item.mediaType) badges.push(`<span class="badge b-type">${item.mediaType === 'tv' ? 'Série TV' : 'Film'}</span>`);
    if (item.year)      badges.push(`<span class="badge b-type">${item.year}</span>`);
    if (item.rating)    badges.push(`<span class="badge b-rating"><ha-icon icon="mdi:star"></ha-icon>${item.rating}</span>`);
    if (item.is4k)      badges.push(`<span class="badge b-4k">4K</span>`);

    // Status badge
    if (isRequest) {
      const sm = { 1:['b-pending','En attente'], 2:['b-approved','Approuvé'], 3:['b-declined','Refusé'] };
      const [c, l] = sm[item.reqStatus] || ['b-type','?'];
      badges.push(`<span class="badge ${c}">${l}</span>`);
    } else {
      const msm = { 5:['b-available','Disponible'], 4:['b-partial','Partiel'], 3:['b-processing','En cours'], 2:['b-pending','En attente'] };
      if (msm[item.mediaStatus]) badges.push(`<span class="badge ${msm[item.mediaStatus][0]}">${msm[item.mediaStatus][1]}</span>`);
    }

    // Requester info
    let requesterHtml = '';
    if (isRequest && item.requestedBy) {
      const date = item.requestedAt ? new Date(item.requestedAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '';
      requesterHtml = `<div style="font-size:.8em;color:var(--secondary-text-color);margin-bottom:10px;display:flex;gap:6px;align-items:center;">
        <ha-icon icon="mdi:account" style="--mdc-icon-size:15px;opacity:.6"></ha-icon>${item.requestedBy}
        ${date ? `<span style="opacity:.5">·</span><ha-icon icon="mdi:calendar" style="--mdc-icon-size:15px;opacity:.6"></ha-icon>${date}` : ''}
      </div>`;
    }

    // Action buttons
    let actionsHtml = this._buildActions(item, sectionKey);

    // Hero image: use backdrop if available, fallback to poster
    const heroImg = item.backdrop || item.poster;
    const heroHtml = heroImg
      ? `<img class="modal-backdrop-img" src="${heroImg}" alt="">`
      : `<div style="width:100%;height:100%;background:rgba(255,255,255,.04)"></div>`;

    const posterHtml = item.poster
      ? `<img class="modal-poster" src="${item.poster}" alt="${this._esc(item.title)}">`
      : `<div class="modal-poster-placeholder"><ha-icon icon="mdi:image-off"></ha-icon></div>`;

    const modal = document.createElement('div');
    modal.className = 'seer-modal-overlay';
    modal.innerHTML = `
      <div class="seer-modal">
        <button class="modal-close"><ha-icon icon="mdi:close"></ha-icon></button>
        <div class="modal-hero">
          ${heroHtml}
          <div class="modal-hero-gradient"></div>
        </div>
        <div class="modal-header">
          ${posterHtml}
          <div class="modal-title-block">
            <h2 class="modal-title">${this._esc(item.title)}</h2>
            <div class="modal-meta">${badges.join('')}</div>
          </div>
        </div>
        <div class="modal-body">
          ${requesterHtml}
          ${item.overview ? `<p class="modal-overview">${this._esc(item.overview)}</p>` : ''}
          <div class="modal-actions">${actionsHtml}</div>
        </div>
      </div>`;

    // Close handlers
    modal.querySelector('.modal-close').onclick = () => this._closeModal();
    modal.onclick = e => { if (e.target === modal) this._closeModal(); };

    // Keyboard close
    this._escHandler = e => { if (e.key === 'Escape') this._closeModal(); };
    document.addEventListener('keydown', this._escHandler);

    // Action buttons
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        await this._handleAction(btn.dataset.action, btn, item, sectionKey, modal);
      };
    });

    document.body.appendChild(modal);
    this._currentModal = modal;
  }

  _closeModal() {
    if (this._currentModal) {
      this._currentModal.remove();
      this._currentModal = null;
    }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  }

  _buildActions(item, sectionKey) {
    const isRequest = sectionKey === 'requests';
    let html = '';

    if (isRequest) {
      if (item.reqStatus === 1) {
        html += `<button class="btn btn-success" data-action="approve"><ha-icon icon="mdi:check"></ha-icon> Approuver</button>`;
        html += `<button class="btn btn-danger"  data-action="decline"><ha-icon icon="mdi:close"></ha-icon> Refuser</button>`;
      }
      html += `<button class="btn btn-ghost" data-action="delete"><ha-icon icon="mdi:delete-outline"></ha-icon> Supprimer</button>`;
    } else {
      if (item.mediaStatus === 5) {
        html = `<button class="btn btn-ghost" disabled><ha-icon icon="mdi:check-circle"></ha-icon> Disponible</button>`;
      } else if (item.reqStatus === 1 || item.reqStatus === 2) {
        const l = item.reqStatus === 1 ? 'En attente' : 'Approuvé';
        html = `<button class="btn btn-ghost" disabled><ha-icon icon="mdi:clock-outline"></ha-icon> ${l}</button>`;
      } else if (item.tmdbId) {
        const mt = item.mediaType || 'movie';
        html = `<button class="btn btn-primary" data-action="request" data-tmdb="${item.tmdbId}" data-type="${mt}" data-title="${this._esc(item.title)}"><ha-icon icon="mdi:plus"></ha-icon> Demander</button>`;
      }
    }
    return html;
  }

  // ── Action handler ────────────────────────────────────────────────────────

  async _handleAction(action, btn, item, sectionKey, modal) {
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"><ha-icon icon="mdi:loading"></ha-icon></span>';

    try {
      if (action === 'request') {
        const tmdbId = parseInt(btn.dataset.tmdb);
        const type   = btn.dataset.type;
        const title  = btn.dataset.title;

        if (type === 'tv') {
          const season = await this._seasonPicker(title);
          if (season === null) { btn.disabled = false; btn.innerHTML = orig; return; }
          await this._api.reqTV(tmdbId, season);
        } else {
          await this._api.reqMovie(tmdbId);
        }
        btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Demandé';
        btn.classList.remove('btn-primary'); btn.classList.add('btn-success');
        this._api.clearCache();
        this._data = {};

      } else if (action === 'approve') {
        await this._api.approve(item.requestId);
        btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Approuvé';
        btn.classList.remove('btn-success'); btn.classList.add('btn-ghost');
        btn.disabled = true;
        this._api.clearCache();
        setTimeout(() => { this._closeModal(); this._loadTab('requests', false); }, 800);

      } else if (action === 'decline') {
        await this._api.decline(item.requestId);
        btn.innerHTML = '<ha-icon icon="mdi:close"></ha-icon> Refusé';
        btn.classList.remove('btn-danger'); btn.classList.add('btn-ghost');
        btn.disabled = true;
        this._api.clearCache();
        setTimeout(() => { this._closeModal(); this._loadTab('requests', false); }, 800);

      } else if (action === 'delete') {
        const ok = await this._confirm('Supprimer cette requête ?', 'Cette action est irréversible.');
        if (!ok) { btn.disabled = false; btn.innerHTML = orig; return; }
        await this._api.remove(item.requestId);
        this._api.clearCache();
        this._closeModal();
        this._loadTab('requests', false);
      }
    } catch(err) {
      console.error('Seer Card:', err);
      btn.innerHTML = '<ha-icon icon="mdi:alert"></ha-icon> Erreur';
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 3000);
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────

  _bindSearch() {
    const input = this._el.searchInput;
    const clear = this._el.searchClear;

    input.oninput = () => {
      this._searchQ = input.value;
      clear.style.display = this._searchQ ? '' : 'none';
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this._doSearch(), 400);
    };
    input.onkeydown = e => { if (e.key === 'Enter') { clearTimeout(this._searchTimer); this._doSearch(); } };
    clear.onclick = () => {
      input.value = ''; this._searchQ = ''; clear.style.display = 'none';
      this._el.grid.innerHTML = `
        <div class="seer-empty" style="grid-column:1/-1">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <p>Tapez pour rechercher</p>
        </div>`;
    };
  }

  async _doSearch() {
    if (!this._searchQ.trim()) return;
    this._showSkeleton();
    try {
      const max  = this.config.max_items || 40;
      const d    = await this._api.search(this._searchQ);
      const items = (d.results||[])
        .filter(r => r.mediaType === 'movie' || r.mediaType === 'tv')
        .slice(0, max)
        .map(r => this._api.normalizeMedia(r));
      if (!items.length) {
        this._el.grid.innerHTML = `<div class="seer-empty" style="grid-column:1/-1"><ha-icon icon="mdi:movie-search-outline"></ha-icon><p>Aucun résultat pour « ${this._esc(this._searchQ)} »</p></div>`;
      } else {
        this._renderGrid(items, 'search');
      }
    } catch(e) {
      this._el.grid.innerHTML = `<div class="seer-empty" style="grid-column:1/-1"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><p>Erreur de recherche</p></div>`;
    }
  }

  // ── Dialogs ───────────────────────────────────────────────────────────────

  _seasonPicker(title) {
    return new Promise(resolve => {
      const m = document.createElement('div');
      m.className = 'seer-mini-overlay';
      m.innerHTML = `
        <div class="seer-mini-modal">
          <div class="mini-header">
            Choisir les saisons
            <button class="mini-close"><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          <div class="mini-body">
            <p>Pour <strong>${this._esc(title)}</strong>, demander :</p>
            <div class="mini-options">
              <button class="btn btn-primary" data-s="all">Toutes les saisons</button>
              <button class="btn btn-ghost"   data-s="latest">Dernière saison uniquement</button>
              <button class="btn btn-ghost"   data-s="first">Première saison uniquement</button>
            </div>
          </div>
        </div>`;
      const close = v => { m.remove(); resolve(v); };
      m.querySelector('.mini-close').onclick = () => close(null);
      m.onclick = e => { if (e.target === m) close(null); };
      m.querySelectorAll('[data-s]').forEach(b => b.onclick = () => close(b.dataset.s));
      document.body.appendChild(m);
    });
  }

  _confirm(title, desc) {
    return new Promise(resolve => {
      const m = document.createElement('div');
      m.className = 'seer-mini-overlay';
      m.innerHTML = `
        <div class="seer-mini-modal">
          <div class="mini-header">
            ${this._esc(title)}
            <button class="mini-close"><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          <div class="mini-body">
            ${desc ? `<p>${this._esc(desc)}</p>` : ''}
            <div class="mini-actions">
              <button class="btn btn-danger"  data-ok>Confirmer</button>
              <button class="btn btn-ghost"   data-no>Annuler</button>
            </div>
          </div>
        </div>`;
      const close = v => { m.remove(); resolve(v); };
      m.querySelector('.mini-close').onclick = () => close(false);
      m.querySelector('[data-ok]').onclick   = () => close(true);
      m.querySelector('[data-no]').onclick   = () => close(false);
      m.onclick = e => { if (e.target === m) close(false); };
      document.body.appendChild(m);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  disconnectedCallback() {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    this._closeModal();
  }

  getCardSize() { return 8; }

  static getStubConfig() {
    return { max_items: 40, refresh_interval: 300 };
  }
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

customElements.define('seer-card', SeerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'seer-card',
  name: 'Seer Card',
  description: 'Carte média propulsée par Seer — tendances, découverte, requêtes, watchlist et recherche.',
  preview: true,
});
