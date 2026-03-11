// base-section.js - Base section class for Seer Card
export class BaseSection {
  constructor(key, title, icon) {
    this.key = key;
    this.title = title;
    this.icon = icon || 'mdi:filmstrip';
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
          <div class="section-badge" data-badge="${this.key}"></div>
        </div>
        <div class="section-content">
          <div class="media-list" data-list="${this.key}"></div>
        </div>
      </div>
    `;
  }

  renderItems(cardInstance, items) {
    const listElement = cardInstance.querySelector(`[data-list="${this.key}"]`);
    if (!listElement) return;

    if (!items || items.length === 0) {
      listElement.innerHTML = `
        <div class="empty-section">
          <ha-icon icon="mdi:movie-search-outline"></ha-icon>
          <span>No items</span>
        </div>
      `;
      return;
    }

    listElement.innerHTML = items.map((item, index) =>
      this.renderMediaItem(item, index, cardInstance)
    ).join('');

    this.addClickHandlers(cardInstance, listElement, items);

    // Update badge count
    const badge = cardInstance.querySelector(`[data-badge="${this.key}"]`);
    if (badge) badge.textContent = items.length;
  }

  renderMediaItem(item, index, cardInstance) {
    const isSelected = cardInstance._selectedSection === this.key && cardInstance._selectedIndex === index;
    const statusClass = this.getMediaStatusClass(item);
    const statusDot = statusClass ? `<div class="status-dot ${statusClass}"></div>` : '';

    return `
      <div class="media-item ${isSelected ? 'selected' : ''}"
           data-section="${this.key}"
           data-index="${index}">
        ${item.poster
          ? `<img src="${item.poster}" alt="${item.title || ''}" loading="lazy">`
          : `<div class="no-poster"><ha-icon icon="mdi:image-off"></ha-icon></div>`
        }
        <div class="media-item-overlay">
          <div class="media-item-title">${item.title || ''}</div>
          ${item.year ? `<div class="media-item-year">${item.year}</div>` : ''}
        </div>
        ${statusDot}
        ${item.mediaType ? `<div class="media-type-badge">${item.mediaType === 'tv' ? 'TV' : 'Film'}</div>` : ''}
      </div>
    `;
  }

  getMediaStatusClass(item) {
    // mediaStatus: 1=unknown, 2=pending, 3=processing, 4=partially_available, 5=available
    // request status: 1=pending, 2=approved, 3=declined
    const ms = item.mediaStatus;
    if (ms === 5) return 'status-available';
    if (ms === 4) return 'status-partial';
    if (ms === 3) return 'status-processing';
    if (ms === 2) return 'status-pending';

    // Check requests
    if (item.requests && item.requests.length > 0) {
      const latestStatus = item.requests[item.requests.length - 1].status;
      if (latestStatus === 2) return 'status-approved';
      if (latestStatus === 1) return 'status-pending';
      if (latestStatus === 3) return 'status-declined';
    }
    return '';
  }

  addClickHandlers(cardInstance, listElement, items) {
    listElement.querySelectorAll('.media-item').forEach(el => {
      el.onclick = () => {
        const index = parseInt(el.dataset.index);
        cardInstance._selectedSection = this.key;
        cardInstance._selectedIndex = index;
        this.showDetail(cardInstance, items[index]);

        // Update selection visual
        cardInstance.querySelectorAll('.media-item').forEach(i => {
          i.classList.toggle('selected',
            i.dataset.section === this.key && parseInt(i.dataset.index) === index);
        });
      };
    });
  }

  showDetail(cardInstance, item) {
    if (!item) return;

    // Update backgrounds
    const bg = item.backdrop || item.poster;
    if (bg) {
      cardInstance._setBackground(bg);
    }

    // Build detail content
    const statusHtml = this.buildStatusHtml(item);
    const actionHtml = this.buildActionHtml(cardInstance, item);
    const ratingHtml = item.rating ? `<div class="detail-rating"><ha-icon icon="mdi:star"></ha-icon> ${item.rating}/10</div>` : '';
    const typeLabel = item.mediaType === 'tv' ? 'Serie TV' : 'Film';

    cardInstance._detailContent.innerHTML = `
      <div class="detail-header">
        <div class="detail-title">${item.title || ''}${item.year ? ` (${item.year})` : ''}</div>
        <div class="detail-meta">
          <span class="detail-type">${typeLabel}</span>
          ${ratingHtml}
          ${statusHtml}
        </div>
      </div>
      ${item.overview ? `<div class="detail-overview">${item.overview}</div>` : ''}
      <div class="detail-actions">${actionHtml}</div>
    `;
  }

  buildStatusHtml(item) {
    const ms = item.mediaStatus;
    if (ms === 5) return '<span class="badge badge-available">Disponible</span>';
    if (ms === 4) return '<span class="badge badge-partial">Partiel</span>';
    if (ms === 3) return '<span class="badge badge-processing">En cours</span>';
    if (ms === 2) return '<span class="badge badge-pending">En attente</span>';
    return '';
  }

  buildActionHtml(cardInstance, item) {
    if (!item.tmdbId) return '';

    // If already available, no request button
    if (item.mediaStatus === 5) return '';

    // If already has a pending/approved request
    if (item.requests && item.requests.length > 0) {
      const latest = item.requests[item.requests.length - 1];
      if (latest.status === 1 || latest.status === 2) {
        const label = latest.status === 1 ? 'En attente' : 'Approuve';
        return `<button class="btn btn-secondary" disabled>
          <ha-icon icon="mdi:check"></ha-icon> ${label}
        </button>`;
      }
    }

    const mediaType = item.mediaType || 'movie';
    return `
      <button class="btn btn-primary" data-action="request"
              data-tmdb-id="${item.tmdbId}"
              data-media-type="${mediaType}"
              data-title="${(item.title || '').replace(/"/g, '&quot;')}">
        <ha-icon icon="mdi:plus"></ha-icon> Demander
      </button>
    `;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return '';
    }
  }
}
