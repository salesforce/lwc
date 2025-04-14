/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { noop } from '@lwc/shared';

export const instrumentDef = (globalThis as any).__lwc_instrument_cmp_def ?? noop;
export const instrumentInstance = (globalThis as any).__lwc_instrument_cmp_instance ?? noop;

/**
 * This is a mechanism that allow for reporting of hydration issues to a telemetry backend. The
 * `__lwc_report_hydration_error` function must be defined in the global scope prior to import
 * of the LWC framework. It must accept any number of args, in the same manner that `console.log`
 * does. These args are not pre-stringified but should be stringifiable.
 */
export const reportHydrationError = (globalThis as any).__lwc_report_hydration_error ?? noop;
