# Seer Card for Home Assistant

A feature-rich Lovelace card for [Seer](https://github.com/seerr-team/seerr) — browse trending content, manage media requests, search, and control your watchlist, all directly from your Home Assistant dashboard.

All API calls go through Home Assistant's backend, so there are **no CORS issues**.

---

## Features

- **Search** — Find any movie or TV show instantly
- **Requests** — View all requests with status, filter by state, approve/decline/delete
- **Trending** — Trending content from Seer
- **Discover** — Popular movies, popular TV shows, upcoming movies
- **Watchlist** — Your personal watchlist
- **Media status** — Color indicators showing availability (available, processing, pending…)
- **Season picker** — Choose which seasons to request for TV shows
- **Auto-refresh** — Configurable refresh interval
- **Collapsible sections** — Keep your dashboard tidy

---

## Requirements

- Home Assistant 2024.1+
- [Seer](https://github.com/seerr-team/seerr) v3.0+
- HACS (for the card installation)

---

## Installation

### Step 1 — Install the custom integration

The integration handles the connection to Seer (URL + API key) and proxies API calls to avoid CORS.

**Option A — Copy manually (recommended)**

Copy the `custom_components/seer_ha` folder to your HA config directory:

```
/config/custom_components/seer_ha/
```

**Option B — HACS (future)**

A dedicated integration repo will be published on HACS. For now, use Option A.

### Step 2 — Install the Lovelace card

Install via HACS (Frontend):

1. HACS → Frontend → ⋮ → **Custom repositories**
2. Add `https://github.com/k69sknk/seer-card-ha` → Category: **Lovelace**
3. Install **Seer Card**

### Step 3 — Configure the integration

1. Restart Home Assistant after copying the files
2. Go to **Settings → Integrations → + Add integration**
3. Search for **Seer**
4. Enter your Seer URL (e.g. `http://192.168.1.168:5055`) and API key
   - API key: Seer → Settings → General → API Key

### Step 4 — Add the card to your dashboard

Edit your dashboard → Add card → search **Seer** or paste this YAML:

```yaml
type: custom:seer-card
```

---

## Configuration

All options are optional — the card works with no extra YAML once the integration is set up.

```yaml
type: custom:seer-card

# Sections to display (and their order)
sections:
  - search
  - requests
  - trending
  - discover_movies
  - discover_tv
  - upcoming
  - watchlist

# Max items per section
max_items: 20

# Refresh interval in seconds (0 to disable)
refresh_interval: 300

# Background image opacity (0–1)
opacity: 0.8

# Background blur in pixels
blur_radius: 0
```

### Available sections

| Key | Description |
|---|---|
| `search` | Search bar |
| `requests` | All media requests with management |
| `trending` | Trending content |
| `discover_movies` | Popular movies |
| `discover_tv` | Popular TV shows |
| `upcoming` | Upcoming movies |
| `watchlist` | Your Seer watchlist |

---

## Troubleshooting

**Card shows nothing / errors in console**
- Make sure the `seer_ha` integration is installed and configured (Settings → Integrations)
- Restart HA after copying the `custom_components/seer_ha` folder

**"Seer is not configured" error**
- The integration isn't set up. Go to Settings → Integrations → Add → Seer

**Connection error in the integration setup**
- Check that Seer is running and the URL is correct (include `http://` and port)
- Test in your browser: `http://YOUR_SEER_IP:5055/api/v1/status`

---

## License

MIT
