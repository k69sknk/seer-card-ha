// seer-api.js - Seer API Client for Home Assistant Custom Card
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class SeerApi {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this._cache = new Map();
    this._cacheTimeout = 60000; // 1 minute cache
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`;

    if (options.method === undefined || options.method === 'GET') {
      const cached = this._cache.get(cacheKey);
      if (cached && Date.now() - cached.time < this._cacheTimeout) {
        return cached.data;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Seer API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (options.method === undefined || options.method === 'GET') {
      this._cache.set(cacheKey, { data, time: Date.now() });
    }

    return data;
  }

  clearCache() {
    this._cache.clear();
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
    if (!query || query.trim().length === 0) return { results: [] };
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

  async getMovieGenre(genreId, page = 1) {
    return this._fetch(`/discover/movies/genre/${genreId}?page=${page}`);
  }

  async getTvGenre(genreId, page = 1) {
    return this._fetch(`/discover/tv/genre/${genreId}?page=${page}`);
  }

  // --- Requests ---
  async getRequests(params = {}) {
    const query = new URLSearchParams();
    if (params.take) query.set('take', params.take);
    if (params.skip) query.set('skip', params.skip);
    if (params.filter) query.set('filter', params.filter); // all, approved, available, pending, processing, unavailable
    if (params.sort) query.set('sort', params.sort); // added, modified
    const qs = query.toString();
    return this._fetch(`/request${qs ? '?' + qs : ''}`);
  }

  async createMovieRequest(tmdbId, options = {}) {
    return this._fetch('/request', {
      method: 'POST',
      body: JSON.stringify({
        mediaType: 'movie',
        mediaId: tmdbId,
        is4k: options.is4k || false,
        serverId: options.serverId,
        profileId: options.profileId,
        rootFolder: options.rootFolder,
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
        serverId: options.serverId,
        profileId: options.profileId,
        rootFolder: options.rootFolder,
      }),
    });
  }

  async updateRequestStatus(requestId, status) {
    // status: 'approve' or 'decline'
    return this._fetch(`/request/${requestId}/${status}`, {
      method: 'POST',
    });
  }

  async deleteRequest(requestId) {
    return this._fetch(`/request/${requestId}`, {
      method: 'DELETE',
    });
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

  // --- User ---
  async getCurrentUser() {
    return this._fetch('/auth/me');
  }

  async getUsers() {
    return this._fetch('/user');
  }

  // --- Status ---
  async getStatus() {
    return this._fetch('/status');
  }

  // --- Normalize helpers ---
  // Normalize API results into a consistent format for the card
  normalizeResult(item) {
    const mediaType = item.mediaType || (item.firstAirDate ? 'tv' : 'movie');
    const title = item.title || item.name || '';
    const year = this._extractYear(item);
    const overview = item.overview || '';
    const poster = this.posterUrl(item.posterPath);
    const backdrop = this.backdropUrl(item.backdropPath);
    const rating = item.voteAverage ? Math.round(item.voteAverage * 10) / 10 : null;
    const tmdbId = item.id;

    // Media availability status
    const mediaInfo = item.mediaInfo || null;
    const mediaStatus = mediaInfo?.status || 0;
    const requests = mediaInfo?.requests || [];

    return {
      tmdbId,
      title,
      year,
      overview,
      mediaType,
      poster,
      backdrop,
      rating,
      popularity: item.popularity,
      genreIds: item.genreIds || [],
      mediaStatus,
      mediaInfo,
      requests,
      originalLanguage: item.originalLanguage,
      // Detailed info (when available)
      runtime: item.runtime,
      genres: item.genres,
      releaseDate: item.releaseDate,
      firstAirDate: item.firstAirDate,
      numberOfSeasons: item.numberOfSeasons,
      status: item.status,
    };
  }

  normalizeRequest(req) {
    const media = req.media || {};
    const mediaType = req.type || media.mediaType || 'movie';
    const title = media.title || media.name || req.title || req.name || '';

    return {
      requestId: req.id,
      tmdbId: media.tmdbId,
      title,
      mediaType,
      status: req.status, // 1=pending, 2=approved, 3=declined
      mediaStatus: media.status || 0,
      poster: this.posterUrl(media.posterPath),
      backdrop: this.backdropUrl(media.backdropPath),
      requestedBy: req.requestedBy?.displayName || req.requestedBy?.email || 'Unknown',
      requestedAt: req.createdAt,
      updatedAt: req.updatedAt,
      is4k: req.is4k || false,
      seasons: req.seasons,
    };
  }

  normalizeWatchlistItem(item) {
    return {
      ...this.normalizeResult(item),
      watchlistId: item.id,
    };
  }

  _extractYear(item) {
    const dateStr = item.releaseDate || item.firstAirDate;
    if (!dateStr) return '';
    try {
      return new Date(dateStr).getFullYear().toString();
    } catch {
      return '';
    }
  }
}
