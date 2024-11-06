const express = require('express')
const app = express()
const port = process.env.PORT

app.all('*', (req, res) => {
  res.send('Hello Holberton School!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
