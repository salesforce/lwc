const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const coreJsPath = path.dirname(require.resolve('core-js'));

const distPath = path.resolve(__dirname, '..', 'dist');
const polyfillCompatName = 'polyfills.compat.js';
const polyfillNonCompatName = 'polyfills.js';

module.exports = function buildPolyfills() {
    return new Promise((resolve, reject) => {
        webpack([
            {
                entry: compatPolyfillList.map(entry => path.resolve(coreJsPath, 'modules', `${entry}.js`)),
                output: {
                    path: distPath,
                    filename: polyfillCompatName,
                },

                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            exclude: /webpack/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    plugins: [
                                        [require('babel-plugin-transform-proxy-compat'), {
                                            resolveProxyCompat: { global: 'window.Proxy' }
                                        }]
                                    ],
                                },
                            },
                        },
                    ],
                }
            },
            {
                entry: nonCompatPollyfills.map(entry => path.resolve(coreJsPath, 'modules', `${entry}.js`)),
                output: {
                    path: distPath,
                    filename: polyfillNonCompatName,
                }
            }
        ], err => {
            if (err) {
                return reject(err);
            } else {
                const pNonCompat = fs.readFileSync(path.join(distPath, polyfillNonCompatName), 'utf-8');
                const pCompat = fs.readFileSync(path.join(distPath, polyfillCompatName), 'utf-8');
                resolve(pNonCompat + pCompat);
            }
        });
    });
};

const compatPolyfillList = [
    'es6.symbol', // no-compat
    'es6.object.get-prototype-of', // we need it since spec has changed
    'es6.object.keys', // spec changed
    'es6.object.get-own-property-names', // buggy ie11
    'es6.object.freeze', // buggy IE11
    'es6.object.seal', // spec differences
    'es6.object.prevent-extensions', // spec differences
    'es6.object.is-frozen', // spec differences
    'es6.object.is-sealed', // spec differences
    'es6.object.is-extensible', // spec differences
    'es6.object.is', // not in IE11
    // 'es6.object.set-prototype-of', polyfilled in proxy-compat
    'es6.array.is-array',
    'es6.array.from',
    'es6.array.of',
    'es6.array.copy-within',
    'es6.array.fill',
    'es6.map',
    'es6.set',
    'es6.weak-map',
    'es6.weak-set',
    'es7.array.includes',
    'es7.object.get-own-property-descriptors',
    'es7.object.values',
    'es7.object.entries',
];

