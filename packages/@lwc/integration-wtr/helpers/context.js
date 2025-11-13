import {
    setContextKeys,
    setTrustedContextSet,
    __dangerous_do_not_use_addTrustedContext,
} from 'lwc';

export const connectContext = Symbol.for('connectContext');
export const disconnectContext = Symbol.for('disconnectContext');
export const trustedContext = new WeakSet();

export function initContext() {
    try {
        setTrustedContextSet(trustedContext);
        setContextKeys({ connectContext, disconnectContext });
    } catch {
        // Context already initialized, ignore
    }
}

export function addTrustedContext(context) {
    __dangerous_do_not_use_addTrustedContext(context);
}
