/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { startMeasure, endMeasure, MeasurementPhase } from './performance-timing';
import { VM } from './vm';

function noop(_opId: number, _phase: number, _cmpName: string, _vm_idx: number) {}

let logOperation = noop;

export const enum OperationId {
    constructor = 0,
    render = 1,
    patch = 2,
    connectedCallback = 3,
    renderedCallback = 4,
    disconnectedCallback = 5,
    errorCallback = 6,
}

const enum Phase {
    Start = 0,
    Stop = 1,
}

const opIdToMeasurementPhaseMappingArray: MeasurementPhase[] = [
    'constructor',
    'render',
    'patch',
    'connectedCallback',
    'renderedCallback',
    'disconnectedCallback',
    'errorCallback',
];

let profilerEnabled = false;
let logMarks = false;
let bufferLogging = false;

if (process.env.NODE_ENV !== 'production') {
    profilerEnabled = true;
    logMarks = true;
    bufferLogging = false;
}

const profilerStateCallbacks: ((arg0: boolean) => void)[] = [];

function trackProfilerState(callback: (arg0: boolean) => void) {
    callback(profilerEnabled);
    profilerStateCallbacks.push(callback);
}

function logOperationStart(opId: OperationId, vm: VM) {
    if (logMarks) {
        startMeasure(opIdToMeasurementPhaseMappingArray[opId], vm);
    }
    if (bufferLogging) {
        logOperation(opId, Phase.Start, vm.tagName, vm.idx);
    }
}

function logOperationEnd(opId: OperationId, vm: VM) {
    if (logMarks) {
        endMeasure(opIdToMeasurementPhaseMappingArray[opId], vm);
    }
    if (bufferLogging) {
        logOperation(opId, Phase.Stop, vm.tagName, vm.idx);
    }
}

function enableProfiler() {
    profilerEnabled = true;
    bufferLogging = true;
    notifyProfilerStateChange();
}

function disableProfiler() {
    if (process.env.NODE_ENV !== 'production') {
        // in non-prod mode we want to keep logging marks
        profilerEnabled = true;
        logMarks = true;
        bufferLogging = false;
    } else {
        profilerEnabled = false;
        bufferLogging = false;
        logMarks = false;
    }
    notifyProfilerStateChange();
}

function notifyProfilerStateChange() {
    for (let i = 0; i < profilerStateCallbacks.length; i++) {
        profilerStateCallbacks[i](profilerEnabled);
    }
}

function attachDispatcher(
    dispatcher: (_opId: number, _phase: number, _cmpName: string, _vm_idx: number) => void
) {
    logOperation = dispatcher;
    bufferLogging = true;
}

function detachDispatcher() {
    const currentLogOperation = logOperation;
    logOperation = noop;
    bufferLogging = false;
    return currentLogOperation;
}

const profilerControl = {
    enableProfiler,
    disableProfiler,
    attachDispatcher,
    detachDispatcher,
};

export { logOperationStart, logOperationEnd, trackProfilerState, profilerControl };
