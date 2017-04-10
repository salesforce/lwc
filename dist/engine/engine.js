(function (exports) {
'use strict';

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
    },
    logError: function logError(msg) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.error(e);
        }
    },
    logWarning: function logWarning(msg) {
        try {
            throw new Error(msg);
        } catch (e) {
            console.warn(e);
        }
    }
};

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var freeze = Object.freeze;
var seal = Object.seal;
var create = Object.create;
var assign = Object.assign;
var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var defineProperties = Object.defineProperties;
var hasOwnProperty = Object.hasOwnProperty;
var isArray = Array.isArray;
var _Array$prototype = Array.prototype;
var ArraySlice = _Array$prototype.slice;
var ArraySplice = _Array$prototype.splice;
var ArrayIndexOf = _Array$prototype.indexOf;
var ArrayPush = _Array$prototype.push;
function isUndefined(obj) {
    return obj === undefined;
}

function isFunction(obj) {
    return typeof obj === 'function';
}
function isObject(o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof$2(o)) === 'object';
}

function isString(obj) {
    return typeof obj === 'string';
}

var OtS = {}.toString;
function toString(obj) {
    if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof$2(obj)) === 'object' && !obj.toString) {
        return OtS.call(obj);
    }
    return obj + '';
}

function bind(fn, ctx) {
    function boundFn(a) {
        var l = arguments.length;
        return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
    }
    return boundFn;
}

// Few more execptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.
var HTMLPropertyNamesWithLowercasedReflectiveAttributes = ['accessKey', 'readOnly', 'tabIndex', 'bgColor', 'colSpan', 'rowSpan', 'contentEditable', 'dateTime', 'formAction', 'isMap', 'maxLength', 'useMap'];

// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
var GlobalHTMLProperties = {
    accessKey: {
        attribute: 'accesskey'
    },
    accessKeyLabel: {
        readOnly: true
    },
    className: {
        attribute: 'class',
        error: 'Property `className` is consider a harmful API. Instead, you can rely on property `classList` which offers similar funcionality but without having to do string manipulation, and without conflicting with classes provided by the owner element.'
    },
    contentEditable: {
        attribute: 'contenteditable'
    },
    isContentEditable: {
        readOnly: true
    },
    contextMenu: {
        attribute: 'contextmenu'
    },
    dataset: {
        readOnly: true,
        msg: 'Property \`dataset\` is consider a harmful API. Instead you can declare \`static observedAttributes = ["data-foo"]\` and then use the \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification everytime the attribute "data-foo" changes, which offers similar read functionality but without exposing the live bindings to user-land.'
    },
    dir: {
        attribute: 'dir'
    },
    draggable: {
        attribute: 'draggable',
        experimental: true
    },
    dropzone: {
        attribute: 'dropzone',
        readOnly: true,
        experimental: true
    },
    hidden: {
        attribute: 'hidden'
    },
    itemScope: {
        attribute: 'itemscope',
        experimental: true
    },
    itemType: {
        attribute: 'itemtype',
        readOnly: true,
        experimental: true
    },
    itemId: {
        attribute: 'itemid',
        experimental: true
    },
    itemRef: {
        attribute: 'itemref',
        readOnly: true,
        experimental: true
    },
    itemProp: {
        attribute: 'itemprop',
        readOnly: true,
        experimental: true
    },
    itemValue: {
        experimental: true
    },
    lang: {
        attribute: 'lang'
    },
    offsetHeight: {
        readOnly: true,
        experimental: true
    },
    offsetLeft: {
        readOnly: true,
        experimental: true
    },
    offsetParent: {
        readOnly: true,
        experimental: true
    },
    offsetTop: {
        readOnly: true,
        experimental: true
    },
    offsetWidth: {
        readOnly: true,
        experimental: true
    },
    properties: {
        readOnly: true,
        experimental: true
    },
    spellcheck: {
        experimental: true
    },
    style: {
        attribute: 'style',
        error: 'Property `style` is consider a harmful API. Writing logic that relies on the "style" attribute or `style` property is discouraged.'
    },
    tabIndex: {
        attribute: 'tabindex'
    },
    title: {
        attribute: 'title'
    },
    translate: {
        experimental: true
    },
    // additional global attributes that are not present in the link above.
    role: {
        attribute: 'role'
    },
    slot: {
        attribute: 'slot',
        experimental: true,
        error: 'Writing logic that relies on "slot" attribute or `slot` property is discouraged'
    }
};

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element

// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var topLevelContextSymbol = Symbol('Top Level Context');

var currentContext = _defineProperty({}, topLevelContextSymbol, true);

function establishContext(ctx) {
    currentContext = ctx;
}

var nextTickCallbackQueue = undefined;
var SPACE_CHAR = 32;

function addCallbackToNextTick(callback) {
    assert.isTrue(typeof callback === 'function', "addCallbackToNextTick() can only accept a function callback as first argument instead of " + callback);
    if (!isArray(nextTickCallbackQueue)) {
        nextTickCallbackQueue = [];
        Promise.resolve(nextTickCallbackQueue).then(function (callbacks) {
            assert.isTrue(isArray(callbacks), callbacks + " must be the array of callbacks");
            nextTickCallbackQueue = undefined;
            for (var i = 0, len = callbacks.length; i < len; i += 1) {
                callbacks[i]();
            }
        });
    }
    ArrayPush.call(nextTickCallbackQueue, callback);
}

var CAMEL_REGEX = /-([a-z])/g;
var attrNameToPropNameMap = create(null);

