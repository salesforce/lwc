import { VM } from './vm';

export type MeasurementPhase =
    | 'constructor'
    | 'render'
    | 'patch'
    | 'connectedCallback'
    | 'disconnectedCallback'
    | 'renderedCallback'
    | 'errorCallback';

function getMarkName(vm: VM, phase: MeasurementPhase) {
    return `<${vm.def.name} (${vm.uid})> - ${phase}`;
}

export function startMeasure(vm: VM, phase: MeasurementPhase): void {
    const name = getMarkName(vm, phase);
    performance.mark(name);
}

export function endMeasure(vm: VM, phase: MeasurementPhase): void {
    const name = getMarkName(vm, phase);

    performance.measure(name, name);

    // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.
    performance.clearMarks(name);
    performance.clearMeasures(name);
}
