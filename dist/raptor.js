(function (exports) {
'use strict';

var registry = {
    raptor: {
        get ns() {
            return Promise.resolve(Main);
        }
    }
};

function loaderEvaluate(moduleStatus) {
    var exports = void 0;
    moduleStatus.ns = Promise.all(moduleStatus.deps.map(function (name) {
        return name === 'exports' ? Promise.resolve(exports = {}) : loaderImportMethod(name);
    })).then(function (resolvedNamespaces) {
        var returnedValue = moduleStatus.definition.apply(undefined, resolvedNamespaces);
        return exports || returnedValue;
    });
    return moduleStatus.ns;
}

function loaderLoadAndEvaluate(name) {
    return Promise.reject(new TypeError('Bundle ' + name + ' does not exist in the registry.'));
}

function loaderImportMethod(name) {
    if (!name) {
        return Promise.reject(new TypeError('loader.import()\'s name is required to be a non-empty string value.'));
    }
    name = name.toLowerCase();
    var moduleStatus = registry[name];
    if (!moduleStatus) {
        return loaderLoadAndEvaluate(name);
    }
    if (!moduleStatus.ns) {
        return loaderEvaluate(moduleStatus);
    }
    return moduleStatus.ns;
}

function amdDefineMethod(name, deps, definition) {
    if (!definition) {
        amdDefineMethod(name, [], deps);
        return;
    }
    if (typeof name !== 'string') {
        throw new TypeError('Invalid AMD define() call.');
    }
    name = name.toLowerCase();
    if (registry[name]) {
        console.warn('Duplicated AMD entry ignored for name=' + name);
    }
    registry[name] = {
        deps: deps,
        definition: definition,
        ns: undefined
    };
}

var assert = {
    invariant: function invariant(value, msg) {
        if (!value) {
            throw new Error("Invariant Violation: " + msg);
        }
    },
    isTrue: function isTrue(value, msg) {
        if (!value) {
            throw new Error("Assert Violation: " + msg);
        }
    },
    isFalse: function isFalse(value, msg) {
        if (value) {
            throw new Error("Assert Violation: " + msg);
        }
    },
    block: function block(fn) {
        fn.call();
    },
    vnode: function vnode(_vnode) {
        assert.isTrue(_vnode && "sel" in _vnode && "data" in _vnode && "children" in _vnode && "text" in _vnode && "elm" in _vnode && "key" in _vnode, _vnode + " is not a vnode.");
    },
    vm: function vm(_vm) {
        assert.isTrue(_vm && "Ctor" in _vm && "data" in _vm && "children" in _vm && "text" in _vm && "elm" in _vm && "key" in _vm, _vm + " is not a vm.");
    },
    fail: function fail(msg) {
        throw new Error(msg);
    }
};

function updateClass(oldVnode, vnode) {
    var elm = vnode.elm;
    var oldClass = oldVnode.data.class;
    var klass = vnode.data.class;

    if (klass !== oldClass) {
        assert.block(function () {
            if (elm.className === (klass || '')) {
                console.warn('unneccessary update of element ' + elm + ', property className for ' + vnode + '.');
            }
        });
        elm.className = klass || '';
    }
}

var className = {
    create: updateClass,
    update: updateClass
};

var TargetToPropsMap = new WeakMap();

function notifyListeners(target, propName) {
    if (TargetToPropsMap.has(target)) {
        var PropNameToListenersMap = TargetToPropsMap.get(target);
        var set = PropNameToListenersMap.get(propName);
        if (set) {
            set.forEach(function (vm) {
                assert.vm(vm);
                console.log("Marking " + vm + " as dirty: \"this." + propName + "\" set to a new value.");
                if (!vm.cache.isDirty) {
                    markComponentAsDirty(vm);
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            });
        }
    }
}

function subscribeToSetHook(vm, target, propName) {
    assert.vm(vm);
    var PropNameToListenersMap = void 0;
    if (!TargetToPropsMap.has(target)) {
        PropNameToListenersMap = new Map();
        TargetToPropsMap.set(target, PropNameToListenersMap);
    } else {
        PropNameToListenersMap = TargetToPropsMap.get(target);
    }
    var set = PropNameToListenersMap.get(propName);
    if (!set) {
        set = new Set();
        PropNameToListenersMap.set(propName, set);
    }
    if (!set.has(vm)) {
        set.add(vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        vm.cache.listeners.add(set);
    }
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var topLevelContextSymbol = Symbol('Top Level Context');

var currentContext = _defineProperty({}, topLevelContextSymbol, true);

function establishContext(ctx) {
    currentContext = ctx;
}

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var vnode = createCommonjsModule(function (module) {
module.exports = function (sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return { sel: sel, data: data, children: children,
    text: text, elm: elm, key: key };
};
});

var vnode$1 = interopDefault(vnode);


var require$$2 = Object.freeze({
  default: vnode$1
});

var is = createCommonjsModule(function (module) {
module.exports = {
  array: Array.isArray,
  primitive: function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
  }
};
});

var is$1 = interopDefault(is);
var array = is.array;
var primitive = is.primitive;

var require$$1 = Object.freeze({
  default: is$1,
  array: array,
  primitive: primitive
});

var h = createCommonjsModule(function (module) {
var VNode = interopDefault(require$$2);
var is = interopDefault(require$$1);

function addNS(data, children, sel) {
  data.ns = 'http://www.w3.org/2000/svg';

  if (sel !== 'foreignObject' && children !== undefined) {
    for (var i = 0; i < children.length; ++i) {
      addNS(children[i].data, children[i].children, children[i].sel);
    }
  }
}

module.exports = function h(sel, b, c) {
  var data = {},
      children,
      text,
      i;
  if (c !== undefined) {
    data = b;
    if (is.array(c)) {
      children = c;
    } else if (is.primitive(c)) {
      text = c;
    }
  } else if (b !== undefined) {
    if (is.array(b)) {
      children = b;
    } else if (is.primitive(b)) {
      text = b;
    } else {
      data = b;
    }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
    addNS(data, children, sel);
  }
  return VNode(sel, data, children, text, undefined);
};
});

var h$1 = interopDefault(h);

// [c]ustom element node
function c(sel, Ctor) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var bcDefaultSlot = arguments[3];

    assert.isFalse("attrs" in data, "Compiler Issue: Custom elements should not have property \"attrs\" in data.");
    var key = data.key,
        _props = data.props,
        on = data.on,
        dataset = data.dataset,
        _class = data.class;
    // assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    // TODO: once the parser is updated, uncomment the previous line and remove this fork in favor of just data.slotset

    var slotset = data.slotset || bcDefaultSlot && bcDefaultSlot.length && { $default$: bcDefaultSlot };
    var vnode = h$1(sel, { hook: hook, key: key, slotset: slotset, dataset: dataset, on: on, props: {}, _props: _props, _class: _class }, []);
    vnode.Ctor = Ctor;
    return vnode;
}

// [i]terable node
function i(items, factory) {
    var len = Array.isArray(items) ? items.length : 0;
    var list = new Array(len);
    for (var _i = 0; _i < len; _i += 1) {
        var vnode = factory(items[_i]);
        assert.vnode(vnode, 'Invariant Violation: Iteration should always produce a vnode.');
        list[_i] = vnode;
    }
    return list;
}

/**
 * [s]tringify
 * This is used to guarantee that we never send null, object or undefined as a text children to snabbdom
 * - null and undefined should produce empty entry
 * - string values are on the fast lane
 * - any other object will be intentionally casted as strings
 */
function s() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return typeof value === 'string' ? value : value === null ? '' : '' + value;
}

/**
 * [e]mpty
 * This is used to guarantee that we never send null, object or undefined as a text children to snabbdom
 * - null and undefined should produce empty entry
 * - string values are on the fast lane
 * - any other object will be intentionally casted as strings
 */
function e() {
    return '';
}

/**
 * [f]lattening
 */
function f(items) {
    assert.isTrue(Array.isArray(items), 'flattening api can only work with arrays.');
    var len = items.length;
    var flattened = [];
    for (var _i2 = 0; _i2 < len; _i2 += 1) {
        var item = items[_i2];
        if (Array.isArray(item)) {
            flattened.push.apply(flattened, item);
        } else {
            flattened.push(item);
        }
    }
    assert.block(function () {
        flattened.forEach(function (vnodeOrString) {
            if (typeof vnodeOrString === 'string') {
                return;
            }
            assert.vnode(vnodeOrString, 'Invalid children element, it should be a string or a vnode.');
        });
    });
    return flattened;
}

var api = Object.freeze({
    c: c,
    h: h$1,
    i: i,
    s: s,
    e: e,
    f: f
});

var isRendering = false;
var vmBeingRendered = null;
var vmBeingCreated = null;

function wrapHTMLElement(element) {
    assert.isTrue(element instanceof HTMLElement, "Only HTMLElements can be wrapped by h()");
    var tagName = element.tagName.toLowerCase();
    var vnode = h$1(tagName, {});
    vnode.elm = element;
    return vnode;
}

function normalizeRenderResult(vm, elementOrVnodeOrArrayOfVnodes) {
    if (!elementOrVnodeOrArrayOfVnodes) {
        return [];
    }
    // never mutate the original array
    var vnodes = Array.isArray(elementOrVnodeOrArrayOfVnodes) ? elementOrVnodeOrArrayOfVnodes.slice(0) : [elementOrVnodeOrArrayOfVnodes];
    for (var i = 0; i < vnodes.length; i += 1) {
        var elm = vnodes[i];
        if (elm instanceof HTMLElement) {
            vnodes[i] = wrapHTMLElement(elm);
        }
        assert.isTrue(vnodes[i] && vnodes[i].sel, "Invalid vnode element " + vnodes[i] + " returned in " + (i + 1) + " position when calling " + vm + ".render().");
    }
    return vnodes;
}

function invokeComponentConstructor(vm) {
    var Ctor = vm.Ctor,
        context = vm.cache.context;

    var ctx = currentContext;
    establishContext(context);
    vmBeingCreated = vm;
    var component = new Ctor();
    // note to self: invocations during construction to get the vm associated
    // to the component works fine as well because we can use `vmBeingCreated`
    // in getLinkedVNode() as a fallback patch for resolution.
    setLinkedVNode(component, vm);
    vmBeingCreated = null;
    establishContext(ctx);
    return component;
}

function invokeComponentDisconnectedCallback(vm) {
    var _vm$cache = vm.cache,
        component = _vm$cache.component,
        context = _vm$cache.context;

    if (component.disconnectedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

function invokeComponentConnectedCallback(vm) {
    var _vm$cache2 = vm.cache,
        component = _vm$cache2.component,
        context = _vm$cache2.context;

    if (component.connectedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.connectedCallback();
        establishContext(ctx);
    }
}

function invokeComponentRenderMethod(vm) {
    var _vm$cache3 = vm.cache,
        component = _vm$cache3.component,
        context = _vm$cache3.context;

    if (component.render) {
        var ctx = currentContext;
        establishContext(context);
        isRendering = true;
        vmBeingRendered = vm;
        var result = component.render();
        // when the render method `return html;`, the factory has to be invoked
        // TODO: add identity to the html functions
        if (typeof result === 'function') {
            result = result.call(undefined, api, component);
        }
        isRendering = false;
        vmBeingRendered = null;
        establishContext(ctx);
        // the render method can return many different things, here we attempt to normalize it.
        return normalizeRenderResult(vm, result);
    }
    return [];
}

function invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue) {
    var _vm$cache4 = vm.cache,
        component = _vm$cache4.component,
        context = _vm$cache4.context;

    if (component.attributeChangedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}

var keys = Object.keys;
var freeze = Object.freeze;
var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;
var setPrototypeOf = Object.setPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var defineProperties = Object.defineProperties;

/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

var CtorToDefMap = new WeakMap();
var CAPS_REGEX = /[A-Z]/g;

// this symbol is a dev-mode artifact to sign the getter/setter per public property
// so we know if they are attempting to access or modify them during construction time.
var internal = Symbol();

function getComponentDef(Ctor) {
    if (CtorToDefMap.has(Ctor)) {
        return CtorToDefMap.get(Ctor);
    }
    assert.isTrue(Ctor.constructor, "Missing " + Ctor.name + ".constructor, " + Ctor.name + " should have a constructor property.");
    var name = Ctor.constructor && Ctor.constructor.name;
    assert.isTrue(name, "Missing " + Ctor.name + ".constructor.name, " + Ctor.name + ".constructor should have a name property.");
    var props = getPropsHash(Ctor);
    var attrs = getAttrsHash(props);
    var methods = getMethodsHash(Ctor);
    var observedAttrs = getObservedAttrsHash(Ctor, attrs);
    var def = {
        name: name,
        props: props,
        attrs: attrs,
        methods: methods,
        observedAttrs: observedAttrs
    };
    assert.block(function () {
        freeze(def);
        freeze(props);
        freeze(attrs);
        freeze(methods);
        freeze(observedAttrs);
    });
    CtorToDefMap.set(Ctor, def);
    return def;
}

function getPropsHash(target) {
    var props = target.publicProps || {};
    return keys(props).reduce(function (propsHash, propName) {
        // expanding the property definition
        propsHash[propName] = {
            initializer: props[propName],
            attrName: propName.replace(CAPS_REGEX, function (match) {
                return '-' + match.toLowerCase();
            })
        };
        assert.block(function () {
            freeze(propsHash[propName]);
        });
        // initializing getters and setters for each props on the target protype
        var getter = void 0;
        var setter = void 0;
        assert.block(function () {
            assert.invariant(!getOwnPropertyDescriptor(target.prototype, propName), "Invalid " + target.constructor.name + ".prototype." + propName + " definition, it cannot be defined if it is a public property.");
            getter = function getter() {
                assert.fail("Component <" + target.constructor.name + "> can not access to property " + propName + " during construction.");
            };
            setter = function setter() {
                assert.fail("Component <" + target.constructor.name + "> can not set a new value for property " + propName + ".");
            };
            defineProperty(getter, internal, { value: true, configurable: false, writtable: false, enumerable: false });
            defineProperty(setter, internal, { value: true, configurable: false, writtable: false, enumerable: false });
        });
        // setting up the descriptor for the public prop
        defineProperty(target.prototype, propName, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
        return propsHash;
    }, {});
}

function getAttrsHash(props) {
    return keys(props).reduce(function (attrsHash, propName) {
        attrsHash[props[propName].attrName] = {
            propName: propName
        };
        return attrsHash;
    }, {});
}

function getMethodsHash(target) {
    return (target.publicMethods || []).reduce(function (methodsHash, methodName) {
        methodsHash[methodName] = 1;
        assert.block(function () {
            assert.isTrue(typeof target.prototype[methodName] === 'function', "<" + target.constructor.name + ">." + methodName + " have to be a function.");
            freeze(target.prototype[methodName]);
            // setting up the descriptor for the public method
            defineProperty(target.prototype, methodName, {
                configurable: false,
                enumerable: false,
                writable: false
            });
        });
        return methodsHash;
    }, {});
}

function getObservedAttrsHash(target, attrs) {
    return (target.observedAttributes || []).reduce(function (observedAttributes, attrName) {
        observedAttributes[attrName] = 1;
        assert.block(function () {
            assert.isTrue(attrs[attrName], "Invalid attribute " + attrName + " in " + target + ".observedAttributes.");
        });
        return observedAttributes;
    }, {});
}

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ObjectPropertyToProxyMap = new WeakMap();
var ProxySet = new WeakSet();

function getter(target, name) {
    var value = target[name];
    if (isRendering) {
        subscribeToSetHook(vmBeingRendered, target, name);
    }
    return value && (typeof value === "undefined" ? "undefined" : _typeof$2(value)) === 'object' ? getPropertyProxy(value) : value;
}

function setter(target, name, value) {
    var oldValue = target[name];
    if (oldValue !== value) {
        target[name] = value;
        notifyListeners(target, name);
    }
    return true;
}

function _deleteProperty(target, name) {
    delete target[name];
    notifyListeners(target, name);
    return true;
}

var propertyProxyHandler = {
    get: function get(target, name) {
        return getter(target, name);
    },
    set: function set(target, name, newValue) {
        return setter(target, name, newValue);
    },
    deleteProperty: function deleteProperty(target, name) {
        return _deleteProperty(target, name);
    }
};

function getPropertyProxy(value) {
    if (value === null) {
        return null;
    }
    assert.isTrue((typeof value === "undefined" ? "undefined" : _typeof$2(value)) === "object", "perf-optimization: avoid calling this method for non-object value.");
    if (ProxySet.has(value)) {
        return value;
    }

    if (ObjectPropertyToProxyMap.has(value)) {
        return ObjectPropertyToProxyMap.get(value);
    }
    var proxy = new Proxy(value, propertyProxyHandler);
    ObjectPropertyToProxyMap.set(value, proxy);
    ProxySet.add(proxy);
    return proxy;
}

function hookComponentLocalProperty(vm, propName) {
    assert.vm(vm);
    var _vm$cache = vm.cache,
        component = _vm$cache.component,
        privates = _vm$cache.privates;

    var descriptor = getOwnPropertyDescriptor(component, propName);
    var get = descriptor.get,
        set = descriptor.set,
        configurable = descriptor.configurable;

    assert.block(function () {
        if (get || set || !configurable) {
            console.warn("component " + vm + " has a defined property " + propName + " that cannot be watched for changes.");
        }
    });
    if (configurable && !get && !set) {
        var value = descriptor.value,
            enumerable = descriptor.enumerable,
            writtable = descriptor.writtable;

        privates[propName] = value && (typeof value === "undefined" ? "undefined" : _typeof$2(value)) === 'object' ? getPropertyProxy(value) : value;
        defineProperty(component, propName, {
            get: function get() {
                return getter(privates, propName);
            },
            set: function set(newValue) {
                return setter(privates, propName, newValue);
            },
            configurable: configurable,
            enumerable: enumerable,
            writtable: writtable
        });
    }
}

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function hookComponentReflectiveProperty(vm, propName) {
    var _vm$cache = vm.cache,
        component = _vm$cache.component,
        cmpProps = _vm$cache.cmpProps,
        publicPropsConfig = _vm$cache.def.props;

    assert.block(function () {
        var target = getPrototypeOf(component);

        var _ref = getOwnPropertyDescriptor(component, propName) || getOwnPropertyDescriptor(target, propName),
            get = _ref.get,
            set = _ref.set;

        assert.invariant(get[internal] && set[internal], "component " + vm + " has tampered with property " + propName + " during construction.");
    });
    defineProperty(component, propName, {
        get: function get() {
            var value = cmpProps[propName];
            if (isRendering) {
                subscribeToSetHook(vmBeingRendered, cmpProps, propName);
            }
            return value && (typeof value === "undefined" ? "undefined" : _typeof$1(value)) === 'object' ? getPropertyProxy(value) : value;
        },
        set: function set(newValue) {
            assert.invariant(false, "Property " + propName + " of " + vm + " cannot be set to " + newValue + " because it is a public property controlled by the owner element.");
        },
        configurable: true,
        enumerable: true
    });
    // this guarantees that the default value is always in place before anything else.
    var initializer = publicPropsConfig[propName].initializer;

    var defaultValue = typeof initializer === 'function' ? initializer() : initializer;
    cmpProps[propName] = defaultValue;
}

function initComponentProps(vm) {
    assert.vm(vm);
    var cache = vm.cache;
    var component = cache.component,
        cmpProps = cache.cmpProps,
        _cache$def = cache.def,
        publicPropsConfig = _cache$def.props,
        observedAttrs = _cache$def.observedAttrs;
    // reflective properties

    for (var propName in publicPropsConfig) {
        hookComponentReflectiveProperty(vm, propName);
    }
    // non-reflective properties
    getOwnPropertyNames(component).forEach(function (propName) {
        if (propName in publicPropsConfig) {
            return;
        }
        hookComponentLocalProperty(vm, propName);
    });

    // notifying observable attributes if they are initialized with default or custom value
    for (var _propName in publicPropsConfig) {
        var attrName = publicPropsConfig[_propName].attrName;

        var defaultValue = cmpProps[_propName];
        // default value is an engine abstraction, and therefore should be treated as a regular
        // attribute mutation process, and therefore notified.
        if (defaultValue !== undefined && observedAttrs[attrName]) {
            invokeComponentAttributeChangedCallback(vm, attrName, undefined, defaultValue);
        }
    }
}

function clearListeners(vm) {
    assert.vm(vm);
    var listeners = vm.cache.listeners;

    listeners.forEach(function (propSet) {
        return propSet.delete(vm);
    });
    listeners.clear();
}

function updateComponentProp(vm, propName, newValue) {
    assert.vm(vm);
    var cache = vm.cache;
    var cmpProps = cache.cmpProps,
        _cache$def2 = cache.def,
        publicPropsConfig = _cache$def2.props,
        observedAttrs = _cache$def2.observedAttrs;

    assert.invariant(!isRendering, vm + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    if (!config) {
        // TODO: ignore any native html property
        console.warn("Updating unknown property " + propName + " of " + vm + ". This property will be a pass-thru to the DOM element.");
    }
    if (newValue === undefined && config) {
        // default prop value computed when needed
        var initializer = config[propName].initializer;
        newValue = typeof initializer === 'function' ? initializer() : initializer;
    }
    var oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        if (config) {
            var attrName = config.attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        console.log("Marking " + vm + " as dirty: property \"" + propName + "\" set to a new value.");
        if (!cache.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function resetComponentProp(vm, propName) {
    assert.vm(vm);
    var cache = vm.cache;
    var cmpProps = cache.cmpProps,
        _cache$def3 = cache.def,
        publicPropsConfig = _cache$def3.props,
        observedAttrs = _cache$def3.observedAttrs;

    assert.invariant(!isRendering, vm + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    var oldValue = cmpProps[propName];
    var newValue = undefined;
    if (!config) {
        // TODO: ignore any native html property
        console.warn("Resetting unknown property " + propName + " of " + vm + ". This property will be a pass-thru to the DOM element.");
    } else {
        var initializer = config[propName].initializer;
        newValue = typeof initializer === 'function' ? initializer() : initializer;
    }
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        if (config) {
            var attrName = config.attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        console.log("Marking " + vm + " as dirty: property \"" + propName + "\" set to its default value.");
        if (!cache.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function updateComponentSlots(vm, newSlots) {
    // TODO: in the future, we can optimize this more, and only
    // set as dirty if the component really need slots, and if the slots has changed.
    console.log("Marking " + vm + " as dirty: [slotset] value changed.");
    if (!vm.cache.isDirty) {
        markComponentAsDirty(vm);
    }
}

function createComponent(vm) {
    assert.vm(vm);
    assert.invariant(vm.elm instanceof HTMLElement, 'Component creation requires a DOM element to be associated to it.');
    var Ctor = vm.Ctor,
        sel = vm.sel;

    console.log("<" + Ctor.name + "> is being initialized.");
    var def = getComponentDef(Ctor);
    var cache = {
        isScheduled: false,
        isDirty: true,
        def: def,
        context: {},
        privates: {},
        cmpProps: {},
        component: null,
        fragment: undefined,
        shadowRoot: null,
        listeners: new Set()
    };
    assert.block(function () {
        var proto = {
            toString: function toString() {
                return "<" + sel + ">";
            }
        };
        setPrototypeOf(vm, proto);
    });
    vm.cache = cache;
    cache.component = invokeComponentConstructor(vm);
    initComponentProps(vm);
}

function renderComponent(vm) {
    assert.vm(vm);
    var cache = vm.cache;

    assert.invariant(cache.isDirty, "Component " + vm + " is not dirty.");
    console.log(vm + " is being updated.");
    clearListeners(vm);
    var vnodes = invokeComponentRenderMethod(vm);
    cache.isDirty = false;
    cache.fragment = vnodes;
    assert.invariant(Array.isArray(vnodes), 'Render should always return an array of vnodes instead of ${children}');
}

function destroyComponent(vm) {
    assert.vm(vm);
    clearListeners(vm);
}

function markComponentAsDirty(vm) {
    assert.vm(vm);
    assert.isFalse(vm.cache.isDirty, "markComponentAsDirty(" + vm + ") should not be called when the componet is already dirty.");
    assert.isFalse(isRendering, "markComponentAsDirty(" + vm + ") cannot be called during rendering.");
    vm.cache.isDirty = true;
}

var ComponentToVMMap = new WeakMap();

function setLinkedVNode(component, vm) {
    assert.vm(vm);
    assert.isTrue(vm.elm instanceof HTMLElement, "Only DOM elements can be linked to their corresponding component.");
    ComponentToVMMap.set(component, vm);
}

function getLinkedVNode(component) {
    assert.isTrue(component);
    // note to self: we fallback to `vmBeingCreated` in case users
    // invoke something during the constructor execution, in which
    // case this mapping hasn't been stable yet, but we know that's
    // the only case.
    var vm = ComponentToVMMap.get(component) || vmBeingCreated;
    assert.invariant(vm, "There have to be a VM associated to component " + component + ".");
    return vm;
}

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode, vnode) {
    var Ctor = vnode.Ctor,
        cache = vnode.cache;

    if (!Ctor || cache) {
        return;
    }
    assert.vm(vnode);
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    assert.invariant(vnode.elm, vnode + ".elm should be ready.");
    if (oldVnode.Ctor === Ctor && oldVnode.cache) {
        assert.block(function () {
            setPrototypeOf(vnode, getPrototypeOf(oldVnode));
        });
        vnode.cache = oldVnode.cache;
    } else {
        createComponent(vnode);
        console.log("Component for " + vnode + " was created.");
    }
    assert.invariant(vnode.cache.component, "vm " + vnode + " should have a component and element associated to it.");
    // TODO: extension point for locker to add or remove identity to each DOM element.
    setLinkedVNode(vnode.cache.component, vnode);
}

var componentInit = {
    create: initializeComponent,
    update: initializeComponent
};

function syncProps(oldVnode, vnode) {
    var cache = vnode.cache;

    if (!cache) {
        return;
    }

    var oldProps = oldVnode.data._props;
    var newProps = vnode.data._props;

    var key = void 0,
        cur = void 0;

    // infuse key-value pairs from _props into the component
    if (oldProps !== newProps && (oldProps || newProps)) {
        oldProps = oldProps || {};
        newProps = newProps || {};
        // removed props should be reset in component's props
        for (key in oldProps) {
            if (!(key in newProps)) {
                resetComponentProp(vnode, key);
            }
        }

        // new or different props should be set in component's props
        for (key in newProps) {
            cur = newProps[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                updateComponentProp(vnode, key, cur);
            }
        }
    }

    // reflection of component props into data.props for the regular diffing algo
    var props = vnode.data.props;

    assert.invariant(Object.getOwnPropertyNames(props).length === 0, 'vnode.data.props should be an empty object.');
    Object.assign(props, cache.cmpProps);
}

var componentProps = {
    create: syncProps,
    update: syncProps
};

function update(oldvnode, vnode) {
    if (!vnode.cache) {
        return;
    }
    var oldSlotset = oldvnode.data.slotset;
    var slotset = vnode.data.slotset;

    if (!oldSlotset && !slotset) {
        return;
    }
    if (oldSlotset === slotset) {
        return;
    }
    updateComponentSlots(vnode, slotset);
}

var componentSlotset = {
    create: update,
    update: update
};

function syncClassNames(oldVnode, vnode) {
    var cache = vnode.cache;

    if (!cache) {
        return;
    }

    var oldClass = oldVnode.data._class;
    var klass = vnode.data._class;
    var classList = cache.component.classList;

    // propagating changes from "data->_class" into component's classList

    if (klass !== oldClass) {
        oldClass = (oldClass || '').split(' ');
        klass = (klass || '').split(' ');

        for (var i = 0; i < oldClass.length; i += 1) {
            var className = oldClass[i];
            if (classList.contains(className)) {
                classList.remove(className);
            }
        }
        for (var _i = 0; _i < klass.length; _i += 1) {
            var _className = klass[_i];
            if (!classList.contains(_className)) {
                classList.add(_className);
            }
        }
    }
}

var componentClassList = {
    create: syncClassNames,
    update: syncClassNames
};

function rerender(oldVnode, vnode) {
    var cache = vnode.cache;

    if (!cache) {
        return;
    }
    var children = vnode.children;
    // if diffing against an empty element, it means vnode was created and
    // has never been rendered. an immidiate rehydration is
    // needed otherwise the children are not going to be populated.

    if (oldVnode.sel === '') {
        assert.invariant(cache.isDirty, vnode + " should be dirty after creation");
        assert.invariant(cache.fragment === undefined, vnode + " should not have a fragment after creation");
        rehydrate(vnode);
        // avoiding the rest of this diffing entirely because it happens already in rehydrate
        var oldCh = oldVnode.children;

        oldCh.splice(0, oldCh.length).push.apply(oldCh, cache.fragment);
        // TODO: this is a fork of the fiber since the create hook is called during a
        // patching process. How can we optimize this to reuse the same queue?
        // and idea is to do this part in the next turn (a la fiber)
        // PR https://github.com/snabbdom/snabbdom/pull/234 might help.
    } else if (cache.isDirty) {
        assert.invariant(oldVnode.children !== children, "If component is dirty, the children collections must be different. In theory this should never happen.");
        renderComponent(vnode);
    }
    // replacing the vnodes in the children array without replacing the array itself
    // because the engine has a hard reference to the original array object.
    children.splice(0, children.length).push.apply(children, cache.fragment);
}

var componentChildren = {
    create: rerender,
    update: rerender
};

function update$1(oldVnode, vnode) {
    var oldProps = oldVnode.data.props;
    var props = vnode.data.props;

    if (!oldProps && !props) {
        return;
    }
    if (oldProps === props) {
        return;
    }

    oldProps = oldProps || {};
    props = props || {};

    var key = void 0,
        cur = void 0,
        old = void 0;
    var elm = vnode.elm;


    for (key in oldProps) {
        if (!props[key]) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                assert.block(function () {
                    if (elm[key] === cur) {
                        console.warn("unneccessary update of element " + elm + ", property " + key + " for " + vnode + ".");
                    }
                });
                elm[key] = cur;
            }
        }
    }
}

var props = {
    create: update$1,
    update: update$1
};

var htmldomapi = createCommonjsModule(function (module) {
function createElement(tagName) {
  return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName) {
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child) {
  node.removeChild(child);
}

function appendChild(node, child) {
  node.appendChild(child);
}

function parentNode(node) {
  return node.parentElement;
}

function nextSibling(node) {
  return node.nextSibling;
}

function tagName(node) {
  return node.tagName;
}

function setTextContent(node, text) {
  node.textContent = text;
}

module.exports = {
  createElement: createElement,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
};
});

var htmldomapi$1 = interopDefault(htmldomapi);
var createElement$1 = htmldomapi.createElement;
var createElementNS = htmldomapi.createElementNS;
var createTextNode = htmldomapi.createTextNode;
var appendChild = htmldomapi.appendChild;
var removeChild = htmldomapi.removeChild;
var insertBefore = htmldomapi.insertBefore;
var parentNode = htmldomapi.parentNode;
var nextSibling = htmldomapi.nextSibling;
var tagName = htmldomapi.tagName;
var setTextContent = htmldomapi.setTextContent;

var require$$0 = Object.freeze({
  default: htmldomapi$1,
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
});

var snabbdom = createCommonjsModule(function (module) {
// jshint newcap: false
/* global require, module, document, Node */
'use strict';

var VNode = interopDefault(require$$2);
var is = interopDefault(require$$1);
var domApi = interopDefault(require$$0);

function isUndef(s) {
  return s === undefined;
}
function isDef(s) {
  return s !== undefined;
}

var emptyNode = VNode('', {}, [], undefined, undefined);

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i,
      map = {},
      key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules, api) {
  var i,
      j,
      cbs = {};

  if (isUndef(api)) api = domApi;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function emptyNodeAt(elm) {
    var id = elm.id ? '#' + elm.id : '';
    var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
    return VNode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    return function () {
      if (--listeners === 0) {
        var parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode, insertedVnodeQueue) {
    var i,
        data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }
    var elm,
        children = vnode.children,
        sel = vnode.sel;
    if (isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag) : api.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      for (i = 0; i < cbs.create.length; ++i) {
        cbs.create[i](emptyNode, vnode);
      }i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = api.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i,
        j,
        data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode);
      }if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i,
          listeners,
          rm,
          ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (i = 0; i < cbs.remove.length; ++i) {
            cbs.remove[i](ch, rm);
          }if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else {
          // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    var oldStartIdx = 0,
        newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) {
          // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined;
          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    var i, hook;
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm,
        oldCh = oldVnode.children,
        ch = vnode.children;
    if (oldVnode === vnode) return;
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = api.parentNode(oldVnode.elm);
      elm = createElm(vnode, insertedVnodeQueue);
      api.insertBefore(parentElm, elm, oldVnode.elm);
      removeVnodes(parentElm, [oldVnode], 0, 0);
      return;
    }
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode);
      }i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  return function (oldVnode, vnode) {
    var i, elm, parent;
    var insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) {
      cbs.pre[i]();
    }if (isUndef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode);
    }

    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);

      createElm(vnode, insertedVnodeQueue);

      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    for (i = 0; i < cbs.post.length; ++i) {
      cbs.post[i]();
    }return vnode;
  };
}

module.exports = { init: init };
});

interopDefault(snabbdom);
var init = snabbdom.init;

var attributes = createCommonjsModule(function (module) {
var NamespaceURIs = {
  "xlink": "http://www.w3.org/1999/xlink"
};

var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare", "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable", "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple", "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly", "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate", "truespeed", "typemustmatch", "visible"];

var booleanAttrsDict = Object.create(null);
for (var i = 0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode, vnode) {
  var key,
      cur,
      old,
      elm = vnode.elm,
      oldAttrs = oldVnode.data.attrs,
      attrs = vnode.data.attrs,
      namespaceSplit;

  if (!oldAttrs && !attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      if (!cur && booleanAttrsDict[key]) elm.removeAttribute(key);else {
        namespaceSplit = key.split(":");
        if (namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0])) elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);else elm.setAttribute(key, cur);
      }
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

module.exports = { create: updateAttrs, update: updateAttrs };
});

var attrs = interopDefault(attributes);

var style = createCommonjsModule(function (module) {
var raf = typeof window !== 'undefined' && window.requestAnimationFrame || setTimeout;
var nextFrame = function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
};

function setNextFrame(obj, prop, val) {
  nextFrame(function () {
    obj[prop] = val;
  });
}

function updateStyle(oldVnode, vnode) {
  var cur,
      name,
      elm = vnode.elm,
      oldStyle = oldVnode.data.style,
      style = vnode.data.style;

  if (!oldStyle && !style) return;
  oldStyle = oldStyle || {};
  style = style || {};
  var oldHasDel = 'delayed' in oldStyle;

  for (name in oldStyle) {
    if (!style[name]) {
      elm.style[name] = '';
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name];
        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
          setNextFrame(elm.style, name, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      elm.style[name] = cur;
    }
  }
}

function applyDestroyStyle(vnode) {
  var style,
      name,
      elm = vnode.elm,
      s = vnode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  var name,
      elm = vnode.elm,
      idx,
      i = 0,
      maxDur = 0,
      compStyle,
      style = s.remove,
      amount = 0,
      applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener('transitionend', function (ev) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

module.exports = { create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle };
});

var style$1 = interopDefault(style);

var dataset = createCommonjsModule(function (module) {
function updateDataset(oldVnode, vnode) {
  var elm = vnode.elm,
      oldDataset = oldVnode.data.dataset,
      dataset = vnode.data.dataset,
      key;

  if (!oldDataset && !dataset) return;
  oldDataset = oldDataset || {};
  dataset = dataset || {};

  for (key in oldDataset) {
    if (!dataset[key]) {
      delete elm.dataset[key];
    }
  }
  for (key in dataset) {
    if (oldDataset[key] !== dataset[key]) {
      elm.dataset[key] = dataset[key];
    }
  }
}

module.exports = { create: updateDataset, update: updateDataset };
});

var dataset$1 = interopDefault(dataset);

var eventlisteners = createCommonjsModule(function (module) {
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function invokeHandler(handler, vnode, event) {
  if (typeof handler === "function") {
    // call function handler
    handler.call(vnode, event, vnode);
  } else if ((typeof handler === "undefined" ? "undefined" : _typeof(handler)) === "object") {
    // call handler with arguments
    if (typeof handler[0] === "function") {
      // special case for single argument for performance
      if (handler.length === 2) {
        handler[0].call(vnode, handler[1], event, vnode);
      } else {
        var args = handler.slice(1);
        args.push(event);
        args.push(vnode);
        handler[0].apply(vnode, args);
      }
    } else {
      // call multiple handlers
      for (var i = 0; i < handler.length; i++) {
        invokeHandler(handler[i]);
      }
    }
  }
}

function handleEvent(event, vnode) {
  var name = event.type,
      on = vnode.data.on;

  // call event handler(s) if exists
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event);
  }
}

function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode);
  };
}

function updateEventListeners(oldVnode, vnode) {
  var oldOn = oldVnode.data.on,
      oldListener = oldVnode.listener,
      oldElm = oldVnode.elm,
      on = vnode && vnode.data.on,
      elm = vnode && vnode.elm,
      name;

  // optimization for reused immutable handlers
  if (oldOn === on) {
    return;
  }

  // remove existing listeners which no longer used
  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      for (name in oldOn) {
        // remove listener if element was changed or existing listeners removed
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        // remove listener if existing listener removed
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }

  // add new listeners which has not already attached
  if (on) {
    // reuse existing listener or create new
    var listener = vnode.listener = oldVnode.listener || createListener();
    // update vnode for listener
    listener.vnode = vnode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

module.exports = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
};
});

