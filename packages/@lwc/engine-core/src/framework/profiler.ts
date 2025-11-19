/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { noop } from '@lwc/shared';

import { getComponentTag } from '../shared/format';
import { RenderMode, ShadowMode } from './vm';
import { EmptyArray } from './utils';
import type { VM } from './vm';
import type { MutationLog } from './mutation-logger';

export const enum OperationId {
    Constructor = 0,
    Render = 1,
    Patch = 2,
    ConnectedCallback = 3,
    RenderedCallback = 4,
    DisconnectedCallback = 5,
    ErrorCallback = 6,
    GlobalRender = 7,
    GlobalRerender = 8,
    GlobalSsrHydrate = 9,
}

type GlobalOperationId =
    | OperationId.GlobalRender
    | OperationId.GlobalRerender
    | OperationId.GlobalSsrHydrate;

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

type TrackColor =
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

const operationIdNameMapping = [
    'constructor',
    'render',
    'patch',
    'connectedCallback',
    'renderedCallback',
    'disconnectedCallback',
    'errorCallback',
    'lwc-render',
    'lwc-rerender',
    'lwc-ssr-hydrate',
] as const satisfies Record<OperationId, string>;

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
    // lwc-render
    'component first rendered',
    // lwc-rerender
    'component re-rendered',
    // lwc-ssr-hydrate
    'component hydrated from server-rendered HTML',
] as const satisfies Record<OperationId, string>;

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
              color?: TrackColor;
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

function getColor(opId: OperationId): TrackColor {
    // As of Sept 2024: primary (dark blue), secondary (light blue), tertiary (green)
    switch (opId) {
        // GlobalSsrHydrate, GlobalRender, and Constructor tend to occur at the top level
        case OperationId.GlobalRender:
        case OperationId.GlobalSsrHydrate:
        case OperationId.Constructor:
            return 'primary';
        // GlobalRerender also occurs at the top level, but we want to use tertiary (green) because it's easier to
        // distinguish from primary, and at a glance you should be able to easily tell re-renders from first renders.
        case OperationId.GlobalRerender:
            return 'tertiary';
        // Everything else (patch/render/callbacks)
        default:
            return 'secondary';
    }
}

// Create a list of tag names to the properties that were mutated, to help answer the question of
// "why did this component re-render?"
function getMutationProperties(mutationLogs: MutationLog[] | undefined): [string, string][] {
    // `mutationLogs` should never have length 0, but bail out if it does for whatever reason
    if (isUndefined(mutationLogs)) {
        return EmptyArray;
    }

    if (!mutationLogs.length) {
        // Currently this only occurs for experimental signals, because those mutations are not triggered by accessors
        // TODO [#4546]: support signals in mutation logging
        return EmptyArray;
    }

    // Keep track of unique IDs per tag name so we can just report a raw count at the end, e.g.
    // `<x-foo> (x2)` to indicate that two instances of `<x-foo>` were rendered.
    const tagNamesToIdsAndProps = new Map<string, { ids: Set<number>; keys: Set<string> }>();
    for (const {
        vm: { tagName, idx },
        prop,
    } of mutationLogs) {
        let idsAndProps = tagNamesToIdsAndProps.get(tagName);
        if (isUndefined(idsAndProps)) {
            idsAndProps = { ids: new Set(), keys: new Set() };
            tagNamesToIdsAndProps.set(tagName, idsAndProps);
        }
        idsAndProps.ids.add(idx);
        idsAndProps.keys.add(prop);
    }

    // Sort by tag name
    const entries = [...tagNamesToIdsAndProps].sort((a, b) => a[0].localeCompare(b[0]));
    const tagNames = entries.map((item) => item[0]) as string[];

    // Show e.g. `<x-foo>` for one instance, or `<x-foo> (x2)` for two instances. (\u00D7 is multiplication symbol)
    const tagNamesToDisplayTagNames = new Map<string, string>();
    for (const tagName of tagNames) {
        const { ids } = tagNamesToIdsAndProps.get(tagName)!;
        const displayTagName = `<${tagName}>${ids.size > 1 ? ` (\u00D7${ids.size})` : ''}`;
        tagNamesToDisplayTagNames.set(tagName, displayTagName);
    }

    // Summary row
    const usePlural = tagNames.length > 1 || tagNamesToIdsAndProps.get(tagNames[0])!.ids.size > 1;
    const result: [string, string][] = [
        [
            `Component${usePlural ? 's' : ''}`,
            tagNames.map((_) => tagNamesToDisplayTagNames.get(_)).join(', '),
        ],
    ];

    // Detail rows
    for (const [prettyTagName, { keys }] of entries) {
        const displayTagName = tagNamesToDisplayTagNames.get(prettyTagName)!;
        result.push([displayTagName, [...keys].sort().join(', ')]);
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
            color: getColor(opId),
            tooltipText: getTooltipText(measureName, opId),
            properties: getProperties(vm),
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
            color: getColor(opId),
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
            color: getColor(opId),
            tooltipText: getTooltipText(opName, opId),
            properties: getProperties(vm),
        });
    }

    if (isProfilerEnabled) {
        currentDispatcher(opId, Phase.Stop, vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
}
