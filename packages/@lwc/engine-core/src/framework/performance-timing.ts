/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

import { VM } from './vm';
import { getComponentTag } from '../shared/format';

export type MeasurementPhase =
    | 'constructor'
    | 'render'
    | 'patch'
    | 'connectedCallback'
    | 'disconnectedCallback'
    | 'renderedCallback'
    | 'errorCallback';

export const enum GlobalMeasurementPhase {
    REHYDRATE = 'lwc-rehydrate',
    HYDRATE = 'lwc-hydrate',
}

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs.
const isUserTimingSupported: boolean =
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

function getMarkName(phase: string, vm: VM): string {
    // Adding the VM idx to the mark name creates a unique mark name component instance. This is necessary to produce
    // the right measures for components that are recursive.
    return `${getComponentTag(vm)} - ${phase} - ${vm.idx}`;
}

function getMeasureName(phase: string, vm: VM): string {
    return `${getComponentTag(vm)} - ${phase}`;
}

function start(markName: string) {
    performance.mark(markName);
}

function end(measureName: string, markName: string) {
    performance.measure(measureName, markName);

    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(markName);
    performance.clearMeasures(measureName);
}

function noop() {
    /* do nothing */
}

export const startMeasure = !isUserTimingSupported
    ? noop
    : function (phase: MeasurementPhase, vm: VM) {
          const markName = getMarkName(phase, vm);
          start(markName);
      };
export const endMeasure = !isUserTimingSupported
    ? noop
    : function (phase: MeasurementPhase, vm: VM) {
          const markName = getMarkName(phase, vm);
          const measureName = getMeasureName(phase, vm);
          end(measureName, markName);
      };

export const startGlobalMeasure = !isUserTimingSupported
    ? noop
    : function (phase: GlobalMeasurementPhase, vm?: VM) {
          const markName = isUndefined(vm) ? phase : getMarkName(phase, vm);
          start(markName);
      };
export const endGlobalMeasure = !isUserTimingSupported
    ? noop
    : function (phase: GlobalMeasurementPhase, vm?: VM) {
          const markName = isUndefined(vm) ? phase : getMarkName(phase, vm);
          end(phase, markName);
      };
