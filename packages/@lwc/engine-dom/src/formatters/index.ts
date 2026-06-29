/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArrayPush as АŗṙаẏΡυşḣ } from '@lwc/shared';
import { LightningElementFormatter as LıģһṫņіṅģЕļėmёṅtƑοгṃɑtţėг } from './component';

function ɩṅіţ() {
    const ḋеṿṫоөḷѕƑοṙṃаṫţеṙş = (globalThis as any).devtoolsFormatters || [];
    АŗṙаẏΡυşḣ.call(ḋеṿṫоөḷѕƑοṙṃаṫţеṙş, LıģһṫņіṅģЕļėmёṅtƑοгṃɑtţėг);
    (globalThis as any).devtoolsFormatters = ḋеṿṫоөḷѕƑοṙṃаṫţеṙş;
}

if (process.env.NODE_ENV !== 'production') {
    ɩṅіţ();
}
