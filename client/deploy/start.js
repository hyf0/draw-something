const express = require('express');


const app = express();

app.use(express.static('dist'))


const server = app.listen(9420, '0.0.0.0', () => {
  console.log(`deployed in ${server.address().address}:${server.address().port}`);
});
