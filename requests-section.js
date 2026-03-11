// requests-section.js - Media Requests section with full management
import { BaseSection } from './base-section.js';

export class RequestsSection extends BaseSection {
  constructor() {
    super('requests', 'Requetes', 'mdi:clipboard-list-outline');
    this._filter = 'all';
  }

  generateTemplate(config) {
    if (config.sections && !config.sections.includes(this.key)) return '';
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
              <button class="chip" data-filter="approved">Approuve</button>
              <button class="chip" data-filter="available">Disponible</button>
            </div>
            <div class="section-badge" data-badge="${this.key}"></div>
          </div>
        </div>
        <div class="section-content">
          <div class="media-list" data-list="${this.key}"></div>
        </div>
      </div>
    `;
  }

  async load(cardInstance) {
    const api = cardInstance._api;
    if (!api) return;

    try {
      const filterMap = {
        all: undefined,
        pending: 'pending',
        approved: 'approved',
        available: 'available',
      };
      const maxItems = cardInstance.config.requests_max_items || cardInstance.config.max_items || 20;
      const data = await api.getRequests({
        take: maxItems,
        filter: filterMap[this._filter],
        sort: 'added',
      });
      const items = (data.results || []).map(r => api.normalizeRequest(r));
      this.renderItems(cardInstance, items);
      this._items = items;
      this._setupFilterHandlers(cardInstance);
    } catch (err) {
      console.error('Seer Card - Error loading requests:', err);
      this._showError(cardInstance);
    }
  }

  _setupFilterHandlers(cardInstance) {
    const group = cardInstance.querySelector('[data-filter-group="requests"]');
    if (!group || group._handlersAdded) return;

    group.querySelectorAll('.chip').forEach(chip => {
      chip.onclick = (e) => {
        e.stopPropagation();
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this._filter = chip.dataset.filter;
        this.load(cardInstance);
      };
    });
    group._handlersAdded = true;
  }

  renderMediaItem(item, index, cardInstance) {
    const isSelected = cardInstance._selectedSection === this.key && cardInstance._selectedIndex === index;
    const statusInfo = this._getRequestStatusInfo(item.status);
    const mediaStatusInfo = this._getMediaStatusInfo(item.mediaStatus);

    return `
      <div class="media-item request-item ${isSelected ? 'selected' : ''}"
           data-section="${this.key}"
           data-index="${index}">
        ${item.poster
          ? `<img src="${item.poster}" alt="${item.title || ''}" loading="lazy">`
          : `<div class="no-poster"><ha-icon icon="mdi:image-off"></ha-icon></div>`
        }
        <div class="media-item-overlay">
          <div class="media-item-title">${item.title || ''}</div>
        </div>
        <div class="request-status-badge ${statusInfo.class}">${statusInfo.short}</div>
        ${item.mediaType ? `<div class="media-type-badge">${item.mediaType === 'tv' ? 'TV' : 'Film'}</div>` : ''}
      </div>
    `;
  }

  showDetail(cardInstance, item) {
    if (!item) return;

    const bg = item.backdrop || item.poster;
    if (bg) cardInstance._setBackground(bg);

    const statusInfo = this._getRequestStatusInfo(item.status);
    const mediaStatusInfo = this._getMediaStatusInfo(item.mediaStatus);
    const typeLabel = item.mediaType === 'tv' ? 'Serie TV' : 'Film';

    let actionsHtml = '';
    // Admin actions for pending requests
    if (item.status === 1) {
      actionsHtml = `
        <button class="btn btn-success" data-action="approve-request" data-request-id="${item.requestId}">
          <ha-icon icon="mdi:check"></ha-icon> Approuver
        </button>
        <button class="btn btn-danger" data-action="decline-request" data-request-id="${item.requestId}">
          <ha-icon icon="mdi:close"></ha-icon> Refuser
        </button>
      `;
    }
    // Delete action for any request
    actionsHtml += `
      <button class="btn btn-outline" data-action="delete-request" data-request-id="${item.requestId}">
        <ha-icon icon="mdi:delete"></ha-icon> Supprimer
      </button>
    `;

    cardInstance._detailContent.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">${item.title || ''}</div>
        <div class="detail-meta">
          <span class="detail-type">${typeLabel}</span>
          <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
          ${mediaStatusInfo.text ? `<span class="badge ${mediaStatusInfo.class}">${mediaStatusInfo.text}</span>` : ''}
          ${item.is4k ? '<span class="badge badge-4k">4K</span>' : ''}
        </div>
      </div>
      <div class="detail-request-info">
        <div class="request-meta">
          <ha-icon icon="mdi:account"></ha-icon>
          <span>${item.requestedBy}</span>
        </div>
        <div class="request-meta">
          <ha-icon icon="mdi:calendar"></ha-icon>
          <span>${this.formatDate(item.requestedAt)}</span>
        </div>
      </div>
      <div class="detail-actions">${actionsHtml}</div>
    `;
  }

  _getRequestStatusInfo(status) {
    const map = {
      1: { text: 'En attente', short: '?', icon: 'mdi:clock-outline', class: 'badge-pending' },
      2: { text: 'Approuve', short: '✓', icon: 'mdi:check-circle', class: 'badge-approved' },
      3: { text: 'Refuse', short: '✗', icon: 'mdi:close-circle', class: 'badge-declined' },
    };
    return map[status] || { text: 'Inconnu', short: '?', icon: 'mdi:help-circle', class: 'badge-unknown' };
  }

  _getMediaStatusInfo(status) {
    const map = {
      2: { text: 'En attente', class: 'badge-pending' },
      3: { text: 'Traitement', class: 'badge-processing' },
      4: { text: 'Partiel', class: 'badge-partial' },
      5: { text: 'Disponible', class: 'badge-available' },
    };
    return map[status] || { text: '', class: '' };
  }

  _showError(cardInstance) {
    const listElement = cardInstance.querySelector(`[data-list="${this.key}"]`);
    if (listElement) {
      listElement.innerHTML = `
        <div class="empty-section">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span>Erreur de chargement</span>
        </div>
      `;
    }
  }
}
