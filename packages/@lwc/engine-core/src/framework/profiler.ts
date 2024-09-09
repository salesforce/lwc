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

function getMarkName(opId: OperationId, vm?: VM): string {
    const opName = operationIdNameMapping[opId];

    if (isUndefined(vm)) {
        return opName;
    }

    const measureName = `${getComponentTag(vm)} - ${opName}`;

    // Adding the VM idx to the mark name creates a unique mark name component instance. This is necessary to produce
    // the right measures for components that are recursive.
    return `${measureName} - ${vm.idx}`;
}

const recordMark = !isUserTimingSupported
    ? noop
    : (opId: OperationId, vm?: VM) => {
          const name = getMarkName(opId, vm);
          performance.mark(`${name}_start`);
      };

const endMark = !isUserTimingSupported
    ? noop
    : (opId: OperationId, vm?: VM) => {
          const name = getMarkName(opId, vm);
          const start = `${name}_start`;
          const end = `${name}_end`;

          if (performance.getEntriesByName(start).length > 0) {
              performance.mark(end);

              performance.measure(name, {
                  start,
                  end,
                  detail: {
                      devtools: {
                          dataType: 'track-entry',
                          color: opId === OperationId.Render ? 'primary' : 'tertiary',
                          track: '⚡️ Lightning Web Components',
                          properties: vm ? [['tagName', vm.tagName]] : [],
                      },
                  },
              });

              // Clear the created marks and measure to avoid filling the performance entries buffer.
              // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
              performance.clearMarks(start);
              performance.clearMarks(end);
              performance.clearMeasures(name);
          }
      };

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
        recordMark(opId, vm);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Start, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}

export function logOperationEnd(opId: OperationId, vm: VM) {
    if (isMeasureEnabled) {
        endMark(opId, vm);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}

export function logGlobalOperationStart(opId: GlobalOperationId, vm?: VM) {
    if (isMeasureEnabled) {
        recordMark(opId, vm);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Start, vm?.tagName, vm?.idx, vm?.renderMode, vm?.shadowMode);
    }
}

export function logGlobalOperationEnd(opId: GlobalOperationId, vm?: VM) {
    if (isMeasureEnabled) {
        endMark(opId, vm);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm?.tagName, vm?.idx, vm?.renderMode, vm?.shadowMode);
    }
}
