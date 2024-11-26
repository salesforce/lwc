/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplateWithYield } from '../../estemplate';
import { expressionIrToEs } from '../expression';

import type { Expression as EsExpression, Statement as EsStatement } from 'estree';
import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Literal as IrLiteral,
    Text as IrText,
    Node as IrNode,
} from '@lwc/template-compiler';
import type { Transformer } from '../types';

const bYield = (expr: EsExpression) => b.expressionStatement(b.yieldExpression(expr));

const bYieldEscapedString = esTemplateWithYield`
    const ${/* temp var */ is.identifier} = ${/* string value */ is.expression};
    switch (typeof ${0}) {
        case 'string':
            yield (${/* is isolated text node? */ is.literal} && ${0} === '') ? '\\u200D' : htmlEscape(${0});
            break;
        case 'number':
        case 'boolean':
            yield String(${0});
            break;
        default:
            yield ${0} ? htmlEscape(${0}.toString()) : ${2} ? '\\u200D' : '';
    }
`<EsStatement[]>;

function isLiteral(node: IrLiteral | IrExpression | IrComplexExpression): node is IrLiteral {
    return node.type === 'Literal';
}

export const Text: Transformer<IrText> = function Text(node, cxt): EsStatement[] {
    if (isLiteral(node.value)) {
        return [bYield(b.literal(node.value.value))];
    }

    const shouldIsolate = (node?: IrNode) => {
        switch (node?.type) {
            case 'Text':
                return false;
            case 'Comment':
                return cxt.templateOptions.preserveComments;
            default:
                return true;
        }
    };

    const isIsolatedTextNode = b.literal(
        shouldIsolate(cxt.prevSibling) && shouldIsolate(cxt.nextSibling)
    );

    const valueToYield = expressionIrToEs(node.value, cxt);
    const tempVariable = b.identifier(cxt.getUniqueVar());

    cxt.import('htmlEscape');
    return bYieldEscapedString(tempVariable, valueToYield, isIsolatedTextNode);
};
