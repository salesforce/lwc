/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// https://262.ecma-international.org/12.0/#sec-keywords-and-reserved-words
// prettier-ignore
const REVERSED_KEYWORDS = new Set([
    // Reserved keywords
    'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 
    'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 
    'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 
    'typeof', 'var', 'void', 'while', 'with', 'yield',

    // Strict mode only reserved keywords
    'let', 'static', 'implements', 'interface', 'package', 'private', 'protected', 'public'
]);

export function isReservedES6Keyword(str: string): boolean {
    return REVERSED_KEYWORDS.has(str);
}
