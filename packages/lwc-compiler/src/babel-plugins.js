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
import constants from 'babel-plugin-check-es2015-constants';
import arrowFunctions from 'babel-plugin-transform-es2015-arrow-functions';
import blockScoped from 'babel-plugin-transform-es2015-block-scoped-functions';
import blockScoping from 'babel-plugin-transform-es2015-block-scoping';
import esClasses from 'babel-plugin-transform-es2015-classes';
import computedProps from 'babel-plugin-transform-es2015-computed-properties';
import destructuring from 'babel-plugin-transform-es2015-destructuring';
import duplicatedKeys from 'babel-plugin-transform-es2015-duplicate-keys';
import forOf from 'babel-plugin-transform-es2015-for-of';
import strLiterals from 'babel-plugin-transform-es2015-literals';
import objSuper from 'babel-plugin-transform-es2015-object-super';
import parameters from 'babel-plugin-transform-es2015-parameters';
import shorthand from 'babel-plugin-transform-es2015-shorthand-properties';
import spread from 'babel-plugin-transform-es2015-spread';
import stickyRegex from 'babel-plugin-transform-es2015-sticky-regex';
import templateLiterals from 'babel-plugin-transform-es2015-template-literals';
import typeofSymbol from 'babel-plugin-transform-es2015-typeof-symbol';
import uniRegex from 'babel-plugin-transform-es2015-unicode-regex';

// Async/Await support
import asyncGenerator from 'babel-plugin-transform-async-to-generator';
import regenerator from 'babel-plugin-transform-regenerator';
import transformRuntime from 'babel-plugin-transform-runtime';

// ES2015+ support
import trailingCommas from 'babel-plugin-syntax-trailing-function-commas';
import expOperator from 'babel-plugin-transform-exponentiation-operator';

// Non-standard transformations
import objectRestSpread from 'babel-plugin-transform-object-rest-spread';
import publicFieldsPlugin from 'babel-plugin-transform-class-properties';

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
