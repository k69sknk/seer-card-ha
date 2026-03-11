/**
 * Seer Card for Home Assistant
 * https://github.com/k69sknk/seer-card-ha
 */

// ─── STYLES ──────────────────────────────────────────────────────────────────

const SEER_STYLES = `
  ha-card {
    overflow: hidden;
    padding: 0;
    position: relative;
    background: var(--card-background-color, #1c1c1c);
    border: none;
  }
  .seer-card { position: relative; min-height: 200px; }

  .card-bg {
    position: absolute; top:0; left:0; right:0; bottom:0;
    background-size: cover; background-position: center;
    filter: blur(30px) brightness(0.3) saturate(1.2);
    transform: scale(1.3); z-index: 0;
    transition: background-image 0.5s ease;
  }

  /* Detail panel */
  .detail-panel { position: relative; z-index: 1; min-height: 100px; overflow: hidden; }
  .detail-bg {
    position: absolute; top:0; left:0; right:0; bottom:0;
    background-size: cover; background-position: center top;
    opacity: 0.8; filter: brightness(0.4);
    transition: all 0.5s ease;
  }
  .detail-content {
    position: relative; z-index: 1; padding: 16px; color: white;
    min-height: 80px; display: flex; flex-direction: column; justify-content: flex-end;
  }
  .detail-title { font-size: 1.3em; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,.6); line-height: 1.2; }
  .detail-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
  .detail-type { font-size: .8em; text-transform: uppercase; opacity: .8; letter-spacing: .5px; }
  .detail-rating { display: flex; align-items: center; gap: 4px; font-size: .85em; color: #fbbf24; }
  .detail-rating ha-icon { --mdc-icon-size: 16px; color: #fbbf24; }
  .detail-overview {
    font-size: .85em; opacity: .8; margin-top: 6px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;
  }
  .detail-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .detail-request-info { display: flex; gap: 16px; margin-top: 8px; opacity: .8; font-size: .85em; }
  .request-meta { display: flex; align-items: center; gap: 4px; }
  .request-meta ha-icon { --mdc-icon-size: 16px; }

  /* Not configured notice */
  .seer-not-configured {
    padding: 24px 16px; text-align: center; color: var(--primary-text-color); opacity: .7;
  }
  .seer-not-configured ha-icon { --mdc-icon-size: 48px; display: block; margin: 0 auto 12px; opacity: .4; }
  .seer-not-configured p { margin: 4px 0; font-size: .9em; }
  .seer-not-configured strong { color: var(--primary-color); }

  /* Sections */
  .sections-container { position: relative; z-index: 1; padding-bottom: 8px; }
  .section { margin-bottom: 2px; }
  .section-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 12px; cursor: pointer; user-select: none;
    transition: background-color .25s ease;
  }
  .section-header:hover { background: rgba(255,255,255,.05); }
  .section-header-content { display: flex; align-items: center; gap: 6px; }
  .section-header-right { display: flex; align-items: center; gap: 8px; }
  .section-toggle-icon { --mdc-icon-size: 18px; transition: transform .25s ease; opacity: .6; }
  .section-icon { --mdc-icon-size: 16px; opacity: .7; }
  .section-label {
    font-weight: 600; font-size: .75em; text-transform: uppercase;
    letter-spacing: .8px; opacity: .9; color: var(--primary-text-color);
  }
  .section-badge {
    font-size: .7em; background: rgba(255,255,255,.1); padding: 1px 6px;
    border-radius: 10px; color: var(--secondary-text-color); min-width: 18px; text-align: center;
  }
  .section-badge:empty { display: none; }
  .section-content { max-height: 300px; transition: all .25s ease; overflow: hidden; opacity: 1; }
  .section-content.collapsed { max-height: 0; opacity: 0; }

  /* Media list */
  .media-list {
    display: flex; gap: 6px; overflow-x: auto; padding: 4px 12px 8px;
    scrollbar-width: thin; scrollbar-color: #6366f1 transparent;
    -webkit-overflow-scrolling: touch;
  }
  .media-list::-webkit-scrollbar { height: 3px; }
  .media-list::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }
  @media (max-width: 600px) {
    .media-list { scrollbar-width: none; }
    .media-list::-webkit-scrollbar { display: none; }
  }

  /* Media item */
  .media-item {
    flex: 0 0 auto; width: 90px; height: 135px; position: relative;
    cursor: pointer; border-radius: 8px; overflow: hidden;
    transition: transform .25s ease, box-shadow .25s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,.3);
  }
  .media-item:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 6px 16px rgba(0,0,0,.4); }
  .media-item.selected { box-shadow: 0 0 0 2px #6366f1, 0 4px 12px rgba(99,102,241,.3); transform: translateY(-2px); }
  .media-item img { width: 100%; height: 100%; object-fit: cover; }
  .no-poster {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,.05); color: var(--secondary-text-color);
  }
  .no-poster ha-icon { --mdc-icon-size: 32px; opacity: .3; }
  .media-item-overlay {
    position: absolute; bottom:0; left:0; right:0; padding: 24px 6px 6px;
    background: linear-gradient(transparent, rgba(0,0,0,.9));
  }
  .media-item-title {
    font-size: .7em; color: white; font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    text-shadow: 0 1px 3px rgba(0,0,0,.8); line-height: 1.2;
  }
  .media-item-year { font-size: .6em; color: rgba(255,255,255,.6); }

  /* Status dots */
  .status-dot {
    position: absolute; top: 4px; left: 4px; width: 8px; height: 8px;
    border-radius: 50%; border: 1.5px solid rgba(0,0,0,.3);
  }
  .status-dot.s-available { background: #22c55e; }
  .status-dot.s-partial   { background: #f59e0b; }
  .status-dot.s-processing{ background: #3b82f6; }
  .status-dot.s-pending   { background: #f59e0b; }
  .status-dot.s-approved  { background: #22c55e; }
  .status-dot.s-declined  { background: #ef4444; }

  /* Type + request badge */
  .media-type-badge {
    position: absolute; top: 4px; right: 4px; font-size: .55em; font-weight: 700;
    padding: 1px 4px; border-radius: 3px; background: rgba(0,0,0,.6); color: white;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .req-badge {
    position: absolute; top: 4px; left: 4px; font-size: .6em; font-weight: 600;
    width: 16px; height: 16px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; line-height: 1;
  }
  .req-badge.b-pending  { background: #f59e0b; color: #000; }
  .req-badge.b-approved { background: #22c55e; color: #000; }
  .req-badge.b-declined { background: #ef4444; color: white; }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; padding: 2px 8px;
    border-radius: 12px; font-size: .75em; font-weight: 500;
  }
  .b-available  { background: #22c55e; color: #000; }
  .b-partial    { background: #f59e0b; color: #000; }
  .b-processing { background: #3b82f6; color: white; }
  .b-pending    { background: #f59e0b; color: #000; }
  .b-approved   { background: #22c55e; color: #000; }
  .b-declined   { background: #ef4444; color: white; }
  .b-unknown    { background: rgba(255,255,255,.2); color: var(--primary-text-color); }
  .b-4k         { background: #7c3aed; color: white; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
    border: none; border-radius: 8px; cursor: pointer; font-size: .85em; font-weight: 500;
    transition: all .25s ease; color: white; font-family: inherit;
  }
  .btn ha-icon { --mdc-icon-size: 16px; }
  .btn:disabled { opacity: .6; cursor: not-allowed; }
  .btn-primary  { background: #6366f1; }
  .btn-primary:hover:not(:disabled) { background: #818cf8; }
  .btn-secondary{ background: rgba(255,255,255,.15); }
  .btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,.25); }
  .btn-success  { background: #22c55e; color: #000; }
  .btn-danger   { background: #ef4444; }
  .btn-outline  { background: transparent; border: 1px solid rgba(255,255,255,.3); color: var(--primary-text-color); }
  .btn-outline:hover:not(:disabled) { background: rgba(255,255,255,.1); }

  /* Search */
  .search-section { margin-bottom: 2px; }
  .search-container { display: flex; align-items: center; padding: 8px 12px; position: relative; }
  .search-icon { --mdc-icon-size: 20px; opacity: .5; position: absolute; left: 20px; z-index: 1; }
  .search-input {
    flex: 1; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px; padding: 8px 36px 8px 40px; color: var(--primary-text-color);
    font-size: .9em; outline: none; transition: all .25s ease; font-family: inherit;
  }
  .search-input:focus { background: rgba(255,255,255,.12); border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,.2); }
  .search-input::placeholder { color: var(--secondary-text-color); opacity: .5; }
  .search-clear { position: absolute; right: 20px; background: none; border: none; cursor: pointer; color: var(--secondary-text-color); padding: 4px; display: flex; align-items: center; }
  .search-clear ha-icon { --mdc-icon-size: 18px; }

  /* Filter chips */
  .filter-chips { display: flex; gap: 4px; }
  .chip {
    background: rgba(255,255,255,.08); border: none; border-radius: 12px;
    padding: 2px 8px; font-size: .65em; color: var(--secondary-text-color);
    cursor: pointer; transition: all .25s ease; font-family: inherit; white-space: nowrap;
  }
  .chip:hover { background: rgba(255,255,255,.15); }
  .chip.active { background: #6366f1; color: white; }

  /* Empty / loading */
  .empty-section {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px; color: var(--secondary-text-color); font-size: .85em; opacity: .6;
  }
  .empty-section ha-icon { --mdc-icon-size: 20px; }
  .loading-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; color: var(--secondary-text-color); font-size: .85em; }
  @keyframes seer-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: seer-spin 1s linear infinite; display: inline-flex; }

  /* Modals */
  .seer-modal-overlay {
    position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,.6);
    display: flex; align-items: center; justify-content: center; z-index: 9999;
    backdrop-filter: blur(4px);
  }
  .seer-modal {
    background: var(--card-background-color, #2a2a2a); border-radius: 12px;
    width: 90%; max-width: 380px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.5);
  }
  .seer-modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.08);
    font-weight: 600; font-size: .95em;
  }
  .seer-modal-close { background: none; border: none; cursor: pointer; color: var(--secondary-text-color); padding: 4px; display: flex; align-items: center; }
  .seer-modal-body { padding: 16px; }
  .seer-modal-body p { margin: 0 0 16px; font-size: .9em; color: var(--primary-text-color); }
  .season-options { display: flex; flex-direction: column; gap: 8px; }
  .season-options .btn { justify-content: center; width: 100%; }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }

  /* Responsive */
  .hidden { display: none !important; }
  @media (max-width: 500px) {
    .detail-title { font-size: 1.1em; }
    .detail-overview { -webkit-line-clamp: 1; }
    .media-item { width: 80px; height: 120px; }
    .filter-chips { display: none; }
    .btn { padding: 5px 10px; font-size: .8em; }
  }
`;

