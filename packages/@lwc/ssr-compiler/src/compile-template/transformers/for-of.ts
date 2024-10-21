/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { irToEs } from './ir-to-es';
import { optimizeAdjacentYieldStmts } from './shared';

import type { ForOf as IrForOf } from '@lwc/template-compiler';
import type {
    Expression as EsExpression,
    ForOfStatement as EsForOfStatement,
    Identifier as EsIdentifier,
    MemberExpression as EsMemberExpression,
    ImportDeclaration as EsImportDeclaration,
} from 'estree';
import type { Transformer } from './types';

function getRootMemberExpression(node: EsMemberExpression): EsMemberExpression {
    return node.object.type === 'MemberExpression' ? getRootMemberExpression(node.object) : node;
}

function getRootIdentifier(node: EsMemberExpression): EsIdentifier | null {
    const rootMemberExpression = getRootMemberExpression(node);
    return is.identifier(rootMemberExpression?.object) ? rootMemberExpression.object : null;
}

const bForOfYieldFrom = esTemplate`
    for (let ${is.identifier} of toIteratorDirective(${is.expression} ?? [])) {
        ${is.statement};
    }
`<EsForOfStatement>;

const bToIteratorDirectiveImport = esTemplate`
    import { toIteratorDirective } from '@lwc/ssr-runtime';
`<EsImportDeclaration>;

export const ForOf: Transformer<IrForOf> = function ForEach(node, cxt): EsForOfStatement[] {
    const id = node.iterator.name;
    cxt.pushLocalVars([id]);
    const forEachStatements = node.children.flatMap((childNode) => {
        return irToEs(childNode, cxt);
    });
    cxt.popLocalVars();

    const expression = node.expression as EsExpression;
    const scopeReferencedId = is.memberExpression(expression)
        ? getRootIdentifier(expression)
        : null;
    const iterable = cxt.isLocalVar(scopeReferencedId?.name)
        ? (node.expression as EsExpression)
        : b.memberExpression(b.identifier('instance'), node.expression as EsExpression);

    cxt.hoist(bToIteratorDirectiveImport(), 'toIteratorDirective');

    return [
        bForOfYieldFrom(b.identifier(id), iterable, optimizeAdjacentYieldStmts(forEachStatements)),
    ];
};
