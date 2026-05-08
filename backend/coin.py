from pydantic import BaseModel
from typing import Optional

class FilteredCoin(BaseModel):
    id: str
    symbol: str
    name: str
    market_cap: Optional[float]
    fully_diluted_valuation: Optional[float]
    total_volume: Optional[float]
    total_value_locked: Optional[float]
    max_supply: Optional[float]
    total_supply: Optional[float]
    circulating_supply: Optional[float]
    current_price: Optional[float]
    preview_listing: bool
