/* proxy-compat-disable */

Object.setPrototypeOf = Object.setPrototypeOf || function(o, p) { o.__proto__ = p; return o; }
Object.definePropertyNative = Object.defineProperty;
Object.definePropertiesNative = Object.defineProperties;
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// THIS POLYFILL HAS BEEN MODIFIED FROM THE SOURCE
// https://github.com/eligrey/classList.js

if ("document" in self) {

    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if (
           !("classList" in document.createElement("_"))
        || document.createElementNS
        && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))
    ) {

    (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
          classListProp = "classList"
        , protoProp = "prototype"
        , elemCtrProto = view.Element[protoProp]
        , objCtr = Object
        , strTrim = String[protoProp].trim || function () {
            return this.replace(/^\s+|\s+$/g, "");
        }
        , arrIndexOf = Array[protoProp].indexOf || function (item) {
            var
                  i = 0
                , len = this.length
            ;
            for (; i < len; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        }
        // Vendors: please allow content code to instantiate DOMExceptions
        , DOMEx = function (type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
        }
        , checkTokenAndGetIndex = function (classList, token) {
            if (token === "") {
                throw new DOMEx(
                      "SYNTAX_ERR"
                    , "The token must not be empty."
                );
            }
            if (/\s/.test(token)) {
                throw new DOMEx(
                      "INVALID_CHARACTER_ERR"
                    , "The token must not contain space characters."
                );
            }
            return arrIndexOf.call(classList, token);
        }
        , ClassList = function (elem) {
            var
                  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                , i = 0
                , len = classes.length
            ;
            for (; i < len; i++) {
                this.push(classes[i]);
            }
            this._updateClassName = function () {
                elem.setAttribute("class", this.toString());
            };
        }
        , classListProto = ClassList[protoProp] = []
        , classListGetter = function () {
            return new ClassList(this);
        }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
        return this[i] || null;
    };
    classListProto.contains = function (token) {
        return checkTokenAndGetIndex(this, token + "") !== -1;
    };
    classListProto.add = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
        ;
        do {
            token = tokens[i] + "";
            if (checkTokenAndGetIndex(this, token) === -1) {
                this.push(token);
                updated = true;
            }
        }
        while (++i < l);

        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.remove = function () {
        var
              tokens = arguments
            , i = 0
            , l = tokens.length
            , token
            , updated = false
            , index
        ;
        do {
            token = tokens[i] + "";
            index = checkTokenAndGetIndex(this, token);
            while (index !== -1) {
                this.splice(index, 1);
                updated = true;
                index = checkTokenAndGetIndex(this, token);
            }
        }
        while (++i < l);

        if (updated) {
            this._updateClassName();
        }
    };
    classListProto.toggle = function (token, force) {
        var
              result = this.contains(token)
            , method = result ?
                force !== true && "remove"
            :
                force !== false && "add"
        ;

        if (method) {
            this[method](token);
        }

        if (force === true || force === false) {
            return force;
        } else {
            return !result;
        }
    };
    classListProto.replace = function (token, replacement_token) {
        var index = checkTokenAndGetIndex(token + "");
        if (index !== -1) {
            this.splice(index, 1, replacement_token);
            this._updateClassName();
        }
    }
    classListProto.toString = function () {
        return this.join(" ");
    };

    if (objCtr.defineProperty) {
        var classListPropDesc = {
              get: classListGetter
            , enumerable: true
            , configurable: true
        };
        try {
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
            // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
            // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
            if (ex.number === undefined || ex.number === -0x7FF5EC54) {
                classListPropDesc.enumerable = false;
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            }
        }
    } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(self));

    }

    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
        "use strict";

        var testElement = document.createElement("_");

        testElement.classList.add("c1", "c2");

        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
        // classList.remove exist but support only one argument at a time.
        if (!testElement.classList.contains("c2")) {
            var createMethod = function(method) {
                var original = DOMTokenList.prototype[method];

                DOMTokenList.prototype[method] = function(token) {
                    var i, len = arguments.length;

                    for (i = 0; i < len; i++) {
                        token = arguments[i];
                        original.call(this, token);
                    }
                };
            };
            createMethod('add');
            createMethod('remove');
        }

        testElement.classList.toggle("c3", false);

        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains("c3")) {
            var _toggle = DOMTokenList.prototype.toggle;

            DOMTokenList.prototype.toggle = function(token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                    return force;
                } else {
                    return _toggle.call(this, token);
                }
            };

        }

        // replace() polyfill
        if (!("replace" in document.createElement("_").classList)) {
            DOMTokenList.prototype.replace = function (token, replacement_token) {
                var
                      tokens = this.toString().split(" ")
                    , index = tokens.indexOf(token + "")
                ;
                if (index !== -1) {
                    tokens = tokens.slice(index);
                    this.remove.apply(this, tokens);
                    this.add(replacement_token);
                    this.add.apply(this, tokens.slice(1));
                }
            }
        }

        testElement = null;
    }());

    }
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
(function() {
    "use strict";

    var create = Object.create;
    var defineProperty = Object.defineProperty;

    var defaultPreventedDescriptor = {
        get: function () { return true; }
    };

    var preventDefault = function () {
        if (this.defaultPrevented === true || this.cancelable !== true) {
            return;
        }

        defineProperty(this, "defaultPrevented", defaultPreventedDescriptor);
    }

    if (typeof CustomEvent !== 'function') {
        window.CustomEvent = function CustomEvent(type, eventInitDict) {
            if (!type) {
                throw Error('TypeError: Failed to construct "CustomEvent": An event name must be provided.');
            }

            var event;
            eventInitDict = eventInitDict || { bubbles: false, cancelable: false, detail: null };

            if ('createEvent' in document) {
                try {
                    event = document.createEvent('CustomEvent');
                    event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
                } catch (error) {
                    // for browsers which don't support CustomEvent at all, we use a regular event instead
                    event = document.createEvent('Event');
                    event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
                    event.detail = eventInitDict.detail;
                }
            } else {

                // IE8
                event = new Event(type, eventInitDict);
                event.detail = eventInitDict && eventInitDict.detail || null;
            }

            // We attach the preventDefault to the instance instead of the prototype:
            //  - We don't want to mutate the Event.prototype.
            //  - Adding an indirection (adding a new level of inheritance) would slow down all the access to the Event properties.
            event.preventDefault = preventDefault;

            // Warning we can't add anything to the CustomEvent prototype because we are returning an event, instead of the this object.
            return event;
        };

        // We also assign Event.prototype to CustomEvent.prototype to ensure that consumer can use the following form
        // CustomEvent.prototype.[method]
        CustomEvent.prototype = Event.prototype;
    }
}());
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
(function () {
	var unlistenableWindowEvents = {
		click: 1,
		dblclick: 1,
		keyup: 1,
		keypress: 1,
		keydown: 1,
		mousedown: 1,
		mouseup: 1,
		mousemove: 1,
		mouseover: 1,
		mouseenter: 1,
		mouseleave: 1,
		mouseout: 1,
		storage: 1,
		storagecommit: 1,
		textinput: 1
	};

	function indexOf(array, element) {
		var
		index = -1,
		length = array.length;

		while (++index < length) {
			if (index in array && array[index] === element) {
				return index;
			}
		}

		return -1;
	}

	var existingProto = (window.Event && window.Event.prototype) || null;
	window.Event = Window.prototype.Event = function Event(type, eventInitDict) {
		if (!type) {
			throw new Error('Not enough arguments');
		}

		// Shortcut if browser supports createEvent
		if ('createEvent' in document) {
			var event = document.createEvent('Event');
			var bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
			var cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

			event.initEvent(type, bubbles, cancelable);

			return event;
		}

		var event = document.createEventObject();

		event.type = type;
		event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
		event.cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

		return event;
	};
	if (existingProto) {
		Object.defineProperty(window.Event, 'prototype', {
			configurable: false,
			enumerable: false,
			writable: true,
			value: existingProto
		});
	}

	if (!('createEvent' in document)) {
		window.addEventListener = Window.prototype.addEventListener = Document.prototype.addEventListener = Element.prototype.addEventListener = function addEventListener() {
			var
			element = this,
			type = arguments[0],
			listener = arguments[1];

			if (element === window && type in unlistenableWindowEvents) {
				throw new Error('In IE8 the event: ' + type + ' is not available on the window object. Please see https://github.com/Financial-Times/polyfill-service/issues/317 for more information.');
			}

			if (!element._events) {
				element._events = {};
			}

			if (!element._events[type]) {
				element._events[type] = function (event) {
					var
					list = element._events[event.type].list,
					events = list.slice(),
					index = -1,
					length = events.length,
					eventElement;

					event.preventDefault = function preventDefault() {
						if (event.cancelable !== false) {
							event.returnValue = false;
						}
					};

					event.stopPropagation = function stopPropagation() {
						event.cancelBubble = true;
					};

					event.stopImmediatePropagation = function stopImmediatePropagation() {
						event.cancelBubble = true;
						event.cancelImmediate = true;
					};

					event.currentTarget = element;
					event.relatedTarget = event.fromElement || null;
					event.target = event.target || event.srcElement || element;
					event.timeStamp = new Date().getTime();

					if (event.clientX) {
						event.pageX = event.clientX + document.documentElement.scrollLeft;
						event.pageY = event.clientY + document.documentElement.scrollTop;
					}

					while (++index < length && !event.cancelImmediate) {
						if (index in events) {
							eventElement = events[index];

							if (indexOf(list, eventElement) !== -1 && typeof eventElement === 'function') {
								eventElement.call(element, event);
							}
						}
					}
				};

				element._events[type].list = [];

				if (element.attachEvent) {
					element.attachEvent('on' + type, element._events[type]);
				}
			}

			element._events[type].list.push(listener);
		};

		window.removeEventListener = Window.prototype.removeEventListener = Document.prototype.removeEventListener = Element.prototype.removeEventListener = function removeEventListener() {
			var
			element = this,
			type = arguments[0],
			listener = arguments[1],
			index;

			if (element._events && element._events[type] && element._events[type].list) {
				index = indexOf(element._events[type].list, listener);

				if (index !== -1) {
					element._events[type].list.splice(index, 1);

					if (!element._events[type].list.length) {
						if (element.detachEvent) {
							element.detachEvent('on' + type, element._events[type]);
						}
						delete element._events[type];
					}
				}
			}
		};

		window.dispatchEvent = Window.prototype.dispatchEvent = Document.prototype.dispatchEvent = Element.prototype.dispatchEvent = function dispatchEvent(event) {
			if (!arguments.length) {
				throw new Error('Not enough arguments');
			}

			if (!event || typeof event.type !== 'string') {
				throw new Error('DOM Events Exception 0');
			}

			var element = this, type = event.type;

			try {
				if (!event.bubbles) {
					event.cancelBubble = true;

					var cancelBubbleEvent = function (event) {
						event.cancelBubble = true;

						(element || window).detachEvent('on' + type, cancelBubbleEvent);
					};

					this.attachEvent('on' + type, cancelBubbleEvent);
				}

				this.fireEvent('on' + type, event);
			} catch (error) {
				event.target = element;

				do {
					event.currentTarget = element;

					if ('_events' in element && typeof element._events[type] === 'function') {
						element._events[type].call(element, event);
					}

					if (typeof element['on' + type] === 'function') {
						element['on' + type].call(element, event);
					}

					element = element.nodeType === 9 ? element.parentWindow : element.parentNode;
				} while (element && !event.cancelBubble);
			}

			return true;
		};

		// Add the DOMContentLoaded Event
		document.attachEvent('onreadystatechange', function() {
			if (document.readyState === 'complete') {
				document.dispatchEvent(new Event('DOMContentLoaded', {
					bubbles: true
				}));
			}
		});
	}
}());

