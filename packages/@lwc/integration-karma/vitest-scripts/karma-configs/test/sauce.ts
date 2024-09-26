/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

import { STANDARD_SAUCE_BROWSERS, LEGACY_SAUCE_BROWSERS } from '../shared/browsers.js';
import utils from '../utils';
const { getSauceConfig } = utils;
import options from '../../shared/options';
const { LEGACY_BROWSERS } = options;

import localConfig from './base.js';

const SAUCE_BROWSERS = [...(LEGACY_BROWSERS ? LEGACY_SAUCE_BROWSERS : STANDARD_SAUCE_BROWSERS)];

export default (config: { set?: any; reporters: any; plugins: any }) => {
    localConfig(config);

    if (SAUCE_BROWSERS.length === 0) {
        throw new Error('No matching browser found for the passed configuration.');
    }

    const sauceConfig = getSauceConfig(config, {
        suiteName: 'integration-karma',
        browsers: SAUCE_BROWSERS,
    });

    config.set(sauceConfig);
};
