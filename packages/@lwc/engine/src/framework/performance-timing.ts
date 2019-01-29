/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { VM, UninitializedVM } from './vm';
import { Noop } from './utils';

import { tagNameGetter } from "../env/element";
import { StringToLowerCase } from "../shared/language";

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
    HYDRATE = 'lwc-hydrate'
}

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs.
const isUserTimingSupported: boolean =
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

function getMarkName(vm: VM | UninitializedVM, phase: MeasurementPhase): string {
    return `<${StringToLowerCase.call(tagNameGetter.call(vm.elm))} (${vm.uid})> - ${phase}`;
}

function mark(name: string) {
    performance.mark(name);
}

function measure(name: string) {
    performance.measure(name, name);

    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(name);
    performance.clearMeasures(name);
}

export const startMeasure = !isUserTimingSupported ? Noop : function(vm: VM | UninitializedVM, phase: MeasurementPhase) {
    const name = getMarkName(vm, phase);
    mark(name);
};
export const endMeasure = !isUserTimingSupported ? Noop : function(vm: VM | UninitializedVM, phase: MeasurementPhase) {
    const name = getMarkName(vm, phase);
    measure(name);
};

export const startGlobalMeasure = !isUserTimingSupported ? Noop : function(phase: GlobalMeasurementPhase) {
    mark(phase);
};
export const endGlobalMeasure = !isUserTimingSupported ? Noop : function(phase: GlobalMeasurementPhase) {
    measure(phase);
};