function getPropNameFromAttrName(attrName) {
    var propName = attrNameToPropNameMap[attrName];
    if (!propName) {
        propName = attrName.replace(CAMEL_REGEX, function (g) {
            return g[1].toUpperCase();
        });
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}

var CAPS_REGEX = /[A-Z]/g;
/**
 * This dictionary contains the mapping between property names
 * and the corresponding attribute name. This helps to trigger observable attributes.
 */
var propNameToAttributeNameMap = {
    // these are exceptions to the rule that cannot be inferred via `CAPS_REGEX`
    className: 'class',
    htmlFor: 'for'
};
// Few more exceptions where the attribute name matches the property in lowercase.
HTMLPropertyNamesWithLowercasedReflectiveAttributes.forEach(function (propName) {
    propNameToAttributeNameMap[propName] = propName.toLowerCase();
});

function getAttrNameFromPropName(propName) {
    var attrName = propNameToAttributeNameMap[propName];
    if (!attrName) {
        attrName = propName.replace(CAPS_REGEX, function (match) {
            return '-' + match.toLowerCase();
        });
        propNameToAttributeNameMap[propName] = attrName;
    }
    return attrName;
}

function toAttributeValue(raw) {
    // normalizing attrs from compiler into HTML global attributes
    if (raw === true) {
        raw = '';
    } else if (raw === false) {
        raw = null;
    }
    return raw !== null ? raw + '' : null;
}

function noop() {}

function getMapFromClassName(className) {
    var map = {};
    var start = 0;
    var i = void 0,
        len = className.length;
    for (i = 0; i < len; i++) {
        if (className.charCodeAt(i) === SPACE_CHAR) {
            if (i > start) {
                map[className.slice(start, i)] = true;
            }
            start = i + 1;
        }
    }

    if (i > start) {
        map[className.slice(start, i)] = true;
    }
    return map;
}

function insert(vnode) {
    assert.vnode(vnode);
    var vm = vnode.vm,
        children = vnode.children;

    assert.vm(vm);
    assert.isFalse(vm.wasInserted, vm + " is already inserted.");
    vm.wasInserted = true;
    if (vm.isDirty) {
        // this code path guarantess that when patching the custom element for the first time,
        // the body is computed only after the element is in the DOM, otherwise the hooks
        // for any children's vnode are not going to be useful.
        rehydrate(vm);
        // replacing the vnode's children collection so successive patching routines
        // will diff against the full tree, not a only partial one.
        children.length = 0;
        ArrayPush.apply(children, vm.fragment);
    }
    if (vm.component.connectedCallback) {
        addCallbackToNextTick(function () {
            return invokeComponentConnectedCallback(vm);
        });
    }
    console.log("\"" + vm + "\" was inserted.");
}

function destroy(vnode) {
    assert.vnode(vnode);
    var vm = vnode.vm;

    assert.vm(vm);
    assert.isTrue(vm.wasInserted, vm + " is not inserted.");
    vm.wasInserted = false;
    if (vm.component.disconnectedCallback) {
        addCallbackToNextTick(function () {
            return invokeComponentDisconnectedCallback(vm);
        });
    }
    clearListeners(vm);
    console.log("\"" + vm + "\" was destroyed.");
}

function postpatch(oldVnode, vnode) {
    assert.vnode(vnode);
    assert.vm(vnode.vm);
    if (vnode.vm.wasInserted === false) {
        // when inserting a root element, or when reusing a DOM element for a new
        // component instance, the insert() hook is never called because the element
        // was already in the DOM before creating the instance, and diffing the
        // vnode, for that, we wait until the patching process has finished, and we
        // use the postpatch() hook to trigger the connectedCallback logic.
        insert(vnode);
        // Note: we don't have to worry about destroy() hook being called before this
        // one because they never happen in the same patching mechanism, only one
        // of them is called. In the case of the insert() hook, we use the `wasInserted`
        // flag to dedupe the calls since they both can happen in the same patching process.
    }
}

var lifeCycleHooks = {
    insert: insert,
    destroy: destroy,
    postpatch: postpatch
};

var _typeof$5 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var CHAR_S = 115;
var CHAR_V = 118;
var CHAR_G = 103;
var EmptyData = create(null);
var NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';

// Node Types
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
var ELEMENT_NODE = 1; // An Element node such as <p> or <div>.
var TEXT_NODE = 3; // The actual Text of Element or Attr.

function nodeToVNode(elm) {
    // TODO: generalize this to support all kind of Nodes
    // TODO: instead of creating the vnode() directly, use toVNode() or something else from snabbdom
    // TODO: the element could be derivated from another raptor component, in which case we should
    // use the corresponding vnode instead
    assert.isTrue(elm instanceof Node, "Only Node can be wrapped by h()");
    var nodeType = elm.nodeType;

    if (nodeType === TEXT_NODE) {
        return vnode(undefined, undefined, undefined, elm.textContent, elm);
    }
    if (nodeType === ELEMENT_NODE) {
        // TODO: support "is"" attribute
        return vnode(elm.tagName.toLowerCase(), undefined, undefined, undefined, elm);
    }
    throw new Error("Invalid NodeType: " + nodeType);
}

function addNS(data, children, sel) {
    data.ns = NamespaceAttributeForSVG;
    if (isUndefined(children) || sel === 'foreignObject') {
        return;
    }
    var len = children.length;
    for (var _i = 0; _i < len; ++_i) {
        var child = children[_i];
        var _data = child.data;

        if (_data !== undefined) {
            var grandChildren = child.children;
            addNS(_data, grandChildren, child.sel);
        }
    }
}

// [v]node node
function vnode(sel, data, children, text, elm, Ctor) {
    data = data || EmptyData;
    var _data2 = data,
        key = _data2.key;

    var vnode = { sel: sel, data: data, children: children, text: text, elm: elm, key: key, Ctor: Ctor };
    assert.block(function devModeCheck() {
        // adding toString to all vnodes for debuggability
        vnode.toString = function () {
            return "[object:vnode " + sel + "]";
        };
    });
    return vnode;
}

// [h]tml node
function h(sel, data, children) {
    assert.isTrue(isString(sel), "h() 1st argument sel must be a string.");
    assert.isTrue(isObject(data), "h() 2nd argument data must be an object.");
    assert.isTrue(isArray(children), "h() 3rd argument children must be an array.");
    if (children.length) {
        n(children);
    }
    if (sel.length === 3 && sel.charCodeAt(0) === CHAR_S && sel.charCodeAt(1) === CHAR_V && sel.charCodeAt(2) === CHAR_G) {
        addNS(data, children, sel);
    }
    return vnode(sel, data, children);
}

// [c]ustom element node
function c(sel, Ctor, data) {
    assert.isTrue(isString(sel), "c() 1st argument sel must be a string.");
    assert.isTrue(isFunction(Ctor), "c() 2nd argument Ctor must be a function.");
    assert.isTrue(isObject(data), "c() 3nd argument data must be an object.");
    var key = data.key,
        slotset = data.slotset,
        attrs = data.attrs,
        className = data.className,
        classMap = data.classMap,
        _props = data.props,
        _on = data.on;

    assert.isTrue(arguments.length < 4, "Compiler Issue: Custom elements expect up to 3 arguments, received " + arguments.length + " instead.");
    return vnode(sel, { hook: lifeCycleHooks, key: key, slotset: slotset, attrs: attrs, className: className, classMap: classMap, _props: _props, _on: _on }, [], undefined, undefined, Ctor);
}

// [i]terable node
function i(items, factory) {
    var len = isArray(items) ? items.length : 0;
    var list = [];

    var _loop = function _loop(_i2) {
        var vnode = factory(items[_i2], _i2);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        } else {
            ArrayPush.call(list, vnode);
        }
        assert.block(function devModeCheck() {
            var vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach(function (vnode) {
                if (vnode && (typeof vnode === "undefined" ? "undefined" : _typeof$5(vnode)) === 'object' && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    assert.logWarning("Missing \"key\" attribute for element <" + vnode.sel + "> in iteration of " + toString(items) + " for index " + _i2 + " of " + len + ". Solution: You can set a \"key\" attribute to a unique value so the diffing algo can guarantee to preserve the internal state of the instance of \"" + toString(vnode.Ctor.name) + "\".");
                }
            });
        });
    };

    for (var _i2 = 0; _i2 < len; _i2 += 1) {
        _loop(_i2);
    }
    return list;
}

/**
 * [s]tringify
 */
function s() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    // deprecated
    return value;
}

/**
 * [e]mpty
 */
function e() {
    // deprecated
    return null;
}

/**
 * [f]lattening
 */
function f(items) {
    assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    var len = items.length;
    var flattened = [];
    for (var _i3 = 0; _i3 < len; _i3 += 1) {
        var item = items[_i3];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
        } else {
            ArrayPush.call(flattened, item);
        }
    }
    return flattened;
}

// [n]ormalize children nodes
function n(children) {
    var len = children.length;
    for (var _i4 = 0; _i4 < len; ++_i4) {
        var child = children[_i4];
        var t = typeof child === "undefined" ? "undefined" : _typeof$5(child);
        if (t === 'string' || t === 'number') {
            children[_i4] = vnode(undefined, undefined, undefined, child);
        } else if (child && !("Ctor" in child)) {
            if ("nodeType" in child) {
                children[_i4] = nodeToVNode(child);
            } else {
                children[_i4] = vnode(undefined, undefined, undefined, child);
            }
        }
    }
    return children;
}

var api = Object.freeze({
    v: vnode,
    h: h,
    c: c,
    i: i,
    s: s,
    e: e,
    f: f,
    n: n
});

var EmptySlots = create(null);

function normalizeRenderResult(vm, elementOrVnodeOrArrayOfVnodes) {
    if (!elementOrVnodeOrArrayOfVnodes) {
        return [];
    }
    // never mutate the original array
    var vnodes = isArray(elementOrVnodeOrArrayOfVnodes) ? ArraySlice.call(elementOrVnodeOrArrayOfVnodes, 0) : [elementOrVnodeOrArrayOfVnodes];
    return n(vnodes);
}

function getSlotsetValue(slotset, slotName) {
    assert.isTrue(isObject(slotset), "Invalid slotset value " + toString(slotset));
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}

var slotsetProxyHandler = {
    get: function get(slotset, key) {
        return getSlotsetValue(slotset, key);
    },
    set: function set() {
        assert.invariant(false, "$slotset object cannot be mutated from template.");
        return false;
    },
    deleteProperty: function deleteProperty() {
        assert.invariant(false, "$slotset object cannot be mutated from template.");
        return false;
    }
};

// we use inception to track down the memoized object for each value used in a template from a component
var currentMemoized = null;

