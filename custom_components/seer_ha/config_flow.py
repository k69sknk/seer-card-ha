"""Config flow for Seer integration."""
from __future__ import annotations

import aiohttp
import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.core import HomeAssistant

from .const import DOMAIN, CONF_URL, CONF_API_KEY

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): str,
        vol.Required(CONF_API_KEY): str,
    }
)


async def validate_connection(hass: HomeAssistant, url: str, api_key: str) -> None:
    """Validate connection to Seer by calling /api/v1/status."""
    clean_url = url.rstrip("/")
    timeout = aiohttp.ClientTimeout(total=10)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.get(
            f"{clean_url}/api/v1/status",
            headers={"X-Api-Key": api_key},
        ) as resp:
            if resp.status == 401:
                raise InvalidAuth
            if resp.status != 200:
                raise CannotConnect
            await resp.json()


class SeerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Seer."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            await self.async_set_unique_id(user_input[CONF_URL].rstrip("/"))
            self._abort_if_unique_id_configured()

            try:
                await validate_connection(
                    self.hass,
                    user_input[CONF_URL],
                    user_input[CONF_API_KEY],
                )
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except Exception:
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(
                    title=f"Seer ({user_input[CONF_URL]})",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )


class CannotConnect(Exception):
    """Error to indicate we cannot connect."""


class InvalidAuth(Exception):
    """Error to indicate invalid authentication."""
