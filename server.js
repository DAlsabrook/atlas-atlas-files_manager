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


// curl 0.0.0.0:5000/status ; echo ""

// token : f9fff642-4591-4508-9e63-a866fdbb01bd
// {"id":"67325d496cbd646b3b052343","email":"bob@dylan.com"}
