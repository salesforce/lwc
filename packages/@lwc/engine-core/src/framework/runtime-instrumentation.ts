/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { noop } from '@lwc/shared';

export const instrumentDef = (globalThis as any).__lwc_instrument_cmp_def ?? noop;
export const instrumentInstance = (globalThis as any).__lwc_instrument_cmp_instance ?? noop;
