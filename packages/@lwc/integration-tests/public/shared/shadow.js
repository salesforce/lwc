(function () {
  'use strict';

  var _create, _create2;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

  /* proxy-compat-disable */

  /**
   * Copyright (C) 2018 salesforce.com, inc.
   */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  function invariant(value, msg) {
    if (!value) {
      throw new Error("Invariant Violation: ".concat(msg));
    }
  }

  function isTrue$1(value, msg) {
    if (!value) {
      throw new Error("Assert Violation: ".concat(msg));
    }
  }

  function isFalse$1(value, msg) {
    if (value) {
      throw new Error("Assert Violation: ".concat(msg));
    }
  }

  function fail(msg) {
    throw new Error(msg);
  }

  var assert = /*#__PURE__*/Object.freeze({
    __proto__: null,
    invariant: invariant,
    isTrue: isTrue$1,
    isFalse: isFalse$1,
    fail: fail
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var assign = Object.assign,
      create = Object.create,
      defineProperties = Object.defineProperties,
      defineProperty = Object.defineProperty,
      getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
      getPrototypeOf = Object.getPrototypeOf,
      hasOwnProperty = Object.hasOwnProperty,
      setPrototypeOf = Object.setPrototypeOf;
  var isArray = Array.isArray;
  var _Array$prototype = Array.prototype,
      ArrayFilter = _Array$prototype.filter,
      ArrayFind = _Array$prototype.find,
      ArrayIndexOf = _Array$prototype.indexOf,
      ArrayJoin = _Array$prototype.join,
      ArrayMap = _Array$prototype.map,
      ArrayPush = _Array$prototype.push,
      ArrayReduce = _Array$prototype.reduce,
      ArrayReverse = _Array$prototype.reverse,
      ArraySlice = _Array$prototype.slice,
      ArraySplice = _Array$prototype.splice,
      ArrayUnshift = _Array$prototype.unshift,
      forEach = _Array$prototype.forEach;
  var _String$prototype = String.prototype,
      StringCharCodeAt = _String$prototype.charCodeAt;

  function isUndefined(obj) {
    return obj === undefined;
  }

  function isNull(obj) {
    return obj === null;
  }

  function isTrue(obj) {
    return obj === true;
  }

  function isFalse(obj) {
    return obj === false;
  }

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function isObject(obj) {
    return _typeof(obj) === 'object';
  }

  var OtS = {}.toString;

  function toString(obj) {
    if (obj && obj.toString) {
      // Arrays might hold objects with "null" prototype So using
      // Array.prototype.toString directly will cause an error Iterate through
      // all the items and handle individually.
      if (isArray(obj)) {
        return ArrayJoin.call(ArrayMap.call(obj, toString), ',');
      }

      return obj.toString();
    } else if (_typeof(obj) === 'object') {
      return OtS.call(obj);
    } else {
      return obj + '';
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // Inspired from: https://mathiasbynens.be/notes/globalthis


  var _globalThis = /*@__PURE__*/function () {
    // On recent browsers, `globalThis` is already defined. In this case return it directly.
    if ((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) === 'object') {
      return globalThis;
    }

    var _globalThis;

    try {
      // eslint-disable-next-line no-extend-native
      Object.defineProperty(Object.prototype, '__magic__', {
        get: function get() {
          return this;
        },
        configurable: true
      }); // __magic__ is undefined in Safari 10 and IE10 and older.
      // @ts-ignore
      // eslint-disable-next-line no-undef

      _globalThis = __magic__; // @ts-ignore

      delete Object.prototype.__magic__;
    } catch (ex) {// In IE8, Object.defineProperty only works on DOM objects.
    } finally {
      // If the magic above fails for some reason we assume that we are in a legacy browser.
      // Assume `window` exists in this case.
      if (typeof _globalThis === 'undefined') {
        // @ts-ignore
        _globalThis = window;
      }
    }

    return _globalThis;
  }();
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var KEY__IS_NATIVE_SHADOW_ROOT_DEFINED = '$isNativeShadowRootDefined$';
  var KEY__SHADOW_RESOLVER = '$shadowResolver$';
  var KEY__SHADOW_RESOLVER_PRIVATE = '$$ShadowResolverKey$$';
  var KEY__SHADOW_TOKEN = '$shadowToken$';
  var KEY__SHADOW_TOKEN_PRIVATE = '$$ShadowTokenKey$$';
  var KEY__SYNTHETIC_MODE = '$$lwc-synthetic-mode';
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // We use this to detect symbol support in order to avoid the expensive symbol polyfill. Note that
  // we can't use typeof since it will fail when transpiling.

  var hasNativeSymbolSupport = /*@__PURE__*/function () {
    return Symbol('x').toString() === 'Symbol(x)';
  }();
  /** version: 2.11.8 */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // TODO [#2472]: Remove this workaround when appropriate.
  // eslint-disable-next-line lwc-internal/no-global-node


  var _Node = Node;
  var nodePrototype = _Node.prototype;
  var DOCUMENT_POSITION_CONTAINED_BY = _Node.DOCUMENT_POSITION_CONTAINED_BY,
      DOCUMENT_POSITION_CONTAINS = _Node.DOCUMENT_POSITION_CONTAINS,
      DOCUMENT_POSITION_PRECEDING = _Node.DOCUMENT_POSITION_PRECEDING,
      DOCUMENT_POSITION_FOLLOWING = _Node.DOCUMENT_POSITION_FOLLOWING,
      ELEMENT_NODE = _Node.ELEMENT_NODE,
      TEXT_NODE = _Node.TEXT_NODE,
      CDATA_SECTION_NODE = _Node.CDATA_SECTION_NODE,
      PROCESSING_INSTRUCTION_NODE = _Node.PROCESSING_INSTRUCTION_NODE,
      COMMENT_NODE = _Node.COMMENT_NODE;
  var appendChild = nodePrototype.appendChild,
      cloneNode = nodePrototype.cloneNode,
      compareDocumentPosition = nodePrototype.compareDocumentPosition,
      insertBefore = nodePrototype.insertBefore,
      removeChild = nodePrototype.removeChild,
      replaceChild = nodePrototype.replaceChild,
      hasChildNodes = nodePrototype.hasChildNodes;
  var contains = HTMLElement.prototype.contains;
  var firstChildGetter = getOwnPropertyDescriptor(nodePrototype, 'firstChild').get;
  var lastChildGetter = getOwnPropertyDescriptor(nodePrototype, 'lastChild').get;
  var textContentGetter = getOwnPropertyDescriptor(nodePrototype, 'textContent').get;
  var parentNodeGetter = getOwnPropertyDescriptor(nodePrototype, 'parentNode').get;
  var ownerDocumentGetter = getOwnPropertyDescriptor(nodePrototype, 'ownerDocument').get;
  var parentElementGetter = hasOwnProperty.call(nodePrototype, 'parentElement') ? getOwnPropertyDescriptor(nodePrototype, 'parentElement').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement').get; // IE11

  var textContextSetter = getOwnPropertyDescriptor(nodePrototype, 'textContent').set;
  var childNodesGetter = hasOwnProperty.call(nodePrototype, 'childNodes') ? getOwnPropertyDescriptor(nodePrototype, 'childNodes').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes').get; // IE11

  var isConnected = hasOwnProperty.call(nodePrototype, 'isConnected') ? getOwnPropertyDescriptor(nodePrototype, 'isConnected').get : function () {
    var doc = ownerDocumentGetter.call(this); // IE11

    return (// if doc is null, it means `this` is actually a document instance which
      // is always connected
      doc === null || (compareDocumentPosition.call(doc, this) & DOCUMENT_POSITION_CONTAINED_BY) !== 0
    );
  };
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var _Element$prototype = Element.prototype,
      getAttribute = _Element$prototype.getAttribute,
      getBoundingClientRect = _Element$prototype.getBoundingClientRect,
      getElementsByTagName$1 = _Element$prototype.getElementsByTagName,
      getElementsByTagNameNS$1 = _Element$prototype.getElementsByTagNameNS,
      hasAttribute = _Element$prototype.hasAttribute,
      querySelector = _Element$prototype.querySelector,
      querySelectorAll$1 = _Element$prototype.querySelectorAll,
      removeAttribute = _Element$prototype.removeAttribute,
      setAttribute = _Element$prototype.setAttribute;
  var attachShadow$1 = hasOwnProperty.call(Element.prototype, 'attachShadow') ? Element.prototype.attachShadow : function () {
    throw new TypeError('attachShadow() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill and use Lightning Web Components');
  };
  var childElementCountGetter = getOwnPropertyDescriptor(Element.prototype, 'childElementCount').get;
  var firstElementChildGetter = getOwnPropertyDescriptor(Element.prototype, 'firstElementChild').get;
  var lastElementChildGetter = getOwnPropertyDescriptor(Element.prototype, 'lastElementChild').get;
  var innerTextDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');
  var innerTextGetter = innerTextDescriptor ? innerTextDescriptor.get : null;
  var innerTextSetter = innerTextDescriptor ? innerTextDescriptor.set : null; // Note: Firefox does not have outerText, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText

  var outerTextDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'outerText');
  var outerTextGetter = outerTextDescriptor ? outerTextDescriptor.get : null;
  var outerTextSetter = outerTextDescriptor ? outerTextDescriptor.set : null;
  var innerHTMLDescriptor = hasOwnProperty.call(Element.prototype, 'innerHTML') ? getOwnPropertyDescriptor(Element.prototype, 'innerHTML') : getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML'); // IE11

  var innerHTMLGetter = innerHTMLDescriptor.get;
  var innerHTMLSetter = innerHTMLDescriptor.set;
  var outerHTMLDescriptor = hasOwnProperty.call(Element.prototype, 'outerHTML') ? getOwnPropertyDescriptor(Element.prototype, 'outerHTML') : getOwnPropertyDescriptor(HTMLElement.prototype, 'outerHTML'); // IE11

  var outerHTMLGetter = outerHTMLDescriptor.get;
  var outerHTMLSetter = outerHTMLDescriptor.set;
  var tagNameGetter = getOwnPropertyDescriptor(Element.prototype, 'tagName').get;
  var tabIndexDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex');
  var tabIndexGetter = tabIndexDescriptor.get;
  var tabIndexSetter = tabIndexDescriptor.set;
  var matches = hasOwnProperty.call(Element.prototype, 'matches') ? Element.prototype.matches : Element.prototype.msMatchesSelector; // IE11

  var childrenGetter = hasOwnProperty.call(Element.prototype, 'children') ? getOwnPropertyDescriptor(Element.prototype, 'children').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'children').get; // IE11
  // for IE11, access from HTMLElement
  // for all other browsers access the method from the parent Element interface

  var getElementsByClassName$1 = HTMLElement.prototype.getElementsByClassName;
  var shadowRootGetter = hasOwnProperty.call(Element.prototype, 'shadowRoot') ? getOwnPropertyDescriptor(Element.prototype, 'shadowRoot').get : function () {
    return null;
  };
  var assignedSlotGetter$1 = hasOwnProperty.call(Element.prototype, 'assignedSlot') ? getOwnPropertyDescriptor(Element.prototype, 'assignedSlot').get : function () {
    return null;
  };
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var assignedNodes, assignedElements;

  if (typeof HTMLSlotElement !== 'undefined') {
    assignedNodes = HTMLSlotElement.prototype.assignedNodes;
    assignedElements = HTMLSlotElement.prototype.assignedElements;
  } else {
    assignedNodes = function assignedNodes() {
      throw new TypeError("assignedNodes() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill to start using <slot> elements in your Lightning Web Component's template");
    };

    assignedElements = function assignedElements() {
      throw new TypeError("assignedElements() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill to start using <slot> elements in your Lightning Web Component's template");
    };
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var eventTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'target').get;
  var eventCurrentTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'currentTarget').get;
  var focusEventRelatedTargetGetter = getOwnPropertyDescriptor(FocusEvent.prototype, 'relatedTarget').get; // IE does not implement composedPath() but that's ok because we only use this instead of our
  // composedPath() polyfill when dealing with native shadow DOM components in mixed mode. Defaulting
  // to a NOOP just to be safe, even though this is almost guaranteed to be defined such a scenario.

  var composedPath = hasOwnProperty.call(Event.prototype, 'composedPath') ? Event.prototype.composedPath : function () {
    return [];
  };
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var DocumentPrototypeActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement').get;
  var elementFromPoint = hasOwnProperty.call(Document.prototype, 'elementFromPoint') ? Document.prototype.elementFromPoint : Document.prototype.msElementFromPoint; // IE11

  var elementsFromPoint = hasOwnProperty.call(Document.prototype, 'elementsFromPoint') ? Document.prototype.elementsFromPoint : Document.prototype.msElementsFromPoint; // IE11
  // defaultView can be null when a document has no browsing context. For example, the owner document
  // of a node in a template doesn't have a default view: https://jsfiddle.net/hv9z0q5a/

  var defaultViewGetter = getOwnPropertyDescriptor(Document.prototype, 'defaultView').get;
  var _Document$prototype = Document.prototype,
      createComment = _Document$prototype.createComment,
      querySelectorAll = _Document$prototype.querySelectorAll,
      getElementById = _Document$prototype.getElementById,
      getElementsByClassName = _Document$prototype.getElementsByClassName,
      getElementsByTagName = _Document$prototype.getElementsByTagName,
      getElementsByTagNameNS = _Document$prototype.getElementsByTagNameNS; // In Firefox v57 and lower, getElementsByName is defined on HTMLDocument.prototype
  // In all other browsers have the method on Document.prototype

  var getElementsByName = HTMLDocument.prototype.getElementsByName;
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var _window = window,
      windowAddEventListener = _window.addEventListener,
      windowRemoveEventListener = _window.removeEventListener,
      windowGetComputedStyle = _window.getComputedStyle,
      windowGetSelection = _window.getSelection;
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // There is code in the polyfills that requires access to the unpatched
  // Mutation Observer constructor, this the code for that.
  // Eventually, the polyfill should uses the patched version, and this file can be removed.

  var MO = MutationObserver;
  var MutationObserverObserve = MO.prototype.observe;
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var NativeShadowRoot = null;

  if (typeof ShadowRoot !== 'undefined') {
    NativeShadowRoot = ShadowRoot;
  }

  var isNativeShadowRootDefined = !isNull(NativeShadowRoot);
  var isInstanceOfNativeShadowRoot = isNull(NativeShadowRoot) ? function () {
    return false;
  } : function (node) {
    return node instanceof NativeShadowRoot;
  };
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function detect$4() {
    return typeof HTMLSlotElement === 'undefined';
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var createElement = Document.prototype.createElement;
  var CHAR_S = 115;
  var CHAR_L = 108;
  var CHAR_O = 111;
  var CHAR_T = 116;

  function apply$4() {
    // IE11 does not have this element definition
    // we don't care much about the construction phase, just the prototype
    var HTMLSlotElement = /*#__PURE__*/_createClass(function HTMLSlotElement() {
      _classCallCheck(this, HTMLSlotElement);
    }); // prototype inheritance dance


    setPrototypeOf(HTMLSlotElement, HTMLElement.constructor);
    setPrototypeOf(HTMLSlotElement.prototype, HTMLElement.prototype);
    Window.prototype.HTMLSlotElement = HTMLSlotElement; // IE11 doesn't have HTMLSlotElement, in which case we
    // need to patch Document.prototype.createElement to remap `slot`
    // elements to the right prototype

    defineProperty(Document.prototype, 'createElement', {
      value: function value(tagName, _options) {
        var elm = createElement.apply(this, ArraySlice.call(arguments));

        if (tagName.length === 4 && StringCharCodeAt.call(tagName, 0) === CHAR_S && StringCharCodeAt.call(tagName, 1) === CHAR_L && StringCharCodeAt.call(tagName, 2) === CHAR_O && StringCharCodeAt.call(tagName, 3) === CHAR_T) {
          // the new element is the `slot`, resetting the proto chain
          // the new newly created global HTMLSlotElement.prototype
          setPrototypeOf(elm, HTMLSlotElement.prototype);
        }

        return elm;
      }
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  if (detect$4()) {
    apply$4();
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // Helpful for tests running with jsdom


  function getOwnerDocument(node) {
    var doc = ownerDocumentGetter.call(node); // if doc is null, it means `this` is actually a document instance

    return doc === null ? node : doc;
  }

  function getOwnerWindow(node) {
    var doc = getOwnerDocument(node);
    var win = defaultViewGetter.call(doc);

    if (win === null) {
      // this method should never be called with a node that is not part
      // of a qualifying connected node.
      throw new TypeError();
    }

    return win;
  }

  var skipGlobalPatching; // TODO [#1222]: remove global bypass

  function isGlobalPatchingSkipped(node) {
    // we lazily compute this value instead of doing it during evaluation, this helps
    // for apps that are setting this after the engine code is evaluated.
    if (isUndefined(skipGlobalPatching)) {
      var ownerDocument = getOwnerDocument(node);
      skipGlobalPatching = ownerDocument.body && getAttribute.call(ownerDocument.body, 'data-global-patching-bypass') === 'temporary-bypass';
    }

    return isTrue(skipGlobalPatching);
  }

  function arrayFromCollection(collection) {
    var size = collection.length;
    var cloned = [];

    if (size > 0) {
      for (var i = 0; i < size; i++) {
        cloned[i] = collection[i];
      }
    }

    return cloned;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var eventTargetPrototype = typeof EventTarget !== 'undefined' ? EventTarget.prototype : _Node.prototype;
  var addEventListener = eventTargetPrototype.addEventListener,
      dispatchEvent = eventTargetPrototype.dispatchEvent,
      removeEventListener = eventTargetPrototype.removeEventListener;
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var EventListenerMap = new WeakMap();
  var ComposedPathMap = new WeakMap();

  function isEventListenerOrEventListenerObject(fnOrObj) {
    return isFunction(fnOrObj) || isObject(fnOrObj) && !isNull(fnOrObj) && isFunction(fnOrObj.handleEvent);
  }

  function shouldInvokeListener(event, target, currentTarget) {
    // Subsequent logic assumes that `currentTarget` must be contained in the composed path for the listener to be
    // invoked, but this is not always the case. `composedPath()` will sometimes return an empty array, even when the
    // listener should be invoked (e.g., a disconnected instance of EventTarget, an instance of XMLHttpRequest, etc).
    if (target === currentTarget) {
      return true;
    }

    var composedPath = ComposedPathMap.get(event);

    if (isUndefined(composedPath)) {
      composedPath = event.composedPath();
      ComposedPathMap.set(event, composedPath);
    }

    return composedPath.includes(currentTarget);
  }

  function getEventListenerWrapper(fnOrObj) {
    if (!isEventListenerOrEventListenerObject(fnOrObj)) {
      return fnOrObj;
    }

    var wrapperFn = EventListenerMap.get(fnOrObj);

    if (isUndefined(wrapperFn)) {
      wrapperFn = function wrapperFn(event) {
        // This function is invoked from an event listener and currentTarget is always defined.
        var currentTarget = eventCurrentTargetGetter.call(event);

        if (process.env.NODE_ENV !== 'production') {
          assert.invariant(isFalse(isSyntheticShadowHost(currentTarget)), 'This routine should not be used to wrap event listeners for host elements and shadow roots.');
        }

        var actualTarget = getActualTarget(event);

        if (!shouldInvokeListener(event, actualTarget, currentTarget)) {
          return;
        }

        return isFunction(fnOrObj) ? fnOrObj.call(this, event) : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
      };

      EventListenerMap.set(fnOrObj, wrapperFn);
    }

    return wrapperFn;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var eventToContextMap = new WeakMap();
  var customElementToWrappedListeners = new WeakMap();

  function getEventMap(elm) {
    var listenerInfo = customElementToWrappedListeners.get(elm);

    if (isUndefined(listenerInfo)) {
      listenerInfo = create(null);
      customElementToWrappedListeners.set(elm, listenerInfo);
    }

    return listenerInfo;
  }
  /**
   * Events dispatched on shadow roots actually end up being dispatched on their hosts. This means that the event.target
   * property of events dispatched on shadow roots always resolve to their host. This function understands this
   * abstraction and properly returns a reference to the shadow root when appropriate.
   */


  function getActualTarget(event) {
    var _a;

    return (_a = eventToShadowRootMap.get(event)) !== null && _a !== void 0 ? _a : eventTargetGetter.call(event);
  }

  var shadowRootEventListenerMap = new WeakMap();

  function getWrappedShadowRootListener(listener) {
    if (!isFunction(listener)) {
      throw new TypeError(); // avoiding problems with non-valid listeners
    }

    var shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);

    if (isUndefined(shadowRootWrappedListener)) {
      shadowRootWrappedListener = function shadowRootWrappedListener(event) {
        // currentTarget is always defined inside an event listener
        var currentTarget = eventCurrentTargetGetter.call(event); // If currentTarget is not an instance of a native shadow root then we're dealing with a
        // host element whose synthetic shadow root must be accessed via getShadowRoot().

        if (!isInstanceOfNativeShadowRoot(currentTarget)) {
          currentTarget = getShadowRoot(currentTarget);
        }

        var actualTarget = getActualTarget(event);

        if (shouldInvokeListener(event, actualTarget, currentTarget)) {
          listener.call(currentTarget, event);
        }
      };

      shadowRootWrappedListener.placement = 1
      /* SHADOW_ROOT_LISTENER */
      ;
      shadowRootEventListenerMap.set(listener, shadowRootWrappedListener);
    }

    return shadowRootWrappedListener;
  }

  var customElementEventListenerMap = new WeakMap();

  function getWrappedCustomElementListener(listener) {
    if (!isFunction(listener)) {
      throw new TypeError(); // avoiding problems with non-valid listeners
    }

    var customElementWrappedListener = customElementEventListenerMap.get(listener);

    if (isUndefined(customElementWrappedListener)) {
      customElementWrappedListener = function customElementWrappedListener(event) {
        // currentTarget is always defined inside an event listener
        var currentTarget = eventCurrentTargetGetter.call(event);
        var actualTarget = getActualTarget(event);

        if (shouldInvokeListener(event, actualTarget, currentTarget)) {
          listener.call(currentTarget, event);
        }
      };

      customElementWrappedListener.placement = 0
      /* CUSTOM_ELEMENT_LISTENER */
      ;
      customElementEventListenerMap.set(listener, customElementWrappedListener);
    }

    return customElementWrappedListener;
  }

  function domListener(evt) {
    var immediatePropagationStopped = false;
    var propagationStopped = false;
    var type = evt.type,
        stopImmediatePropagation = evt.stopImmediatePropagation,
        stopPropagation = evt.stopPropagation; // currentTarget is always defined

    var currentTarget = eventCurrentTargetGetter.call(evt);
    var listenerMap = getEventMap(currentTarget);
    var listeners = listenerMap[type]; // it must have listeners at this point

    defineProperty(evt, 'stopImmediatePropagation', {
      value: function value() {
        immediatePropagationStopped = true;
        stopImmediatePropagation.call(evt);
      },
      writable: true,
      enumerable: true,
      configurable: true
    });
    defineProperty(evt, 'stopPropagation', {
      value: function value() {
        propagationStopped = true;
        stopPropagation.call(evt);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }); // in case a listener adds or removes other listeners during invocation

    var bookkeeping = ArraySlice.call(listeners);

    function invokeListenersByPlacement(placement) {
      forEach.call(bookkeeping, function (listener) {
        if (isFalse(immediatePropagationStopped) && listener.placement === placement) {
          // making sure that the listener was not removed from the original listener queue
          if (ArrayIndexOf.call(listeners, listener) !== -1) {
            // all handlers on the custom element should be called with undefined 'this'
            listener.call(undefined, evt);
          }
        }
      });
    }

    eventToContextMap.set(evt, 1
    /* SHADOW_ROOT_LISTENER */
    );
    invokeListenersByPlacement(1
    /* SHADOW_ROOT_LISTENER */
    );

    if (isFalse(immediatePropagationStopped) && isFalse(propagationStopped)) {
      // doing the second iteration only if the first one didn't interrupt the event propagation
      eventToContextMap.set(evt, 0
      /* CUSTOM_ELEMENT_LISTENER */
      );
      invokeListenersByPlacement(0
      /* CUSTOM_ELEMENT_LISTENER */
      );
    }

    eventToContextMap.set(evt, 2
    /* UNKNOWN_LISTENER */
    );
  }

  function attachDOMListener(elm, type, wrappedListener) {
    var listenerMap = getEventMap(elm);
    var cmpEventHandlers = listenerMap[type];

    if (isUndefined(cmpEventHandlers)) {
      cmpEventHandlers = listenerMap[type] = [];
    } // Prevent identical listeners from subscribing to the same event type.
    // TODO [#1824]: Options will also play a factor when we introduce support for them (#1824).


    if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
      return;
    } // only add to DOM if there is no other listener on the same placement yet


    if (cmpEventHandlers.length === 0) {
      // super.addEventListener() - this will not work on
      addEventListener.call(elm, type, domListener);
    }

    ArrayPush.call(cmpEventHandlers, wrappedListener);
  }

  function detachDOMListener(elm, type, wrappedListener) {
    var listenerMap = getEventMap(elm);
    var p;
    var listeners;

    if (!isUndefined(listeners = listenerMap[type]) && (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1) {
      ArraySplice.call(listeners, p, 1); // only remove from DOM if there is no other listener on the same placement

      if (listeners.length === 0) {
        removeEventListener.call(elm, type, domListener);
      }
    }
  }

  function addCustomElementEventListener(type, listener, _options) {
    if (process.env.NODE_ENV !== 'production') {
      if (!isFunction(listener)) {
        throw new TypeError("Invalid second argument for Element.addEventListener() in ".concat(toString(this), " for event \"").concat(type, "\". Expected an EventListener but received ").concat(listener, "."));
      }
    } // TODO [#1824]: Lift this restriction on the option parameter


    if (isFunction(listener)) {
      var wrappedListener = getWrappedCustomElementListener(listener);
      attachDOMListener(this, type, wrappedListener);
    }
  }

  function removeCustomElementEventListener(type, listener, _options) {
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
      var wrappedListener = getWrappedCustomElementListener(listener);
      detachDOMListener(this, type, wrappedListener);
    }
  }

  function addShadowRootEventListener(sr, type, listener, _options) {
    if (process.env.NODE_ENV !== 'production') {
      if (!isFunction(listener)) {
        throw new TypeError("Invalid second argument for ShadowRoot.addEventListener() in ".concat(toString(sr), " for event \"").concat(type, "\". Expected an EventListener but received ").concat(listener, "."));
      }
    } // TODO [#1824]: Lift this restriction on the option parameter


    if (isFunction(listener)) {
      var elm = getHost(sr);
      var wrappedListener = getWrappedShadowRootListener(listener);
      attachDOMListener(elm, type, wrappedListener);
    }
  }

  function removeShadowRootEventListener(sr, type, listener, _options) {
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
      var elm = getHost(sr);
      var wrappedListener = getWrappedShadowRootListener(listener);
      detachDOMListener(elm, type, wrappedListener);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // Used as a back reference to identify the host element


  var HostElementKey = '$$HostElementKey$$';
  var ShadowedNodeKey = '$$ShadowedNodeKey$$';

  function fastDefineProperty(node, propName, config) {
    var shadowedNode = node;

    if (process.env.NODE_ENV !== 'production') {
      // in dev, we are more restrictive
      defineProperty(shadowedNode, propName, config);
    } else {
      var value = config.value; // in prod, we prioritize performance

      shadowedNode[propName] = value;
    }
  }

  function setNodeOwnerKey(node, value) {
    fastDefineProperty(node, HostElementKey, {
      value: value,
      configurable: true
    });
  }

  function setNodeKey(node, value) {
    fastDefineProperty(node, ShadowedNodeKey, {
      value: value
    });
  }

  function getNodeOwnerKey(node) {
    return node[HostElementKey];
  }

  function getNodeNearestOwnerKey(node) {
    var host = node;
    var hostKey; // search for the first element with owner identity (just in case of manually inserted elements)

    while (!isNull(host)) {
      hostKey = getNodeOwnerKey(host);

      if (!isUndefined(hostKey)) {
        return hostKey;
      }

      host = parentNodeGetter.call(host);
    }
  }

  function getNodeKey(node) {
    return node[ShadowedNodeKey];
  }
  /**
   * This function does not traverse up for performance reasons, but is sufficient for most use
   * cases. If we need to traverse up and verify those nodes that don't have owner key, use
   * isNodeDeepShadowed instead.
   */


  function isNodeShadowed(node) {
    return !isUndefined(getNodeOwnerKey(node));
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // when finding a slot in the DOM, we can fold it if it is contained
  // inside another slot.


  function foldSlotElement(slot) {
    var parent = parentElementGetter.call(slot);

    while (!isNull(parent) && isSlotElement(parent)) {
      slot = parent;
      parent = parentElementGetter.call(slot);
    }

    return slot;
  }

  function isNodeSlotted(host, node) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(host instanceof HTMLElement, "isNodeSlotted() should be called with a host as the first argument instead of ".concat(host));
      assert.invariant(node instanceof _Node, "isNodeSlotted() should be called with a node as the second argument instead of ".concat(node));
      assert.invariant(compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS, "isNodeSlotted() should never be called with a node that is not a child node of ".concat(host));
    }

    var hostKey = getNodeKey(host); // this routine assumes that the node is coming from a different shadow (it is not owned by the host)
    // just in case the provided node is not an element

    var currentElement = node instanceof Element ? node : parentElementGetter.call(node);

    while (!isNull(currentElement) && currentElement !== host) {
      var elmOwnerKey = getNodeNearestOwnerKey(currentElement);
      var parent = parentElementGetter.call(currentElement);

      if (elmOwnerKey === hostKey) {
        // we have reached an element inside the host's template, and only if
        // that element is an slot, then the node is considered slotted
        return isSlotElement(currentElement);
      } else if (parent === host) {
        return false;
      } else if (!isNull(parent) && getNodeNearestOwnerKey(parent) !== elmOwnerKey) {
        // we are crossing a boundary of some sort since the elm and its parent
        // have different owner key. for slotted elements, this is possible
        // if the parent happens to be a slot.
        if (isSlotElement(parent)) {
          /**
           * the slot parent might be allocated inside another slot, think of:
           * <x-root> (<--- root element)
           *    <x-parent> (<--- own by x-root)
           *       <x-child> (<--- own by x-root)
           *           <slot> (<--- own by x-child)
           *               <slot> (<--- own by x-parent)
           *                  <div> (<--- own by x-root)
           *
           * while checking if x-parent has the div slotted, we need to traverse
           * up, but when finding the first slot, we skip that one in favor of the
           * most outer slot parent before jumping into its corresponding host.
           */
          currentElement = getNodeOwner(foldSlotElement(parent));

          if (!isNull(currentElement)) {
            if (currentElement === host) {
              // the slot element is a top level element inside the shadow
              // of a host that was allocated into host in question
              return true;
            } else if (getNodeNearestOwnerKey(currentElement) === hostKey) {
              // the slot element is an element inside the shadow
              // of a host that was allocated into host in question
              return true;
            }
          }
        } else {
          return false;
        }
      } else {
        currentElement = parent;
      }
    }

    return false;
  }

  function getNodeOwner(node) {
    if (!(node instanceof _Node)) {
      return null;
    }

    var ownerKey = getNodeNearestOwnerKey(node);

    if (isUndefined(ownerKey)) {
      return null;
    }

    var nodeOwner = node; // At this point, node is a valid node with owner identity, now we need to find the owner node
    // search for a custom element with a VM that owns the first element with owner identity attached to it

    while (!isNull(nodeOwner) && getNodeKey(nodeOwner) !== ownerKey) {
      nodeOwner = parentNodeGetter.call(nodeOwner);
    }

    if (isNull(nodeOwner)) {
      return null;
    }

    return nodeOwner;
  }

  function isSyntheticSlotElement(node) {
    return isSlotElement(node) && isNodeShadowed(node);
  }

  function isSlotElement(node) {
    return node instanceof HTMLSlotElement;
  }

  function isNodeOwnedBy(owner, node) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(owner instanceof HTMLElement, "isNodeOwnedBy() should be called with an element as the first argument instead of ".concat(owner));
      assert.invariant(node instanceof _Node, "isNodeOwnedBy() should be called with a node as the second argument instead of ".concat(node));
      assert.invariant(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS, "isNodeOwnedBy() should never be called with a node that is not a child node of ".concat(owner));
    }

    var ownerKey = getNodeNearestOwnerKey(node);
    return isUndefined(ownerKey) || getNodeKey(owner) === ownerKey;
  }

  function shadowRootChildNodes(root) {
    var elm = getHost(root);
    return getAllMatches(elm, arrayFromCollection(childNodesGetter.call(elm)));
  }

  function getAllSlottedMatches(host, nodeList) {
    var filteredAndPatched = [];

    for (var i = 0, len = nodeList.length; i < len; i += 1) {
      var node = nodeList[i];

      if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
        ArrayPush.call(filteredAndPatched, node);
      }
    }

    return filteredAndPatched;
  }

  function getFirstSlottedMatch(host, nodeList) {
    for (var i = 0, len = nodeList.length; i < len; i += 1) {
      var node = nodeList[i];

      if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
        return node;
      }
    }

    return null;
  }

  function getAllMatches(owner, nodeList) {
    var filteredAndPatched = [];

    for (var i = 0, len = nodeList.length; i < len; i += 1) {
      var node = nodeList[i];
      var isOwned = isNodeOwnedBy(owner, node);

      if (isOwned) {
        // Patch querySelector, querySelectorAll, etc
        // if element is owned by VM
        ArrayPush.call(filteredAndPatched, node);
      }
    }

    return filteredAndPatched;
  }

  function getFirstMatch(owner, nodeList) {
    for (var i = 0, len = nodeList.length; i < len; i += 1) {
      if (isNodeOwnedBy(owner, nodeList[i])) {
        return nodeList[i];
      }
    }

    return null;
  }

  function shadowRootQuerySelector(root, selector) {
    var elm = getHost(root);
    var nodeList = arrayFromCollection(querySelectorAll$1.call(elm, selector));
    return getFirstMatch(elm, nodeList);
  }

  function shadowRootQuerySelectorAll(root, selector) {
    var elm = getHost(root);
    var nodeList = querySelectorAll$1.call(elm, selector);
    return getAllMatches(elm, arrayFromCollection(nodeList));
  }

  function getFilteredChildNodes(node) {
    if (!isSyntheticShadowHost(node) && !isSlotElement(node)) {
      // regular element - fast path
      var children = childNodesGetter.call(node);
      return arrayFromCollection(children);
    }

    if (isSyntheticShadowHost(node)) {
      // we need to get only the nodes that were slotted
      var slots = arrayFromCollection(querySelectorAll$1.call(node, 'slot'));
      var resolver = getShadowRootResolver(getShadowRoot(node)); // Typescript is inferring the wrong function type for this particular
      // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
      // @ts-ignore type-mismatch

      return ArrayReduce.call(slots, function (seed, slot) {
        if (resolver === getShadowRootResolver(slot)) {
          ArrayPush.apply(seed, getFilteredSlotAssignedNodes(slot));
        }

        return seed;
      }, []);
    } else {
      // slot element
      var _children = arrayFromCollection(childNodesGetter.call(node));

      var _resolver = getShadowRootResolver(node);

      return ArrayFilter.call(_children, function (child) {
        return _resolver === getShadowRootResolver(child);
      });
    }
  }

  function getFilteredSlotAssignedNodes(slot) {
    var owner = getNodeOwner(slot);

    if (isNull(owner)) {
      return [];
    }

    var childNodes = arrayFromCollection(childNodesGetter.call(slot));
    return ArrayFilter.call(childNodes, function (child) {
      return !isNodeShadowed(child) || !isNodeOwnedBy(owner, child);
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getTextContent(node) {
    switch (node.nodeType) {
      case ELEMENT_NODE:
        {
          var childNodes = getFilteredChildNodes(node);
          var content = '';

          for (var i = 0, len = childNodes.length; i < len; i += 1) {
            var currentNode = childNodes[i];

            if (currentNode.nodeType !== COMMENT_NODE) {
              content += getTextContent(currentNode);
            }
          }

          return content;
        }

      default:
        return node.nodeValue;
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var Items$1 = new WeakMap();

  function StaticNodeList() {
    throw new TypeError('Illegal constructor');
  }

  StaticNodeList.prototype = create(NodeList.prototype, (_create = {
    constructor: {
      writable: true,
      configurable: true,
      value: StaticNodeList
    },
    item: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(index) {
        return this[index];
      }
    },
    length: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return Items$1.get(this).length;
      }
    },
    // Iterator protocol
    forEach: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(cb, thisArg) {
        forEach.call(Items$1.get(this), cb, thisArg);
      }
    },
    entries: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        return ArrayMap.call(Items$1.get(this), function (v, i) {
          return [i, v];
        });
      }
    },
    keys: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        return ArrayMap.call(Items$1.get(this), function (_v, i) {
          return i;
        });
      }
    },
    values: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        return Items$1.get(this);
      }
    }
  }, _defineProperty(_create, Symbol.iterator, {
    writable: true,
    configurable: true,
    value: function value() {
      var _this = this;

      var nextIndex = 0;
      return {
        next: function next() {
          var items = Items$1.get(_this);
          return nextIndex < items.length ? {
            value: items[nextIndex++],
            done: false
          } : {
            done: true
          };
        }
      };
    }
  }), _defineProperty(_create, Symbol.toStringTag, {
    configurable: true,
    get: function get() {
      return 'NodeList';
    }
  }), _defineProperty(_create, "toString", {
    writable: true,
    configurable: true,
    value: function value() {
      return '[object NodeList]';
    }
  }), _create)); // prototype inheritance dance

  setPrototypeOf(StaticNodeList, NodeList);

  function createStaticNodeList(items) {
    var nodeList = create(StaticNodeList.prototype);
    Items$1.set(nodeList, items); // setting static indexes

    forEach.call(items, function (item, index) {
      defineProperty(nodeList, index, {
        value: item,
        enumerable: true,
        configurable: true
      });
    });
    return nodeList;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var Items = new WeakMap();

  function StaticHTMLCollection() {
    throw new TypeError('Illegal constructor');
  }

  StaticHTMLCollection.prototype = create(HTMLCollection.prototype, (_create2 = {
    constructor: {
      writable: true,
      configurable: true,
      value: StaticHTMLCollection
    },
    item: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(index) {
        return this[index];
      }
    },
    length: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return Items.get(this).length;
      }
    },
    // https://dom.spec.whatwg.org/#dom-htmlcollection-nameditem-key
    namedItem: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(name) {
        if (name === '') {
          return null;
        }

        var items = Items.get(this);

        for (var i = 0, len = items.length; i < len; i++) {
          var item = items[len];

          if (name === getAttribute.call(item, 'id') || name === getAttribute.call(item, 'name')) {
            return item;
          }
        }

        return null;
      }
    }
  }, _defineProperty(_create2, Symbol.toStringTag, {
    configurable: true,
    get: function get() {
      return 'HTMLCollection';
    }
  }), _defineProperty(_create2, "toString", {
    writable: true,
    configurable: true,
    value: function value() {
      return '[object HTMLCollection]';
    }
  }), _create2)); // prototype inheritance dance

  setPrototypeOf(StaticHTMLCollection, HTMLCollection);

  function createStaticHTMLCollection(items) {
    var collection = create(StaticHTMLCollection.prototype);
    Items.set(collection, items); // setting static indexes

    forEach.call(items, function (item, index) {
      defineProperty(collection, index, {
        value: item,
        enumerable: true,
        configurable: true
      });
    });
    return collection;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getInnerHTML(node) {
    var s = '';
    var childNodes = getFilteredChildNodes(node);

    for (var i = 0, len = childNodes.length; i < len; i += 1) {
      s += getOuterHTML(childNodes[i]);
    }

    return s;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString


  var escapeAttrRegExp = /[&\u00A0"]/g;
  var escapeDataRegExp = /[&\u00A0<>]/g;
  var _String$prototype2 = String.prototype,
      replace = _String$prototype2.replace,
      toLowerCase = _String$prototype2.toLowerCase;

  function escapeReplace(c) {
    switch (c) {
      case '&':
        return '&amp;';

      case '<':
        return '&lt;';

      case '>':
        return '&gt;';

      case '"':
        return '&quot;';

      case "\xA0":
        return '&nbsp;';

      default:
        return '';
    }
  }

  function escapeAttr(s) {
    return replace.call(s, escapeAttrRegExp, escapeReplace);
  }

  function escapeData(s) {
    return replace.call(s, escapeDataRegExp, escapeReplace);
  } // http://www.whatwg.org/specs/web-apps/current-work/#void-elements


  var voidElements = new Set(['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']);
  var plaintextParents = new Set(['STYLE', 'SCRIPT', 'XMP', 'IFRAME', 'NOEMBED', 'NOFRAMES', 'PLAINTEXT', 'NOSCRIPT']);

  function getOuterHTML(node) {
    switch (node.nodeType) {
      case ELEMENT_NODE:
        {
          var attrs = node.attributes;
          var tagName = tagNameGetter.call(node);
          var s = '<' + toLowerCase.call(tagName);

          for (var i = 0, attr; attr = attrs[i]; i++) {
            s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
          }

          s += '>';

          if (voidElements.has(tagName)) {
            return s;
          }

          return s + getInnerHTML(node) + '</' + toLowerCase.call(tagName) + '>';
        }

      case TEXT_NODE:
        {
          var data = node.data,
              parentNode = node.parentNode;

          if (parentNode instanceof Element && plaintextParents.has(tagNameGetter.call(parentNode))) {
            return data;
          }

          return escapeData(data);
        }

      case CDATA_SECTION_NODE:
        {
          return "<!CDATA[[".concat(node.data, "]]>");
        }

      case PROCESSING_INSTRUCTION_NODE:
        {
          return "<?".concat(node.target, " ").concat(node.data, "?>");
        }

      case COMMENT_NODE:
        {
          return "<!--".concat(node.data, "-->");
        }

      default:
        {
          // intentionally ignoring unknown node types
          // Note: since this routine is always invoked for childNodes
          // we can safety ignore type 9, 10 and 99 (document, fragment and doctype)
          return '';
        }
    }
  }
  /**
   * Copyright (C) 2018 salesforce.com, inc.
   */


  if (!_globalThis.lwcRuntimeFlags) {
    Object.defineProperty(_globalThis, 'lwcRuntimeFlags', {
      value: create(null)
    });
  }

  var runtimeFlags = _globalThis.lwcRuntimeFlags;
  /** version: 2.11.8 */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * This method checks whether or not the content of the node is computed
   * based on the light-dom slotting mechanism. This applies to synthetic slot elements
   * and elements with shadow dom attached to them. It doesn't apply to native slot elements
   * because we don't want to patch the children getters for those elements.
   */

  function hasMountedChildren(node) {
    return isSyntheticSlotElement(node) || isSyntheticShadowHost(node);
  }

  function getShadowParent(node, value) {
    var owner = getNodeOwner(node);

    if (value === owner) {
      // walking up via parent chain might end up in the shadow root element
      return getShadowRoot(owner);
    } else if (value instanceof Element) {
      if (getNodeNearestOwnerKey(node) === getNodeNearestOwnerKey(value)) {
        // the element and its parent node belong to the same shadow root
        return value;
      } else if (!isNull(owner) && isSlotElement(value)) {
        // slotted elements must be top level childNodes of the slot element
        // where they slotted into, but its shadowed parent is always the
        // owner of the slot.
        var slotOwner = getNodeOwner(value);

        if (!isNull(slotOwner) && isNodeOwnedBy(owner, slotOwner)) {
          // it is a slotted element, and therefore its parent is always going to be the host of the slot
          return slotOwner;
        }
      }
    }

    return null;
  }

  function hasChildNodesPatched() {
    return getInternalChildNodes(this).length > 0;
  }

  function firstChildGetterPatched() {
    var childNodes = getInternalChildNodes(this);
    return childNodes[0] || null;
  }

  function lastChildGetterPatched() {
    var childNodes = getInternalChildNodes(this);
    return childNodes[childNodes.length - 1] || null;
  }

  function textContentGetterPatched() {
    return getTextContent(this);
  }

  function textContentSetterPatched(value) {
    textContextSetter.call(this, value);
  }

  function parentNodeGetterPatched() {
    var value = parentNodeGetter.call(this);

    if (isNull(value)) {
      return value;
    } // TODO [#1635]: this needs optimization, maybe implementing it based on this.assignedSlot


    return getShadowParent(this, value);
  }

  function parentElementGetterPatched() {
    var value = parentNodeGetter.call(this);

    if (isNull(value)) {
      return null;
    }

    var parentNode = getShadowParent(this, value); // it could be that the parentNode is the shadowRoot, in which case
    // we need to return null.
    // TODO [#1635]: this needs optimization, maybe implementing it based on this.assignedSlot

    return parentNode instanceof Element ? parentNode : null;
  }

  function compareDocumentPositionPatched(otherNode) {
    if (this === otherNode) {
      return 0;
    } else if (this.getRootNode() === otherNode) {
      // "this" is in a shadow tree where the shadow root is the "otherNode".
      return 10; // Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
    } else if (getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
      // "this" and "otherNode" belongs to 2 different shadow tree.
      return 35; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC | Node.DOCUMENT_POSITION_PRECEDING
    } // Since "this" and "otherNode" are part of the same shadow tree we can safely rely to the native
    // Node.compareDocumentPosition implementation.


    return compareDocumentPosition.call(this, otherNode);
  }

  function containsPatched(otherNode) {
    if (otherNode == null || getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
      // it is from another shadow
      return false;
    }

    return (compareDocumentPosition.call(this, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
  }

  function cloneNodePatched(deep) {
    var clone = cloneNode.call(this, false); // Per spec, browsers only care about truthy values
    // Not strict true or false

    if (!deep) {
      return clone;
    }

    var childNodes = getInternalChildNodes(this);

    for (var i = 0, len = childNodes.length; i < len; i += 1) {
      clone.appendChild(childNodes[i].cloneNode(true));
    }

    return clone;
  }
  /**
   * This method only applies to elements with a shadow or slots
   */


  function childNodesGetterPatched() {
    if (isSyntheticShadowHost(this)) {
      var owner = getNodeOwner(this);
      var childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));

      if (process.env.NODE_ENV !== 'production' && isFalse(hasNativeSymbolSupport) && isExternalChildNodeAccessorFlagOn()) {
        // inserting a comment node as the first childNode to trick the IE11
        // DevTool to show the content of the shadowRoot, this should only happen
        // in dev-mode and in IE11 (which we detect by looking at the symbol).
        // Plus it should only be in place if we know it is an external invoker.
        ArrayUnshift.call(childNodes, getIE11FakeShadowRootPlaceholder(this));
      }

      return createStaticNodeList(childNodes);
    } // nothing to do here since this does not have a synthetic shadow attached to it
    // TODO [#1636]: what about slot elements?


    return childNodesGetter.call(this);
  }

  var nativeGetRootNode = _Node.prototype.getRootNode;
  /**
   * Get the root by climbing up the dom tree, beyond the shadow root
   * If Node.prototype.getRootNode is supported, use it
   * else, assume we are working in non-native shadow mode and climb using parentNode
   */

  var getDocumentOrRootNode = !isUndefined(nativeGetRootNode) ? nativeGetRootNode : function () {
    var node = this;
    var nodeParent;

    while (!isNull(nodeParent = parentNodeGetter.call(node))) {
      node = nodeParent;
    }

    return node;
  };
  /**
   * Get the shadow root
   * getNodeOwner() returns the host element that owns the given node
   * Note: getNodeOwner() returns null when running in native-shadow mode.
   *  Fallback to using the native getRootNode() to discover the root node.
   *  This is because, it is not possible to inspect the node and decide if it is part
   *  of a native shadow or the synthetic shadow.
   * @param {Node} node
   */

  function getNearestRoot(node) {
    var ownerNode = getNodeOwner(node);

    if (isNull(ownerNode)) {
      // we hit a wall, either we are in native shadow mode or the node is not in lwc boundary.
      return getDocumentOrRootNode.call(node);
    }

    return getShadowRoot(ownerNode);
  }
  /**
   * If looking for a root node beyond shadow root by calling `node.getRootNode({composed: true})`, use the original `Node.prototype.getRootNode` method
   * to return the root of the dom tree. In IE11 and Edge, Node.prototype.getRootNode is
   * [not supported](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#Browser_compatibility). The root node is discovered by manually
   * climbing up the dom tree.
   *
   * If looking for a shadow root of a node by calling `node.getRootNode({composed: false})` or `node.getRootNode()`,
   *
   *  1. Try to identify the host element that owns the give node.
   *     i. Identify the shadow tree that the node belongs to
   *     ii. If the node belongs to a shadow tree created by engine, return the shadowRoot of the host element that owns the shadow tree
   *  2. The host identification logic returns null in two cases:
   *     i. The node does not belong to a shadow tree created by engine
   *     ii. The engine is running in native shadow dom mode
   *     If so, use the original Node.prototype.getRootNode to fetch the root node(or manually climb up the dom tree where getRootNode() is unsupported)
   *
   * _Spec_: https://dom.spec.whatwg.org/#dom-node-getrootnode
   *
   **/


  function getRootNodePatched(options) {
    var composed = isUndefined(options) ? false : !!options.composed;
    return isTrue(composed) ? getDocumentOrRootNode.call(this, options) : getNearestRoot(this);
  } // Non-deep-traversing patches: this descriptor map includes all descriptors that
  // do not give access to nodes beyond the immediate children.


  defineProperties(_Node.prototype, {
    firstChild: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return firstChildGetterPatched.call(this);
        }

        return firstChildGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    lastChild: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return lastChildGetterPatched.call(this);
        }

        return lastChildGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    textContent: {
      get: function get() {
        if (!runtimeFlags.ENABLE_NODE_PATCH) {
          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return textContentGetterPatched.call(this);
          }

          return textContentGetter.call(this);
        } // TODO [#1222]: remove global bypass


        if (isGlobalPatchingSkipped(this)) {
          return textContentGetter.call(this);
        }

        return textContentGetterPatched.call(this);
      },
      set: textContentSetterPatched,
      enumerable: true,
      configurable: true
    },
    parentNode: {
      get: function get() {
        if (isNodeShadowed(this)) {
          return parentNodeGetterPatched.call(this);
        }

        var parentNode = parentNodeGetter.call(this); // Handle the case where a top level light DOM element is slotted into a synthetic
        // shadow slot.

        if (!isNull(parentNode) && isSyntheticSlotElement(parentNode)) {
          return getNodeOwner(parentNode);
        }

        return parentNode;
      },
      enumerable: true,
      configurable: true
    },
    parentElement: {
      get: function get() {
        if (isNodeShadowed(this)) {
          return parentElementGetterPatched.call(this);
        }

        var parentElement = parentElementGetter.call(this); // Handle the case where a top level light DOM element is slotted into a synthetic
        // shadow slot.

        if (!isNull(parentElement) && isSyntheticSlotElement(parentElement)) {
          return getNodeOwner(parentElement);
        }

        return parentElement;
      },
      enumerable: true,
      configurable: true
    },
    childNodes: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return childNodesGetterPatched.call(this);
        }

        return childNodesGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    hasChildNodes: {
      value: function value() {
        if (hasMountedChildren(this)) {
          return hasChildNodesPatched.call(this);
        }

        return hasChildNodes.call(this);
      },
      enumerable: true,
      writable: true,
      configurable: true
    },
    compareDocumentPosition: {
      value: function value(otherNode) {
        // TODO [#1222]: remove global bypass
        if (isGlobalPatchingSkipped(this)) {
          return compareDocumentPosition.call(this, otherNode);
        }

        return compareDocumentPositionPatched.call(this, otherNode);
      },
      enumerable: true,
      writable: true,
      configurable: true
    },
    contains: {
      value: function value(otherNode) {
        // 1. Node.prototype.contains() returns true if otherNode is an inclusive descendant
        //    spec: https://dom.spec.whatwg.org/#dom-node-contains
        // 2. This normalizes the behavior of this api across all browsers.
        //    In IE11, a disconnected dom element without children invoking contains() on self, returns false
        if (this === otherNode) {
          return true;
        }

        if (!runtimeFlags.ENABLE_NODE_PATCH) {
          if (otherNode == null) {
            return false;
          }

          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return containsPatched.call(this, otherNode);
          }

          return contains.call(this, otherNode);
        } // TODO [#1222]: remove global bypass


        if (isGlobalPatchingSkipped(this)) {
          return contains.call(this, otherNode);
        }

        return containsPatched.call(this, otherNode);
      },
      enumerable: true,
      writable: true,
      configurable: true
    },
    cloneNode: {
      value: function value(deep) {
        if (!runtimeFlags.ENABLE_NODE_PATCH) {
          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return cloneNodePatched.call(this, deep);
          }

          return cloneNode.call(this, deep);
        }

        if (isTrue(deep)) {
          // TODO [#1222]: remove global bypass
          if (isGlobalPatchingSkipped(this)) {
            return cloneNode.call(this, deep);
          }

          return cloneNodePatched.call(this, deep);
        }

        return cloneNode.call(this, deep);
      },
      enumerable: true,
      writable: true,
      configurable: true
    },
    getRootNode: {
      value: getRootNodePatched,
      enumerable: true,
      configurable: true,
      writable: true
    },
    isConnected: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return isConnected.call(this);
      }
    }
  });
  var internalChildNodeAccessorFlag = false;
  /**
   * These 2 methods are providing a machinery to understand who is accessing the
   * .childNodes member property of a node. If it is used from inside the synthetic shadow
   * or from an external invoker. This helps to produce the right output in one very peculiar
   * case, the IE11 debugging comment for shadowRoot representation on the devtool.
   */

  function isExternalChildNodeAccessorFlagOn() {
    return !internalChildNodeAccessorFlag;
  }

  var getInternalChildNodes = process.env.NODE_ENV !== 'production' && isFalse(hasNativeSymbolSupport) ? function (node) {
    internalChildNodeAccessorFlag = true;
    var childNodes;
    var error = null;

    try {
      childNodes = node.childNodes;
    } catch (e) {
      // childNodes accessor should never throw, but just in case!
      error = e;
    } finally {
      internalChildNodeAccessorFlag = false;

      if (!isNull(error)) {
        // re-throwing after restoring the state machinery for setInternalChildNodeAccessorFlag
        throw error; // eslint-disable-line no-unsafe-finally
      }
    }

    return childNodes;
  } : function (node) {
    return node.childNodes;
  }; // IE11 extra patches for wrong prototypes

  if (hasOwnProperty.call(HTMLElement.prototype, 'contains')) {
    defineProperty(HTMLElement.prototype, 'contains', getOwnPropertyDescriptor(_Node.prototype, 'contains'));
  }

  if (hasOwnProperty.call(HTMLElement.prototype, 'parentElement')) {
    defineProperty(HTMLElement.prototype, 'parentElement', getOwnPropertyDescriptor(_Node.prototype, 'parentElement'));
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // Walk up the DOM tree, collecting all shadow roots plus the document root


  function getAllRootNodes(node) {
    var _a;

    var rootNodes = [];
    var currentRootNode = node.getRootNode();

    while (!isUndefined(currentRootNode)) {
      rootNodes.push(currentRootNode);
      currentRootNode = (_a = currentRootNode.host) === null || _a === void 0 ? void 0 : _a.getRootNode();
    }

    return rootNodes;
  } // Keep searching up the host tree until we find an element that is within the immediate shadow root


  var findAncestorHostInImmediateShadowRoot = function findAncestorHostInImmediateShadowRoot(rootNode, targetRootNode) {
    var host;

    while (!isUndefined(host = rootNode.host)) {
      var thisRootNode = host.getRootNode();

      if (thisRootNode === targetRootNode) {
        return host;
      }

      rootNode = thisRootNode;
    }
  };

  function fauxElementsFromPoint(context, doc, left, top) {
    var elements = elementsFromPoint.call(doc, left, top);
    var result = [];
    var rootNodes = getAllRootNodes(context); // Filter the elements array to only include those elements that are in this shadow root or in one of its
    // ancestor roots. This matches Chrome and Safari's implementation (but not Firefox's, which only includes
    // elements in the immediate shadow root: https://crbug.com/1207863#c4).

    if (!isNull(elements)) {
      // can be null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint#browser_compatibility
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (isSyntheticSlotElement(element)) {
          continue;
        }

        var elementRootNode = element.getRootNode();

        if (ArrayIndexOf.call(rootNodes, elementRootNode) !== -1) {
          ArrayPush.call(result, element);
          continue;
        } // In cases where the host element is not visible but its shadow descendants are, then
        // we may get the shadow descendant instead of the host element here. (The
        // browser doesn't know the difference in synthetic shadow DOM.)
        // In native shadow DOM, however, elementsFromPoint would return the host but not
        // the child. So we need to detect if this shadow element's host is accessible from
        // the context's shadow root. Note we also need to be careful not to add the host
        // multiple times.


        var ancestorHost = findAncestorHostInImmediateShadowRoot(elementRootNode, rootNodes[0]);

        if (!isUndefined(ancestorHost) && ArrayIndexOf.call(elements, ancestorHost) === -1 && ArrayIndexOf.call(result, ancestorHost) === -1) {
          ArrayPush.call(result, ancestorHost);
        }
      }
    }

    return result;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var InternalSlot = new WeakMap();
  var _document = document,
      createDocumentFragment = _document.createDocumentFragment;

  function hasInternalSlot(root) {
    return InternalSlot.has(root);
  }

  function getInternalSlot(root) {
    var record = InternalSlot.get(root);

    if (isUndefined(record)) {
      throw new TypeError();
    }

    return record;
  }

  defineProperty(_Node.prototype, KEY__SHADOW_RESOLVER, {
    set: function set(fn) {
      if (isUndefined(fn)) return;
      this[KEY__SHADOW_RESOLVER_PRIVATE] = fn; // TODO [#1164]: temporary propagation of the key

      setNodeOwnerKey(this, fn.nodeKey);
    },
    get: function get() {
      return this[KEY__SHADOW_RESOLVER_PRIVATE];
    },
    configurable: true,
    enumerable: true
  });
  defineProperty(_globalThis, KEY__IS_NATIVE_SHADOW_ROOT_DEFINED, {
    value: isNativeShadowRootDefined
  });

  function getShadowRootResolver(node) {
    return node[KEY__SHADOW_RESOLVER];
  }

  function setShadowRootResolver(node, fn) {
    node[KEY__SHADOW_RESOLVER] = fn;
  }

  function isDelegatingFocus(host) {
    return getInternalSlot(host).delegatesFocus;
  }

  function getHost(root) {
    return getInternalSlot(root).host;
  }

  function getShadowRoot(elm) {
    return getInternalSlot(elm).shadowRoot;
  } // Intentionally adding `Node` here in addition to `Element` since this check is harmless for nodes
  // and we can avoid having to cast the type before calling this method in a few places.


  function isSyntheticShadowHost(node) {
    var shadowRootRecord = InternalSlot.get(node);
    return !isUndefined(shadowRootRecord) && node === shadowRootRecord.host;
  }

  function isSyntheticShadowRoot(node) {
    var shadowRootRecord = InternalSlot.get(node);
    return !isUndefined(shadowRootRecord) && node === shadowRootRecord.shadowRoot;
  }

  var uid = 0;

  function attachShadow(elm, options) {
    if (InternalSlot.has(elm)) {
      throw new Error("Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.");
    }

    var mode = options.mode,
        delegatesFocus = options.delegatesFocus; // creating a real fragment for shadowRoot instance

    var doc = getOwnerDocument(elm);
    var sr = createDocumentFragment.call(doc); // creating shadow internal record

    var record = {
      mode: mode,
      delegatesFocus: !!delegatesFocus,
      host: elm,
      shadowRoot: sr
    };
    InternalSlot.set(sr, record);
    InternalSlot.set(elm, record);

    var shadowResolver = function shadowResolver() {
      return sr;
    };

    var x = shadowResolver.nodeKey = uid++;
    setNodeKey(elm, x);
    setShadowRootResolver(sr, shadowResolver); // correcting the proto chain

    setPrototypeOf(sr, SyntheticShadowRoot.prototype);
    return sr;
  }

  var SyntheticShadowRootDescriptors = {
    constructor: {
      writable: true,
      configurable: true,
      value: SyntheticShadowRoot
    },
    toString: {
      writable: true,
      configurable: true,
      value: function value() {
        return "[object ShadowRoot]";
      }
    },
    synthetic: {
      writable: false,
      enumerable: false,
      configurable: false,
      value: true
    }
  };
  var ShadowRootDescriptors = {
    activeElement: {
      enumerable: true,
      configurable: true,
      get: function get() {
        var host = getHost(this);
        var doc = getOwnerDocument(host);
        var activeElement = DocumentPrototypeActiveElement.call(doc);

        if (isNull(activeElement)) {
          return activeElement;
        }

        if ((compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) === 0) {
          return null;
        } // activeElement must be child of the host and owned by it


        var node = activeElement;

        while (!isNodeOwnedBy(host, node)) {
          // parentElement is always an element because we are talking up the tree knowing
          // that it is a child of the host.
          node = parentElementGetter.call(node);
        } // If we have a slot element here that means that we were dealing
        // with an element that was passed to one of our slots. In this
        // case, activeElement returns null.


        if (isSlotElement(node)) {
          return null;
        }

        return node;
      }
    },
    delegatesFocus: {
      configurable: true,
      get: function get() {
        return getInternalSlot(this).delegatesFocus;
      }
    },
    elementFromPoint: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(left, top) {
        var host = getHost(this);
        var doc = getOwnerDocument(host);
        return fauxElementFromPoint(this, doc, left, top);
      }
    },
    elementsFromPoint: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(left, top) {
        var host = getHost(this);
        var doc = getOwnerDocument(host);
        return fauxElementsFromPoint(this, doc, left, top);
      }
    },
    getSelection: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        throw new Error('Disallowed method "getSelection" on ShadowRoot.');
      }
    },
    host: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return getHost(this);
      }
    },
    mode: {
      configurable: true,
      get: function get() {
        return getInternalSlot(this).mode;
      }
    },
    styleSheets: {
      enumerable: true,
      configurable: true,
      get: function get() {
        throw new Error();
      }
    }
  };
  var eventToShadowRootMap = new WeakMap();
  var NodePatchDescriptors = {
    insertBefore: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(newChild, refChild) {
        insertBefore.call(getHost(this), newChild, refChild);
        return newChild;
      }
    },
    removeChild: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(oldChild) {
        removeChild.call(getHost(this), oldChild);
        return oldChild;
      }
    },
    appendChild: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(newChild) {
        appendChild.call(getHost(this), newChild);
        return newChild;
      }
    },
    replaceChild: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(newChild, oldChild) {
        replaceChild.call(getHost(this), newChild, oldChild);
        return oldChild;
      }
    },
    addEventListener: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(type, listener, options) {
        addShadowRootEventListener(this, type, listener);
      }
    },
    dispatchEvent: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(evt) {
        eventToShadowRootMap.set(evt, this); // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch

        return dispatchEvent.apply(getHost(this), arguments);
      }
    },
    removeEventListener: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(type, listener, options) {
        removeShadowRootEventListener(this, type, listener);
      }
    },
    baseURI: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return getHost(this).baseURI;
      }
    },
    childNodes: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return createStaticNodeList(shadowRootChildNodes(this));
      }
    },
    cloneNode: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        throw new Error('Disallowed method "cloneNode" on ShadowRoot.');
      }
    },
    compareDocumentPosition: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(otherNode) {
        var host = getHost(this);

        if (this === otherNode) {
          // "this" and "otherNode" are the same shadow root.
          return 0;
        } else if (this.contains(otherNode)) {
          // "otherNode" belongs to the shadow tree where "this" is the shadow root.
          return 20; // Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        } else if (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) {
          // "otherNode" is in a different shadow tree contained by the shadow tree where "this" is the shadow root.
          return 37; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        } else {
          // "otherNode" is in a different shadow tree that is not contained by the shadow tree where "this" is the shadow root.
          return 35; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        }
      }
    },
    contains: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(otherNode) {
        if (this === otherNode) {
          return true;
        }

        var host = getHost(this); // must be child of the host and owned by it.

        return (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 && isNodeOwnedBy(host, otherNode);
      }
    },
    firstChild: {
      enumerable: true,
      configurable: true,
      get: function get() {
        var childNodes = getInternalChildNodes(this);
        return childNodes[0] || null;
      }
    },
    lastChild: {
      enumerable: true,
      configurable: true,
      get: function get() {
        var childNodes = getInternalChildNodes(this);
        return childNodes[childNodes.length - 1] || null;
      }
    },
    hasChildNodes: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        var childNodes = getInternalChildNodes(this);
        return childNodes.length > 0;
      }
    },
    isConnected: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return isConnected.call(getHost(this));
      }
    },
    nextSibling: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return null;
      }
    },
    previousSibling: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return null;
      }
    },
    nodeName: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return '#document-fragment';
      }
    },
    nodeType: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return 11; // Node.DOCUMENT_FRAGMENT_NODE
      }
    },
    nodeValue: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return null;
      }
    },
    ownerDocument: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return getHost(this).ownerDocument;
      }
    },
    parentElement: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return null;
      }
    },
    parentNode: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return null;
      }
    },
    textContent: {
      enumerable: true,
      configurable: true,
      get: function get() {
        var childNodes = getInternalChildNodes(this);
        var textContent = '';

        for (var i = 0, len = childNodes.length; i < len; i += 1) {
          var currentNode = childNodes[i];

          if (currentNode.nodeType !== COMMENT_NODE) {
            textContent += getTextContent(currentNode);
          }
        }

        return textContent;
      },
      set: function set(v) {
        var host = getHost(this);
        textContextSetter.call(host, v);
      }
    },
    // Since the synthetic shadow root is a detached DocumentFragment, short-circuit the getRootNode behavior
    getRootNode: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(options) {
        return !isUndefined(options) && isTrue(options.composed) ? getHost(this).getRootNode(options) : this;
      }
    }
  };
  var ElementPatchDescriptors = {
    innerHTML: {
      enumerable: true,
      configurable: true,
      get: function get() {
        var childNodes = getInternalChildNodes(this);
        var innerHTML = '';

        for (var i = 0, len = childNodes.length; i < len; i += 1) {
          innerHTML += getOuterHTML(childNodes[i]);
        }

        return innerHTML;
      },
      set: function set(v) {
        var host = getHost(this);
        innerHTMLSetter.call(host, v);
      }
    }
  };
  var ParentNodePatchDescriptors = {
    childElementCount: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return this.children.length;
      }
    },
    children: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return createStaticHTMLCollection(ArrayFilter.call(shadowRootChildNodes(this), function (elm) {
          return elm instanceof Element;
        }));
      }
    },
    firstElementChild: {
      enumerable: true,
      configurable: true,
      get: function get() {
        return this.children[0] || null;
      }
    },
    lastElementChild: {
      enumerable: true,
      configurable: true,
      get: function get() {
        var children = this.children;
        return children.item(children.length - 1) || null;
      }
    },
    getElementById: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value() {
        throw new Error('Disallowed method "getElementById" on ShadowRoot.');
      }
    },
    querySelector: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(selectors) {
        return shadowRootQuerySelector(this, selectors);
      }
    },
    querySelectorAll: {
      writable: true,
      enumerable: true,
      configurable: true,
      value: function value(selectors) {
        return createStaticNodeList(shadowRootQuerySelectorAll(this, selectors));
      }
    }
  };
  assign(SyntheticShadowRootDescriptors, NodePatchDescriptors, ParentNodePatchDescriptors, ElementPatchDescriptors, ShadowRootDescriptors);

  function SyntheticShadowRoot() {
    throw new TypeError('Illegal constructor');
  }

  SyntheticShadowRoot.prototype = create(DocumentFragment.prototype, SyntheticShadowRootDescriptors); // `this.shadowRoot instanceof ShadowRoot` should evaluate to true even for synthetic shadow

  defineProperty(SyntheticShadowRoot, Symbol.hasInstance, {
    value: function value(object) {
      // Technically we should walk up the entire prototype chain, but with SyntheticShadowRoot
      // it's reasonable to assume that no one is doing any deep subclasses here.
      return isObject(object) && !isNull(object) && (isInstanceOfNativeShadowRoot(object) || getPrototypeOf(object) === SyntheticShadowRoot.prototype);
    }
  });
  /**
   * This method is only intended to be used in non-production mode in IE11
   * and its role is to produce a 1-1 mapping between a shadowRoot instance
   * and a comment node that is intended to use to trick the IE11 DevTools
   * to show the content of the shadowRoot in the DOM Explorer.
   */

  function getIE11FakeShadowRootPlaceholder(host) {
    var shadowRoot = getShadowRoot(host); // @ts-ignore this $$placeholder$$ is not a security issue because you must
    // have access to the shadowRoot in order to extract the fake node, which give
    // you access to the same childNodes of the shadowRoot, so, who cares.

    var c = shadowRoot.$$placeholder$$;

    if (!isUndefined(c)) {
      return c;
    }

    var doc = getOwnerDocument(host); // @ts-ignore $$placeholder$$ is fine, read the node above.

    c = shadowRoot.$$placeholder$$ = createComment.call(doc, '');
    defineProperties(c, {
      childNodes: {
        get: function get() {
          return shadowRoot.childNodes;
        },
        enumerable: true,
        configurable: true
      },
      tagName: {
        get: function get() {
          return "#shadow-root (".concat(shadowRoot.mode, ")");
        },
        enumerable: true,
        configurable: true
      }
    });
    return c;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function pathComposer(startNode, composed) {
    var composedPath = [];
    var startRoot;

    if (startNode instanceof Window) {
      startRoot = startNode;
    } else if (startNode instanceof _Node) {
      startRoot = startNode.getRootNode();
    } else {
      return composedPath;
    }

    var current = startNode;

    while (!isNull(current)) {
      composedPath.push(current);

      if (current instanceof Element || current instanceof Text) {
        var assignedSlot = current.assignedSlot;

        if (!isNull(assignedSlot)) {
          current = assignedSlot;
        } else {
          current = current.parentNode;
        }
      } else if ((isSyntheticShadowRoot(current) || isInstanceOfNativeShadowRoot(current)) && (composed || current !== startRoot)) {
        current = current.host;
      } else if (current instanceof _Node) {
        current = current.parentNode;
      } else {
        // could be Window
        current = null;
      }
    }

    var doc;

    if (startNode instanceof Window) {
      doc = startNode.document;
    } else {
      doc = getOwnerDocument(startNode);
    } // event composedPath includes window when startNode's ownerRoot is document


    if (composedPath[composedPath.length - 1] === doc) {
      composedPath.push(window);
    }

    return composedPath;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
  @license
  Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */


  function retarget(refNode, path) {
    if (isNull(refNode)) {
      return null;
    } // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
    // shadow-including inclusive ancestor, return ANCESTOR.


    var refNodePath = pathComposer(refNode, true);
    var p$ = path;

    for (var i = 0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
      ancestor = p$[i];
      root = ancestor instanceof Window ? ancestor : ancestor.getRootNode();

      if (root !== lastRoot) {
        rootIdx = refNodePath.indexOf(root);
        lastRoot = root;
      }

      if (!isSyntheticShadowRoot(root) || !isUndefined(rootIdx) && rootIdx > -1) {
        return ancestor;
      }
    }

    return null;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function fauxElementFromPoint(context, doc, left, top) {
    var element = elementFromPoint.call(doc, left, top);

    if (isNull(element)) {
      return element;
    }

    return retarget(context, pathComposer(element, true));
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function elemFromPoint(left, top) {
    return fauxElementFromPoint(this, this, left, top);
  }

  Document.prototype.elementFromPoint = elemFromPoint;

  function elemsFromPoint(left, top) {
    return fauxElementsFromPoint(this, this, left, top);
  }

  Document.prototype.elementsFromPoint = elemsFromPoint; // Go until we reach to top of the LWC tree

  defineProperty(Document.prototype, 'activeElement', {
    get: function get() {
      var node = DocumentPrototypeActiveElement.call(this);

      if (isNull(node)) {
        return node;
      }

      while (!isUndefined(getNodeOwnerKey(node))) {
        node = parentElementGetter.call(node);

        if (isNull(node)) {
          return null;
        }
      }

      if (node.tagName === 'HTML') {
        // IE 11. Active element should never be html element
        node = this.body;
      }

      return node;
    },
    enumerable: true,
    configurable: true
  }); // The following patched methods hide shadowed elements from global
  // traversing mechanisms. They are simplified for performance reasons to
  // filter by ownership and do not account for slotted elements. This
  // compromise is fine for our synthetic shadow dom because root elements
  // cannot have slotted elements.
  // Another compromise here is that all these traversing methods will return
  // static HTMLCollection or static NodeList. We decided that this compromise
  // is not a big problem considering the amount of code that is relying on
  // the liveliness of these results are rare.

  defineProperty(Document.prototype, 'getElementById', {
    value: function value() {
      var elm = getElementById.apply(this, ArraySlice.call(arguments));

      if (isNull(elm)) {
        return null;
      } // TODO [#1222]: remove global bypass


      return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm) ? elm : null;
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  defineProperty(Document.prototype, 'querySelector', {
    value: function value() {
      var elements = arrayFromCollection(querySelectorAll.apply(this, ArraySlice.call(arguments)));
      var filtered = ArrayFind.call(elements, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm);
      });
      return !isUndefined(filtered) ? filtered : null;
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  defineProperty(Document.prototype, 'querySelectorAll', {
    value: function value() {
      var elements = arrayFromCollection(querySelectorAll.apply(this, ArraySlice.call(arguments)));
      var filtered = ArrayFilter.call(elements, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm);
      });
      return createStaticNodeList(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  defineProperty(Document.prototype, 'getElementsByClassName', {
    value: function value() {
      var elements = arrayFromCollection(getElementsByClassName.apply(this, ArraySlice.call(arguments)));
      var filtered = ArrayFilter.call(elements, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm);
      });
      return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  defineProperty(Document.prototype, 'getElementsByTagName', {
    value: function value() {
      var elements = arrayFromCollection(getElementsByTagName.apply(this, ArraySlice.call(arguments)));
      var filtered = ArrayFilter.call(elements, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm);
      });
      return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  defineProperty(Document.prototype, 'getElementsByTagNameNS', {
    value: function value() {
      var elements = arrayFromCollection(getElementsByTagNameNS.apply(this, ArraySlice.call(arguments)));
      var filtered = ArrayFilter.call(elements, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm);
      });
      return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  defineProperty( // In Firefox v57 and lower, getElementsByName is defined on HTMLDocument.prototype
  getOwnPropertyDescriptor(HTMLDocument.prototype, 'getElementsByName') ? HTMLDocument.prototype : Document.prototype, 'getElementsByName', {
    value: function value() {
      var elements = arrayFromCollection(getElementsByName.apply(this, ArraySlice.call(arguments)));
      var filtered = ArrayFilter.call(elements, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm);
      });
      return createStaticNodeList(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  Object.defineProperty(window, 'ShadowRoot', {
    value: SyntheticShadowRoot,
    configurable: true,
    writable: true
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var composedDescriptor = Object.getOwnPropertyDescriptor(Event.prototype, 'composed');

  function detect$3() {
    if (!composedDescriptor) {
      // No need to apply this polyfill if this client completely lacks
      // support for the composed property.
      return false;
    } // Assigning a throwaway click event here to suppress a ts error when we
    // pass clickEvent into the composed getter below. The error is:
    // [ts] Variable 'clickEvent' is used before being assigned.


    var clickEvent = new Event('click');
    var button = document.createElement('button');
    button.addEventListener('click', function (event) {
      return clickEvent = event;
    });
    button.click();
    return !composedDescriptor.get.call(clickEvent);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var originalClickDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'click');

  function handleClick(event) {
    Object.defineProperty(event, 'composed', {
      configurable: true,
      enumerable: true,
      get: function get() {
        return true;
      }
    });
  }

  function apply$3() {
    HTMLElement.prototype.click = function () {
      addEventListener.call(this, 'click', handleClick);

      try {
        originalClickDescriptor.value.call(this);
      } finally {
        removeEventListener.call(this, 'click', handleClick);
      }
    };
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  if (detect$3()) {
    apply$3();
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function detect$2() {
    return new Event('test', {
      composed: true
    }).composed !== true;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function apply$2() {
    // https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
    var composedEvents = assign(create(null), {
      beforeinput: 1,
      blur: 1,
      click: 1,
      compositionend: 1,
      compositionstart: 1,
      compositionupdate: 1,
      copy: 1,
      cut: 1,
      dblclick: 1,
      DOMActivate: 1,
      DOMFocusIn: 1,
      DOMFocusOut: 1,
      drag: 1,
      dragend: 1,
      dragenter: 1,
      dragleave: 1,
      dragover: 1,
      dragstart: 1,
      drop: 1,
      focus: 1,
      focusin: 1,
      focusout: 1,
      gotpointercapture: 1,
      input: 1,
      keydown: 1,
      keypress: 1,
      keyup: 1,
      lostpointercapture: 1,
      mousedown: 1,
      mouseenter: 1,
      mouseleave: 1,
      mousemove: 1,
      mouseout: 1,
      mouseover: 1,
      mouseup: 1,
      paste: 1,
      pointercancel: 1,
      pointerdown: 1,
      pointerenter: 1,
      pointerleave: 1,
      pointermove: 1,
      pointerout: 1,
      pointerover: 1,
      pointerup: 1,
      touchcancel: 1,
      touchend: 1,
      touchmove: 1,
      touchstart: 1,
      wheel: 1
    });
    var EventConstructor = Event; // Patch Event constructor to add the composed property on events created via new Event.

    function PatchedEvent(type, eventInitDict) {
      var event = new EventConstructor(type, eventInitDict);
      var isComposed = !!(eventInitDict && eventInitDict.composed);
      Object.defineProperties(event, {
        composed: {
          get: function get() {
            return isComposed;
          },
          configurable: true,
          enumerable: true
        }
      });
      return event;
    }

    PatchedEvent.prototype = EventConstructor.prototype;
    PatchedEvent.AT_TARGET = EventConstructor.AT_TARGET;
    PatchedEvent.BUBBLING_PHASE = EventConstructor.BUBBLING_PHASE;
    PatchedEvent.CAPTURING_PHASE = EventConstructor.CAPTURING_PHASE;
    PatchedEvent.NONE = EventConstructor.NONE;
    window.Event = PatchedEvent; // Patch the Event prototype to add the composed property on user agent dispatched event.

    Object.defineProperties(Event.prototype, {
      composed: {
        get: function get() {
          var type = this.type;
          return composedEvents[type] === 1;
        },
        configurable: true,
        enumerable: true
      }
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  if (detect$2()) {
    apply$2();
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var CustomEventConstructor = CustomEvent;

  function PatchedCustomEvent(type, eventInitDict) {
    var event = new CustomEventConstructor(type, eventInitDict);
    var isComposed = !!(eventInitDict && eventInitDict.composed);
    Object.defineProperties(event, {
      composed: {
        get: function get() {
          return isComposed;
        },
        configurable: true,
        enumerable: true
      }
    });
    return event;
  }

  PatchedCustomEvent.prototype = CustomEventConstructor.prototype;
  window.CustomEvent = PatchedCustomEvent;
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  if (typeof ClipboardEvent !== 'undefined') {
    var isComposedType = assign(create(null), {
      copy: 1,
      cut: 1,
      paste: 1
    }); // Patch the prototype to override the composed property on user-agent dispatched events

    defineProperties(ClipboardEvent.prototype, {
      composed: {
        get: function get() {
          var type = this.type;
          return isComposedType[type] === 1;
        },
        configurable: true,
        enumerable: true
      }
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function detect$1() {
    // Note: when using this in mobile apps, we might have a DOM that does not support iframes.
    return typeof HTMLIFrameElement !== 'undefined';
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function apply$1() {
    // the iframe property descriptor for `contentWindow` should always be available, otherwise this method should never be called
    var desc = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
    var originalGetter = desc.get;

    desc.get = function () {
      var original = originalGetter.call(this); // If the original iframe element is not a keyed node, then do not wrap it

      if (isNull(original) || isUndefined(getNodeOwnerKey(this))) {
        return original;
      } // only if the element is an iframe inside a shadowRoot, we care about this problem
      // because in that case, the code that is accessing the iframe, is very likely code
      // compiled with proxy-compat transformation. It is true that other code without those
      // transformations might also access an iframe from within a shadowRoot, but in that,
      // case, which is more rare, we still return the wrapper, and it should work the same,
      // this part is just an optimization.


      return wrapIframeWindow(original);
    };

    defineProperty(HTMLIFrameElement.prototype, 'contentWindow', desc);
  }

  function wrapIframeWindow(win) {
    return {
      addEventListener: function addEventListener() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return win.addEventListener.apply(win, arguments);
      },
      blur: function blur() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return win.blur.apply(win, arguments);
      },
      close: function close() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return win.close.apply(win, arguments);
      },
      focus: function focus() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return win.focus.apply(win, arguments);
      },
      postMessage: function postMessage() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return win.postMessage.apply(win, arguments);
      },
      removeEventListener: function removeEventListener() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        return win.removeEventListener.apply(win, arguments);
      },

      get closed() {
        return win.closed;
      },

      get frames() {
        return win.frames;
      },

      get length() {
        return win.length;
      },

      get location() {
        return win.location;
      },

      set location(value) {
        win.location = value;
      },

      get opener() {
        return win.opener;
      },

      get parent() {
        return win.parent;
      },

      get self() {
        return win.self;
      },

      get top() {
        return win.top;
      },

      get window() {
        return win.window;
      }

    }; // this is limited
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  if (detect$1()) {
    apply$1();
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var OriginalMutationObserver = MutationObserver;
  var _OriginalMutationObse = OriginalMutationObserver.prototype,
      originalDisconnect = _OriginalMutationObse.disconnect,
      originalObserve = _OriginalMutationObse.observe,
      originalTakeRecords = _OriginalMutationObse.takeRecords; // Internal fields to maintain relationships

  var wrapperLookupField = '$$lwcObserverCallbackWrapper$$';
  var observerLookupField = '$$lwcNodeObservers$$';
  var observerToNodesMap = new WeakMap();

  function getNodeObservers(node) {
    return node[observerLookupField];
  }

  function setNodeObservers(node, observers) {
    node[observerLookupField] = observers;
  }
  /**
   * Retarget the mutation record's target value to its shadowRoot
   * @param {MutationRecord} originalRecord
   */


  function retargetMutationRecord(originalRecord) {
    var addedNodes = originalRecord.addedNodes,
        removedNodes = originalRecord.removedNodes,
        target = originalRecord.target,
        type = originalRecord.type;
    var retargetedRecord = create(MutationRecord.prototype);
    defineProperties(retargetedRecord, {
      addedNodes: {
        get: function get() {
          return addedNodes;
        },
        enumerable: true,
        configurable: true
      },
      removedNodes: {
        get: function get() {
          return removedNodes;
        },
        enumerable: true,
        configurable: true
      },
      type: {
        get: function get() {
          return type;
        },
        enumerable: true,
        configurable: true
      },
      target: {
        get: function get() {
          return target.shadowRoot;
        },
        enumerable: true,
        configurable: true
      }
    });
    return retargetedRecord;
  }
  /**
   * Utility to identify if a target node is being observed by the given observer
   * Start at the current node, if the observer is registered to observe the current node, the mutation qualifies
   * @param {MutationObserver} observer
   * @param {Node} target
   */


  function isQualifiedObserver(observer, target) {
    var parentNode = target;

    while (!isNull(parentNode)) {
      var parentNodeObservers = getNodeObservers(parentNode);

      if (!isUndefined(parentNodeObservers) && (parentNodeObservers[0] === observer || // perf optimization to check for the first item is a match
      ArrayIndexOf.call(parentNodeObservers, observer) !== -1)) {
        return true;
      }

      parentNode = parentNode.parentNode;
    }

    return false;
  }
  /**
   * This function provides a shadow dom compliant filtered view of mutation records for a given observer.
   *
   * The key logic here is to determine if a given observer has been registered to observe any nodes
   * between the target node of a mutation record to the target's root node.
   * This function also retargets records when mutations occur directly under the shadow root
   * @param {MutationRecords[]} mutations
   * @param {MutationObserver} observer
   */


  function filterMutationRecords(mutations, observer) {
    return ArrayReduce.call(mutations, function (filteredSet, record) {
      var target = record.target,
          addedNodes = record.addedNodes,
          removedNodes = record.removedNodes,
          type = record.type; // If target is an lwc host,
      // Determine if the mutations affected the host or the shadowRoot
      // Mutations affecting host: changes to slot content
      // Mutations affecting shadowRoot: changes to template content

      if (type === 'childList' && !isUndefined(getNodeKey(target))) {
        // In case of added nodes, we can climb up the tree and determine eligibility
        if (addedNodes.length > 0) {
          // Optimization: Peek in and test one node to decide if the MutationRecord qualifies
          // The remaining nodes in this MutationRecord will have the same ownerKey
          var sampleNode = addedNodes[0];

          if (isQualifiedObserver(observer, sampleNode)) {
            // If the target was being observed, then return record as-is
            // this will be the case for slot content
            var nodeObservers = getNodeObservers(target);

            if (nodeObservers && (nodeObservers[0] === observer || ArrayIndexOf.call(nodeObservers, observer) !== -1)) {
              ArrayPush.call(filteredSet, record);
            } else {
              // else, must be observing the shadowRoot
              ArrayPush.call(filteredSet, retargetMutationRecord(record));
            }
          }
        } else {
          // In the case of removed nodes, climbing the tree is not an option as the nodes are disconnected
          // We can only check if either the host or shadow root was observed and qualify the record
          var shadowRoot = target.shadowRoot;
          var _sampleNode = removedNodes[0];

          if (getNodeNearestOwnerKey(target) === getNodeNearestOwnerKey(_sampleNode) && // trickery: sampleNode is slot content
          isQualifiedObserver(observer, target) // use target as a close enough reference to climb up
          ) {
            ArrayPush.call(filteredSet, record);
          } else if (shadowRoot) {
            var shadowRootObservers = getNodeObservers(shadowRoot);

            if (shadowRootObservers && (shadowRootObservers[0] === observer || ArrayIndexOf.call(shadowRootObservers, observer) !== -1)) {
              ArrayPush.call(filteredSet, retargetMutationRecord(record));
            }
          }
        }
      } else {
        // Mutation happened under a root node(shadow root or document) and the decision is straighforward
        // Ascend the tree starting from target and check if observer is qualified
        if (isQualifiedObserver(observer, target)) {
          ArrayPush.call(filteredSet, record);
        }
      }

      return filteredSet;
    }, []);
  }

  function getWrappedCallback(callback) {
    var wrappedCallback = callback[wrapperLookupField];

    if (isUndefined(wrappedCallback)) {
      wrappedCallback = callback[wrapperLookupField] = function (mutations, observer) {
        // Filter mutation records
        var filteredRecords = filterMutationRecords(mutations, observer); // If not records are eligible for the observer, do not invoke callback

        if (filteredRecords.length === 0) {
          return;
        }

        callback.call(observer, filteredRecords, observer);
      };
    }

    return wrappedCallback;
  }
  /**
   * Patched MutationObserver constructor.
   * 1. Wrap the callback to filter out MutationRecords based on dom ownership
   * 2. Add a property field to track all observed targets of the observer instance
   * @param {MutationCallback} callback
   */


  function PatchedMutationObserver(callback) {
    var wrappedCallback = getWrappedCallback(callback);
    var observer = new OriginalMutationObserver(wrappedCallback);
    return observer;
  }

  function patchedDisconnect() {
    var _this2 = this;

    originalDisconnect.call(this); // Clear the node to observer reference which is a strong references

    var observedNodes = observerToNodesMap.get(this);

    if (!isUndefined(observedNodes)) {
      forEach.call(observedNodes, function (observedNode) {
        var observers = observedNode[observerLookupField];

        if (!isUndefined(observers)) {
          var index = ArrayIndexOf.call(observers, _this2);

          if (index !== -1) {
            ArraySplice.call(observers, index, 1);
          }
        }
      });
      observedNodes.length = 0;
    }
  }
  /**
   * A single mutation observer can observe multiple nodes(target).
   * Maintain a list of all targets that the observer chooses to observe
   * @param {Node} target
   * @param {Object} options
   */


  function patchedObserve(target, options) {
    var targetObservers = getNodeObservers(target); // Maintain a list of all observers that want to observe a node

    if (isUndefined(targetObservers)) {
      targetObservers = [];
      setNodeObservers(target, targetObservers);
    } // Same observer trying to observe the same node


    if (ArrayIndexOf.call(targetObservers, this) === -1) {
      ArrayPush.call(targetObservers, this);
    } // else There is more bookkeeping to do here https://dom.spec.whatwg.org/#dom-mutationobserver-observe Step #7
    // SyntheticShadowRoot instances are not actually a part of the DOM so observe the host instead.


    if (isSyntheticShadowRoot(target)) {
      target = target.host;
    } // maintain a list of all nodes observed by this observer


    if (observerToNodesMap.has(this)) {
      var observedNodes = observerToNodesMap.get(this);

      if (ArrayIndexOf.call(observedNodes, target) === -1) {
        ArrayPush.call(observedNodes, target);
      }
    } else {
      observerToNodesMap.set(this, [target]);
    }

    return originalObserve.call(this, target, options);
  }
  /**
   * Patch the takeRecords() api to filter MutationRecords based on the observed targets
   */


  function patchedTakeRecords() {
    return filterMutationRecords(originalTakeRecords.call(this), this);
  }

  PatchedMutationObserver.prototype = OriginalMutationObserver.prototype;
  PatchedMutationObserver.prototype.disconnect = patchedDisconnect;
  PatchedMutationObserver.prototype.observe = patchedObserve;
  PatchedMutationObserver.prototype.takeRecords = patchedTakeRecords;
  defineProperty(window, 'MutationObserver', {
    value: PatchedMutationObserver,
    configurable: true,
    writable: true
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function patchedAddEventListener$1(type, listener, optionsOrCapture) {
    if (isSyntheticShadowHost(this)) {
      // Typescript does not like it when you treat the `arguments` object as an array
      // @ts-ignore type-mismatch
      return addCustomElementEventListener.apply(this, arguments);
    }

    if (arguments.length < 2) {
      // Slow path, unlikely to be called frequently. We expect modern browsers to throw:
      // https://googlechrome.github.io/samples/event-listeners-mandatory-arguments/
      var args = ArraySlice.call(arguments);

      if (args.length > 1) {
        args[1] = getEventListenerWrapper(args[1]);
      } // Ignore types because we're passing through to native method
      // @ts-ignore type-mismatch


      return addEventListener.apply(this, args);
    } // Fast path. This function is optimized to avoid ArraySlice because addEventListener is called
    // very frequently, and it provides a measurable perf boost to avoid so much array cloning.


    var wrappedListener = getEventListenerWrapper(listener); // The third argument is optional, so passing in `undefined` for `optionsOrCapture` gives capture=false

    return addEventListener.call(this, type, wrappedListener, optionsOrCapture);
  }

  function patchedRemoveEventListener$1(_type, _listener, _optionsOrCapture) {
    if (isSyntheticShadowHost(this)) {
      // Typescript does not like it when you treat the `arguments` object as an array
      // @ts-ignore type-mismatch
      return removeCustomElementEventListener.apply(this, arguments);
    }

    var args = ArraySlice.call(arguments);

    if (arguments.length > 1) {
      args[1] = getEventListenerWrapper(args[1]);
    } // Ignore types because we're passing through to native method
    // @ts-ignore type-mismatch


    removeEventListener.apply(this, args); // Account for listeners that were added before this polyfill was applied
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch

    removeEventListener.apply(this, arguments);
  }

  defineProperties(eventTargetPrototype, {
    addEventListener: {
      value: patchedAddEventListener$1,
      enumerable: true,
      writable: true,
      configurable: true
    },
    removeEventListener: {
      value: patchedRemoveEventListener$1,
      enumerable: true,
      writable: true,
      configurable: true
    }
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function detect() {
    return typeof EventTarget === 'undefined';
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function patchedAddEventListener(_type, _listener, _options) {
    if (arguments.length > 1) {
      var args = ArraySlice.call(arguments);
      args[1] = getEventListenerWrapper(args[1]); // Ignore types because we're passing through to native method
      // @ts-ignore type-mismatch

      return windowAddEventListener.apply(this, args);
    } // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch


    return windowAddEventListener.apply(this, arguments);
  }

  function patchedRemoveEventListener(_type, _listener, _options) {
    if (arguments.length > 1) {
      var args = ArraySlice.call(arguments);
      args[1] = getEventListenerWrapper(args[1]); // Ignore types because we're passing through to native method
      // @ts-ignore type-mismatch

      windowRemoveEventListener.apply(this, args);
    } // Account for listeners that were added before this polyfill was applied
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch


    windowRemoveEventListener.apply(this, arguments);
  }

  function apply() {
    defineProperties(Window.prototype, {
      addEventListener: {
        value: patchedAddEventListener,
        enumerable: true,
        writable: true,
        configurable: true
      },
      removeEventListener: {
        value: patchedRemoveEventListener,
        enumerable: true,
        writable: true,
        configurable: true
      }
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  if (detect()) {
    apply();
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function patchedCurrentTargetGetter() {
    var currentTarget = eventCurrentTargetGetter.call(this);

    if (isNull(currentTarget)) {
      return null;
    }

    if (eventToContextMap.get(this) === 1
    /* SHADOW_ROOT_LISTENER */
    ) {
      return getShadowRoot(currentTarget);
    }

    return currentTarget;
  }

  function patchedTargetGetter() {
    var originalTarget = eventTargetGetter.call(this);

    if (!(originalTarget instanceof _Node)) {
      return originalTarget;
    }

    var doc = getOwnerDocument(originalTarget);
    var composedPath = pathComposer(originalTarget, this.composed);
    var originalCurrentTarget = eventCurrentTargetGetter.call(this); // Handle cases where the currentTarget is null (for async events), and when an event has been
    // added to Window

    if (!(originalCurrentTarget instanceof _Node)) {
      // TODO [#1511]: Special escape hatch to support legacy behavior. Should be fixed.
      // If the event's target is being accessed async and originalTarget is not a keyed element, do not retarget
      if (isNull(originalCurrentTarget) && isUndefined(getNodeOwnerKey(originalTarget))) {
        return originalTarget;
      }

      return retarget(doc, composedPath);
    } else if (originalCurrentTarget === doc || originalCurrentTarget === doc.body) {
      // TODO [#1530]: If currentTarget is document or document.body (Third party libraries that have global event listeners)
      // and the originalTarget is not a keyed element, do not retarget
      if (isUndefined(getNodeOwnerKey(originalTarget))) {
        return originalTarget;
      }

      return retarget(doc, composedPath);
    }

    var actualCurrentTarget = originalCurrentTarget;
    var actualPath = composedPath; // Address the possibility that `currentTarget` is a shadow root

    if (isSyntheticShadowHost(originalCurrentTarget)) {
      var context = eventToContextMap.get(this);

      if (context === 1
      /* SHADOW_ROOT_LISTENER */
      ) {
        actualCurrentTarget = getShadowRoot(originalCurrentTarget);
      }
    } // Address the possibility that `target` is a shadow root


    if (isSyntheticShadowHost(originalTarget) && eventToShadowRootMap.has(this)) {
      actualPath = pathComposer(getShadowRoot(originalTarget), this.composed);
    }

    return retarget(actualCurrentTarget, actualPath);
  }

  function patchedComposedPathValue() {
    var originalTarget = eventTargetGetter.call(this); // Account for events with targets that are not instances of Node (e.g., when a readystatechange
    // handler is listening on an instance of XMLHttpRequest).

    if (!(originalTarget instanceof _Node)) {
      return [];
    } // If the original target is inside a native shadow root, then just call the native
    // composePath() method. The event is already retargeted and this causes our composedPath()
    // polyfill to compute the wrong value. This is only an issue when you have a native web
    // component inside an LWC component (see test in same commit) but this scenario is unlikely
    // because we don't yet support that. Workaround specifically for W-9846457. Mixed mode solution
    // will likely be more involved.


    var hasShadowRoot = Boolean(originalTarget.shadowRoot);
    var hasSyntheticShadowRootAttached = hasInternalSlot(originalTarget);

    if (hasShadowRoot && !hasSyntheticShadowRootAttached) {
      return composedPath.call(this);
    }

    var originalCurrentTarget = eventCurrentTargetGetter.call(this); // If the event has completed propagation, the composedPath should be an empty array.

    if (isNull(originalCurrentTarget)) {
      return [];
    } // Address the possibility that `target` is a shadow root


    var actualTarget = originalTarget;

    if (isSyntheticShadowHost(originalTarget) && eventToShadowRootMap.has(this)) {
      actualTarget = getShadowRoot(originalTarget);
    }

    return pathComposer(actualTarget, this.composed);
  }

  defineProperties(Event.prototype, {
    target: {
      get: patchedTargetGetter,
      enumerable: true,
      configurable: true
    },
    currentTarget: {
      get: patchedCurrentTargetGetter,
      enumerable: true,
      configurable: true
    },
    composedPath: {
      value: patchedComposedPathValue,
      writable: true,
      enumerable: true,
      configurable: true
    },
    // Non-standard but widely supported for backwards-compatibility
    srcElement: {
      get: patchedTargetGetter,
      enumerable: true,
      configurable: true
    },
    // Non-standard but implemented in Chrome and continues to exist for backwards-compatibility
    // https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/dom/events/event.idl;l=58?q=event.idl&ss=chromium
    path: {
      get: patchedComposedPathValue,
      enumerable: true,
      configurable: true
    }
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function retargetRelatedTarget(Ctor) {
    var relatedTargetGetter = getOwnPropertyDescriptor(Ctor.prototype, 'relatedTarget').get;
    defineProperty(Ctor.prototype, 'relatedTarget', {
      get: function get() {
        var relatedTarget = relatedTargetGetter.call(this);

        if (isNull(relatedTarget)) {
          return null;
        }

        if (!(relatedTarget instanceof _Node) || !isNodeShadowed(relatedTarget)) {
          return relatedTarget;
        }

        var pointOfReference = eventCurrentTargetGetter.call(this);

        if (isNull(pointOfReference)) {
          pointOfReference = getOwnerDocument(relatedTarget);
        }

        return retarget(pointOfReference, pathComposer(relatedTarget, true));
      },
      enumerable: true,
      configurable: true
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  retargetRelatedTarget(FocusEvent);
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  retargetRelatedTarget(MouseEvent);
  /*
   * Copyright (c) 2021, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var assignedSlotGetter = hasOwnProperty.call(Text.prototype, 'assignedSlot') ? getOwnPropertyDescriptor(Text.prototype, 'assignedSlot').get : function () {
    return null;
  };
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // We can use a single observer without having to worry about leaking because
  // "Registered observers in a node’s registered observer list have a weak
  // reference to the node."
  // https://dom.spec.whatwg.org/#garbage-collection

  var observer;
  var observerConfig = {
    childList: true
  };
  var SlotChangeKey = new WeakMap();

  function initSlotObserver() {
    return new MO(function (mutations) {
      var slots = [];
      forEach.call(mutations, function (mutation) {
        if (process.env.NODE_ENV !== 'production') {
          assert.invariant(mutation.type === 'childList', "Invalid mutation type: ".concat(mutation.type, ". This mutation handler for slots should only handle \"childList\" mutations."));
        }

        var slot = mutation.target;

        if (ArrayIndexOf.call(slots, slot) === -1) {
          ArrayPush.call(slots, slot);
          dispatchEvent.call(slot, new CustomEvent('slotchange'));
        }
      });
    });
  }

  function getFilteredSlotFlattenNodes(slot) {
    var childNodes = arrayFromCollection(childNodesGetter.call(slot)); // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch

    return ArrayReduce.call(childNodes, function (seed, child) {
      if (child instanceof Element && isSlotElement(child)) {
        ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child));
      } else {
        ArrayPush.call(seed, child);
      }

      return seed;
    }, []);
  }

  function assignedSlotGetterPatched() {
    var parentNode = parentNodeGetter.call(this); // use original assignedSlot if parent has a native shdow root

    if (parentNode instanceof Element) {
      var sr = shadowRootGetter.call(parentNode);

      if (isInstanceOfNativeShadowRoot(sr)) {
        if (this instanceof Text) {
          return assignedSlotGetter.call(this);
        }

        return assignedSlotGetter$1.call(this);
      }
    }
    /**
     * The node is assigned to a slot if:
     *  - it has a parent and its parent is a slot element
     *  - and if the slot owner key is different than the node owner key.
     *
     * When the slot and the slotted node are 2 different shadow trees, the owner keys will be
     * different. When the slot is in a shadow tree and the slotted content is a light DOM node,
     * the light DOM node doesn't have an owner key and therefor the slot owner key will be
     * different than the node owner key (always `undefined`).
     */


    if (!isNull(parentNode) && isSlotElement(parentNode) && getNodeOwnerKey(parentNode) !== getNodeOwnerKey(this)) {
      return parentNode;
    }

    return null;
  }

  defineProperties(HTMLSlotElement.prototype, {
    addEventListener: {
      value: function value(type, listener, options) {
        // super.addEventListener - but that doesn't work with typescript
        HTMLElement.prototype.addEventListener.call(this, type, listener, options);

        if (type === 'slotchange' && !SlotChangeKey.get(this)) {
          SlotChangeKey.set(this, true);

          if (!observer) {
            observer = initSlotObserver();
          }

          MutationObserverObserve.call(observer, this, observerConfig);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    assignedElements: {
      value: function value(options) {
        if (isNodeShadowed(this)) {
          var flatten = !isUndefined(options) && isTrue(options.flatten);
          var nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
          return ArrayFilter.call(nodes, function (node) {
            return node instanceof Element;
          });
        } else {
          return assignedElements.apply(this, ArraySlice.call(arguments));
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    assignedNodes: {
      value: function value(options) {
        if (isNodeShadowed(this)) {
          var flatten = !isUndefined(options) && isTrue(options.flatten);
          return flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
        } else {
          return assignedNodes.apply(this, ArraySlice.call(arguments));
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    name: {
      get: function get() {
        var name = getAttribute.call(this, 'name');
        return isNull(name) ? '' : name;
      },
      set: function set(value) {
        setAttribute.call(this, 'name', value);
      },
      enumerable: true,
      configurable: true
    },
    childNodes: {
      get: function get() {
        if (isNodeShadowed(this)) {
          var owner = getNodeOwner(this);
          var childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
          return createStaticNodeList(childNodes);
        }

        return childNodesGetter.call(this);
      },
      enumerable: true,
      configurable: true
    }
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // Non-deep-traversing patches: this descriptor map includes all descriptors that
  // do not five access to nodes beyond the immediate children.

  defineProperties(Text.prototype, {
    assignedSlot: {
      get: assignedSlotGetterPatched,
      enumerable: true,
      configurable: true
    }
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * This methods filters out elements that are not in the same shadow root of context.
   * It does not enforce shadow dom semantics if $context is not managed by LWC
   */

  function getNonPatchedFilteredArrayOfNodes(context, unfilteredNodes) {
    var filtered;
    var ownerKey = getNodeOwnerKey(context); // a node inside a shadow.

    if (!isUndefined(ownerKey)) {
      if (isSyntheticShadowHost(context)) {
        // element with shadowRoot attached
        var owner = getNodeOwner(context);

        if (isNull(owner)) {
          filtered = [];
        } else if (getNodeKey(context)) {
          // it is a custom element, and we should then filter by slotted elements
          filtered = getAllSlottedMatches(context, unfilteredNodes);
        } else {
          // regular element, we should then filter by ownership
          filtered = getAllMatches(owner, unfilteredNodes);
        }
      } else {
        // context is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
        filtered = ArrayFilter.call(unfilteredNodes, function (elm) {
          return getNodeNearestOwnerKey(elm) === ownerKey;
        });
      }
    } else if (context instanceof HTMLBodyElement) {
      // `context` is document.body which is already patched.
      filtered = ArrayFilter.call(unfilteredNodes, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context);
      });
    } else {
      // `context` is outside the lwc boundary, return unfiltered list.
      filtered = ArraySlice.call(unfilteredNodes);
    }

    return filtered;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function innerHTMLGetterPatched() {
    var childNodes = getInternalChildNodes(this);
    var innerHTML = '';

    for (var i = 0, len = childNodes.length; i < len; i += 1) {
      innerHTML += getOuterHTML(childNodes[i]);
    }

    return innerHTML;
  }

  function outerHTMLGetterPatched() {
    return getOuterHTML(this);
  }

  function attachShadowPatched(options) {
    // To retain native behavior of the API, provide synthetic shadowRoot only when specified
    if (options[KEY__SYNTHETIC_MODE]) {
      return attachShadow(this, options);
    }

    return attachShadow$1.call(this, options);
  }

  function shadowRootGetterPatched() {
    if (isSyntheticShadowHost(this)) {
      var shadow = getShadowRoot(this);

      if (shadow.mode === 'open') {
        return shadow;
      }
    }

    return shadowRootGetter.call(this);
  }

  function childrenGetterPatched() {
    var owner = getNodeOwner(this);
    var childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
    return createStaticHTMLCollection(ArrayFilter.call(childNodes, function (node) {
      return node instanceof Element;
    }));
  }

  function childElementCountGetterPatched() {
    return this.children.length;
  }

  function firstElementChildGetterPatched() {
    return this.children[0] || null;
  }

  function lastElementChildGetterPatched() {
    var children = this.children;
    return children.item(children.length - 1) || null;
  } // Non-deep-traversing patches: this descriptor map includes all descriptors that
  // do not five access to nodes beyond the immediate children.


  defineProperties(Element.prototype, {
    innerHTML: {
      get: function get() {
        if (!runtimeFlags.ENABLE_ELEMENT_PATCH) {
          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return innerHTMLGetterPatched.call(this);
          }

          return innerHTMLGetter.call(this);
        } // TODO [#1222]: remove global bypass


        if (isGlobalPatchingSkipped(this)) {
          return innerHTMLGetter.call(this);
        }

        return innerHTMLGetterPatched.call(this);
      },
      set: function set(v) {
        innerHTMLSetter.call(this, v);
      },
      enumerable: true,
      configurable: true
    },
    outerHTML: {
      get: function get() {
        if (!runtimeFlags.ENABLE_ELEMENT_PATCH) {
          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return outerHTMLGetterPatched.call(this);
          }

          return outerHTMLGetter.call(this);
        } // TODO [#1222]: remove global bypass


        if (isGlobalPatchingSkipped(this)) {
          return outerHTMLGetter.call(this);
        }

        return outerHTMLGetterPatched.call(this);
      },
      set: function set(v) {
        outerHTMLSetter.call(this, v);
      },
      enumerable: true,
      configurable: true
    },
    attachShadow: {
      value: attachShadowPatched,
      enumerable: true,
      writable: true,
      configurable: true
    },
    shadowRoot: {
      get: shadowRootGetterPatched,
      enumerable: true,
      configurable: true
    },
    // patched in HTMLElement if exists (IE11 is the one off here)
    children: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return childrenGetterPatched.call(this);
        }

        return childrenGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    childElementCount: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return childElementCountGetterPatched.call(this);
        }

        return childElementCountGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    firstElementChild: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return firstElementChildGetterPatched.call(this);
        }

        return firstElementChildGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    lastElementChild: {
      get: function get() {
        if (hasMountedChildren(this)) {
          return lastElementChildGetterPatched.call(this);
        }

        return lastElementChildGetter.call(this);
      },
      enumerable: true,
      configurable: true
    },
    assignedSlot: {
      get: assignedSlotGetterPatched,
      enumerable: true,
      configurable: true
    }
  }); // IE11 extra patches for wrong prototypes

  if (hasOwnProperty.call(HTMLElement.prototype, 'innerHTML')) {
    defineProperty(HTMLElement.prototype, 'innerHTML', getOwnPropertyDescriptor(Element.prototype, 'innerHTML'));
  }

  if (hasOwnProperty.call(HTMLElement.prototype, 'outerHTML')) {
    defineProperty(HTMLElement.prototype, 'outerHTML', getOwnPropertyDescriptor(Element.prototype, 'outerHTML'));
  }

  if (hasOwnProperty.call(HTMLElement.prototype, 'children')) {
    defineProperty(HTMLElement.prototype, 'children', getOwnPropertyDescriptor(Element.prototype, 'children'));
  } // Deep-traversing patches from this point on:


  function querySelectorPatched() {
    var _this3 = this;

    var nodeList = arrayFromCollection(querySelectorAll$1.apply(this, ArraySlice.call(arguments)));

    if (isSyntheticShadowHost(this)) {
      // element with shadowRoot attached
      var owner = getNodeOwner(this);

      if (isNull(owner)) {
        return null;
      } else if (getNodeKey(this)) {
        // it is a custom element, and we should then filter by slotted elements
        return getFirstSlottedMatch(this, nodeList);
      } else {
        // regular element, we should then filter by ownership
        return getFirstMatch(owner, nodeList);
      }
    } else if (isNodeShadowed(this)) {
      // element inside a shadowRoot
      var ownerKey = getNodeOwnerKey(this);

      if (!isUndefined(ownerKey)) {
        // `this` is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
        var elm = ArrayFind.call(nodeList, function (elm) {
          return getNodeNearestOwnerKey(elm) === ownerKey;
        });
        return isUndefined(elm) ? null : elm;
      } else {
        if (!runtimeFlags.ENABLE_NODE_LIST_PATCH) {
          // `this` is a manually inserted element inside a shadowRoot, return the first element.
          return nodeList.length === 0 ? null : nodeList[0];
        } // Element is inside a shadow but we dont know which one. Use the
        // "nearest" owner key to filter by ownership.


        var contextNearestOwnerKey = getNodeNearestOwnerKey(this);

        var _elm = ArrayFind.call(nodeList, function (elm) {
          return getNodeNearestOwnerKey(elm) === contextNearestOwnerKey;
        });

        return isUndefined(_elm) ? null : _elm;
      }
    } else {
      if (!runtimeFlags.ENABLE_NODE_LIST_PATCH) {
        if (!(this instanceof HTMLBodyElement)) {
          var _elm3 = nodeList[0];
          return isUndefined(_elm3) ? null : _elm3;
        }
      } // element belonging to the document


      var _elm2 = ArrayFind.call(nodeList, // TODO [#1222]: remove global bypass
      function (elm) {
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(_this3);
      });

      return isUndefined(_elm2) ? null : _elm2;
    }
  }

  function getFilteredArrayOfNodes(context, unfilteredNodes, shadowDomSemantic) {
    var filtered;

    if (isSyntheticShadowHost(context)) {
      // element with shadowRoot attached
      var owner = getNodeOwner(context);

      if (isNull(owner)) {
        filtered = [];
      } else if (getNodeKey(context)) {
        // it is a custom element, and we should then filter by slotted elements
        filtered = getAllSlottedMatches(context, unfilteredNodes);
      } else {
        // regular element, we should then filter by ownership
        filtered = getAllMatches(owner, unfilteredNodes);
      }
    } else if (isNodeShadowed(context)) {
      // element inside a shadowRoot
      var ownerKey = getNodeOwnerKey(context);

      if (!isUndefined(ownerKey)) {
        // context is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
        filtered = ArrayFilter.call(unfilteredNodes, function (elm) {
          return getNodeNearestOwnerKey(elm) === ownerKey;
        });
      } else if (shadowDomSemantic === 1
      /* Enabled */
      ) {
        // context is inside a shadow, we dont know which one.
        var contextNearestOwnerKey = getNodeNearestOwnerKey(context);
        filtered = ArrayFilter.call(unfilteredNodes, function (elm) {
          return getNodeNearestOwnerKey(elm) === contextNearestOwnerKey;
        });
      } else {
        // context is manually inserted without lwc:dom-manual and ShadowDomSemantics is off, return everything
        filtered = ArraySlice.call(unfilteredNodes);
      }
    } else {
      if (context instanceof HTMLBodyElement || shadowDomSemantic === 1
      /* Enabled */
      ) {
        // `context` is document.body or element belonging to the document with the patch enabled
        filtered = ArrayFilter.call(unfilteredNodes, // TODO [#1222]: remove global bypass
        function (elm) {
          return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context);
        });
      } else {
        // `context` is outside the lwc boundary and patch is not enabled.
        filtered = ArraySlice.call(unfilteredNodes);
      }
    }

    return filtered;
  } // The following patched methods hide shadowed elements from global
  // traversing mechanisms. They are simplified for performance reasons to
  // filter by ownership and do not account for slotted elements. This
  // compromise is fine for our synthetic shadow dom because root elements
  // cannot have slotted elements.
  // Another compromise here is that all these traversing methods will return
  // static HTMLCollection or static NodeList. We decided that this compromise
  // is not a big problem considering the amount of code that is relying on
  // the liveliness of these results are rare.


  defineProperties(Element.prototype, {
    querySelector: {
      value: querySelectorPatched,
      writable: true,
      enumerable: true,
      configurable: true
    },
    querySelectorAll: {
      value: function value() {
        var nodeList = arrayFromCollection(querySelectorAll$1.apply(this, ArraySlice.call(arguments)));

        if (!runtimeFlags.ENABLE_NODE_LIST_PATCH) {
          var filteredResults = getFilteredArrayOfNodes(this, nodeList, 0
          /* Disabled */
          );
          return createStaticNodeList(filteredResults);
        }

        return createStaticNodeList(getFilteredArrayOfNodes(this, nodeList, 1
        /* Enabled */
        ));
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  }); // The following APIs are used directly by Jest internally so we avoid patching them during testing.

  if (process.env.NODE_ENV !== 'test') {
    defineProperties(Element.prototype, {
      getElementsByClassName: {
        value: function value() {
          var elements = arrayFromCollection(getElementsByClassName$1.apply(this, ArraySlice.call(arguments)));

          if (!runtimeFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
            return createStaticHTMLCollection(getNonPatchedFilteredArrayOfNodes(this, elements));
          }

          var filteredResults = getFilteredArrayOfNodes(this, elements, 1
          /* Enabled */
          );
          return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      getElementsByTagName: {
        value: function value() {
          var elements = arrayFromCollection(getElementsByTagName$1.apply(this, ArraySlice.call(arguments)));

          if (!runtimeFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
            return createStaticHTMLCollection(getNonPatchedFilteredArrayOfNodes(this, elements));
          }

          var filteredResults = getFilteredArrayOfNodes(this, elements, 1
          /* Enabled */
          );
          return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      getElementsByTagNameNS: {
        value: function value() {
          var elements = arrayFromCollection(getElementsByTagNameNS$1.apply(this, ArraySlice.call(arguments)));

          if (!runtimeFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
            return createStaticHTMLCollection(getNonPatchedFilteredArrayOfNodes(this, elements));
          }

          var filteredResults = getFilteredArrayOfNodes(this, elements, 1
          /* Enabled */
          );
          return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });
  } // IE11 extra patches for wrong prototypes


  if (hasOwnProperty.call(HTMLElement.prototype, 'getElementsByClassName')) {
    defineProperty(HTMLElement.prototype, 'getElementsByClassName', getOwnPropertyDescriptor(Element.prototype, 'getElementsByClassName'));
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var FocusableSelector = "\n    [contenteditable],\n    [tabindex],\n    a[href],\n    area[href],\n    audio[controls],\n    button,\n    iframe,\n    input,\n    select,\n    textarea,\n    video[controls]\n";
  var formElementTagNames = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

  function filterSequentiallyFocusableElements(elements) {
    return elements.filter(function (element) {
      if (hasAttribute.call(element, 'tabindex')) {
        // Even though LWC only supports tabindex values of 0 or -1,
        // passing through elements with tabindex="0" is a tighter criteria
        // than filtering out elements based on tabindex="-1".
        return getAttribute.call(element, 'tabindex') === '0';
      }

      if (formElementTagNames.has(tagNameGetter.call(element))) {
        return !hasAttribute.call(element, 'disabled');
      }

      return true;
    });
  }

  var DidAddMouseEventListeners = new WeakMap(); // Due to browser differences, it is impossible to know what is focusable until
  // we actually try to focus it. We need to refactor our focus delegation logic
  // to verify whether or not the target was actually focused instead of trying
  // to predict focusability like we do here.

  function isVisible(element) {
    var _getBoundingClientRec = getBoundingClientRect.call(element),
        width = _getBoundingClientRec.width,
        height = _getBoundingClientRec.height;

    var noZeroSize = width > 0 || height > 0; // The area element can be 0x0 and focusable. Hardcoding this is not ideal
    // but it will minimize changes in the current behavior.

    var isAreaElement = element.tagName === 'AREA';
    return (noZeroSize || isAreaElement) && getComputedStyle(element).visibility !== 'hidden';
  } // This function based on https://allyjs.io/data-tables/focusable.html
  // It won't catch everything, but should be good enough
  // There are a lot of edge cases here that we can't realistically handle
  // Determines if a particular element is tabbable, as opposed to simply focusable


  function isTabbable(element) {
    if (isSyntheticShadowHost(element) && isDelegatingFocus(element)) {
      return false;
    }

    return matches.call(element, FocusableSelector) && isVisible(element);
  }

  function hostElementFocus() {
    var _rootNode = this.getRootNode();

    if (_rootNode === this) {
      // We invoke the focus() method even if the host is disconnected in order to eliminate
      // observable differences for component authors between synthetic and native.
      var focusable = querySelector.call(this, FocusableSelector);

      if (!isNull(focusable)) {
        // @ts-ignore type-mismatch
        focusable.focus.apply(focusable, arguments);
      }

      return;
    } // If the root node is not the host element then it's either the document or a shadow root.


    var rootNode = _rootNode;

    if (rootNode.activeElement === this) {
      // The focused element should not change if the focus method is invoked
      // on the shadow-including ancestor of the currently focused element.
      return;
    }

    var focusables = arrayFromCollection(querySelectorAll$1.call(this, FocusableSelector));
    var didFocus = false;

    while (!didFocus && focusables.length !== 0) {
      var _focusable = focusables.shift(); // @ts-ignore type-mismatch


      _focusable.focus.apply(_focusable, arguments); // Get the root node of the current focusable in case it was slotted.


      var currentRootNode = _focusable.getRootNode();

      didFocus = currentRootNode.activeElement === _focusable;
    }
  }

  function getTabbableSegments(host) {
    var doc = getOwnerDocument(host);
    var all = filterSequentiallyFocusableElements(arrayFromCollection(querySelectorAll.call(doc, FocusableSelector)));
    var inner = filterSequentiallyFocusableElements(arrayFromCollection(querySelectorAll$1.call(host, FocusableSelector)));

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(getAttribute.call(host, 'tabindex') === '-1' || isDelegatingFocus(host), "The focusin event is only relevant when the tabIndex property is -1 on the host.");
    }

    var firstChild = inner[0];
    var lastChild = inner[inner.length - 1];
    var hostIndex = ArrayIndexOf.call(all, host); // Host element can show up in our "previous" section if its tabindex is 0
    // We want to filter that out here

    var firstChildIndex = hostIndex > -1 ? hostIndex : ArrayIndexOf.call(all, firstChild); // Account for an empty inner list

    var lastChildIndex = inner.length === 0 ? firstChildIndex + 1 : ArrayIndexOf.call(all, lastChild) + 1;
    var prev = ArraySlice.call(all, 0, firstChildIndex);
    var next = ArraySlice.call(all, lastChildIndex);
    return {
      prev: prev,
      inner: inner,
      next: next
    };
  }

  function getActiveElement(host) {
    var doc = getOwnerDocument(host);
    var activeElement = DocumentPrototypeActiveElement.call(doc);

    if (isNull(activeElement)) {
      return activeElement;
    } // activeElement must be child of the host and owned by it


    return (compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 ? activeElement : null;
  }

  function relatedTargetPosition(host, relatedTarget) {
    // assert: target must be child of host
    var pos = compareDocumentPosition.call(host, relatedTarget);

    if (pos & DOCUMENT_POSITION_CONTAINED_BY) {
      // focus remains inside the host
      return 0;
    } else if (pos & DOCUMENT_POSITION_PRECEDING) {
      // focus is coming from above
      return 1;
    } else if (pos & DOCUMENT_POSITION_FOLLOWING) {
      // focus is coming from below
      return 2;
    } // we don't know what's going on.


    return -1;
  }

  function muteEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function muteFocusEventsDuringExecution(win, func) {
    windowAddEventListener.call(win, 'focusin', muteEvent, true);
    windowAddEventListener.call(win, 'focusout', muteEvent, true);
    func();
    windowRemoveEventListener.call(win, 'focusin', muteEvent, true);
    windowRemoveEventListener.call(win, 'focusout', muteEvent, true);
  }

  function focusOnNextOrBlur(segment, target, relatedTarget) {
    var win = getOwnerWindow(relatedTarget);
    var next = getNextTabbable(segment, relatedTarget);

    if (isNull(next)) {
      // nothing to focus on, blur to invalidate the operation
      muteFocusEventsDuringExecution(win, function () {
        target.blur();
      });
    } else {
      muteFocusEventsDuringExecution(win, function () {
        next.focus();
      });
    }
  }

  var letBrowserHandleFocus = false;

  function disableKeyboardFocusNavigationRoutines() {
    letBrowserHandleFocus = true;
  }

  function enableKeyboardFocusNavigationRoutines() {
    letBrowserHandleFocus = false;
  }

  function isKeyboardFocusNavigationRoutineEnabled() {
    return !letBrowserHandleFocus;
  }

  function skipHostHandler(event) {
    if (letBrowserHandleFocus) {
      return;
    }

    var host = eventCurrentTargetGetter.call(event);
    var target = eventTargetGetter.call(event); // If the host delegating focus with tabindex=0 is not the target, we know
    // that the event was dispatched on a descendant node of the host. This
    // means the focus is coming from below and we don't need to do anything.

    if (host !== target) {
      // Focus is coming from above
      return;
    }

    var relatedTarget = focusEventRelatedTargetGetter.call(event);

    if (isNull(relatedTarget)) {
      // If relatedTarget is null, the user is most likely tabbing into the document from the
      // browser chrome. We could probably deduce whether focus is coming in from the top or the
      // bottom by comparing the position of the target to all tabbable elements. This is an edge
      // case and only comes up if the custom element is the first or last tabbable element in the
      // document.
      return;
    }

    var segments = getTabbableSegments(host);
    var position = relatedTargetPosition(host, relatedTarget);

    if (position === 1) {
      // Focus is coming from above
      var findTabbableElms = isTabbableFrom.bind(null, host.getRootNode());
      var first = ArrayFind.call(segments.inner, findTabbableElms);

      if (!isUndefined(first)) {
        var win = getOwnerWindow(first);
        muteFocusEventsDuringExecution(win, function () {
          first.focus();
        });
      } else {
        focusOnNextOrBlur(segments.next, target, relatedTarget);
      }
    } else if (host === target) {
      // Host is receiving focus from below, either from its shadow or from a sibling
      focusOnNextOrBlur(ArrayReverse.call(segments.prev), target, relatedTarget);
    }
  }

  function skipShadowHandler(event) {
    if (letBrowserHandleFocus) {
      return;
    }

    var relatedTarget = focusEventRelatedTargetGetter.call(event);

    if (isNull(relatedTarget)) {
      // If relatedTarget is null, the user is most likely tabbing into the document from the
      // browser chrome. We could probably deduce whether focus is coming in from the top or the
      // bottom by comparing the position of the target to all tabbable elements. This is an edge
      // case and only comes up if the custom element is the first or last tabbable element in the
      // document.
      return;
    }

    var host = eventCurrentTargetGetter.call(event);
    var segments = getTabbableSegments(host);

    if (ArrayIndexOf.call(segments.inner, relatedTarget) !== -1) {
      // If relatedTarget is contained by the host's subtree we can assume that the user is
      // tabbing between elements inside of the shadow. Do nothing.
      return;
    }

    var target = eventTargetGetter.call(event); // Determine where the focus is coming from (Tab or Shift+Tab)

    var position = relatedTargetPosition(host, relatedTarget);

    if (position === 1) {
      // Focus is coming from above
      focusOnNextOrBlur(segments.next, target, relatedTarget);
    }

    if (position === 2) {
      // Focus is coming from below
      focusOnNextOrBlur(ArrayReverse.call(segments.prev), target, relatedTarget);
    }
  } // Use this function to determine whether you can start from one root and end up
  // at another element via tabbing.


  function isTabbableFrom(fromRoot, toElm) {
    if (!isTabbable(toElm)) {
      return false;
    }

    var ownerDocument = getOwnerDocument(toElm);
    var root = toElm.getRootNode();

    while (root !== ownerDocument && root !== fromRoot) {
      var sr = root;
      var host = sr.host;

      if (getAttribute.call(host, 'tabindex') === '-1') {
        return false;
      }

      root = host && host.getRootNode();
    }

    return true;
  }

  function getNextTabbable(tabbables, relatedTarget) {
    var len = tabbables.length;

    if (len > 0) {
      for (var i = 0; i < len; i += 1) {
        var next = tabbables[i];

        if (isTabbableFrom(relatedTarget.getRootNode(), next)) {
          return next;
        }
      }
    }

    return null;
  } // Skips the host element


  function handleFocus(elm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isDelegatingFocus(elm), "Invalid attempt to handle focus event for ".concat(toString(elm), ". ").concat(toString(elm), " should have delegates focus true, but is not delegating focus"));
    }

    bindDocumentMousedownMouseupHandlers(elm); // Unbind any focusin listeners we may have going on

    ignoreFocusIn(elm);
    addEventListener.call(elm, 'focusin', skipHostHandler, true);
  }

  function ignoreFocus(elm) {
    removeEventListener.call(elm, 'focusin', skipHostHandler, true);
  }

  function bindDocumentMousedownMouseupHandlers(elm) {
    var ownerDocument = getOwnerDocument(elm);

    if (!DidAddMouseEventListeners.get(ownerDocument)) {
      DidAddMouseEventListeners.set(ownerDocument, true);
      addEventListener.call(ownerDocument, 'mousedown', disableKeyboardFocusNavigationRoutines, true);
      addEventListener.call(ownerDocument, 'mouseup', function () {
        // We schedule this as an async task in the mouseup handler (as
        // opposed to the mousedown handler) because we want to guarantee
        // that it will never run before the focusin handler:
        //
        // Click form element   | Click form element label
        // ==================================================
        // mousedown            | mousedown
        // FOCUSIN              | mousedown-setTimeout
        // mousedown-setTimeout | mouseup
        // mouseup              | FOCUSIN
        // mouseup-setTimeout   | mouseup-setTimeout
        setTimeout(enableKeyboardFocusNavigationRoutines);
      }, true); // [W-7824445] If the element is draggable, the mousedown event is dispatched before the
      // element is starting to be dragged, which disable the keyboard focus navigation routine.
      // But by specification, the mouseup event is never dispatched once the element is dropped.
      //
      // For all draggable element, we need to add an event listener to re-enable the keyboard
      // navigation routine after dragging starts.

      addEventListener.call(ownerDocument, 'dragstart', enableKeyboardFocusNavigationRoutines, true);
    }
  } // Skips the shadow tree


  function handleFocusIn(elm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(tabIndexGetter.call(elm) === -1, "Invalid attempt to handle focus in  ".concat(toString(elm), ". ").concat(toString(elm), " should have tabIndex -1, but has tabIndex ").concat(tabIndexGetter.call(elm)));
    }

    bindDocumentMousedownMouseupHandlers(elm); // Unbind any focus listeners we may have going on

    ignoreFocus(elm); // This focusin listener is to catch focusin events from keyboard interactions
    // A better solution would perhaps be to listen for keydown events, but
    // the keydown event happens on whatever element already has focus (or no element
    // at all in the case of the location bar. So, instead we have to assume that focusin
    // without a mousedown means keyboard navigation

    addEventListener.call(elm, 'focusin', skipShadowHandler, true);
  }

  function ignoreFocusIn(elm) {
    removeEventListener.call(elm, 'focusin', skipShadowHandler, true);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getElementComputedStyle(element) {
    var win = getOwnerWindow(element);
    return windowGetComputedStyle.call(win, element);
  }

  function getWindowSelection(node) {
    var win = getOwnerWindow(node);
    return windowGetSelection.call(win);
  }

  function nodeIsBeingRendered(nodeComputedStyle) {
    return nodeComputedStyle.visibility === 'visible' && nodeComputedStyle.display !== 'none';
  }

  function getSelectionState(element) {
    var win = getOwnerWindow(element);
    var selection = getWindowSelection(element);

    if (selection === null) {
      return null;
    }

    var ranges = [];

    for (var i = 0; i < selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i));
    }

    var state = {
      element: element,
      onselect: win.onselect,
      onselectstart: win.onselectstart,
      onselectionchange: win.onselectionchange,
      ranges: ranges
    };
    win.onselect = null;
    win.onselectstart = null;
    win.onselectionchange = null;
    return state;
  }

  function restoreSelectionState(state) {
    if (state === null) {
      return;
    }

    var element = state.element,
        onselect = state.onselect,
        onselectstart = state.onselectstart,
        onselectionchange = state.onselectionchange,
        ranges = state.ranges;
    var win = getOwnerWindow(element);
    var selection = getWindowSelection(element);
    selection.removeAllRanges();

    for (var i = 0; i < ranges.length; i++) {
      selection.addRange(ranges[i]);
    }

    win.onselect = onselect;
    win.onselectstart = onselectstart;
    win.onselectionchange = onselectionchange;
  }
  /**
   * Gets the "innerText" of a text node using the Selection API
   *
   * NOTE: For performance reasons, since this function will be called multiple times while calculating the innerText of
   *       an element, it does not restore the current selection.
   */


  function getTextNodeInnerText(textNode) {
    var selection = getWindowSelection(textNode);

    if (selection === null) {
      return textNode.textContent || '';
    }

    var range = document.createRange();
    range.selectNodeContents(textNode);
    var domRect = range.getBoundingClientRect();

    if (domRect.height <= 0 || domRect.width <= 0) {
      // the text node is not rendered
      return '';
    } // Needed to remove non rendered characters from the text node.


    selection.removeAllRanges();
    selection.addRange(range);
    var selectionText = selection.toString(); // The textNode is visible, but it may not be selectable. When the text is not selectable,
    // textContent is the nearest approximation to innerText.

    return selectionText ? selectionText : textNode.textContent || '';
  }

  var nodeIsElement = function nodeIsElement(node) {
    return node.nodeType === ELEMENT_NODE;
  };

  var nodeIsText = function nodeIsText(node) {
    return node.nodeType === TEXT_NODE;
  };
  /**
   * Spec: https://html.spec.whatwg.org/multipage/dom.html#inner-text-collection-steps
   * One spec implementation: https://github.com/servo/servo/blob/721271dcd3c20db5ca8cf146e2b5907647afb4d6/components/layout/query.rs#L1132
   */


  function innerTextCollectionSteps(node) {
    var items = [];

    if (nodeIsElement(node)) {
      var tagName = node.tagName;
      var computedStyle = getElementComputedStyle(node);

      if (tagName === 'OPTION') {
        // For options, is hard to get the "rendered" text, let's use the original getter.
        return [1, innerTextGetter.call(node), 1];
      } else if (tagName === 'TEXTAREA') {
        return [];
      } else {
        var childNodes = node.childNodes;

        for (var i = 0, n = childNodes.length; i < n; i++) {
          ArrayPush.apply(items, innerTextCollectionSteps(childNodes[i]));
        }
      }

      if (!nodeIsBeingRendered(computedStyle)) {
        if (tagName === 'SELECT' || tagName === 'DATALIST') {
          // the select is either: .visibility != 'visible' or .display === hidden, therefore this select should
          // not display any value.
          return [];
        }

        return items;
      }

      if (tagName === 'BR') {
        items.push("\n"
        /* line feed */
        );
      }

      var display = computedStyle.display;

      if (display === 'table-cell') {
        // omitting case: and node's CSS box is not the last 'table-cell' box of its enclosing 'table-row' box
        items.push("\t"
        /* tab */
        );
      }

      if (display === 'table-row') {
        // omitting case: and node's CSS box is not the last 'table-row' box of the nearest ancestor 'table' box
        items.push("\n"
        /* line feed */
        );
      }

      if (tagName === 'P') {
        items.unshift(2);
        items.push(2);
      }

      if (display === 'block' || display === 'table-caption' || display === 'flex' || display === 'table') {
        items.unshift(1);
        items.push(1);
      }
    } else if (nodeIsText(node)) {
      items.push(getTextNodeInnerText(node));
    }

    return items;
  }
  /**
   * InnerText getter spec: https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
   *
   * One spec implementation: https://github.com/servo/servo/blob/721271dcd3c20db5ca8cf146e2b5907647afb4d6/components/layout/query.rs#L1087
   */


  function getInnerText(element) {
    var thisComputedStyle = getElementComputedStyle(element);

    if (!nodeIsBeingRendered(thisComputedStyle)) {
      return getTextContent(element) || '';
    }

    var selectionState = getSelectionState(element);
    var results = [];
    var childNodes = element.childNodes;

    for (var i = 0, n = childNodes.length; i < n; i++) {
      ArrayPush.apply(results, innerTextCollectionSteps(childNodes[i]));
    }

    restoreSelectionState(selectionState);
    var elementInnerText = '';
    var maxReqLineBreakCount = 0;

    for (var _i = 0, _n = results.length; _i < _n; _i++) {
      var item = results[_i];

      if (typeof item === 'string') {
        if (maxReqLineBreakCount > 0) {
          for (var j = 0; j < maxReqLineBreakCount; j++) {
            elementInnerText += "\n";
          }

          maxReqLineBreakCount = 0;
        }

        if (item.length > 0) {
          elementInnerText += item;
        }
      } else {
        if (elementInnerText.length == 0) {
          // Remove required line break count at the start.
          continue;
        } // Store the count if it's the max of this run,
        // but it may be ignored if no text item is found afterwards,
        // which means that these are consecutive line breaks at the end.


        if (item > maxReqLineBreakCount) {
          maxReqLineBreakCount = item;
        }
      }
    }

    return elementInnerText;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var _HTMLElement$prototyp = HTMLElement.prototype,
      blur = _HTMLElement$prototyp.blur,
      focus = _HTMLElement$prototyp.focus;
  /**
   * This method only applies to elements with a shadow attached to them
   */

  function tabIndexGetterPatched() {
    if (isDelegatingFocus(this) && isFalse(hasAttribute.call(this, 'tabindex'))) {
      // this covers the case where the default tabindex should be 0 because the
      // custom element is delegating its focus
      return 0;
    }

    return tabIndexGetter.call(this);
  }
  /**
   * This method only applies to elements with a shadow attached to them
   */


  function tabIndexSetterPatched(value) {
    // This tabIndex setter might be confusing unless it is understood that HTML
    // elements have default tabIndex property values. Natively focusable elements have
    // a default tabIndex value of 0 and all other elements have a default tabIndex
    // value of -1. For example, the tabIndex property value is -1 for both <x-foo> and
    // <x-foo tabindex="-1">, but our delegatesFocus polyfill should only kick in for
    // the latter case when the value of the tabindex attribute is -1.
    var delegatesFocus = isDelegatingFocus(this); // Record the state of things before invoking component setter.

    var prevValue = tabIndexGetter.call(this);
    var prevHasAttr = hasAttribute.call(this, 'tabindex');
    tabIndexSetter.call(this, value); // Record the state of things after invoking component setter.

    var currValue = tabIndexGetter.call(this);
    var currHasAttr = hasAttribute.call(this, 'tabindex');
    var didValueChange = prevValue !== currValue; // If the tabindex attribute is initially rendered, we can assume that this setter has
    // previously executed and a listener has been added. We must remove that listener if
    // the tabIndex property value has changed or if the component no longer renders a
    // tabindex attribute.

    if (prevHasAttr && (didValueChange || isFalse(currHasAttr))) {
      if (prevValue === -1) {
        ignoreFocusIn(this);
      }

      if (prevValue === 0 && delegatesFocus) {
        ignoreFocus(this);
      }
    } // If a tabindex attribute was not rendered after invoking its setter, it means the
    // component is taking control. Do nothing.


    if (isFalse(currHasAttr)) {
      return;
    } // If the tabindex attribute is initially rendered, we can assume that this setter has
    // previously executed and a listener has been added. If the tabindex attribute is still
    // rendered after invoking the setter AND the tabIndex property value has not changed,
    // we don't need to do any work.


    if (prevHasAttr && currHasAttr && isFalse(didValueChange)) {
      return;
    } // At this point we know that a tabindex attribute was rendered after invoking the
    // setter and that either:
    // 1) This is the first time this setter is being invoked.
    // 2) This is not the first time this setter is being invoked and the value is changing.
    // We need to add the appropriate listeners in either case.


    if (currValue === -1) {
      // Add the magic to skip the shadow tree
      handleFocusIn(this);
    }

    if (currValue === 0 && delegatesFocus) {
      // Add the magic to skip the host element
      handleFocus(this);
    }
  }
  /**
   * This method only applies to elements with a shadow attached to them
   */


  function blurPatched() {
    if (isDelegatingFocus(this)) {
      var currentActiveElement = getActiveElement(this);

      if (!isNull(currentActiveElement)) {
        // if there is an active element, blur it (intentionally using the dot notation in case the user defines the blur routine)
        currentActiveElement.blur();
        return;
      }
    }

    return blur.call(this);
  }

  function focusPatched() {
    // Save enabled state
    var originallyEnabled = isKeyboardFocusNavigationRoutineEnabled(); // Change state by disabling if originally enabled

    if (originallyEnabled) {
      disableKeyboardFocusNavigationRoutines();
    }

    if (isSyntheticShadowHost(this) && isDelegatingFocus(this)) {
      hostElementFocus.call(this);
      return;
    } // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch


    focus.apply(this, arguments); // Restore state by enabling if originally enabled

    if (originallyEnabled) {
      enableKeyboardFocusNavigationRoutines();
    }
  } // Non-deep-traversing patches: this descriptor map includes all descriptors that
  // do not five access to nodes beyond the immediate children.


  defineProperties(HTMLElement.prototype, {
    tabIndex: {
      get: function get() {
        if (isSyntheticShadowHost(this)) {
          return tabIndexGetterPatched.call(this);
        }

        return tabIndexGetter.call(this);
      },
      set: function set(v) {
        if (isSyntheticShadowHost(this)) {
          return tabIndexSetterPatched.call(this, v);
        }

        return tabIndexSetter.call(this, v);
      },
      enumerable: true,
      configurable: true
    },
    blur: {
      value: function value() {
        if (isSyntheticShadowHost(this)) {
          return blurPatched.call(this);
        }

        blur.call(this);
      },
      enumerable: true,
      writable: true,
      configurable: true
    },
    focus: {
      value: function value() {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        focusPatched.apply(this, arguments);
      },
      enumerable: true,
      writable: true,
      configurable: true
    }
  }); // Note: In JSDOM innerText is not implemented: https://github.com/jsdom/jsdom/issues/1245

  if (innerTextGetter !== null && innerTextSetter !== null) {
    defineProperty(HTMLElement.prototype, 'innerText', {
      get: function get() {
        if (!runtimeFlags.ENABLE_INNER_OUTER_TEXT_PATCH) {
          return innerTextGetter.call(this);
        }

        if (!runtimeFlags.ENABLE_ELEMENT_PATCH) {
          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return getInnerText(this);
          }

          return innerTextGetter.call(this);
        } // TODO [#1222]: remove global bypass


        if (isGlobalPatchingSkipped(this)) {
          return innerTextGetter.call(this);
        }

        return getInnerText(this);
      },
      set: function set(v) {
        innerTextSetter.call(this, v);
      },
      enumerable: true,
      configurable: true
    });
  } // Note: Firefox does not have outerText, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText


  if (outerTextGetter !== null && outerTextSetter !== null) {
    // From https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText :
    // HTMLElement.outerText is a non-standard property. As a getter, it returns the same value as Node.innerText.
    // As a setter, it removes the current node and replaces it with the given text.
    defineProperty(HTMLElement.prototype, 'outerText', {
      get: function get() {
        if (!runtimeFlags.ENABLE_INNER_OUTER_TEXT_PATCH) {
          return outerTextGetter.call(this);
        }

        if (!runtimeFlags.ENABLE_ELEMENT_PATCH) {
          if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
            return getInnerText(this);
          }

          return outerTextGetter.call(this);
        } // TODO [#1222]: remove global bypass


        if (isGlobalPatchingSkipped(this)) {
          return outerTextGetter.call(this);
        }

        return getInnerText(this);
      },
      set: function set(v) {
        // Invoking the `outerText` setter on a host element should trigger its disconnection, but until we merge node reactions, it will not work.
        // We could reimplement the outerText setter in JavaScript ([blink implementation](https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/html/html_element.cc;l=841-879;drc=6e8b402a6231405b753919029c9027404325ea00;bpv=0;bpt=1))
        // but the benefits don't worth the efforts.
        outerTextSetter.call(this, v);
      },
      enumerable: true,
      configurable: true
    });
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getShadowToken(node) {
    return node[KEY__SHADOW_TOKEN];
  }

  function setShadowToken(node, shadowToken) {
    node[KEY__SHADOW_TOKEN] = shadowToken;
  }
  /**
   * Patching Element.prototype.$shadowToken$ to mark elements a portal:
   *
   *  - we use a property to allow engines to set a custom attribute that should be
   *    placed into the element to sandbox the css rules defined for the template.
   *
   *  - this custom attribute must be unique.
   *
   **/


  defineProperty(Element.prototype, KEY__SHADOW_TOKEN, {
    set: function set(shadowToken) {
      var oldShadowToken = this[KEY__SHADOW_TOKEN_PRIVATE];

      if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
        removeAttribute.call(this, oldShadowToken);
      }

      if (!isUndefined(shadowToken)) {
        setAttribute.call(this, shadowToken, '');
      }

      this[KEY__SHADOW_TOKEN_PRIVATE] = shadowToken;
    },
    get: function get() {
      return this[KEY__SHADOW_TOKEN_PRIVATE];
    },
    configurable: true
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  var DomManualPrivateKey = '$$DomManualKey$$'; // Resolver function used when a node is removed from within a portal

  var DocumentResolverFn = function DocumentResolverFn() {}; // We can use a single observer without having to worry about leaking because
  // "Registered observers in a node’s registered observer list have a weak
  // reference to the node."
  // https://dom.spec.whatwg.org/#garbage-collection


  var portalObserver;
  var portalObserverConfig = {
    childList: true
  };

  function adoptChildNode(node, fn, shadowToken) {
    var previousNodeShadowResolver = getShadowRootResolver(node);

    if (previousNodeShadowResolver === fn) {
      return; // nothing to do here, it is already correctly patched
    }

    setShadowRootResolver(node, fn);

    if (node instanceof Element) {
      setShadowToken(node, shadowToken);

      if (isSyntheticShadowHost(node)) {
        // Root LWC elements can't get content slotted into them, therefore we don't observe their children.
        return;
      }

      if (isUndefined(previousNodeShadowResolver)) {
        // we only care about Element without shadowResolver (no MO.observe has been called)
        MutationObserverObserve.call(portalObserver, node, portalObserverConfig);
      } // recursively patching all children as well


      var childNodes = childNodesGetter.call(node);

      for (var i = 0, len = childNodes.length; i < len; i += 1) {
        adoptChildNode(childNodes[i], fn, shadowToken);
      }
    }
  }

  function initPortalObserver() {
    return new MO(function (mutations) {
      forEach.call(mutations, function (mutation) {
        /**
         * This routine will process all nodes added or removed from elm (which is marked as a portal)
         * When adding a node to the portal element, we should add the ownership.
         * When removing a node from the portal element, this ownership should be removed.
         *
         * There is some special cases in which MutationObserver may call with stacked mutations (the same node
         * will be in addedNodes and removedNodes) or with false positives (a node that is removed and re-appended
         * in the same tick) for those cases, we cover by checking that the node is contained
         * (or not in the case of removal) by the element.
         */
        var elm = mutation.target,
            addedNodes = mutation.addedNodes,
            removedNodes = mutation.removedNodes; // the target of the mutation should always have a ShadowRootResolver attached to it

        var fn = getShadowRootResolver(elm);
        var shadowToken = getShadowToken(elm); // Process removals first to handle the case where an element is removed and reinserted

        for (var i = 0, len = removedNodes.length; i < len; i += 1) {
          var node = removedNodes[i];

          if (!(compareDocumentPosition.call(elm, node) & _Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            adoptChildNode(node, DocumentResolverFn, undefined);
          }
        }

        for (var _i2 = 0, _len = addedNodes.length; _i2 < _len; _i2 += 1) {
          var _node = addedNodes[_i2];

          if (compareDocumentPosition.call(elm, _node) & _Node.DOCUMENT_POSITION_CONTAINED_BY) {
            adoptChildNode(_node, fn, shadowToken);
          }
        }
      });
    });
  }

  function markElementAsPortal(elm) {
    if (isUndefined(portalObserver)) {
      portalObserver = initPortalObserver();
    }

    if (isUndefined(getShadowRootResolver(elm))) {
      // only an element from a within a shadowRoot should be used here
      throw new Error("Invalid Element");
    } // install mutation observer for portals


    MutationObserverObserve.call(portalObserver, elm, portalObserverConfig); // TODO [#1253]: optimization to synchronously adopt new child nodes added
    // to this elm, we can do that by patching the most common operations
    // on the node itself
  }
  /**
   * Patching Element.prototype.$domManual$ to mark elements as portal:
   *
   *  - we use a property to allow engines to signal that a particular element in
   *    a shadow supports manual insertion of child nodes.
   *
   *  - this signal comes as a boolean value, and we use it to install the MO instance
   *    onto the element, to propagate the $ownerKey$ and $shadowToken$ to all new
   *    child nodes.
   *
   *  - at the moment, there is no way to undo this operation, once the element is
   *    marked as $domManual$, setting it to false does nothing.
   *
   **/
  // TODO [#1306]: rename this to $observerConnection$


  defineProperty(Element.prototype, '$domManual$', {
    set: function set(v) {
      this[DomManualPrivateKey] = v;

      if (isTrue(v)) {
        markElementAsPortal(this);
      }
    },
    get: function get() {
      return this[DomManualPrivateKey];
    },
    configurable: true
  });
  /** version: 2.11.8 */

})();