(function() {
    var exports, module, define = undefined;
    /* proxy-compat-disable */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Proxy = factory());
}(this, (function () { 'use strict';

    function __extends(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    var _a = Object, getOwnPropertyNames = _a.getOwnPropertyNames, create = _a.create, keys = _a.keys, getOwnPropertyDescriptor = _a.getOwnPropertyDescriptor, preventExtensions = _a.preventExtensions, defineProperty = _a.defineProperty, hasOwnProperty = _a.hasOwnProperty, isExtensible = _a.isExtensible, getPrototypeOf = _a.getPrototypeOf, setPrototypeOf = _a.setPrototypeOf;
    var _b = Array.prototype, ArraySlice = _b.slice, ArrayShift = _b.shift, ArrayUnshift = _b.unshift, ArrayConcat = _b.concat;
    var isArray = Array.isArray;

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function isUndefined(value) {
        return value === undefined;
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function getOwnPropertyDescriptor$1(replicaOrAny, key) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.getOwnPropertyDescriptor(key);
        }
        return getOwnPropertyDescriptor(replicaOrAny, key);
    }
    function getOwnPropertyNames$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.ownKeys().filter(function (key) { return key.constructor !== Symbol; }); // TODO: only strings
        }
        return getOwnPropertyNames(replicaOrAny);
    }
    // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
    // https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys
    function OwnPropertyKeys(O) {
        return ArrayConcat.call(Object.getOwnPropertyNames(O), Object.getOwnPropertySymbols(O));
    }
    function assign(replicaOrAny) {
        if (replicaOrAny == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(replicaOrAny);
        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
            if (nextSource != null) { // Skip over if undefined or null
                var objectKeys = OwnPropertyKeys(nextSource);
                // tslint:disable-next-line:prefer-for-of
                for (var i = 0; i < objectKeys.length; i += 1) {
                    var nextKey = objectKeys[i];
                    var descriptor = getOwnPropertyDescriptor$1(nextSource, nextKey);
                    if (descriptor !== undefined && descriptor.enumerable === true) {
                        setKey(to, nextKey, getKey(nextSource, nextKey));
                    }
                }
            }
        }
        return to;
    }
    function hasOwnProperty$1(key) {
        if (isCompatProxy(this)) {
            var descriptor = this.getOwnPropertyDescriptor(key);
            return !isUndefined(descriptor);
        }
        else {
            return hasOwnProperty.call(this, key);
        }
    }
    function keys$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            var all = replicaOrAny.forIn();
            var result = [];
            // tslint:disable-next-line:forin
            for (var prop in all) {
                var desc = replicaOrAny.getOwnPropertyDescriptor(prop);
                if (desc && desc.enumerable === true) {
                    result.push(prop);
                }
            }
            return result;
        }
        else {
            return keys(replicaOrAny);
        }
    }
    function values(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            var all = replicaOrAny.forIn();
            var result = [];
            // tslint:disable-next-line:forin
            for (var prop in all) {
                var desc = replicaOrAny.getOwnPropertyDescriptor(prop);
                if (desc && desc.enumerable === true) {
                    result.push(getKey(replicaOrAny, prop));
                }
            }
            return result;
        }
        else {
            // Calling `Object.values` instead of dereferencing the method during the module evaluation
            // since `Object.values` gets polyfilled at the module evaluation.
            return Object.values(replicaOrAny);
        }
    }
    function entries(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            var all = replicaOrAny.forIn();
            var result = [];
            // tslint:disable-next-line:forin
            for (var prop in all) {
                var desc = replicaOrAny.getOwnPropertyDescriptor(prop);
                if (desc && desc.enumerable === true) {
                    result.push([
                        prop,
                        getKey(replicaOrAny, prop)
                    ]);
                }
            }
            return result;
        }
        else {
            // Calling `Object.entries` instead of dereferencing the method during the module evaluation
            // since `Object.entries` gets polyfilled at the module evaluation.
            return Object.entries(replicaOrAny);
        }
    }
    function defineProperty$1(replicaOrAny, prop, descriptor) {
        if (isCompatProxy(replicaOrAny)) {
            replicaOrAny.defineProperty(prop, descriptor);
            return replicaOrAny;
        }
        else {
            return defineProperty(replicaOrAny, prop, descriptor);
        }
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    var ProxyTypeObject = 1;
    var ProxyTypeArray = 2;
    // Proto chain check might be needed because of usage of a limited polyfill
    // https://github.com/es-shims/get-own-property-symbols
    // In this case, because this polyfill is assing all the stuff to Object.prototype to keep
    // all the other invariants of Symbols, we need to do some manual checks here for the slow patch.
    var isNotNativeSymbol;
    var inOperator = function inOperatorCompat(obj, key) {
        if (isNotNativeSymbol === undefined) {
            if (typeof Symbol === 'undefined') {
                throw new Error('Symbol is not available. Make sure to apply symbol polyfill before calling inOperator');
            }
            isNotNativeSymbol = typeof Symbol() === 'object';
        }
        if (isNotNativeSymbol) {
            var getOwnPropertySymbols = Object.getOwnPropertySymbols;
            if (key && key.constructor === Symbol) {
                while (obj) {
                    if (getOwnPropertySymbols(obj).indexOf(key) !== -1) {
                        return true;
                    }
                    obj = getPrototypeOf(obj);
                }
                return false;
            }
            return key in obj;
        }
        return key in obj;
    };
    var defaultHandlerTraps = {
        get: function (target, key) {
            return target[key];
        },
        set: function (target, key, newValue) {
            target[key] = newValue;
            return true;
        },
        apply: function (targetFn, thisArg, argumentsList) {
            return targetFn.apply(thisArg, argumentsList);
        },
        construct: function (targetFn, argumentsList, newTarget) {
            return new (targetFn.bind.apply(targetFn, __spreadArray([void 0], argumentsList)))();
        },
        defineProperty: function (target, property, descriptor) {
            defineProperty(target, property, descriptor);
            return true;
        },
        deleteProperty: function (target, property) {
            return delete target[property];
        },
        ownKeys: function (target) {
            return OwnPropertyKeys(target);
        },
        has: function (target, propertyKey) {
            return inOperator(target, propertyKey);
        },
        preventExtensions: function (target) {
            preventExtensions(target);
            return true;
        },
        getOwnPropertyDescriptor: getOwnPropertyDescriptor,
        getPrototypeOf: getPrototypeOf,
        isExtensible: isExtensible,
        setPrototypeOf: setPrototypeOf,
    };
    var lastRevokeFn;
    var proxyTrapFalsyErrors = {
        set: function (target, key) {
            throw new TypeError("'set' on proxy: trap returned falsish for property '" + key + "'");
        },
        deleteProperty: function (target, key) {
            throw new TypeError("'deleteProperty' on proxy: trap returned falsish for property '" + key + "'");
        },
        setPrototypeOf: function (target, proto) {
            throw new TypeError("'setPrototypeOf' on proxy: trap returned falsish");
        },
        preventExtensions: function (target, proto) {
            throw new TypeError("'preventExtensions' on proxy: trap returned falsish");
        },
        defineProperty: function (target, key, descriptor) {
            throw new TypeError("'defineProperty' on proxy: trap returned falsish for property '" + key + "'");
        }
    };
    function proxifyProperty(proxy, key, descriptor) {
        var enumerable = descriptor.enumerable, configurable = descriptor.configurable;
        defineProperty(proxy, key, {
            enumerable: enumerable,
            configurable: configurable,
            get: function () {
                return proxy.get(key);
            },
            set: function (value) {
                proxy.set(key, value);
            },
        });
    }
    var XProxy = /** @class */ (function () {
        function XProxy(target, handler) {
            var targetIsFunction = typeof target === 'function';
            var targetIsArray = isArray(target);
            if ((typeof target !== 'object' || target === null) && !targetIsFunction) {
                throw new Error("Cannot create proxy with a non-object as target");
            }
            if (typeof handler !== 'object' || handler === null) {
                throw new Error("new XProxy() expects the second argument to an object");
            }
            // Construct revoke function, and set lastRevokeFn so that Proxy.revocable can steal it.
            // The caller might get the wrong revoke function if a user replaces or wraps XProxy
            // to call itself, but that seems unlikely especially when using the polyfill.
            var throwRevoked = false;
            lastRevokeFn = function () {
                throwRevoked = true;
            };
            // Define proxy as Object, or Function (if either it's callable, or apply is set).
            // tslint:disable-next-line:no-this-assignment
            var proxy = this; // reusing the already created object, eventually the prototype will be resetted
            if (targetIsFunction) {
                proxy = function Proxy() {
                    var usingNew = (this && this.constructor === proxy);
                    var args = ArraySlice.call(arguments);
                    if (usingNew) {
                        return proxy.construct(args, this);
                    }
                    else {
                        return proxy.apply(this, args);
                    }
                };
            }
            var _loop_1 = function (trapName) {
                defineProperty(proxy, trapName, {
                    value: function () {
                        if (throwRevoked) {
                            throw new TypeError("Cannot perform '" + trapName + "' on a proxy that has been revoked");
                        }
                        var args = ArraySlice.call(arguments);
                        ArrayUnshift.call(args, target);
                        var h = handler[trapName] ? handler : defaultHandlerTraps;
                        var value = h[trapName].apply(h, args);
                        if (proxyTrapFalsyErrors[trapName] && value === false) {
                            proxyTrapFalsyErrors[trapName].apply(proxyTrapFalsyErrors, args);
                        }
                        return value;
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false,
                });
            };
            // tslint:disable-next-line:forin
            for (var trapName in defaultHandlerTraps) {
                _loop_1(trapName);
            }
            var proxyDefaultHasInstance;
            var SymbolHasInstance = Symbol.hasInstance;
            var FunctionPrototypeSymbolHasInstance = Function.prototype[SymbolHasInstance];
            defineProperty(proxy, SymbolHasInstance, {
                get: function () {
                    var hasInstance = proxy.get(SymbolHasInstance);
                    // We do not want to deal with any Symbol.hasInstance here
                    // because we need to do special things to check prototypes.
                    // Symbol polyfill adds Symbol.hasInstance to the function prototype
                    // so if we have that here, we need to return our own.
                    // If the value we get from this function is different, that means
                    // user has supplied custom function so we need to respect that.
                    if (hasInstance === FunctionPrototypeSymbolHasInstance) {
                        return proxyDefaultHasInstance || (proxyDefaultHasInstance = function (inst) {
                            return defaultHasInstance(inst, proxy);
                        });
                    }
                    return hasInstance;
                },
                configurable: false,
                enumerable: false
            });
            defineProperty(proxy, '_ES5ProxyType', {
                value: targetIsArray ? ProxyTypeArray : ProxyTypeObject,
                configurable: false,
                enumerable: false,
                writable: true,
            });
            defineProperty(proxy, 'forIn', {
                value: function () {
                    return proxy.ownKeys().reduce(function (o, key) {
                        o[key] = void 0;
                        return o;
                    }, create(null));
                },
                configurable: false,
                enumerable: false,
                writable: false,
            });
            var SymbolIterator = Symbol.iterator;
            defineProperty(proxy, SymbolIterator, {
                enumerable: false,
                configurable: true,
                get: function () {
                    return this.get(SymbolIterator);
                },
                set: function (value) {
                    this.set(SymbolIterator, value);
                },
            });
            if (targetIsArray) {
                var trackedLength_1 = 0;
                var adjustArrayIndex_1 = function (newLength) {
                    // removing old indexes from proxy when needed
                    while (trackedLength_1 > newLength) {
                        delete proxy[--trackedLength_1];
                    }
                    // add new indexes to proxy when needed
                    for (var i = trackedLength_1; i < newLength; i += 1) {
                        proxifyProperty(proxy, i, {
                            enumerable: true,
                            configurable: true,
                        });
                    }
                    trackedLength_1 = newLength;
                };
                defineProperty(proxy, 'length', {
                    enumerable: false,
                    configurable: true,
                    get: function () {
                        var proxyLength = proxy.get('length');
                        // check if the trackedLength matches the length of the proxy
                        if (proxyLength !== trackedLength_1) {
                            adjustArrayIndex_1(proxyLength);
                        }
                        return proxyLength;
                    },
                    set: function (value) {
                        proxy.set('length', value);
                    },
                });
                // building the initial index. this is observable by the proxy
                // because we access the length property during the construction
                // of the proxy, but it should be fine...
                adjustArrayIndex_1(proxy.get('length'));
            }
            return proxy;
        }
        // tslint:disable-next-line:member-ordering
        XProxy.revocable = function (target, handler) {
            var p = new XProxy(target, handler);
            return {
                proxy: p,
                revoke: lastRevokeFn,
            };
        };
        XProxy.prototype.push = function () {
            var push$1 = this.get('push');
            if (push$1 === Array.prototype.push) {
                push$1 = push;
            }
            return push$1.apply(this, arguments);
        };
        XProxy.prototype.pop = function () {
            var pop$1 = this.get('pop');
            if (pop$1 === Array.prototype.pop) {
                pop$1 = pop;
            }
            return pop$1.apply(this, arguments);
        };
        XProxy.prototype.concat = function () {
            var concat = this.get('concat');
            if (concat === Array.prototype.concat) {
                concat = concat$1;
            }
            return concat.apply(this, arguments);
        };
        XProxy.prototype.splice = function () {
            var splice$1 = this.get('splice');
            if (splice$1 === Array.prototype.splice) {
                splice$1 = splice;
            }
            return splice$1.apply(this, arguments);
        };
        XProxy.prototype.shift = function () {
            var shift$1 = this.get('shift');
            if (shift$1 === Array.prototype.shift) {
                shift$1 = shift;
            }
            return shift$1.apply(this, arguments);
        };
        XProxy.prototype.unshift = function () {
            var unshift$1 = this.get('unshift');
            if (unshift$1 === Array.prototype.unshift) {
                unshift$1 = unshift;
            }
            return unshift$1.apply(this, arguments);
        };
        XProxy.prototype.toJSON = function () {
            if (this._ES5ProxyType === ProxyTypeArray) {
                var unwrappedArray = [];
                var length = this.get('length');
                for (var i = 0; i < length; i++) {
                    unwrappedArray[i] = this.get(i);
                }
                return unwrappedArray;
            }
            else {
                var toJSON = this.get('toJSON');
                if (toJSON !== undefined && typeof toJSON === 'function') {
                    return toJSON.apply(this, arguments);
                }
                var keys = this.ownKeys();
                var unwrappedObject = {};
                // tslint:disable-next-line:prefer-for-of
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var enumerable = this.getOwnPropertyDescriptor(key).enumerable;
                    if (enumerable) {
                        unwrappedObject[key] = this.get(key);
                    }
                }
                return unwrappedObject;
            }
        };
        return XProxy;
    }());

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function defaultHasInstance(instance, Type) {
        // We have to grab getPrototypeOf here
        // because caching it at the module level is too early.
        // We need our shimmed version.
        var getPrototypeOf = Object.getPrototypeOf;
        var instanceProto = getPrototypeOf(instance);
        var TypeProto = getKey(Type, 'prototype');
        while (instanceProto !== null) {
            if (instanceProto === TypeProto) {
                return true;
            }
            instanceProto = getPrototypeOf(instanceProto);
        }
        return false;
    }
    // NOTE: For performance reasons, the "_ES5ProxyType" key should be checked without
    // using this function, unless `replicaOrAny._ES5ProxyType` might throw unexpectedly.
    function isCompatProxy(replicaOrAny) {
        return replicaOrAny && replicaOrAny._ES5ProxyType;
    }
    var getKey = function (replicaOrAny, k1) {
        return replicaOrAny._ES5ProxyType ?
            replicaOrAny.get(k1) :
            replicaOrAny[k1];
    };
    var getKeys2 = function (replicaOrAny, k1, k2) {
        var replicaOrAny1 = replicaOrAny._ES5ProxyType ? replicaOrAny.get(k1) : replicaOrAny[k1];
        return replicaOrAny1._ES5ProxyType ? replicaOrAny1.get(k2) : replicaOrAny1[k2];
    };
    var getKeys3 = function (replicaOrAny, k1, k2, k3) {
        var replicaOrAny1 = replicaOrAny._ES5ProxyType ? replicaOrAny.get(k1) : replicaOrAny[k1];
        var replicaOrAny2 = replicaOrAny1._ES5ProxyType ? replicaOrAny1.get(k2) : replicaOrAny1[k2];
        return replicaOrAny2._ES5ProxyType ? replicaOrAny2.get(k3) : replicaOrAny2[k3];
    };
    var getKeys4 = function (replicaOrAny, k1, k2, k3, k4) {
        var replicaOrAny1 = replicaOrAny._ES5ProxyType ? replicaOrAny.get(k1) : replicaOrAny[k1];
        var replicaOrAny2 = replicaOrAny1._ES5ProxyType ? replicaOrAny1.get(k2) : replicaOrAny1[k2];
        var replicaOrAny3 = replicaOrAny2._ES5ProxyType ? replicaOrAny2.get(k3) : replicaOrAny2[k3];
        return replicaOrAny3._ES5ProxyType ? replicaOrAny3.get(k4) : replicaOrAny3[k4];
    };
    var getKeys = function (replicaOrAny) {
        var l = arguments.length;
        for (var i = 1; i < l; i++) {
            var key = arguments[i];
            replicaOrAny = replicaOrAny._ES5ProxyType ? replicaOrAny.get(key) : replicaOrAny[key];
        }
        return replicaOrAny;
    };
    var callKey0 = function (replicaOrAny, key) {
        return getKey(replicaOrAny, key).call(replicaOrAny);
    };
    var callKey1 = function (replicaOrAny, key, a1) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1);
    };
    var callKey2 = function (replicaOrAny, key, a1, a2) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1, a2);
    };
    var callKey3 = function (replicaOrAny, key, a1, a2, a3) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1, a2, a3);
    };
    var callKey4 = function (replicaOrAny, key, a1, a2, a3, a4) {
        return getKey(replicaOrAny, key).call(replicaOrAny, a1, a2, a3, a4);
    };
    var callKey = function (replicaOrAny, key) {
        var fn = getKey(replicaOrAny, key);
        var l = arguments.length;
        var args = [];
        for (var i = 2; i < l; i++) {
            args[i - 2] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    };
    var setKey = function (replicaOrAny, key, newValue) {
        return replicaOrAny._ES5ProxyType ?
            replicaOrAny.set(key, newValue) :
            replicaOrAny[key] = newValue;
    };
    var setKeyPostfixIncrement = function (replicaOrAny, key) {
        var originalValue = getKey(replicaOrAny, key);
        setKey(replicaOrAny, key, originalValue + 1);
        return originalValue;
    };
    var setKeyPostfixDecrement = function (replicaOrAny, key) {
        var originalValue = getKey(replicaOrAny, key);
        setKey(replicaOrAny, key, originalValue - 1);
        return originalValue;
    };
    var deleteKey = function (replicaOrAny, key) {
        if (replicaOrAny._ES5ProxyType) {
            return replicaOrAny.deleteProperty(key);
        }
        delete replicaOrAny[key];
    };
    var inKey = function (replicaOrAny, key) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.has(key);
        }
        return inOperator(replicaOrAny, key);
    };
    var iterableKey = function (replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.forIn();
        }
        return replicaOrAny;
    };
    function instanceOfKey(instance, Type) {
        var instanceIsCompatProxy = isCompatProxy(instance);
        if (!isCompatProxy(Type) && !instanceIsCompatProxy) {
            return instance instanceof Type;
        }
        // TODO: Once polyfills are transpiled to compat
        // We can probably remove the below check
        if (instanceIsCompatProxy) {
            return defaultHasInstance(instance, Type);
        }
        return Type[Symbol.hasInstance](instance);
    }
    function concat(replicaOrAny) {
        var fn = getKey(replicaOrAny, 'concat');
        if (fn === Array.prototype.concat) {
            fn = concat$1;
        }
        var args = [];
        var l = arguments.length;
        for (var i = 1; i < l; i++) {
            args[i - 1] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    }
    function hasOwnProperty$2(replicaOrAny) {
        var fn = getKey(replicaOrAny, 'hasOwnProperty');
        if (fn === hasOwnProperty) {
            fn = hasOwnProperty$1;
        }
        var args = [];
        var l = arguments.length;
        for (var i = 1; i < l; i++) {
            args[i - 1] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    // https://tc39.github.io/ecma262/#sec-array.isarray
    // Important: The Array.isArray method is not dereferenced. This way it calls the polyfilled
    // version of it, even if the polyfill is applied after the proxy-compat evaluation.
    function isArray$1(replicaOrAny) {
        return isCompatProxy(replicaOrAny) ?
            replicaOrAny._ES5ProxyType === ProxyTypeArray :
            Array.isArray(replicaOrAny);
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.pop
    function pop() {
        // 1. Let O be ? ToObject(this value).
        var O = Object(this);
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = O.length;
        // 3. If len is zero, then
        if (len === 0) {
            // a. Perform ? Set(O, "length", 0, true). noop
            // b. Return undefined.
            return undefined;
            // 4. Else len > 0,
        }
        else if (len > 0) {
            // a. Let newLen be len-1.
            var newLen = len - 1;
            // b. Let index be ! ToString(newLen).
            var index = newLen;
            // c. Let element be ? Get(O, index).
            var element = getKey(O, index);
            // d. Perform ? DeletePropertyOrThrow(O, index).
            deleteKey(O, index);
            // e. Perform ? Set(O, "length", newLen, true).
            setKey(O, 'length', newLen);
            // f. Return element.
            return element;
        }
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.push
    function push() {
        var O = Object(this);
        var n = O.length;
        var items = ArraySlice.call(arguments);
        while (items.length) {
            var E = ArrayShift.call(items);
            setKey(O, n, E);
            n += 1;
        }
        setKey(O, 'length', n);
        return O.length;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.concat
    function concat$1() {
        var O = Object(this);
        var A = [];
        var N = 0;
        var items = ArraySlice.call(arguments);
        ArrayUnshift.call(items, O);
        while (items.length) {
            var E = ArrayShift.call(items);
            if (isArray$1(E)) {
                var k = 0;
                var length = E.length;
                for (k; k < length; k += 1, N += 1) {
                    var subElement = getKey(E, k);
                    A[N] = subElement;
                }
            }
            else {
                A[N] = E;
                N += 1;
            }
        }
        return A;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.shift
    function shift() {
        // 1. Let O be ? ToObject(this value).
        var O = Object(this);
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = O.length;
        // 3. If len is zero, then
        if (len === 0) {
            // a. Perform ? Set(O, "length", 0, true). noop
            // b. Return undefined.
            return undefined;
        }
        // 4. Let first be ? Get(O, "0").
        var first = getKey(O, 0);
        // 5. Let k be 1.
        var k = 1;
        // 6. Repeat, while k < len
        while (k < len) {
            // a. Let from be ! ToString(k).
            var from = k;
            // b. Let to be ! ToString(k-1).
            var to = k - 1;
            // c. Let fromPresent be ? HasProperty(O, from).
            var fromPresent = hasOwnProperty$1.call(O, from);
            // d. If fromPresent is true, then
            if (fromPresent) {
                // i. Let fromVal be ? Get(O, from).
                var fromVal = getKey(O, from);
                // ii. Perform ? Set(O, to, fromVal, true).
                setKey(O, to, fromVal);
            }
            else { // e. Else fromPresent is false,
                // i. Perform ? DeletePropertyOrThrow(O, to).
                deleteKey(O, to);
            }
            // f. Increase k by 1.
            k += 1;
        }
        // 7. Perform ? DeletePropertyOrThrow(O, ! ToString(len-1)).
        deleteKey(O, len - 1);
        // 8. Perform ? Set(O, "length", len-1, true).
        setKey(O, 'length', len - 1);
        // 9. Return first.
        return first;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.unshift
    function unshift() {
        var O = Object(this);
        var len = O.length;
        var argCount = arguments.length;
        var k = len;
        while (k > 0) {
            var from = k - 1;
            var to = k + argCount - 1;
            var fromPresent = hasOwnProperty$1.call(O, from);
            if (fromPresent) {
                var fromValue = O[from];
                setKey(O, to, fromValue);
            }
            else {
                deleteKey(O, to);
            }
            k -= 1;
        }
        var j = 0;
        var items = ArraySlice.call(arguments);
        while (items.length) {
            var E = ArrayShift.call(items);
            setKey(O, j, E);
            j += 1;
        }
        O.length = len + argCount;
        return O.length;
    }
    // http://www.ecma-international.org/ecma-262/#sec-array.prototype.splice
    function splice(start, deleteCount) {
        var argLength = arguments.length;
        // 1. Let O be ? ToObject(this value).
        var O = Object(this);
        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = O.length;
        // 3. Let relativeStart be ? ToInteger(start).
        var relativeStart = start;
        // 4. If relativeStart < 0, let actualStart be max((len + relativeStart), 0);
        // else let actualStart be min(relativeStart, len).
        var actualStart = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
        var actualDeleteCount;
        // 5. If the number of actual arguments is 0, then
        if (argLength === 0) {
            // a. Let insertCount be 0.
            // insertCount = 0 // not needed
            // b. Let actualDeleteCount be 0.
            actualDeleteCount = 0;
        }
        else if (argLength === 1) {
            // 6. Else if the number of actual arguments is 1, then
            // a. Let insertCount be 0.
            // insertCount = 0 // not needed
            // b. Let actualDeleteCount be len - actualStart.
            actualDeleteCount = len - actualStart;
        }
        else {
            // 7. Else,
            // a. Let insertCount be the number of actual arguments minus 2.
            // insertCount = argLength - 2; //not neede
            // b. Let dc be ? ToInteger(deleteCount).
            var dc = deleteCount;
            // c. Let actualDeleteCount be min(max(dc, 0), len - actualStart).
            actualDeleteCount = Math.min(Math.max(dc, 0), len - actualStart);
        }
        // 8. If len+insertCount-actualDeleteCount > 2^53-1, throw a TypeError exception
        // (noop)
        // 9. Let A be ? ArraySpeciesCreate(O, actualDeleteCount).
        var A = [];
        // 10. Let k be 0.
        var k = 0;
        // 11. Repeat, while k < actualDeleteCount
        while (k < actualDeleteCount) {
            // a. Let from be ! ToString(actualStart+k).
            var from = actualStart + k;
            // b. Let fromPresent be ? HasProperty(O, from).
            var fromPresent = hasOwnProperty$1.call(O, from);
            // c. If fromPresent is true, then
            if (fromPresent) {
                // i. Let fromValue be ? Get(O, from).
                var fromValue = O[from];
                // ii. Perform ? CreateDataPropertyOrThrow(A, ! ToString(k), fromValue).
                A[k] = fromValue;
            }
            // d. Increment k by 1.
            k++;
        }
        // 12. Perform ? Set(A, "length", actualDeleteCount, true).
        // A.length = actualDeleteCount;
        // 13. Let items be a List whose elements are, in left to right order, the portion of the actual argument
        //     list starting with the third argument. The list is empty if fewer than three arguments were passed.
        var items = ArraySlice.call(arguments, 2) || [];
        // 14. Let itemCount be the number of elements in items.
        var itemCount = items.length;
        // 15. If itemCount < actualDeleteCount, then
        if (itemCount < actualDeleteCount) {
            // a. Let k be actualStart.
            k = actualStart;
            // b. Repeat, while k < (len - actualDeleteCount)
            while (k < len - actualDeleteCount) {
                // i. Let from be ! ToString(k+actualDeleteCount).
                var from = k + actualDeleteCount;
                // ii. Let to be ! ToString(k+itemCount).
                var to = k + itemCount;
                // iii. Let fromPresent be ? HasProperty(O, from).
                var fromPresent = hasOwnProperty$1.call(O, from);
                // iv. If fromPresent is true, then
                if (fromPresent) {
                    // 1. Let fromValue be ? Get(O, from).
                    var fromValue = O[from];
                    // 2. Perform ? Set(O, to, fromValue, true).
                    setKey(O, to, fromValue);
                }
                else {
                    // v. Else fromPresent is false,
                    // 1. Perform ? DeletePropertyOrThrow(O, to).
                    deleteKey(O, to);
                }
                // vi. Increase k by 1.
                k++;
            }
            // c. Let k be len.
            k = len;
            // d. Repeat, while k > (len - actualDeleteCount + itemCount)
            while (k > len - actualDeleteCount + itemCount) {
                // i. Perform ? DeletePropertyOrThrow(O, ! ToString(k-1)).
                deleteKey(O, k - 1);
                // ii. Decrease k by 1.
                k--;
            }
        }
        else if (itemCount > actualDeleteCount) {
            // 16. Else if itemCount > actualDeleteCount, then
            // a. Let k be (len - actualDeleteCount).
            k = len - actualDeleteCount;
            // b. Repeat, while k > actualStart
            while (k > actualStart) {
                // i. Let from be ! ToString(k + actualDeleteCount - 1).
                var from = k + actualDeleteCount - 1;
                // ii. Let to be ! ToString(k + itemCount - 1).
                var to = k + itemCount - 1;
                // iii. Let fromPresent be ? HasProperty(O, from).
                var fromPresent = hasOwnProperty$1.call(O, from);
                // iv. If fromPresent is true, then
                if (fromPresent) {
                    // 1. Let fromValue be ? Get(O, from).
                    var fromValue = O[from];
                    // 2. Perform ? Set(O, to, fromValue, true).
                    setKey(O, to, fromValue);
                }
                else {
                    // v. Else fromPresent is false,
                    // 1. Perform ? DeletePropertyOrThrow(O, to).
                    deleteKey(O, to);
                }
                // vi. Decrease k by 1.
                k--;
            }
        }
        // 17. Let k be actualStart.
        k = actualStart;
        // 18. Repeat, while items is not empty
        while (items.length) {
            // a. Remove the first element from items and let E be the value of that element.
            var E = items.shift();
            // b. Perform ? Set(O, ! ToString(k), E, true).
            setKey(O, k, E);
            // c. Increase k by 1.
            k++;
        }
        // 19. Perform ? Set(O, "length", len - actualDeleteCount + itemCount, true).
        setKey(O, 'length', len - actualDeleteCount + itemCount);
        // 20. Return A.
        return A;
    }

    /*
     * Copyright (c) 2018, salesforce.com, inc.
     * All rights reserved.
     * SPDX-License-Identifier: MIT
     * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
     */
    function getPrototypeOf$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.getPrototypeOf();
        }
        return getPrototypeOf(replicaOrAny);
    }
    function setPrototypeOf$1(replicaOrAny, proto) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.setPrototypeOf(proto);
        }
        return setPrototypeOf(replicaOrAny, proto);
    }
    function preventExtensions$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.preventExtensions();
        }
        return preventExtensions(replicaOrAny);
    }
    function isExtensible$1(replicaOrAny) {
        if (isCompatProxy(replicaOrAny)) {
            return replicaOrAny.isExtensible();
        }
        return isExtensible(replicaOrAny);
    }
    // Object patches
    // TODO: Instead of monkey patching, move all of these to be compatInstrinsicMethods
    // like the ones right below.
    Object.preventExtensions = preventExtensions$1;
    Object.getOwnPropertyNames = getOwnPropertyNames$1;
    Object.isExtensible = isExtensible$1;
    Object.setPrototypeOf = setPrototypeOf$1;
    Object.getPrototypeOf = getPrototypeOf$1;
    // We need to ensure that added compat methods are not-enumerable to avoid leaking
    // when using for ... in without guarding via Object.hasOwnProperty.
    Object.defineProperties(Object, {
        compatKeys: { value: keys$1, enumerable: false },
        compatValues: { value: values, enumerable: false },
        compatEntries: { value: entries, enumerable: false },
        compatDefineProperty: { value: defineProperty$1, enumerable: false },
        compatAssign: { value: assign, enumerable: false },
        compatGetOwnPropertyDescriptor: { value: getOwnPropertyDescriptor$1, enumerable: false }
    });
    Object.defineProperties(Object.prototype, {
        compatHasOwnProperty: { value: hasOwnProperty$1, enumerable: false }
    });
    // Array patches
    Object.defineProperties(Array, {
        compatIsArray: { value: isArray$1, enumerable: false }
    });
    Object.defineProperties(Array.prototype, {
        compatUnshift: { value: unshift, enumerable: false },
        compatConcat: { value: concat$1, enumerable: false },
        compatPush: { value: push, enumerable: false },
    });
    function overrideProxy() {
        return Proxy.__COMPAT__;
    }
    function makeGlobal(obj) {
        var global = (function () { return this; })() || Function('return this')();
        global.Proxy = obj;
    }
    // At this point Proxy can be the real Proxy (function) a noop-proxy (object with noop-keys) or undefined
    var FinalProxy = typeof Proxy !== 'undefined' ? Proxy : {};
    if (typeof FinalProxy !== 'function' || overrideProxy()) {
        FinalProxy = /** @class */ (function (_super) {
            __extends(Proxy, _super);
            function Proxy() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Proxy;
        }(XProxy));
    }
    FinalProxy.isCompat = true;
    FinalProxy.getKey = getKey;
    FinalProxy.getKeys = getKeys;
    FinalProxy.getKeys2 = getKeys2;
    FinalProxy.getKeys3 = getKeys3;
    FinalProxy.getKeys4 = getKeys4;
    FinalProxy.callKey = callKey;
    FinalProxy.callKey0 = callKey0;
    FinalProxy.callKey1 = callKey1;
    FinalProxy.callKey2 = callKey2;
    FinalProxy.callKey3 = callKey3;
    FinalProxy.callKey4 = callKey4;
    FinalProxy.setKey = setKey;
    FinalProxy.setKeyPostfixIncrement = setKeyPostfixIncrement;
    FinalProxy.setKeyPostfixDecrement = setKeyPostfixDecrement;
    FinalProxy.deleteKey = deleteKey;
    FinalProxy.inKey = inKey;
    FinalProxy.iterableKey = iterableKey;
    FinalProxy.instanceOfKey = instanceOfKey;
    FinalProxy.concat = concat;
    FinalProxy.hasOwnProperty = hasOwnProperty$2;
    if (typeof Proxy === 'undefined') {
        makeGlobal(FinalProxy);
    }
    var FinalProxy$1 = FinalProxy;

    return FinalProxy$1;

})));

}());

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 75);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var core = __webpack_require__(14);
var hide = __webpack_require__(11);
var redefine = __webpack_require__(8);
var ctx = __webpack_require__(12);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(54)('wks');
var uid = __webpack_require__(20);
var Symbol = __webpack_require__(2).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(4)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(7);
var IE8_DOM_DEFINE = __webpack_require__(49);
var toPrimitive = __webpack_require__(18);
var dP = Object.defineProperty;

