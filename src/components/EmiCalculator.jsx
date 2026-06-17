import { useState, useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, Info, Calculator } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ── helpers ── */
const fmt = (v) => {
  if (!v || isNaN(v)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);
};

const fmtCompact = (v) => {
  if (!v || isNaN(v)) return '₹0';
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000)    return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1000)        return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

/* Count-up hook */
function useCountUp(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const fromRef  = useRef(target);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    const from = fromRef.current;
    const to   = target;
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else fromRef.current = to;
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

/* Quick rate presets */
const RATE_PRESETS = [6.5, 8.5, 10, 12, 14];

const EmiCalculator = () => {
  const [principal, setPrincipal] = useState(1500000);
  const [rate,      setRate]      = useState(8.5);
  const [tenure,    setTenure]    = useState(20);
  const [tenureType, setTenureType] = useState('years');

  /* ── Core Calculation ── */
  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) / 12 / 100;
  let n   = parseFloat(tenure) || 0;
  if (tenureType === 'years') n = n * 12;

  let emi = 0, totalInterest = 0, totalPayment = 0;

  if (p > 0 && n > 0) {
    if (r === 0) {
      emi = p / n;
      totalPayment = p;
    } else {
      emi          = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalPayment = emi * n;
      totalInterest = totalPayment - p;
    }
  }

  const principalPct = totalPayment > 0 ? (p / totalPayment) * 100 : 0;

  /* Count-up on EMI value */
  const animatedEmi = useCountUp(Math.round(emi));

  /* ── Chart data ── */
  const chartData = {
    labels: ['Principal', 'Interest'],
    datasets: [{
      data: [Math.round(p), Math.round(totalInterest)],
      backgroundColor: ['#4F46E5', '#a5b4fc'],
      borderColor: ['#4338CA', '#818cf8'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${fmt(ctx.raw)}`,
        },
        backgroundColor: '#0F1117',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 10,
        borderRadius: 8,
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '920px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-eyebrow">
          <Calculator size={11} /> EMI Calculator
        </div>
        <h1>Loan EMI Planner</h1>
        <p>Plan your finances with a real-time breakdown of your loan repayment.</p>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="emi-grid">

          {/* ── LEFT COLUMN : Inputs ── */}
          <div>
            <p className="card-section-title">Loan Details</p>

            {/* Loan Amount */}
            <div className="form-group">
              <label className="form-label">Loan Amount</label>
              <div className="slider-value-display">{fmtCompact(principal)}</div>
              <input
                type="range"
                className="form-slider"
                min={50000}
                max={10000000}
                step={50000}
                value={principal}
                onChange={e => setPrincipal(Number(e.target.value))}
              />
              <div className="slider-labels">
                <span>₹50K</span>
                <span>₹1Cr</span>
              </div>
              <input
                id="principal"
                type="number"
                className="form-input"
                value={principal}
                onChange={e => setPrincipal(e.target.value)}
                min="0"
                placeholder="e.g. 1500000"
                style={{ marginTop: '12px' }}
              />
            </div>

            {/* Interest Rate */}
            <div className="form-group">
              <label className="form-label">Interest Rate (% per annum)</label>
              <div className="slider-value-display">{rate}%</div>
              <input
                type="range"
                className="form-slider"
                min={4}
                max={24}
                step={0.5}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
              />
              <div className="slider-labels">
                <span>4%</span>
                <span>24%</span>
              </div>
              {/* Quick rate pills */}
              <div className="quick-pills">
                {RATE_PRESETS.map(r => (
                  <button
                    key={r}
                    className={`quick-pill ${rate === r ? 'active' : ''}`}
                    onClick={() => setRate(r)}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure */}
            <div className="form-group">
              <label className="form-label">Loan Tenure</label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span className="slider-value-display">{tenure}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {tenureType}
                </span>
              </div>
              <input
                type="range"
                className="form-slider"
                min={1}
                max={tenureType === 'years' ? 30 : 360}
                step={1}
                value={tenure}
                onChange={e => setTenure(Number(e.target.value))}
              />
              <div className="slider-labels">
                <span>1 {tenureType === 'years' ? 'yr' : 'mo'}</span>
                <span>{tenureType === 'years' ? '30 yrs' : '360 mo'}</span>
              </div>
              {/* Tenure type toggle */}
              <div className="tenure-toggle" style={{ marginTop: '12px' }}>
                <button
                  className={tenureType === 'years' ? 'active' : ''}
                  onClick={() => { setTenureType('years'); setTenure(Math.min(tenure, 30)); }}
                >
                  Years
                </button>
                <button
                  className={tenureType === 'months' ? 'active' : ''}
                  onClick={() => { setTenureType('months'); setTenure(tenure * 12 > 360 ? 360 : tenure * 12); }}
                >
                  Months
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN : Results ── */}
          <div>
            <p className="card-section-title">Repayment Summary</p>

            {/* Premium dark result card */}
            <div className="result-card">
              <div className="result-card-label">Monthly EMI</div>
              <div className="result-emi-amount">
                {emi > 0 ? `₹${animatedEmi.toLocaleString('en-IN')}` : '₹—'}
              </div>
              <div className="result-emi-sub">per month for {n} months</div>

              <div className="result-divider" />

              <div className="result-breakdown">
                <div className="result-breakdown-item">
                  <span className="result-breakdown-label">Principal</span>
                  <span className="result-breakdown-value">{fmt(p)}</span>
                </div>
                <div className="result-breakdown-item highlight">
                  <span className="result-breakdown-label">Total Interest</span>
                  <span className="result-breakdown-value">{fmt(totalInterest)}</span>
                </div>
                <div className="result-breakdown-item" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '4px' }}>
                  <span className="result-breakdown-label">Total Payment</span>
                  <span className="result-breakdown-value" style={{ fontSize: '20px' }}>{fmt(totalPayment)}</span>
                </div>
              </div>

              {/* Principal vs interest bar */}
              <div className="result-bar-wrap">
                <div className="result-bar-label">
                  <span>Principal {principalPct.toFixed(0)}%</span>
                  <span>Interest {(100 - principalPct).toFixed(0)}%</span>
                </div>
                <div className="result-bar-track">
                  <div
                    className="result-bar-fill"
                    style={{ width: `${principalPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            {emi > 0 && (
              <div className="chart-card">
                <div className="chart-card-title">
                  <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
                  Principal vs Interest
                </div>
                <div className="chart-container">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
                <div className="chart-legend">
                  <div className="chart-legend-item">
                    <div className="chart-legend-dot" style={{ background: '#4F46E5' }} />
                    Principal
                  </div>
                  <div className="chart-legend-item">
                    <div className="chart-legend-dot" style={{ background: '#a5b4fc' }} />
                    Interest
                  </div>
                </div>
              </div>
            )}

            {/* Info note */}
            {emi > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                marginTop: '16px',
                padding: '12px 14px',
                background: 'var(--accent-light)',
                borderRadius: 'var(--r-md)',
                border: '1px solid rgba(79,70,229,0.15)',
              }}>
                <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: 1.5, fontWeight: 500 }}>
                  You pay <strong>{fmt(totalInterest)}</strong> as interest over {tenure} {tenureType}.
                  That's <strong>{(totalInterest / p * 100).toFixed(0)}%</strong> over the principal amount.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiCalculator;
