/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, noop } from '@lwc/shared';
import { VM } from './vm';
import { getComponentTag } from '../shared/format';

type MeasurementPhase =
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

export const enum OperationId {
    constructor = 0,
    render = 1,
    patch = 2,
    connectedCallback = 3,
    renderedCallback = 4,
    disconnectedCallback = 5,
    errorCallback = 6,
    globalHydrate = 7,
    globalRehydrate = 8,
}

const enum Phase {
    Start = 0,
    Stop = 1,
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

type LogDispatcher = (opId: OperationId, phase: Phase, cmpName?: string, vmIndex?: number) => void;

let logOperation: LogDispatcher = noop;

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

const opIdToMeasurementPhaseMappingArray: MeasurementPhase[] = [
    'constructor',
    'render',
    'patch',
    'connectedCallback',
    'renderedCallback',
    'disconnectedCallback',
    'errorCallback',
];

let profilerEnabled = false;
let logMarks = false;
let bufferLogging = false;

if (process.env.NODE_ENV !== 'production') {
    profilerEnabled = true;
    logMarks = true;
    bufferLogging = false;
}

const profilerStateCallbacks: ((arg0: boolean) => void)[] = [];

function trackProfilerState(callback: (arg0: boolean) => void) {
    callback(profilerEnabled);
    profilerStateCallbacks.push(callback);
}

function logOperationStart(opId: OperationId, vm: VM) {
    if (logMarks) {
        startMeasure(opIdToMeasurementPhaseMappingArray[opId], vm);
    }
    if (bufferLogging) {
        logOperation(opId, Phase.Start, vm.tagName, vm.idx);
    }
}

function logOperationEnd(opId: OperationId, vm: VM) {
    if (logMarks) {
        endMeasure(opIdToMeasurementPhaseMappingArray[opId], vm);
    }
    if (bufferLogging) {
        logOperation(opId, Phase.Stop, vm.tagName, vm.idx);
    }
}

function enableProfiler() {
    profilerEnabled = true;
    bufferLogging = true;
    notifyProfilerStateChange();
}

function disableProfiler() {
    if (process.env.NODE_ENV !== 'production') {
        // in non-prod mode we want to keep logging marks
        profilerEnabled = true;
        logMarks = true;
        bufferLogging = false;
    } else {
        profilerEnabled = false;
        bufferLogging = false;
        logMarks = false;
    }
    notifyProfilerStateChange();
}

function notifyProfilerStateChange() {
    for (let i = 0; i < profilerStateCallbacks.length; i++) {
        profilerStateCallbacks[i](profilerEnabled);
    }
}

function attachDispatcher(dispatcher: LogDispatcher) {
    logOperation = dispatcher;
    bufferLogging = true;
}

function detachDispatcher() {
    const currentLogOperation = logOperation;
    logOperation = noop;
    bufferLogging = false;
    return currentLogOperation;
}

const profilerControl = {
    enableProfiler,
    disableProfiler,
    attachDispatcher,
    detachDispatcher,
};

function opIdForGlobalMeasurementPhase(phase: GlobalMeasurementPhase) {
    return phase === GlobalMeasurementPhase.HYDRATE
        ? OperationId.globalHydrate
        : OperationId.globalRehydrate;
}

function logGlobalOperationStart(phase: GlobalMeasurementPhase, vm?: VM) {
    if (logMarks) {
        startGlobalMeasure(phase, vm);
    }
    if (bufferLogging) {
        logOperation(opIdForGlobalMeasurementPhase(phase), Phase.Start, vm?.tagName, vm?.idx);
    }
}

function logGlobalOperationEnd(phase: GlobalMeasurementPhase, vm?: VM) {
    if (logMarks) {
        endGlobalMeasure(phase, vm);
    }
    if (bufferLogging) {
        logOperation(opIdForGlobalMeasurementPhase(phase), Phase.Stop, vm?.tagName, vm?.idx);
    }
}

export {
    logOperationStart,
    logOperationEnd,
    trackProfilerState,
    profilerControl,
    logGlobalOperationStart,
    logGlobalOperationEnd,
};
