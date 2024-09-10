/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, ArraySort, isUndefined, noop } from '@lwc/shared';

import { getComponentTag } from '../shared/format';
import { RenderMode, ShadowMode, VM } from './vm';
import { EmptyArray } from './utils';
import type { MutationLog } from './mutation-logger';

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
] as const;

const operationTooltipMapping = [
    // constructor
    'component constructor()',
    // render
    'component render() and virtual DOM rendered',
    // patch
    'component DOM rendered',
    // connectedCallback
    'component connectedCallback()',
    // renderedCallback
    'component renderedCallback()',
    // disconnectedCallback
    'component disconnectedCallback()',
    // errorCallback
    'component errorCallback()',
    // lwc-hydrate
    'component first rendered',
    // lwc-rehydrate
    'component re-rendered',
] as const;

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
    : (
          measureName: string,
          markName: string,
          devtools?: {
              color?:
                  | 'primary'
                  | 'primary-light'
                  | 'primary-dark'
                  | 'secondary'
                  | 'secondary-light'
                  | 'secondary-dark'
                  | 'tertiary'
                  | 'tertiary-light'
                  | 'tertiary-dark'
                  | 'error';
              properties?: [string, string][];
              tooltipText?: string;
          }
      ) => {
          performance.measure(measureName, {
              start: markName,
              detail: {
                  devtools: {
                      dataType: 'track-entry',
                      track: '⚡️ Lightning Web Components',
                      ...devtools,
                  },
              },
          });

          // Clear the created marks and measure to avoid filling the performance entries buffer.
          // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
          performance.clearMarks(markName);
          performance.clearMeasures(measureName);
      };

function getOperationName<T extends OperationId = OperationId>(opId: T) {
    return operationIdNameMapping[opId];
}

function getMeasureName<T extends OperationId = OperationId>(opId: T, vm: VM) {
    return `${getComponentTag(vm)} - ${getOperationName(opId)}` as const;
}

function getMarkName<T extends OperationId = OperationId>(opId: T, vm: VM) {
    // Adding the VM idx to the mark name creates a unique mark name component instance. This is necessary to produce
    // the right measures for components that are recursive.
    return `${getMeasureName(opId, vm)} - ${vm.idx}` as const;
}

function getProperties(vm: VM<any, any>): [string, string][] {
    return [
        ['Tag Name', vm.tagName],
        ['Component ID', String(vm.idx)],
        ['Render Mode', vm.renderMode === RenderMode.Light ? 'light DOM' : 'shadow DOM'],
        ['Shadow Mode', vm.shadowMode === ShadowMode.Native ? 'native' : 'synthetic'],
    ];
}

// Create a list of tag names to the properties that were mutated, to help answer the question of
// "why did this component re-render?"
function getMutationProperties(mutationLogs: MutationLog[] | undefined): [string, string][] {
    if (isUndefined(mutationLogs)) {
        return EmptyArray;
    }
    const tagNamesToKeys = new Map();
    for (const {
        vm: { tagName },
        key,
    } of mutationLogs) {
        let keys = tagNamesToKeys.get(tagName);
        if (isUndefined(keys)) {
            tagNamesToKeys.set(tagName, (keys = new Set()));
        }
        keys.add(key);
    }
    const result: [string, string][] = [];
    for (const [tagName, keys] of tagNamesToKeys.entries()) {
        result.push([`<${tagName}>`, ArrayJoin.call(ArraySort.call([...keys]), ', ')]);
    }
    return result;
}

function getTooltipText(measureName: string, opId: OperationId) {
    return `${measureName} - ${operationTooltipMapping[opId]}`;
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
        end(measureName, markName, {
            properties: getProperties(vm),
            tooltipText: getTooltipText(measureName, opId),
            color: opId === OperationId.Render ? 'primary' : 'secondary',
        });
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}

export function logGlobalOperationStart(opId: GlobalOperationId) {
    if (isMeasureEnabled) {
        const markName = getOperationName(opId);
        start(markName);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Start);
    }
}

export function logGlobalOperationStartWithVM(opId: GlobalOperationId, vm: VM) {
    if (isMeasureEnabled) {
        const markName = getMarkName(opId, vm);
        start(markName);
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Start, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}

export function logGlobalOperationEnd(
    opId: GlobalOperationId,
    mutationLogs: MutationLog[] | undefined
) {
    if (isMeasureEnabled) {
        const opName = getOperationName(opId);
        const markName = opName;
        end(opName, markName, {
            color: 'tertiary',
            tooltipText: getTooltipText(opName, opId),
            properties: getMutationProperties(mutationLogs),
        });
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop);
    }
}

export function logGlobalOperationEndWithVM(opId: GlobalOperationId, vm: VM) {
    if (isMeasureEnabled) {
        const opName = getOperationName(opId);
        const markName = getMarkName(opId, vm);
        end(opName, markName, {
            properties: getProperties(vm),
            tooltipText: getTooltipText(opName, opId),
            color: 'tertiary',
        });
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}
