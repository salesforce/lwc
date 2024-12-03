import type { Signal } from '@lwc/signals';

export const symbolContextKey = Symbol.for('context');
export type ContextProvidedCallback = (contextSignal: Signal<unknown>) => void;

const EVENT_NAME = 'lightning:context-request';

export class ContextRequestEvent extends CustomEvent<{
  key: typeof symbolContextKey;
  contextVariety: unknown;
  callback: ContextProvidedCallback;
}> {
    constructor(detail: { contextVariety: unknown; callback: ContextProvidedCallback }) {
        super(EVENT_NAME, {
            bubbles: true,
            composed: true,
            detail: { ...detail, key: symbolContextKey },
        });
    }
}