exports.f = __webpack_require__(5) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var hide = __webpack_require__(11);
var has = __webpack_require__(9);
var SRC = __webpack_require__(20)('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(14).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),
/* 9 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(6);
var createDesc = __webpack_require__(33);
module.exports = __webpack_require__(5) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(21);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(34);
var defined = __webpack_require__(13);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(19);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(3);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(13);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(6).f;
var has = __webpack_require__(9);
var TAG = __webpack_require__(1)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(12);
var IObject = __webpack_require__(34);
var toObject = __webpack_require__(22);
var toLength = __webpack_require__(16);
var asc = __webpack_require__(110);
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(2);
var dP = __webpack_require__(6);
var DESCRIPTORS = __webpack_require__(5);
var SPECIES = __webpack_require__(1)('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(12);
var call = __webpack_require__(121);
var isArrayIter = __webpack_require__(122);
var anObject = __webpack_require__(7);
var toLength = __webpack_require__(16);
var getIterFn = __webpack_require__(123);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(8);
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(20)('meta');
var isObject = __webpack_require__(3);
var has = __webpack_require__(9);
var setDesc = __webpack_require__(6).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(4)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(2);
var $export = __webpack_require__(0);
var redefine = __webpack_require__(8);
var redefineAll = __webpack_require__(29);
var meta = __webpack_require__(30);
var forOf = __webpack_require__(28);
var anInstance = __webpack_require__(27);
var isObject = __webpack_require__(3);
var fails = __webpack_require__(4);
var $iterDetect = __webpack_require__(71);
var setToStringTag = __webpack_require__(24);
var inheritIfRequired = __webpack_require__(39);

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function (a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = $iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
var document = __webpack_require__(2).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(10);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(54)('keys');
var uid = __webpack_require__(20);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(55);
var createDesc = __webpack_require__(33);
var toIObject = __webpack_require__(15);
var toPrimitive = __webpack_require__(18);
var has = __webpack_require__(9);
var IE8_DOM_DEFINE = __webpack_require__(49);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(5) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
var setPrototypeOf = __webpack_require__(84).set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var defined = __webpack_require__(13);
var fails = __webpack_require__(4);
var spaces = __webpack_require__(41);
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;


/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(7);
var dPs = __webpack_require__(50);
var enumBugKeys = __webpack_require__(37);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(32)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(58).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

// helper for String#{startsWith, endsWith, includes}
var isRegExp = __webpack_require__(64);
var defined = __webpack_require__(13);

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var MATCH = __webpack_require__(1)('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(36);
var $export = __webpack_require__(0);
var redefine = __webpack_require__(8);
var hide = __webpack_require__(11);
var Iterators = __webpack_require__(23);
var $iterCreate = __webpack_require__(107);
var setToStringTag = __webpack_require__(24);
var getPrototypeOf = __webpack_require__(56);
var ITERATOR = __webpack_require__(1)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(1)('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(11)(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 21.2.5.3 get RegExp.prototype.flags
var anObject = __webpack_require__(7);
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hide = __webpack_require__(11);
var redefine = __webpack_require__(8);
var fails = __webpack_require__(4);
var defined = __webpack_require__(13);
var wks = __webpack_require__(1);

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);
  var fns = exec(defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(5) && !__webpack_require__(4)(function () {
  return Object.defineProperty(__webpack_require__(32)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(6);
var anObject = __webpack_require__(7);
var getKeys = __webpack_require__(51);

module.exports = __webpack_require__(5) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(52);
var enumBugKeys = __webpack_require__(37);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(9);
var toIObject = __webpack_require__(15);
var arrayIndexOf = __webpack_require__(78)(false);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(19);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(14);
var global = __webpack_require__(2);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(36) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 55 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(9);
var toObject = __webpack_require__(22);
var IE_PROTO = __webpack_require__(35)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(52);
var hiddenKeys = __webpack_require__(37).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(2).document;
module.exports = document && document.documentElement;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toInteger = __webpack_require__(19);
var defined = __webpack_require__(13);

module.exports = function repeat(count) {
  var str = String(defined(this));
  var res = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
  return res;
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.3 Number.isInteger(number)
var isObject = __webpack_require__(3);
var floor = Math.floor;
module.exports = function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor(it) === it;
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var $parseFloat = __webpack_require__(2).parseFloat;
var $trim = __webpack_require__(40).trim;

module.exports = 1 / $parseFloat(__webpack_require__(41) + '-0') !== -Infinity ? function parseFloat(str) {
  var string = $trim(String(str), 3);
  var result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var $parseInt = __webpack_require__(2).parseInt;
var $trim = __webpack_require__(40).trim;
var ws = __webpack_require__(41);
var hex = /^[-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(19);
var defined = __webpack_require__(13);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.8 IsRegExp(argument)
var isObject = __webpack_require__(3);
var cof = __webpack_require__(10);
var MATCH = __webpack_require__(1)('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(10);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 66 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// 21.2.5.3 get RegExp.prototype.flags()
if (__webpack_require__(5) && /./g.flags != 'g') __webpack_require__(6).f(RegExp.prototype, 'flags', {
  configurable: true,
  get: __webpack_require__(47)
});


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(10);
var TAG = __webpack_require__(1)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(12);
var invoke = __webpack_require__(125);
var html = __webpack_require__(58);
var cel = __webpack_require__(32);
var global = __webpack_require__(2);
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__(10)(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__(21);

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(1)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(51);
var gOPS = __webpack_require__(131);
var pIE = __webpack_require__(55);
var toObject = __webpack_require__(22);
var IObject = __webpack_require__(34);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(4)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var redefineAll = __webpack_require__(29);
var getWeak = __webpack_require__(30).getWeak;
var anObject = __webpack_require__(7);
var isObject = __webpack_require__(3);
var anInstance = __webpack_require__(27);
var forOf = __webpack_require__(28);
var createArrayMethod = __webpack_require__(25);
var $has = __webpack_require__(9);
var validate = __webpack_require__(17);
var arrayFind = createArrayMethod(5);
var arrayFindIndex = createArrayMethod(6);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (that) {
  return that._l || (that._l = new UncaughtFrozenStore());
};
var UncaughtFrozenStore = function () {
  this.a = [];
};
var findUncaughtFrozen = function (store, key) {
  return arrayFind(store.a, function (it) {
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function (key) {
    var index = arrayFindIndex(this.a, function (it) {
      return it[0] === key;
    });
    if (~index) this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;      // collection type
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME))['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME)).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var data = getWeak(anObject(key), true);
    if (data === true) uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var dP = __webpack_require__(6).f;
var create = __webpack_require__(42);
var redefineAll = __webpack_require__(29);
var ctx = __webpack_require__(12);
var anInstance = __webpack_require__(27);
var forOf = __webpack_require__(28);
var $iterDefine = __webpack_require__(45);
var step = __webpack_require__(66);
var setSpecies = __webpack_require__(26);
var DESCRIPTORS = __webpack_require__(5);
var fastKey = __webpack_require__(30).fastKey;
var validate = __webpack_require__(17);
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(76);
__webpack_require__(77);
__webpack_require__(79);
__webpack_require__(81);
__webpack_require__(82);
__webpack_require__(83);
__webpack_require__(85);
__webpack_require__(87);
__webpack_require__(88);
__webpack_require__(89);
__webpack_require__(90);
__webpack_require__(91);
__webpack_require__(92);
__webpack_require__(93);
__webpack_require__(94);
__webpack_require__(95);
__webpack_require__(96);
__webpack_require__(97);
__webpack_require__(98);
__webpack_require__(99);
__webpack_require__(100);
__webpack_require__(101);
__webpack_require__(102);
__webpack_require__(103);
__webpack_require__(104);
__webpack_require__(105);
__webpack_require__(106);
__webpack_require__(108);
__webpack_require__(109);
__webpack_require__(112);
__webpack_require__(113);
__webpack_require__(114);
__webpack_require__(115);
__webpack_require__(116);
__webpack_require__(67);
__webpack_require__(117);
__webpack_require__(118);
__webpack_require__(119);
__webpack_require__(120);
__webpack_require__(130);
__webpack_require__(132);
__webpack_require__(133);
__webpack_require__(134);
__webpack_require__(136);
__webpack_require__(137);
__webpack_require__(139);
__webpack_require__(140);
__webpack_require__(141);
module.exports = __webpack_require__(142);


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(5), 'Object', { defineProperty: __webpack_require__(6).f });


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !__webpack_require__(5), 'Object', { defineProperties: __webpack_require__(50) });


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(15);
var toLength = __webpack_require__(16);
var toAbsoluteIndex = __webpack_require__(53);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = __webpack_require__(15);
var $getOwnPropertyDescriptor = __webpack_require__(38).f;

__webpack_require__(80)('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(0);
var core = __webpack_require__(14);
var fails = __webpack_require__(4);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(6).f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FProto || __webpack_require__(5) && dP(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isObject = __webpack_require__(3);
var getPrototypeOf = __webpack_require__(56);
var HAS_INSTANCE = __webpack_require__(1)('hasInstance');
var FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if (!(HAS_INSTANCE in FunctionProto)) __webpack_require__(6).f(FunctionProto, HAS_INSTANCE, { value: function (O) {
  if (typeof this != 'function' || !isObject(O)) return false;
  if (!isObject(this.prototype)) return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while (O = getPrototypeOf(O)) if (this.prototype === O) return true;
  return false;
} });


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(2);
var has = __webpack_require__(9);
var cof = __webpack_require__(10);
var inheritIfRequired = __webpack_require__(39);
var toPrimitive = __webpack_require__(18);
var fails = __webpack_require__(4);
var gOPN = __webpack_require__(57).f;
var gOPD = __webpack_require__(38).f;
var dP = __webpack_require__(6).f;
var $trim = __webpack_require__(40).trim;
var NUMBER = 'Number';
var $Number = global[NUMBER];
var Base = $Number;
var proto = $Number.prototype;
// Opera ~12 has broken Object#toString
var BROKEN_COF = cof(__webpack_require__(42)(proto)) == NUMBER;
var TRIM = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default: return +it;
      }
      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function () { proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for (var keys = __webpack_require__(5) ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(Base, key = keys[j]) && !has($Number, key)) {
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  __webpack_require__(8)(global, NUMBER, $Number);
}


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__(3);
var anObject = __webpack_require__(7);
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__(12)(Function.call, __webpack_require__(38).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var toInteger = __webpack_require__(19);
var aNumberValue = __webpack_require__(86);
var repeat = __webpack_require__(59);
var $toFixed = 1.0.toFixed;
var floor = Math.floor;
var data = [0, 0, 0, 0, 0, 0];
var ERROR = 'Number.toFixed: incorrect invocation!';
var ZERO = '0';

var multiply = function (n, c) {
  var i = -1;
  var c2 = c;
  while (++i < 6) {
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function (n) {
  var i = 6;
  var c = 0;
  while (--i >= 0) {
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function () {
  var i = 6;
  var s = '';
  while (--i >= 0) {
    if (s !== '' || i === 0 || data[i] !== 0) {
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function (x) {
  var n = 0;
  var x2 = x;
  while (x2 >= 4096) {
    n += 12;
    x2 /= 4096;
  }
  while (x2 >= 2) {
    n += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
) || !__webpack_require__(4)(function () {
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits) {
    var x = aNumberValue(this, ERROR);
    var f = toInteger(fractionDigits);
    var s = '';
    var m = ZERO;
    var e, z, j, k;
    if (f < 0 || f > 20) throw RangeError(ERROR);
    // eslint-disable-next-line no-self-compare
    if (x != x) return 'NaN';
    if (x <= -1e21 || x >= 1e21) return String(x);
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x > 1e-21) {
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(0, z);
        j = f;
        while (j >= 7) {
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while (j >= 23) {
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if (f > 0) {
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

var cof = __webpack_require__(10);
module.exports = function (it, msg) {
  if (typeof it != 'number' && cof(it) != 'Number') throw TypeError(msg);
  return +it;
};


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.1 Number.EPSILON
var $export = __webpack_require__(0);

$export($export.S, 'Number', { EPSILON: Math.pow(2, -52) });


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.2 Number.isFinite(number)
var $export = __webpack_require__(0);
var _isFinite = __webpack_require__(2).isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.3 Number.isInteger(number)
var $export = __webpack_require__(0);

$export($export.S, 'Number', { isInteger: __webpack_require__(60) });


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.4 Number.isNaN(number)
var $export = __webpack_require__(0);

$export($export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.5 Number.isSafeInteger(number)
var $export = __webpack_require__(0);
var isInteger = __webpack_require__(60);
var abs = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = __webpack_require__(0);

$export($export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = __webpack_require__(0);

$export($export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseFloat = __webpack_require__(61);
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', { parseFloat: $parseFloat });


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseInt = __webpack_require__(62);
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', { parseInt: $parseInt });


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseInt = __webpack_require__(62);
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), { parseInt: $parseInt });


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var $parseFloat = __webpack_require__(61);
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), { parseFloat: $parseFloat });


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

// 20.2.2.34 Math.trunc(x)
var $export = __webpack_require__(0);

$export($export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var toAbsoluteIndex = __webpack_require__(53);
var fromCharCode = String.fromCharCode;
var $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
    var res = [];
    var aLen = arguments.length;
    var i = 0;
    var code;
    while (aLen > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
var toIObject = __webpack_require__(15);
var toLength = __webpack_require__(16);

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite) {
    var tpl = toIObject(callSite.raw);
    var len = toLength(tpl.length);
    var aLen = arguments.length;
    var res = [];
    var i = 0;
    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < aLen) res.push(String(arguments[i]));
    } return res.join('');
  }
});


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $at = __webpack_require__(63)(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])

var $export = __webpack_require__(0);
var toLength = __webpack_require__(16);
var context = __webpack_require__(43);
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * __webpack_require__(44)(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.7 String.prototype.includes(searchString, position = 0)

var $export = __webpack_require__(0);
var context = __webpack_require__(43);
var INCLUDES = 'includes';

$export($export.P + $export.F * __webpack_require__(44)(INCLUDES), 'String', {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: __webpack_require__(59)
});


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])

var $export = __webpack_require__(0);
var toLength = __webpack_require__(16);
var context = __webpack_require__(43);
var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * __webpack_require__(44)(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(63)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(45)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(42);
var descriptor = __webpack_require__(33);
var setToStringTag = __webpack_require__(24);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(11)(IteratorPrototype, __webpack_require__(1)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = __webpack_require__(0);

$export($export.S, 'Array', { isArray: __webpack_require__(65) });


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = __webpack_require__(0);
var $find = __webpack_require__(25)(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(46)(KEY);


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(111);

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(3);
var isArray = __webpack_require__(65);
var SPECIES = __webpack_require__(1)('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = __webpack_require__(0);
var $find = __webpack_require__(25)(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(46)(KEY);


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(46);
var step = __webpack_require__(66);
var Iterators = __webpack_require__(23);
var toIObject = __webpack_require__(15);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(45)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(26)('Array');


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var inheritIfRequired = __webpack_require__(39);
var dP = __webpack_require__(6).f;
var gOPN = __webpack_require__(57).f;
var isRegExp = __webpack_require__(64);
var $flags = __webpack_require__(47);
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (__webpack_require__(5) && (!CORRECT_NEW || __webpack_require__(4)(function () {
  re2[__webpack_require__(1)('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  __webpack_require__(8)(global, 'RegExp', $RegExp);
}

__webpack_require__(26)('RegExp');


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(67);
var anObject = __webpack_require__(7);
var $flags = __webpack_require__(47);
var DESCRIPTORS = __webpack_require__(5);
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  __webpack_require__(8)(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (__webpack_require__(4)(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

// @@match logic
__webpack_require__(48)('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

// @@replace logic
__webpack_require__(48)('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    'use strict';
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

// @@search logic
__webpack_require__(48)('search', 1, function (defined, SEARCH, $search) {
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(36);
var global = __webpack_require__(2);
var ctx = __webpack_require__(12);
var classof = __webpack_require__(68);
var $export = __webpack_require__(0);
var isObject = __webpack_require__(3);
var aFunction = __webpack_require__(21);
var anInstance = __webpack_require__(27);
var forOf = __webpack_require__(28);
var speciesConstructor = __webpack_require__(124);
var task = __webpack_require__(69).set;
var microtask = __webpack_require__(126)();
var newPromiseCapabilityModule = __webpack_require__(70);
var perform = __webpack_require__(127);
var userAgent = __webpack_require__(128);
var promiseResolve = __webpack_require__(129);
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__(1)('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__(29)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__(24)($Promise, PROMISE);
__webpack_require__(26)(PROMISE);
Wrapper = __webpack_require__(14)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(71)(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(7);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(23);
var ITERATOR = __webpack_require__(1)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(68);
var ITERATOR = __webpack_require__(1)('iterator');
var Iterators = __webpack_require__(23);
module.exports = __webpack_require__(14).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(7);
var aFunction = __webpack_require__(21);
var SPECIES = __webpack_require__(1)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),
/* 125 */
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var macrotask = __webpack_require__(69).set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__(10)(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),
/* 127 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(2);
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(7);
var isObject = __webpack_require__(3);
var newPromiseCapability = __webpack_require__(70);

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(0);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(72) });


/***/ }),
/* 131 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = __webpack_require__(0);

$export($export.S, 'Date', { now: function () { return new Date().getTime(); } });


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var toObject = __webpack_require__(22);
var toPrimitive = __webpack_require__(18);

$export($export.P + $export.F * __webpack_require__(4)(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
}), 'Date', {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = toObject(this);
    var pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = __webpack_require__(0);
var toISOString = __webpack_require__(135);

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (Date.prototype.toISOString !== toISOString), 'Date', {
  toISOString: toISOString
});


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var fails = __webpack_require__(4);
var getTime = Date.prototype.getTime;
var $toISOString = Date.prototype.toISOString;

var lz = function (num) {
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
module.exports = (fails(function () {
  return $toISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !fails(function () {
  $toISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
  var d = this;
  var y = d.getUTCFullYear();
  var m = d.getUTCMilliseconds();
  var s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
} : $toISOString;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

var DateProto = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var $toString = DateProto[TO_STRING];
var getTime = DateProto.getTime;
if (new Date(NaN) + '' != INVALID_DATE) {
  __webpack_require__(8)(DateProto, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

var TO_PRIMITIVE = __webpack_require__(1)('toPrimitive');
var proto = Date.prototype;

if (!(TO_PRIMITIVE in proto)) __webpack_require__(11)(proto, TO_PRIMITIVE, __webpack_require__(138));


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var anObject = __webpack_require__(7);
var toPrimitive = __webpack_require__(18);
var NUMBER = 'number';

module.exports = function (hint) {
  if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var each = __webpack_require__(25)(0);
var redefine = __webpack_require__(8);
var meta = __webpack_require__(30);
var assign = __webpack_require__(72);
var weak = __webpack_require__(73);
var isObject = __webpack_require__(3);
var fails = __webpack_require__(4);
var validate = __webpack_require__(17);
var WEAK_MAP = 'WeakMap';
var getWeak = meta.getWeak;
var isExtensible = Object.isExtensible;
var uncaughtFrozenStore = weak.ufstore;
var tmp = {};
var InternalMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key) {
    if (isObject(key)) {
      var data = getWeak(key);
      if (data === true) return uncaughtFrozenStore(validate(this, WEAK_MAP)).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value) {
    return weak.def(validate(this, WEAK_MAP), key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = __webpack_require__(31)(WEAK_MAP, wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if (fails(function () { return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7; })) {
  InternalMap = weak.getConstructor(wrapper, WEAK_MAP);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function (key) {
    var proto = $WeakMap.prototype;
    var method = proto[key];
    redefine(proto, key, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (isObject(a) && !isExtensible(a)) {
        if (!this._f) this._f = new InternalMap();
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var weak = __webpack_require__(73);
var validate = __webpack_require__(17);
var WEAK_SET = 'WeakSet';

// 23.4 WeakSet Objects
__webpack_require__(31)(WEAK_SET, function (get) {
  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value) {
    return weak.def(validate(this, WEAK_SET), value, true);
  }
}, weak, false, true);


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(74);
var validate = __webpack_require__(17);
var MAP = 'Map';

// 23.1 Map Objects
module.exports = __webpack_require__(31)(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(74);
var validate = __webpack_require__(17);
var SET = 'Set';

// 23.2 Set Objects
module.exports = __webpack_require__(31)(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);


/***/ })
/******/ ]);/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ../proxy-compat/setKey.js
/* harmony default export */ var setKey = (Proxy.setKey);
// CONCATENATED MODULE: ../proxy-compat/callKey4.js
/* harmony default export */ var callKey4 = (Proxy.callKey4);
// CONCATENATED MODULE: ../proxy-compat/callKey2.js
/* harmony default export */ var callKey2 = (Proxy.callKey2);
// CONCATENATED MODULE: ../proxy-compat/callKey1.js
/* harmony default export */ var callKey1 = (Proxy.callKey1);
// CONCATENATED MODULE: ../proxy-compat/iterableKey.js
/* harmony default export */ var iterableKey = (Proxy.iterableKey);
// CONCATENATED MODULE: ../proxy-compat/callKey3.js
/* harmony default export */ var callKey3 = (Proxy.callKey3);
// CONCATENATED MODULE: ../proxy-compat/inKey.js
/* harmony default export */ var inKey = (Proxy.inKey);
// CONCATENATED MODULE: ../proxy-compat/concat.js
/* harmony default export */ var concat = (Proxy.concat);
// CONCATENATED MODULE: ../proxy-compat/deleteKey.js
/* harmony default export */ var deleteKey = (Proxy.deleteKey);
// CONCATENATED MODULE: ../proxy-compat/callKey0.js
/* harmony default export */ var callKey0 = (Proxy.callKey0);
// CONCATENATED MODULE: ../proxy-compat/instanceOfKey.js
/* harmony default export */ var instanceOfKey = (Proxy.instanceOfKey);
// CONCATENATED MODULE: ./dist/ecma-polyfills.compat.js