// ─── API CLIENT ───────────────────────────────────────────────────────────────

const TMDB_IMG = 'https://image.tmdb.org/t/p';

class SeerApi {
  constructor(hass) {
    this._hass = hass;
    this._cache = new Map();
    this._ttl = 60000;
  }

  updateHass(h) { this._hass = h; }
  clearCache() { this._cache.clear(); }

  async _fetch(endpoint, options) {
    const method = (options && options.method || 'GET').toUpperCase();
    const cacheKey = method + ':' + endpoint + ':' + (options && options.body || '');

    if (method === 'GET') {
      const cached = this._cache.get(cacheKey);
      if (cached && Date.now() - cached.t < this._ttl) return cached.d;
    }

    const msg = { type: 'seer_ha/request', endpoint, method };
    if (options && options.body) msg.body = JSON.parse(options.body);

    const data = await this._hass.connection.sendMessagePromise(msg);

    if (method === 'GET') this._cache.set(cacheKey, { d: data, t: Date.now() });
    return data;
  }

  poster(p, s)  { s = s || 'w500';  if (!p) return null; return p.startsWith('http') ? p : TMDB_IMG + '/' + s + p; }
  backdrop(p, s){ s = s || 'w1280'; if (!p) return null; return p.startsWith('http') ? p : TMDB_IMG + '/' + s + p; }