var cmpProxyHandler = {
    get: function get(cmp, key) {
        if (currentMemoized === null || vmBeingRendered === null || vmBeingRendered.component !== cmp) {
            throw new Error("Internal Error: getFieldValue() should only be accessible during rendering phase.");
        }
        if (key in currentMemoized) {
            return currentMemoized[key];
        }
        assert.block(function devModeCheck() {
            if (hasOwnProperty.call(cmp, key)) {
                var fields = getOwnFields(cmp);
                switch (fields[key]) {
                    case 1:
                        assert.logError("The template used by " + cmp + " is accessing `this." + toString(key) + "` directly, which is declared in the constructor and considered a private field. It can only be used from template via a getter, and will not be reactive unless it is moved to `this.state." + toString(key) + "`.");
                        break;
                    case 2:
                        assert.logError("The template used by " + cmp + " is accessing `this." + toString(key) + "` directly, which is added as an expando property of the component and considered a private field. It can only be used from the template via a getter, and will not be reactive unless it is moved to `this.state." + toString(key) + "`.");
                        break;
                    case 3:
                        assert.logError("The template used by " + cmp + " is accessing `this." + toString(key) + "`, which is considered a mutable private field. This property cannot be used as part of the UI because mutations of it cannot be observed. Alternative, you can move this property to `this.state." + toString(key) + "` to access it from the template.");
                        break;
                    default:
                        // TODO: this should never really happen because the compiler should always validate
                        console.warn("The template used by " + cmp + " is accessing `this." + toString(key) + "`, which is not declared. This is probably a typo on the template.");
                }
            }
        });

        // slow path to access component's properties from template
        var value = void 0;
        var cmpState = vmBeingRendered.cmpState,
            cmpProps = vmBeingRendered.cmpProps,
            publicPropsConfig = vmBeingRendered.def.props;

        if (key === 'state' && cmpState) {
            value = cmpState;
        } else if (key in publicPropsConfig) {
            subscribeToSetHook(vmBeingRendered, cmpProps, key);
            value = cmpProps[key];
        } else {
            value = cmp[key];
        }
        if (typeof value === 'function') {
            // binding every function value accessed from template
            value = bind(value, cmp);
        }
        currentMemoized[key] = value;
        return value;
    },
    set: function set(cmp, key) {
        assert.logError("Invalid assigment: " + cmp + " cannot set a new value for property " + key + " during the rendering phase.");
        return false;
    },
    deleteProperty: function deleteProperty(cmp, key) {
        assert.logError("Invalid delete statement: Component \"" + cmp + "\" cannot delete property " + key + " during the rendering phase.");
        return false;
    }
};

function evaluateTemplate(html, vm) {
    assert.vm(vm);
    var result = html;
    // when `html` is a facotyr, it has to be invoked
    // TODO: add identity to the html functions
    if (typeof html === 'function') {
        var component = vm.component,
            context = vm.context,
            _vm$cmpSlots = vm.cmpSlots,
            cmpSlots = _vm$cmpSlots === undefined ? EmptySlots : _vm$cmpSlots;

        assert.block(function devModeCheck() {
            // before every render, in dev-mode, we will like to know all expandos and
            // all private-fields-like properties, so we can give meaningful errors.
            extractOwnFields(component);

            // validating slot names
            var _html$slots = html.slots,
                slots = _html$slots === undefined ? [] : _html$slots;

            for (var slotName in cmpSlots) {
                if (ArrayIndexOf.call(slots, slotName) === -1) {
                    // TODO: this should never really happen because the compiler should always validate
                    console.warn("Ignoring unknown provided slot name \"" + slotName + "\" in " + vm + ". This is probably a typo on the slot attribute.");
                }
            }

            // validating identifiers used by template that should be provided by the component
            var _html$ids = html.ids,
                ids = _html$ids === undefined ? [] : _html$ids;

            ids.forEach(function (propName) {
                if (!(propName in component)) {
                    // TODO: this should never really happen because the compiler should always validate
                    console.warn("The template rendered by " + vm + " might attempt to access `this." + propName + "`, which is not declared. This is probably a typo on the template.");
                }
            });
        });

        var _Proxy$revocable = Proxy.revocable(cmpSlots, slotsetProxyHandler),
            slotset = _Proxy$revocable.proxy,
            slotsetRevoke = _Proxy$revocable.revoke;

        var _Proxy$revocable2 = Proxy.revocable(component, cmpProxyHandler),
            cmp = _Proxy$revocable2.proxy,
            componentRevoke = _Proxy$revocable2.revoke;

        var outerMemoized = currentMemoized;
        currentMemoized = create(null);
        result = html.call(undefined, api, cmp, slotset, context);
        currentMemoized = outerMemoized; // inception to memoize the accessing of keys from cmp for every render cycle
        slotsetRevoke();
        componentRevoke();
    }
    // the render method can return many different things, here we attempt to normalize it.
    return normalizeRenderResult(vm, result);
}

var isRendering = false;
var vmBeingRendered = null;

function invokeComponentMethod(vm, methodName, args) {
    var component = vm.component,
        context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var result = void 0,
        error = void 0;
    try {
        result = component[methodName].apply(component, args);
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return result;
}

function invokeComponentConstructor(vm, Ctor) {
    var context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var component = void 0,
        error = void 0;
    try {
        component = new Ctor();
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return component;
}

function invokeComponentDisconnectedCallback(vm) {
    var component = vm.component,
        context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var error = void 0;
    try {
        component.disconnectedCallback();
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}

function invokeComponentConnectedCallback(vm) {
    var component = vm.component,
        context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var error = void 0;
    try {
        component.connectedCallback();
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}

function invokeComponentRenderedCallback(vm) {
    var component = vm.component,
        context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var error = void 0;
    try {
        component.renderedCallback();
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}

function invokeComponentRenderMethod(vm) {
    var component = vm.component,
        context = vm.context;

    var ctx = currentContext;
    establishContext(context);
    var isRenderingInception = isRendering;
    var vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    var result = void 0,
        error = void 0;
    try {
        var html = component.render();
        result = evaluateTemplate(html, vm);
    } catch (e) {
        error = e;
    }
    isRendering = isRenderingInception;
    vmBeingRendered = vmBeingRenderedInception;
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return result || [];
}

function invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue) {
    var component = vm.component,
        context = vm.context;

    assert.isTrue(component.attributeChangedCallback, "invokeComponentAttributeChangedCallback() should not be called if `component.attributeChangedCallback()` is not defined.");
    var ctx = currentContext;
    establishContext(context);
    var error = void 0;
    try {
        component.attributeChangedCallback(attrName, oldValue, newValue);
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}

var _typeof$4 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function createComponent(vm, Ctor) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        publicMethodsConfig = vm.def.methods;
    // expose public methods as props on the Element

    var _loop = function _loop(methodName) {
        cmpProps[methodName] = function () {
            return invokeComponentMethod(vm, methodName, arguments);
        };
    };

    for (var methodName in publicMethodsConfig) {
        _loop(methodName);
    }
    // create the component instance
    var component = invokeComponentConstructor(vm, Ctor);
    assert.block(function devModeCheck() {
        extractOwnFields(component);
    });
    vm.component = component;
}

function clearListeners(vm) {
    assert.vm(vm);
    var deps = vm.deps;

    var len = deps.length;
    if (len) {
        for (var i = 0; i < len; i += 1) {
            var set = deps[i];
            var pos = ArrayIndexOf.call(deps[i], vm);
            assert.invariant(pos > -1, "when clearing up deps, the vm must be part of the collection.");
            ArraySplice.call(set, pos, 1);
        }
        deps.length = 0;
    }
}

function updateComponentProp(vm, propName, newValue) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        _vm$def = vm.def,
        publicPropsConfig = _vm$def.props,
        observedAttrs = _vm$def.observedAttrs;

    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    if (isUndefined(config)) {
        // TODO: this should never really happen because the compiler should always validate
        console.warn("Ignoreing unknown public property " + propName + " of " + vm + ". This is probably a typo on the corresponding attribute \"" + getAttrNameFromPropName(propName) + "\".");
        return;
    }
    var oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        assert.block(function devModeCheck() {
            if ((typeof newValue === "undefined" ? "undefined" : _typeof$4(newValue)) === 'object') {
                assert.invariant(getPropertyProxy(newValue) === newValue, "updateComponentProp() should always received proxified object values instead of " + newValue + " in " + vm + ".");
            }
        });
        cmpProps[propName] = newValue;
        var attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        notifyListeners(cmpProps, propName);
    }
}

function resetComponentProp(vm, propName) {
    assert.vm(vm);
    var cmpProps = vm.cmpProps,
        _vm$def2 = vm.def,
        publicPropsConfig = _vm$def2.props,
        observedAttrs = _vm$def2.observedAttrs;

    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + "." + propName);
    var config = publicPropsConfig[propName];
    if (isUndefined(config)) {
        // not need to log the error here because we will do it on updateComponentProp()
        return;
    }
    var oldValue = cmpProps[propName];
    var newValue = undefined;
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        var attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        notifyListeners(cmpProps, propName);
    }
}

