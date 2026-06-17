import { useState } from 'react';

const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      setOutput('');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="card" style={{ maxWidth: '1000px' }}>
      <h2 className="card-title">JSON Formatter & Validator</h2>
      
      <div className="grid-2-col">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Input (Raw JSON)</label>
          <textarea 
            className="form-input" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            style={{ height: '400px' }}
          />
          {error && <div className="error-text">{error}</div>}
        </div>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Output (Formatted)</label>
          <textarea 
            className="form-input" 
            value={output}
            readOnly
            placeholder='Formatted JSON will appear here...'
            style={{ height: '400px', backgroundColor: '#F7F9FC' }}
          />
        </div>
      </div>

      <div className="flex-row" style={{ marginTop: '1.5rem' }}>
        <button className="btn-primary" onClick={formatJson} style={{ width: 'auto' }}>
          Format & Validate
        </button>
        <button className="btn-secondary" onClick={clearAll}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default JsonFormatter;
