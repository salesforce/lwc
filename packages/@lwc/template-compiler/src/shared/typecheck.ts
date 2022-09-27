/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ElementDirective, ElementDirectiveName } from './types';

// The whole point of this function is just to confirm via typechecking that all element directives are accounted for in
// our enums, and the names are consistent. The function is intentionally unused.
export function typecheckElementDirective(directive: ElementDirective) {
    return ElementDirectiveName[directive.name];
}