  search(q, p)        { p = p||1; if (!q||!q.trim()) return Promise.resolve({results:[]}); return this._fetch('/search?query=' + encodeURIComponent(q) + '&page=' + p); }
  getTrending(p)      { return this._fetch('/discover/trending?page=' + (p||1)); }
  getPopularMovies(p) { return this._fetch('/discover/movies?page=' + (p||1)); }
  getPopularTV(p)     { return this._fetch('/discover/tv?page=' + (p||1)); }
  getUpcoming(p)      { return this._fetch('/discover/movies/upcoming?page=' + (p||1)); }
  getWatchlist(p)     { return this._fetch('/discover/watchlist?page=' + (p||1)); }

  getRequests(params) {
    params = params || {};
    const q = new URLSearchParams();
    if (params.take)   q.set('take', params.take);
    if (params.filter) q.set('filter', params.filter);
    if (params.sort)   q.set('sort', params.sort);
    const qs = q.toString();
    return this._fetch('/request' + (qs ? '?' + qs : ''));
  }

  createMovieRequest(id, opts) {
    opts = opts || {};
    return this._fetch('/request', { method:'POST', body: JSON.stringify({ mediaType:'movie', mediaId:id, is4k: opts.is4k||false }) });
  }

  createTvRequest(id, opts) {
    opts = opts || {};
    return this._fetch('/request', { method:'POST', body: JSON.stringify({ mediaType:'tv', mediaId:id, is4k: opts.is4k||false, seasons: opts.seasons||'all' }) });
  }

  approveRequest(id) { return this._fetch('/request/' + id + '/approve', { method:'POST' }); }
  declineRequest(id) { return this._fetch('/request/' + id + '/decline', { method:'POST' }); }
  deleteRequest(id)  { return this._fetch('/request/' + id, { method:'DELETE' }); }

  normalizeResult(item) {
    const mt = item.mediaType || (item.firstAirDate ? 'tv' : 'movie');
    const mi = item.mediaInfo || null;
    const d  = item.releaseDate || item.firstAirDate;
    let year = '';
    try { if (d) year = new Date(d).getFullYear().toString(); } catch(e){}
    return {
      tmdbId: item.id,
      title: item.title || item.name || '',
      year,
      overview: item.overview || '',
      mediaType: mt,
      poster:   this.poster(item.posterPath),
      backdrop: this.backdrop(item.backdropPath),
      rating:   item.voteAverage ? Math.round(item.voteAverage * 10) / 10 : null,
      mediaStatus: mi ? mi.status : 0,
      requests: mi ? (mi.requests || []) : [],
    };
  }

