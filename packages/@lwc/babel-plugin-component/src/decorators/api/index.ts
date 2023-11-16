/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWC_PACKAGE_EXPORTS } from '../../constants';

import validate from './validate';
import transform from './transform';

const { API_DECORATOR } = LWC_PACKAGE_EXPORTS;

export default {
    name: API_DECORATOR,
    validate,
    transform,
};
