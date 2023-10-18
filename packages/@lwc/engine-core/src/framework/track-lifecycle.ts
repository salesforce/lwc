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

const qM =
    typeof queueMicrotask === 'function'
        ? queueMicrotask
        : (callback: () => void) => Promise.resolve().then(callback);

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
            return 'fired a connectedCallback when it should not have.';
    }
}

function reportLifecycleViolation(
    lifecycleType: LifecycleType,
    elm: any,
    nativeCount: number,
    syntheticCount: number
) {
    // The vm is either for the source, the target, or both. Either one or both must be using synthetic
    // shadow for a violation to be detected.
    const vm: VM | undefined = getAssociatedVMIfPresent((elm.getRootNode() as ShadowRoot).host);
    if (isUndefined(vm)) {
        // vm should never be undefined here, but just to be safe, bail out and don't report
        return;
    }
    const eventId =
        lifecycleType === 'connected'
            ? nativeCount > syntheticCount
                ? ReportingEventId.NativeConnectedWithoutSynthetic
                : ReportingEventId.SyntheticConnectedWithoutNative
            : nativeCount > syntheticCount
            ? ReportingEventId.NativeDisconnectedWithoutSynthetic
            : ReportingEventId.SyntheticDisconnectedWithoutNative;
    const tagName = StringToLowerCase.call(elm.tagName);
    report(eventId, {
        tagName: tagName,
    });
    if (process.env.NODE_ENV !== 'production') {
        // Avoid excessively logging to the console in the case of duplicates.
        logWarnOnce(
            `Element <${tagName}> rendered by <${StringToLowerCase.call(vm.tagName)}> ` +
                `${JSON.stringify({ nativeCount, syntheticCount })} ` +
                getFriendlyErrorMessage(eventId) +
                ` For details, see: https://sfdc.co/native-lifecycle`,
            vm
        );
    }
}

/* For the purposes of reporting and logging, track every connected/disconnected lifecycle
 * callback and whether it is native or synthetic.
 *
 * This is designed to only run in the browser, and only when native lifecycle is disabled.
 */
export async function reportLifecycleCallback(
    elm: any,
    lifecycleType: LifecycleType,
    native: boolean
) {
    if (!detectionEnabled) {
        return;
    }

    if (ignoredElements.has(elm)) {
        return;
    }

    const counts =
        lifecycleType === 'connected'
            ? native
                ? nativeConnectedCounts
                : syntheticConnectedCounts
            : native
            ? nativeDisconnectedCounts
            : syntheticDisconnectedCounts;
    counts.set(elm, (counts.get(elm) ?? 0) + 1);

    qM(() => {
        const nativeConnected = nativeConnectedCounts.get(elm) ?? 0;
        const nativeDisconnected = nativeDisconnectedCounts.get(elm) ?? 0;
        const syntheticConnected = syntheticConnectedCounts.get(elm) ?? 0;
        const syntheticDisconnected = syntheticDisconnectedCounts.get(elm) ?? 0;

        if (nativeConnected !== syntheticConnected) {
            reportLifecycleViolation('connected', elm, nativeConnected, syntheticConnected);
        }

        if (nativeDisconnected !== syntheticDisconnected) {
            reportLifecycleViolation(
                'disconnected',
                elm,
                nativeDisconnected,
                syntheticDisconnected
            );
        }

        nativeConnectedCounts.delete(elm);
        nativeDisconnectedCounts.delete(elm);
        syntheticConnectedCounts.delete(elm);
        syntheticDisconnectedCounts.delete(elm);

        if (lifecycleType === 'disconnected') {
            // Ignore any further connected/disconnected events for this element.
            // This is a heuristic for LWC's diffing algo, which generates extra connectedCallbacks in native mode,
            // but the component author can't do anything about that, so it's useless to report/warn.
            ignoredElements.add(elm);
        }
    });
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
