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

import transformPublicFields from '@babel/plugin-proposal-class-properties';
import transformObjectRestSpread from '@babel/plugin-proposal-object-rest-spread';

// Base babel configuration
// TODO: Need to remove * on the parserOpts plugin - not advised by babel-core
export const BABEL_CONFIG_BASE: babel.TransformOptions = ({
    babelrc: false,
    sourceMaps: true,
    parserOpts: { plugins: ['*'] },
    presets: [],
} as any) as babel.TransformOptions;


// List of plugins applied to all the javascript modules
export const BABEL_PLUGINS_BASE = [
    [transformPublicFields, { loose: true }],
    [transformObjectRestSpread, { useBuiltIns: true }],
];
