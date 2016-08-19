var path = require('path');
var express = require('express');
var serveStatic = require('serve-static');
var domLibraryDir = path.dirname(require.resolve('dom-lib/components/domLibrary/dom.js'));
var app = express()

app.use(serveStatic(__dirname + '/../fake-cdn'));
app.use(serveStatic(__dirname + '/../fake-html'));
app.use(serveStatic(domLibraryDir));
app.listen(8181);

console.log('Serving http://localhost:8080/');
