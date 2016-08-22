var express = require('express');
var serveStatic = require('serve-static');
var app = express()

app.use(serveStatic(__dirname + '/../fake-cdn'));
app.use(serveStatic(__dirname + '/../fake-html'));
app.listen(8181);

console.log('Serving http://localhost:8181/');
