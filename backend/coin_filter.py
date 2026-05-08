from typing import Any
from coin import FilteredCoin

FDV_LIMIT = 100_000_000
VOLUME_MIN = 50_000
TVL_MIN = 50_000

def has_positive_market_cap(coin: dict) -> bool:
    mcap = coin.get("market_cap")
    return mcap is not None and mcap > 0


def is_preview_listing(coin: dict) -> bool:
    return coin.get("preview_listing") is True


def max_supply_equals_total_supply(coin: dict) -> bool:
    max_s = coin.get("max_supply")
    total_s = coin.get("total_supply")
    if max_s is None or total_s is None:
        return False
    return abs(max_s - total_s) < 1e-6


def fdv_below_limit(coin: dict) -> bool:
    fdv = coin.get("fully_diluted_valuation")
    return fdv is not None and fdv < FDV_LIMIT


def volume_above_minimum(coin: dict) -> bool:
    volume = coin.get("total_volume")
    return volume is not None and volume > VOLUME_MIN


def tvl_above_minimum(coin: dict) -> bool:
    raw_tvl = coin.get("total_value_locked")
    if raw_tvl is None:
        return True  # no TVL data = not a DeFi protocol, let it pass
    if isinstance(raw_tvl, dict):
        tvl = raw_tvl.get("usd")
    else:
        tvl = raw_tvl
    return tvl is None or tvl > TVL_MIN

PREDICATES = [
    has_positive_market_cap,
    is_preview_listing,
    max_supply_equals_total_supply,
    fdv_below_limit,
    volume_above_minimum,
    tvl_above_minimum,
]

def _extract_tvl_usd(raw_tvl: Any) -> float | None:
    if raw_tvl is None:
        return None
    if isinstance(raw_tvl, dict):
        return raw_tvl.get("usd")
    return float(raw_tvl)


def apply_filters(coins: list[dict]) -> list[FilteredCoin]:
    result: list[FilteredCoin] = []

    for coin in coins:
        if all(pred(coin) for pred in PREDICATES):
            result.append(
                FilteredCoin(
                    id=coin["id"],
                    symbol=coin["symbol"],
                    name=coin["name"],
                    market_cap=coin.get("market_cap"),
                    fully_diluted_valuation=coin.get("fully_diluted_valuation"),
                    total_volume=coin.get("total_volume"),
                    total_value_locked=_extract_tvl_usd(coin.get("total_value_locked")),
                    max_supply=coin.get("max_supply"),
                    total_supply=coin.get("total_supply"),
                    circulating_supply=coin.get("circulating_supply"),
                    current_price=coin.get("current_price"),
                    preview_listing=coin.get("preview_listing", False),
                )
            )

    return result
