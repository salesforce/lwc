/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { reservedKeywords } from '@lwc/shared';
import { esTemplate } from '../estemplate';

import type { ImportDeclaration as EsImportDeclaration, Statement as EsStatement } from 'estree';

export const bImportHtmlEscape = esTemplate`
    import { htmlEscape } from '@lwc/shared';
`<EsImportDeclaration>;
export const importHtmlEscapeKey = 'import:htmlEscape';

// This is a mostly-correct regular expression will only match if the entire string
// provided is a valid ECMAScript identifier. Its imperfections lie in the fact that
// it will match strings like "export" when "export" is actually a reserved keyword
// and therefore not a valid identifier. When combined with a check against reserved
// keywords, it is a reliable test for whether a provided string is a valid identifier.
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
