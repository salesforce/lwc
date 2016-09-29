// @flow

import assert from "./assert.js";
const AttributeMap = new WeakMap();

export function decorator(config?: Object = {}): decorator {
    return function attribute(target: Object, attrName: string, { initializer }: Object): Object {
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
}

export function getAttributesConfig(target: Object): Object {
    return AttributeMap.get(target) || {};
}

export function initComponentAttributes(vnode: Object, attributes: Object, bodyAttrValue: array<Object>) {
    const { data: { component, state } } = vnode;
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};
    for (let attrName in config) {
        let { initializer } = config[attrName];
        let { configurable, enumerable } = Object.getOwnPropertyDescriptor(component, attrName) || Object.getOwnPropertyDescriptor(target, attrName);
        assert.invariant(configurable, `component ${component} has tampered with decorated @attribute ${attrName} during constructor() routine.`);
        Object.defineProperty(component, attrName, {
            get: (): any => attributes[attrName],
            set: () => {
                // TODO: consider two-ways data binding configuration
                assert.fail(`Component ${component} can not set a new value for decorated @attribute ${attrName}.`);
            },
            configurable: false,
            enumerable,
        });
        // default attribute value computed when needed
        if (!(attrName in attributes) && initializer) {
            attributes[attrName] = initializer();
        }
    }
    state.hasBodyAttribute = 'body' in config;
    if (bodyAttrValue && bodyAttrValue.length > 0) {
        attributes.body = bodyAttrValue;
    }
    assert.block(() => {
        for (let attrName in attributes) {
            assert.isTrue(attrName in config, `component ${component} does not have decorated @attribute ${attrName}.`);
        }
        Object.preventExtensions(attributes);
    });
}

export function updateComponentAttributes(vnode: Object, attributes: Object, bodyAttrValue: array<Object>) {
    const { data: { component, state } } = vnode;
    assert.invariant(!state.isRendering, `${component}.render() method has side effects on the attributes received.`);
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};
    for (let attrName in config) {
        let attrValue;
        if (!(attrName in attributes)) {
            // default attribute value computed when needed
            const { initializer } = config[attrName];
            attrValue = initializer ? initializer() : undefined;
        } else {
            attrValue = attributes[attrName];
        }
        if (attributes[attrName] !== attrValue) {
            attributes[attrName] = attrValue;
            state.isDirty = true;
        } else {
            // TODO: even when the values are the same, the internals of it might be dirty, @diego will add the mark via the watcher and here we should take that mark into consideration
        }
    }
    if (attributes.body !== bodyAttrValue && bodyAttrValue && bodyAttrValue.length > 0) {
        attributes.body = bodyAttrValue;
        state.isDirty = true;
    }
    assert.block(() => {
        for (let attrName in attributes) {
            assert.isTrue(attrName in config, `component ${component} does not have decorated @attribute ${attrName}.`);
        }
    });
}
