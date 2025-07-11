const express = require('express');
const fetch = require('node-fetch');
const { ChromeStorage } = require('chrome-storage');
const fs = require('fs'); // Node.js file system module

const app = express();

app.use(express.json());

async function getUrlsFromChromeStorage() {
  const chromeStorage = new ChromeStorage();
  const urls = await chromeStorage.get('Requestid','StatusCode','ip','url','type','timestamp','tableid','fromcache','method','target');
  return urls;
}

app.post('/capture_data', async (req, res) => {
  try {
    const urls = await getUrlsFromChromeStorage();

    if (urls && Array.isArray(urls)) {
      const response = await fetch('http://127.0.0.1:8000/data-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (response.ok) {
        console.log('Data sent successfully');

        // Convert the data to CSV format
        const csvData = urls.map(url => `${url}\n`).join('');

        // Write the CSV data to a local file
        fs.writeFileSync('C:\\Users\\acer\\Desktop\\CYBER HYGIENE TOOL V8 Superuser\\KavachLocalAI\\KavachLocalAI\\urls.csv', csvData);


        res.status(200).send('Data sent and saved as CSV successfully');
      } else {
        console.error('Error sending data:', response.statusText);
        res.status(500).send('Error sending data');
      }
    } else {
      res.status(400).send('Invalid data format');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
