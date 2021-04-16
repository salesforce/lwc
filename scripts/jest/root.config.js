/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/** @type {import("@jest/types").Config.InitialOptions } */
module.exports = {
    rootDir: '../..',
    testMatch: ['<rootDir>/**/__tests__/*.spec.(js|ts)'],
    projects: ['<rootDir>/packages/@lwc/*'],
};
