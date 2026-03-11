// seer-card.js - Seer Card for Home Assistant
// API calls go through the seer_ha integration (HA WebSocket) — no CORS issues
import { SeerApi } from './seer-api.js';
import { SearchSection } from './search-section.js';
import { RequestsSection } from './requests-section.js';
import { TrendingSection } from './trending-section.js';
import { DiscoverMoviesSection, DiscoverTvSection, UpcomingMoviesSection } from './discover-section.js';
import { WatchlistSection } from './watchlist-section.js';
import { styles } from './styles.js';

class SeerCard extends HTMLElement {
  constructor() {
    super();
    this._api = null;
    this._selectedSection = null;
    this._selectedIndex = 0;
    this._refreshTimer = null;
    this._initialized = false;
    this._collapsedSections = new Set();
  }

  setConfig(config) {
    this.config = {
      max_items: 20,
      refresh_interval: 300,
      opacity: 0.8,
      blur_radius: 0,
      sections: ['search', 'requests', 'trending', 'discover_movies', 'discover_tv', 'upcoming', 'watchlist'],
      ...config,
    };

    this._allSections = {
      search: new SearchSection(),
      requests: new RequestsSection(),
      trending: new TrendingSection(),
      discover_movies: new DiscoverMoviesSection(),
      discover_tv: new DiscoverTvSection(),
      upcoming: new UpcomingMoviesSection(),
      watchlist: new WatchlistSection(),
    };
  }

  set hass(hass) {
    this._hass = hass;
    // Create or update the API client (uses hass WS connection)
    if (!this._api) {
      this._api = new SeerApi(hass);
    } else {
      this._api.updateHass(hass);
    }
    if (!this._initialized) {
      this._initCard();
    }
  }

  _initCard() {
    this._initialized = true;

    const sectionsHtml = this.config.sections
      .filter(key => this._allSections[key])
      .map(key => this._allSections[key].generateTemplate(this.config))
      .join('');

    this.innerHTML = `
      <ha-card>
        <div class="seer-card">
          <div class="card-bg"></div>
          <div class="detail-panel">
            <div class="detail-bg"></div>
            <div class="detail-content"></div>
          </div>
          <div class="sections-container">
            ${sectionsHtml}
          </div>
        </div>
      </ha-card>
      <style>${styles}</style>
    `;

    this._cardBg = this.querySelector('.card-bg');
    this._detailBg = this.querySelector('.detail-bg');
    this._detailContent = this.querySelector('.detail-content');

    this._initEventListeners();
    this._loadAllSections();

    if (this.config.refresh_interval > 0) {
      this._refreshTimer = setInterval(() => {
        this._api.clearCache();
        this._loadAllSections();
      }, this.config.refresh_interval * 1000);
    }
  }

