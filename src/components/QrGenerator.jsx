import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrGenerator = () => {
  const [text, setText] = useState('https://example.com');
  const qrRef = useRef(null);

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 className="card-title">QR Code Generator</h2>
      
      <div className="form-group">
        <label className="form-label">Enter Text or URL</label>
        <input 
          type="text" 
          className="form-input" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="result-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div 
          ref={qrRef} 
          style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid #E3E8EE'
          }}
        >
          <QRCodeCanvas 
            value={text || ' '} 
            size={200}
            level={"H"}
          />
        </div>
        
        <button 
          className="btn-primary" 
          onClick={downloadQR}
          disabled={!text}
          style={{ width: 'auto', padding: '0.75rem 2rem' }}
        >
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default QrGenerator;