/******/
(function (modules) {
  // webpackBootstrap

  /******/
  // The module cache

  /******/
  var installedModules = {};
  /******/

  /******/
  // The require function

  /******/

  function __webpack_require__(moduleId) {
    /******/

    /******/
    // Check if module is in cache

    /******/
    if (installedModules._ES5ProxyType ? installedModules.get(moduleId) : installedModules[moduleId]) {
      var _moduleId, _exports;

      /******/
      return _moduleId = installedModules._ES5ProxyType ? installedModules.get(moduleId) : installedModules[moduleId], _exports = _moduleId._ES5ProxyType ? _moduleId.get("exports") : _moduleId.exports;
      /******/
    }
    /******/
    // Create a new module (and put it into the cache)

    /******/


    var module = setKey(installedModules, moduleId, {
      /******/
      i: moduleId,

      /******/
      l: false,

      /******/
      exports: {}
      /******/

    });
    /******/

    /******/
    // Execute the module function

    /******/


    callKey4(modules._ES5ProxyType ? modules.get(moduleId) : modules[moduleId], "call", module._ES5ProxyType ? module.get("exports") : module.exports, module, module._ES5ProxyType ? module.get("exports") : module.exports, __webpack_require__);
    /******/

    /******/
    // Flag the module as loaded

    /******/


    setKey(module, "l", true);
    /******/

    /******/
    // Return the exports of the module

    /******/


    return module._ES5ProxyType ? module.get("exports") : module.exports;
    /******/
  }
  /******/

  /******/

  /******/
  // expose the modules object (__webpack_modules__)

  /******/


  setKey(__webpack_require__, "m", modules);
  /******/

  /******/
  // expose the module cache

  /******/


  setKey(__webpack_require__, "c", installedModules);
  /******/

  /******/
  // define getter function for harmony exports

  /******/


  setKey(__webpack_require__, "d", function (exports, name, getter) {
    /******/
    if (!callKey2(__webpack_require__, "o", exports, name)) {
      /******/
      Object.compatDefineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
      /******/
    }
    /******/

  });
  /******/

  /******/
  // define __esModule on exports

  /******/


  setKey(__webpack_require__, "r", function (exports) {
    /******/
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/
      Object.compatDefineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
      /******/
    }
    /******/


    Object.compatDefineProperty(exports, '__esModule', {
      value: true
    });
    /******/
  });
  /******/

  /******/
  // create a fake namespace object

  /******/
  // mode & 1: value is a module id, require it

  /******/
  // mode & 2: merge all properties of value into the ns

  /******/
  // mode & 4: return value when already ns object

  /******/
  // mode & 8|1: behave like require

  /******/


  setKey(__webpack_require__, "t", function (value, mode) {
    /******/
    if (mode & 1) value = __webpack_require__(value);
    /******/

    if (mode & 8) return value;
    /******/

    if (mode & 4 && typeof value === 'object' && value && (value._ES5ProxyType ? value.get("__esModule") : value.__esModule)) return value;
    /******/

    var ns = Object.create(null);
    /******/

    callKey1(__webpack_require__, "r", ns);
    /******/


    Object.compatDefineProperty(ns, 'default', {
      enumerable: true,
      value: value
    });
    /******/

    if (mode & 2 && typeof value != 'string') for (var key in iterableKey(value)) callKey3(__webpack_require__, "d", ns, key, callKey2(function (key) {
      return value._ES5ProxyType ? value.get(key) : value[key];
    }, "bind", null, key));
    /******/

    return ns;
    /******/
  });
  /******/

  /******/
  // getDefaultExport function for compatibility with non-harmony modules

  /******/


  setKey(__webpack_require__, "n", function (module) {
    /******/
    var getter = module && (module._ES5ProxyType ? module.get("__esModule") : module.__esModule) ?
    /******/
    function getDefault() {
      return module._ES5ProxyType ? module.get('default') : module['default'];
    } :
    /******/
    function getModuleExports() {
      return module;
    };
    /******/

    callKey3(__webpack_require__, "d", getter, 'a', getter);
    /******/


    return getter;
    /******/
  });
  /******/

  /******/
  // Object.prototype.hasOwnProperty.call

  /******/


  setKey(__webpack_require__, "o", function (object, property) {
    return callKey2(Object.prototype._ES5ProxyType ? Object.prototype.get("compatHasOwnProperty") : Object.prototype.compatHasOwnProperty, "call", object, property);
  });
  /******/

  /******/
  // __webpack_public_path__

  /******/


  setKey(__webpack_require__, "p", "");
  /******/

  /******/

  /******/
  // Load entry module and return exports

  /******/


  return __webpack_require__(setKey(__webpack_require__, "s", 44));
  /******/
}
/************************************************************************/

