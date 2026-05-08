import { useState, useEffect, useMemo } from "react";

const API_BASE = "http://localhost:8000";

const formatNum = (n, decimals = 2) => {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(decimals)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
};

const SortIcon = ({ field, current, direction }) => {
  const active = current === field;
  return (
    <span className={`sort-icon ${active ? "active" : ""}`}>
      {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
};

export default function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [fdvMax, setFdvMax] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    fetch(`${API_BASE}/coins/filtered`)
      .then(r => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        setCoins(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const handleSort = field => {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let list = [...coins];

    if (search.trim())
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.symbol.toLowerCase().includes(search.toLowerCase()),
      );

    if (fdvMax !== "") {
      const max = parseFloat(fdvMax) * 1_000_000;
      if (!isNaN(max))
        list = list.filter(
          c =>
            c.fully_diluted_valuation != null &&
            c.fully_diluted_valuation <= max,
        );
    }

    if (sortField) {
      list.sort((a, b) => {
        const va = a[sortField] ?? -Infinity;
        const vb = b[sortField] ?? -Infinity;
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [coins, search, fdvMax, sortField, sortDir]);

  return (
    <div className='app'>
      <header className='header'>
        <div className='header-inner'>
          <div className='logo'>
            <span className='logo-mark'>◈</span>
            <span className='logo-text'>CryptoFilter</span>
          </div>
          <p className='tagline'>
            Preview listings · Low FDV · High conviction
          </p>
        </div>
      </header>

      <main className='main'>
        <div className='controls'>
          <div className='control-group'>
            <label className='label'>Search</label>
            <div className='input-wrap'>
              <span className='input-icon'>⌕</span>
              <input
                className='input'
                placeholder='e.g. eth, bitcoin...'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className='control-group'>
            <label className='label'>Max FDV (in $M)</label>
            <div className='input-wrap'>
              <span className='input-icon'>$</span>
              <input
                className='input'
                type='number'
                placeholder='e.g. 50'
                value={fdvMax}
                onChange={e => setFdvMax(e.target.value)}
              />
            </div>
          </div>

          <div className='control-group'>
            <label className='label'>Sort by</label>
            <div className='sort-buttons'>
              <button
                className={`sort-btn ${sortField === "market_cap" ? "active" : ""}`}
                onClick={() => handleSort("market_cap")}>
                Market Cap{" "}
                <SortIcon
                  field='market_cap'
                  current={sortField}
                  direction={sortDir}
                />
              </button>
              <button
                className={`sort-btn ${sortField === "total_volume" ? "active" : ""}`}
                onClick={() => handleSort("total_volume")}>
                24h Volume{" "}
                <SortIcon
                  field='total_volume'
                  current={sortField}
                  direction={sortDir}
                />
              </button>
            </div>
          </div>
        </div>

        <div className='results-bar'>
          {!loading && !error && (
            <span>
              {filtered.length} coin{filtered.length !== 1 ? "s" : ""} matched
            </span>
          )}
        </div>

        {loading && (
          <div className='state-box'>
            <div className='spinner' />
            <p>Fetching coins from backend…</p>
          </div>
        )}

        {error && (
          <div className='state-box error'>
            <span className='state-icon'>⚠</span>
            <p>{error}</p>
            <small>Make sure your backend is running on port 8000</small>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className='state-box'>
            <span className='state-icon'>◌</span>
            <p>No coins match your filters</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className='table-wrap'>
            <table className='table'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th
                    className='num'
                    onClick={() => handleSort("current_price")}
                    style={{ cursor: "pointer" }}>
                    Price{" "}
                    <SortIcon
                      field='current_price'
                      current={sortField}
                      direction={sortDir}
                    />
                  </th>
                  <th
                    className='num'
                    onClick={() => handleSort("market_cap")}
                    style={{ cursor: "pointer" }}>
                    Market Cap{" "}
                    <SortIcon
                      field='market_cap'
                      current={sortField}
                      direction={sortDir}
                    />
                  </th>
                  <th
                    className='num'
                    onClick={() => handleSort("fully_diluted_valuation")}
                    style={{ cursor: "pointer" }}>
                    FDV{" "}
                    <SortIcon
                      field='fully_diluted_valuation'
                      current={sortField}
                      direction={sortDir}
                    />
                  </th>
                  <th
                    className='num'
                    onClick={() => handleSort("total_volume")}
                    style={{ cursor: "pointer" }}>
                    24h Volume{" "}
                    <SortIcon
                      field='total_volume'
                      current={sortField}
                      direction={sortDir}
                    />
                  </th>
                  <th className='num'>TVL</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coin, i) => (
                  <tr key={coin.id}>
                    <td className='rank'>{i + 1}</td>
                    <td>
                      <div className='coin-name'>
                        <span className='coin-symbol'>
                          {coin.symbol.toUpperCase()}
                        </span>
                        <span className='coin-full'>{coin.name}</span>
                        {coin.preview_listing && (
                          <span className='badge'>Preview</span>
                        )}
                      </div>
                    </td>
                    <td className='num'>{formatNum(coin.current_price)}</td>
                    <td className='num'>{formatNum(coin.market_cap)}</td>
                    <td className='num'>
                      {formatNum(coin.fully_diluted_valuation)}
                    </td>
                    <td className='num'>{formatNum(coin.total_volume)}</td>
                    <td className='num'>
                      {formatNum(coin.total_value_locked)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
