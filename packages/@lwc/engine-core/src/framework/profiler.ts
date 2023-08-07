/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, noop } from '@lwc/shared';

import { getComponentTag } from '../shared/format';
import { RenderMode, ShadowMode, VM } from './vm';

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

type GlobalOperationId = OperationId.GlobalHydrate | OperationId.GlobalRehydrate;

const enum Phase {
    Start = 0,
    Stop = 1,
}

type LogDispatcher = (
    opId: OperationId,
    phase: Phase,
    cmpName?: string,
    vmIndex?: number,
    renderMode?: RenderMode,
    shadowMode?: ShadowMode
) => void;

const operationIdNameMapping = [
    'constructor',
    'render',
    'patch',
    'connectedCallback',
    'renderedCallback',
    'disconnectedCallback',
    'errorCallback',
    'lwc-hydrate',
    'lwc-rehydrate',
];

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs.
const isUserTimingSupported: boolean =
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

const start = !isUserTimingSupported
    ? noop
    : (markName: string) => {
          performance.mark(markName);
      };

const end = !isUserTimingSupported
    ? noop
    : (measureName: string, markName: string) => {
          performance.measure(measureName, markName);

          // Clear the created marks and measure to avoid filling the performance entries buffer.
          // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
          performance.clearMarks(markName);
          performance.clearMeasures(measureName);
      };

function getOperationName(opId: OperationId): string {
    return operationIdNameMapping[opId];
}

function getMeasureName(opId: OperationId, vm: VM): string {
    return `${getComponentTag(vm)} - ${getOperationName(opId)}`;
}

function getMarkName(opId: OperationId, vm: VM): string {
    // Adding the VM idx to the mark name creates a unique mark name component instance. This is necessary to produce
    // the right measures for components that are recursive.
    return `${getMeasureName(opId, vm)} - ${vm.idx}`;
}

/** Indicates if operations should be logged via the User Timing API. */
const isMeasureEnabled = process.env.NODE_ENV !== 'production';

/** Indicates if operations should be logged by the profiler. */
let isProfilerEnabled = false;

/** The currently assigned profiler dispatcher. */
let currentDispatcher: LogDispatcher = noop;

export const profilerControl = {
    enableProfiler() {
        isProfilerEnabled = true;
    },
    disableProfiler() {
        isProfilerEnabled = false;
    },
    attachDispatcher(dispatcher: LogDispatcher) {
        currentDispatcher = dispatcher;

        this.enableProfiler();
    },
    detachDispatcher(): LogDispatcher {
        const dispatcher = currentDispatcher;
        currentDispatcher = noop;

        this.disableProfiler();

        return dispatcher;
    },
};

export function logOperationStart(opId: OperationId, vm: VM) {
    if (isMeasureEnabled) {
        const markName = getMarkName(opId, vm);
        start(markName);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Start, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}

export function logOperationEnd(opId: OperationId, vm: VM) {
    if (isMeasureEnabled) {
        const markName = getMarkName(opId, vm);
        const measureName = getMeasureName(opId, vm);
        end(measureName, markName);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}

export function logGlobalOperationStart(opId: GlobalOperationId, vm?: VM) {
    if (isMeasureEnabled) {
        const opName = getOperationName(opId);
        const markName = isUndefined(vm) ? opName : getMarkName(opId, vm);
        start(markName);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Start, vm?.tagName, vm?.idx, vm?.renderMode, vm?.shadowMode);
    }
}

export function logGlobalOperationEnd(opId: GlobalOperationId, vm?: VM) {
    if (isMeasureEnabled) {
        const opName = getOperationName(opId);
        const markName = isUndefined(vm) ? opName : getMarkName(opId, vm);
        end(opName, markName);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm?.tagName, vm?.idx, vm?.renderMode, vm?.shadowMode);
    }
}
