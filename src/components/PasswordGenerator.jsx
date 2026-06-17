import { useState, useCallback } from 'react';
import { KeyRound, Copy, CheckCheck, RefreshCw, Shield, Eye, EyeOff, AlertCircle, RotateCcw } from 'lucide-react';

/* ── Character pools ── */
const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS  = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

/* ── Cryptographically random pick ── */
function secureRandom(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function generatePassword({ length, useUpper, useLower, useDigits, useSymbols }) {
  let pool = '';
  const required = [];

  if (useUpper)   { pool += UPPER;   required.push(UPPER[secureRandom(UPPER.length)]); }
  if (useLower)   { pool += LOWER;   required.push(LOWER[secureRandom(LOWER.length)]); }
  if (useDigits)  { pool += DIGITS;  required.push(DIGITS[secureRandom(DIGITS.length)]); }
  if (useSymbols) { pool += SYMBOLS; required.push(SYMBOLS[secureRandom(SYMBOLS.length)]); }

  if (!pool) return '';

  // Fill remaining length with random picks from pool
  const remaining = Array.from({ length: length - required.length }, () => pool[secureRandom(pool.length)]);
  const combined  = [...required, ...remaining];

  // Fisher-Yates shuffle using crypto random
  for (let i = combined.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

/* ── Strength scorer ── */
function getStrength(password) {
  if (!password) return { label: '—', score: 0, color: 'var(--border)' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak',      score: (score / 6) * 100, color: 'var(--danger)'  };
  if (score <= 4) return { label: 'Fair',       score: (score / 6) * 100, color: 'var(--warning)' };
  if (score === 5) return { label: 'Strong',    score: (score / 6) * 100, color: '#10b981'        };
  return              { label: 'Very Strong', score: 100,                 color: '#059669'        };
}

/* ── Entropy bits ── */
function entropyBits(length, poolSize) {
  return poolSize > 0 ? (length * Math.log2(poolSize)).toFixed(1) : '0';
}

/* ── Crack time estimate ── */
function crackTime(bits) {
  const b = parseFloat(bits);
  if (isNaN(b) || b === 0) return '—';
  // Assume 10^12 guesses per second (modern GPU cluster)
  const secs = Math.pow(2, b) / 1e12;
  if (secs < 1)        return '< 1 second';
  if (secs < 60)       return `${secs.toFixed(0)} seconds`;
  if (secs < 3600)     return `${(secs / 60).toFixed(0)} minutes`;
  if (secs < 86400)    return `${(secs / 3600).toFixed(0)} hours`;
  if (secs < 31536000) return `${(secs / 86400).toFixed(0)} days`;
  if (secs < 3.15e10)  return `${(secs / 31536000).toFixed(0)} years`;
  return 'Centuries 🔒';
}

export default function PasswordGenerator() {
  const [length,     setLength]     = useState(16);
  const [useUpper,   setUseUpper]   = useState(true);
  const [useLower,   setUseLower]   = useState(true);
  const [useDigits,  setUseDigits]  = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [password,   setPassword]   = useState('');
  const [visible,    setVisible]    = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [error,      setError]      = useState('');

  const opts = { length, useUpper, useLower, useDigits, useSymbols };
  const poolSize = (useUpper ? 26 : 0) + (useLower ? 26 : 0) + (useDigits ? 10 : 0) + (useSymbols ? SYMBOLS.length : 0);
  const bits     = entropyBits(length, poolSize);
  const strength = getStrength(password);
  const noCharset = !useUpper && !useLower && !useDigits && !useSymbols;

  const handleGenerate = useCallback(() => {
    setError('');
    if (noCharset) {
      setError('Select at least one character type to generate a password.');
      return;
    }
    setPassword(generatePassword(opts));
    setCopied(false);
  }, [opts, noCharset]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLength(16);
    setUseUpper(true);
    setUseLower(true);
    setUseDigits(true);
    setUseSymbols(false);
    setPassword('');
    setVisible(false);
    setCopied(false);
    setError('');
  };

  const displayPassword = visible ? password : (password ? '•'.repeat(password.length) : '');
  const hasInput = password || length !== 16 || !useUpper || !useLower || !useDigits || useSymbols;

  return (
    <div className="tool-wrapper">
      {/* ── Header ── */}
      <div className="tool-header">
        <div>
          <h1 className="tool-title">Password Generator</h1>
          <p className="tool-subtitle">Cryptographically secure · Fully client-side · Never stored</p>
        </div>
        <span className="nav-item-badge" style={{ fontSize: 11, padding: '4px 12px' }}>
          <Shield size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Secure
        </span>
      </div>

      {/* ── Options Card ── */}
      <div className="card" style={{ padding: 'var(--sp-8)' }}>
        <h2 className="card-title">
          <KeyRound size={18} />
          Generator Settings
        </h2>

        {/* Length slider */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
            <label className="form-label" htmlFor="pg-length" style={{ margin: 0 }}>Password Length</label>
            <span style={{
              background: 'var(--accent-light)', color: 'var(--accent)',
              borderRadius: 999, padding: '2px 10px',
              fontWeight: 700, fontSize: 13,
            }}>{length}</span>
          </div>
          <input
            id="pg-length"
            className="form-slider"
            type="range"
            min={6}
            max={32}
            value={length}
            onChange={e => setLength(Number(e.target.value))}
          />
          <div className="slider-labels">
            <span>6 (Minimum)</span>
            <span>32 (Maximum)</span>
          </div>
        </div>

        {/* Character options */}
        <div className="form-group" style={{ marginBottom: 'var(--sp-8)' }}>
          <label className="form-label">Include Characters</label>
          <div className="pg-options">
            {[
              { label: 'Uppercase Letters (A–Z)', value: useUpper,   set: setUseUpper,   example: 'ABC' },
              { label: 'Lowercase Letters (a–z)', value: useLower,   set: setUseLower,   example: 'abc' },
              { label: 'Numbers (0–9)',            value: useDigits,  set: setUseDigits,  example: '123' },
              { label: 'Symbols (!@#$…)',          value: useSymbols, set: setUseSymbols, example: '!@#' },
            ].map(({ label, value, set, example }) => (
              <label key={label} className="pg-option-row" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  className="pg-checkbox"
                  checked={value}
                  onChange={e => set(e.target.checked)}
                />
                <span className="pg-option-label">{label}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.05em',
                }}>{example}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="tool-error-msg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="tool-action-row">
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={handleGenerate}
            disabled={noCharset}
          >
            <RefreshCw size={16} />
            Generate Password
          </button>
          {hasInput && (
            <button className="btn-secondary tool-reset-btn" onClick={handleReset} title="Reset all settings">
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Output Card ── */}
      {password && (
        <div className="result-card" style={{ animation: 'fadeSlideIn 0.35s ease' }}>
          <p className="result-card-label">Generated Password</p>

          {/* Password display */}
          <div className="pg-display" style={{ marginBottom: 'var(--sp-4)' }}>
            <span className="pg-password-text" style={{ color: '#fff', fontSize: visible ? 15 : 18 }}>
              {displayPassword}
            </span>
            <div className="pg-display-actions">
              <button
                className="pg-icon-btn"
                title={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible(v => !v)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button
                className="pg-icon-btn"
                title="Regenerate"
                onClick={handleGenerate}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <RefreshCw size={15} />
              </button>
              <button
                className="pg-icon-btn"
                title="Copy to clipboard"
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)',
                  borderColor: copied ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)',
                  color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.2s ease',
                }}
              >
                {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          {/* One-click copy bar */}
          <button
            className="tool-copy-bar"
            onClick={handleCopy}
            data-copied={copied}
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? 'Password copied to clipboard!' : 'Click to copy password'}
          </button>

          {/* Strength bar */}
          <div className="pg-strength-wrap" style={{ marginTop: 'var(--sp-5)' }}>
            <div className="pg-strength-header">
              <span className="pg-strength-label">
                <Shield size={13} />
                Strength: <strong style={{ color: strength.color }}>{strength.label}</strong>
              </span>
              <span className="pg-strength-pct">{strength.score.toFixed(0)}%</span>
            </div>
            <div className="pg-strength-track">
              <div className="pg-strength-fill" style={{ width: `${strength.score}%`, background: strength.color }} />
            </div>
          </div>

          <div className="result-divider" style={{ marginTop: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }} />

          {/* Stats */}
          <div className="result-breakdown">
            <div className="result-breakdown-item">
              <span className="result-breakdown-label">Length</span>
              <span className="result-breakdown-value">{length} chars</span>
            </div>
            <div className="result-breakdown-item highlight">
              <span className="result-breakdown-label">Entropy</span>
              <span className="result-breakdown-value">{bits} bits</span>
            </div>
            <div className="result-breakdown-item">
              <span className="result-breakdown-label">Pool Size</span>
              <span className="result-breakdown-value">{poolSize} chars</span>
            </div>
            <div className="result-breakdown-item highlight">
              <span className="result-breakdown-label">Crack Time</span>
              <span className="result-breakdown-value" style={{ fontSize: 13 }}>{crackTime(bits)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tips Card ── */}
      <div className="chart-card" style={{ marginTop: 0 }}>
        <h3 className="chart-card-title">
          <Shield size={15} />
          Password Security Tips
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', paddingLeft: 'var(--sp-5)' }}>
          {[
            'Use at least 16 characters for strong security.',
            'Mix uppercase, lowercase, numbers and symbols.',
            'Never reuse the same password across services.',
            'Store passwords in a trusted password manager.',
            'Enable 2FA wherever possible for extra protection.',
          ].map(tip => (
            <li key={tip} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</li>
          ))}
        </ul>
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
