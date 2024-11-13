/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { builders as b, is } from 'estree-toolkit';
import { isUndefined } from '@lwc/shared';
import { Transformer } from '../types';
import { expressionIrToEs } from '../expression';
import { esTemplate, esTemplateWithYield } from '../../estemplate';
import { bImportDeclaration } from '../../estree/builders';
import { getChildAttrsOrProps } from '../shared';
import type {
    LwcComponent as IrLwcComponent,
    Expression as IrExpression,
} from '@lwc/template-compiler';
import type { BlockStatement as EsBlockStatement, Expression, Statement } from 'estree';

const bYieldFromDynamicComponentConstructorGenerator = esTemplateWithYield`
    {
        const childProps = __cloneAndDeepFreeze(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        yield* ${/*component ctor*/ is.expression}[SYMBOL__GENERATE_MARKUP](null, childProps, childAttrs);
    }
`<EsBlockStatement>;

const bThrowErrorForInvalidConstructor = esTemplate`
    {
        throw new Error(\`Invalid constructor \${String(${/*component ctor*/ is.expression})} is not a LightningElement constructor.\`)
    }
`<EsBlockStatement>;

function bIfLwcIsExpressionDefined(lwcIsExpression: Expression, consequent: Statement) {
    // instance.lwcIsValue !== undefined && instance.lwcIsValue !== null
    const lwcIsExpressionDefined = b.logicalExpression(
        '&&',
        b.binaryExpression('!==', lwcIsExpression, b.identifier('undefined')),
        b.binaryExpression('!==', lwcIsExpression, b.identifier('null'))
    );

    return b.ifStatement(lwcIsExpressionDefined, b.blockStatement([consequent]));
}

function bifLwcIsExpressionTypeCorrect(
    lwcIsExpression: Expression,
    consequent: Statement,
    alternate: Statement
) {
    // typeof instance.lwcIsValue === 'function'
    const typeComparison = b.binaryExpression(
        '===',
        b.unaryExpression('typeof', lwcIsExpression),
        b.literal('function')
    );

    // instance.lwcIsValue.prototype instanceof LightningElement
    const protoComparison = b.binaryExpression(
        'instanceof',
        b.memberExpression(lwcIsExpression, b.identifier('prototype')),
        b.identifier('LightningElement')
    );

    const comparison = b.logicalExpression('&&', typeComparison, protoComparison);

    return b.ifStatement(comparison, consequent, alternate);
}

// jtu-todo: add a comment for the default tag name to explain why it's there
export const LwcComponent: Transformer<IrLwcComponent> = function LwcComponent(node, cxt) {
    const { directives } = node;

    const lwcIs = directives.find((directive) => directive.name === 'Is');
    if (!isUndefined(lwcIs)) {
        cxt.hoist(bImportDeclaration(['LightningElement']), 'import:LightningElement');
        cxt.hoist(
            bImportDeclaration(['SYMBOL__GENERATE_MARKUP']),
            'import:SYMBOL__GENERATE_MARKUP'
        );
        cxt.hoist(
            bImportDeclaration([{ cloneAndDeepFreeze: '__cloneAndDeepFreeze' }]),
            'import:cloneAndDeepFreeze'
        );

        // The template compiler has validation to prevent lwcIs.value from being a literal
        const lwcIsExpression = expressionIrToEs(lwcIs.value as IrExpression, cxt);
        return [
            bIfLwcIsExpressionDefined(
                lwcIsExpression,
                bifLwcIsExpressionTypeCorrect(
                    lwcIsExpression,
                    bYieldFromDynamicComponentConstructorGenerator(
                        getChildAttrsOrProps(node.properties, cxt),
                        getChildAttrsOrProps(node.attributes, cxt),
                        lwcIsExpression
                    ),
                    bThrowErrorForInvalidConstructor(lwcIsExpression)
                )
            ),
        ];
    } else {
        return [];
    }
};
