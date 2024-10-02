// app.js
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { createObjectCsvStringifier } from 'csv-writer'; // Use stringifier to create CSV in memory
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000; // Use the environment port for Vercel

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the public directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Function to fetch random users from RandomUser.me API
const getRandomUsers = async (count) => {
  const response = await fetch(`https://randomuser.me/api/?results=${count}`);
  const data = await response.json();
  return data.results.map(user => ({
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    phone: user.phone,
    address: `${user.location.street.name}, ${user.location.city}`,
  }));
};

// Route to generate random users and send CSV as response
app.post('/generate-users', async (req, res) => {
  const { count } = req.body; // Get the number of users to generate
  const users = await getRandomUsers(count);

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'address', title: 'Address' },
    ],
  });

  const csvHeader = csvStringifier.getHeaderString();
  const csvData = csvStringifier.stringifyRecords(users);
  const csvContent = `${csvHeader}${csvData}`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
  res.status(200).send(csvContent); // Send CSV content as response
});

// Serve the EJS template
app.get('/', (req, res) => {
  res.render('index', { message: '', filePath: '' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
