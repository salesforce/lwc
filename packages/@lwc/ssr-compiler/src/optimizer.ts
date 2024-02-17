/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Instruction } from './shared';

export function* optimize(instructions: Generator<Instruction>): Generator<Instruction> {
    yield* instructions;
}
