// search-section.js - Search functionality
import { BaseSection } from './base-section.js';

export class SearchSection extends BaseSection {
  constructor() {
    super('search', 'Recherche', 'mdi:magnify');
    this._query = '';
    this._debounceTimer = null;
  }

  generateTemplate(config) {
    return `
      <div class="section search-section" data-section="${this.key}">
        <div class="search-container">
          <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
          <input type="text" class="search-input" placeholder="Rechercher un film ou une serie..."
                 data-search-input>
          <button class="search-clear hidden" data-search-clear>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="section-content">
          <div class="media-list" data-list="${this.key}"></div>
        </div>
      </div>
    `;
  }

  setupHandlers(cardInstance) {
    const input = cardInstance.querySelector('[data-search-input]');
    const clearBtn = cardInstance.querySelector('[data-search-clear]');
    if (!input) return;

    input.oninput = () => {
      this._query = input.value;
      clearBtn.classList.toggle('hidden', !this._query);

      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this._performSearch(cardInstance);
      }, 400);
    };

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        clearTimeout(this._debounceTimer);
        this._performSearch(cardInstance);
      }
    };

    if (clearBtn) {
      clearBtn.onclick = () => {
        input.value = '';
        this._query = '';
        clearBtn.classList.add('hidden');
        const list = cardInstance.querySelector(`[data-list="${this.key}"]`);
        if (list) list.innerHTML = '';
      };
    }
  }

  async _performSearch(cardInstance) {
    const api = cardInstance._api;
    if (!api || !this._query.trim()) return;

    const list = cardInstance.querySelector(`[data-list="${this.key}"]`);
    if (list) {
      list.innerHTML = `
        <div class="loading-indicator">
          <ha-icon icon="mdi:loading" class="spin"></ha-icon>
          <span>Recherche...</span>
        </div>
      `;
    }

    try {
      const maxItems = cardInstance.config.search_max_items || cardInstance.config.max_items || 20;
      const data = await api.search(this._query);
      const items = (data.results || [])
        .filter(r => r.mediaType === 'movie' || r.mediaType === 'tv')
        .slice(0, maxItems)
        .map(r => api.normalizeResult(r));
      this.renderItems(cardInstance, items);
      this._items = items;

      if (items.length === 0 && list) {
        list.innerHTML = `
          <div class="empty-section">
            <ha-icon icon="mdi:movie-search-outline"></ha-icon>
            <span>Aucun resultat pour "${this._query}"</span>
          </div>
        `;
      }
    } catch (err) {
      console.error('Seer Card - Search error:', err);
      if (list) {
        list.innerHTML = `
          <div class="empty-section">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>Erreur de recherche</span>
          </div>
        `;
      }
    }
  }

  async load() {
    // Search doesn't auto-load - it waits for user input
  }
}
