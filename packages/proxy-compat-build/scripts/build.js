// -- Libs -----------------------------
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const babel = require('babel-core');
const UglifyJS = require("uglify-es");
const compatPlugin = require('babel-plugin-transform-proxy-compat');
const PolyfillBuilder = require('./polyfill-builder');

// -- File source dependencies ----------
const proxyCompat = fs.readFileSync(require.resolve('proxy-compat/dist/umd/proxy-compat.js'), 'utf8');
const babelHelpers = fs.readFileSync(require.resolve('babel-helpers-lwc/dist/engine-helpers.js'), 'utf8');
const polyfillsDir = path.resolve(__dirname, '../src/polyfills');
const polyfillList = fs.readdirSync(polyfillsDir);
const downgradeSrc = fs.readFileSync(path.resolve(__dirname, '../src/downgrade.js'));
const polyfillSources = polyfillList.reduce((src, p) => src + fs.readFileSync(path.join(polyfillsDir, p), 'utf8'), '');

// -- Config -----------------------------
const compatKeys = Object.values(compatPlugin.keys);
const compatOverrides = compatKeys.reduce((str, key) => `${str} var __${key} = window.Proxy.${key};`, '');
const dest = path.join(__dirname, '../dist/umd');

const babelConfig = {
    babelrc: false,
    plugins: [[compatPlugin, { resolveProxyCompat: { global: 'window.Proxy' } }]]
};

// -- Build -----------------------------
PolyfillBuilder()
.then(ecmaPolyfills => {
    const { code : babelHelpersCompat } = babel.transform(babelHelpers, babelConfig);
    const compatArtifactsSource = polyfillSources + ecmaPolyfills + babelHelpersCompat;

    const compatSrc = [
        '/* proxy-compat */',
        proxyCompat,
        '/* Transformed Polyfills + Babel helpers */',
        compatArtifactsSource,
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
