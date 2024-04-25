/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { isStringLiteral } from './validators';

import type { ImportDeclaration, NewExpression } from 'estree';

export const bImportDeclaration = esTemplate<ImportDeclaration>`
    import ${is.identifier} from "${isStringLiteral}";
`;

export const bInstantiate = esTemplate<NewExpression>`new ${is.identifier}()`;