/******/
)([
/* 0 */

/***/
function (module, exports, __webpack_require__) {
  var global = __webpack_require__(2);

  var core = __webpack_require__(10);

  var hide = __webpack_require__(15);

  var redefine = __webpack_require__(33);

  var ctx = __webpack_require__(34);

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var _ref, _PROTOTYPE;

    var IS_FORCED = type & ($export._ES5ProxyType ? $export.get("F") : $export.F);
    var IS_GLOBAL = type & ($export._ES5ProxyType ? $export.get("G") : $export.G);
    var IS_STATIC = type & ($export._ES5ProxyType ? $export.get("S") : $export.S);
    var IS_PROTO = type & ($export._ES5ProxyType ? $export.get("P") : $export.P);
    var IS_BIND = type & ($export._ES5ProxyType ? $export.get("B") : $export.B);
    var target = IS_GLOBAL ? global : IS_STATIC ? (global._ES5ProxyType ? global.get(name) : global[name]) || setKey(global, name, {}) : (_ref = (global._ES5ProxyType ? global.get(name) : global[name]) || {}, _PROTOTYPE = _ref._ES5ProxyType ? _ref.get(PROTOTYPE) : _ref[PROTOTYPE]);
    var exports = IS_GLOBAL ? core : (core._ES5ProxyType ? core.get(name) : core[name]) || setKey(core, name, {});

    var expProto = (exports._ES5ProxyType ? exports.get(PROTOTYPE) : exports[PROTOTYPE]) || setKey(exports, PROTOTYPE, {});

    var key, own, out, exp;
    if (IS_GLOBAL) source = name;

    for (key in iterableKey(source)) {
      var _ref2, _key;

      // contains in native
      own = !IS_FORCED && target && (target._ES5ProxyType ? target.get(key) : target[key]) !== undefined; // export native or passed

      out = (_ref2 = own ? target : source, _key = _ref2._ES5ProxyType ? _ref2.get(key) : _ref2[key]); // bind timers to global for call from export context

      exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out; // extend global

      if (target) redefine(target, key, out, type & ($export._ES5ProxyType ? $export.get("U") : $export.U)); // export

      if ((exports._ES5ProxyType ? exports.get(key) : exports[key]) != out) hide(exports, key, exp);
      if (IS_PROTO && (expProto._ES5ProxyType ? expProto.get(key) : expProto[key]) != out) setKey(expProto, key, out);
    }
  };

  setKey(global, "core", core); // type bitmap


  setKey($export, "F", 1); // forced


  setKey($export, "G", 2); // global


  setKey($export, "S", 4); // static


  setKey($export, "P", 8); // proto


  setKey($export, "B", 16); // bind


  setKey($export, "W", 32); // wrap


  setKey($export, "U", 64); // safe


  setKey($export, "R", 128); // real proto method for `library`


  setKey(module, "exports", $export);
  /***/

},
/* 1 */

/***/
function (module, exports) {
  setKey(module, "exports", function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  });
  /***/

},
/* 2 */

/***/
function (module, exports) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = setKey(module, "exports", typeof window != 'undefined' && (window._ES5ProxyType ? window.get("Math") : window.Math) == Math ? window : typeof self != 'undefined' && (self._ES5ProxyType ? self.get("Math") : self.Math) == Math ? self // eslint-disable-next-line no-new-func
  : Function('return this')());

  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

  /***/
},
/* 3 */

/***/
function (module, exports, __webpack_require__) {
  // most Object methods by ES6 should accept primitives
  var $export = __webpack_require__(0);

  var core = __webpack_require__(10);

  var fails = __webpack_require__(9);

  setKey(module, "exports", function (KEY, exec) {
    var _ref3, _KEY;

    var fn = (_ref3 = (core._ES5ProxyType ? core.get("Object") : core.Object) || {}, _KEY = _ref3._ES5ProxyType ? _ref3.get(KEY) : _ref3[KEY]) || Object[KEY];
    var exp = {};

    setKey(exp, KEY, exec(fn));

    $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * fails(function () {
      fn(1);
    }), 'Object', exp);
  });
  /***/

},
/* 4 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__, _Symbol;

  var store = __webpack_require__(21)('wks');

  var uid = __webpack_require__(13);

  var Symbol = (_webpack_require__ = __webpack_require__(2), _Symbol = _webpack_require__._ES5ProxyType ? _webpack_require__.get("Symbol") : _webpack_require__.Symbol);
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = setKey(module, "exports", function (name) {
    return (store._ES5ProxyType ? store.get(name) : store[name]) || setKey(store, name, USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
  });

  setKey($exports, "store", store);
  /***/

},
/* 5 */

/***/
function (module, exports) {
  var _ref4, _compatHasOwnProperty;

  var hasOwnProperty = (_ref4 = {}, _compatHasOwnProperty = _ref4._ES5ProxyType ? _ref4.get("compatHasOwnProperty") : _ref4.compatHasOwnProperty);

  setKey(module, "exports", function (it, key) {
    return callKey2(hasOwnProperty, "call", it, key);
  });
  /***/

},
/* 6 */

/***/
function (module, exports, __webpack_require__) {
  var anObject = __webpack_require__(11);

  var IE8_DOM_DEFINE = __webpack_require__(31);

  var toPrimitive = __webpack_require__(20);

  var dP = Object.compatDefineProperty;

  setKey(exports, "f", __webpack_require__(8) ? Object.compatDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (IE8_DOM_DEFINE) try {
      return dP(O, P, Attributes);
    } catch (e) {
      /* empty */
    }
    if (inKey(Attributes, 'get') || inKey(Attributes, 'set')) throw TypeError('Accessors not supported!');
    if (inKey(Attributes, 'value')) setKey(O, P, Attributes._ES5ProxyType ? Attributes.get("value") : Attributes.value);
    return O;
  });
  /***/

},
/* 7 */

/***/
function (module, exports, __webpack_require__) {
  // to indexed object, toObject with fallback for non-array-like ES3 strings
  var IObject = __webpack_require__(50);

  var defined = __webpack_require__(37);

  setKey(module, "exports", function (it) {
    return IObject(defined(it));
  });
  /***/

},
/* 8 */

/***/
function (module, exports, __webpack_require__) {
  // Thank's IE8 for his funny defineProperty
  setKey(module, "exports", !__webpack_require__(9)(function () {
    var _Object$compatDefineP, _a;

    return (_Object$compatDefineP = Object.compatDefineProperty({}, 'a', {
      get: function () {
        return 7;
      }
    }), _a = _Object$compatDefineP._ES5ProxyType ? _Object$compatDefineP.get("a") : _Object$compatDefineP.a) != 7;
  }));
  /***/

},
/* 9 */

/***/
function (module, exports) {
  setKey(module, "exports", function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  });
  /***/

},
/* 10 */

/***/
function (module, exports) {
  var core = setKey(module, "exports", {
    version: '2.5.7'
  });

  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

  /***/
},
/* 11 */

/***/
function (module, exports, __webpack_require__) {
  var isObject = __webpack_require__(1);

  setKey(module, "exports", function (it) {
    if (!isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  });
  /***/

},
/* 12 */

/***/
function (module, exports, __webpack_require__) {
  // 7.1.13 ToObject(argument)
  var defined = __webpack_require__(37);

  setKey(module, "exports", function (it) {
    return Object(defined(it));
  });
  /***/

},
/* 13 */

/***/
function (module, exports) {
  var id = 0;
  var px = Math.random();

  setKey(module, "exports", function (key) {
    return concat('Symbol(', key === undefined ? '' : key, ')_', callKey1(++id + px, "toString", 36));
  });
  /***/

},
/* 14 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  var $keys = __webpack_require__(36);

  var enumBugKeys = __webpack_require__(26);

  setKey(module, "exports", Object.compatKeys || function keys(O) {
    return $keys(O, enumBugKeys);
  });
  /***/

},
/* 15 */

