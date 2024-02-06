/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { esTemplate } from '../estemplate';

import type { ImportDeclaration as EsImportDeclaration, Statement as EsStatement } from 'estree';

export const bImportHtmlEscape = esTemplate<EsImportDeclaration>`
    import { htmlEscape } from '@lwc/shared';
`;
export const importHtmlEscapeKey = 'import:htmlEscape';

export function cleanStyleAttrVal(styleAttrVal: string): string {
    if (styleAttrVal.endsWith(';')) {
        styleAttrVal = styleAttrVal.slice(0, -1);
    }
    return styleAttrVal.trim();
}

const reservedKeywords = new Set([
    'NaN',
    'arguments',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'eval',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'static',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'undefined',
    'var',
    'void',
    'while',
    'with',
    'yield',
]);

const imperfectIdentifierMatcher = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

export const isValidIdentifier = (str: string) =>
    !reservedKeywords.has(str) && imperfectIdentifierMatcher.test(str);

export function optimizeAdjacentYieldStmts(statements: EsStatement[]): EsStatement[] {
    let prevStmt: EsStatement | null = null;
    return statements
        .map((stmt) => {
            if (
                // Check if the current statement and previous statement are
                // both yield expression statements that yield a string literal.
                prevStmt &&
                is.expressionStatement(prevStmt) &&
                is.yieldExpression(prevStmt.expression) &&
                !prevStmt.expression.delegate &&
                prevStmt.expression.argument &&
                is.literal(prevStmt.expression.argument) &&
                typeof prevStmt.expression.argument.value === 'string' &&
                is.expressionStatement(stmt) &&
                is.yieldExpression(stmt.expression) &&
                !stmt.expression.delegate &&
                stmt.expression.argument &&
                is.literal(stmt.expression.argument) &&
                typeof stmt.expression.argument.value === 'string'
            ) {
                prevStmt.expression.argument.value += stmt.expression.argument.value;
                return null;
            }
            prevStmt = stmt;
            return stmt;
        })
        .filter((el): el is NonNullable<EsStatement> => el !== null);
}
