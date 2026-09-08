/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * LWC operation profiler primitives. The `lwc` facade's __unstable__ProfilerControl
 * toggles `enabled` and registers a `dispatcher`; the runtime calls
 * logOperationStart/Stop around lifecycle operations. Kept in its own module so
 * both the facade (compat/index) and the runtime (lightning-element) can use it
 * without a circular import.
 */

export const OperationId = {
    Constructor: 0,
    Render: 1,
    Patch: 2,
    ConnectedCallback: 3,
    RenderedCallback: 4,
    DisconnectedCallback: 5,
    ErrorCallback: 6,
    GlobalRender: 7,
    GlobalRerender: 8,
    GlobalHydrate: 9,
} as const;

const Phase = { Start: 0, Stop: 1 } as const;

// --- User Timing (performance.mark/measure) ----------------------------------
// In dev mode LWC emits User Timing entries for each operation INDEPENDENTLY of
// whether a profiler dispatcher is attached (engine-core gates this on
// `isMeasureEnabled`, which is on whenever NODE_ENV !== 'production'). The
// devtools "⚡️ Lightning Web Components" track + the perf-timing integration
// tests rely on these marks/measures existing. Mirror that here.
const operationName = [
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
] as const;

const isMeasureEnabled =
    process.env.NODE_ENV !== 'production' &&
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

/** `<x-foo> - render` — the measure label. Global ops (lwc-render/rerender) use the bare op name. */
function measureName(opId: number, name: string | undefined): string {
    const op = operationName[opId] ?? String(opId);
    // Global operations (GlobalRender/GlobalRerender/GlobalHydrate) have no
    // component tag — their label is just the operation name (e.g. `lwc-render`).
    if (opId >= OperationId.GlobalRender) return op;
    const tag = name ? name.toLowerCase() : 'unknown';
    return `<${tag}> - ${op}`;
}

/** Unique mark name (measure name + instance id) so recursive components don't collide. */
function markName(opId: number, name: string | undefined, id: number | undefined): string {
    if (opId >= OperationId.GlobalRender) {
        // A PER-INSTANCE global span (a component mount's GlobalRender, passed a tag
        // name + instance idx) needs a UNIQUE mark: a synchronously-nested mount — a
        // parent rendering a child in its template, so the child mounts INSIDE the
        // parent's GlobalRender frame — would otherwise collide on one shared
        // `lwc-render` mark. The inner (child) stop's `clearMarks('lwc-render')` then
        // wipes the outer (parent) mark too, so the parent's `performance.measure`
        // throws and its span is lost (only 1 of 2 nested `lwc-render`s emitted —
        // profiler/mutation-logging parent-child beforeEach expects 2 under native
        // lifecycle). The MEASURE name stays bare (`lwc-render`) — what the devtools
        // track + the spec spy key on. The top-level cascade span (GlobalRerender,
        // no name/id) keeps the bare mark: exactly one per flush, never nested.
        // Mirrors engine-core (vm-idx-suffixed mark for per-component global spans via
        // getMarkName+vm; bare mark for the global tick).
        return id === undefined ? measureName(opId, name) : `${measureName(opId, name)} - ${id}`;
    }
    return `${measureName(opId, name)} - ${id ?? 0}`;
}

function userTimingStart(opId: number, name: string | undefined, id: number | undefined): void {
    if (!isMeasureEnabled) return;
    performance.mark(markName(opId, name, id));
}

/** The DevTools `detail` payload attached to a measure (engine-core's `end()` shape). */
interface MeasureDetail {
    devtools: {
        dataType: 'track-entry';
        track: string;
        properties?: [string, string][];
    };
}

function userTimingStop(
    opId: number,
    name: string | undefined,
    id: number | undefined,
    detail?: MeasureDetail
): void {
    if (!isMeasureEnabled) return;
    const mark = markName(opId, name, id);
    const measure = measureName(opId, name);
    try {
        // engine-core attaches a `detail.devtools` payload to each measure so the
        // Chrome DevTools performance panel renders a custom "⚡️ Lightning Web
        // Components" track. Only the rerender span carries mutation `properties`.
        performance.measure(measure, detail ? { start: mark, detail } : { start: mark });
    } catch {
        // The start mark may have been cleared; ignore.
    }
    performance.clearMarks(mark);
    performance.clearMeasures(measure);
}

/** The DevTools track label. Matches engine-core (⚡️ Lightning Web Components). */
const LWC_DEVTOOLS_TRACK = '⚡️ Lightning Web Components';

/**
 * Stop the global `lwc-rerender` (GlobalRerender) span, attaching the list of
 * `[tagName, mutatedProps]` rows that explain "why did this re-render?" to the
 * measure's `detail.devtools.properties` — the vapor analogue of engine-core's
 * `logGlobalOperationEnd(GlobalRerender, mutationLogs)`. Dev-only (guarded by
 * `isMeasureEnabled`); the dispatcher stop still fires for an attached profiler.
 */
export function logRerenderStop(properties: [string, string][]): void {
    userTimingStop(OperationId.GlobalRerender, undefined, undefined, {
        devtools: {
            dataType: 'track-entry',
            track: LWC_DEVTOOLS_TRACK,
            properties,
        },
    });
    if (enabled && dispatcher) {
        dispatcher(
            OperationId.GlobalRerender,
            Phase.Stop,
            undefined,
            undefined,
            undefined,
            undefined
        );
    }
}

export type ProfilerDispatcher = (
    opId: number,
    phase: number,
    name: string | undefined,
    id: number | undefined,
    renderMode: number | undefined,
    shadowMode: number | undefined
) => void;

let enabled = false;
let dispatcher: ProfilerDispatcher | null = null;

export function enableProfiler(): void {
    enabled = true;
}
export function disableProfiler(): void {
    enabled = false;
}
export function attachDispatcher(d: ProfilerDispatcher): void {
    dispatcher = d;
}
export function detachDispatcher(): void {
    dispatcher = null;
}
export function isProfilerActive(): boolean {
    return enabled && dispatcher !== null;
}

/**
 * Whether the runtime should bracket operations with logOperationStart/Stop. True
 * when a profiler dispatcher is attached OR when dev-mode User Timing is enabled
 * (so marks/measures are emitted to the devtools track even without a dispatcher).
 */
export function isProfilingEnabled(): boolean {
    return isMeasureEnabled || (enabled && dispatcher !== null);
}

export function logOperationStart(
    opId: number,
    name: string | undefined,
    id: number | undefined,
    renderMode: number | undefined,
    shadowMode: number | undefined
): void {
    userTimingStart(opId, name, id);
    if (enabled && dispatcher) dispatcher(opId, Phase.Start, name, id, renderMode, shadowMode);
}
export function logOperationStop(
    opId: number,
    name: string | undefined,
    id: number | undefined,
    renderMode: number | undefined,
    shadowMode: number | undefined
): void {
    userTimingStop(opId, name, id);
    if (enabled && dispatcher) dispatcher(opId, Phase.Stop, name, id, renderMode, shadowMode);
}
