/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export { createContextProviderWithRegister, createContextWatcher } from './context';

export type {
    ConfigCallback,
    ConfigValue,
    ConfigWithReactiveProps,
    ContextConsumer,
    ContextProvider,
    ContextProviderOptions,
    ContextValue,
    DataCallback,
    WireAdapter,
    WireAdapterConstructor,
    WireAdapterSchemaValue,
    WireContextSubscriptionPayload,
    WireContextSubscriptionCallback,
} from './types';

export {
    connectWireAdapters,
    disconnectWireAdapters,
    installWireAdapters,
    storeWiredFieldMeta,
    storeWiredMethodMeta,
} from './wiring';
