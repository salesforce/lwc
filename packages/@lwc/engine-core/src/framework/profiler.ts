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
    Constructor = 0,
    Render = 1,
    Patch = 2,
    ConnectedCallback = 3,
    RenderedCallback = 4,
    DisconnectedCallback = 5,
    ErrorCallback = 6,
    GlobalHydrate = 7,
    GlobalRehydrate = 8,
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

const startMeasure = !isUserTimingSupported
    ? noop
    : function (phase: MeasurementPhase, vm: VM) {
          const markName = getMarkName(phase, vm);
          start(markName);
      };
const endMeasure = !isUserTimingSupported
    ? noop
    : function (phase: MeasurementPhase, vm: VM) {
          const markName = getMarkName(phase, vm);
          const measureName = getMeasureName(phase, vm);
          end(measureName, markName);
      };

const startGlobalMeasure = !isUserTimingSupported
    ? noop
    : function (phase: GlobalMeasurementPhase, vm?: VM) {
          const markName = isUndefined(vm) ? phase : getMarkName(phase, vm);
          start(markName);
      };
const endGlobalMeasure = !isUserTimingSupported
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

const logMarks = process.env.NODE_ENV !== 'production';
let bufferLogging = false;

function opIdForGlobalMeasurementPhase(phase: GlobalMeasurementPhase) {
    return phase === GlobalMeasurementPhase.HYDRATE
        ? OperationId.GlobalHydrate
        : OperationId.GlobalRehydrate;
}

export const profilerControl = {
    enableProfiler() {
        bufferLogging = true;
    },
    disableProfiler() {
        bufferLogging = false;
    },
    attachDispatcher(dispatcher: LogDispatcher) {
        logOperation = dispatcher;
        this.enableProfiler();
    },
    detachDispatcher(): LogDispatcher {
        const currentLogOperation = logOperation;
        logOperation = noop;
        this.disableProfiler();
        return currentLogOperation;
    },
};

export function logOperationStart(opId: OperationId, vm: VM) {
    if (logMarks) {
        startMeasure(opIdToMeasurementPhaseMappingArray[opId], vm);
    }
    if (bufferLogging) {
        logOperation(opId, Phase.Start, vm.tagName, vm.idx);
    }
}

export function logOperationEnd(opId: OperationId, vm: VM) {
    if (logMarks) {
        endMeasure(opIdToMeasurementPhaseMappingArray[opId], vm);
    }
    if (bufferLogging) {
        logOperation(opId, Phase.Stop, vm.tagName, vm.idx);
    }
}

export function logGlobalOperationStart(phase: GlobalMeasurementPhase, vm?: VM) {
    if (logMarks) {
        startGlobalMeasure(phase, vm);
    }
    if (bufferLogging) {
        logOperation(opIdForGlobalMeasurementPhase(phase), Phase.Start, vm?.tagName, vm?.idx);
    }
}

export function logGlobalOperationEnd(phase: GlobalMeasurementPhase, vm?: VM) {
    if (logMarks) {
        endGlobalMeasure(phase, vm);
    }
    if (bufferLogging) {
        logOperation(opIdForGlobalMeasurementPhase(phase), Phase.Stop, vm?.tagName, vm?.idx);
    }
}