function addComponentEventListener(vm, eventName, newHandler) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + " by adding a new event listener for \"" + eventName + "\".");
    var cmpEvents = vm.cmpEvents;

    if (isUndefined(cmpEvents)) {
        vm.cmpEvents = cmpEvents = create(null);
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
    }
    assert.block(function devModeCheck() {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            console.warn("Adding the same event listener " + newHandler + " for the event \"" + eventName + "\" will result on calling the same handler multiple times for " + vm + ". In most cases, this is an issue, instead, you can add the event listener in the constructor(), which is guarantee to be executed only once during the life-cycle of the component " + vm + ".");
        }
    });
    // TODO: we might need to hook into this listener for Locker Service
    ArrayPush.call(cmpEvents[eventName], newHandler);
    console.log("Marking " + vm + " as dirty: event handler for \"" + eventName + "\" has been added.");
    if (!vm.isDirty) {
        markComponentAsDirty(vm);
    }
}

function removeComponentEventListener(vm, eventName, oldHandler) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of " + vm + " by removing an event listener for \"" + eventName + "\".");
    var cmpEvents = vm.cmpEvents;

    if (cmpEvents) {
        var handlers = cmpEvents[eventName];
        var pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            if (!vm.isDirty) {
                markComponentAsDirty(vm);
            }
            return;
        }
    }
    assert.block(function devModeCheck() {
        console.warn("Event handler " + oldHandler + " not found for event \"" + eventName + "\", this is an unneccessary operation. Only attempt to remove the event handlers that you have added already for " + vm + ".");
    });
}

function addComponentSlot(vm, slotName, newValue) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    assert.isTrue(isArray(newValue) && newValue.length > 0, "Slots can only be set to a non-empty array, instead received " + toString(newValue) + " for slot " + slotName + " in " + vm + ".");
    var cmpSlots = vm.cmpSlots;

    var oldValue = cmpSlots && cmpSlots[slotName];
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.

    // TODO: Issue #133
    if (!isArray(newValue)) {
        newValue = undefined;
    }
    if (oldValue !== newValue) {
        if (isUndefined(cmpSlots)) {
            vm.cmpSlots = cmpSlots = create(null);
        }
        cmpSlots[slotName] = newValue;
        console.log("Marking " + vm + " as dirty: a new value for slot \"" + slotName + "\" was added.");
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

function removeComponentSlot(vm, slotName) {
    assert.vm(vm);
    assert.invariant(!isRendering, vmBeingRendered + ".render() method has side effects on the state of slot " + slotName + " in " + vm);
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    var cmpSlots = vm.cmpSlots;

    if (cmpSlots && cmpSlots[slotName]) {
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
    assert.invariant(isArray(vnodes), vm + ".render() should always return an array of vnodes instead of " + vnodes);
    if (vm.component.renderedCallback) {
        addCallbackToNextTick(function () {
            return invokeComponentRenderedCallback(vm);
        });
    }
}

function markComponentAsDirty(vm) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, "markComponentAsDirty() for " + vm + " should not be called when the componet is already dirty.");
    assert.isFalse(isRendering, "markComponentAsDirty() for " + vm + " cannot be called during rendering of " + vmBeingRendered + ".");
    vm.isDirty = true;
}

var TargetToReactiveRecordMap = new WeakMap();

function notifyListeners(target, key) {
    var reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (reactiveRecord) {
        var value = reactiveRecord[key];
        if (value) {
            var len = value.length;
            for (var i = 0; i < len; i += 1) {
                var vm = value[i];
                assert.vm(vm);
                console.log("Marking " + vm + " as dirty: property \"" + toString(key) + "\" of " + toString(target) + " was set to a new value.");
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log("Scheduling " + vm + " for rehydration due to mutation.");
                    scheduleRehydration(vm);
                }
            }
        }
    }
}

function subscribeToSetHook(vm, target, key) {
    assert.vm(vm);
    var reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        var newRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
    }
    var value = reactiveRecord[key];
    if (isUndefined(value)) {
        value = [];
        reactiveRecord[key] = value;
    }
    if (ArrayIndexOf.call(value, vm) === -1) {
        ArrayPush.call(value, vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        ArrayPush.call(vm.deps, value);
    }
}

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ObjectPropertyToProxyCache = new WeakMap();
var ProxyCache = new WeakMap(); // use to identify any proxy created by this piece of logic.

function propertyGetter(target, key) {
    var value = target[key];
    if (isRendering && vmBeingRendered) {
        subscribeToSetHook(vmBeingRendered, target, key);
    }
    return value && (typeof value === "undefined" ? "undefined" : _typeof$3(value)) === 'object' ? getPropertyProxy(value) : value;
}

function propertySetter(target, key, value) {
    if (isRendering) {
        // TODO: should this be an error? or a console.error?
        throw new Error("Setting property `" + toString(key) + "` of " + toString(target) + " during the rendering process of " + vmBeingRendered + " is invalid. The render phase should have no side effects on the state of any component.");
    }
    var oldValue = target[key];
    if (oldValue !== value) {
        target[key] = value;
        notifyListeners(target, key);
    }
    return true;
}

function propertyDelete(target, key) {
    delete target[key];
    notifyListeners(target, key);
    return true;
}

var propertyProxyHandler = {
    get: propertyGetter,
    set: propertySetter,
    deleteProperty: propertyDelete
};

function getPropertyProxy(value) {
    assert.isTrue((typeof value === "undefined" ? "undefined" : _typeof$3(value)) === "object", "perf-optimization: avoid calling this method for non-object value.");
    if (value === null) {
        return value;
    }
    // TODO: perf opt - we should try to give identity to propertyProxies so we can test
    // them faster than a weakmap lookup.
    if (ProxyCache.get(value)) {
        return value;
    }
    // TODO: optimize this check
    // TODO: and alternative here is to throw a hard error in dev mode so in prod we don't have to do the check
    if (value instanceof Node) {
        assert.block(function devModeCheck() {
            console.warn("Storing references to DOM Nodes in general is discoraged. Instead, use querySelector and querySelectorAll to find the elements when needed. TODO: provide a link to the full explanation.");
        });
        return value;
    }
    var proxy = ObjectPropertyToProxyCache.get(value);
    if (proxy) {
        return proxy;
    }
    proxy = new Proxy(value, propertyProxyHandler);
    ObjectPropertyToProxyCache.set(value, proxy);
    ProxyCache.set(proxy, true);
    return proxy;
}

var RegularField = 1;
var ExpandoField = 2;
var MutatedField = 3;
var ObjectToFieldsMap = new WeakMap();

function extractOwnFields(target) {
    var fields = ObjectToFieldsMap.get(target);
    var type = ExpandoField;
    if (isUndefined(fields)) {
        // only the first batch are considered private fields
        type = RegularField;
        fields = {};
        ObjectToFieldsMap.set(target, fields);
    }

    var _loop = function _loop(propName) {
        if (hasOwnProperty.call(target, propName) && isUndefined(fields[propName])) {
            fields[propName] = type;
            var value = target[propName];
            // replacing the field with a getter and a setter to track the mutations
            // and provide meaningful errors
            defineProperty(target, propName, {
                get: function get() {
                    return value;
                },
                set: function set(newValue) {
                    value = newValue;
                    fields[propName] = MutatedField;
                },
                configurable: false
            });
        }
    };

    for (var propName in target) {
        _loop(propName);
    }
    return fields;
}

function getOwnFields(target) {
    var fields = ObjectToFieldsMap.get(target);
    if (isUndefined(fields)) {
        fields = {};
    }
    return fields;
}

var INTERNAL_VM = Symbol();

