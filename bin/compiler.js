#!/usr/bin/env node

// -- CLI run.js -------
const fs = require('fs');
const templateCompiler = require('../dist/index');

// Read the filename from the command line arguments
const fileName = process.argv[2];

// read the code from this file
fs.readFile(fileName, (err, data) => {
    if (err) throw err;

    // convert from a buffer to a string
    const src = data.toString();

    // use our plugin to transform the source
    const out = templateCompiler.compile(src, {});
    
    // Print the generated code to screen
    console.log(out.code);
});