/***/
function (module, exports, __webpack_require__) {
  var dP = __webpack_require__(6);

  var createDesc = __webpack_require__(16);

  setKey(module, "exports", __webpack_require__(8) ? function (object, key, value) {
    return callKey3(dP, "f", object, key, createDesc(1, value));
  } : function (object, key, value) {
    setKey(object, key, value);

    return object;
  });
  /***/

},
/* 16 */

/***/
function (module, exports) {
  setKey(module, "exports", function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  });
  /***/

},
/* 17 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__2, _f;

  var META = __webpack_require__(13)('meta');

  var isObject = __webpack_require__(1);

  var has = __webpack_require__(5);

  var setDesc = (_webpack_require__2 = __webpack_require__(6), _f = _webpack_require__2._ES5ProxyType ? _webpack_require__2.get("f") : _webpack_require__2.f);
  var id = 0;

  var isExtensible = Object.isExtensible || function () {
    return true;
  };

  var FREEZE = !__webpack_require__(9)(function () {
    return isExtensible(Object.preventExtensions({}));
  });

  var setMeta = function (it) {
    setDesc(it, META, {
      value: {
        i: 'O' + ++id,
        // object ID
        w: {} // weak collections IDs

      }
    });
  };

  var fastKey = function (it, create) {
    var _META, _i;

    // return primitive with prefix
    if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

    if (!has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

      if (!create) return 'E'; // add missing metadata

      setMeta(it); // return object ID
    }

    return _META = it._ES5ProxyType ? it.get(META) : it[META], _i = _META._ES5ProxyType ? _META.get("i") : _META.i;
  };

  var getWeak = function (it, create) {
    var _META2, _w;

    if (!has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true; // not necessary to add metadata

      if (!create) return false; // add missing metadata

      setMeta(it); // return hash weak collections IDs
    }

    return _META2 = it._ES5ProxyType ? it.get(META) : it[META], _w = _META2._ES5ProxyType ? _META2.get("w") : _META2.w;
  }; // add metadata on freeze-family methods calling


  var onFreeze = function (it) {
    if (FREEZE && (meta._ES5ProxyType ? meta.get("NEED") : meta.NEED) && isExtensible(it) && !has(it, META)) setMeta(it);
    return it;
  };

  var meta = setKey(module, "exports", {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  });
  /***/

},
/* 18 */

/***/
function (module, exports, __webpack_require__) {
  // 7.1.15 ToLength
  var toInteger = __webpack_require__(39);

  var min = Math.min;

  setKey(module, "exports", function (it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  });
  /***/

},
/* 19 */

/***/
function (module, exports) {
  var _ref5, _propertyIsEnumerable;

  setKey(exports, "f", (_ref5 = {}, _propertyIsEnumerable = _ref5._ES5ProxyType ? _ref5.get("propertyIsEnumerable") : _ref5.propertyIsEnumerable));
  /***/

},
/* 20 */

/***/
function (module, exports, __webpack_require__) {
  // 7.1.1 ToPrimitive(input [, PreferredType])
  var isObject = __webpack_require__(1); // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string


  setKey(module, "exports", function (it, S) {
    if (!isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it._ES5ProxyType ? it.get("toString") : it.toString) == 'function' && !isObject(val = callKey1(fn, "call", it))) return val;
    if (typeof (fn = it._ES5ProxyType ? it.get("valueOf") : it.valueOf) == 'function' && !isObject(val = callKey1(fn, "call", it))) return val;
    if (!S && typeof (fn = it._ES5ProxyType ? it.get("toString") : it.toString) == 'function' && !isObject(val = callKey1(fn, "call", it))) return val;
    throw TypeError("Can't convert object to primitive value");
  });
  /***/

},
/* 21 */

/***/
function (module, exports, __webpack_require__) {
  var core = __webpack_require__(10);

  var global = __webpack_require__(2);

  var SHARED = '__core-js_shared__';

  var store = (global._ES5ProxyType ? global.get(SHARED) : global[SHARED]) || setKey(global, SHARED, {});

  setKey(module, "exports", function (key, value) {
    return (store._ES5ProxyType ? store.get(key) : store[key]) || setKey(store, key, value !== undefined ? value : {});
  })('versions', []).push({
    version: core._ES5ProxyType ? core.get("version") : core.version,
    mode: __webpack_require__(22) ? 'pure' : 'global',
    copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
  });
  /***/

},
/* 22 */

/***/
function (module, exports) {
  setKey(module, "exports", false);
  /***/

},
/* 23 */

/***/
function (module, exports) {
  var _ref6, _toString;

  var toString = (_ref6 = {}, _toString = _ref6._ES5ProxyType ? _ref6.get("toString") : _ref6.toString);

  setKey(module, "exports", function (it) {
    return callKey2(callKey1(toString, "call", it), "slice", 8, -1);
  });
  /***/

},
/* 24 */

/***/
function (module, exports, __webpack_require__) {
  var toInteger = __webpack_require__(39);

  var max = Math.max;
  var min = Math.min;

  setKey(module, "exports", function (index, length) {
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  });
  /***/

},
/* 25 */

/***/
function (module, exports, __webpack_require__) {
  var shared = __webpack_require__(21)('keys');

  var uid = __webpack_require__(13);

  setKey(module, "exports", function (key) {
    return (shared._ES5ProxyType ? shared.get(key) : shared[key]) || setKey(shared, key, uid(key));
  });
  /***/

},
/* 26 */

/***/
function (module, exports) {
  // IE 8- don't enum bug keys
  setKey(module, "exports", callKey1('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf', "split", ','));
  /***/

},
/* 27 */

/***/
function (module, exports) {
  setKey(exports, "f", Object.getOwnPropertySymbols);
  /***/

},
/* 28 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  var $keys = __webpack_require__(36);

  var hiddenKeys = concat(__webpack_require__(26), 'length', 'prototype');

  setKey(exports, "f", Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return $keys(O, hiddenKeys);
  });
  /***/

},
/* 29 */

/***/
function (module, exports, __webpack_require__) {
  "use strict";

  var $defineProperty = __webpack_require__(6);

  var createDesc = __webpack_require__(16);

  setKey(module, "exports", function (object, index, value) {
    if (inKey(object, index)) callKey3($defineProperty, "f", object, index, createDesc(0, value));else setKey(object, index, value);
  });
  /***/

},
/* 30 */

/***/
function (module, exports, __webpack_require__) {
  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = __webpack_require__(4)('unscopables');

  var ArrayProto = Array.prototype;
  if ((ArrayProto._ES5ProxyType ? ArrayProto.get(UNSCOPABLES) : ArrayProto[UNSCOPABLES]) == undefined) __webpack_require__(15)(ArrayProto, UNSCOPABLES, {});

  setKey(module, "exports", function (key) {
    setKey(ArrayProto._ES5ProxyType ? ArrayProto.get(UNSCOPABLES) : ArrayProto[UNSCOPABLES], key, true);
  });
  /***/

},
/* 31 */

/***/
function (module, exports, __webpack_require__) {
  setKey(module, "exports", !__webpack_require__(8) && !__webpack_require__(9)(function () {
    var _Object$compatDefineP2, _a2;

    return (_Object$compatDefineP2 = Object.compatDefineProperty(__webpack_require__(32)('div'), 'a', {
      get: function () {
        return 7;
      }
    }), _a2 = _Object$compatDefineP2._ES5ProxyType ? _Object$compatDefineP2.get("a") : _Object$compatDefineP2.a) != 7;
  }));
  /***/

},
/* 32 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__3, _document;

  var isObject = __webpack_require__(1);

  var document = (_webpack_require__3 = __webpack_require__(2), _document = _webpack_require__3._ES5ProxyType ? _webpack_require__3.get("document") : _webpack_require__3.document); // typeof document.createElement is 'object' in old IE

  var is = isObject(document) && isObject(document._ES5ProxyType ? document.get("createElement") : document.createElement);

  setKey(module, "exports", function (it) {
    return is ? callKey1(document, "createElement", it) : {};
  });
  /***/

},
/* 33 */

/***/
function (module, exports, __webpack_require__) {
  var global = __webpack_require__(2);

  var hide = __webpack_require__(15);

  var has = __webpack_require__(5);

  var SRC = __webpack_require__(13)('src');

  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];

  var TPL = callKey1('' + $toString, "split", TO_STRING);

  setKey(__webpack_require__(10), "inspectSource", function (it) {
    return callKey1($toString, "call", it);
  });

  setKey(module, "exports", function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) has(val, 'name') || hide(val, 'name', key);
    if ((O._ES5ProxyType ? O.get(key) : O[key]) === val) return;
    if (isFunction) has(val, SRC) || hide(val, SRC, (O._ES5ProxyType ? O.get(key) : O[key]) ? '' + (O._ES5ProxyType ? O.get(key) : O[key]) : callKey1(TPL, "join", String(key)));

    if (O === global) {
      setKey(O, key, val);
    } else if (!safe) {
      deleteKey(O, key);

      hide(O, key, val);
    } else if (O._ES5ProxyType ? O.get(key) : O[key]) {
      setKey(O, key, val);
    } else {
      hide(O, key, val);
    } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && (this._ES5ProxyType ? this.get(SRC) : this[SRC]) || callKey1($toString, "call", this);
  });
  /***/

},
/* 34 */

/***/
function (module, exports, __webpack_require__) {
  // optional / simple context binding
  var aFunction = __webpack_require__(46);

  setKey(module, "exports", function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 1:
        return function (a) {
          return callKey2(fn, "call", that, a);
        };

      case 2:
        return function (a, b) {
          return callKey3(fn, "call", that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return callKey4(fn, "call", that, a, b, c);
        };
    }

    return function
      /* ...args */
    () {
      return callKey2(fn, "apply", that, arguments);
    };
  });
  /***/

},
/* 35 */

/***/
function (module, exports, __webpack_require__) {
  setKey(exports, "f", __webpack_require__(4));
  /***/

},
/* 36 */

/***/
function (module, exports, __webpack_require__) {
  var has = __webpack_require__(5);

  var toIObject = __webpack_require__(7);

  var arrayIndexOf = __webpack_require__(38)(false);

  var IE_PROTO = __webpack_require__(25)('IE_PROTO');

  setKey(module, "exports", function (object, names) {
    var O = toIObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in iterableKey(O)) if (key != IE_PROTO) has(O, key) && result.push(key); // Don't enum bug & hidden keys


    while ((names._ES5ProxyType ? names.get("length") : names.length) > i) {
      var _i2, _i3;

      if (has(O, key = (_i2 = i++, _i3 = names._ES5ProxyType ? names.get(_i2) : names[_i2]))) {
        ~arrayIndexOf(result, key) || result.push(key);
      }
    }

    return result;
  });
  /***/

},
/* 37 */

/***/
function (module, exports) {
  // 7.2.1 RequireObjectCoercible(argument)
  setKey(module, "exports", function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  });
  /***/

},
/* 38 */

/***/
function (module, exports, __webpack_require__) {
  // false -> Array#indexOf
  // true  -> Array#includes
  var toIObject = __webpack_require__(7);

  var toLength = __webpack_require__(18);

  var toAbsoluteIndex = __webpack_require__(24);

  setKey(module, "exports", function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIObject($this);
      var length = toLength(O._ES5ProxyType ? O.get("length") : O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        var _index, _index2;

        value = (_index = index++, _index2 = O._ES5ProxyType ? O.get(_index) : O[_index]); // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) if (IS_INCLUDES || inKey(O, index)) {
        if ((O._ES5ProxyType ? O.get(index) : O[index]) === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
    };
  });
  /***/

},
/* 39 */

/***/
function (module, exports) {
  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;

  setKey(module, "exports", function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  });
  /***/

},
/* 40 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__4, _f2, _ref7, _toString2;

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
  var toIObject = __webpack_require__(7);

  var gOPN = (_webpack_require__4 = __webpack_require__(28), _f2 = _webpack_require__4._ES5ProxyType ? _webpack_require__4.get("f") : _webpack_require__4.f);
  var toString = (_ref7 = {}, _toString2 = _ref7._ES5ProxyType ? _ref7.get("toString") : _ref7.toString);
  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return gOPN(it);
    } catch (e) {
      return callKey0(windowNames, "slice");
    }
  };

  setKey(module._ES5ProxyType ? module.get("exports") : module.exports, "f", function getOwnPropertyNames(it) {
    return windowNames && callKey1(toString, "call", it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
  });
  /***/

},
/* 41 */

/***/
function (module, exports, __webpack_require__) {
  var pIE = __webpack_require__(19);

  var createDesc = __webpack_require__(16);

  var toIObject = __webpack_require__(7);

  var toPrimitive = __webpack_require__(20);

  var has = __webpack_require__(5);

  var IE8_DOM_DEFINE = __webpack_require__(31);

  var gOPD = Object.compatGetOwnPropertyDescriptor;

  setKey(exports, "f", __webpack_require__(8) ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = toIObject(O);
    P = toPrimitive(P, true);
    if (IE8_DOM_DEFINE) try {
      return gOPD(O, P);
    } catch (e) {
      /* empty */
    }
    if (has(O, P)) return createDesc(!callKey2(pIE._ES5ProxyType ? pIE.get("f") : pIE.f, "call", O, P), O._ES5ProxyType ? O.get(P) : O[P]);
  });
  /***/

},
/* 42 */

/***/
function (module, exports) {
  setKey(module, "exports", {});
  /***/

},
/* 43 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__5, _f3;

  var getKeys = __webpack_require__(14);

  var toIObject = __webpack_require__(7);

  var isEnum = (_webpack_require__5 = __webpack_require__(19), _f3 = _webpack_require__5._ES5ProxyType ? _webpack_require__5.get("f") : _webpack_require__5.f);

  setKey(module, "exports", function (isEntries) {
    return function (it) {
      var O = toIObject(it);
      var keys = getKeys(O);
      var length = keys._ES5ProxyType ? keys.get("length") : keys.length;
      var i = 0;
      var result = [];
      var key;

      while (length > i) {
        var _i4, _i5;

        if (callKey2(isEnum, "call", O, key = (_i4 = i++, _i5 = keys._ES5ProxyType ? keys.get(_i4) : keys[_i4]))) {
          result.push(isEntries ? [key, O._ES5ProxyType ? O.get(key) : O[key]] : O._ES5ProxyType ? O.get(key) : O[key]);
        }
      }

      return result;
    };
  });
  /***/

},
/* 44 */

