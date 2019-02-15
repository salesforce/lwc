/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { VM, UninitializedVM } from './vm';

type MeasurementPhase =
    | 'constructor'
    | 'render'
    | 'patch'
    | 'connectedCallback'
    | 'disconnectedCallback'
    | 'renderedCallback'
    | 'errorCallback';

export enum GlobalMeasurementPhase {
    REHYDRATE = 'lwc-rehydrate',
    INIT = 'lwc-init',
    HYDRATE = 'lwc-hydrate'
}

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs
const isUserTimingSupported: boolean =
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

function getMarkName(vm: UninitializedVM, phase: MeasurementPhase | GlobalMeasurementPhase): string {
    return `<${vm.def.name} (${vm.uid})> - ${phase}`;
}

export function startMeasure(vm: UninitializedVM, phase: MeasurementPhase) {
    if (!isUserTimingSupported) {
        return;
    }

    const name = getMarkName(vm, phase);
    performance.mark(name);
}

export function endMeasure(vm: UninitializedVM, phase: MeasurementPhase) {
    if (!isUserTimingSupported) {
        return;
    }

    const name = getMarkName(vm, phase);
    performance.measure(name, name);

    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(name);
    performance.clearMeasures(name);
}

const noop = function() {};

function _startGlobalMeasure(phase: GlobalMeasurementPhase) {
    performance.mark(phase);
}

function _endGlobalMeasure(phase: GlobalMeasurementPhase) {
    performance.measure(phase, phase);
    performance.clearMarks(phase);
    performance.clearMeasures(phase);
}

function _startHydrateMeasure(vm: VM) {
    performance.mark(getMarkName(vm, GlobalMeasurementPhase.HYDRATE));
}

function _endHydrateMeasure(vm: VM) {
    const phase = GlobalMeasurementPhase.HYDRATE;
    const name = getMarkName(vm, phase);

    performance.measure(phase, name);
    performance.clearMarks(name);
    performance.clearMeasures(phase);
}

export const startGlobalMeasure = isUserTimingSupported ? _startGlobalMeasure : noop;
export const endGlobalMeasure = isUserTimingSupported ? _endGlobalMeasure : noop;

export const startHydrateMeasure = isUserTimingSupported ? _startHydrateMeasure : noop;
export const endHydrateMeasure = isUserTimingSupported ? _endHydrateMeasure : noop;
