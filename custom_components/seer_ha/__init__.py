"""Seer integration for Home Assistant."""
from __future__ import annotations

import aiohttp
import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, CONF_URL, CONF_API_KEY


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Seer from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "url": entry.data[CONF_URL].rstrip("/"),
        "api_key": entry.data[CONF_API_KEY],
    }

    websocket_api.async_register_command(hass, ws_seer_request)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id)
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
    """Handle a Seer API proxy request over WebSocket."""
    if DOMAIN not in hass.data or not hass.data[DOMAIN]:
        connection.send_error(msg["id"], "not_configured", "Seer is not configured")
        return

    entry_data = next(iter(hass.data[DOMAIN].values()))
    base_url = entry_data["url"]
    api_key = entry_data["api_key"]

    url = f"{base_url}/api/v1{msg['endpoint']}"
    method = msg.get("method", "GET").upper()
    body = msg.get("body")

    try:
        timeout = aiohttp.ClientTimeout(total=15)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.request(
                method,
                url,
                headers={
                    "X-Api-Key": api_key,
                    "Content-Type": "application/json",
                },
                json=body,
            ) as resp:
                if resp.status == 401:
                    connection.send_error(msg["id"], "invalid_auth", "Invalid API key")
                    return
                if resp.status == 404:
                    connection.send_error(msg["id"], "not_found", f"Endpoint not found: {msg['endpoint']}")
                    return
                if resp.status >= 400:
                    connection.send_error(
                        msg["id"], "api_error", f"Seer API error {resp.status}"
                    )
                    return

                # Handle empty responses (e.g. DELETE)
                if resp.content_length == 0 or resp.status == 204:
                    connection.send_result(msg["id"], {"success": True})
                    return

                data = await resp.json()
                connection.send_result(msg["id"], data)

    except aiohttp.ClientConnectorError:
        connection.send_error(
            msg["id"], "cannot_connect", f"Cannot connect to Seer at {base_url}"
        )
    except TimeoutError:
        connection.send_error(msg["id"], "timeout", "Request to Seer timed out")
    except Exception as err:
        connection.send_error(msg["id"], "unknown", str(err))
