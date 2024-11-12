const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const routes = require('./routes')
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use('/', routes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;


// Start all services
// service redis-server start
// npm run start-server

// check redis and mongo connections
// curl 0.0.0.0:5000/status ; echo ""

// x-token = 0dddb872-f3bb-4785-b62d-856c85d2f376
// file id = 67329195f430a44b230a1243