// This needs some more work. ClassList is a weird DOM api because it
// is a TokenList, but not an Array. For now, we are just implementing
// the simplest one.
// https://www.w3.org/TR/dom/#domtokenlist
function ClassList(vm) {
    assert.vm(vm);
    assert.isTrue(vm.cmpClasses === undefined, vm + " should have undefined cmpClasses.");
    vm.cmpClasses = {};
    defineProperty(this, INTERNAL_VM, {
        value: vm,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

ClassList.prototype = {
    add: function add() {
        var vm = this[INTERNAL_VM];
        var cmpClasses = vm.cmpClasses;
        // Add specified class values. If these classes already exist in attribute of the element, then they are ignored.

        for (var _len = arguments.length, classNames = Array(_len), _key = 0; _key < _len; _key++) {
            classNames[_key] = arguments[_key];
        }

        classNames.forEach(function (className) {
            className = className + '';
            if (!cmpClasses[className]) {
                cmpClasses[className] = true;
                console.log("Marking " + vm + " as dirty: classname \"" + className + "\" was added.");
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log("Scheduling " + vm + " for rehydration due to changes in the classList collection.");
                    scheduleRehydration(vm);
                }
            }
        });
    },
    remove: function remove() {
        var _this = this;

        var vm = this[INTERNAL_VM];
        var cmpClasses = vm.cmpClasses;
        // Remove specified class values.

        for (var _len2 = arguments.length, classNames = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            classNames[_key2] = arguments[_key2];
        }

        classNames.forEach(function (className) {
            className = className + '';
            if (cmpClasses[className]) {
                cmpClasses[className] = false;
                var _vm = _this[INTERNAL_VM];
                console.log("Marking " + _vm + " as dirty: classname \"" + className + "\" was removed.");
                if (!_vm.isDirty) {
                    markComponentAsDirty(_vm);
                    console.log("Scheduling " + _vm + " for rehydration due to changes in the classList collection.");
                    scheduleRehydration(_vm);
                }
            }
        });
    },
    item: function item(index) {
        var vm = this[INTERNAL_VM];
        var cmpClasses = vm.cmpClasses;
        // Return class value by index in collection.

        return getOwnPropertyNames(cmpClasses).filter(function (className) {
            return cmpClasses[className + ''];
        })[index] || null;
    },
    toggle: function toggle(className, force) {
        var vm = this[INTERNAL_VM];
        var cmpClasses = vm.cmpClasses;
        // When only one argument is present: Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and return true.
        // When a second argument is present: If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.

        if (arguments.length > 1) {
            if (force) {
                this.add(className);
            } else if (!force) {
                this.remove(className);
            }
            return !!force;
        }
        if (cmpClasses[className]) {
            this.remove(className);
            return false;
        }
        this.add(className);
        return true;
    },
    contains: function contains(className) {
        var vm = this[INTERNAL_VM];
        var cmpClasses = vm.cmpClasses;
        // Checks if specified class value exists in class attribute of the element.

        return !!cmpClasses[className];
    },
    toString: function toString() {
        var vm = this[INTERNAL_VM];
        var cmpClasses = vm.cmpClasses;

        return getOwnPropertyNames(cmpClasses).filter(function (className) {
            return cmpClasses[className + ''];
        }).join(' ');
    }
};

function getLinkedElement(cmp) {
    var vnode = getLinkedVNode(cmp);
    assert.vnode(vnode);
    var elm = vnode.elm;

    assert.isTrue(elm instanceof HTMLElement, "Invalid association between component " + cmp + " and element " + elm + ".");
    return elm;
}

// This should be an empty function, and any initialization should be done lazily
function ComponentElement() {}

ComponentElement.prototype = {
    // Raptor.Element APIs
    renderedCallback: noop,
    render: noop,

    // Web Component - The Good Parts
    connectedCallback: noop,
    disconnectedCallback: noop,

    // HTML Element - The Good Parts
    dispatchEvent: function dispatchEvent(event) {
        var elm = getLinkedElement(this);
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
    addEventListener: function addEventListener(type, listener) {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                console.error("this.addEventListener() on component " + vm + " does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.");
            }
        });
        addComponentEventListener(vm, type, listener);
        if (vm.isDirty) {
            console.log("Scheduling " + vm + " for rehydration due to the addition of an event listener for " + type + ".");
            scheduleRehydration(vm);
        }
    },
    removeEventListener: function removeEventListener(type, listener) {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                console.error("this.removeEventListener() on component " + vm + " does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.");
            }
        });
        removeComponentEventListener(vm, type, listener);
        if (vm.isDirty) {
            console.log("Scheduling " + vm + " for rehydration due to the removal of an event listener for " + type + ".");
            scheduleRehydration(vm);
        }
    },
    getAttribute: function getAttribute(attrName) {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var attrs = vnode.data.attrs,
            vm = vnode.vm;

        assert.vm(vm);
        if (!attrName) {
            if (arguments.length === 0) {
                throw new TypeError("Failed to execute 'getAttribute' on " + vm + ": 1 argument required, but only 0 present.");
            }
            return null;
        }
        // logging errors for experimentals and special attributes
        assert.block(function devModeCheck() {
            var propName = getPropNameFromAttrName(attrName);
            var publicPropsConfig = vm.def.props;

            if (publicPropsConfig[propName]) {
                throw new ReferenceError("Attribute \"" + attrName + "\" correspond to public property " + propName + " from " + vm + ". Instead of trying to access it via `this.getAttribute(\"" + attrName + "\")` you should use `this." + propName + "` instead. Use `getAttribute()` only to access global HTML attributes.");
            } else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                var _GlobalHTMLProperties = GlobalHTMLProperties[propName],
                    error = _GlobalHTMLProperties.error,
                    experimental = _GlobalHTMLProperties.experimental;

                if (error) {
                    console.error(error);
                } else if (experimental) {
                    console.error("Writing logic that relies on experimental attribute \"" + attrName + "\" is discouraged, until this feature is standarized and supported by all evergreen browsers. Property `" + propName + "` and attribute \"" + attrName + "\" will be ignored by this engine to prevent you from producing non-standard components.");
                }
            }
        });
        // normalizing attrs from compiler into HTML global attributes
        var raw = attrs && attrName in attrs ? attrs[attrName] : null;
        return toAttributeValue(raw);
    },
    getBoundingClientRect: function getBoundingClientRect() {
        var elm = getLinkedElement(this);
        return elm.getBoundingClientRect();
    },
    querySelector: function querySelector(selectors) {
        var elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        return elm.querySelector(selectors);
    },
    querySelectorAll: function querySelectorAll(selectors) {
        var elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        return elm.querySelectorAll(selectors);
    },

    get tagName() {
        var element = getLinkedElement(this);
        return element.tagName + ''; // avoiding side-channeling
    },
    get classList() {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        var classListObj = vm.classListObj;
        // lazy creation of the ClassList Object the first time it is accessed.

        if (isUndefined(classListObj)) {
            classListObj = new ClassList(vm);
            vm.classListObj = classListObj;
        }
        return classListObj;
    },
    get state() {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        var cmpState = vm.cmpState;

        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        return cmpState;
    },
    set state(newState) {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        if (!newState || !isObject(newState) || isArray(newState)) {
            throw new TypeError(vm + " fails to set new state to " + newState + ". `this.state` can only be set to an object.");
        }
        var cmpState = vm.cmpState;

        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        if (cmpState !== newState) {
            for (var key in cmpState) {
                if (!(key in newState)) {
                    cmpState[key] = undefined; // we prefer setting it to undefined than deleting it with has perf implications
                }
            }
            for (var _key in newState) {
                cmpState[_key] = newState[_key];
            }
        }
    },
    toString: function toString() {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var attrs = vnode.data.attrs;

        var is = attrs && attrs.is;
        return "<" + vnode.sel + (is ? ' is="${is}' : '') + ">";
    }
};

// Global HTML Attributes
assert.block(function devModeCheck() {

    getOwnPropertyNames(GlobalHTMLProperties).forEach(function (propName) {
        if (propName in ComponentElement.prototype) {
            return; // not need to redefined something that we are already exposing.
        }
        defineProperty(ComponentElement.prototype, propName, {
            get: function get() {
                var vnode = getLinkedVNode(this);
                assert.vnode(vnode);
                var vm = vnode.vm;

                assert.vm(vm);
                var _GlobalHTMLProperties2 = GlobalHTMLProperties[propName],
                    error = _GlobalHTMLProperties2.error,
                    attribute = _GlobalHTMLProperties2.attribute,
                    readOnly = _GlobalHTMLProperties2.readOnly,
                    experimental = _GlobalHTMLProperties2.experimental;

                var msg = [];
                msg.push("Accessing the reserved property `" + propName + "` in " + vm + " is disabled.");
                if (error) {
                    msg.push(error);
                } else {
                    if (experimental) {
                        msg.push("* Writing logic that relies on experimental property `" + propName + "` is discouraged, until this feature is standarized and supported by all evergreen browsers. Property `" + propName + "` and attribute \"" + attribute + "\" will be ignored by this engine to prevent you from producing non-standard components.");
                    }
                    if (readOnly) {
                        msg.push("* Read-only property derivated from attributes, it is better to rely on the original source of the value.");
                    }
                    if (attribute) {
                        msg.push("You cannot access to the value of the global property `" + propName + "` directly, but since this property is reflective of attribute \"" + attribute + "\", you have two options to can access to the attribute value:");
                        msg.push("  * Use `this.getAttribute(\"" + attribute + "\")` to access the attribute value at any given time. This option is more suitable for accessing the value in a getter during the rendering process.");
                        msg.push("  * Declare `static observedAttributes = [\"" + attribute + "\"]` and then use the `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification every time the attribute \"" + attribute + "\" changes. This option is more suitable for reactive programming, e.g.: fetching new content every time the attribute is updated.");
                    }
                }
                console.log(msg.join('\n'));
                return; // explicit undefined
            },
            enumerable: false
        });
    });
});

