// @flow

import assert from "./assert.js";
const AttributeMap = new WeakMap();

export function decorator(config?: Object = {}): decorator {
    function attribute(target: Object, attrName: string, { initializer }: Object): Object {
        let attrs = AttributeMap.get(target);
        if (!attrs) {
            attrs = {};
            AttributeMap.set(target, attrs);
        }
        assert.isFalse(attrs[attrName], `Duplicated decorated attribute ${attrName} in component <${target.constructor.name}>.`);
        attrs[attrName] = Object.assign({}, config, {
            initializer,
        });
        assert.block(() => {
            Object.freeze(attrs[attrName]);
        });
        return {
            get: () => {
                assert.fail(`Component <${target.constructor.name}> can not access decorated @attribute ${attrName} until its updated() callback is invoked.`);
            },
            set: () => {
                assert.fail(`Component <${target.constructor.name}> can not set a new value for decorated @attribute ${attrName}.`);
            },
            enumerable: true,
            configurable: true
        };
    }
    if (typeof arguments[1] === 'string') {
        config = undefined;
        return attribute(...arguments);
    } else {
        return attribute;
    }
}

export function getAttributesConfig(target: Object): Object {
    return AttributeMap.get(target) || {};
}

export function initComponentAttributes(vm: Object, newAttrs: Object, newBody: array<Object>) {
    const { component, state } = vm;
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};
    for (let attrName in config) {
        let { initializer } = config[attrName];
        assert.block(() => {
            let descriptor = Object.getOwnPropertyDescriptor(component, attrName) || Object.getOwnPropertyDescriptor(target, attrName);
            assert.invariant(!descriptor || descriptor.configurable, `component ${component} has tampered with decorated @attribute ${attrName} during constructor() routine.`);
        });
        Object.defineProperty(component, attrName, {
            get: (): any => {
                if (vm.isRendering) {
                    vm.reactiveNames[attrName] = true;
                }
                return state[attrName];
            },
            set: () => {
                // TODO: consider two-ways data binding configuration
                assert.fail(`Component ${component} can not set a new value for decorated @attribute ${attrName}.`);
            },
            configurable: false,
            enumerable: true,
        });
        // default attribute value computed when needed
        state[attrName] = attrName in newAttrs ? newAttrs[attrName] : (initializer && initializer());
    }
    vm.hasBodyAttribute = 'body' in config;
    if (newBody && newBody.length > 0) {
        state.body = newBody;
    }
    assert.block(() => {
        for (let attrName in newAttrs) {
            assert.isTrue(attrName in config, `component ${component} does not have decorated @attribute ${attrName}.`);
        }
        Object.preventExtensions(state);
    });
}

export function updateComponentAttributes(vm: Object, newAttrs: Object, newBody: array<Object>) {
    const { component, isRendering, state } = vm;
    assert.invariant(!isRendering, `${component}.render() method has side effects on the attributes received.`);
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};
    for (let attrName in config) {
        let attrValue;
        if (!(attrName in newAttrs)) {
            // default attribute value computed when needed
            const initializer = config[attrName];
            attrValue = initializer && initializer();
        } else {
            attrValue = newAttrs[attrName];
        }
        if (state[attrName] !== attrValue) {
            state[attrName] = attrValue;
            if (vm.reactiveNames[attrName]) {
                vm.isDirty = true;
            }
        } else {
            // TODO: even when the values are the same, the internals of it might be dirty, @diego will add the mark via the watcher and here we should take that mark into consideration
        }
    }
    if (vm.body !== newBody && newBody && newBody.length > 0) {
        vm.body = newBody;
        if (vm.reactiveNames.body) {
            vm.isDirty = true;
        }
    }
    assert.block(() => {
        for (let attrName in state) {
            assert.isTrue(attrName in config, `component ${component} does not have decorated @attribute ${attrName}.`);
        }
    });
}
