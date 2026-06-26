/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArrayPush } from '@lwc/shared';
import { LightningElementFormatter } from './component';

function ɩṅіţ() {
    const ḋеṿṫоөḷѕƑοṙṃаṫţеṙş = (globalThis as any).devtoolsFormatters || [];
    ArrayPush.call(ḋеṿṫоөḷѕƑοṙṃаṫţеṙş, LightningElementFormatter);
    (globalThis as any).devtoolsFormatters = ḋеṿṫоөḷѕƑοṙṃаṫţеṙş;
}

if (process.env.NODE_ENV !== 'production') {
    ɩṅіţ();
}