  normalizeRequest(req) {
    const m = req.media || {};
    return {
      requestId: req.id,
      tmdbId: m.tmdbId,
      title: m.title || m.name || '',
      mediaType: req.type || m.mediaType || 'movie',
      status: req.status,
      mediaStatus: m.status || 0,
      poster:   this.poster(m.posterPath),
      backdrop: this.backdrop(m.backdropPath),
      requestedBy: (req.requestedBy && (req.requestedBy.displayName || req.requestedBy.email)) || 'Inconnu',
      requestedAt: req.createdAt,
      is4k: req.is4k || false,
    };
  }
}

// ─── BASE SECTION ─────────────────────────────────────────────────────────────

class SeerBaseSection {
  constructor(key, title, icon) {
    this.key   = key;
    this.title = title;
    this.icon  = icon || 'mdi:filmstrip';
    this._items = [];
  }

  generateTemplate() {
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-header">
          <div class="section-header-content">
            <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
            <ha-icon class="section-icon" icon="${this.icon}"></ha-icon>
            <div class="section-label">${this.title}</div>
          </div>
          <div class="section-badge" data-badge="${this.key}"></div>
        </div>
        <div class="section-content">
          <div class="media-list" data-list="${this.key}"></div>
        </div>
      </div>`;
  }

  _statusDotClass(item) {
    const ms = item.mediaStatus;
    if (ms === 5) return 's-available';
    if (ms === 4) return 's-partial';
    if (ms === 3) return 's-processing';
    if (ms === 2 || ms === 1) return 's-pending';
    if (item.requests && item.requests.length) {
      const s = item.requests[item.requests.length - 1].status;
      if (s === 2) return 's-approved';
      if (s === 1) return 's-pending';
      if (s === 3) return 's-declined';
    }
    return '';
  }

  _renderItem(item, index, card) {
    const sel = card._selectedSection === this.key && card._selectedIndex === index;
    const dot = this._statusDotClass(item);
    const typeLabel = item.mediaType === 'tv' ? 'TV' : 'Film';
    return `
      <div class="media-item${sel ? ' selected' : ''}" data-section="${this.key}" data-index="${index}">
        ${item.poster
          ? `<img src="${item.poster}" alt="${item.title||''}" loading="lazy">`
          : `<div class="no-poster"><ha-icon icon="mdi:image-off"></ha-icon></div>`}
        <div class="media-item-overlay">
          <div class="media-item-title">${item.title||''}</div>
          ${item.year ? `<div class="media-item-year">${item.year}</div>` : ''}
        </div>
        ${dot ? `<div class="status-dot ${dot}"></div>` : ''}
        ${item.mediaType ? `<div class="media-type-badge">${typeLabel}</div>` : ''}
      </div>`;
  }

  renderItems(card, items) {
    const list = card.querySelector('[data-list="' + this.key + '"]');
    if (!list) return;
    this._items = items;

    if (!items || !items.length) {
      list.innerHTML = `<div class="empty-section"><ha-icon icon="mdi:movie-search-outline"></ha-icon><span>Aucun contenu</span></div>`;
      return;
    }

    list.innerHTML = items.map((it, i) => this._renderItem(it, i, card)).join('');

    const badge = card.querySelector('[data-badge="' + this.key + '"]');
    if (badge) badge.textContent = items.length;

    list.querySelectorAll('.media-item').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.index);
        card._selectedSection = this.key;
        card._selectedIndex   = idx;
        this.showDetail(card, this._items[idx]);
        card.querySelectorAll('.media-item').forEach(i => {
          i.classList.toggle('selected', i.dataset.section === this.key && parseInt(i.dataset.index) === idx);
        });
      };
    });
  }

  showDetail(card, item) {
    if (!item) return;
    if (item.backdrop || item.poster) card._setBackground(item.backdrop || item.poster);

    const typeLabel = item.mediaType === 'tv' ? 'Série TV' : 'Film';
    const rating    = item.rating ? `<div class="detail-rating"><ha-icon icon="mdi:star"></ha-icon> ${item.rating}/10</div>` : '';
    const statusBadge = this._mediaStatusBadge(item.mediaStatus);
    const action    = this._actionButton(item);

    card._detailContent.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">${item.title||''}${item.year ? ' (' + item.year + ')' : ''}</div>
        <div class="detail-meta">
          <span class="detail-type">${typeLabel}</span>
          ${rating}${statusBadge}
        </div>
      </div>
      ${item.overview ? `<div class="detail-overview">${item.overview}</div>` : ''}
      <div class="detail-actions">${action}</div>`;
  }

