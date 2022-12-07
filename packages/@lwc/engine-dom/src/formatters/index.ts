/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { globalThis, ArrayPush } from '@lwc/shared';
import { LightningElementFormatter } from './component';

function init() {
    const devtoolsFormatters = globalThis.devtoolsFormatters || [];
    ArrayPush.call(devtoolsFormatters, LightningElementFormatter);
    globalThis.devtoolsFormatters = devtoolsFormatters;
}

if (process.env.NODE_ENV !== 'production') {
    init();
}
