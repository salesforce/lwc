/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * This service is Salesforce-agnostic. The wire adapters must be provided to this module.
 */

import { setWireAdapters, installWiring } from './wire-service';

/**
 * The wire service.
 */
const wireService = {
    // TODO W-4072588 - support connected + disconnected (repeated) cycles
    wiring: (cmp, data, def, context) => {
        // engine guarantees invocation only if def.wire is defined
        const wiredValues = installWiring(cmp, def);
        context['@wire'] = wiredValues;
    },
    disconnected: (cmp, data, def, context) => {
        if (!def.wire) {
            return;
        }
        const wiredValues = context['@wire'];
        if (!wiredValues) {
            return;
        }
        Object.keys(wiredValues).forEach(wireTarget => {
            const wiredValue = wiredValues[wireTarget];
            wiredValue.release();
        });
    }
};

/**
 * Registers the wire service with the provided wire adapters.
 * @param {Function} register Function to register an engine service.
 * @param {...Function} adapterGenerators Wire adapter generators. Each function
 * must return an object whose keys are adapter ids, values are the adapter
 * function.
 * @returns {Object} An object that manges wire adapter registration.
 * It supports registering and unregistering adapter at run time.
 */
export default function registerWireService(register, ...adapterGenerators) {
    setWireAdapters(adapterGenerators);
    register(wireService);

    return {
        register: (adapter) => {
            ADAPTERS.set(adapter.name, adapter);
        },
        unregister: (adapterName) => {
            ADAPTERS.delete(adapterName);
        }
    };
}