const nonCompatPollyfills = [

    'es6.object.define-property', // no-compat
    'es6.object.define-properties', // no-compat
    'es6.object.get-own-property-descriptor', // no-compat
    // 'es6.object.to-string',
    // 'es6.function.bind',

    'es6.function.name', // no-compat we need it for IE11
    'es6.function.has-instance', //no-compat
    'es6.number.constructor', // no-compat
    'es6.number.to-fixed', // no-compat
    // 'es6.number.to-precision',
    'es6.number.epsilon', // no-compat
    'es6.number.is-finite', // no-compat
    'es6.number.is-integer', // no-compat
    'es6.number.is-nan', // no-compat
    'es6.number.is-safe-integer', // no-compat
    'es6.number.max-safe-integer', // no-compat
    'es6.number.min-safe-integer', // no-compat
    'es6.number.parse-float', // no-compat
    'es6.number.parse-int', // no-compat

    'es6.parse-int', // no-compat
    'es6.parse-float', // no-compat

    // 'es6.math.acosh',
    // 'es6.math.asinh',
    // 'es6.math.atanh',
    // 'es6.math.cbrt',
    // 'es6.math.clz32',
    // 'es6.math.cosh',
    // 'es6.math.expm1',
    // 'es6.math.fround',
    // 'es6.math.hypot',
    // 'es6.math.imul',
    // 'es6.math.log10',
    // 'es6.math.log1p',
    // 'es6.math.log2',
    // 'es6.math.sign',
    // 'es6.math.sinh',
    // 'es6.math.tanh',
    // 'es6.math.trunc',
    'es6.string.from-code-point', // no-compat
    'es6.string.raw', // no-compat
    // 'es6.string.trim', //  Big offender when polyfilled
    'es6.string.code-point-at', // no-compat
    'es6.string.ends-with', // no-compat
    'es6.string.includes', // no-compat
    'es6.string.repeat', // no-compat
    'es6.string.starts-with', // no-compat
    'es6.string.iterator', // no-compat
    // 'es6.string.anchor',
    // 'es6.string.big',
    // 'es6.string.blink',
    // 'es6.string.bold',
    // 'es6.string.fixed',
    // 'es6.string.fontcolor',
    // 'es6.string.fontsize',
    // 'es6.string.italics',
    // 'es6.string.link',
    // 'es6.string.small',
    // 'es6.string.strike',
    // 'es6.string.sub',
    // 'es6.string.sup',
    // 'es6.array.join',
    // 'es6.array.slice',
    // 'es6.array.sort',
    // 'es6.array.for-each',
    // 'es6.array.map',
    // 'es6.array.filter',
    // 'es6.array.some',
    // 'es6.array.every',
    // 'es6.array.reduce',
    // 'es6.array.reduce-right',
    // 'es6.array.index-of',
    // 'es6.array.last-index-of',
    'es6.array.find', // no-compat
    'es6.array.find-index', // no-compat
    'es6.array.iterator', // no-compat
    'es6.array.species', // no-compat
    'es6.regexp.constructor', // no-compat
    'es6.regexp.to-string', // no-compat
    'es6.regexp.flags', // no-compat
    'es6.regexp.match', // no-compat
    'es6.regexp.replace', // no-compat
    'es6.regexp.search', // no-compat
    //'es6.regexp.split', // no-compat (BIG OFFENDER)
    'es6.promise', // no-compat

    // 'es6.reflect.apply',
    // 'es6.reflect.construct',
    // 'es6.reflect.define-property',
    // 'es6.reflect.delete-property',
    // 'es6.reflect.enumerate',
    // 'es6.reflect.get',
    // 'es6.reflect.get-own-property-descriptor',
    // 'es6.reflect.get-prototype-of',
    // 'es6.reflect.has',
    // 'es6.reflect.is-extensible',
    // 'es6.reflect.own-keys',
    // 'es6.reflect.prevent-extensions',
    // 'es6.reflect.set',
    // 'es6.reflect.set-prototype-of',

    'es6.date.now', // no-compat
    'es6.date.to-json', // no-compat
    'es6.date.to-iso-string', // no-compat
    'es6.date.to-string', // no-compat
    'es6.date.to-primitive', // no-compat

    // 'es6.typed.array-buffer',
    // 'es6.typed.data-view',
    // 'es6.typed.int8-array',
    // 'es6.typed.uint8-array',
    // 'es6.typed.uint8-clamped-array',
    // 'es6.typed.int16-array',
    // 'es6.typed.uint16-array',
    // 'es6.typed.int32-array',
    // 'es6.typed.uint32-array',
    // 'es6.typed.float32-array',
    // 'es6.typed.float64-array',

    // 'es7.array.flat-map',
    // 'es7.array.flatten',

    // 'es7.string.at',
    // 'es7.string.pad-start',
    // 'es7.string.pad-end',
    // 'es7.string.trim-left',
    // 'es7.string.trim-right',
    // 'es7.string.match-all',
    // 'es7.symbol.async-iterator',
    // 'es7.symbol.observable',
    // 'es7.object.define-getter',
    // 'es7.object.define-setter',
    // 'es7.object.lookup-getter',
    // 'es7.object.lookup-setter',

    // 'es7.map.to-json',
    // 'es7.set.to-json',
    // 'es7.map.of',
    // 'es7.set.of',
    // 'es7.weak-map.of',
    // 'es7.weak-set.of',
    // 'es7.map.from',
    // 'es7.set.from',
    // 'es7.weak-map.from',
    // 'es7.weak-set.from',

    // 'es7.global',
    // 'es7.system.global',

    // 'es7.error.is-error',

    // 'es7.math.clamp',
    // 'es7.math.deg-per-rad',
    // 'es7.math.degrees',
    // 'es7.math.fscale',
    // 'es7.math.iaddh',
    // 'es7.math.isubh',
    // 'es7.math.imulh',
    // 'es7.math.rad-per-deg',
    // 'es7.math.radians',
    // 'es7.math.scale',
    // 'es7.math.umulh',
    // 'es7.math.signbit',

    // 'es7.promise.finally',
    // 'es7.promise.try',

    // 'es7.reflect.define-metadata',
    // 'es7.reflect.delete-metadata',
    // 'es7.reflect.get-metadata',
    // 'es7.reflect.get-metadata-keys',
    // 'es7.reflect.get-own-metadata',
    // 'es7.reflect.get-own-metadata-keys',
    // 'es7.reflect.has-metadata',
    // 'es7.reflect.has-own-metadata',
    // 'es7.reflect.metadata',

    // 'es7.asap',
    // 'es7.observable',

    /* UNUSED */

    // 'web.immediate',
    // 'web.dom.iterable',
    // 'web.timers',
    // 'core.dict',
    // 'core.get-iterator-method',
    // 'core.get-iterator',
    // 'core.is-iterable',
    // 'core.delay',
    // 'core.function.part',
    // 'core.object.is-object',
    // 'core.object.classof',
    // 'core.object.define',
    // 'core.object.make',
    // 'core.number.iterator',
    // 'core.regexp.escape',
    // 'core.string.escape-html',
    // 'core.string.unescape-html',
];