  _mediaStatusBadge(ms) {
    const map = { 5:'<span class="badge b-available">Disponible</span>', 4:'<span class="badge b-partial">Partiel</span>', 3:'<span class="badge b-processing">En cours</span>', 2:'<span class="badge b-pending">En attente</span>' };
    return map[ms] || '';
  }

  _actionButton(item) {
    if (!item.tmdbId || item.mediaStatus === 5) return '';
    if (item.requests && item.requests.length) {
      const s = item.requests[item.requests.length - 1].status;
      if (s === 1) return `<button class="btn btn-secondary" disabled><ha-icon icon="mdi:clock-outline"></ha-icon> En attente</button>`;
      if (s === 2) return `<button class="btn btn-success" disabled><ha-icon icon="mdi:check"></ha-icon> Approuvé</button>`;
    }
    const mt = item.mediaType || 'movie';
    return `<button class="btn btn-primary" data-action="request" data-tmdb-id="${item.tmdbId}" data-media-type="${mt}" data-title="${(item.title||'').replace(/"/g,'&quot;')}"><ha-icon icon="mdi:plus"></ha-icon> Demander</button>`;
  }

  formatDate(s) {
    if (!s) return '';
    try { return new Date(s).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }); } catch(e) { return ''; }
  }

  async load() {}
}

// ─── SEARCH SECTION ──────────────────────────────────────────────────────────

class SeerSearchSection extends SeerBaseSection {
  constructor() { super('search', 'Recherche', 'mdi:magnify'); this._q = ''; this._timer = null; }

  generateTemplate() {
    return `
      <div class="section search-section" data-section="${this.key}">
        <div class="search-container">
          <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
          <input type="text" class="search-input" placeholder="Rechercher un film ou une série..." data-search-input>
          <button class="search-clear hidden" data-search-clear><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <div class="section-content">
          <div class="media-list" data-list="${this.key}"></div>
        </div>
      </div>`;
  }

  setupHandlers(card) {
    const input = card.querySelector('[data-search-input]');
    const clear = card.querySelector('[data-search-clear]');
    if (!input) return;

    input.oninput = () => {
      this._q = input.value;
      clear.classList.toggle('hidden', !this._q);
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this._doSearch(card), 400);
    };
    input.onkeydown = (e) => { if (e.key === 'Enter') { clearTimeout(this._timer); this._doSearch(card); } };
    if (clear) clear.onclick = () => {
      input.value = ''; this._q = ''; clear.classList.add('hidden');
      const list = card.querySelector('[data-list="' + this.key + '"]');
      if (list) list.innerHTML = '';
    };
  }

  async _doSearch(card) {
    if (!this._q.trim()) return;
    const list = card.querySelector('[data-list="' + this.key + '"]');
    if (list) list.innerHTML = `<div class="loading-indicator"><ha-icon icon="mdi:loading" class="spin"></ha-icon><span>Recherche...</span></div>`;
    try {
      const max  = card.config.max_items || 20;
      const data = await card._api.search(this._q);
      const items = (data.results || []).filter(r => r.mediaType === 'movie' || r.mediaType === 'tv').slice(0, max).map(r => card._api.normalizeResult(r));
      this.renderItems(card, items);
      if (!items.length && list) list.innerHTML = `<div class="empty-section"><ha-icon icon="mdi:movie-search-outline"></ha-icon><span>Aucun résultat pour "${this._q}"</span></div>`;
    } catch(e) {
      if (list) list.innerHTML = `<div class="empty-section"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>Erreur de recherche</span></div>`;
    }
  }

  async load() {}
}

// ─── REQUESTS SECTION ─────────────────────────────────────────────────────────

class SeerRequestsSection extends SeerBaseSection {
  constructor() { super('requests', 'Requêtes', 'mdi:clipboard-list-outline'); this._filter = 'all'; }

