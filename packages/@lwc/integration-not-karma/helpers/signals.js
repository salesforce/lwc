import { setTrustedSignalSet } from 'lwc';

const signalValidator = new WeakSet();

export function initSignals() {
    setTrustedSignalSet(signalValidator);
}

export function addTrustedSignal(signal) {
    signalValidator.add(signal);
}
