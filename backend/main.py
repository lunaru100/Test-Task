from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from coingecko import CoinGeckoService
from coin import FilteredCoin
from coin_filter import apply_filters

app = FastAPI(
    title="Crypto Filter API",
    description="Filters CoinGecko coins by mcap, preview listing, supply, FDV, volume, and TVL.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your frontend's address
    allow_methods=["GET"],
    allow_headers=["*"],
)

coingecko = CoinGeckoService()

@app.get(
    "/coins/filtered",
    response_model=list[FilteredCoin],
    summary="Get filtered coins",
    description=(
            "Returns coins matching all of the following criteria:\n"
            "- Market Cap > 0\n"
            "- preview_listing == true\n"
            "- Max Supply == Total Supply\n"
            "- FDV < $100M\n"
            "- 24h Volume > $50k\n"
            "- TVL > $50k"
    ),
)
async def get_filtered_coins():
    try:
        raw_coins = await coingecko.fetch_coins_markets()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko API error: {str(e)}")

    filtered = apply_filters(raw_coins)
    return filtered


@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
