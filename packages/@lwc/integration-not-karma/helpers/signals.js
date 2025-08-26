import { setTrustedSignalSet } from 'lwc';

const signalValidator = new WeakSet();
setTrustedSignalSet(signalValidator);

export function addTrustedSignal(signal) {
    signalValidator.add(signal);
}
