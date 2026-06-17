import { useState } from 'react';
import Sidebar from './components/Sidebar';
import EmiCalculator from './components/EmiCalculator';
import GstCalculator from './components/GstCalculator';
import JsonFormatter from './components/JsonFormatter';
import QrGenerator from './components/QrGenerator';
import CurrencyConverter from './components/CurrencyConverter';
import WordCounter from './components/WordCounter';
import PasswordGenerator from './components/PasswordGenerator';
import './index.css';

function App() {
  const [activeTool, setActiveTool] = useState('emi');

  const renderTool = () => {
    switch (activeTool) {
      case 'emi':      return <EmiCalculator />;
      case 'gst':      return <GstCalculator />;
      case 'json':     return <JsonFormatter />;
      case 'qr':       return <QrGenerator />;
      case 'currency': return <CurrencyConverter />;
      case 'words':    return <WordCounter />;
      case 'password': return <PasswordGenerator />;
      default:         return <EmiCalculator />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="main-content">
        {renderTool()}
      </main>
    </div>
  );
}

export default App;
