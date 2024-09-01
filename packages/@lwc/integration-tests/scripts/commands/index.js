/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const activeElement = require('./active-element');
const activeElementShadow = require('./active-element-shadow');
const activeElementShadowDeep = require('./active-element-shadow-deep');
const focus = require('./focus');
const shadowDeep$ = require('./shadow-deep-selector');

const CUSTOM_COMMANDS = [
    activeElement,
    activeElementShadow,
    activeElementShadowDeep,
    focus,
    shadowDeep$,
];

function registerCustomCommands(browser) {
    for (const registerCommand of CUSTOM_COMMANDS) {
        registerCommand(browser);
    }
}

module.exports = {
    registerCustomCommands,
};
