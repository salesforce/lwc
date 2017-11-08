// -- Libs -----------------------------
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const babel = require('babel-core');
const compatPlugin = require('babel-plugin-transform-raptor-compat');
const ecmaPolyfillBuilder = require('core-js-builder'); // For the polyfill list: https://github.com/zloirock/core-js
const UglifyJS = require("uglify-es");

// -- File source dependencies ----------
const proxyCompat = fs.readFileSync(require.resolve('proxy-compat/dist/umd/proxy-compat.js'), 'utf8');
const babelHelpers = fs.readFileSync(require.resolve('babel-helpers-raptor/dist/engine-helpers.js'), 'utf8');
const polyfillsDir = path.resolve(__dirname, '../src/polyfills');
const polyfillList = fs.readdirSync(polyfillsDir);
const downgradeSrc = fs.readFileSync(path.resolve(__dirname, '../src/downgrade.js'));
const polyfillSources = polyfillList.reduce((src, p) => src + fs.readFileSync(path.join(polyfillsDir, p), 'utf8'), '');

// -- Config -----------------------------
const compatKeys = Object.values(compatPlugin.keys);
const compatOverrides = compatKeys.reduce((str, key) => `${str} var __${key} = window.Proxy.${key};`, '');
const dest = path.join(__dirname, '../dist/umd');
const polyfillConfig = {
    modules: [
        'es6',
        'core.dict',
        'es7.array.includes',
        'es7.object.values',
        'es7.object.entries'
    ],
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
};

const babelConfig = {
    babelrc: false,
    plugins: [[compatPlugin, { resolveProxyCompat: { global: 'window.Proxy' } }]]
};

// -- Build -----------------------------
ecmaPolyfillBuilder(polyfillConfig)
.then(ecmaPolyfills => {
    const compatArtifactsSource = polyfillSources + ecmaPolyfills + babelHelpers;
    const { code : compatPolyfillsAndBabelHelpers } = babel.transform(compatArtifactsSource, babelConfig);

    const compatSrc = [
        '/* proxy-compat */',
        proxyCompat,
        '/* Transformed Polyfills + Babel helpers */',
        compatPolyfillsAndBabelHelpers,
        '/* proxy-compat */',
        compatOverrides
    ].join('\n');

    mkdirp.sync(dest);

    // Raw version
    fs.writeFileSync(path.join(dest, 'compat.js'), compatSrc);

    // Minify version
    const { code } = UglifyJS.minify(compatSrc);
    fs.writeFileSync(path.join(dest, 'compat.min.js'), code);

    // Downgrade script
    fs.writeFileSync(path.join(dest, 'downgrade.js'), downgradeSrc);

    const forceDowngradeSrc = [
        downgradeSrc,
        compatSrc
    ].join('\n');
    // Force compat version
    fs.writeFileSync(path.join(dest, 'compat_downgrade.js'), forceDowngradeSrc);

})
.catch(err => console.log(err));
