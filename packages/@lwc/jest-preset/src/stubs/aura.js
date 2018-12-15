/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const dispatchGlobalEvent = jest.fn();

const labels = jest.fn();

const executeGlobalController = jest.fn().mockImplementation(() => Promise.resolve());

const registerModule = jest.fn().mockImplementation(() => '');

const hasModule = jest.fn().mockImplementation(() => false);

const getModule = jest.fn().mockImplementation(() => {});

const sanitizeDOM = jest.fn().mockImplementation(() => '');

const createComponent = jest.fn();

const logInteraction = jest.fn();

module.exports = {
    dispatchGlobalEvent,
    labels,
    executeGlobalController,
    registerModule,
    hasModule,
    getModule,
    sanitizeDOM,
    createComponent,
    logInteraction,
};
