/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';

import { esTemplateWithYield } from '../../estemplate';
import { shouldFlushTextContent } from '../shared';
import type { Statement as EsStatement} from 'estree'
import type { Comment as IrComment } from '@lwc/template-compiler';
import type { Transformer } from '../types';

const bFlushTextContent = esTemplateWithYield`
    yield flushTextContent();
`<EsStatement>

export const Comment: Transformer<IrComment> = function Comment(node, cxt) {
    if (cxt.templateOptions.preserveComments) {
        return [b.expressionStatement(b.yieldExpression(b.literal(`<!--${node.value}-->`)))];
    } else if (shouldFlushTextContent(cxt)) {
        // If preserve comments is off, we check if we should flush text content
        // for adjacent text nodes. (If preserve comments is on, then the previous
        // text node already flushed.)
        cxt.import('flushTextContent')
        return [
            bFlushTextContent()
        ];
    } else {
        return []
    }
};
