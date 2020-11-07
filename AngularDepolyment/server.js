const express = require('express');
var path = require('path');

//Starting Express server
const app = express();
var port = process.env.PORT || 8081;
//Set the base path to the angular-test dist folder
app.use('' ,express.static(path.join(__dirname, 'dist/HW8-StockSearch')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/HW8-StockSearch/index.html'));
})

//Starting server on port 8081
app.listen(port);
