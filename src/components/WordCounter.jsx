import { useState, useMemo, useCallback } from 'react';
import { Type, Copy, CheckCheck, Trash2, BarChart2, AlignLeft, Hash, Clock, FileText, RotateCcw } from 'lucide-react';

/* ── Text analysis helpers ── */
function analyze(text) {
  const trimmed = text.trim();
  const words        = trimmed === '' ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
  const chars        = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences    = trimmed === '' ? 0 : (trimmed.match(/[^.!?]*[.!?]+/g) || [trimmed]).filter(s => s.trim()).length;
  const paragraphs   = trimmed === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length || (trimmed ? 1 : 0);
  const readMins     = Math.max(1, Math.ceil(words / 200)); // avg 200 wpm
  const speakMins    = Math.max(1, Math.ceil(words / 130)); // avg 130 wpm

  /* Top 5 most-frequent words (ignoring stopwords) */
  const stopwords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','was','are','were','be','been','being','it','its','this','that','these','those','i','you','he','she','we','they','my','your','his','her','our','their','what','which','who','from','by']);
  const wordFreq = {};
  if (trimmed) {
    trimmed.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(w => {
      if (w && !stopwords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  }
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return { words, chars, charsNoSpace, sentences, paragraphs, readMins, speakMins, topWords };
}

export default function WordCounter() {
  const [text, setText]     = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedStats, setCopiedStats] = useState(false);

  const stats = useMemo(() => analyze(text), [text]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleCopyStats = useCallback(() => {
    const summary = [
      `Words: ${stats.words}`,
      `Characters: ${stats.chars}`,
      `Characters (no spaces): ${stats.charsNoSpace}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Reading time: ${stats.readMins} min`,
      `Speaking time: ${stats.speakMins} min`,
    ].join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedStats(true);
    setTimeout(() => setCopiedStats(false), 2000);
  }, [stats]);

  const handleClear = () => setText('');

  const maxTop = stats.topWords[0]?.[1] || 1;

  return (
    <div className="tool-wrapper">
      {/* ── Header ── */}
      <div className="tool-header">
        <div>
          <h1 className="tool-title">Word &amp; Character Counter</h1>
          <p className="tool-subtitle">Real-time text analysis — words, characters, sentences &amp; more</p>
        </div>
        <span className="nav-item-badge" style={{ fontSize: 11, padding: '4px 12px' }}>
          <Type size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Live Analysis
        </span>
      </div>

      {/* ── Textarea Card ── */}
      <div className="card" style={{ padding: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            <AlignLeft size={18} />
            Your Text
          </h2>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button
              className="btn-secondary tool-action-btn-sm"
              onClick={handleCopy}
              disabled={!text}
              title="Copy text to clipboard"
            >
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              className="btn-secondary tool-action-btn-sm tool-reset-btn-sm"
              onClick={handleClear}
              disabled={!text}
              title="Clear all text"
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>
        </div>

        <textarea
          id="wc-textarea"
          className="form-input wc-textarea"
          placeholder="Start typing or paste your text here… Stats update instantly as you type."
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            minHeight: 220,
            fontFamily: 'var(--font)',
            fontSize: 14,
            lineHeight: 1.75,
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {stats.chars} / ∞ characters
          </span>
        </div>
      </div>

      {/* ── Primary Stats Grid ── */}
      <div className="wc-stats-grid">
        {[
          { icon: <Hash size={18} />,     label: 'Words',        value: stats.words,         accent: true  },
          { icon: <Type size={18} />,      label: 'Characters',   value: stats.chars                       },
          { icon: <AlignLeft size={18} />, label: 'No Spaces',    value: stats.charsNoSpace                },
          { icon: <FileText size={18} />,  label: 'Sentences',    value: stats.sentences                   },
          { icon: <BarChart2 size={18} />, label: 'Paragraphs',   value: stats.paragraphs                  },
        ].map(({ icon, label, value, accent }) => (
          <div key={label} className={`wc-stat-item${accent ? ' accent' : ''}`}>
            <div className="wc-stat-icon">{icon}</div>
            <div className="wc-stat-value">{value.toLocaleString()}</div>
            <div className="wc-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Copy Stats button ── */}
      {text && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-secondary tool-action-btn-sm"
            onClick={handleCopyStats}
            title="Copy all stats to clipboard"
          >
            {copiedStats ? <CheckCheck size={13} /> : <Copy size={13} />}
            {copiedStats ? 'Stats Copied!' : 'Copy Stats'}
          </button>
        </div>
      )}

      {/* ── Reading / Speaking Time + Top Words ── */}
      <div className="wc-bottom-row">

        {/* Time estimates */}
        <div className="card" style={{ flex: 1, padding: 'var(--sp-6)' }}>
          <h3 className="card-title" style={{ fontSize: 14, marginBottom: 'var(--sp-5)' }}>
            <Clock size={15} />
            Time Estimates
          </h3>
          <div className="wc-time-row">
            <div className="wc-time-item">
              <div className="wc-time-icon">📖</div>
              <div className="wc-time-value">
                {stats.readMins >= 60
                  ? `${Math.floor(stats.readMins / 60)}h ${stats.readMins % 60}m`
                  : `${stats.readMins} min`}
              </div>
              <div className="wc-time-label">Reading time<br /><span style={{ fontSize: 10 }}>(200 wpm)</span></div>
            </div>
            <div className="wc-time-divider" />
            <div className="wc-time-item">
              <div className="wc-time-icon">🎙️</div>
              <div className="wc-time-value">
                {stats.speakMins >= 60
                  ? `${Math.floor(stats.speakMins / 60)}h ${stats.speakMins % 60}m`
                  : `${stats.speakMins} min`}
              </div>
              <div className="wc-time-label">Speaking time<br /><span style={{ fontSize: 10 }}>(130 wpm)</span></div>
            </div>
          </div>
        </div>

        {/* Top words */}
        <div className="card" style={{ flex: 1, padding: 'var(--sp-6)' }}>
          <h3 className="card-title" style={{ fontSize: 14, marginBottom: 'var(--sp-5)' }}>
            <BarChart2 size={15} />
            Top Words
          </h3>
          {stats.topWords.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--sp-4) 0' }}>
              Start typing to see word frequency…
            </p>
          ) : (
            <div className="wc-top-words">
              {stats.topWords.map(([word, count]) => (
                <div key={word} className="wc-top-word-row">
                  <span className="wc-top-word">{word}</span>
                  <div className="wc-top-bar-wrap">
                    <div className="wc-top-bar-fill" style={{ width: `${(count / maxTop) * 100}%` }} />
                  </div>
                  <span className="wc-top-count">×{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
