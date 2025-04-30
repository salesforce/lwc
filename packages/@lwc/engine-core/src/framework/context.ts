/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ContextEventName, getContextKeys } from '@lwc/shared';
import type { Signal } from '@lwc/signals';

export type ContextProvidedCallback = (contextSignal: Signal<unknown>) => void;
export class ContextRequestEvent extends CustomEvent<{
    key: symbol;
    contextVariety: unknown;
    callback: ContextProvidedCallback;
}> {
    constructor(detail: { contextVariety: unknown; callback: ContextProvidedCallback }) {
        super(ContextEventName, {
            bubbles: true,
            composed: true,
            detail: { ...detail, key: getContextKeys().contextEventKey },
        });
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ContextRuntimeAdapter<T extends object> {
    isServerSide: boolean;
    component: object;
    provideContext<T extends object>(contextVariety: T, providedContextSignal: Signal<unknown>): void;
    consumeContext<T extends object>(
      contextVariety: T,
      contextProvidedCallback: ContextProvidedCallback,
    ): void;
}