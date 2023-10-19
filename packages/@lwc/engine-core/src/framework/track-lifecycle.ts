/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, StringToLowerCase } from '@lwc/shared';
import { logWarnOnce } from '../shared/logger';
import { onReportingEnabled, report, ReportingEventId } from './reporting';
import { getAssociatedVMIfPresent, VM } from './vm';

const nativeConnectedCounts = new WeakMap<any, number>();
const nativeDisconnectedCounts = new WeakMap<any, number>();
const syntheticConnectedCounts = new WeakMap<any, number>();
const syntheticDisconnectedCounts = new WeakMap<any, number>();
const ignoredElements = new WeakSet<any>();

export type LifecycleType = 'connected' | 'disconnected';

let detectionEnabled = false;

function getFriendlyErrorMessage(
    eventId:
        | ReportingEventId.NativeConnectedWithoutSynthetic
        | ReportingEventId.SyntheticConnectedWithoutNative
        | ReportingEventId.NativeDisconnectedWithoutSynthetic
        | ReportingEventId.SyntheticDisconnectedWithoutNative
) {
    switch (eventId) {
        case ReportingEventId.NativeConnectedWithoutSynthetic:
            return 'should have fired a connectedCallback, but did not.';
        case ReportingEventId.SyntheticConnectedWithoutNative:
            return 'fired a connectedCallback when it should not have.';
        case ReportingEventId.NativeDisconnectedWithoutSynthetic:
            return 'should have fired a disconnectedCallback, but did not.';
        case ReportingEventId.SyntheticDisconnectedWithoutNative:
            return 'fired a disconnectedCallback when it should not have.';
    }
}

function getEventId(lifecycleType: LifecycleType, nativeCount: number, syntheticCount: number) {
    if (lifecycleType === 'connected') {
        if (nativeCount > syntheticCount) {
            return ReportingEventId.NativeConnectedWithoutSynthetic;
        } else {
            return ReportingEventId.SyntheticConnectedWithoutNative;
        }
    } else {
        // disconnected
        if (nativeCount > syntheticCount) {
            return ReportingEventId.NativeDisconnectedWithoutSynthetic;
        } else {
            return ReportingEventId.SyntheticDisconnectedWithoutNative;
        }
    }
}

function getCounts(lifecycleType: LifecycleType, native: boolean) {
    if (lifecycleType === 'connected') {
        if (native) {
            return nativeConnectedCounts;
        } else {
            return syntheticConnectedCounts;
        }
    } else {
        // disconnected
        if (native) {
            return nativeDisconnectedCounts;
        } else {
            return syntheticDisconnectedCounts;
        }
    }
}

function reportViolation(
    lifecycleType: LifecycleType,
    elm: any,
    nativeCount: number,
    syntheticCount: number
) {
    // The vm is either for the source, the target, or both. Either one or both must be using synthetic
    // shadow for a violation to be detected.
    const vm: VM | undefined = getAssociatedVMIfPresent(elm);
    if (isUndefined(vm)) {
        // vm should never be undefined here, but just to be safe, bail out and don't report
        return;
    }
    const eventId = getEventId(lifecycleType, nativeCount, syntheticCount);
    const tagName = StringToLowerCase.call(elm.tagName);
    report(eventId, {
        tagName: tagName,
    });
    if (process.env.NODE_ENV !== 'production') {
        // Avoid excessively logging to the console in the case of duplicates.
        logWarnOnce(
            `Element <${tagName}> ` +
                getFriendlyErrorMessage(eventId) +
                ` For details, see: https://sfdc.co/native-lifecycle`,
            vm
        );
    }
}

function checkForViolations(elm: any) {
    const nativeConnected = nativeConnectedCounts.get(elm) ?? 0;
    const nativeDisconnected = nativeDisconnectedCounts.get(elm) ?? 0;
    const syntheticConnected = syntheticConnectedCounts.get(elm) ?? 0;
    const syntheticDisconnected = syntheticDisconnectedCounts.get(elm) ?? 0;

    try {
        if (
            nativeConnected === 1 &&
            nativeDisconnected === 1 &&
            syntheticConnected === 0 &&
            syntheticDisconnected === 0
        ) {
            // Heuristic: ignore rapid disconnect/connect events that occur in the same tick of the event loop
            // This is likely to be the LWC diffing algo, which does not report disconnect+reconnect
            // when reordering elements in a list.
            ignoredElements.add(elm);
            return;
        }

        if (nativeConnected !== syntheticConnected) {
            reportViolation('connected', elm, nativeConnected, syntheticConnected);
        }

        if (nativeDisconnected !== syntheticDisconnected) {
            reportViolation('disconnected', elm, nativeDisconnected, syntheticDisconnected);
        }
    } finally {
        // Clean up so that subsequent calls for this same element will ignore existing violations
        nativeConnectedCounts.delete(elm);
        nativeDisconnectedCounts.delete(elm);
        syntheticConnectedCounts.delete(elm);
        syntheticDisconnectedCounts.delete(elm);
    }
}

/**
 * For the purposes of reporting and logging, track every connected/disconnected lifecycle
 * callback and whether it is native or synthetic.
 *
 * This is designed to only run in the browser, and only when native lifecycle is disabled.
 * @param elm - element to report for
 * @param lifecycleType - connected or disconnected
 * @param native - true if this is a native lifecycle event
 */
export async function reportLifecycleCallback(
    elm: any,
    lifecycleType: LifecycleType,
    native: boolean
) {
    if (
        !detectionEnabled ||
        ignoredElements.has(elm) ||
        lwcRuntimeFlags.DISABLE_LIFECYCLE_REPORTING
    ) {
        return;
    }

    const counts = getCounts(lifecycleType, native);
    counts.set(elm, (counts.get(elm) ?? 0) + 1);

    // Wait a microtask tick before checking, so that we have time to collect all native/synthetic reports.
    // Note we are deliberately using an async function because it provides async callstacks in DevTools.
    await Promise.resolve();

    checkForViolations(elm);
}

function enableDetection() {
    detectionEnabled = true;
}

// Detecting synthetic vs native lifecycle only makes sense for the browser, where native custom elements exist
// It also only makes sense if native lifecycle is disabled
if (process.env.IS_BROWSER && !lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
    // Always run detection in dev mode, so we can at least print to the console
    if (process.env.NODE_ENV !== 'production') {
        enableDetection();
    } else {
        // In prod mode, only enable detection if reporting is enabled
        onReportingEnabled(enableDetection);
    }
}
