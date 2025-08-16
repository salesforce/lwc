/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWC_PACKAGE_EXPORTS } from '../../constants';

import validate from './validate';
import transform from './transform';

const { PRIVATE_DECORATOR } = LWC_PACKAGE_EXPORTS;

export default {
    name: PRIVATE_DECORATOR,
    validate,
    transform,
};