  _initEventListeners() {
    this.querySelectorAll('.section-header').forEach(header => {
      header.onclick = (e) => {
        if (e.target.closest('.filter-chips')) return;
        const section = header.closest('[data-section]');
        if (!section) return;
        const key = section.dataset.section;
        const content = section.querySelector('.section-content');
        const icon = section.querySelector('.section-toggle-icon');
        if (this._collapsedSections.has(key)) {
          this._collapsedSections.delete(key);
          content.classList.remove('collapsed');
          icon.style.transform = 'rotate(0deg)';
        } else {
          this._collapsedSections.add(key);
          content.classList.add('collapsed');
          icon.style.transform = 'rotate(-90deg)';
        }
      };
    });

    this._allSections.search?.setupHandlers(this);

    this.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      await this._handleAction(btn.dataset.action, btn);
    });
  }

  async _handleAction(action, btn) {
    btn.disabled = true;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<ha-icon icon="mdi:loading" class="spin"></ha-icon>';

    try {
      switch (action) {
        case 'request': {
          const tmdbId = parseInt(btn.dataset.tmdbId);
          const mediaType = btn.dataset.mediaType;
          const title = btn.dataset.title;
          if (mediaType === 'tv') {
            const season = await this._showSeasonPicker(title);
            if (season === null) { btn.disabled = false; btn.innerHTML = originalHtml; return; }
            await this._api.createTvRequest(tmdbId, { seasons: season });
          } else {
            await this._api.createMovieRequest(tmdbId);
          }
          btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Demande envoyée';
          btn.classList.add('btn-success');
          this._api.clearCache();
          this._allSections.requests?.load(this);
          break;
        }
        case 'approve-request': {
          await this._api.updateRequestStatus(parseInt(btn.dataset.requestId), 'approve');
          btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Approuvé';
          btn.classList.add('btn-success');
          this._api.clearCache();
          this._allSections.requests?.load(this);
          break;
        }
        case 'decline-request': {
          await this._api.updateRequestStatus(parseInt(btn.dataset.requestId), 'decline');
          btn.innerHTML = '<ha-icon icon="mdi:close"></ha-icon> Refusé';
          btn.classList.add('btn-danger');
          this._api.clearCache();
          this._allSections.requests?.load(this);
          break;
        }
        case 'delete-request': {
          if (await this._confirmAction('Supprimer cette requête ?')) {
            await this._api.deleteRequest(parseInt(btn.dataset.requestId));
            btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Supprimé';
            this._api.clearCache();
            this._allSections.requests?.load(this);
          } else {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }
          break;
        }
      }
    } catch (err) {
      console.error('Seer Card action error:', err);
      btn.innerHTML = '<ha-icon icon="mdi:alert"></ha-icon> Erreur';
      btn.classList.add('btn-danger');
      setTimeout(() => { btn.innerHTML = originalHtml; btn.disabled = false; btn.classList.remove('btn-danger'); }, 3000);
    }
  }

  _showSeasonPicker(title) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'seer-modal-overlay';
      modal.innerHTML = `
        <div class="seer-modal">
          <div class="seer-modal-header">
            <span>Choisir les saisons</span>
            <button class="seer-modal-close"><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
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
      modal.onclick = (e) => { if (e.target === modal) close(); };
      modal.querySelectorAll('.season-btn').forEach(b => {
        b.onclick = () => { modal.remove(); resolve(b.dataset.season); };
      });
      this.appendChild(modal);
    });
  }

  _confirmAction(message) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'seer-modal-overlay';
      modal.innerHTML = `
        <div class="seer-modal">
          <div class="seer-modal-body">
            <p>${message}</p>
            <div class="modal-actions">
              <button class="btn btn-danger" data-confirm="yes">Confirmer</button>
              <button class="btn btn-outline" data-confirm="no">Annuler</button>
            </div>
          </div>
        </div>`;
      modal.querySelector('[data-confirm="yes"]').onclick = () => { modal.remove(); resolve(true); };
      modal.querySelector('[data-confirm="no"]').onclick = () => { modal.remove(); resolve(false); };
      modal.onclick = (e) => { if (e.target === modal) { modal.remove(); resolve(false); } };
      this.appendChild(modal);
    });
  }

  async _loadAllSections() {
    const promises = this.config.sections
      .filter(key => this._allSections[key] && key !== 'search')
      .map(key => this._allSections[key].load(this));
    await Promise.allSettled(promises);
  }

  _setBackground(imageUrl) {
    if (!imageUrl) return;
    if (this._cardBg) this._cardBg.style.backgroundImage = `url('${imageUrl}')`;
    if (this._detailBg) {
      this._detailBg.style.backgroundImage = `url('${imageUrl}')`;
      this._detailBg.style.opacity = this.config.opacity || 0.8;
      this._detailBg.style.filter = `blur(${this.config.blur_radius || 0}px) brightness(0.4)`;
    }
  }

  disconnectedCallback() {
    if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
  }

  getCardSize() { return 6; }

  static getStubConfig() {
    return {
      max_items: 20,
      refresh_interval: 300,
      opacity: 0.8,
      blur_radius: 0,
      sections: ['search', 'requests', 'trending', 'discover_movies', 'discover_tv', 'upcoming', 'watchlist'],
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