  generateTemplate() {
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-header">
          <div class="section-header-content">
            <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
            <ha-icon class="section-icon" icon="${this.icon}"></ha-icon>
            <div class="section-label">${this.title}</div>
          </div>
          <div class="section-header-right">
            <div class="filter-chips" data-filter-group="requests">
              <button class="chip active" data-filter="all">Tout</button>
              <button class="chip" data-filter="pending">En attente</button>
              <button class="chip" data-filter="approved">Approuvé</button>
              <button class="chip" data-filter="available">Disponible</button>
            </div>
            <div class="section-badge" data-badge="${this.key}"></div>
          </div>
        </div>
        <div class="section-content">
          <div class="media-list" data-list="${this.key}"></div>
        </div>
      </div>`;
  }

  async load(card) {
    try {
      const max  = card.config.max_items || 20;
      const data = await card._api.getRequests({ take: max, filter: this._filter === 'all' ? undefined : this._filter, sort: 'added' });
      const items = (data.results || []).map(r => card._api.normalizeRequest(r));
      this._setupFilters(card);
      this._renderRequests(card, items);
    } catch(e) {
      const list = card.querySelector('[data-list="' + this.key + '"]');
      if (list) list.innerHTML = `<div class="empty-section"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>Erreur de chargement</span></div>`;
    }
  }

  _setupFilters(card) {
    const g = card.querySelector('[data-filter-group="requests"]');
    if (!g || g._done) return;
    g.querySelectorAll('.chip').forEach(c => {
      c.onclick = (e) => {
        e.stopPropagation();
        g.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this._filter = c.dataset.filter;
        this.load(card);
      };
    });
    g._done = true;
  }

  _renderRequests(card, items) {
    this._items = items;
    const list = card.querySelector('[data-list="' + this.key + '"]');
    if (!list) return;

    const badge = card.querySelector('[data-badge="' + this.key + '"]');
    if (badge) badge.textContent = items.length;

    if (!items.length) {
      list.innerHTML = `<div class="empty-section"><ha-icon icon="mdi:clipboard-check-outline"></ha-icon><span>Aucune requête</span></div>`;
      return;
    }

    const statusLabel = { 1:'?', 2:'✓', 3:'✗' };
    const statusClass = { 1:'b-pending', 2:'b-approved', 3:'b-declined' };

    list.innerHTML = items.map((item, i) => {
      const sel = card._selectedSection === this.key && card._selectedIndex === i;
      const sl  = statusLabel[item.status] || '?';
      const sc  = statusClass[item.status] || 'b-unknown';
      return `
        <div class="media-item${sel ? ' selected' : ''}" data-section="${this.key}" data-index="${i}">
          ${item.poster ? `<img src="${item.poster}" alt="${item.title||''}" loading="lazy">` : `<div class="no-poster"><ha-icon icon="mdi:image-off"></ha-icon></div>`}
          <div class="media-item-overlay"><div class="media-item-title">${item.title||''}</div></div>
          <div class="req-badge ${sc}">${sl}</div>
          <div class="media-type-badge">${item.mediaType === 'tv' ? 'TV' : 'Film'}</div>
        </div>`;
    }).join('');

    list.querySelectorAll('.media-item').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.index);
        card._selectedSection = this.key;
        card._selectedIndex   = idx;
        this.showDetail(card, this._items[idx]);
        list.querySelectorAll('.media-item').forEach(i => {
          i.classList.toggle('selected', parseInt(i.dataset.index) === idx);
        });
      };
    });
  }

  showDetail(card, item) {
    if (!item) return;
    if (item.backdrop || item.poster) card._setBackground(item.backdrop || item.poster);

    const typeLabel  = item.mediaType === 'tv' ? 'Série TV' : 'Film';
    const statusMap  = { 1:['b-pending','En attente'], 2:['b-approved','Approuvé'], 3:['b-declined','Refusé'] };
    const [sc, st]   = statusMap[item.status] || ['b-unknown','Inconnu'];
    const msMap      = { 2:'b-pending', 3:'b-processing', 4:'b-partial', 5:'b-available' };
    const msLabel    = { 2:'En attente', 3:'Traitement', 4:'Partiel', 5:'Disponible' };

    let actions = '';
    if (item.status === 1) {
      actions += `<button class="btn btn-success" data-action="approve-request" data-request-id="${item.requestId}"><ha-icon icon="mdi:check"></ha-icon> Approuver</button>`;
      actions += `<button class="btn btn-danger"  data-action="decline-request" data-request-id="${item.requestId}"><ha-icon icon="mdi:close"></ha-icon> Refuser</button>`;
    }
    actions += `<button class="btn btn-outline" data-action="delete-request" data-request-id="${item.requestId}"><ha-icon icon="mdi:delete"></ha-icon> Supprimer</button>`;

    card._detailContent.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">${item.title||''}</div>
        <div class="detail-meta">
          <span class="detail-type">${typeLabel}</span>
          <span class="badge ${sc}">${st}</span>
          ${msMap[item.mediaStatus] ? `<span class="badge ${msMap[item.mediaStatus]}">${msLabel[item.mediaStatus]}</span>` : ''}
          ${item.is4k ? '<span class="badge b-4k">4K</span>' : ''}
        </div>
      </div>
      <div class="detail-request-info">
        <div class="request-meta"><ha-icon icon="mdi:account"></ha-icon><span>${item.requestedBy}</span></div>
        <div class="request-meta"><ha-icon icon="mdi:calendar"></ha-icon><span>${this.formatDate(item.requestedAt)}</span></div>
      </div>
      <div class="detail-actions">${actions}</div>`;
  }
}

// ─── SIMPLE SECTIONS (Trending, Discover, Watchlist) ─────────────────────────

class SeerTrendingSection extends SeerBaseSection {
  constructor() { super('trending', 'Tendances', 'mdi:fire'); }
  async load(card) {
    try {
      const data  = await card._api.getTrending();
      const items = (data.results||[]).slice(0, card.config.max_items||20).map(r => card._api.normalizeResult(r));
      this.renderItems(card, items);
    } catch(e) { console.error('Seer trending:', e); }
  }
}

