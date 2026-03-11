"""Seer integration for Home Assistant."""
from __future__ import annotations

from pathlib import Path

import aiohttp
import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, CONF_URL, CONF_API_KEY

FRONTEND_SCRIPT_URL = "/seer-card-ha/seer-card.js"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Register static frontend files and WebSocket commands on startup."""
    # Serve the frontend folder at /seer-card-ha/
    frontend_path = str(Path(__file__).parent / "frontend")
    try:
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig(
                "/seer-card-ha",
                frontend_path,
                cache_headers=True,
            )
        ])
    except (ImportError, AttributeError):
        # Fallback for older HA versions
        hass.http.register_static_path("/seer-card-ha", frontend_path, True)

    # Automatically add the card JS to every HA page — no manual resource needed
    add_extra_js_url(hass, FRONTEND_SCRIPT_URL)

    # Register the WebSocket API command used by the card
    websocket_api.async_register_command(hass, ws_seer_request)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Store connection details when the integration is configured."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "url": entry.data[CONF_URL].rstrip("/"),
        "api_key": entry.data[CONF_API_KEY],
    }
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True


@websocket_api.websocket_command(
    {
        vol.Required("type"): "seer_ha/request",
        vol.Required("endpoint"): str,
        vol.Optional("method", default="GET"): str,
        vol.Optional("body"): dict,
    }
)
@websocket_api.async_response
async def ws_seer_request(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Proxy a Seer API request through HA to avoid browser CORS restrictions."""
    entries = hass.data.get(DOMAIN, {})
    if not entries:
        connection.send_error(
            msg["id"],
            "not_configured",
            "Seer n'est pas configuré. Allez dans Paramètres → Intégrations → Ajouter → Seer.",
        )
        return

    entry_data = next(iter(entries.values()))
    url     = f"{entry_data['url']}/api/v1{msg['endpoint']}"
    method  = msg.get("method", "GET").upper()
    body    = msg.get("body")

    try:
        timeout = aiohttp.ClientTimeout(total=15)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.request(
                method,
                url,
                headers={"X-Api-Key": entry_data["api_key"], "Content-Type": "application/json"},
                json=body,
            ) as resp:
                if resp.status == 401:
                    connection.send_error(msg["id"], "invalid_auth", "Clé API invalide")
                    return
                if resp.status == 404:
                    connection.send_error(msg["id"], "not_found", f"Endpoint introuvable : {msg['endpoint']}")
                    return
                if resp.status >= 400:
                    connection.send_error(msg["id"], "api_error", f"Erreur Seer : {resp.status}")
                    return
                if resp.status == 204 or resp.content_length == 0:
                    connection.send_result(msg["id"], {"success": True})
                    return
                data = await resp.json()
                connection.send_result(msg["id"], data)

    except aiohttp.ClientConnectorError:
        connection.send_error(msg["id"], "cannot_connect", f"Impossible de joindre Seer à {entry_data['url']}")
    except TimeoutError:
        connection.send_error(msg["id"], "timeout", "La requête vers Seer a expiré")
    except Exception as err:
        connection.send_error(msg["id"], "unknown", str(err))
