/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { Root } from 'postcss-selector-parser';
import type { StyleCompilerCtx } from '../utils/error-recovery';

export default function (root: Root, ctx: StyleCompilerCtx) {
    root.walkIds((node) => {
        ctx.withErrorRecovery(() => {
            const message = `Invalid usage of id selector '#${node.value}'. Try using a class selector or some other selector.`;
            throw root.error(message, {
                index: node.sourceIndex,
                word: node.value,
            });
        });
    });
}
