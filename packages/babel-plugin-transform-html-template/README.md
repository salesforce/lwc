# Babel plugin for Raptor templates
Converts a raptor template in javascript

_**Note:** This is still a **work in progress**, the syntax and semantcs are likely to change ._

## Installation
`npm install`

_**Note:** It is also recommended to have node_modules binary folder as part of your `PATH`:_

`export PATH="./node_modules/.bin:$PATH"`

## Usage example
After building you can just run a template example by running:

`./bin/cli.js test/fixtures/template/actual.html`

## Syntax

The most important invariant for the syntax is that it has to respect the HTML spec, everything else should be syntactic sugar. 
In order to be parseable by babel (since they don't yet allow grammar customization), 
for now the syntax has to be a subset of the [JSX Grammar](https://facebook.github.io/jsx/)


### Transformations

WIP... 