var on = interopDefault(eventlisteners);

var globalRenderedCallbacks = [];

var patch = init([componentInit, componentClassList, componentSlotset, componentProps, componentChildren, props, attrs, style$1, dataset$1, className, on]);

function rehydrate(vm) {
    assert.vm(vm);
    var cache = vm.cache;

    assert.isTrue(vm.elm instanceof HTMLElement, "rehydration can only happen after " + vm + " was patched the first time.");
    if (cache.isDirty) {
        var oldVnode = getLinkedVNode(cache.component);
        var sel = oldVnode.sel,
            Ctor = oldVnode.Ctor,
            _oldVnode$data = oldVnode.data,
            key = _oldVnode$data.key,
            slotset = _oldVnode$data.slotset,
            _dataset = _oldVnode$data.dataset,
            _props = _oldVnode$data._props,
            _on = _oldVnode$data._on,
            _class = _oldVnode$data._class,
            children = oldVnode.children;

        assert.invariant(Array.isArray(children), 'Rendered vm ${vm}.children should always have an array of vnodes instead of ${children}');
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode with the exact same data was used
        // to patch this vm the last time, mimic what happen when the
        // owner re-renders.
        var vnode = c(sel, Ctor, {
            key: key,
            slotset: slotset,
            dataset: _dataset,
            props: _props,
            on: _on,
            class: _class
        });
        patch(oldVnode, vnode);
    }
    cache.isScheduled = false;
}

