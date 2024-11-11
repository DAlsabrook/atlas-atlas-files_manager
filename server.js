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
// service mongodb start
// npm run start-server


// curl 0.0.0.0:5000/status ; echo ""

// token : f9fff642-4591-4508-9e63-a866fdbb01bd
// {"id":"67325d496cbd646b3b052343","email":"bob@dylan.com"}

// curl -XPOST 0.0.0.0:5000/files -H "X-Token: 09c9a38a-b76c-46f5-9207-9298d53a8f82" -H "Content-Type: application/json" -d '{ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }' ; echo ""
