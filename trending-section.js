// trending-section.js - Trending content from Seer
import { BaseSection } from './base-section.js';

export class TrendingSection extends BaseSection {
  constructor() {
    super('trending', 'Tendances', 'mdi:fire');
  }

  async load(cardInstance) {
    const api = cardInstance._api;
    if (!api) return;

    try {
      const maxItems = cardInstance.config.trending_max_items || cardInstance.config.max_items || 20;
      const data = await api.getTrending();
      const items = (data.results || []).slice(0, maxItems).map(r => api.normalizeResult(r));
      this.renderItems(cardInstance, items);
      this._items = items;
    } catch (err) {
      console.error('Seer Card - Error loading trending:', err);
    }
  }
}
