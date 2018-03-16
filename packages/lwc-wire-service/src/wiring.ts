/**
 * Wires LWC component to wire adapters.
 */
import { Element } from 'engine';
import { ElementDef, WireDef } from './shared-types';

/**
 * Gets a mapping of component prop to wire config dynamic params. In other words,
 * the wire config's parameter set that updates whenever a prop changes.
 * @param {*} wireDef The wire definition.
 * @param {String} wireTarget Component property that is the target of the wire.
 * @returns {Object<String,String[]>} Map of prop name to wire config dynamic params.
 */
export function getPropToParams(wireDef: WireDef, wireTarget) {
    const map = Object.create(null);
    const { params } = wireDef;
    if (params) {
        Object.keys(params).forEach(param => {
            const prop = params[param];

            if (param in wireDef.static) {
                throw new Error(`${wireTarget}'s @wire('${wireDef.type}') parameter ${param} specified multiple times.`);
            }

            // attribute change handlers use hyphenated case
            let set = map[prop];
            if (!set) {
                set = map[prop] = [];
            }
            set.push(param);
        });
    }
    return map;
}

/**
 * Gets the wire adapter for a wire.
 * @param {*} wireDef The wire definition
 * @param {String} wireTarget Component property that is the target of the wire.
 * @returns {Function} The wire adapter.
 */
export function getAdapter(wireDef: WireDef, wireTarget) {
    let adapter;
    // TODO: deprecate type once consumers have migrate to use function identifier for adapter id.
    if (wireDef.type) {
        adapter = ADAPTERS.get(wireDef.type);
        if (!adapter) {
            throw new Error(`Unknown wire adapter id '${wireDef.type}' in ${wireTarget}'s @wire('${wireDef.type}', ...)`);
        }
    } else if (wireDef.adapter) {
        adapter = ADAPTERS.get(wireDef.adapter.name);
        if (!adapter) {
            throw new Error(`Unknown wire adapter id '${wireDef.adapter.name}' in ${wireTarget}'s @wire(${wireDef.adapter.name}, ...)`);
        }
    }

    return adapter;
}

/**
 * Gets the non-dynamic wire config.
 * @param {*} wireDef The wire definition
 * @returns {Object} The non-dynamic portions of the wire config.
 */
export function getStaticConfig(wireDef: WireDef): object {
    const config = Object.create(null);
    Object.assign(config, wireDef.static);
    return config;
}

/**
 * Gets whether the wiring is to a method or property.
 * @param {*} wireDef The wire definition
 * @returns {Boolean} True if wired to a method, false otherwise.
 */
export function getIsMethod(wireDef: WireDef): boolean {
    return wireDef.method === 1;
}

/**
 * Gets the config bags for all wires on a component.
 * @param {*} def The component definition.
 * @return {Object<String,Object>} Map of wire configs.
 */
export function getWireConfigs(def: ElementDef) {
    const wires = def.wire;
    const wireConfigs = Object.create(null);
    Object.keys(wires).forEach(wireTarget => {
        const wireDef = wires[wireTarget];
        const propToParams = getPropToParams(wireDef, wireTarget);
        const adapter = getAdapter(wireDef, wireTarget);
        const staticConfig = getStaticConfig(wireDef);
        const isMethod = getIsMethod(wireDef);
        wireConfigs[wireTarget] = { propToParams, adapter, staticConfig, isMethod };
    });
    return wireConfigs;
}

/**
 * Gets the WiredValue instances for the wire config bags.
 * @param {*} wireConfigs The wire config bags.
 * @param {*} cmp The component whose wiring is being created.
 * @returns {Object<String,WiredValue>} The WiredValue instances.
 */
export function getWiredValues(wireConfigs, cmp) {
    const wiredValues = Object.create(null);
    Object.keys(wireConfigs).forEach(wireTarget => {
        const { adapter, staticConfig, isMethod } = wireConfigs[wireTarget];
        wiredValues[wireTarget] = new WiredValue(adapter, staticConfig, isMethod, cmp, wireTarget);
    });
    return wiredValues;
}

/**
 * Gets the WiredValue handlers for property changes.
 * @param {*} wireConfigs The wire config bags.
 * @param {Object<String,WiredValue>} wiredValues The WiredValue instances.
 * @return {Object<String,Function[]>} Map of props to change handlers.
 */
export function getPropChangeHandlers(wireConfigs, wiredValues) {
    const map = Object.create(null);
    Object.keys(wireConfigs).forEach(wireTarget => {
        const { propToParams } = wireConfigs[wireTarget];
        const wiredValue = wiredValues[wireTarget];

        Object.keys(propToParams).forEach(prop => {
            let set = map[prop];
            if (!set) {
                set = map[prop] = [];
            }

            const boundUpdate = propToParams[prop].map(param => {
                return wiredValue.update.bind(wiredValue, param);
            });

            set.push(...boundUpdate);
        });
    });
    return map;
}

/**
 * Installs property setters to listen for changes to property-based params.
 * @param {Object} cmp The component.
 * @param {Object<String,Function[]>} propsToListeners Map of prop names to change handler functions.
 */
export function installSetterOverrides(cmp, propsToListeners) {
    const props = Object.keys(propsToListeners);

    // do not modify cmp if not required
    if (props.length === 0) {
        return;
    }

    props.forEach(prop => {
        const newDescriptor = getOverrideDescriptor(cmp, prop, propsToListeners[prop]);
        Object.defineProperty(cmp, prop, newDescriptor);
    });
}

/**
 * Gets a property descriptor that monitors the provided property for changes.
 * @param {Object} cmp The component.
 * @param {String} prop The name of the property to be monitored.
 * @param {Function[]} listeners List of functions to invoke when the prop's value changes.
 * @return {Object} A property descriptor.
 */
export function getOverrideDescriptor(cmp, prop, listeners) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(cmp.constructor.prototype, prop);

    let newDescriptor;
    if (originalDescriptor) {
        newDescriptor = Object.assign({}, originalDescriptor, {
            set(value) {
                if (originalDescriptor.set) {
                    originalDescriptor.set.call(cmp, value);
                }

                // re-fetch the value to handle asymmetry between setter and getter values
                listeners.forEach(f => f(cmp[prop]));
            }
        });
    } else {
        const propSymbol = Symbol(prop);
        newDescriptor = {
            get() {
                return cmp[propSymbol];
            },
            set(value) {
                cmp[propSymbol] = value;
                listeners.forEach(f => f(value));
            }
        };
        // grab the existing value
        cmp[propSymbol] = cmp[prop];
    }
    return newDescriptor;
}

/**
 * Installs the WiredValue instances onto the component.
 * @param {Object<String,WiredValue>} wiredValues The WiredValue instances.
 */
export function installWiredValues(wiredValues) {
    Object.keys(wiredValues).forEach(wiredTarget => {
        const wiredValue = wiredValues[wiredTarget];
        wiredValue.install();
    });
}

/**
 * Installs wiring for a component.
 */
export function installWiring(cmp: Element, def) {
    const wireConfigs = getWireConfigs(def);
    const wiredValues = getWiredValues(wireConfigs, cmp);
    const propChangeHandlers = getPropChangeHandlers(wireConfigs, wiredValues);
    installSetterOverrides(cmp, propChangeHandlers);
    // TODO - handle when config values have only defaults and thus don't trigger setter overrides
    installWiredValues(wiredValues);

    return wiredValues;
}
