// discover-section.js - Discover Movies & TV from Seer
import { BaseSection } from './base-section.js';

export class DiscoverMoviesSection extends BaseSection {
  constructor() {
    super('discover_movies', 'Films Populaires', 'mdi:movie-open');
  }

  async load(cardInstance) {
    const api = cardInstance._api;
    if (!api) return;

    try {
      const maxItems = cardInstance.config.discover_movies_max_items || cardInstance.config.max_items || 20;
      const data = await api.getPopularMovies();
      const items = (data.results || []).slice(0, maxItems).map(r => api.normalizeResult(r));
      this.renderItems(cardInstance, items);
      this._items = items;
    } catch (err) {
      console.error('Seer Card - Error loading popular movies:', err);
    }
  }
}

export class DiscoverTvSection extends BaseSection {
  constructor() {
    super('discover_tv', 'Series Populaires', 'mdi:television-classic');
  }

  async load(cardInstance) {
    const api = cardInstance._api;
    if (!api) return;

    try {
      const maxItems = cardInstance.config.discover_tv_max_items || cardInstance.config.max_items || 20;
      const data = await api.getPopularTV();
      const items = (data.results || []).slice(0, maxItems).map(r => api.normalizeResult(r));
      this.renderItems(cardInstance, items);
      this._items = items;
    } catch (err) {
      console.error('Seer Card - Error loading popular TV:', err);
    }
  }
}

export class UpcomingMoviesSection extends BaseSection {
  constructor() {
    super('upcoming', 'Films a venir', 'mdi:calendar-star');
  }

  async load(cardInstance) {
    const api = cardInstance._api;
    if (!api) return;

    try {
      const maxItems = cardInstance.config.upcoming_max_items || cardInstance.config.max_items || 20;
      const data = await api.getUpcomingMovies();
      const items = (data.results || []).slice(0, maxItems).map(r => api.normalizeResult(r));
      this.renderItems(cardInstance, items);
      this._items = items;
    } catch (err) {
      console.error('Seer Card - Error loading upcoming movies:', err);
    }
  }
}
