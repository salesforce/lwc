/**
* IMPORTANT NOTE:
* THIS HARDCODING IS DONE TO PACK ALL THE PLUGINS AS DEPENDENCIES WHEN WE BUNDLE
* THE COMPILER USING WEBPACK (COULDN'T FIND A BETTER WAY...)
*
* USE THE FOLLOWING LINES TO UPDATE THE NEEDED PLUGINS WHEN BROWSERS UPDATE
*
* import env from 'babel-preset-env';
* import { MODES, BABEL_PLUGINS_LATEST, BABEL_PLUGINS_COMPAT } from './constants';
* env({}, BABEL_PLUGINS_COMPAT);
*
* Note:
*
* We could use a more advance filtering as showed here:
* https://github.com/babel/babel-preset-env
* But for now make it explicit
* export const PLUGINS_LATEST = {
*     debug: true,
*     targets: {
*         chrome: 58,
*         safari: 10,
*         firefox: 53,
*         edge: 15
*     },
*     modules: false,
* };
*
* export const PLUGINS_COMPAT = {
*     debug: true,
*     targets: {
*         ie: 11
*     },
*     modules: false,
* };
*/

// ES2015 support
import * as constants from 'babel-plugin-check-es2015-constants';
import * as arrowFunctions from 'babel-plugin-transform-es2015-arrow-functions';
import * as blockScoped from 'babel-plugin-transform-es2015-block-scoped-functions';
import * as blockScoping from 'babel-plugin-transform-es2015-block-scoping';
import * as esClasses from 'babel-plugin-transform-es2015-classes';
import * as computedProps from 'babel-plugin-transform-es2015-computed-properties';
import * as destructuring from 'babel-plugin-transform-es2015-destructuring';
import * as duplicatedKeys from 'babel-plugin-transform-es2015-duplicate-keys';
import * as forOf from 'babel-plugin-transform-es2015-for-of';
import * as strLiterals from 'babel-plugin-transform-es2015-literals';
import * as objSuper from 'babel-plugin-transform-es2015-object-super';
import * as parameters from 'babel-plugin-transform-es2015-parameters';
import * as shorthand from 'babel-plugin-transform-es2015-shorthand-properties';
import * as spread from 'babel-plugin-transform-es2015-spread';
import * as stickyRegex from 'babel-plugin-transform-es2015-sticky-regex';
import * as templateLiterals from 'babel-plugin-transform-es2015-template-literals';
import * as typeofSymbol from 'babel-plugin-transform-es2015-typeof-symbol';
import * as uniRegex from 'babel-plugin-transform-es2015-unicode-regex';

// Async/Await support
import * as asyncGenerator from 'babel-plugin-transform-async-to-generator';
import * as regenerator from 'babel-plugin-transform-regenerator';
import * as transformRuntime from 'babel-plugin-transform-runtime';

// ES2015+ support
import * as trailingCommas from 'babel-plugin-syntax-trailing-function-commas';
import * as expOperator from 'babel-plugin-transform-exponentiation-operator';

// Non-standard transformations
import * as objectRestSpread from 'babel-plugin-transform-object-rest-spread';
import * as publicFieldsPlugin from 'babel-plugin-transform-class-properties';

const looseOpts = {
    loose: false,
};

// Base babel configuration
export const BABEL_CONFIG_BASE = {
    babelrc: false,
    sourceMaps: true,
    parserOpts: { plugins: ['*'] },
    presets: [],
};

// List of plugins applied to all the javascript modules
export const BABEL_PLUGINS_BASE = [
    [publicFieldsPlugin, { spec: false }],
    [objectRestSpread, { useBuiltIns: true }],
];

// List of plugins for IE11 and above
export const BABEL_PLUGINS_COMPAT = [
    [expOperator, {}],
    [arrowFunctions, {}],
    [blockScoping, {}],
    [esClasses, looseOpts],
    [computedProps, looseOpts],
    [constants, {}],
    [destructuring, looseOpts],
    [duplicatedKeys, {}],
    [forOf, looseOpts],
    [strLiterals, {}],
    [objSuper, {}],
    [parameters, {}],
    [shorthand, {}],
    [spread, looseOpts],
    [stickyRegex, {}],
    [templateLiterals, looseOpts],
    [typeofSymbol, {}],
    [uniRegex, {}],
    [regenerator, {}],
    [asyncGenerator, {}],
    [trailingCommas, {}],
    [blockScoped, {}],
    [
        transformRuntime,
        {
            helpers: true,
            polyfill: false,
            moduleName: 'babel',
        },
    ],
];
