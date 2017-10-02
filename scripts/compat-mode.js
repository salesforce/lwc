/*
* NOTE: This script needs to run after all other
* compat artifacts (proxy-compat, babel-helpers) have been built.
*
* HOW COMPAT WORKS:
*
*/

const fs = require('fs');
const path = require('path');

// This is an intrisic dependency coming from webpack-closure-compiler
const closureCompile = require('google-closure-compiler-js').compile;

const babel = require('babel-core');
const compatPlugin = require(path.join(__dirname, '../packages/babel-plugin-transform-raptor-compat/src'));
const proxyCompatNoop = fs.readFileSync(path.join(__dirname, '../packages/proxy-compat/dist/proxy-compat-noop.js'), 'utf8');
const proxyCompat = fs.readFileSync(path.join(__dirname, '../packages/proxy-compat/dist/proxy-compat.js'), 'utf8');
const babelHelpers = fs.readFileSync(path.join(__dirname, '../packages/babel-helpers-raptor/dist/compat-helpers.js'), 'utf8');

const compatKeys = Object.values(require(path.join(__dirname, '../packages/babel-plugin-transform-raptor-compat/src/keys.js')));
const compatOverrides = compatKeys.reduce((str, key) => `${str} var __${key} = window.Proxy.${key};`, '');

const dest = path.join(__dirname, '../dist/compat.js');
const destMin = path.join(__dirname, '../dist/compat.min.js');

console.log('[COMPAT] - Bundling compat files...');

// For the polyfill list: https://github.com/zloirock/core-js
require('core-js-builder')({
    modules: ['es6', 'core.dict'],
    blacklist: [
        'es6.reflect',
        'es6.math',
        'es6.array.slice',
        'es6.array.join',
        'es6.array.forEach',
        'es6.string.anchor',
        'es6.string.big',
        'es6.string.blink',
        'es6.string.bold',
        'es6.string.fixed',
        'es6.string.fontcolor',
        'es6.string.fontsize',
        'es6.string.italics',
        'es6.string.link',
        'es6.string.small',
        'es6.string.strike',
        'es6.string.sub',
        'es6.string.sup',
    ],
    library: false, // flag for build without global namespace pollution, by default - false
    umd: false      // use UMD wrapper for export `core` object, by default - true
})
.then(rawPolyfills => {

    const { code : compatPolyfillsAndBabelHelpers } = babel.transform(rawPolyfills + babelHelpers, {
        babelrc: false,
        plugins: [[compatPlugin, {
            resolveProxyCompat: {
                global: 'window.Proxy'
            }
        }]]
    });

    const code = [
        '/* proxy-compat-noop */',
        proxyCompatNoop,
        '/* Compat Polyfills + Babel helpers */',
        compatPolyfillsAndBabelHelpers,
        '/* proxy-compat */',
        proxyCompat,
        '/* Overrides for proxy-compat globals */',
        compatOverrides
    ].join('\n');

    // Raw version
    fs.writeFileSync(dest, code);

    // Minify version
    console.log('[COMPAT] - Generating minified version...');
    const { compiledCode } = closureCompile({ jsCode: [{ src: code }], languageIn: 'ES5', languageOut: 'ES5' });
    fs.writeFileSync(destMin, compiledCode);

    //console.log('Polyfills for compat mode generated!');
})
.catch(err => console.log(err));
