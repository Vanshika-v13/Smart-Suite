import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const GstCalculator = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Web Development Services', quantity: 1, price: 5000, gstRate: 18 }
  ]);
  
  let subtotal = 0;
  let totalGst = 0;
  let grandTotal = 0;

  items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const prc = parseFloat(item.price) || 0;
    const rate = parseFloat(item.gstRate) || 0;
    
    const itemSubtotal = qty * prc;
    const itemGst = itemSubtotal * (rate / 100);
    
    subtotal += itemSubtotal;
    totalGst += itemGst;
    grandTotal += (itemSubtotal + itemGst);
  });

  const addItem = () => {
    setItems([
      ...items, 
      { id: Date.now(), name: '', quantity: 1, price: 0, gstRate: 18 }
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="card" style={{ maxWidth: '1000px' }}>
      <h2 className="card-title">GST / Invoice Calculator</h2>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Item Description</th>
              <th style={{ width: '15%' }}>Qty</th>
              <th style={{ width: '20%' }}>Price</th>
              <th style={{ width: '15%' }}>GST %</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Item name"
                    aria-label="Item name"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    min="1"
                    aria-label="Quantity"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                    min="0"
                    placeholder="0.00"
                    aria-label="Price"
                  />
                </td>
                <td>
                  <select 
                    className="form-input"
                    value={item.gstRate}
                    onChange={(e) => updateItem(item.id, 'gstRate', e.target.value)}
                    aria-label="GST Rate"
                  >
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="btn-danger" 
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    style={{ opacity: items.length === 1 ? 0.3 : 1, cursor: items.length === 1 ? 'not-allowed' : 'pointer' }}
                    aria-label="Remove Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn-secondary" onClick={addItem} style={{ marginBottom: '24px' }}>
        <Plus size={18} /> Add New Item
      </button>

      <div className="result-box" style={{ maxWidth: '400px', marginLeft: 'auto' }}>
        <div className="result-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="result-row">
          <span>Total GST</span>
          <span>{formatCurrency(totalGst)}</span>
        </div>
        <div className="result-row">
          <span>Grand Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default GstCalculator;
