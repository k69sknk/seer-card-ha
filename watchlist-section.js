// watchlist-section.js - User Watchlist from Seer
import { BaseSection } from './base-section.js';

export class WatchlistSection extends BaseSection {
  constructor() {
    super('watchlist', 'Ma Watchlist', 'mdi:bookmark-multiple');
  }

  async load(cardInstance) {
    const api = cardInstance._api;
    if (!api) return;

    try {
      const maxItems = cardInstance.config.watchlist_max_items || cardInstance.config.max_items || 20;
      const data = await api.getWatchlist();
      const items = (data.results || []).slice(0, maxItems).map(r => api.normalizeResult(r));
      this.renderItems(cardInstance, items);
      this._items = items;
    } catch (err) {
      console.error('Seer Card - Error loading watchlist:', err);
    }
  }
}
