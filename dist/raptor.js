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
        assert.isTrue(_vm && "component" in _vm, _vm + " is not a vm.");
    },
    fail: function fail(msg) {
        throw new Error(msg);
    }
};

function updateClass(oldVnode, vnode) {
    var elm = vnode.elm;
    var oldClass = oldVnode.data.class;
    var klass = vnode.data.class;

    if (!klass && !oldClass) {
        return;
    }

    if (klass !== oldClass) {
        assert.block(function () {
            if (elm.className === (klass || '')) {
                console.warn('unneccessary update of element <' + vnode.sel + '>, property "className" for ' + (vnode.vm || vnode.sel) + '.');
            }
        });
        if (vnode.sel === 'svg') {
            elm.setAttribute('class', klass || '');
        } else {
            elm.className = klass || '';
        }
    }
}

var className = {
    create: updateClass,
    update: updateClass
};

var keys = Object.keys;
var freeze = Object.freeze;
var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var defineProperties = Object.defineProperties;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;

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
    var name = Ctor.name;
    assert.isTrue(name, Ctor + " should have a name property.");
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
            assert.invariant(!getOwnPropertyDescriptor(target.prototype, propName), "Invalid " + target.name + ".prototype." + propName + " definition, it cannot be defined if it is a public property.");
            getter = function getter() {
                assert.fail("Component <" + target.name + "> can not access to property " + propName + " during construction.");
            };
            setter = function setter() {
                assert.fail("Component <" + target.name + "> can not set a new value for property " + propName + ".");
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
            assert.isTrue(typeof target.prototype[methodName] === 'function', "<" + target.name + ">." + methodName + " have to be a function.");
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
            if (!attrs[attrName]) {
                console.warn("The corresponding public property for attribute " + attrName + " of " + target + ".observedAttributes is not declared in " + target.name + ".");
            }
        });
        return observedAttributes;
    }, {});
}

var TargetToPropsMap = new WeakMap();

function notifyListeners(target, key) {
    if (TargetToPropsMap.has(target)) {
        var PropNameToListenersMap = TargetToPropsMap.get(target);
        var set = PropNameToListenersMap.get(key);
        if (set) {
            set.forEach(function (vm) {
                assert.vm(vm);
                console.log("Marking " + vm + " as dirty: \"this." + key + "\" set to a new value.");
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            });
        }
    }
}

