import { isFalse } from './assert';

export type ContextKeys = {
    connectContext: symbol;
    disconnectContext: symbol;
    contextEventKey: symbol;
}

let contextKeys: ContextKeys;

export function setContextKeys(config: ContextKeys) {
    isFalse(contextKeys, 'Context keys are already set!');

    contextKeys = config;
}

export function getContextKeys() {
    return contextKeys;
}

export const ContextEventName = 'lightning:context-request';