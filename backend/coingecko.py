import httpx
import asyncio
import os
from typing import Any

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
PAGE_SIZE = 5
DELAY_BETWEEN_REQUESTS = 3.0
MAX_RETRIES = 3


class CoinGeckoService:
    def __init__(self, base_url: str = COINGECKO_BASE_URL):
        self.base_url = base_url
        self.api_key = os.getenv("COINGECKO_API_KEY")

    async def fetch_coins_markets(self) -> list[dict[str, Any]]:
        all_coins: list[dict[str, Any]] = []
        page = 1

        headers = {}
        if self.api_key:
            headers["x-cg-demo-api-key"] = self.api_key

        async with httpx.AsyncClient(timeout=30, headers=headers) as client:
            while True:
                params = {
                    "vs_currency": "usd",
                    "order": "market_cap_desc",
                    "per_page": PAGE_SIZE,
                    "page": page,
                    "sparkline": "false",
                }

                data = await self._fetch_with_retry(client, params)

                if not data:
                    break

                all_coins.extend(data)
                page += 1

                if page > 3:
                    break

                await asyncio.sleep(DELAY_BETWEEN_REQUESTS)

        return all_coins

    async def _fetch_with_retry(self, client: httpx.AsyncClient, params: dict) -> list:
        for attempt in range(MAX_RETRIES):
            response = await client.get(f"{self.base_url}/coins/markets", params=params)

            if response.status_code == 429:
                wait = 10 * (attempt + 1)
                print(f"Rate limited. Waiting {wait}s before retry...")
                await asyncio.sleep(wait)
                continue

            response.raise_for_status()
            return response.json()

        raise Exception("CoinGecko rate limit exceeded after all retries.")