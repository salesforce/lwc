/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';

import type { Comment as IrComment } from '@lwc/template-compiler';
import type { Transformer } from '../types';

export const Comment: Transformer<IrComment> = function Comment(node, cxt) {
    if (cxt.templateOptions.preserveComments) {
        return [b.expressionStatement(b.yieldExpression(b.literal(`<!--${node.value}-->`)))];
    } else {
        return [];
    }
};
