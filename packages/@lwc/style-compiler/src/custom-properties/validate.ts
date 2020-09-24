/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Declaration } from 'postcss';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(decl: Declaration): void {
    const { prop } = decl;

    if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
        throw decl.error(`Invalid definition of custom property "${prop}".`);
    }
}
