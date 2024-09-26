// app.js
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
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
    address: user.location.street.name + ', ' + user.location.city,
  }));
};

// Route to generate random users and save to CSV
app.post('/generate-users', async (req, res) => {
  const { count } = req.body; // Get the number of users to generate
  const users = await getRandomUsers(count);

  const csvWriter = createObjectCsvWriter({
    path: path.join(__dirname, 'users.csv'),
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'address', title: 'Address' },
    ],
  });

  await csvWriter.writeRecords(users);
  
  // Instead of sending a JSON response, render the EJS template with a message
  res.render('index', { message: 'User data generated', filePath: '/users.csv' });
});

// Serve the EJS template
app.get('/', (req, res) => {
  res.render('index', { message: '', filePath: '' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
