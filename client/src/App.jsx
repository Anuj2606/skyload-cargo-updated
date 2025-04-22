import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ weight: '', value: '', priority: '', time: '', temp: '', fragility: '' });
  const [capacity, setCapacity] = useState('');
  const [result, setResult] = useState(null);

  const addItem = () => {
    setItems([...items, { ...form, weight: +form.weight, value: +form.value }]);
    setForm({ weight: '', value: '', priority: '', time: '', temp: '', fragility: '' });
  };

  const optimize = async () => {
    const res = await axios.post('http://localhost:5000/api/optimize', { items, capacity: +capacity });
    setResult(res.data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-6">✈️ SkyLoad Cargo </h1>

        <div className="grid gap-4 grid-cols-2 mb-4">
          {['weight', 'value', 'priority', 'time', 'temp', 'fragility'].map(field => (
            <input
              key={field}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
          <button
            className="col-span-2 bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded-lg font-semibold"
            onClick={addItem}
          >
            ➕ Add Cargo Item
          </button>
        </div>

        <input
          className="p-2 border border-gray-300 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter Knapsack Capacity (kg)"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg w-full font-semibold transition"
          onClick={optimize}
        >
          🚀 Optimize Loading
        </button>

        {result && (
          <div className="bg-white p-4 rounded-xl mt-6 shadow-md border border-blue-100">
            <h2 className="text-xl font-bold mb-2 text-green-700">💰 Total Value: {result.totalValue.toFixed(2)}</h2>
            <table className="w-full border text-sm mt-4">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border p-2">#</th>
                  <th className="border p-2">Weight</th>
                  <th className="border p-2">Adjusted Value</th>
                  <th className="border p-2">Taken (%)</th>
                </tr>
              </thead>
              <tbody>
                {result.selected.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2 text-center">{item.weight}</td>
                    <td className="border p-2 text-center">{item.value}</td>
                    <td className="border p-2 text-center">{(item.taken * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg mt-6 font-medium transition"
          onClick={() => window.open('http://localhost:5000/export-excel', '_blank')}
        >
          📁 Export to Excel
        </button>

        <div className="bg-gradient-to-br from-blue-50 to-white shadow-lg rounded-2xl p-6 mt-10 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5c4.142 0 7.5-3.358 7.5-7.5S16.142 5.5 12 5.5 4.5 8.858 4.5 13s3.358 7.5 7.5 7.5z" />
            </svg>
            Cargo Field Info & Scale
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><span className="font-semibold text-blue-600">Weight:</span> Total weight of the cargo item in <strong>kg</strong></li>
            <li><span className="font-semibold text-blue-600">Value:</span> Revenue or importance score of the item</li>
            <li><span className="font-semibold text-blue-600">Priority (1–5):</span> Urgency level — <em>5 = highest priority</em></li>
            <li><span className="font-semibold text-blue-600">Time Sensitive (1–5):</span> How urgently it must be delivered</li>
            <li><span className="font-semibold text-blue-600">Temperature Sensitive (1–5):</span> 5 = Needs strict temperature control</li>
            <li><span className="font-semibold text-blue-600">Fragility:</span> Indicates if the item is fragile — <em>Low, Medium, High</em></li>
            <li><span className="font-semibold text-blue-600">Taken:</span> Fraction of cargo taken — <strong>1</strong> means fully loaded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
