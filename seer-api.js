// seer-api.js - Seer API Client — proxies all calls via HA WebSocket (no CORS)
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class SeerApi {
  constructor(hass) {
    this._hass = hass;
    this._cache = new Map();
    this._cacheTimeout = 60000; // 1 minute
  }

  updateHass(hass) {
    this._hass = hass;
  }

  clearCache() {
    this._cache.clear();
  }

  // --- Core request — goes through HA WebSocket to avoid CORS ---
  async _fetch(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const cacheKey = `${method}:${endpoint}:${options.body || ''}`;

    if (method === 'GET') {
      const cached = this._cache.get(cacheKey);
      if (cached && Date.now() - cached.time < this._cacheTimeout) {
        return cached.data;
      }
    }

    const msg = { type: 'seer_ha/request', endpoint, method };
    if (options.body) {
      msg.body = JSON.parse(options.body);
    }

    const data = await this._hass.connection.sendMessagePromise(msg);

    if (method === 'GET') {
      this._cache.set(cacheKey, { data, time: Date.now() });
    }

    return data;
  }

  // --- Image helpers ---
  posterUrl(path, size = 'w500') {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  backdropUrl(path, size = 'w1280') {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  // --- Search ---
  async search(query, page = 1) {
    if (!query || !query.trim()) return { results: [] };
    return this._fetch(`/search?query=${encodeURIComponent(query)}&page=${page}`);
  }

  // --- Discover ---
  async getTrending(page = 1) {
    return this._fetch(`/discover/trending?page=${page}`);
  }

  async getPopularMovies(page = 1) {
    return this._fetch(`/discover/movies?page=${page}`);
  }

  async getPopularTV(page = 1) {
    return this._fetch(`/discover/tv?page=${page}`);
  }

  async getUpcomingMovies(page = 1) {
    return this._fetch(`/discover/movies/upcoming?page=${page}`);
  }

  // --- Requests ---
  async getRequests(params = {}) {
    const q = new URLSearchParams();
    if (params.take) q.set('take', params.take);
    if (params.skip) q.set('skip', params.skip);
    if (params.filter) q.set('filter', params.filter);
    if (params.sort) q.set('sort', params.sort);
    const qs = q.toString();
    return this._fetch(`/request${qs ? '?' + qs : ''}`);
  }

  async createMovieRequest(tmdbId, options = {}) {
    return this._fetch('/request', {
      method: 'POST',
      body: JSON.stringify({
        mediaType: 'movie',
        mediaId: tmdbId,
        is4k: options.is4k || false,
      }),
    });
  }

  async createTvRequest(tmdbId, options = {}) {
    return this._fetch('/request', {
      method: 'POST',
      body: JSON.stringify({
        mediaType: 'tv',
        mediaId: tmdbId,
        is4k: options.is4k || false,
        seasons: options.seasons || 'all',
      }),
    });
  }

  async updateRequestStatus(requestId, status) {
    return this._fetch(`/request/${requestId}/${status}`, { method: 'POST' });
  }

  async deleteRequest(requestId) {
    return this._fetch(`/request/${requestId}`, { method: 'DELETE' });
  }

  // --- Media details ---
  async getMovieDetails(tmdbId) {
    return this._fetch(`/movie/${tmdbId}`);
  }

  async getTvDetails(tmdbId) {
    return this._fetch(`/tv/${tmdbId}`);
  }

  // --- Watchlist ---
  async getWatchlist(page = 1) {
    return this._fetch(`/discover/watchlist?page=${page}`);
  }

  // --- Status ---
  async getStatus() {
    return this._fetch('/status');
  }

  // --- Normalize ---
  normalizeResult(item) {
    const mediaType = item.mediaType || (item.firstAirDate ? 'tv' : 'movie');
    const mediaInfo = item.mediaInfo || null;

    return {
      tmdbId: item.id,
      title: item.title || item.name || '',
      year: this._extractYear(item),
      overview: item.overview || '',
      mediaType,
      poster: this.posterUrl(item.posterPath),
      backdrop: this.backdropUrl(item.backdropPath),
      rating: item.voteAverage ? Math.round(item.voteAverage * 10) / 10 : null,
      mediaStatus: mediaInfo?.status || 0,
      mediaInfo,
      requests: mediaInfo?.requests || [],
      genreIds: item.genreIds || [],
    };
  }

  normalizeRequest(req) {
    const media = req.media || {};
    return {
      requestId: req.id,
      tmdbId: media.tmdbId,
      title: media.title || media.name || '',
      mediaType: req.type || media.mediaType || 'movie',
      status: req.status,
      mediaStatus: media.status || 0,
      poster: this.posterUrl(media.posterPath),
      backdrop: this.backdropUrl(media.backdropPath),
      requestedBy: req.requestedBy?.displayName || req.requestedBy?.email || 'Inconnu',
      requestedAt: req.createdAt,
      is4k: req.is4k || false,
    };
  }

  _extractYear(item) {
    const d = item.releaseDate || item.firstAirDate;
    if (!d) return '';
    try { return new Date(d).getFullYear().toString(); } catch { return ''; }
  }
}
