const express = require('express');
const app = express();
const path = require('path');

app.use('/riot.txt', express.static(path.join(__dirname, 'riot.txt')));

app.listen(5173, () => {
  console.log('Server is running on port 5173');
});