class SeerDiscoverMoviesSection extends SeerBaseSection {
  constructor() { super('discover_movies', 'Films Populaires', 'mdi:movie-open'); }
  async load(card) {
    try {
      const data  = await card._api.getPopularMovies();
      const items = (data.results||[]).slice(0, card.config.max_items||20).map(r => card._api.normalizeResult(r));
      this.renderItems(card, items);
    } catch(e) { console.error('Seer popular movies:', e); }
  }
}

class SeerDiscoverTvSection extends SeerBaseSection {
  constructor() { super('discover_tv', 'Séries Populaires', 'mdi:television-classic'); }
  async load(card) {
    try {
      const data  = await card._api.getPopularTV();
      const items = (data.results||[]).slice(0, card.config.max_items||20).map(r => card._api.normalizeResult(r));
      this.renderItems(card, items);
    } catch(e) { console.error('Seer popular tv:', e); }
  }
}

class SeerUpcomingSection extends SeerBaseSection {
  constructor() { super('upcoming', 'Films à venir', 'mdi:calendar-star'); }
  async load(card) {
    try {
      const data  = await card._api.getUpcoming();
      const items = (data.results||[]).slice(0, card.config.max_items||20).map(r => card._api.normalizeResult(r));
      this.renderItems(card, items);
    } catch(e) { console.error('Seer upcoming:', e); }
  }
}

class SeerWatchlistSection extends SeerBaseSection {
  constructor() { super('watchlist', 'Ma Watchlist', 'mdi:bookmark-multiple'); }
  async load(card) {
    try {
      const data  = await card._api.getWatchlist();
      const items = (data.results||[]).slice(0, card.config.max_items||20).map(r => card._api.normalizeResult(r));
      this.renderItems(card, items);
    } catch(e) { console.error('Seer watchlist:', e); }
  }
}

// ─── MAIN CARD ────────────────────────────────────────────────────────────────

class SeerCard extends HTMLElement {
  constructor() {
    super();
    this._api       = null;
    this._initialized = false;
    this._selectedSection = null;
    this._selectedIndex   = 0;
    this._collapsed = new Set();
    this._timer     = null;
  }

  setConfig(config) {
    this.config = Object.assign({
      max_items: 20,
      refresh_interval: 300,
      opacity: 0.8,
      blur_radius: 0,
      sections: ['search','requests','trending','discover_movies','discover_tv','upcoming','watchlist'],
    }, config);

    this._allSections = {
      search:         new SeerSearchSection(),
      requests:       new SeerRequestsSection(),
      trending:       new SeerTrendingSection(),
      discover_movies:new SeerDiscoverMoviesSection(),
      discover_tv:    new SeerDiscoverTvSection(),
      upcoming:       new SeerUpcomingSection(),
      watchlist:      new SeerWatchlistSection(),
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._api) {
      this._api = new SeerApi(hass);
    } else {
      this._api.updateHass(hass);
    }
    if (!this._initialized) this._init();
  }

  _init() {
    this._initialized = true;

    const sectionsHtml = this.config.sections
      .filter(k => this._allSections[k])
      .map(k => this._allSections[k].generateTemplate(this.config))
      .join('');

    this.innerHTML = `
      <ha-card>
        <div class="seer-card">
          <div class="card-bg"></div>
          <div class="detail-panel">
            <div class="detail-bg"></div>
            <div class="detail-content"></div>
          </div>
          <div class="sections-container">${sectionsHtml}</div>
        </div>
      </ha-card>
      <style>${SEER_STYLES}</style>`;

    this._cardBg       = this.querySelector('.card-bg');
    this._detailBg     = this.querySelector('.detail-bg');
    this._detailContent= this.querySelector('.detail-content');

    this._bindEvents();
    this._loadAll();

    if (this.config.refresh_interval > 0) {
      this._timer = setInterval(() => { this._api.clearCache(); this._loadAll(); }, this.config.refresh_interval * 1000);
    }
  }