freeze(ComponentElement);
seal(ComponentElement.prototype);

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

var CtorToDefMap = new WeakMap();
var EmptyObject = Object.freeze(Object.create(null));

function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    var proto = Object.getPrototypeOf(Ctor);
    if (proto === ComponentElement) {
        return true;
    }
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}

function createComponentDef(Ctor) {
    var isStateful = isElementComponent(Ctor);
    var name = Ctor.name;
    assert.isTrue(name && typeof name === 'string', toString(Ctor) + " should have a name property which must be a string instead of " + name + ".");
    assert.isTrue(Ctor.constructor, "Missing " + name + ".constructor, " + name + " should have a constructor property.");
    var props = getPublicPropertiesHash(Ctor);
    if (isStateful) {
        var proto = Ctor.prototype;
        for (var propName in props) {
            // initializing getters and setters for each public props on the target prototype
            assert.invariant(!getOwnPropertyDescriptor(proto, propName), "Invalid " + name + ".prototype." + propName + " definition, it cannot be a prototype definition if it is a public property, use the constructor to define it instead.");
            defineProperties(proto, createPublicPropertyDescriptorMap(propName));
        }
    } else {
        // TODO: update when functionals are supported
        throw new TypeError(name + " is not an Element. At the moment, only components extending Element from \"engine\" are supported. Functional components will eventually be supported.");
    }
    var methods = isStateful ? getPublicMethodsHash(Ctor) : EmptyObject;
    var observedAttrs = isStateful ? getObservedAttributesHash(Ctor) : EmptyObject;
    var def = {
        name: name,
        isStateful: isStateful,
        props: props,
        methods: methods,
        observedAttrs: observedAttrs
    };
    assert.block(function devModeCheck() {
        freeze(Ctor);
        freeze(Ctor.prototype);
        freeze(def);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
    });
    return def;
}

function createPublicPropertyDescriptorMap(propName) {
    var descriptors = {};
    function getter() {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        var cmpProps = vm.cmpProps,
            component = vm.component;

        if (isUndefined(component)) {
            assert.logError("You should not attempt to read the value of public property " + propName + " in \"" + vm + "\" during the construction process because its value has not been set by the owner component yet. Use the constructor to set default values for each public property.");
            return;
        }
        if (isRendering) {
            // this is needed because the proxy used by template.js is not sufficient
            // for public props accessed from within a getter in the component.
            subscribeToSetHook(vmBeingRendered, cmpProps, propName);
        }
        return cmpProps[propName];
    }
    function setter(value) {
        var vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        var vm = vnode.vm;

        assert.vm(vm);
        var cmpProps = vm.cmpProps,
            component = vm.component;

        if (component) {
            assert.logError("Component \"" + vm + "\" can only set a new value for public property " + propName + " during construction.");
            return;
        }
        // proxifying before storing it is a must for public props
        cmpProps[propName] = (typeof value === "undefined" ? "undefined" : _typeof$1(value)) === 'object' ? getPropertyProxy(value) : value;
    }
    descriptors[propName] = {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    };
    return descriptors;
}

