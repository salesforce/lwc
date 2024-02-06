/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Instruction } from './shared';
import type { Program } from 'estree';

export function bytecodeToEsTree(_instructions: Generator<Instruction>): Program {
    return {
        type: 'Program',
        body: [],
        sourceType: 'module',
    };
}
