// styles.js - Seer Card Styles
export const styles = `
  /* ===== CSS Variables ===== */
  :host {
    --seer-primary: #6366f1;
    --seer-primary-light: #818cf8;
    --seer-success: #22c55e;
    --seer-warning: #f59e0b;
    --seer-danger: #ef4444;
    --seer-info: #3b82f6;
    --seer-available: #22c55e;
    --seer-partial: #f59e0b;
    --seer-processing: #3b82f6;
    --seer-pending: #f59e0b;
    --seer-approved: #22c55e;
    --seer-declined: #ef4444;
    --seer-radius: 8px;
    --seer-transition: 0.25s ease;
  }

  /* ===== Card Structure ===== */
  ha-card {
    overflow: hidden;
    padding: 0;
    position: relative;
    background: var(--card-background-color, #1c1c1c);
    border: none;
  }

  .seer-card {
    position: relative;
    min-height: 200px;
  }

  .card-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-size: cover;
    background-position: center;
    filter: blur(30px) brightness(0.3) saturate(1.2);
    transform: scale(1.3);
    z-index: 0;
    transition: background-image 0.5s ease;
  }

  /* ===== Detail Panel ===== */
  .detail-panel {
    position: relative;
    z-index: 1;
    min-height: 100px;
    overflow: hidden;
  }

  .detail-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-size: cover;
    background-position: center top;
    opacity: 0.8;
    filter: brightness(0.4);
    transition: all 0.5s ease;
  }

  .detail-content {
    position: relative;
    z-index: 1;
    padding: 16px;
    color: white;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .detail-header {
    margin-bottom: 4px;
  }

  .detail-title {
    font-size: 1.3em;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0,0,0,0.6);
    line-height: 1.2;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .detail-type {
    font-size: 0.8em;
    text-transform: uppercase;
    opacity: 0.8;
    letter-spacing: 0.5px;
  }

  .detail-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85em;
    color: #fbbf24;
  }

  .detail-rating ha-icon {
    --mdc-icon-size: 16px;
    color: #fbbf24;
  }

  .detail-overview {
    font-size: 0.85em;
    opacity: 0.8;
    margin-top: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }

  .detail-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .detail-request-info {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    opacity: 0.8;
    font-size: 0.85em;
  }

  .request-meta {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .request-meta ha-icon {
    --mdc-icon-size: 16px;
  }

  /* ===== Sections Container ===== */
  .sections-container {
    position: relative;
    z-index: 1;
    padding: 0 0 8px 0;
  }

  /* ===== Section ===== */
  .section {
    margin-bottom: 2px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    cursor: pointer;
    user-select: none;
    transition: background-color var(--seer-transition);
  }

  .section-header:hover {
    background-color: rgba(255,255,255,0.05);
  }

  .section-header-content {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .section-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-toggle-icon {
    --mdc-icon-size: 18px;
    transition: transform var(--seer-transition);
    opacity: 0.6;
  }

  .section-icon {
    --mdc-icon-size: 16px;
    opacity: 0.7;
  }

  .section-label {
    font-weight: 600;
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    opacity: 0.9;
    color: var(--primary-text-color);
  }

  .section-badge {
    font-size: 0.7em;
    background: rgba(255,255,255,0.1);
    padding: 1px 6px;
    border-radius: 10px;
    color: var(--secondary-text-color);
    min-width: 18px;
    text-align: center;
  }

  .section-badge:empty {
    display: none;
  }

  /* ===== Section Content ===== */
  .section-content {
    max-height: 300px;
    transition: all var(--seer-transition);
    overflow: hidden;
    opacity: 1;
  }

  .section-content.collapsed {
    max-height: 0;
    opacity: 0;
  }

  /* ===== Media List ===== */
  .media-list {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 4px 12px 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--seer-primary) transparent;
    -webkit-overflow-scrolling: touch;
  }

  .media-list::-webkit-scrollbar {
    height: 3px;
  }

  .media-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .media-list::-webkit-scrollbar-thumb {
    background: var(--seer-primary);
    border-radius: 3px;
  }

  @media (max-width: 600px) {
    .media-list {
      scrollbar-width: none;
    }
    .media-list::-webkit-scrollbar {
      display: none;
    }
  }

  /* ===== Media Item ===== */
  .media-item {
    flex: 0 0 auto;
    width: 90px;
    height: 135px;
    position: relative;
    cursor: pointer;
    border-radius: var(--seer-radius);
    overflow: hidden;
    transition: transform var(--seer-transition), box-shadow var(--seer-transition);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .media-item:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 16px rgba(0,0,0,0.4);
  }

  .media-item.selected {
    box-shadow: 0 0 0 2px var(--seer-primary), 0 4px 12px rgba(99,102,241,0.3);
    transform: translateY(-2px);
  }

  .media-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-item .no-poster {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    color: var(--secondary-text-color);
  }

  .media-item .no-poster ha-icon {
    --mdc-icon-size: 32px;
    opacity: 0.3;
  }

  .media-item-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 24px 6px 6px;
    background: linear-gradient(transparent, rgba(0,0,0,0.9));
  }

  .media-item-title {
    font-size: 0.7em;
    color: white;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    line-height: 1.2;
  }

  .media-item-year {
    font-size: 0.6em;
    color: rgba(255,255,255,0.6);
  }

  /* ===== Status Dots ===== */
  .status-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.3);
  }

  .status-dot.status-available { background: var(--seer-available); }
  .status-dot.status-partial { background: var(--seer-partial); }
  .status-dot.status-processing { background: var(--seer-processing); }
  .status-dot.status-pending { background: var(--seer-pending); }
  .status-dot.status-approved { background: var(--seer-approved); }
  .status-dot.status-declined { background: var(--seer-declined); }

  /* ===== Media Type Badge ===== */
  .media-type-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 0.55em;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(0,0,0,0.6);
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ===== Request Status Badge on items ===== */
  .request-status-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    font-size: 0.6em;
    font-weight: 600;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .request-status-badge.badge-pending { background: var(--seer-pending); color: #000; }
  .request-status-badge.badge-approved { background: var(--seer-approved); color: #000; }
  .request-status-badge.badge-declined { background: var(--seer-declined); color: white; }

  /* ===== Badges ===== */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 500;
  }

  .badge-available { background: var(--seer-available); color: #000; }
  .badge-partial { background: var(--seer-partial); color: #000; }
  .badge-processing { background: var(--seer-processing); color: white; }
  .badge-pending { background: var(--seer-pending); color: #000; }
  .badge-approved { background: var(--seer-approved); color: #000; }
  .badge-declined { background: var(--seer-declined); color: white; }
  .badge-unknown { background: rgba(255,255,255,0.2); color: var(--primary-text-color); }
  .badge-4k { background: #7c3aed; color: white; }

  /* ===== Buttons ===== */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: none;
    border-radius: var(--seer-radius);
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: all var(--seer-transition);
    color: white;
    font-family: inherit;
  }

  .btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary { background: var(--seer-primary); }
  .btn-primary:hover:not(:disabled) { background: var(--seer-primary-light); }

  .btn-secondary { background: rgba(255,255,255,0.15); }
  .btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.25); }

  .btn-success { background: var(--seer-success); color: #000; }
  .btn-danger { background: var(--seer-danger); }

  .btn-outline {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.3);
    color: var(--primary-text-color);
  }
  .btn-outline:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
  }

  /* ===== Search ===== */
  .search-section {
    margin-bottom: 2px;
  }

  .search-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    position: relative;
  }

  .search-icon {
    --mdc-icon-size: 20px;
    opacity: 0.5;
    position: absolute;
    left: 20px;
    z-index: 1;
  }

  .search-input {
    flex: 1;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 8px 36px 8px 40px;
    color: var(--primary-text-color);
    font-size: 0.9em;
    outline: none;
    transition: all var(--seer-transition);
    font-family: inherit;
  }

  .search-input:focus {
    background: rgba(255,255,255,0.12);
    border-color: var(--seer-primary);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }

  .search-input::placeholder {
    color: var(--secondary-text-color);
    opacity: 0.5;
  }

  .search-clear {
    position: absolute;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 4px;
    display: flex;
    align-items: center;
  }

  .search-clear ha-icon {
    --mdc-icon-size: 18px;
  }

  /* ===== Filter Chips ===== */
  .filter-chips {
    display: flex;
    gap: 4px;
  }

  .chip {
    background: rgba(255,255,255,0.08);
    border: none;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 0.65em;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: all var(--seer-transition);
    font-family: inherit;
    white-space: nowrap;
  }

  .chip:hover {
    background: rgba(255,255,255,0.15);
  }

  .chip.active {
    background: var(--seer-primary);
    color: white;
  }

  /* ===== Empty State ===== */
  .empty-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    color: var(--secondary-text-color);
    font-size: 0.85em;
    opacity: 0.6;
  }

  .empty-section ha-icon {
    --mdc-icon-size: 20px;
  }

  /* ===== Loading ===== */
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  /* ===== Modal ===== */
  .seer-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .seer-modal {
    background: var(--card-background-color, #2a2a2a);
    border-radius: 12px;
    width: 90%;
    max-width: 380px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }

  .seer-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-weight: 600;
    font-size: 0.95em;
  }

  .seer-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    padding: 4px;
    display: flex;
    align-items: center;
  }

  .seer-modal-body {
    padding: 16px;
  }

  .seer-modal-body p {
    margin: 0 0 16px;
    font-size: 0.9em;
    color: var(--primary-text-color);
  }

  .season-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .season-options .btn {
    justify-content: center;
    width: 100%;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  /* ===== Utility ===== */
  .hidden {
    display: none !important;
  }

  /* ===== Responsive ===== */
  @media (max-width: 500px) {
    .detail-title {
      font-size: 1.1em;
    }

    .detail-overview {
      -webkit-line-clamp: 1;
    }

    .media-item {
      width: 80px;
      height: 120px;
    }

    .filter-chips {
      display: none;
    }

    .section-header-right {
      gap: 4px;
    }

    .btn {
      padding: 5px 10px;
      font-size: 0.8em;
    }
  }
`;
