/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root } from 'postcss';

const CUSTOM_PROPERTY_IDENTIFIER = '--';

export default function validate(root: Root): void {
    root.walkDecls(decl => {
        const { prop } = decl;

        if (prop.startsWith(CUSTOM_PROPERTY_IDENTIFIER)) {
            throw decl.error(`Invalid definition of custom property "${prop}".`);
        }
    });
}