function scheduleRehydration(vm) {
    assert.vm(vm);
    var cache = vm.cache;

    if (!cache.isScheduled) {
        cache.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch(function (error) {
            assert.fail("Error attempting to rehydrate component " + vm + ": " + error.message);
        });
    }
}

var hook = {
    insert: function insert(vm) {
        assert.vm(vm);
        if (vm.cache.component.connectedCallback) {
            invokeComponentConnectedCallback(vm);
        }
        console.log("vnode \"" + vm + "\" was inserted.");
    },
    post: function post() {
        // This hook allows us to resolve a promise after the current patching
        // process has concluded and all elements are in the DOM.
        // TODO: we don't have that user-land API just yet, but eventually we will
        // have it to support something like `element.focus()`;
        var len = globalRenderedCallbacks.length;
        for (var i = 0; i < len; i += 1) {
            var callback = globalRenderedCallbacks.shift();
            // TODO: do we need to set and restore context around this callback?
            callback();
        }
    },
    destroy: function destroy(vm) {
        assert.vm(vm);
        if (vm.cache.component.disconnectedCallback) {
            invokeComponentDisconnectedCallback(vm);
        }
        if (vm.cache.listeners.size > 0) {
            destroyComponent(vm);
        }
        console.log("vnode \"" + vm + "\" was destroyed.");
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Ep = Element.prototype;
var CAMEL_REGEX = /-([a-z])/g;

function linkAttributes(element, vm) {
    assert.vm(vm);
    var cache = vm.cache;
    var attrs = cache.def.attrs;
    // replacing mutators on the element itself to catch any mutation

    element.setAttribute = function (attrName, value) {
        Ep.setAttribute.call(element, attrName, value);
        var attrConfig = attrs[attrName.toLocaleLowerCase()];
        if (attrConfig) {
            updateComponentProp(vm, attrConfig.propName, value);
            if (cache.isDirty) {
                console.log("Scheduling " + vm + " for rehydration.");
                scheduleRehydration(vm);
            }
        }
    };
    element.removeAttribute = function (attrName) {
        Ep.removeAttribute.call(element, attrName);
        var attrConfig = attrs[attrName.toLocaleLowerCase()];
        if (attrConfig) {
            resetComponentProp(vm, attrConfig.propName);
            if (cache.isDirty) {
                console.log("Scheduling " + vm + " for rehydration.");
                scheduleRehydration(vm);
            }
        }
    };
}

function linkProperties(element, vm) {
    assert.vm(vm);
    var Ctor = vm.Ctor,
        cache = vm.cache;
    var component = cache.component;

    var _getComponentDef = getComponentDef(Ctor),
        props = _getComponentDef.props,
        methods = _getComponentDef.methods;

    var descriptors = {};
    // linking public methods

    var _loop = function _loop(methodName) {
        descriptors[methodName] = {
            value: function value() {
                return component[methodName].apply(component, arguments);
            },
            configurable: false,
            writable: false,
            enumerable: false
        };
    };

    for (var methodName in methods) {
        _loop(methodName);
    }
    // linking reflective properties

    var _loop2 = function _loop2(propName) {
        descriptors[propName] = {
            get: function get() {
                return component[propName];
            },
            set: function set(newValue) {
                updateComponentProp(vm, propName, newValue);
                if (cache.isDirty) {
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            },
            configurable: false,
            enumerable: true
        };
    };

    for (var propName in props) {
        _loop2(propName);
    }
    defineProperties(element, descriptors);
}

function createVM(element, Ctor, data) {
    var tagName = element.tagName.toLowerCase();
    var vm = c(tagName, Ctor, data);
    return patch(element, vm);
}

function getInitialProps(element, Ctor) {
    var _getComponentDef2 = getComponentDef(Ctor),
        config = _getComponentDef2.props;

    var props = {};
    for (var propName in config) {
        if (propName in element) {
            props[propName] = element[propName];
        }
    }
    if (element.hasAttributes()) {
        // looking for custom attributes that are not reflectives by default
        var attrs = element.attributes;
        for (var i = attrs.length - 1; i >= 0; i--) {
            var _propName = attrs[i].name.replace(CAMEL_REGEX, function (g) {
                return g[1].toUpperCase();
            });
            if (!(_propName in props) && _propName in config) {
                props[_propName] = attrs[i].value;
            }
        }
    }
    return props;
}

function getInitialSlots(element, Ctor) {
    // TODO: implement algo to resolve slots
    return undefined;
}

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element, Ctor) {
    if (!Ctor) {
        throw new TypeError("Invalid Component Definition: " + Ctor + ".");
    }
    var props = getInitialProps(element, Ctor);
    var slotset = getInitialSlots(element, Ctor);
    var vm = createVM(element, Ctor, { _props: props, slotset: slotset });
    linkAttributes(element, vm);
    // TODO: for vm with element we might not need to do any of these.
    linkProperties(element, vm);
    return vm.cache.component;
}

function upgrade(element, CtorOrPromise) {
    return new Promise(function (resolve, reject) {
        assert.isTrue(element instanceof HTMLElement, "upgrade() first argument should be a DOM Element instead of " + element + ".");
        var p = Promise.resolve(CtorOrPromise);
        p.then(function (Ctor) {
            upgradeElement(element, Ctor);
            resolve(element);
        }, reject);
    });
}

var definedElements = {};

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is a string and there is a registered WC,
 * then we fallback to the normal Web-Components workflow.
 * If the value of `is` attribute is a string and there is not a registered WC,
 * or the value of `is` attribute is not set at all, then we attempt to resolve
 * it from the registry.
 */
function createElement(tagName, options) {
    var CtorPromise = void 0;
    var is = options && options.is && options.is;
    if (is) {
        if (typeof is === 'function') {
            CtorPromise = Promise.resolve(is);
            options = undefined;
        } else if (typeof is === 'string' && !(is in definedElements)) {
            // it must be a component, lets derivate the namespace from `is`,
            // where only the first `-` should be replaced
            CtorPromise = loaderImportMethod(is.toLowerCase().replace('-', ':'));
            options = undefined;
        }
    } else if (!(tagName in definedElements)) {
        // it must be a component, lets derivate the namespace from tagName,
        // where only the first `-` should be replaced
        CtorPromise = loaderImportMethod(tagName.toLowerCase().replace('-', ':'));
    }
    var element = document.createElement(tagName, options);
    if (!CtorPromise || !(element instanceof HTMLElement)) {
        return element;
    }
    // TODO: maybe a local hash of resolved modules to speed things up.
    upgrade(element, CtorPromise).catch(function (e) {
        console.error("Error trying to upgrade element <" + element.tagName.toLowerCase() + ">. " + e);
    });
    return element;
}

try {
    if ((typeof customElements === "undefined" ? "undefined" : _typeof(customElements)) !== undefined && customElements.define) {
        (function () {
            var defineOriginal = customElements.define;
            customElements.define = function (tagName) {
                defineOriginal.call.apply(defineOriginal, [this].concat(Array.prototype.slice.call(arguments)));
                definedElements[tagName] = undefined;
            };
        })();
    }
} catch (e) {
    console.warn("customElements.define cannot be redefined. " + e);
}

// special hook for forcing to render() the component:
//
//      import { set } from "...";
//      set(this.foo, "bar", 1); // sets this.foo.bar = 1; and resolves side effects of this assignment
//
function set(obj, propName, newValue) {
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the property " + propName + " of " + obj + ". You cannot call set(...) during the render phase.");
    obj[propName] = newValue;
    assert.block(function () {
        console.log("set(" + obj + ", \"" + propName + "\", " + newValue + ") was invoked.");
    });
    notifyListeners(obj, propName);
    // TODO: we might want to let them know if the set triggered the rehydration or not somehow
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INTERNAL_SLOT_VM = Symbol();
var INTERNAL_LIST = Symbol();

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
var ClassList = function () {
    function ClassList(vm) {
        _classCallCheck$1(this, ClassList);

        this[INTERNAL_SLOT_VM] = vm;
        this[INTERNAL_LIST] = [];
    }

    _createClass$1(ClassList, [{
        key: "add",
        value: function add() {
            var _this = this;

            var list = this[INTERNAL_LIST];
            // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.

            for (var _len = arguments.length, classNames = Array(_len), _key = 0; _key < _len; _key++) {
                classNames[_key] = arguments[_key];
            }

            classNames.forEach(function (className) {
                var pos = list.indexOf(className);
                if (pos === -1) {
                    list.push(className);
                    var vm = _this[INTERNAL_SLOT_VM];
                    updateComponentProp(vm, 'className', list.join(' '));
                    if (vm.cache.isDirty) {
                        console.log("Scheduling " + vm + " for rehydration.");
                        scheduleRehydration(vm);
                    }
                }
            });
        }
    }, {
        key: "remove",
        value: function remove() {
            var _this2 = this;

            var list = this[INTERNAL_LIST];
            // Remove specified class values.

            for (var _len2 = arguments.length, classNames = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                classNames[_key2] = arguments[_key2];
            }

            classNames.forEach(function (className) {
                var pos = list.indexOf(className);
                if (pos >= 0) {
                    list.splice(pos, 1);
                    var vm = _this2[INTERNAL_SLOT_VM];
                    if (list.length) {
                        updateComponentProp(vm, 'className', list.join(' '));
                    } else {
                        resetComponentProp(vm, 'className');
                    }
                    if (vm.cache.isDirty) {
                        console.log("Scheduling " + vm + " for rehydration.");
                        scheduleRehydration(vm);
                    }
                }
            });
        }
    }, {
        key: "item",
        value: function item(index) {
            var list = this[INTERNAL_LIST];
            // Return class value by index in collection.
            return list[index] || null;
        }
    }, {
        key: "toggle",
        value: function toggle(className, force) {
            var list = this[INTERNAL_LIST];
            // When only one argument is present: Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and return true.
            var pos = list.indexOf(className);
            // When a second argument is present: If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
            if (arguments.length > 1) {
                if (force && pos === -1) {
                    this.add(className);
                } else if (!force && pos >= 0) {
                    this.remove(className);
                }
                return !!force;
            }
            if (pos) {
                this.remove(className);
                return false;
            }
            this.add(className);
            return true;
        }
    }, {
        key: "contains",
        value: function contains(className) {
            var list = this[INTERNAL_LIST];
            // Checks if specified class value exists in class attribute of the element.
            return list.indexOf(className) >= 0;
        }
    }, {
        key: "toString",
        value: function toString() {
            var list = this[INTERNAL_LIST];
            return list.join(' ');
        }
    }]);

    return ClassList;
}();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTMLElementPropsTheGoodParts = ["tagName"];
var HTMLElementMethodsTheGoodParts = ["querySelector", "querySelectorAll", "addEventListener"];

var PlainHTMLElement = function () {
    function PlainHTMLElement() {
        _classCallCheck(this, PlainHTMLElement);

        assert.vm(vmBeingCreated, "Invalid creation patch for " + this + " who extends HTMLElement. It expects a vm, instead received " + vmBeingCreated + ".");
        Object.defineProperties(this, {
            classList: {
                value: new ClassList(vmBeingCreated),
                writable: false,
                configurable: false,
                enumerable: true
            }
        });
    }

    _createClass(PlainHTMLElement, [{
        key: "dispatchEvent",
        value: function dispatchEvent(event) {
            var vm = getLinkedVNode(this);
            assert.vm(vm);
            var elm = vm.elm;
            // custom elements will rely on the DOM dispatchEvent mechanism

            assert.isTrue(elm instanceof HTMLElement, "Invalid association between component " + this + " and element " + elm + ".");
            return elm.dispatchEvent(event);
        }
    }]);

    return PlainHTMLElement;
}();

// One time operation to expose the good parts of the web component API,
// in terms of methods and properties:


HTMLElementMethodsTheGoodParts.reduce(function (proto, methodName) {
    proto[methodName] = function () {
        var vm = getLinkedVNode(this);
        assert.vm(vm);
        var elm = vm.elm;

        assert.isTrue(elm instanceof HTMLElement, "Invalid association between component " + this + " and element " + elm + " when calling method " + methodName + ".");
        return elm[methodName].apply(elm, arguments);
    };
    return proto;
}, PlainHTMLElement.prototype);

HTMLElementPropsTheGoodParts.reduce(function (proto, propName) {
    defineProperty(proto, propName, {
        get: function get() {
            var element = getLinkedVNode(this);
            assert.isTrue(element instanceof HTMLElement, "Invalid association between component " + this + " and element " + element + " when accessing member property @{propName}.");
            return element[propName];
        },
        enumerable: true,
        configurable: false
    });
    return proto;
}, PlainHTMLElement.prototype);



var Main = Object.freeze({
	loaderImportMethodTemporary: loaderImportMethod,
	defineTemporary: amdDefineMethod,
	createElement: createElement,
	set: set,
	getComponentDef: getComponentDef,
	HTMLElement: PlainHTMLElement
});

exports.loaderImportMethodTemporary = loaderImportMethod;
exports.defineTemporary = amdDefineMethod;
exports.createElement = createElement;
exports.set = set;
exports.getComponentDef = getComponentDef;
exports.HTMLElement = PlainHTMLElement;

// forcing the global define() function to be declared bound to raptor.
window.define = Raptor.defineTemporary;


}((this.Raptor = this.Raptor || {})));
/** version: 0.1.4 */
//# sourceMappingURL=raptor.js.map
