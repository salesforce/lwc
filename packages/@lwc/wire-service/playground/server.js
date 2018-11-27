/* eslint eslint-comments/no-use: off */
/* eslint-env node */
const express = require('express');
const path = require('path');
const app = express();

// Define the port to run on
app.set('port', 3000);

// Serve up static files from anywhere in the site
app.use('/', express.static(path.resolve(__dirname, '')));

// Return index.html by default when root is requested
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen for requests
const server = app.listen(app.get('port'), () => {
    const port = server.address().port;
    console.log(`Server up on http://localhost:${port}`); // eslint-disable-line no-console
});

