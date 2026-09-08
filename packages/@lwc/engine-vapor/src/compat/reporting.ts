/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Minimal port of engine-core's reporting control, used by `freezeTemplate`
 * (template-mutation reporting) and the `__unstable__ReportingControl` test API.
 */

type Dispatcher = (eventId: string, payload: Record<string, unknown>) => void;

const noop: Dispatcher = () => {};
let currentDispatcher: Dispatcher = noop;
let enabled = false;
const onEnabledCallbacks: Array<() => void> = [];

export const reportingControl = {
    attachDispatcher(dispatcher: Dispatcher): void {
        enabled = true;
        currentDispatcher = dispatcher;
        for (const cb of onEnabledCallbacks) {
            try {
                cb();
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Could not invoke callback', err);
            }
        }
        onEnabledCallbacks.length = 0;
    },
    detachDispatcher(): void {
        enabled = false;
        currentDispatcher = noop;
    },
};

export function report(eventId: string, payload: Record<string, unknown>): void {
    if (enabled) currentDispatcher(eventId, payload);
}

export function isReportingEnabled(): boolean {
    return enabled;
}

export function onReportingEnabled(callback: () => void): void {
    if (enabled) callback();
    else onEnabledCallbacks.push(callback);
}

// --- logWarnOnce -------------------------------------------------------------
// Dev-mode warnings that should only be logged once per unique message. The test
// harness resets the seen-set via `globalThis.__lwcResetAlreadyLoggedMessages()`.
const loggedMessages = new Set<string>();
export function logWarnOnce(message: string): void {
    if (loggedMessages.has(message)) return;
    loggedMessages.add(message);
    // eslint-disable-next-line no-console
    console.warn(`[LWC warn]: ${message}`);
}

if (typeof globalThis !== 'undefined') {
    (
        globalThis as { __lwcResetAlreadyLoggedMessages?: () => void }
    ).__lwcResetAlreadyLoggedMessages = () => loggedMessages.clear();
}

// --- Feature flags -----------------------------------------------------------
// Shared flag store (lives here so both the compat facade's setters and the
// runtime in lightning-element.ts can read it without a circular import).
const featureFlags: Record<string, boolean> = {};
export function setFeatureFlagValue(name: string, value: boolean): void {
    featureFlags[name] = value;
}
export function getFeatureFlagValue(name: string): boolean {
    return featureFlags[name] ?? false;
}

// --- Trusted signals ---------------------------------------------------------
// The set of trusted signal objects. Stored on globalThis (not a module-local)
// because the WTR vapor harness bundles each <script> separately — so the
// `helpers/setup.js` that calls setTrustedSignalSet and the test spec that reads
// it via the runtime are DIFFERENT module instances. A global bridges them.
const TRUSTED_SIGNALS_KEY = '__lwcVaporTrustedSignals__';
export function setTrustedSignalSetValue(set: WeakSet<object>): void {
    (globalThis as Record<string, unknown>)[TRUSTED_SIGNALS_KEY] = set;
}
export function isTrustedSignalValue(target: object): boolean {
    const set = (globalThis as Record<string, unknown>)[TRUSTED_SIGNALS_KEY] as
        WeakSet<object> | undefined;
    return set ? set.has(target) : false;
}

// --- Locker hooks ------------------------------------------------------------
// getHook/setHook/callHook, set via the `lwc` facade's setHooks(). When present,
// public-property reads/writes and public-method calls on a component route
// through these (Locker integration). Stored here (shared) to avoid a circular
// import between the facade and the runtime.
interface LockerHooks {
    callHook?: (cmp: unknown, fn: (...a: unknown[]) => unknown, args: unknown[]) => unknown;
    setHook?: (cmp: unknown, key: string, value: unknown) => void;
    getHook?: (cmp: unknown, key: string) => unknown;
}
let lockerHooks: LockerHooks = {};
export function setLockerHooks(newHooks: LockerHooks): void {
    lockerHooks = { ...lockerHooks, ...newHooks };
}
export function getLockerHooks(): LockerHooks {
    return lockerHooks;
}

// --- Test-harness reset hooks ------------------------------------------------
// helpers/reset.js calls these globals between tests; they must EXIST or the
// reset throws and cascades failures across a whole spec file. Define no-op (or
// minimal) implementations for the resets vapor doesn't otherwise provide.
if (typeof globalThis !== 'undefined') {
    const g = globalThis as Record<string, unknown>;
    g.__lwcResetTrustedSignals ??= () => {
        g[TRUSTED_SIGNALS_KEY] = undefined;
    };
    g.__lwcResetFragmentCache ??= () => {};
    g.__lwcResetGlobalStylesheets ??= () => {};
    g.__lwcResetWarnedOnVersionMismatch ??= () => {};
}
