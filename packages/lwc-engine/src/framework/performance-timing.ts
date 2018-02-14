import { VM } from './vm';

export type MeasurementPhase =
    | 'constructor'
    | 'render'
    | 'patch'
    | 'connectedCallback'
    | 'disconnectedCallback'
    | 'renderedCallback'
    | 'errorCallback';

// Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
// JSDom (used in Jest) for example doesn't implement the UserTiming APIs
const isUserTimingSupported: boolean =
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.measure === 'function' &&
    typeof performance.clearMeasures === 'function';

function getMarkName(vm: VM, phase: MeasurementPhase): string {
    return `<${vm.def.name} (${vm.uid})> - ${phase}`;
}

export function startMeasure(vm: VM, phase: MeasurementPhase) {
    if (!isUserTimingSupported) {
        return;
    }

    const name = getMarkName(vm, phase);
    performance.mark(name);
}

export function endMeasure(vm: VM, phase: MeasurementPhase) {
    if (!isUserTimingSupported) {
        return;
    }

    const name = getMarkName(vm, phase);
    performance.measure(name, name);

    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(name);
    performance.clearMeasures(name);
}
