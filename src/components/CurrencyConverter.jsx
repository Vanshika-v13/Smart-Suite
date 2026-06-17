import { useState, useCallback } from 'react';
import { DollarSign, ArrowRightLeft, Copy, CheckCheck, AlertCircle, TrendingUp, RotateCcw } from 'lucide-react';

/* ── Static exchange rate table (all pairs via INR base) ── */
const RATES = {
  USD: 1,
  EUR: 0.9204,
  GBP: 0.7869,
  INR: 83.12,
  JPY: 154.72,
  CAD: 1.3635,
  AUD: 1.5301,
  CHF: 0.9012,
  CNY: 7.2401,
  SGD: 1.3412,
};

const CURRENCY_LABELS = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  SGD: 'Singapore Dollar',
};

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹',
  JPY: '¥', CAD: 'CA$', AUD: 'A$', CHF: 'Fr',
  CNY: '¥', SGD: 'S$',
};

const FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', INR: '🇮🇳',
  JPY: '🇯🇵', CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭',
  CNY: '🇨🇳', SGD: '🇸🇬',
};

function convert(amount, from, to) {
  if (from === to) return amount;
  const inUSD = amount / RATES[from];
  return inUSD * RATES[to];
}

function fmt(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 4,
  }).format(value);
}

export default function CurrencyConverter() {
  const [amount, setAmount]   = useState('');
  const [from, setFrom]       = useState('USD');
  const [to, setTo]           = useState('INR');
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [swapped, setSwapped] = useState(false);

  const handleConvert = useCallback(() => {
    setError('');
    const num = parseFloat(amount);
    if (!amount.trim()) { setError('Please enter an amount to convert.'); return; }
    if (isNaN(num) || num <= 0) { setError('Amount must be a valid positive number.'); return; }
    setResult(convert(num, from, to));
  }, [amount, from, to]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setSwapped(s => !s);
  };

  const handleCopy = () => {
    if (result === null) return;
    navigator.clipboard.writeText(result.toFixed(4));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAmount('');
    setFrom('USD');
    setTo('INR');
    setResult(null);
    setError('');
    setCopied(false);
    setSwapped(false);
  };

  const rate = RATES[to] / RATES[from];
  const hasInput = amount || result !== null || from !== 'USD' || to !== 'INR';

  return (
    <div className="tool-wrapper">
      {/* ── Header ── */}
      <div className="tool-header">
        <div>
          <h1 className="tool-title">Currency Converter</h1>
          <p className="tool-subtitle">Static exchange rates · Frontend-only · 10 currencies</p>
        </div>
        <span className="nav-item-badge" style={{ fontSize: 11, padding: '4px 12px' }}>
          <TrendingUp size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Live UI
        </span>
      </div>

      {/* ── Input Card ── */}
      <div className="card" style={{ padding: 'var(--sp-8)' }}>
        <h2 className="card-title">
          <DollarSign size={18} />
          Enter Conversion Details
        </h2>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label" htmlFor="cc-amount">Amount</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute', left: 13,
              color: 'var(--text-tertiary)',
              fontWeight: 600, fontSize: 15,
              pointerEvents: 'none', zIndex: 1,
            }}>
              {CURRENCY_SYMBOLS[from]}
            </span>
            <input
              id="cc-amount"
              className="form-input"
              type="number"
              min="0"
              placeholder="Enter amount (e.g. 1000)"
              value={amount}
              onChange={e => { setAmount(e.target.value); setResult(null); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleConvert()}
              style={{ paddingLeft: 32 }}
            />
          </div>
        </div>

        {/* From / Swap / To */}
        <div className="cc-pair" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="cc-from">From Currency</label>
            <select
              id="cc-from"
              className="form-input"
              value={from}
              onChange={e => { setFrom(e.target.value); setResult(null); }}
            >
              {Object.keys(RATES).map(c => (
                <option key={c} value={c}>{FLAGS[c]} {c} — {CURRENCY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <button
            className="cc-swap-btn"
            onClick={handleSwap}
            aria-label="Swap currencies"
            title="Swap currencies"
            style={{ transform: swapped ? 'rotate(180deg)' : 'none', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <ArrowRightLeft size={16} />
          </button>

          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="cc-to">To Currency</label>
            <select
              id="cc-to"
              className="form-input"
              value={to}
              onChange={e => { setTo(e.target.value); setResult(null); }}
            >
              {Object.keys(RATES).map(c => (
                <option key={c} value={c}>{FLAGS[c]} {c} — {CURRENCY_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate hint */}
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 'var(--sp-5)' }}>
          1 {from} = {rate.toFixed(4)} {to}
        </p>

        {/* Error */}
        {error && (
          <div className="tool-error-msg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="tool-action-row">
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleConvert}>
            <ArrowRightLeft size={16} />
            Convert
          </button>
          {hasInput && (
            <button className="btn-secondary tool-reset-btn" onClick={handleReset} title="Reset all fields">
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Result Card ── */}
      {result !== null && (
        <div className="result-card" style={{ animation: 'fadeSlideIn 0.35s ease' }}>
          <p className="result-card-label">Converted Amount</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
            <div>
              <div className="result-emi-amount">{fmt(result, to)}</div>
              <div className="result-emi-sub">
                {FLAGS[from]} {parseFloat(amount).toLocaleString()} {from} → {FLAGS[to]} {to}
              </div>
            </div>
            <button
              className="tool-copy-btn"
              onClick={handleCopy}
              title="Copy result"
              data-copied={copied}
            >
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="result-divider" />

          <div className="result-breakdown">
            <div className="result-breakdown-item">
              <span className="result-breakdown-label">Exchange Rate</span>
              <span className="result-breakdown-value">1 {from} = {rate.toFixed(4)} {to}</span>
            </div>
            <div className="result-breakdown-item highlight">
              <span className="result-breakdown-label">Inverse Rate</span>
              <span className="result-breakdown-value">1 {to} = {(1 / rate).toFixed(4)} {from}</span>
            </div>
            <div className="result-breakdown-item">
              <span className="result-breakdown-label">Input Amount</span>
              <span className="result-breakdown-value">{fmt(parseFloat(amount), from)}</span>
            </div>
            <div className="result-breakdown-item highlight">
              <span className="result-breakdown-label">Output Amount</span>
              <span className="result-breakdown-value">{fmt(result, to)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick reference rate table ── */}
      <div className="chart-card" style={{ marginTop: 0 }}>
        <h3 className="chart-card-title">
          <TrendingUp size={15} />
          Quick Reference (relative to USD)
        </h3>
        <div className="table-container" style={{ marginBottom: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Code</th>
                <th>Rate (per USD)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(RATES).map(([code, r]) => (
                <tr key={code} style={code === from || code === to ? { background: 'var(--accent-light)' } : {}}>
                  <td>{FLAGS[code]} {CURRENCY_LABELS[code]}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{code}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{r.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