function subscribeToSetHook(vm, target, key) {
    assert.vm(vm);
    var PropNameToListenersMap = void 0;
    if (!TargetToPropsMap.has(target)) {
        PropNameToListenersMap = new Map();
        TargetToPropsMap.set(target, PropNameToListenersMap);
    } else {
        PropNameToListenersMap = TargetToPropsMap.get(target);
    }
    var set = PropNameToListenersMap.get(key);
    if (!set) {
        set = new Set();
        PropNameToListenersMap.set(key, set);
    }
    if (!set.has(vm)) {
        set.add(vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        vm.listeners.add(set);
    }
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var topLevelContextSymbol = Symbol('Top Level Context');

var currentContext = _defineProperty({}, topLevelContextSymbol, true);

function establishContext(ctx) {
    currentContext = ctx;
}

var lifeCycleHooks = {
    insert: function insert(vnode) {
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        if (vm.component.connectedCallback) {
            invokeComponentConnectedCallback(vm);
        }
        console.log("\"" + vm + "\" was inserted.");
    },
    destroy: function destroy(vnode) {
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        if (vm.component.disconnectedCallback) {
            invokeComponentDisconnectedCallback(vm);
        }
        if (vm.listeners.size > 0) {
            clearListeners(vm);
        }
        console.log("\"" + vm + "\" was destroyed.");
    }
};

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

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// [c]ustom element node
function c(sel, Ctor) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    assert.isFalse("attrs" in data, "Compiler Issue: Custom elements should not have property \"attrs\" in data.");
    var key = data.key,
        dataset = data.dataset,
        slotset = data.slotset,
        _props = data.props,
        on = data.on,
        _class = data.class;

    assert.isTrue(arguments.length < 4, "Compiler Issue: Custom elements expect up to 3 arguments, received " + arguments.length + " instead.");
    var vnode = h$1(sel, { hook: lifeCycleHooks, key: key, slotset: slotset, dataset: dataset, on: on, props: {}, _props: _props, _class: _class }, []);
    vnode.Ctor = Ctor;
    return vnode;
}

// [i]terable node
function i(items, factory) {
    var len = Array.isArray(items) ? items.length : 0;
    var list = new Array(len);

    var _loop = function _loop(_i) {
        var vnode = factory(items[_i], _i);
        list[_i] = vnode;
        assert.block(function () {
            var vnodes = Array.isArray(vnode) ? vnode : [vnode];
            vnodes.forEach(function (vnode) {
                if (vnode && (typeof vnode === "undefined" ? "undefined" : _typeof$2(vnode)) === 'object' && vnode.sel && vnode.Ctor && !vnode.key) {
                    console.warn("Invalid key attribute for element <" + vnode.sel + "> in iteration of " + items + " for index " + _i + " of " + len + ". Solution: You can set a \"key\" attribute to a unique value so the diffing algo can guarantee to preserve the internal state of the instance of " + vnode.Ctor.name + ".");
                }
            });
        });
    };

    for (var _i = 0; _i < len; _i += 1) {
        _loop(_i);
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

function wrapDOMNode(element) {
    // TODO: generalize this to support all kind of Nodes
    // TODO: instead of creating the h() directly, use toVNode() or something else from snabbdom
    // TODO: the element could be derivated from another raptor component, in which case we should
    // use the corresponding vnode instead
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
        if (elm instanceof Node) {
            vnodes[i] = wrapDOMNode(elm);
        }
        assert.isTrue(vnodes[i] && vnodes[i].sel, "Invalid element " + vnodes[i] + " returned in " + (i + 1) + " position when calling " + vm + ".render().");
    }
    return vnodes;
}

function invokeComponentConstructor(vm, Ctor) {
    var context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var component = new Ctor();
    establishContext(ctx);
    return component;
}

function invokeComponentDisconnectedCallback(vm) {
    var component = vm.component,
        context = vm.context;

    if (component.disconnectedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

function invokeComponentConnectedCallback(vm) {
    var component = vm.component,
        context = vm.context;

    if (component.connectedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.connectedCallback();
        establishContext(ctx);
    }
}

function invokeComponentRenderedCallback(vm) {
    var component = vm.component,
        context = vm.context;

    if (component.renderedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.renderedCallback();
        establishContext(ctx);
    }
}

function invokeComponentRenderMethod(vm) {
    var component = vm.component,
        context = vm.context,
        cmpSlots = vm.cmpSlots;

    if (component.render) {
        var ctx = currentContext;
        establishContext(context);
        var isRenderingInception = isRendering;
        var vmBeingRenderedInception = vmBeingRendered;
        isRendering = true;
        vmBeingRendered = vm;
        var result = component.render();
        // when the render method `return html;`, the factory has to be invoked
        // TODO: add identity to the html functions
        if (typeof result === 'function') {
            assert.block(function () {
                // TODO: validate that the slots provided via cmpSlots are allowed, this
                // will require the compiler to provide the list of allowed slots via metadata.
                // TODO: validate that the template properties provided via metadata are
                // defined properties of this component.
            });
            // TODO: cmpSlots should be a proxy to it so we can monitor what slot names are
            // accessed during the rendering method, so we can optimize the dirty checks for
            // changes in slots.
            result = result.call(undefined, api, component, cmpSlots);
        }
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
        establishContext(ctx);
        // the render method can return many different things, here we attempt to normalize it.
        return normalizeRenderResult(vm, result);
    }
    return [];
}

function invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue) {
    var component = vm.component,
        context = vm.context;

    if (component.attributeChangedCallback) {
        var ctx = currentContext;
        establishContext(context);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ObjectPropertyToProxyMap = new WeakMap();
var ProxySet = new WeakSet();

function getter(target, key) {
    var value = target[key];
    if (isRendering && vmBeingRendered) {
        subscribeToSetHook(vmBeingRendered, target, key);
    }
    return value && (typeof value === "undefined" ? "undefined" : _typeof$3(value)) === 'object' ? getPropertyProxy(value) : value;
}

function setter(target, key, value) {
    var oldValue = target[key];
    if (oldValue !== value) {
        target[key] = value;
        notifyListeners(target, key);
    }
    return true;
}

function _deleteProperty(target, key) {
    delete target[key];
    notifyListeners(target, key);
    return true;
}

var propertyProxyHandler = {
    get: function get(target, key) {
        return getter(target, key);
    },
    set: function set(target, key, newValue) {
        return setter(target, key, newValue);
    },
    deleteProperty: function deleteProperty(target, key) {
        return _deleteProperty(target, key);
    }
};

function getPropertyProxy(value) {
    if (value === null) {
        return value;
    }
    if (value instanceof Node) {
        assert.block(function () {
            console.warn("Storing references to DOM Nodes in general is discoraged. Instead, use querySelector and querySelectorAll to find the elements when needed. TODO: provide a link to the full explanation.");
        });
        return value;
    }
    assert.isTrue((typeof value === "undefined" ? "undefined" : _typeof$3(value)) === "object", "perf-optimization: avoid calling this method for non-object value.");
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

function hookComponentLocalProperty(vm, key) {
    assert.vm(vm);
    var component = vm.component,
        privates = vm.privates;

    var descriptor = getOwnPropertyDescriptor(component, key);
    var get = descriptor.get,
        set = descriptor.set,
        configurable = descriptor.configurable;

    assert.block(function () {
        if (get || set || !configurable) {
            // TODO: classList and dataset are only really ignored when extending HTMLElement,
            // we should take that into consideration on this condition at some point.
            if (key !== 'classList' && key !== 'dataset') {
                console.warn("component " + vm + " has a property key " + key + " that cannot be watched for changes.");
            }
        }
    });
    if (configurable && !get && !set) {
        var value = descriptor.value,
            enumerable = descriptor.enumerable,
            writtable = descriptor.writtable;

        privates[key] = value && (typeof value === "undefined" ? "undefined" : _typeof$3(value)) === 'object' ? getPropertyProxy(value) : value;
        defineProperty(component, key, {
            get: function get() {
                return getter(privates, key);
            },
            set: function set(newValue) {
                return setter(privates, key, newValue);
            },
            configurable: configurable,
            enumerable: enumerable,
            writtable: writtable
        });
    }
}

var ValidPropertyHTMLAttributeMap = {
    className: 'class'
};

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var renderedDuringCurrentCycleSet = new Set();

function hookComponentReflectiveProperty(vm, propName) {
    var component = vm.component,
        cmpProps = vm.cmpProps,
        publicPropsConfig = vm.def.props;

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
            if (isRendering && vmBeingRendered) {
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
    var config = publicPropsConfig[propName];
    cmpProps[propName] = getDefaultValueFromConfig(config);
}

function hookComponentPublicMethod(vm, methodName) {
    var component = vm.component,
        cmpProps = vm.cmpProps;

    defineProperty(cmpProps, methodName, {
        value: function value() {
            return component[methodName].apply(component, arguments);
        },
        configurable: false,
        writable: false,
        enumerable: true
    });
}

function createComponent(vm, Ctor) {
    assert.vm(vm);
    vm.component = invokeComponentConstructor(vm, Ctor);
}

function initComponent(vm) {
    assert.vm(vm);
    var component = vm.component,
        cmpProps = vm.cmpProps,
        _vm$def = vm.def,
        publicPropsConfig = _vm$def.props,
        publicMethodsConfig = _vm$def.methods,
        observedAttrs = _vm$def.observedAttrs;
    // reflective properties

    for (var propName in publicPropsConfig) {
        hookComponentReflectiveProperty(vm, propName);
    }
    // expose public methods as props on the HTMLElement
    for (var methodName in publicMethodsConfig) {
        hookComponentPublicMethod(vm, methodName);
    }
    // non-reflective properties
    getOwnPropertyNames(component).forEach(function (propName) {
        if (propName in publicPropsConfig) {
            return;
        }
        hookComponentLocalProperty(vm, propName);
    });
    // non-reflective symbols
    getOwnPropertySymbols(component).forEach(function (symbol) {
        hookComponentLocalProperty(vm, symbol);
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
    var listeners = vm.listeners;

    listeners.forEach(function (propSet) {
        return propSet.delete(vm);
    });
    listeners.clear();
}

function getDefaultValueFromConfig(_ref2) {
    var initializer = _ref2.initializer;

    // default prop value computed when needed
    return typeof initializer === 'function' ? initializer() : initializer;
}

function updateComponentProp(vm, propName, newValue) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        _vm$def2 = vm.def,
        publicPropsConfig = _vm$def2.props,
        observedAttrs = _vm$def2.observedAttrs;

    assert.invariant(!isRendering, vm + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    assert.block(function () {
        if (!config && !ValidPropertyHTMLAttributeMap[propName]) {
            // TODO: ignore any native html property
            console.warn("Updating unknown property \"" + propName + "\" of " + vm + ". This property will be a pass-thru to the DOM element.");
        }
    });
    if (newValue === undefined && config) {
        newValue = getDefaultValueFromConfig(config);
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
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function resetComponentProp(vm, propName) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        _vm$def3 = vm.def,
        publicPropsConfig = _vm$def3.props,
        observedAttrs = _vm$def3.observedAttrs;

    assert.invariant(!isRendering, vm + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    var oldValue = cmpProps[propName];
    var newValue = undefined;
    assert.block(function () {
        if (!config && !ValidPropertyHTMLAttributeMap[propName]) {
            // TODO: ignore any native html property
            console.warn("Resetting unknown property \"" + propName + "\" of " + vm + ". This property will be a pass-thru to the DOM element.");
        }
    });
    if (config) {
        newValue = getDefaultValueFromConfig(config);
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
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function addComponentSlot(vm, slotName, newValue) {
    assert.vm(vm);
    var cmpSlots = vm.cmpSlots;

    assert.invariant(!isRendering, vm + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    assert.isTrue(Array.isArray(newValue) && newValue.length > 0, "Slots can only be set to a non-empty array, instead received " + newValue + " for slot " + slotName + " in " + vm + ".");
    var oldValue = cmpSlots[slotName];
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    if (oldValue !== newValue) {
        cmpSlots[slotName] = newValue;
        console.log("Marking " + vm + " as dirty: a new value for slot \"" + slotName + "\" was added.");
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function removeComponentSlot(vm, slotName) {
    assert.vm(vm);
    var cmpSlots = vm.cmpSlots;

    assert.invariant(!isRendering, vm + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    var oldValue = cmpSlots[slotName];
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    if (oldValue) {
        cmpSlots[slotName] = undefined; // delete will de-opt the cmpSlots, better to set it to undefined
        console.log("Marking " + vm + " as dirty: the value of slot \"" + slotName + "\" was removed.");
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function renderComponent(vm) {
    assert.vm(vm);
    assert.invariant(vm.isDirty, "Component " + vm + " is not dirty.");
    console.log(vm + " is being updated.");
    clearListeners(vm);
    var vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    vm.fragment = vnodes;
    assert.invariant(Array.isArray(vnodes), vm + ".render() should always return an array of vnodes instead of " + vnodes);
    // preparing for the after rendering
    renderedDuringCurrentCycleSet.add(vm);
}

function markComponentAsDirty(vm) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, "markComponentAsDirty() for " + vm + " should not be called when the componet is already dirty.");
    assert.isFalse(isRendering, "markComponentAsDirty() for " + vm + " cannot be called during rendering.");
    vm.isDirty = true;
}

function markAllComponentAsRendered() {
    /**
     * In this method we invoke the renderedCallback() on any component
     * that was rendered during this last patching cycle.
    */
    var pending = Array.from(renderedDuringCurrentCycleSet);
    var len = pending.length;
    renderedDuringCurrentCycleSet.clear();
    for (var i = 0; i < len; i += 1) {
        var vm = pending.shift();
        invokeComponentRenderedCallback(vm);
    }
}

function createVM(vnode) {
    assert.vnode(vnode);
    assert.invariant(vnode.elm instanceof HTMLElement, "VM creation requires a DOM element to be associated to vnode " + vnode + ".");
    var Ctor = vnode.Ctor,
        sel = vnode.sel;

    console.log("<" + Ctor.name + "> is being initialized.");
    var def = getComponentDef(Ctor);
    var vm = {
        isScheduled: false,
        isDirty: true,
        def: def,
        context: {},
        privates: {},
        cmpProps: {},
        cmpSlots: {},
        component: undefined,
        fragment: undefined,
        listeners: new Set()
    };
    assert.block(function () {
        vm.toString = function () {
            return "<" + sel + ">";
        };
    });
    vnode.vm = vm;
    var vnodeBeingConstructedInception = vnodeBeingConstructed;
    vnodeBeingConstructed = vnode;
    createComponent(vm, Ctor);
    vnodeBeingConstructed = vnodeBeingConstructedInception;
    // note to self: invocations during construction to get the vnode associated
    // to the component works fine as well because we can use `vmBeingCreated`
    // in getLinkedVNode() as a fallback patch for resolution.
    setLinkedVNode(vm.component, vnode);
    // note to self: initComponent() is needed as a separate step because observable
    // attributes might invoke user-land code that can do certain things that can
    // require the linking to be in place from the previous line.
    initComponent(vm);
}

var ComponentToVNodeMap = new WeakMap();

var vnodeBeingConstructed = null;

function setLinkedVNode(component, vnode) {
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, "Only DOM elements can be linked to their corresponding component.");
    ComponentToVNodeMap.set(component, vnode);
}

function getLinkedVNode(component) {
    assert.isTrue(component, "invalid component " + component);
    // note to self: we fallback to `vmBeingCreated` in case users
    // invoke something during the constructor execution, in which
    // case this mapping hasn't been stable yet, but we know that's
    // the only case.
    var vnode = ComponentToVNodeMap.get(component) || vnodeBeingConstructed;
    assert.vnode(vnode);
    return vnode;
}

function rehydrate(vm) {
    assert.vm(vm);
    if (vm.isDirty) {
        var oldVnode = getLinkedVNode(vm.component);
        assert.isTrue(oldVnode.elm instanceof HTMLElement, "rehydration can only happen after " + vm + " was patched the first time.");
        var sel = oldVnode.sel,
            Ctor = oldVnode.Ctor,
            _oldVnode$data = oldVnode.data,
            key = _oldVnode$data.key,
            slotset = _oldVnode$data.slotset,
            dataset = _oldVnode$data.dataset,
            on = _oldVnode$data.on,
            _props = _oldVnode$data._props,
            _class = _oldVnode$data._class,
            children = oldVnode.children;

        assert.invariant(Array.isArray(children), 'Rendered ${vm}.children should always have an array of vnodes instead of ${children}');
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode with the exact same data was used
        // to patch this vnode the last time, mimic what happen when the
        // owner re-renders.
        var vnode = c(sel, Ctor, {
            key: key,
            slotset: slotset,
            dataset: dataset,
            on: on,
            props: _props,
            class: _class
        });
        patch(oldVnode, vnode);
    }
    vm.isScheduled = false;
}

function scheduleRehydration(vm) {
    assert.vm(vm);
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch(function (error) {
            assert.fail("Error attempting to rehydrate component " + vm + ": " + error.message);
        });
    }
}

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode, vnode) {
    var Ctor = vnode.Ctor;

    if (!Ctor) {
        return;
    }
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    assert.invariant(vnode.elm, vnode + ".elm should be ready.");
    var vm = oldVnode.vm;

    if (vm && oldVnode.Ctor === Ctor) {
        vnode.vm = vm;
        setLinkedVNode(vm.component, vnode);
    } else {
        createVM(vnode);
        console.log("Component for " + vnode.vm + " was created.");
    }
    assert.invariant(vnode.vm.component, "vm " + vnode.vm + " should have a component and element associated to it.");
}

function postPatchHook() {
    markAllComponentAsRendered();
}

var componentInit = {
    create: initializeComponent,
    update: initializeComponent,
    post: postPatchHook
};

function syncProps(oldVnode, vnode) {
    var vm = vnode.vm;

    if (!vm) {
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
                resetComponentProp(vm, key);
            }
        }

        // new or different props should be set in component's props
        for (key in newProps) {
            cur = newProps[key];
            if (!(key in oldProps) || oldProps[key] != cur) {
                updateComponentProp(vm, key, cur);
            }
        }
    }

    // reflection of component props into data.props for the regular diffing algo
    var props = vnode.data.props;

    assert.invariant(Object.getOwnPropertyNames(props).length === 0, 'vnode.data.props should be an empty object.');
    Object.assign(props, vm.cmpProps);
}

var componentProps = {
    create: syncProps,
    update: syncProps
};

function update(oldVnode, vnode) {
    var vm = vnode.vm;

    if (!vm) {
        return;
    }

    var oldSlots = oldVnode.data.slotset;
    var newSlots = vnode.data.slotset;

    var key = void 0,
        cur = void 0;

    // infuse key-value pairs from slotset into the component
    if (oldSlots !== newSlots && (oldSlots || newSlots)) {
        oldSlots = oldSlots || {};
        newSlots = newSlots || {};
        // removed slots should be removed from component's slotset
        for (key in oldSlots) {
            if (!(key in newSlots)) {
                removeComponentSlot(vm, key);
            }
        }

        // new or different slots should be set in component's slotset
        for (key in newSlots) {
            cur = newSlots[key];
            if (!(key in oldSlots) || oldSlots[key] != cur) {
                if (cur && cur.length) {
                    addComponentSlot(vm, key, cur);
                } else {
                    removeComponentSlot(vm, key);
                }
            }
        }
    }
}

var componentSlotset = {
    create: update,
    update: update
};

function syncClassNames(oldVnode, vnode) {
    var vm = vnode.vm;

    if (!vm) {
        return;
    }

    var oldClass = oldVnode.data._class;
    var klass = vnode.data._class;
    var classList = vm.component.classList;

    // if component's classList is not defined (it is only defined for
    // components extending HTMLElement), we need to fallback

    if (!classList) {
        classList = vnode.elm.classList;
    }

    // propagating changes from "data->_class" into classList
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
    var vm = vnode.vm;

    if (!vm) {
        return;
    }
    var children = vnode.children;
    // if diffing against an empty element, it means vnode was created and
    // has never been rendered. an immidiate rehydration is
    // needed otherwise the children are not going to be populated.

    if (oldVnode.sel === '') {
        assert.invariant(vm.isDirty, vnode + " should be dirty after creation");
        assert.invariant(vm.fragment === undefined, vnode + " should not have a fragment after creation");
        rehydrate(vm);
        // avoiding the rest of this diffing entirely because it happens already in rehydrate
        var oldCh = oldVnode.children;

        oldCh.splice(0, oldCh.length).push.apply(oldCh, vm.fragment);
        // TODO: this is a fork of the fiber since the create hook is called during a
        // patching process. How can we optimize this to reuse the same queue?
        // and idea is to do this part in the next turn (a la fiber)
        // PR https://github.com/snabbdom/snabbdom/pull/234 might help.
    } else if (vm.isDirty) {
        assert.invariant(oldVnode.children !== children, "If component is dirty, the children collections must be different. In theory this should never happen.");
        renderComponent(vm);
    }
    // replacing the vnodes in the children array without replacing the array itself
    // because the engine has a hard reference to the original array object.
    children.splice(0, children.length).push.apply(children, vm.fragment);
}

var componentChildren = {
    create: rerender,
    update: rerender
};

// TODO: eventually use the one shipped by snabbdom directly
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
                    if (elm[key] === cur && old !== undefined) {
                        console.warn("unneccessary update of element <" + vnode.sel + ">, property \"" + key + "\" for " + (vnode.vm || vnode.sel) + ".");
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

var patch = init([componentInit, componentClassList, componentSlotset, componentProps, componentChildren, props, attrs, style$1, dataset$1, className, on]);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Ep = Element.prototype;

function linkAttributes(element, vm) {
    assert.vm(vm);
    var attrsConfig = vm.def.attrs;
    // replacing mutators on the element itself to catch any mutation

    element.setAttribute = function (attrName, value) {
        Ep.setAttribute.call(element, attrName, value);
        var attrConfig = attrsConfig[attrName.toLocaleLowerCase()];
        if (attrConfig) {
            updateComponentProp(vm, attrConfig.propName, value);
            if (vm.isDirty) {
                console.log("Scheduling " + vm + " for rehydration.");
                scheduleRehydration(vm);
            }
        }
    };
    element.removeAttribute = function (attrName) {
        Ep.removeAttribute.call(element, attrName);
        var attrConfig = attrsConfig[attrName.toLocaleLowerCase()];
        if (attrConfig) {
            resetComponentProp(vm, attrConfig.propName);
            if (vm.isDirty) {
                console.log("Scheduling " + vm + " for rehydration.");
                scheduleRehydration(vm);
            }
        }
    };
}

function linkProperties(element, vm) {
    assert.vm(vm);
    var component = vm.component,
        _vm$def = vm.def,
        propsConfig = _vm$def.props,
        methods = _vm$def.methods;

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
                if (vm.isDirty) {
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            },
            configurable: false,
            enumerable: true
        };
    };

    for (var propName in propsConfig) {
        _loop2(propName);
    }
    defineProperties(element, descriptors);
}

function getInitialProps(element, Ctor) {
    var _getComponentDef = getComponentDef(Ctor),
        config = _getComponentDef.props;

    var props = {};
    for (var propName in config) {
        if (propName in element) {
            props[propName] = element[propName];
        }
    }
    return props;
}

function getInitialSlots(element, Ctor) {
    var _getComponentDef2 = getComponentDef(Ctor),
        slotNames = _getComponentDef2.slotNames;

    if (!slotNames) {
        return;
    }
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
    var tagName = element.tagName.toLowerCase();
    var vnode = c(tagName, Ctor, { props: props, slotset: slotset, class: element.className || undefined });
    // TODO: eventually after updating snabbdom we can use toVNode(element)
    // as the first argument to reconstruct the vnode that represents the
    // current state.

    var _patch = patch(element, vnode),
        vm = _patch.vm;

    linkAttributes(element, vm);
    // TODO: for vnode with element we might not need to do any of these.
    linkProperties(element, vm);
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
        var defineOriginal = customElements.define;
        customElements.define = function (tagName) {
            defineOriginal.call.apply(defineOriginal, [this].concat(Array.prototype.slice.call(arguments)));
            definedElements[tagName] = undefined;
        };
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

var INTERNAL_VM = Symbol();
var INTERNAL_LIST = Symbol();

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
var ClassList = function () {
    function ClassList(component) {
        _classCallCheck$1(this, ClassList);

        var _getLinkedVNode = getLinkedVNode(component),
            vm = _getLinkedVNode.vm;

        assert.vm(vm);
        this[INTERNAL_VM] = vm;
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
                    var vm = _this[INTERNAL_VM];
                    updateComponentProp(vm, 'className', list.join(' '));
                    if (vm.isDirty) {
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
                    var vm = _this2[INTERNAL_VM];
                    if (list.length) {
                        updateComponentProp(vm, 'className', list.join(' '));
                    } else {
                        resetComponentProp(vm, 'className');
                    }
                    if (vm.isDirty) {
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

var ComponentElement = function () {
    function ComponentElement() {
        _classCallCheck(this, ComponentElement);

        var classList = new ClassList(this);
        Object.defineProperties(this, {
            classList: {
                value: classList,
                writable: false,
                configurable: false,
                enumerable: true
            }
        });
    }

    _createClass(ComponentElement, [{
        key: "dispatchEvent",
        value: function dispatchEvent(event) {
            var vnode = getLinkedVNode(this);
            assert.vnode(vnode);
            var elm = vnode.elm;
            // custom elements will rely on the DOM dispatchEvent mechanism

            assert.isTrue(elm instanceof HTMLElement, "Invalid association between component " + this + " and element " + elm + ".");
            return elm.dispatchEvent(event);
        }
    }]);

    return ComponentElement;
}();

// One time operation to expose the good parts of the web component API,
// in terms of methods and properties:


HTMLElementMethodsTheGoodParts.reduce(function (proto, methodName) {
    proto[methodName] = function () {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var elm = vnode.elm;

        assert.isTrue(elm instanceof HTMLElement, "Invalid association between component " + this + " and element " + elm + " when calling method " + methodName + ".");
        return elm[methodName].apply(elm, arguments);
    };
    return proto;
}, ComponentElement.prototype);

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
}, ComponentElement.prototype);



var Main = Object.freeze({
	loaderImportMethodTemporary: loaderImportMethod,
	defineTemporary: amdDefineMethod,
	createElement: createElement,
	set: set,
	getComponentDef: getComponentDef,
	HTMLElement: ComponentElement
});

exports.loaderImportMethodTemporary = loaderImportMethod;
exports.defineTemporary = amdDefineMethod;
exports.createElement = createElement;
exports.set = set;
exports.getComponentDef = getComponentDef;
exports.HTMLElement = ComponentElement;

// forcing the global define() function to be declared bound to raptor.
window.define = Raptor.defineTemporary;


}((this.Raptor = this.Raptor || {})));
/** version: 0.3.1 */
//# sourceMappingURL=raptor.js.map
