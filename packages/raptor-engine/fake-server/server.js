const express = require('express');
const serveStatic = require('serve-static');
const app = express();

app.use(serveStatic(__dirname + '/../dist'));
app.use(serveStatic(__dirname + '/../fake-cdn'));
app.use(serveStatic(__dirname + '/../fake-html'));
app.listen(8181);

console.log('Serving http://localhost:8181/ ');