/***/
function (module, exports, __webpack_require__) {
  __webpack_require__(45);

  __webpack_require__(55);

  __webpack_require__(57);

  __webpack_require__(58);

  __webpack_require__(59);

  __webpack_require__(60);

  __webpack_require__(61);

  __webpack_require__(62);

  __webpack_require__(63);

  __webpack_require__(64);

  __webpack_require__(65);

  __webpack_require__(67);

  __webpack_require__(73);

  __webpack_require__(74);

  __webpack_require__(76);

  __webpack_require__(78);

  __webpack_require__(79);

  __webpack_require__(81);

  setKey(module, "exports", __webpack_require__(82));
  /***/

},
/* 45 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // ECMAScript 6 symbols shim

  var _webpack_require__6, _KEY2, _ref8, _propertyIsEnumerable2, _PROTOTYPE2, _findChild, _PROTOTYPE3, _TO_PRIMITIVE, _PROTOTYPE4, _valueOf;

  var global = __webpack_require__(2);

  var has = __webpack_require__(5);

  var DESCRIPTORS = __webpack_require__(8);

  var $export = __webpack_require__(0);

  var redefine = __webpack_require__(33);

  var META = (_webpack_require__6 = __webpack_require__(17), _KEY2 = _webpack_require__6._ES5ProxyType ? _webpack_require__6.get("KEY") : _webpack_require__6.KEY);

  var $fails = __webpack_require__(9);

  var shared = __webpack_require__(21);

  var setToStringTag = __webpack_require__(47);

  var uid = __webpack_require__(13);

  var wks = __webpack_require__(4);

  var wksExt = __webpack_require__(35);

  var wksDefine = __webpack_require__(48);

  var enumKeys = __webpack_require__(49);

  var isArray = __webpack_require__(51);

  var anObject = __webpack_require__(11);

  var isObject = __webpack_require__(1);

  var toIObject = __webpack_require__(7);

  var toPrimitive = __webpack_require__(20);

  var createDesc = __webpack_require__(16);

  var _create = __webpack_require__(52);

  var gOPNExt = __webpack_require__(40);

  var $GOPD = __webpack_require__(41);

  var $DP = __webpack_require__(6);

  var $keys = __webpack_require__(14);

  var gOPD = $GOPD._ES5ProxyType ? $GOPD.get("f") : $GOPD.f;
  var dP = $DP._ES5ProxyType ? $DP.get("f") : $DP.f;
  var gOPN = gOPNExt._ES5ProxyType ? gOPNExt.get("f") : gOPNExt.f;
  var $Symbol = global._ES5ProxyType ? global.get("Symbol") : global.Symbol;
  var $JSON = global._ES5ProxyType ? global.get("JSON") : global.JSON;

  var _stringify = $JSON && ($JSON._ES5ProxyType ? $JSON.get("stringify") : $JSON.stringify);

  var PROTOTYPE = 'prototype';
  var HIDDEN = wks('_hidden');
  var TO_PRIMITIVE = wks('toPrimitive');
  var isEnum = (_ref8 = {}, _propertyIsEnumerable2 = _ref8._ES5ProxyType ? _ref8.get("propertyIsEnumerable") : _ref8.propertyIsEnumerable);
  var SymbolRegistry = shared('symbol-registry');
  var AllSymbols = shared('symbols');
  var OPSymbols = shared('op-symbols');
  var ObjectProto = Object[PROTOTYPE];
  var USE_NATIVE = typeof $Symbol == 'function';
  var QObject = global._ES5ProxyType ? global.get("QObject") : global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

  var setter = !QObject || !(QObject._ES5ProxyType ? QObject.get(PROTOTYPE) : QObject[PROTOTYPE]) || !(_PROTOTYPE2 = QObject._ES5ProxyType ? QObject.get(PROTOTYPE) : QObject[PROTOTYPE], _findChild = _PROTOTYPE2._ES5ProxyType ? _PROTOTYPE2.get("findChild") : _PROTOTYPE2.findChild); // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

  var setSymbolDesc = DESCRIPTORS && $fails(function () {
    var _create2, _a3;

    return (_create2 = _create(dP({}, 'a', {
      get: function () {
        var _dP, _a4;

        return _dP = dP(this, 'a', {
          value: 7
        }), _a4 = _dP._ES5ProxyType ? _dP.get("a") : _dP.a;
      }
    })), _a3 = _create2._ES5ProxyType ? _create2.get("a") : _create2.a) != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD(ObjectProto, key);
    if (protoDesc) deleteKey(ObjectProto, key);
    dP(it, key, D);
    if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
  } : dP;

  var wrap = function (tag) {
    var sym = setKey(AllSymbols, tag, _create($Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE]));

    setKey(sym, "_k", tag);

    return sym;
  };

  var isSymbol = USE_NATIVE && typeof ($Symbol._ES5ProxyType ? $Symbol.get("iterator") : $Symbol.iterator) == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return instanceOfKey(it, $Symbol);
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
    anObject(it);
    key = toPrimitive(key, true);
    anObject(D);

    if (has(AllSymbols, key)) {
      if (!(D._ES5ProxyType ? D.get("enumerable") : D.enumerable)) {
        if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));

        setKey(it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], key, true);
      } else {
        var _HIDDEN, _key2;

        if (has(it, HIDDEN) && (_HIDDEN = it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], _key2 = _HIDDEN._ES5ProxyType ? _HIDDEN.get(key) : _HIDDEN[key])) setKey(it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], key, false);
        D = _create(D, {
          enumerable: createDesc(0, false)
        });
      }

      return setSymbolDesc(it, key, D);
    }

    return dP(it, key, D);
  };

  var $defineProperties = function defineProperties(it, P) {
    anObject(it);
    var keys = enumKeys(P = toIObject(P));
    var i = 0;
    var l = keys._ES5ProxyType ? keys.get("length") : keys.length;
    var key;

    while (l > i) {
      var _i6, _i7;

      $defineProperty(it, key = (_i6 = i++, _i7 = keys._ES5ProxyType ? keys.get(_i6) : keys[_i6]), P._ES5ProxyType ? P.get(key) : P[key]);
    }

    return it;
  };

  var $create = function create(it, P) {
    return P === undefined ? _create(it) : $defineProperties(_create(it), P);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var _HIDDEN2, _key3;

    var E = callKey2(isEnum, "call", this, key = toPrimitive(key, true));

    if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
    return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && (_HIDDEN2 = this._ES5ProxyType ? this.get(HIDDEN) : this[HIDDEN], _key3 = _HIDDEN2._ES5ProxyType ? _HIDDEN2.get(key) : _HIDDEN2[key]) ? E : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    var _HIDDEN3, _key4;

    it = toIObject(it);
    key = toPrimitive(key, true);
    if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
    var D = gOPD(it, key);
    if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && (_HIDDEN3 = it._ES5ProxyType ? it.get(HIDDEN) : it[HIDDEN], _key4 = _HIDDEN3._ES5ProxyType ? _HIDDEN3.get(key) : _HIDDEN3[key]))) setKey(D, "enumerable", true);
    return D;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN(toIObject(it));
    var result = [];
    var i = 0;
    var key;

    while ((names._ES5ProxyType ? names.get("length") : names.length) > i) {
      var _i8, _i9;

      if (!has(AllSymbols, key = (_i8 = i++, _i9 = names._ES5ProxyType ? names.get(_i8) : names[_i8])) && key != HIDDEN && key != META) result.push(key);
    }

    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto;
    var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
    var result = [];
    var i = 0;
    var key;

    while ((names._ES5ProxyType ? names.get("length") : names.length) > i) {
      var _i10, _i11;

      if (has(AllSymbols, key = (_i10 = i++, _i11 = names._ES5ProxyType ? names.get(_i10) : names[_i10])) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols._ES5ProxyType ? AllSymbols.get(key) : AllSymbols[key]);
    }

    return result;
  }; // 19.4.1.1 Symbol([description])


  if (!USE_NATIVE) {
    $Symbol = function Symbol() {
      if (instanceOfKey(this, $Symbol)) throw TypeError('Symbol is not a constructor!');
      var tag = uid(arguments.length > 0 ? arguments[0] : undefined);

      var $set = function (value) {
        if (this === ObjectProto) callKey2($set, "call", OPSymbols, value);
        if (has(this, HIDDEN) && has(this._ES5ProxyType ? this.get(HIDDEN) : this[HIDDEN], tag)) setKey(this._ES5ProxyType ? this.get(HIDDEN) : this[HIDDEN], tag, false);
        setSymbolDesc(this, tag, createDesc(1, value));
      };

      if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, {
        configurable: true,
        set: $set
      });
      return wrap(tag);
    };

    redefine($Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], 'toString', function toString() {
      return this._ES5ProxyType ? this.get("_k") : this._k;
    });

    setKey($GOPD, "f", $getOwnPropertyDescriptor);

    setKey($DP, "f", $defineProperty);

    setKey(__webpack_require__(28), "f", setKey(gOPNExt, "f", $getOwnPropertyNames));

    setKey(__webpack_require__(19), "f", $propertyIsEnumerable);

    setKey(__webpack_require__(27), "f", $getOwnPropertySymbols);

    if (DESCRIPTORS && !__webpack_require__(22)) {
      redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    setKey(wksExt, "f", function (name) {
      return wrap(wks(name));
    });
  }

  $export(($export._ES5ProxyType ? $export.get("G") : $export.G) + ($export._ES5ProxyType ? $export.get("W") : $export.W) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !USE_NATIVE, {
    Symbol: $Symbol
  });

  for (var es6Symbols = callKey1( // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables', "split", ','), j = 0; (es6Symbols._ES5ProxyType ? es6Symbols.get("length") : es6Symbols.length) > j;) {
    var _j, _j2;

    wks((_j = j++, _j2 = es6Symbols._ES5ProxyType ? es6Symbols.get(_j) : es6Symbols[_j]));
  }

  for (var wellKnownSymbols = $keys(wks._ES5ProxyType ? wks.get("store") : wks.store), k = 0; (wellKnownSymbols._ES5ProxyType ? wellKnownSymbols.get("length") : wellKnownSymbols.length) > k;) {
    var _k, _k2;

    wksDefine((_k = k++, _k2 = wellKnownSymbols._ES5ProxyType ? wellKnownSymbols.get(_k) : wellKnownSymbols[_k]));
  }

  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !USE_NATIVE, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function (key) {
      return has(SymbolRegistry, key += '') ? SymbolRegistry._ES5ProxyType ? SymbolRegistry.get(key) : SymbolRegistry[key] : setKey(SymbolRegistry, key, $Symbol(key));
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');

      for (var key in iterableKey(SymbolRegistry)) if ((SymbolRegistry._ES5ProxyType ? SymbolRegistry.get(key) : SymbolRegistry[key]) === sym) return key;
    },
    useSetter: function () {
      setter = true;
    },
    useSimple: function () {
      setter = false;
    }
  });
  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !USE_NATIVE, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  }); // 24.3.2 JSON.stringify(value [, replacer [, space]])

  $JSON && $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * (!USE_NATIVE || $fails(function () {
    var S = $Symbol(); // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols

    return _stringify([S]) != '[null]' || _stringify({
      a: S
    }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;

      while (arguments.length > i) args.push(arguments[i++]);

      $replacer = replacer = args._ES5ProxyType ? args.get(1) : args[1];
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = callKey3($replacer, "call", this, key, value);
        if (!isSymbol(value)) return value;
      };

      setKey(args, 1, replacer);

      return callKey2(_stringify, "apply", $JSON, args);
    }
  }); // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

  (_PROTOTYPE3 = $Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], _TO_PRIMITIVE = _PROTOTYPE3._ES5ProxyType ? _PROTOTYPE3.get(TO_PRIMITIVE) : _PROTOTYPE3[TO_PRIMITIVE]) || __webpack_require__(15)($Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], TO_PRIMITIVE, (_PROTOTYPE4 = $Symbol._ES5ProxyType ? $Symbol.get(PROTOTYPE) : $Symbol[PROTOTYPE], _valueOf = _PROTOTYPE4._ES5ProxyType ? _PROTOTYPE4.get("valueOf") : _PROTOTYPE4.valueOf)); // 19.4.3.5 Symbol.prototype[@@toStringTag]

  setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]

  setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]

  setToStringTag(global._ES5ProxyType ? global.get("JSON") : global.JSON, 'JSON', true);
  /***/
},
/* 46 */

/***/
function (module, exports) {
  setKey(module, "exports", function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  });
  /***/

},
/* 47 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__7, _f4;

  var def = (_webpack_require__7 = __webpack_require__(6), _f4 = _webpack_require__7._ES5ProxyType ? _webpack_require__7.get("f") : _webpack_require__7.f);

  var has = __webpack_require__(5);

  var TAG = __webpack_require__(4)('toStringTag');

  setKey(module, "exports", function (it, tag, stat) {
    if (it && !has(it = stat ? it : it._ES5ProxyType ? it.get("prototype") : it.prototype, TAG)) def(it, TAG, {
      configurable: true,
      value: tag
    });
  });
  /***/

},
/* 48 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__8, _f5;

  var global = __webpack_require__(2);

  var core = __webpack_require__(10);

  var LIBRARY = __webpack_require__(22);

  var wksExt = __webpack_require__(35);

  var defineProperty = (_webpack_require__8 = __webpack_require__(6), _f5 = _webpack_require__8._ES5ProxyType ? _webpack_require__8.get("f") : _webpack_require__8.f);

  setKey(module, "exports", function (name) {
    var $Symbol = (core._ES5ProxyType ? core.get("Symbol") : core.Symbol) || setKey(core, "Symbol", LIBRARY ? {} : (global._ES5ProxyType ? global.get("Symbol") : global.Symbol) || {});

    if (callKey1(name, "charAt", 0) != '_' && !inKey($Symbol, name)) defineProperty($Symbol, name, {
      value: callKey1(wksExt, "f", name)
    });
  });
  /***/

},
/* 49 */

/***/
function (module, exports, __webpack_require__) {
  // all enumerable object keys, includes symbols
  var getKeys = __webpack_require__(14);

  var gOPS = __webpack_require__(27);

  var pIE = __webpack_require__(19);

  setKey(module, "exports", function (it) {
    var result = getKeys(it);
    var getSymbols = gOPS._ES5ProxyType ? gOPS.get("f") : gOPS.f;

    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = pIE._ES5ProxyType ? pIE.get("f") : pIE.f;
      var i = 0;
      var key;

      while ((symbols._ES5ProxyType ? symbols.get("length") : symbols.length) > i) {
        var _i12, _i13;

        if (callKey2(isEnum, "call", it, key = (_i12 = i++, _i13 = symbols._ES5ProxyType ? symbols.get(_i12) : symbols[_i12]))) result.push(key);
      }
    }

    return result;
  });
  /***/

},
/* 50 */

/***/
function (module, exports, __webpack_require__) {
  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var cof = __webpack_require__(23); // eslint-disable-next-line no-prototype-builtins


  setKey(module, "exports", callKey1(Object('z'), "propertyIsEnumerable", 0) ? Object : function (it) {
    return cof(it) == 'String' ? callKey1(it, "split", '') : Object(it);
  });
  /***/

},
/* 51 */

/***/
function (module, exports, __webpack_require__) {
  // 7.2.2 IsArray(argument)
  var cof = __webpack_require__(23);

  setKey(module, "exports", Array.compatIsArray || function isArray(arg) {
    return cof(arg) == 'Array';
  });
  /***/

},
/* 52 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  var anObject = __webpack_require__(11);

  var dPs = __webpack_require__(53);

  var enumBugKeys = __webpack_require__(26);

  var IE_PROTO = __webpack_require__(25)('IE_PROTO');

  var Empty = function () {
    /* empty */
  };

  var PROTOTYPE = 'prototype'; // Create object with fake `null` prototype: use iframe Object with cleared prototype

  var createDict = function () {
    var _contentWindow, _document2;

    // Thrash, waste and sodomy: IE GC bug
    var iframe = __webpack_require__(32)('iframe');

    var i = enumBugKeys._ES5ProxyType ? enumBugKeys.get("length") : enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;

    setKey(iframe._ES5ProxyType ? iframe.get("style") : iframe.style, "display", 'none');

    callKey1(__webpack_require__(54), "appendChild", iframe);

    setKey(iframe, "src", 'javascript:'); // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);


    iframeDocument = (_contentWindow = iframe._ES5ProxyType ? iframe.get("contentWindow") : iframe.contentWindow, _document2 = _contentWindow._ES5ProxyType ? _contentWindow.get("document") : _contentWindow.document);

    callKey0(iframeDocument, "open");

    callKey1(iframeDocument, "write", lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);

    callKey0(iframeDocument, "close");

    createDict = iframeDocument._ES5ProxyType ? iframeDocument.get("F") : iframeDocument.F;

    while (i--) deleteKey(createDict._ES5ProxyType ? createDict.get(PROTOTYPE) : createDict[PROTOTYPE], enumBugKeys._ES5ProxyType ? enumBugKeys.get(i) : enumBugKeys[i]);

    return createDict();
  };

  setKey(module, "exports", Object.create || function create(O, Properties) {
    var result;

    if (O !== null) {
      setKey(Empty, PROTOTYPE, anObject(O));

      result = new Empty();

      setKey(Empty, PROTOTYPE, null); // add "__proto__" for Object.getPrototypeOf polyfill


      setKey(result, IE_PROTO, O);
    } else result = createDict();

    return Properties === undefined ? result : dPs(result, Properties);
  });
  /***/

},
/* 53 */

