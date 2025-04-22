const express = require('express');
const cors = require('cors');
const db = require('./db');
const ExcelJS = require('exceljs');

const app = express();
app.use(cors());
app.use(express.json());

function calculateAdjustedValue(value, priority, time, temp) {
  return value + (priority * 10) + (time * 5) + (temp * 5);
}

function fractionalKnapsack(items, capacity) {
  let totalValue = 0;
  let remaining = capacity;
  let selected = [];

  for (const item of items) {
    const isFullyTaken = item.weight <= remaining;
    const takenWeight = isFullyTaken ? item.weight : remaining;
    const takenFraction = takenWeight / item.weight;
    const takenValue = item.value * takenFraction;

    selected.push({ ...item, taken: takenFraction });
    totalValue += takenValue;
    remaining -= takenWeight;

    if (remaining <= 0) break;
  }

  return { totalValue, selected };
}

app.post('/api/optimize', (req, res) => {
  const cargoItems = req.body.items;
  const capacity = req.body.capacity;

  const adjustedItems = cargoItems.map(item => {
    const adjustedValue = calculateAdjustedValue(
      item.value,
      item.priority,
      item.time,
      item.temp
    );

    // Insert item into database
    db.query(
      'INSERT INTO cargo_items (weight, value, priority, time, temp, fragility) VALUES (?, ?, ?, ?, ?, ?)',
      [item.weight, item.value, item.priority, item.time, item.temp, item.fragility],
      (err) => {
        if (err) console.error('Insert error:', err);
      }
    );

    return {
      ...item,
      value: adjustedValue,
      ratio: adjustedValue / item.weight,
    };
  });

  adjustedItems.sort((a, b) => b.ratio - a.ratio);

  const result = fractionalKnapsack(adjustedItems, capacity);
  res.json(result);
});

app.get('/export-excel', async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cargo Data');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Weight', key: 'weight', width: 10 },
    { header: 'Value', key: 'value', width: 10 },
    { header: 'Priority', key: 'priority', width: 15 },
    { header: 'Time', key: 'time', width: 10 },
    { header: 'Temp', key: 'temp', width: 10 },
    { header: 'Fragility', key: 'fragility', width: 15 }
  ];

  db.query('SELECT * FROM cargo_items', async (err, results) => {
    if (err) {
      console.error('Export error:', err);
      return res.status(500).send('Database error');
    }

    worksheet.addRows(results);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=cargo_data.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
