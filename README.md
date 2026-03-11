# Seer Card for Home Assistant

Une carte Lovelace complète pour [Seer](https://github.com/seerr-team/seerr) — parcourez les tendances, gérez vos requêtes, recherchez et contrôlez votre watchlist directement depuis Home Assistant.

## Installation

**Une seule étape — via HACS :**

1. HACS → Intégrations → ⋮ → **Dépôts personnalisés**
2. URL : `https://github.com/k69sknk/seer-card-ha` → Catégorie : **Intégration**
3. Installer **Seer**
4. Redémarrer Home Assistant

**Configuration :**

1. Paramètres → Intégrations → **+ Ajouter** → chercher **Seer**
2. Entrer l'URL de Seer (ex: `http://192.168.1.168:5055`) et la clé API
   - Clé API : Seer → Paramètres → Général → API Key
3. Ajouter la carte sur votre dashboard :

```yaml
type: custom:seer-card
```

C'est tout. Pas besoin d'ajouter de ressource manuellement.

---

## Fonctionnalités

| Section | Description |
|---|---|
| `search` | Barre de recherche instantanée |
| `requests` | Toutes les requêtes avec filtres, approbation/refus/suppression |
| `trending` | Contenus tendance |
| `discover_movies` | Films populaires |
| `discover_tv` | Séries populaires |
| `upcoming` | Films à venir |
| `watchlist` | Votre watchlist personnelle |

- Indicateurs colorés de disponibilité sur chaque poster
- Sélecteur de saisons pour les séries TV
- Rafraîchissement automatique configurable
- Sections réductibles
- Zéro CORS — tous les appels passent par le backend HA

---

## Configuration complète

```yaml
type: custom:seer-card

# Sections affichées (et leur ordre)
sections:
  - search
  - requests
  - trending
  - discover_movies
  - discover_tv
  - upcoming
  - watchlist

max_items: 20          # Nombre max d'items par section
refresh_interval: 300  # Rafraîchissement en secondes (0 pour désactiver)
opacity: 0.8           # Opacité du fond (0–1)
blur_radius: 0         # Flou du fond en pixels
```

---

## Prérequis

- Home Assistant 2023.6+
- Seer v3.0+
- HACS

---

## Licence

MIT