/***/
function (module, exports, __webpack_require__) {
  var dP = __webpack_require__(6);

  var anObject = __webpack_require__(11);

  var getKeys = __webpack_require__(14);

  setKey(module, "exports", __webpack_require__(8) ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = getKeys(Properties);
    var length = keys._ES5ProxyType ? keys.get("length") : keys.length;
    var i = 0;
    var P;

    while (length > i) {
      var _i14, _i15;

      callKey3(dP, "f", O, P = (_i14 = i++, _i15 = keys._ES5ProxyType ? keys.get(_i14) : keys[_i14]), Properties._ES5ProxyType ? Properties.get(P) : Properties[P]);
    }

    return O;
  });
  /***/

},
/* 54 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__9, _document3;

  var document = (_webpack_require__9 = __webpack_require__(2), _document3 = _webpack_require__9._ES5ProxyType ? _webpack_require__9.get("document") : _webpack_require__9.document);

  setKey(module, "exports", document && (document._ES5ProxyType ? document.get("documentElement") : document.documentElement));
  /***/

},
/* 55 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.9 Object.getPrototypeOf(O)
  var toObject = __webpack_require__(12);

  var $getPrototypeOf = __webpack_require__(56);

  __webpack_require__(3)('getPrototypeOf', function () {
    return function getPrototypeOf(it) {
      return $getPrototypeOf(toObject(it));
    };
  });
  /***/

},
/* 56 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  var has = __webpack_require__(5);

  var toObject = __webpack_require__(12);

  var IE_PROTO = __webpack_require__(25)('IE_PROTO');

  var ObjectProto = Object.prototype;

  setKey(module, "exports", Object.getPrototypeOf || function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO)) return O._ES5ProxyType ? O.get(IE_PROTO) : O[IE_PROTO];

    if (typeof (O._ES5ProxyType ? O.get("constructor") : O.constructor) == 'function' && instanceOfKey(O, O._ES5ProxyType ? O.get("constructor") : O.constructor)) {
      var _constructor, _prototype;

      return _constructor = O._ES5ProxyType ? O.get("constructor") : O.constructor, _prototype = _constructor._ES5ProxyType ? _constructor.get("prototype") : _constructor.prototype;
    }

    return instanceOfKey(O, Object) ? ObjectProto : null;
  });
  /***/

},
/* 57 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.14 Object.keys(O)
  var toObject = __webpack_require__(12);

  var $keys = __webpack_require__(14);

  __webpack_require__(3)('keys', function () {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  /***/

},
/* 58 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  __webpack_require__(3)('getOwnPropertyNames', function () {
    var _webpack_require__10, _f6;

    return _webpack_require__10 = __webpack_require__(40), _f6 = _webpack_require__10._ES5ProxyType ? _webpack_require__10.get("f") : _webpack_require__10.f;
  });
  /***/

},
/* 59 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__11, _onFreeze;

  // 19.1.2.5 Object.freeze(O)
  var isObject = __webpack_require__(1);

  var meta = (_webpack_require__11 = __webpack_require__(17), _onFreeze = _webpack_require__11._ES5ProxyType ? _webpack_require__11.get("onFreeze") : _webpack_require__11.onFreeze);

  __webpack_require__(3)('freeze', function ($freeze) {
    return function freeze(it) {
      return $freeze && isObject(it) ? $freeze(meta(it)) : it;
    };
  });
  /***/

},
/* 60 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__12, _onFreeze2;

  // 19.1.2.17 Object.seal(O)
  var isObject = __webpack_require__(1);

  var meta = (_webpack_require__12 = __webpack_require__(17), _onFreeze2 = _webpack_require__12._ES5ProxyType ? _webpack_require__12.get("onFreeze") : _webpack_require__12.onFreeze);

  __webpack_require__(3)('seal', function ($seal) {
    return function seal(it) {
      return $seal && isObject(it) ? $seal(meta(it)) : it;
    };
  });
  /***/

},
/* 61 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__13, _onFreeze3;

  // 19.1.2.15 Object.preventExtensions(O)
  var isObject = __webpack_require__(1);

  var meta = (_webpack_require__13 = __webpack_require__(17), _onFreeze3 = _webpack_require__13._ES5ProxyType ? _webpack_require__13.get("onFreeze") : _webpack_require__13.onFreeze);

  __webpack_require__(3)('preventExtensions', function ($preventExtensions) {
    return function preventExtensions(it) {
      return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
    };
  });
  /***/

},
/* 62 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.12 Object.isFrozen(O)
  var isObject = __webpack_require__(1);

  __webpack_require__(3)('isFrozen', function ($isFrozen) {
    return function isFrozen(it) {
      return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
    };
  });
  /***/

},
/* 63 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.13 Object.isSealed(O)
  var isObject = __webpack_require__(1);

  __webpack_require__(3)('isSealed', function ($isSealed) {
    return function isSealed(it) {
      return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
    };
  });
  /***/

},
/* 64 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.2.11 Object.isExtensible(O)
  var isObject = __webpack_require__(1);

  __webpack_require__(3)('isExtensible', function ($isExtensible) {
    return function isExtensible(it) {
      return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
    };
  });
  /***/

},
/* 65 */

/***/
function (module, exports, __webpack_require__) {
  // 19.1.3.10 Object.is(value1, value2)
  var $export = __webpack_require__(0);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    is: __webpack_require__(66)
  });
  /***/
},
/* 66 */

/***/
function (module, exports) {
  // 7.2.9 SameValue(x, y)
  setKey(module, "exports", Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  });
  /***/

},
/* 67 */

/***/
function (module, exports, __webpack_require__) {
  "use strict";

  var ctx = __webpack_require__(34);

  var $export = __webpack_require__(0);

  var toObject = __webpack_require__(12);

  var call = __webpack_require__(68);

  var isArrayIter = __webpack_require__(69);

  var toLength = __webpack_require__(18);

  var createProperty = __webpack_require__(29);

  var getIterFn = __webpack_require__(70);

  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * !__webpack_require__(72)(function (iter) {
    Array.from(iter);
  }), 'Array', {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function from(arrayLike
    /* , mapfn = undefined, thisArg = undefined */
    ) {
      var O = toObject(arrayLike);
      var C = typeof this == 'function' ? this : Array;
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var index = 0;
      var iterFn = getIterFn(O);
      var length, result, step, iterator;
      if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2); // if object isn't iterable or it's array with default iterator - use simple case

      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
        for (iterator = callKey1(iterFn, "call", O), result = new C(); !(_step = step = callKey0(iterator, "next"), _done = _step._ES5ProxyType ? _step.get("done") : _step.done); index++) {
          var _step, _done;

          createProperty(result, index, mapping ? call(iterator, mapfn, [step._ES5ProxyType ? step.get("value") : step.value, index], true) : step._ES5ProxyType ? step.get("value") : step.value);
        }
      } else {
        length = toLength(O._ES5ProxyType ? O.get("length") : O.length);

        for (result = new C(length); length > index; index++) {
          createProperty(result, index, mapping ? mapfn(O._ES5ProxyType ? O.get(index) : O[index], index) : O._ES5ProxyType ? O.get(index) : O[index]);
        }
      }

      setKey(result, "length", index);

      return result;
    }
  });
  /***/
},
/* 68 */

/***/
function (module, exports, __webpack_require__) {
  // call something on iterator step with safe closing on error
  var anObject = __webpack_require__(11);

  setKey(module, "exports", function (iterator, fn, value, entries) {
    try {
      var _anObject, _;

      return entries ? fn((_anObject = anObject(value), _ = _anObject._ES5ProxyType ? _anObject.get(0) : _anObject[0]), value._ES5ProxyType ? value.get(1) : value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator._ES5ProxyType ? iterator.get('return') : iterator['return'];
      if (ret !== undefined) anObject(callKey1(ret, "call", iterator));
      throw e;
    }
  });
  /***/

},
/* 69 */

/***/
function (module, exports, __webpack_require__) {
  // check on default Array iterator
  var Iterators = __webpack_require__(42);

  var ITERATOR = __webpack_require__(4)('iterator');

  var ArrayProto = Array.prototype;

  setKey(module, "exports", function (it) {
    return it !== undefined && ((Iterators._ES5ProxyType ? Iterators.get("Array") : Iterators.Array) === it || (ArrayProto._ES5ProxyType ? ArrayProto.get(ITERATOR) : ArrayProto[ITERATOR]) === it);
  });
  /***/

},
/* 70 */

/***/
function (module, exports, __webpack_require__) {
  var classof = __webpack_require__(71);

  var ITERATOR = __webpack_require__(4)('iterator');

  var Iterators = __webpack_require__(42);

  setKey(module, "exports", setKey(__webpack_require__(10), "getIteratorMethod", function (it) {
    var _classof, _classof2;

    if (it != undefined) return (it._ES5ProxyType ? it.get(ITERATOR) : it[ITERATOR]) || (it._ES5ProxyType ? it.get('@@iterator') : it['@@iterator']) || (_classof = classof(it), _classof2 = Iterators._ES5ProxyType ? Iterators.get(_classof) : Iterators[_classof]);
  }));
  /***/

},
/* 71 */

/***/
function (module, exports, __webpack_require__) {
  // getting tag from 19.1.3.6 Object.prototype.toString()
  var cof = __webpack_require__(23);

  var TAG = __webpack_require__(4)('toStringTag'); // ES3 wrong here


  var ARG = cof(function () {
    return arguments;
  }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

  var tryGet = function (it, key) {
    try {
      return it._ES5ProxyType ? it.get(key) : it[key];
    } catch (e) {
      /* empty */
    }
  };

  setKey(module, "exports", function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T // builtinTag case
    : ARG ? cof(O) // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof (O._ES5ProxyType ? O.get("callee") : O.callee) == 'function' ? 'Arguments' : B;
  });
  /***/

},
/* 72 */

/***/
function (module, exports, __webpack_require__) {
  var ITERATOR = __webpack_require__(4)('iterator');

  var SAFE_CLOSING = false;

  try {
    var riter = callKey0([7], ITERATOR);

    setKey(riter, 'return', function () {
      SAFE_CLOSING = true;
    }); // eslint-disable-next-line no-throw-literal


    Array.from(riter, function () {
      throw 2;
    });
  } catch (e) {
    /* empty */
  }

  setKey(module, "exports", function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;

    try {
      var arr = [7];

      var iter = callKey0(arr, ITERATOR);

      setKey(iter, "next", function () {
        return {
          done: safe = true
        };
      });

      setKey(arr, ITERATOR, function () {
        return iter;
      });

      exec(arr);
    } catch (e) {
      /* empty */
    }

    return safe;
  });
  /***/

},
/* 73 */

/***/
function (module, exports, __webpack_require__) {
  "use strict";

  var $export = __webpack_require__(0);

  var createProperty = __webpack_require__(29); // WebKit Array.of isn't generic


  $export(($export._ES5ProxyType ? $export.get("S") : $export.S) + ($export._ES5ProxyType ? $export.get("F") : $export.F) * __webpack_require__(9)(function () {
    function F() {
      /* empty */
    }

    return !instanceOfKey(callKey1(Array.of, "call", F), F);
  }), 'Array', {
    // 22.1.2.3 Array.of( ...items)
    of: function
      /* ...args */
    of() {
      var index = 0;
      var aLen = arguments.length;
      var result = new (typeof this == 'function' ? this : Array)(aLen);

      while (aLen > index) createProperty(result, index, arguments[index++]);

      setKey(result, "length", aLen);

      return result;
    }
  });
  /***/
},
/* 74 */

/***/
function (module, exports, __webpack_require__) {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  var $export = __webpack_require__(0);

  $export($export._ES5ProxyType ? $export.get("P") : $export.P, 'Array', {
    copyWithin: __webpack_require__(75)
  });

  __webpack_require__(30)('copyWithin');
  /***/

},
/* 75 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)

  var _ref9, _copyWithin;

  var toObject = __webpack_require__(12);

  var toAbsoluteIndex = __webpack_require__(24);

  var toLength = __webpack_require__(18);

  setKey(module, "exports", (_ref9 = [], _copyWithin = _ref9._ES5ProxyType ? _ref9.get("copyWithin") : _ref9.copyWithin) || function copyWithin(target
  /* = 0 */
  , start
  /* = 0, end = @length */
  ) {
    var O = toObject(this);
    var len = toLength(O._ES5ProxyType ? O.get("length") : O.length);
    var to = toAbsoluteIndex(target, len);
    var from = toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;

    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }

    while (count-- > 0) {
      if (inKey(O, from)) setKey(O, to, O._ES5ProxyType ? O.get(from) : O[from]);else deleteKey(O, to);
      to += inc;
      from += inc;
    }

    return O;
  });
  /***/

},
/* 76 */

/***/
function (module, exports, __webpack_require__) {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  var $export = __webpack_require__(0);

  $export($export._ES5ProxyType ? $export.get("P") : $export.P, 'Array', {
    fill: __webpack_require__(77)
  });

  __webpack_require__(30)('fill');
  /***/

},
/* 77 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)

  var toObject = __webpack_require__(12);

  var toAbsoluteIndex = __webpack_require__(24);

  var toLength = __webpack_require__(18);

  setKey(module, "exports", function fill(value
  /* , start = 0, end = @length */
  ) {
    var O = toObject(this);
    var length = toLength(O._ES5ProxyType ? O.get("length") : O.length);
    var aLen = arguments.length;
    var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : toAbsoluteIndex(end, length);

    while (endPos > index) setKey(O, index++, value);

    return O;
  });
  /***/

},
/* 78 */

/***/
function (module, exports, __webpack_require__) {
  "use strict"; // https://github.com/tc39/Array.prototype.includes

  var $export = __webpack_require__(0);

  var $includes = __webpack_require__(38)(true);

  $export($export._ES5ProxyType ? $export.get("P") : $export.P, 'Array', {
    includes: function includes(el
    /* , fromIndex = 0 */
    ) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  __webpack_require__(30)('includes');
  /***/

},
/* 79 */

/***/
function (module, exports, __webpack_require__) {
  // https://github.com/tc39/proposal-object-getownpropertydescriptors
  var $export = __webpack_require__(0);

  var ownKeys = __webpack_require__(80);

  var toIObject = __webpack_require__(7);

  var gOPD = __webpack_require__(41);

  var createProperty = __webpack_require__(29);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = toIObject(object);
      var getDesc = gOPD._ES5ProxyType ? gOPD.get("f") : gOPD.f;
      var keys = ownKeys(O);
      var result = {};
      var i = 0;
      var key, desc;

      while ((keys._ES5ProxyType ? keys.get("length") : keys.length) > i) {
        var _i16, _i17;

        desc = getDesc(O, key = (_i16 = i++, _i17 = keys._ES5ProxyType ? keys.get(_i16) : keys[_i16]));
        if (desc !== undefined) createProperty(result, key, desc);
      }

      return result;
    }
  });
  /***/
},
/* 80 */

/***/
function (module, exports, __webpack_require__) {
  var _webpack_require__14, _Reflect;

  // all object keys, includes non-enumerable and symbols
  var gOPN = __webpack_require__(28);

  var gOPS = __webpack_require__(27);

  var anObject = __webpack_require__(11);

  var Reflect = (_webpack_require__14 = __webpack_require__(2), _Reflect = _webpack_require__14._ES5ProxyType ? _webpack_require__14.get("Reflect") : _webpack_require__14.Reflect);

  setKey(module, "exports", Reflect && (Reflect._ES5ProxyType ? Reflect.get("ownKeys") : Reflect.ownKeys) || function ownKeys(it) {
    var keys = callKey1(gOPN, "f", anObject(it));

    var getSymbols = gOPS._ES5ProxyType ? gOPS.get("f") : gOPS.f;
    return getSymbols ? concat(keys, getSymbols(it)) : keys;
  });
  /***/

},
/* 81 */

/***/
function (module, exports, __webpack_require__) {
  // https://github.com/tc39/proposal-object-values-entries
  var $export = __webpack_require__(0);

  var $values = __webpack_require__(43)(false);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    values: function values(it) {
      return $values(it);
    }
  });
  /***/
},
/* 82 */

/***/
function (module, exports, __webpack_require__) {
  // https://github.com/tc39/proposal-object-values-entries
  var $export = __webpack_require__(0);

  var $entries = __webpack_require__(43)(true);

  $export($export._ES5ProxyType ? $export.get("S") : $export.S, 'Object', {
    entries: function entries(it) {
      return $entries(it);
    }
  });
  /***/
}
/******/
]);

/***/ })
/******/ ]);
Object.defineSymbolProperty = Object.defineProperty;
Object.defineProperty = Object.definePropertyNative;
Object.defineSymbolProperties = Object.defineProperties;
Object.defineProperties = Object.definePropertiesNative;