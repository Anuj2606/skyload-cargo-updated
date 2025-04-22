// server/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dypiu',      // your MySQL password
  database: 'skyload' // your database name
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

module.exports = connection;
