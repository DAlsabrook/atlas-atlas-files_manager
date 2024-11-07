const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
const routes = require('./routes')
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use('/', routes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
