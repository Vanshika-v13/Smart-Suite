import { Calculator, Receipt, FileJson, QrCode, Sparkles, DollarSign, Type, KeyRound } from 'lucide-react';

const Sidebar = ({ activeTool, setActiveTool }) => {
  const tools = [
    { id: 'emi',      name: 'EMI Calculator',           icon: <Calculator  size={16} /> },
    { id: 'gst',      name: 'GST Calculator',           icon: <Receipt     size={16} /> },
    { id: 'json',     name: 'JSON Formatter',           icon: <FileJson    size={16} /> },
    { id: 'qr',       name: 'QR Generator',             icon: <QrCode      size={16} /> },
    { id: 'currency', name: 'Currency Converter',       icon: <DollarSign  size={16} /> },
    { id: 'words',    name: 'Word & Character Counter', icon: <Type        size={16} /> },
    { id: 'password', name: 'Password Generator',       icon: <KeyRound    size={16} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo-mark">
          <Sparkles size={16} />
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">Smart Suite</span>
          <span className="sidebar-brand-sub">Utility Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <p className="nav-label">Tools</p>
      <ul className="nav-list">
        {tools.map(tool => (
          <li
            key={tool.id}
            className={`nav-item ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveTool(tool.id)}
          >
            <span className="nav-item-icon">{tool.icon}</span>
            {tool.name}
          </li>
        ))}
      </ul>

      {/* Digital Heroes Badge */}
      <div className="sidebar-heroes-section">
        <div className="heroes-badge" id="digital-heroes-badge">
          <span className="heroes-badge-icon">⚡</span>
          Built for Digital Heroes
        </div>
        <span className="heroes-tagline">Crafted for the Digital Heroes internship task</span>
      </div>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">VV</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Vanshika Verma</span>
            <span className="sidebar-user-email">vanshikaverma1310@gmail.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