function getPublicPropertiesHash(target) {
    var props = target.publicProps || {};
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce(function (propsHash, propName) {
        assert.block(function devModeCheck() {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                var _GlobalHTMLProperties = GlobalHTMLProperties[propName],
                    error = _GlobalHTMLProperties.error,
                    attribute = _GlobalHTMLProperties.attribute,
                    experimental = _GlobalHTMLProperties.experimental;

                var msg = [];
                if (error) {
                    msg.push(error);
                } else if (experimental) {
                    msg.push("Writing logic that relies on experimental property `" + propName + "` is discouraged, until this feature is standarized and supported by all evergreen browsers. Property `" + propName + "` and attribute \"" + attribute + "\" will be ignored by this engine to prevent you from producing non-standard components.");
                } else {
                    // TODO: this only applies to stateful components, need more details.
                    msg.push("Re-defining a reserved global HTML property `" + propName + "` is not allowed in Component \"" + target.name + "\". You cannot access to the value of the global property directly, but since this property is reflective of attribute \"" + attribute + "\", you have two options to can access to the attribute value:");
                    msg.push("  * Use `this.getAttribute(\"" + attribute + "\")` to access the attribute value at any given time. This option is more suitable for accessing the value in a getter during the rendering process.");
                    msg.push("  * Declare `static observedAttributes = [\"" + attribute + "\"]` and then use the `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification every time the attribute \"" + attribute + "\" changes. This option is more suitable for reactive programming, e.g.: fetching new content every time the attribute is updated.");
                }
                console.error(msg.join('\n'));
            }
        });
        propsHash[propName] = 1;
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(target) {
    var publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce(function (methodsHash, methodName) {
        methodsHash[methodName] = 1;
        assert.block(function devModeCheck() {
            assert.isTrue(typeof target.prototype[methodName] === 'function', "Component \"" + target.name + "\" should have a method `" + methodName + "` instead of " + target.prototype[methodName] + ".");
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}

function getObservedAttributesHash(target) {
    // To match WC semantics, only if you have the callback in the prototype, you
    if (!target.prototype.attributeChangedCallback || !target.observedAttributes || !target.observedAttributes.length) {
        return EmptyObject;
    }
    return target.observedAttributes.reduce(function (observedAttributes, attrName) {
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, create(null));
}

function getComponentDef(Ctor) {
    var def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    def = createComponentDef(Ctor);
    CtorToDefMap.set(Ctor, def);
    return def;
}

function createVM(vnode) {
    assert.vnode(vnode);
    assert.invariant(vnode.elm instanceof HTMLElement, "VM creation requires a DOM element to be associated to vnode " + vnode + ".");
    var Ctor = vnode.Ctor;

    var def = getComponentDef(Ctor);
    console.log("[object:vm " + def.name + "] is being initialized.");
    if (!def.isStateful) {
        // TODO: update when functionals are supported
        throw new TypeError(def.name + " is not an Element. At the moment, only components extending Element from \"engine\" are supported. Functional components will eventually be supported.");
    }
    var vm = {
        isScheduled: false,
        isDirty: true,
        wasInserted: false,
        def: def,
        context: {},
        cmpProps: {},
        cmpState: undefined,
        cmpSlots: undefined,
        cmpEvents: undefined,
        cmpClasses: undefined,
        classListObj: undefined,
        component: undefined,
        // used to store the latest result of the render method
        fragment: [],
        // used to track down all object-key pairs that makes this vm reactive
        deps: []
    };
    assert.block(function devModeCheck() {
        vm.toString = function () {
            return "[object:vm " + def.name + "]";
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
}

var ComponentToVNodeMap = new WeakMap();

var vnodeBeingConstructed = null;

function setLinkedVNode(component, vnode) {
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, "Only DOM elements can be linked to their corresponding component.");
    ComponentToVNodeMap.set(component, vnode);
}

function getLinkedVNode(component) {
    assert.isTrue(component, "invalid component");
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
        var vnode = getLinkedVNode(vm.component);
        assert.isTrue(vnode.elm instanceof HTMLElement, "rehydration can only happen after " + vm + " was patched the first time.");
        var sel = vnode.sel,
            Ctor = vnode.Ctor,
            _vnode$data = vnode.data,
            hook = _vnode$data.hook,
            key = _vnode$data.key,
            slotset = _vnode$data.slotset,
            attrs = _vnode$data.attrs,
            className = _vnode$data.className,
            classMap = _vnode$data.classMap,
            _props = _vnode$data._props,
            _on = _vnode$data._on,
            children = vnode.children;

        assert.invariant(isArray(children), "Rendered " + vm + ".children should always have an array of vnodes instead of " + toString(children));
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode (oldVnode) with the exact same data was used
        // to patch this vnode the last time, mimic what happen when the
        // owner re-renders, but we do so by keeping the vnode originally used by parent
        // as the source of true, in case the parent tries to rehydrate against that one.
        // TODO: we can optimize this proces by using proto-chain, or Object.assign() without
        // having to call h() directly.
        var oldVnode = h(sel, vnode.data, vnode.children);
        oldVnode.Ctor = Ctor;
        oldVnode.elm = vnode.elm;
        oldVnode.vm = vnode.vm;
        // This list here must be in synch with api.c()
        // TODO: abstract this so we don't have to keep code in sync.
        vnode.data = { hook: hook, key: key, slotset: slotset, attrs: attrs, className: className, classMap: classMap, _props: _props, _on: _on };
        vnode.children = [];
        patch(oldVnode, vnode);
    }
    vm.isScheduled = false;
}

function scheduleRehydration(vm) {
    assert.vm(vm);
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        addCallbackToNextTick(function () {
            return rehydrate(vm);
        });
    }
}

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode, vnode) {
    var Ctor = vnode.Ctor;

    if (isUndefined(Ctor)) {
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

var componentInit = {
    create: initializeComponent,
    update: initializeComponent
};

var EmptyObj = create(null);

function syncProps(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }

    var oldProps = oldVnode.data._props;
    var newProps = vnode.data._props;

    // infuse key-value pairs from _props into the component

    if (oldProps !== newProps && (oldProps || newProps)) {
        var key = void 0,
            cur = void 0;
        oldProps = oldProps || EmptyObj;
        newProps = newProps || EmptyObj;
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
    assert.invariant(vnode.data.props === undefined, 'vnode.data.props should be undefined.');
    // TODO: opt out if cmpProps is empty (right now it is never empty)
    vnode.data.props = assign({}, vm.cmpProps);
}

var componentProps = {
    create: syncProps,
    update: syncProps
};

var EmptyObj$1 = create(null);

function observeAttributes(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }
    var observedAttrs = vm.def.observedAttrs;

    if (observedAttrs.length === 0) {
        return; // nothing to observe
    }

    var oldAttrs = oldVnode.data.attrs;
    var newAttrs = vnode.data.attrs;

    // infuse key-value pairs from _props into the component

    if (oldAttrs !== newAttrs && (oldAttrs || newAttrs)) {

        var key = void 0,
            cur = void 0;
        oldAttrs = oldAttrs || EmptyObj$1;
        newAttrs = newAttrs || EmptyObj$1;
        // removed props should be reset in component's props
        for (key in oldAttrs) {
            if (key in observedAttrs && !(key in newAttrs)) {
                invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], null);
            }
        }

        // new or different props should be set in component's props
        for (key in newAttrs) {
            if (key in observedAttrs) {
                cur = newAttrs[key];
                if (!(key in oldAttrs) || oldAttrs[key] != cur) {
                    invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], cur);
                }
            }
        }
    }
}

var componentAttrs = {
    create: observeAttributes,
    update: observeAttributes
};

function syncClassNames(oldVnode, vnode) {
    var data = vnode.data,
        vm = vnode.vm;

    assert.invariant(data.class === undefined, "Engine Error: vnode.data.class should be undefined for " + vm + ".");
    var className = data.className,
        classMap = data.classMap;

    if (isUndefined(className) && isUndefined(classMap) && isUndefined(vm)) {
        return;
    }

    // split className, and make it a map object, this is needed in case the consumer of
    // the component provides a computed value, e.g.: `<x class={computedClassname}>`.
    // In this
    if (className) {
        assert.invariant(!classMap, "Compiler Error: vnode.data.classMap cannot be present when vnode.data.className is defined for " + vm + ".");
        classMap = getMapFromClassName(className);
    }

    var cmpClassMap = void 0;
    if (vm) {
        cmpClassMap = vm.cmpClasses;
    }
    if (classMap || cmpClassMap) {
        // computing the mashup between className (computed), classMap, and cmpClassMap (from component)
        data.class = assign({}, classMap, cmpClassMap);
    }
}

var componentClasses = {
    create: syncClassNames,
    update: syncClassNames
};

var EmptyObj$2 = create(null);

function update(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }

    var oldSlots = oldVnode.data.slotset;
    var newSlots = vnode.data.slotset;

    // infuse key-value pairs from slotset into the component

    if (oldSlots !== newSlots && (oldSlots || newSlots)) {
        var key = void 0,
            cur = void 0;
        oldSlots = oldSlots || EmptyObj$2;
        newSlots = newSlots || EmptyObj$2;
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

var EmptyObj$3 = create(null);

function syncEvents(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }

    var newOn = vnode.data._on;

    if (isUndefined(vm.cmpEvents)) {
        assert.invariant(vnode.data.on === undefined, 'vnode.data.on should be undefined.');
        vnode.data.on = newOn; // short-circuite for the case where there is no event from within
        return;
    }
    var oldOn = oldVnode.data._on;

    var key = void 0,
        cur = void 0,
        old = void 0;

    // infuse key-value pairs from _on into the component
    if (oldOn !== newOn && (oldOn || newOn)) {
        oldOn = oldOn || EmptyObj$3;
        newOn = newOn || EmptyObj$3;
        // removed event handlers should be reset in component's events
        for (key in oldOn) {
            if (!(key in newOn)) {
                removeComponentEventListener(vm, key, oldOn[key]);
            }
        }

        // new or different event handlers should be set in component's events
        for (key in newOn) {
            cur = newOn[key];
            old = oldOn[key];
            if (key in oldOn && old != cur) {
                removeComponentEventListener(vm, key, oldOn[key]);
            }
            if (oldOn[key] != cur) {
                addComponentEventListener(vm, key, cur);
            }
        }
    }

    // reflection of component event handlers into data.on for the regular diffing algo
    if (vm.cmpEvents) {
        assert.invariant(vnode.data.on === undefined, 'vnode.data.on should be undefined.');
        vnode.data.on = assign({}, vm.cmpEvents);
    }
}

var componentEvents = {
    create: syncEvents,
    update: syncEvents
};

function rerender(oldVnode, vnode) {
    var vm = vnode.vm;

    if (isUndefined(vm)) {
        return;
    }
    var children = vnode.children;
    // if diffing is against an inserted VM, it means the element is already
    // in the DOM and we can compute its body.

    if (vm.wasInserted && vm.isDirty) {
        assert.invariant(oldVnode.children !== children, "If component is dirty, the children collections must be different. In theory this should never happen.");
        renderComponent(vm);
    }
    // replacing the vnodes in the children array without replacing the array itself
    // because the engine has a hard reference to the original array object.
    children.length = 0;
    ArrayPush.apply(children, vm.fragment);
}

var componentChildren = {
    create: rerender,
    update: rerender
};

var EmptyObj$4 = create(null);

// TODO: eventually use the one shipped by snabbdom directly
function update$1(oldVnode, vnode) {
    var oldProps = oldVnode.data.props;
    var props = vnode.data.props;

    if (isUndefined(oldProps) && isUndefined(props)) {
        return;
    }
    if (oldProps === props) {
        return;
    }

    oldProps = oldProps || EmptyObj$4;
    props = props || EmptyObj$4;

    var key = void 0,
        cur = void 0,
        old = void 0;
    var elm = vnode.elm;


    for (key in oldProps) {
        if (!(key in props)) {
            if (vnode.isRoot) {
                // custom elements created programatically prevent you from
                // deleting the property because it has a set/get to update
                // the corresponding component, in this case, we just set it
                // to undefined, which has the same effect.
                elm[key] = undefined;
            } else {
                delete elm[key];
            }
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                assert.block(function devModeCheck() {
                    if (elm[key] === cur && old !== undefined && !vnode.isRoot) {
                        console.warn("unneccessary update of property \"" + key + "\" in " + elm + ", it has the same value in " + (vnode.vm || vnode) + ".");
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

var array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}

function createElement$1(tagName) {
    return document.createElement(tagName);
}
function createElementNS(namespaceURI, qualifiedName) {
    return document.createElementNS(namespaceURI, qualifiedName);
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createComment(text) {
    return document.createComment(text);
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
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
var htmlDomApi = {
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
    isComment: isComment
};

function isUndef(s) {
    return s === undefined;
}
function isDef(s) {
    return s !== undefined;
}
var emptyNode = vnode('', {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode) {
    return vnode.sel !== undefined;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i,
        map = {},
        key,
        ch;
    for (i = beginIdx; i <= endIdx; ++i) {
        ch = children[i];
        if (ch != null) {
            key = ch.key;
            if (key !== undefined) map[key] = i;
        }
    }
    return map;
}
var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
// export { h } from './h';
// export { thunk } from './thunk';
function init(modules, domApi) {
    var i,
        j,
        cbs = {};
    var api = domApi !== undefined ? domApi : htmlDomApi;
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                cbs[hooks[i]].push(hook);
            }
        }
    }
    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                var parent_1 = api.parentNode(childElm);
                api.removeChild(parent_1, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var i,
            data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
                data = vnode.data;
            }
        }
        var children = vnode.children,
            sel = vnode.sel;
        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);
        } else if (sel !== undefined) {
            // Parse selector
            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.', hashIdx);
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag) : api.createElement(tag);
            if (hash < dot) elm.id = sel.slice(hash + 1, dot);
            if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
            for (i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, vnode);
            }if (array(children)) {
                for (i = 0; i < children.length; ++i) {
                    var ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            } else if (primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (i.create) i.create(emptyNode, vnode);
                if (i.insert) insertedVnodeQueue.push(vnode);
            }
        } else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var i,
            j,
            data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
            for (i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](vnode);
            }if (vnode.children !== undefined) {
                for (j = 0; j < vnode.children.length; ++j) {
                    i = vnode.children[j];
                    if (i != null && typeof i !== "string") {
                        invokeDestroyHook(i);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0,
                listeners = void 0,
                rm = void 0,
                ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1) {
                        cbs.remove[i_1](ch, rm);
                    }if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                        i_1(ch, rm);
                    } else {
                        rm();
                    }
                } else {
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
        var oldKeyToIdx;
        var idxInOld;
        var elmToMove;
        var before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            } else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            } else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            } else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    } else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
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
        var elm = vnode.elm = oldVnode.elm;
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        if (oldVnode === vnode) return;
        if (vnode.data !== undefined) {
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
    return function patch(oldVnode, vnode) {
        var i, elm, parent;
        var insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i) {
            cbs.pre[i]();
        }if (!isVnode(oldVnode)) {
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

var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var ColonCharCode = 58;
var XCharCode = 120;

function updateAttrs(oldVnode, vnode) {
    var oldAttrs = oldVnode.data.attrs;
    var attrs = vnode.data.attrs;


    if (!oldAttrs && !attrs) {
        return;
    }
    if (oldAttrs === attrs) {
        return;
    }
    var elm = vnode.elm;

    var key = void 0;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};

    // update modified attributes, add new attributes
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            } else if (cur === false) {
                elm.removeAttribute(key);
            } else {
                if (key.charCodeAt(0) !== XCharCode) {
                    elm.setAttribute(key, cur);
                } else if (key.charCodeAt(3) === ColonCharCode) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                } else if (key.charCodeAt(5) === ColonCharCode) {
                    // Assume xlink namespace
                    elm.setAttributeNS(xlinkNS, key, cur);
                } else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
    // remove removed attributes
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}

var attributesModule = {
    create: updateAttrs,
    update: updateAttrs
};

var DashCharCode = 45;

function updateStyle(oldVnode, vnode) {
    var oldStyle = oldVnode.data.style;
    var style = vnode.data.style;


    if (!oldStyle && !style) {
        return;
    }
    if (oldStyle === style) {
        return;
    }
    oldStyle = oldStyle || {};
    style = style || {};

    var name = void 0;
    var elm = vnode.elm;

    for (name in oldStyle) {
        if (!(name in style)) {
            elm.style.removeProperty(name);
        }
    }
    for (name in style) {
        var cur = style[name];
        if (cur !== oldStyle[name]) {
            if (name.charCodeAt(0) === DashCharCode && name.charCodeAt(1) === DashCharCode) {
                // if the name is prefied with --, it will be considered a variable, and setProperty() is needed
                elm.style.setProperty(name, cur);
            } else {
                elm.style[name] = cur;
            }
        }
    }
}

var styleModule = {
    create: updateStyle,
    update: updateStyle
};

function updateClass(oldVnode, vnode) {
  var cur,
      name,
      elm = vnode.elm,
      oldClass = oldVnode.data.class,
      klass = vnode.data.class;

  if (!oldClass && !klass) return;
  if (oldClass === klass) return;
  oldClass = oldClass || {};
  klass = klass || {};

  for (name in oldClass) {
    if (!klass[name]) {
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

var classModule = {
  create: updateClass,
  update: updateClass
};

var _typeof$6 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function invokeHandler(handler, vnode, event) {
  if (typeof handler === "function") {
    // call function handler
    handler.call(vnode, event, vnode);
  } else if ((typeof handler === "undefined" ? "undefined" : _typeof$6(handler)) === "object") {
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

var eventListenersModule = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
};

var patch = init([componentInit, componentSlotset, componentProps, componentAttrs, componentClasses, componentEvents, componentChildren, props, attributesModule, classModule, styleModule, eventListenersModule]);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Element$prototype = Element.prototype;
var getAttribute = _Element$prototype.getAttribute;
var setAttribute = _Element$prototype.setAttribute;
var removeAttribute = _Element$prototype.removeAttribute;
function linkAttributes(element, vm) {
    assert.vm(vm);
    var _vm$def = vm.def,
        propsConfig = _vm$def.props,
        observedAttrs = _vm$def.observedAttrs;
    // replacing mutators and accessors on the element itself to catch any mutation

    element.getAttribute = function (attrName) {
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.block(function devModeCheck() {
                throw new ReferenceError("Invalid Attribute \"" + attrName + "\" for component " + vm + ". Instead of using `element.getAttribute(\"" + attrName + "\")` you can access the corresponding public property using `element." + propName + ";`. This distintion is important because getAttribute will returned the value casted to string.");
            });
            return;
        }
        return getAttribute.call(element, attrName);
    };
    element.setAttribute = function (attrName, newValue) {
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.block(function devModeCheck() {
                throw new ReferenceError("Invalid Attribute \"" + attrName + "\" for component " + vm + ". Instead of using `element.setAttribute(\"" + attrName + "\", someValue)` you can update the corresponding public property using `element." + propName + " = someValue;`. This distintion is important because setAttribute will cast the new value to string before setting it into the corresponding property.");
            });
            return;
        }
        var oldValue = getAttribute.call(element, attrName);
        setAttribute.call(element, attrName, newValue);
        newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
    element.removeAttribute = function (attrName) {
        attrName = attrName.toLocaleLowerCase();
        var propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.block(function devModeCheck() {
                throw new ReferenceError("Invalid Attribute \"" + attrName + "\" for component " + vm + ". Instead of using `element.removeAttribute(\"" + attrName + "\")` you can update the corresponding public property using `element." + propName + " = undefined;`. This distintion is important because removeAttribute will set the corresponding property value to `null`.");
            });
            return;
        }

        assert.block(function devModeCheck() {
            var propName = getPropNameFromAttrName(attrName);
            if (propsConfig[propName]) {
                updateComponentProp(vm, propName, newValue);
                if (vm.isDirty) {
                    console.log("Scheduling " + vm + " for rehydration.");
                    scheduleRehydration(vm);
                }
            }
        });
        var oldValue = getAttribute.call(element, attrName);
        removeAttribute.call(element, attrName);
        var newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
}

function linkProperties(element, vm) {
    assert.vm(vm);
    var component = vm.component,
        _vm$def2 = vm.def,
        propsConfig = _vm$def2.props,
        methods = _vm$def2.methods;

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
            set: function set(value) {
                // proxifying before storing it is a must for public props
                value = (typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object' ? getPropertyProxy(value) : value;
                updateComponentProp(vm, propName, value);
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

    if (isUndefined(slotNames)) {
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
    if (isUndefined(Ctor)) {
        throw new TypeError("Invalid Component Definition: " + Ctor + ".");
    }
    var props = getInitialProps(element, Ctor);
    var slotset = getInitialSlots(element, Ctor);
    var tagName = element.tagName.toLowerCase();
    var vnode = c(tagName, Ctor, { props: props, slotset: slotset, className: element.className || undefined });
    vnode.isRoot = true;
    // TODO: eventually after updating snabbdom we can use toVNode(element)
    // as the first argument to reconstruct the vnode that represents the
    // current state.

    var _patch = patch(element, vnode),
        vm = _patch.vm;

    linkAttributes(element, vm);
    // TODO: for vnode with element we might not need to do any of these.
    linkProperties(element, vm);
}

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then we fallback to the normal Web-Components workflow.
 */
function createElement(tagName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var Ctor = typeof options.is === 'function' ? options.is : null;
    if (Ctor) {
        delete options.is;
    }
    var element = document.createElement(tagName, options);
    if (Ctor && element instanceof HTMLElement) {
        upgradeElement(element, Ctor);
    }
    return element;
}

// TODO: how can a user dismount a component and kick in the destroy mechanism?

exports.createElement = createElement;
exports.getComponentDef = getComponentDef;
exports.Element = ComponentElement;

}((this.Engine = this.Engine || {})));
/** version: 0.7.0 */
//# sourceMappingURL=engine.js.map
