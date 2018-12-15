/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const perfStart = jest.fn().mockImplementation(() => '');

const perfEnd = jest.fn();

const mark = jest.fn().mockImplementation(() => {});

const markStart = jest.fn().mockImplementation(() => {});

const markEnd = jest.fn().mockImplementation(() => {});

const time = jest.fn().mockImplementation(() => 0);

const interaction = jest.fn();

module.exports = {
    perfStart,
    perfEnd,
    mark,
    markStart,
    markEnd,
    time,
    interaction,
};
