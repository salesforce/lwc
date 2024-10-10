/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

import { STANDARD_SAUCE_BROWSERS } from '../shared/browsers';
import utils from '../utils';
const { getSauceConfig } = utils;
import localConfig from './base';

const TAGS = ['hydration'];
const SUITE_NAME = 'integration-karma-hydration';

const SAUCE_BROWSERS = [...STANDARD_SAUCE_BROWSERS];

export default (config: { set?: any; reporters: any; plugins: any }) => {
    localConfig(config);

    const sauceConfig = getSauceConfig(config, {
        suiteName: SUITE_NAME,
        tags: TAGS,
        customData: {
            lwc: {
                HYDRATION: 1,
            },
        },
        browsers: SAUCE_BROWSERS,
    });

    config.set(sauceConfig);
};