  _bindEvents() {
    // Section collapse
    this.querySelectorAll('.section-header').forEach(h => {
      h.onclick = (e) => {
        if (e.target.closest('.filter-chips')) return;
        const sec = h.closest('[data-section]');
        if (!sec) return;
        const k = sec.dataset.section;
        const c = sec.querySelector('.section-content');
        const i = sec.querySelector('.section-toggle-icon');
        if (this._collapsed.has(k)) { this._collapsed.delete(k); c.classList.remove('collapsed'); i.style.transform = ''; }
        else                        { this._collapsed.add(k);    c.classList.add('collapsed');    i.style.transform = 'rotate(-90deg)'; }
      };
    });

    // Search
    this._allSections.search && this._allSections.search.setupHandlers(this);

    // Action buttons
    this.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) await this._handleAction(btn.dataset.action, btn);
    });
  }

  async _handleAction(action, btn) {
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<ha-icon icon="mdi:loading" class="spin"></ha-icon>';
    try {
      if (action === 'request') {
        const id   = parseInt(btn.dataset.tmdbId);
        const type = btn.dataset.mediaType;
        const name = btn.dataset.title;
        if (type === 'tv') {
          const season = await this._seasonPicker(name);
          if (season === null) { btn.disabled = false; btn.innerHTML = orig; return; }
          await this._api.createTvRequest(id, { seasons: season });
        } else {
          await this._api.createMovieRequest(id);
        }
        btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Demandé'; btn.classList.add('btn-success');
        this._api.clearCache(); this._allSections.requests && this._allSections.requests.load(this);
      } else if (action === 'approve-request') {
        await this._api.approveRequest(parseInt(btn.dataset.requestId));
        btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Approuvé'; btn.classList.add('btn-success');
        this._api.clearCache(); this._allSections.requests && this._allSections.requests.load(this);
      } else if (action === 'decline-request') {
        await this._api.declineRequest(parseInt(btn.dataset.requestId));
        btn.innerHTML = '<ha-icon icon="mdi:close"></ha-icon> Refusé'; btn.classList.add('btn-danger');
        this._api.clearCache(); this._allSections.requests && this._allSections.requests.load(this);
      } else if (action === 'delete-request') {
        if (await this._confirm('Supprimer cette requête ?')) {
          await this._api.deleteRequest(parseInt(btn.dataset.requestId));
          btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Supprimé';
          this._api.clearCache(); this._allSections.requests && this._allSections.requests.load(this);
        } else { btn.disabled = false; btn.innerHTML = orig; }
      }
    } catch(err) {
      console.error('Seer Card:', err);
      btn.innerHTML = '<ha-icon icon="mdi:alert"></ha-icon> Erreur'; btn.classList.add('btn-danger');
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.classList.remove('btn-danger'); }, 3000);
    }
  }

  _seasonPicker(title) {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'seer-modal-overlay';
      modal.innerHTML = `
        <div class="seer-modal">
          <div class="seer-modal-header"><span>Choisir les saisons</span><button class="seer-modal-close"><ha-icon icon="mdi:close"></ha-icon></button></div>
          <div class="seer-modal-body">
            <p>Quelles saisons pour <strong>${title}</strong> ?</p>
            <div class="season-options">
              <button class="btn btn-primary season-btn" data-season="all">Toutes les saisons</button>
              <button class="btn btn-secondary season-btn" data-season="latest">Dernière saison</button>
              <button class="btn btn-secondary season-btn" data-season="first">Première saison</button>
            </div>
          </div>
        </div>`;
      const close = () => { modal.remove(); resolve(null); };
      modal.querySelector('.seer-modal-close').onclick = close;
      modal.onclick = e => { if (e.target === modal) close(); };
      modal.querySelectorAll('.season-btn').forEach(b => { b.onclick = () => { modal.remove(); resolve(b.dataset.season); }; });
      this.appendChild(modal);
    });
  }

  _confirm(msg) {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'seer-modal-overlay';
      modal.innerHTML = `
        <div class="seer-modal">
          <div class="seer-modal-body">
            <p>${msg}</p>
            <div class="modal-actions">
              <button class="btn btn-danger" data-y>Confirmer</button>
              <button class="btn btn-outline" data-n>Annuler</button>
            </div>
          </div>
        </div>`;
      modal.querySelector('[data-y]').onclick = () => { modal.remove(); resolve(true); };
      modal.querySelector('[data-n]').onclick = () => { modal.remove(); resolve(false); };
      modal.onclick = e => { if (e.target === modal) { modal.remove(); resolve(false); } };
      this.appendChild(modal);
    });
  }

  async _loadAll() {
    const loads = this.config.sections
      .filter(k => this._allSections[k] && k !== 'search')
      .map(k => this._allSections[k].load(this));
    await Promise.allSettled(loads);
  }

  _setBackground(url) {
    if (!url) return;
    if (this._cardBg) this._cardBg.style.backgroundImage = `url('${url}')`;
    if (this._detailBg) {
      this._detailBg.style.backgroundImage = `url('${url}')`;
      this._detailBg.style.opacity = this.config.opacity || 0.8;
      this._detailBg.style.filter  = `blur(${this.config.blur_radius||0}px) brightness(0.4)`;
    }
  }

  disconnectedCallback() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  getCardSize() { return 6; }

  static getStubConfig() {
    return {
      max_items: 20,
      refresh_interval: 300,
      opacity: 0.8,
      sections: ['search','requests','trending','discover_movies','discover_tv','upcoming','watchlist'],
    };
  }
}

customElements.define('seer-card', SeerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'seer-card',
  name: 'Seer Card',
  description: 'Carte média complète propulsée par Seer — requêtes, découverte, watchlist et recherche.',
  preview: true,
});
