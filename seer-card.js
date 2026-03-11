// seer-card.js - Main Seer Card for Home Assistant
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
    this._sections = {};
    this._selectedSection = null;
    this._selectedIndex = 0;
    this._refreshTimer = null;
    this._initialized = false;
    this._collapsedSections = new Set();
  }

  setConfig(config) {
    if (!config.seer_url) {
      throw new Error('seer_url is required');
    }
    if (!config.seer_api_key) {
      throw new Error('seer_api_key is required');
    }

    this.config = {
      max_items: 20,
      refresh_interval: 60,
      opacity: 0.8,
      blur_radius: 0,
      sections: ['search', 'requests', 'trending', 'discover_movies', 'discover_tv', 'upcoming', 'watchlist'],
      ...config,
    };

    this._api = new SeerApi(this.config.seer_url, this.config.seer_api_key);

    // Create section instances
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
    if (!this._initialized) {
      this._initCard();
    }
  }

  _initCard() {
    this._initialized = true;

    // Build HTML structure
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

    // Cache DOM refs
    this._cardBg = this.querySelector('.card-bg');
    this._detailBg = this.querySelector('.detail-bg');
    this._detailContent = this.querySelector('.detail-content');

    // Initialize event listeners
    this._initEventListeners();

    // Load data
    this._loadAllSections();

    // Auto-refresh
    if (this.config.refresh_interval > 0) {
      this._refreshTimer = setInterval(() => {
        this._api.clearCache();
        this._loadAllSections();
      }, this.config.refresh_interval * 1000);
    }
  }

  _initEventListeners() {
    // Section collapse toggles
    this.querySelectorAll('.section-header').forEach(header => {
      header.onclick = (e) => {
        // Don't toggle when clicking filter chips
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

    // Search input handlers
    const searchSection = this._allSections.search;
    if (searchSection) {
      searchSection.setupHandlers(this);
    }

    // Global action handler (request, approve, decline, delete)
    this.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      await this._handleAction(action, btn);
    });
  }

  async _handleAction(action, btn) {
    const api = this._api;
    if (!api) return;

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
            if (season === null) {
              btn.disabled = false;
              btn.innerHTML = originalHtml;
              return;
            }
            await api.createTvRequest(tmdbId, { seasons: season });
          } else {
            await api.createMovieRequest(tmdbId);
          }

          btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Demande envoyee';
          btn.classList.add('btn-success');
          this._api.clearCache();
          // Reload requests section
          const reqSection = this._allSections.requests;
          if (reqSection) reqSection.load(this);
          break;
        }

        case 'approve-request': {
          const requestId = parseInt(btn.dataset.requestId);
          await api.updateRequestStatus(requestId, 'approve');
          btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Approuve';
          btn.classList.add('btn-success');
          this._api.clearCache();
          this._allSections.requests?.load(this);
          break;
        }

        case 'decline-request': {
          const requestId = parseInt(btn.dataset.requestId);
          await api.updateRequestStatus(requestId, 'decline');
          btn.innerHTML = '<ha-icon icon="mdi:close"></ha-icon> Refuse';
          btn.classList.add('btn-danger');
          this._api.clearCache();
          this._allSections.requests?.load(this);
          break;
        }

        case 'delete-request': {
          const requestId = parseInt(btn.dataset.requestId);
          if (await this._confirmAction('Supprimer cette requete ?')) {
            await api.deleteRequest(requestId);
            btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon> Supprime';
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
      console.error('Seer Card - Action error:', err);
      btn.innerHTML = '<ha-icon icon="mdi:alert"></ha-icon> Erreur';
      btn.classList.add('btn-danger');
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        btn.classList.remove('btn-danger');
      }, 2000);
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
            <p>Quelles saisons pour "<strong>${title}</strong>" ?</p>
            <div class="season-options">
              <button class="btn btn-primary season-btn" data-season="all">Toutes les saisons</button>
              <button class="btn btn-secondary season-btn" data-season="latest">Derniere saison</button>
              <button class="btn btn-secondary season-btn" data-season="first">Premiere saison</button>
            </div>
          </div>
        </div>
      `;

      const close = () => {
        modal.remove();
        resolve(null);
      };

      modal.querySelector('.seer-modal-close').onclick = close;
      modal.onclick = (e) => { if (e.target === modal) close(); };

      modal.querySelectorAll('.season-btn').forEach(btn => {
        btn.onclick = () => {
          modal.remove();
          resolve(btn.dataset.season);
        };
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
        </div>
      `;

      modal.querySelector('[data-confirm="yes"]').onclick = () => { modal.remove(); resolve(true); };
      modal.querySelector('[data-confirm="no"]').onclick = () => { modal.remove(); resolve(false); };
      modal.onclick = (e) => { if (e.target === modal) { modal.remove(); resolve(false); } };

      this.appendChild(modal);
    });
  }

  async _loadAllSections() {
    const loadPromises = this.config.sections
      .filter(key => this._allSections[key] && key !== 'search')
      .map(key => this._allSections[key].load(this));

    await Promise.allSettled(loadPromises);
  }

  _setBackground(imageUrl) {
    if (!imageUrl) return;
    const opacity = this.config.opacity || 0.8;
    const blur = this.config.blur_radius || 0;

    if (this._cardBg) {
      this._cardBg.style.backgroundImage = `url('${imageUrl}')`;
    }
    if (this._detailBg) {
      this._detailBg.style.backgroundImage = `url('${imageUrl}')`;
      this._detailBg.style.opacity = opacity;
      this._detailBg.style.filter = `blur(${blur}px) brightness(0.4)`;
    }
  }

  disconnectedCallback() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  getCardSize() {
    return 6;
  }

  static getStubConfig() {
    return {
      seer_url: 'http://localhost:5055',
      seer_api_key: '',
      max_items: 20,
      refresh_interval: 60,
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
  description: 'A comprehensive media management card powered by Seer',
  preview: true,
});
