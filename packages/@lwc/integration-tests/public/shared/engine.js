var LWC = (function (exports) {
  'use strict';

  function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf2(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

  function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

  function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

  function _get2() { if (typeof Reflect !== "undefined" && Reflect.get) { _get2 = Reflect.get; } else { _get2 = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get2.apply(this, arguments); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf2(object); if (object === null) break; } return object; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf2(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf2(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf2(o) { _getPrototypeOf2 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf2(o); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
      freeze = Object.freeze,
      getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor,
      getOwnPropertyNames$1 = Object.getOwnPropertyNames,
      getPrototypeOf$1 = Object.getPrototypeOf,
      hasOwnProperty$1 = Object.hasOwnProperty,
      isFrozen = Object.isFrozen,
      keys = Object.keys,
      seal = Object.seal,
      setPrototypeOf = Object.setPrototypeOf;
  var isArray$1 = Array.isArray;
  var _Array$prototype = Array.prototype,
      ArrayIndexOf = _Array$prototype.indexOf,
      ArrayJoin = _Array$prototype.join,
      ArrayMap = _Array$prototype.map,
      ArrayPush$1 = _Array$prototype.push,
      ArraySlice = _Array$prototype.slice,
      ArraySplice = _Array$prototype.splice,
      ArrayUnshift = _Array$prototype.unshift,
      forEach = _Array$prototype.forEach;
  var StringFromCharCode = String.fromCharCode;
  var _String$prototype = String.prototype,
      StringCharCodeAt = _String$prototype.charCodeAt,
      StringReplace = _String$prototype.replace,
      StringSlice = _String$prototype.slice,
      StringToLowerCase = _String$prototype.toLowerCase;

  function isUndefined$1(obj) {
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

  function isBoolean(obj) {
    return typeof obj === 'boolean';
  }

  function isFunction$1(obj) {
    return typeof obj === 'function';
  }

  function isObject(obj) {
    return _typeof(obj) === 'object';
  }

  function isString(obj) {
    return typeof obj === 'string';
  }

  function isNumber(obj) {
    return typeof obj === 'number';
  }

  function noop() {
    /* Do nothing */
  }

  var OtS$1 = {}.toString;

  function toString$1(obj) {
    if (obj && obj.toString) {
      // Arrays might hold objects with "null" prototype So using
      // Array.prototype.toString directly will cause an error Iterate through
      // all the items and handle individually.
      if (isArray$1(obj)) {
        return ArrayJoin.call(ArrayMap.call(obj, toString$1), ',');
      }

      return obj.toString();
    } else if (_typeof(obj) === 'object') {
      return OtS$1.call(obj);
    } else {
      return obj + '';
    }
  }

  function getPropertyDescriptor(o, p) {
    do {
      var _d = getOwnPropertyDescriptor$1(o, p);

      if (!isUndefined$1(_d)) {
        return _d;
      }

      o = getPrototypeOf$1(o);
    } while (o !== null);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * According to the following list, there are 48 aria attributes of which two (ariaDropEffect and
   * ariaGrabbed) are deprecated:
   * https://www.w3.org/TR/wai-aria-1.1/#x6-6-definitions-of-states-and-properties-all-aria-attributes
   *
   * The above list of 46 aria attributes is consistent with the following resources:
   * https://github.com/w3c/aria/pull/708/files#diff-eacf331f0ffc35d4b482f1d15a887d3bR11060
   * https://wicg.github.io/aom/spec/aria-reflection.html
   */


  var AriaPropertyNames = ['ariaActiveDescendant', 'ariaAtomic', 'ariaAutoComplete', 'ariaBusy', 'ariaChecked', 'ariaColCount', 'ariaColIndex', 'ariaColSpan', 'ariaControls', 'ariaCurrent', 'ariaDescribedBy', 'ariaDetails', 'ariaDisabled', 'ariaErrorMessage', 'ariaExpanded', 'ariaFlowTo', 'ariaHasPopup', 'ariaHidden', 'ariaInvalid', 'ariaKeyShortcuts', 'ariaLabel', 'ariaLabelledBy', 'ariaLevel', 'ariaLive', 'ariaModal', 'ariaMultiLine', 'ariaMultiSelectable', 'ariaOrientation', 'ariaOwns', 'ariaPlaceholder', 'ariaPosInSet', 'ariaPressed', 'ariaReadOnly', 'ariaRelevant', 'ariaRequired', 'ariaRoleDescription', 'ariaRowCount', 'ariaRowIndex', 'ariaRowSpan', 'ariaSelected', 'ariaSetSize', 'ariaSort', 'ariaValueMax', 'ariaValueMin', 'ariaValueNow', 'ariaValueText', 'role'];

  var _ref = /*@__PURE__*/function () {
    var AriaAttrNameToPropNameMap = create(null);
    var AriaPropNameToAttrNameMap = create(null); // Synthetic creation of all AOM property descriptors for Custom Elements

    // Synthetic creation of all AOM property descriptors for Custom Elements
    forEach.call(AriaPropertyNames, function (propName) {
      var attrName = StringToLowerCase.call(StringReplace.call(propName, /^aria/, function () {
        return 'aria-';
      }));
      AriaAttrNameToPropNameMap[attrName] = propName;
      AriaPropNameToAttrNameMap[propName] = attrName;
    });
    return {
      AriaAttrNameToPropNameMap: AriaAttrNameToPropNameMap,
      AriaPropNameToAttrNameMap: AriaPropNameToAttrNameMap
    };
  }(),
      AriaPropNameToAttrNameMap = _ref.AriaPropNameToAttrNameMap;
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
  var KEY__SHADOW_TOKEN = '$shadowToken$';
  var KEY__SYNTHETIC_MODE = '$$lwc-synthetic-mode';
  var KEY__SCOPED_CSS = '$scoped$';
  /**
   * Map composed of properties to attributes not following the HTML property to attribute mapping
   * convention.
   */

  var NO_STANDARD_PROPERTY_ATTRIBUTE_MAPPING = new Map([['accessKey', 'accesskey'], ['readOnly', 'readonly'], ['tabIndex', 'tabindex'], ['bgColor', 'bgcolor'], ['colSpan', 'colspan'], ['rowSpan', 'rowspan'], ['contentEditable', 'contenteditable'], ['crossOrigin', 'crossorigin'], ['dateTime', 'datetime'], ['formAction', 'formaction'], ['isMap', 'ismap'], ['maxLength', 'maxlength'], ['minLength', 'minlength'], ['noValidate', 'novalidate'], ['useMap', 'usemap'], ['htmlFor', 'for']]);
  /**
   * Map associating previously transformed HTML property into HTML attribute.
   */

  var CACHED_PROPERTY_ATTRIBUTE_MAPPING = new Map();

  function htmlPropertyToAttribute(propName) {
    var ariaAttributeName = AriaPropNameToAttrNameMap[propName];

    if (!isUndefined$1(ariaAttributeName)) {
      return ariaAttributeName;
    }

    var specialAttributeName = NO_STANDARD_PROPERTY_ATTRIBUTE_MAPPING.get(propName);

    if (!isUndefined$1(specialAttributeName)) {
      return specialAttributeName;
    }

    var cachedAttributeName = CACHED_PROPERTY_ATTRIBUTE_MAPPING.get(propName);

    if (!isUndefined$1(cachedAttributeName)) {
      return cachedAttributeName;
    }

    var attributeName = '';

    for (var _i = 0, len = propName.length; _i < len; _i++) {
      var code = StringCharCodeAt.call(propName, _i);

      if (code >= 65 && // "A"
      code <= 90 // "Z"
      ) {
        attributeName += '-' + StringFromCharCode(code + 32);
      } else {
        attributeName += StringFromCharCode(code);
      }
    }

    CACHED_PROPERTY_ATTRIBUTE_MAPPING.set(propName, attributeName);
    return attributeName;
  }

  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // Increment whenever the LWC template compiler changes

  var LWC_VERSION = "2.11.8";
  var LWC_VERSION_COMMENT_REGEX = /\/\*LWC compiler v([\d.]+)\*\/\s*}/;
  /** version: 2.11.8 */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function detect(propName) {
    return Object.getOwnPropertyDescriptor(Element.prototype, propName) === undefined;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var nodeToAriaPropertyValuesMap = new WeakMap();

  function getAriaPropertyMap(elm) {
    var map = nodeToAriaPropertyValuesMap.get(elm);

    if (map === undefined) {
      map = {};
      nodeToAriaPropertyValuesMap.set(elm, map);
    }

    return map;
  }

  function getNormalizedAriaPropertyValue(value) {
    return value == null ? null : String(value);
  }

  function createAriaPropertyPropertyDescriptor(propName, attrName) {
    return {
      get: function get() {
        var map = getAriaPropertyMap(this);

        if (hasOwnProperty$1.call(map, propName)) {
          return map[propName];
        } // otherwise just reflect what's in the attribute


        return this.hasAttribute(attrName) ? this.getAttribute(attrName) : null;
      },
      set: function set(newValue) {
        var normalizedValue = getNormalizedAriaPropertyValue(newValue);
        var map = getAriaPropertyMap(this);
        map[propName] = normalizedValue; // reflect into the corresponding attribute

        if (newValue === null) {
          this.removeAttribute(attrName);
        } else {
          this.setAttribute(attrName, newValue);
        }
      },
      configurable: true,
      enumerable: true
    };
  }

  function patch$1(propName) {
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    var attrName = AriaPropNameToAttrNameMap[propName];
    var descriptor = createAriaPropertyPropertyDescriptor(propName, attrName);
    Object.defineProperty(Element.prototype, propName, descriptor);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var ElementPrototypeAriaPropertyNames = keys(AriaPropNameToAttrNameMap);

  for (var _i2 = 0, len = ElementPrototypeAriaPropertyNames.length; _i2 < len; _i2 += 1) {
    var propName = ElementPrototypeAriaPropertyNames[_i2];

    if (detect(propName)) {
      patch$1(propName);
    }
  }
  /**
   * Copyright (C) 2018 salesforce.com, inc.
   */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var features = {
    ENABLE_ELEMENT_PATCH: null,
    ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: null,
    ENABLE_HMR: null,
    ENABLE_HTML_COLLECTIONS_PATCH: null,
    ENABLE_INNER_OUTER_TEXT_PATCH: null,
    ENABLE_MIXED_SHADOW_MODE: null,
    ENABLE_NODE_LIST_PATCH: null,
    ENABLE_NODE_PATCH: null,
    ENABLE_REACTIVE_SETTER: null,
    ENABLE_WIRE_SYNC_EMIT: null
  };

  if (!_globalThis.lwcRuntimeFlags) {
    Object.defineProperty(_globalThis, 'lwcRuntimeFlags', {
      value: create(null)
    });
  }

  var runtimeFlags = _globalThis.lwcRuntimeFlags;
  /**
   * Set the value at runtime of a given feature flag. This method only be invoked once per feature
   * flag. It is meant to be used during the app initialization.
   */

  function setFeatureFlag(name, value) {
    if (!isBoolean(value)) {
      var message = "Failed to set the value \"".concat(value, "\" for the runtime feature flag \"").concat(name, "\". Runtime feature flags can only be set to a boolean value.");

      if (process.env.NODE_ENV !== 'production') {
        throw new TypeError(message);
      } else {
        // eslint-disable-next-line no-console
        console.error(message);
        return;
      }
    }

    if (isUndefined$1(features[name])) {
      var availableFlags = keys(features).map(function (name) {
        return "\"".concat(name, "\"");
      }).join(', '); // eslint-disable-next-line no-console

      console.warn("Failed to set the value \"".concat(value, "\" for the runtime feature flag \"").concat(name, "\" because it is undefined. Available flags: ").concat(availableFlags, "."));
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      // Allow the same flag to be set more than once outside of production to enable testing
      runtimeFlags[name] = value;
    } else {
      // Disallow the same flag to be set more than once in production
      var runtimeValue = runtimeFlags[name];

      if (!isUndefined$1(runtimeValue)) {
        // eslint-disable-next-line no-console
        console.error("Failed to set the value \"".concat(value, "\" for the runtime feature flag \"").concat(name, "\". \"").concat(name, "\" has already been set with the value \"").concat(runtimeValue, "\"."));
        return;
      }

      defineProperty(runtimeFlags, name, {
        value: value
      });
    }
  }
  /**
   * Set the value at runtime of a given feature flag. This method should only be used for testing
   * purposes. It is a no-op when invoked in production mode.
   */


  function setFeatureFlagForTest(name, value) {
    if (process.env.NODE_ENV !== 'production') {
      setFeatureFlag(name, value);
    }
  }
  /** version: 2.11.8 */

  /* proxy-compat-disable */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var nextTickCallbackQueue = [];
  var SPACE_CHAR = 32;
  var EmptyObject = seal(create(null));
  var EmptyArray = seal([]);

  function flushCallbackQueue() {
    if (process.env.NODE_ENV !== 'production') {
      if (nextTickCallbackQueue.length === 0) {
        throw new Error("Internal Error: If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue.");
      }
    }

    var callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue

    for (var _i3 = 0, _len = callbacks.length; _i3 < _len; _i3 += 1) {
      callbacks[_i3]();
    }
  }

  function addCallbackToNextTick(callback) {
    if (process.env.NODE_ENV !== 'production') {
      if (!isFunction$1(callback)) {
        throw new Error("Internal Error: addCallbackToNextTick() can only accept a function callback");
      }
    }

    if (nextTickCallbackQueue.length === 0) {
      Promise.resolve().then(flushCallbackQueue);
    }

    ArrayPush$1.call(nextTickCallbackQueue, callback);
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  } // Borrowed from Vue template compiler.
  // https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16


  var DECLARATION_DELIMITER = /;(?![^(]*\))/g;
  var PROPERTY_DELIMITER = /:(.+)/;

  function parseStyleText(cssText) {
    var styleMap = {};
    var declarations = cssText.split(DECLARATION_DELIMITER);

    var _iterator = _createForOfIteratorHelper(declarations),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var declaration = _step.value;

        if (declaration) {
          var _declaration$split = declaration.split(PROPERTY_DELIMITER),
              _declaration$split2 = _slicedToArray(_declaration$split, 2),
              prop = _declaration$split2[0],
              value = _declaration$split2[1];

          if (prop !== undefined && value !== undefined) {
            styleMap[prop.trim()] = value.trim();
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return styleMap;
  } // Make a shallow copy of an object but omit the given key


  function cloneAndOmitKey(object, keyToOmit) {
    var result = {};

    for (var _i4 = 0, _Object$keys = Object.keys(object); _i4 < _Object$keys.length; _i4++) {
      var key = _Object$keys[_i4];

      if (key !== keyToOmit) {
        result[key] = object[key];
      }
    }

    return result;
  }

  function flattenStylesheets(stylesheets) {
    var list = [];

    var _iterator2 = _createForOfIteratorHelper(stylesheets),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var stylesheet = _step2.value;

        if (!Array.isArray(stylesheet)) {
          list.push(stylesheet);
        } else {
          list.push.apply(list, _toConsumableArray(flattenStylesheets(stylesheet)));
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    return list;
  } //
  // Primitives
  //


  var ssr$1;

  function setSsr(ssrImpl) {
    ssr$1 = ssrImpl;
  }

  var isNativeShadowDefined$1;

  function setIsNativeShadowDefined(isNativeShadowDefinedImpl) {
    isNativeShadowDefined$1 = isNativeShadowDefinedImpl;
  }

  var isSyntheticShadowDefined$1;

  function setIsSyntheticShadowDefined(isSyntheticShadowDefinedImpl) {
    isSyntheticShadowDefined$1 = isSyntheticShadowDefinedImpl;
  }

  var HTMLElementExported$1;

  function setHTMLElement(HTMLElementImpl) {
    HTMLElementExported$1 = HTMLElementImpl;
  }

  var isHydrating$1;

  function setIsHydrating$1(isHydratingImpl) {
    isHydrating$1 = isHydratingImpl;
  }

  var insert$1;

  function setInsert(insertImpl) {
    insert$1 = insertImpl;
  }

  var remove$1;

  function setRemove(removeImpl) {
    remove$1 = removeImpl;
  }

  var createElement$2;

  function setCreateElement(createElementImpl) {
    createElement$2 = createElementImpl;
  }

  var createText$1;

  function setCreateText(createTextImpl) {
    createText$1 = createTextImpl;
  }

  var createComment$1;

  function setCreateComment(createCommentImpl) {
    createComment$1 = createCommentImpl;
  }

  var nextSibling$1;

  function setNextSibling(nextSiblingImpl) {
    nextSibling$1 = nextSiblingImpl;
  }

  var attachShadow$1;

  function setAttachShadow(attachShadowImpl) {
    attachShadow$1 = attachShadowImpl;
  }

  var getProperty$1;

  function setGetProperty(getPropertyImpl) {
    getProperty$1 = getPropertyImpl;
  }

  var setProperty$1;

  function setSetProperty(setPropertyImpl) {
    setProperty$1 = setPropertyImpl;
  }

  var setText$1;

  function setSetText(setTextImpl) {
    setText$1 = setTextImpl;
  }

  var getAttribute$1;

  function setGetAttribute(getAttributeImpl) {
    getAttribute$1 = getAttributeImpl;
  }

  var setAttribute$1;

  function setSetAttribute(setAttributeImpl) {
    setAttribute$1 = setAttributeImpl;
  }

  var removeAttribute$1;

  function setRemoveAttribute(removeAttributeImpl) {
    removeAttribute$1 = removeAttributeImpl;
  }

  var addEventListener$1;

  function setAddEventListener(addEventListenerImpl) {
    addEventListener$1 = addEventListenerImpl;
  }

  var removeEventListener$1;

  function setRemoveEventListener(removeEventListenerImpl) {
    removeEventListener$1 = removeEventListenerImpl;
  }

  var dispatchEvent$1;

  function setDispatchEvent(dispatchEventImpl) {
    dispatchEvent$1 = dispatchEventImpl;
  }

  var getClassList$1;

  function setGetClassList(getClassListImpl) {
    getClassList$1 = getClassListImpl;
  }

  var setCSSStyleProperty$1;

  function setSetCSSStyleProperty(setCSSStylePropertyImpl) {
    setCSSStyleProperty$1 = setCSSStylePropertyImpl;
  }

  var getBoundingClientRect$1;

  function setGetBoundingClientRect(getBoundingClientRectImpl) {
    getBoundingClientRect$1 = getBoundingClientRectImpl;
  }

  var querySelector$1;

  function setQuerySelector(querySelectorImpl) {
    querySelector$1 = querySelectorImpl;
  }

  var querySelectorAll$1;

  function setQuerySelectorAll(querySelectorAllImpl) {
    querySelectorAll$1 = querySelectorAllImpl;
  }

  var getElementsByTagName$1;

  function setGetElementsByTagName(getElementsByTagNameImpl) {
    getElementsByTagName$1 = getElementsByTagNameImpl;
  }

  var getElementsByClassName$1;

  function setGetElementsByClassName(getElementsByClassNameImpl) {
    getElementsByClassName$1 = getElementsByClassNameImpl;
  }

  var getChildren$1;

  function setGetChildren(getChildrenImpl) {
    getChildren$1 = getChildrenImpl;
  }

  var getChildNodes$1;

  function setGetChildNodes(getChildNodesImpl) {
    getChildNodes$1 = getChildNodesImpl;
  }

  var getFirstChild$1;

  function setGetFirstChild(getFirstChildImpl) {
    getFirstChild$1 = getFirstChildImpl;
  }

  var getFirstElementChild$1;

  function setGetFirstElementChild(getFirstElementChildImpl) {
    getFirstElementChild$1 = getFirstElementChildImpl;
  }

  var getLastChild$1;

  function setGetLastChild(getLastChildImpl) {
    getLastChild$1 = getLastChildImpl;
  }

  var getLastElementChild$1;

  function setGetLastElementChild(getLastElementChildImpl) {
    getLastElementChild$1 = getLastElementChildImpl;
  }

  var isConnected$1;

  function setIsConnected(isConnectedImpl) {
    isConnected$1 = isConnectedImpl;
  }

  var insertGlobalStylesheet$1;

  function setInsertGlobalStylesheet(insertGlobalStylesheetImpl) {
    insertGlobalStylesheet$1 = insertGlobalStylesheetImpl;
  }

  var insertStylesheet$1;

  function setInsertStylesheet(insertStylesheetImpl) {
    insertStylesheet$1 = insertStylesheetImpl;
  }

  var assertInstanceOfHTMLElement$1;

  function setAssertInstanceOfHTMLElement(assertInstanceOfHTMLElementImpl) {
    assertInstanceOfHTMLElement$1 = assertInstanceOfHTMLElementImpl;
  }

  var defineCustomElement$1;

  function setDefineCustomElement(defineCustomElementImpl) {
    defineCustomElement$1 = defineCustomElementImpl;
  }

  var getCustomElement$1;

  function setGetCustomElement(getCustomElementImpl) {
    getCustomElement$1 = getCustomElementImpl;
  }
  /*
   * Copyright (c) 2019, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var TargetToReactiveRecordMap = new WeakMap();

  function getReactiveRecord(target) {
    var reactiveRecord = TargetToReactiveRecordMap.get(target);

    if (isUndefined$1(reactiveRecord)) {
      var newRecord = create(null);
      reactiveRecord = newRecord;
      TargetToReactiveRecordMap.set(target, newRecord);
    }

    return reactiveRecord;
  }

  var currentReactiveObserver = null;

  function valueMutated(target, key) {
    var reactiveRecord = TargetToReactiveRecordMap.get(target);

    if (!isUndefined$1(reactiveRecord)) {
      var reactiveObservers = reactiveRecord[key];

      if (!isUndefined$1(reactiveObservers)) {
        for (var _i5 = 0, _len2 = reactiveObservers.length; _i5 < _len2; _i5 += 1) {
          var ro = reactiveObservers[_i5];
          ro.notify();
        }
      }
    }
  }

  function valueObserved(target, key) {
    // We should determine if an active Observing Record is present to track mutations.
    if (currentReactiveObserver === null) {
      return;
    }

    var ro = currentReactiveObserver;
    var reactiveRecord = getReactiveRecord(target);
    var reactiveObservers = reactiveRecord[key];

    if (isUndefined$1(reactiveObservers)) {
      reactiveObservers = [];
      reactiveRecord[key] = reactiveObservers;
    } else if (reactiveObservers[0] === ro) {
      return; // perf optimization considering that most subscriptions will come from the same record
    }

    if (ArrayIndexOf.call(reactiveObservers, ro) === -1) {
      ro.link(reactiveObservers);
    }
  }

  var ReactiveObserver = /*#__PURE__*/function () {
    function ReactiveObserver(callback) {
      _classCallCheck(this, ReactiveObserver);

      this.listeners = [];
      this.callback = callback;
    }

    _createClass(ReactiveObserver, [{
      key: "observe",
      value: function observe(job) {
        var inceptionReactiveRecord = currentReactiveObserver;
        currentReactiveObserver = this;
        var error;

        try {
          job();
        } catch (e) {
          error = Object(e);
        } finally {
          currentReactiveObserver = inceptionReactiveRecord;

          if (error !== undefined) {
            throw error; // eslint-disable-line no-unsafe-finally
          }
        }
      }
      /**
       * This method is responsible for disconnecting the Reactive Observer
       * from any Reactive Record that has a reference to it, to prevent future
       * notifications about previously recorded access.
       */

    }, {
      key: "reset",
      value: function reset() {
        var listeners = this.listeners;
        var len = listeners.length;

        if (len > 0) {
          for (var _i6 = 0; _i6 < len; _i6 += 1) {
            var set = listeners[_i6];
            var pos = ArrayIndexOf.call(listeners[_i6], this);
            ArraySplice.call(set, pos, 1);
          }

          listeners.length = 0;
        }
      } // friend methods

    }, {
      key: "notify",
      value: function notify() {
        this.callback.call(undefined, this);
      }
    }, {
      key: "link",
      value: function link(reactiveObservers) {
        ArrayPush$1.call(reactiveObservers, this); // we keep track of observing records where the observing record was added to so we can do some clean up later on

        ArrayPush$1.call(this.listeners, reactiveObservers);
      }
    }]);

    return ReactiveObserver;
  }();
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function componentValueMutated(vm, key) {
    valueMutated(vm.component, key);
  }

  function componentValueObserved(vm, key) {
    valueObserved(vm.component, key);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getComponentTag(vm) {
    return "<".concat(StringToLowerCase.call(vm.tagName), ">");
  } // TODO [#1695]: Unify getComponentStack and getErrorComponentStack


  function getComponentStack(vm) {
    var stack = [];
    var prefix = '';

    while (!isNull(vm.owner)) {
      ArrayPush$1.call(stack, prefix + getComponentTag(vm));
      vm = vm.owner;
      prefix += '\t';
    }

    return ArrayJoin.call(stack, '\n');
  }

  function getErrorComponentStack(vm) {
    var wcStack = [];
    var currentVm = vm;

    while (!isNull(currentVm)) {
      ArrayPush$1.call(wcStack, getComponentTag(currentVm));
      currentVm = currentVm.owner;
    }

    return wcStack.reverse().join('\n\t');
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function addErrorComponentStack(vm, error) {
    if (!isFrozen(error) && isUndefined$1(error.wcStack)) {
      var wcStack = getErrorComponentStack(vm);
      defineProperty(error, 'wcStack', {
        get: function get() {
          return wcStack;
        }
      });
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function log(method, message, vm) {
    var msg = "[LWC ".concat(method, "]: ").concat(message);

    if (!isUndefined$1(vm)) {
      msg = "".concat(msg, "\n").concat(getComponentStack(vm));
    }

    if (process.env.NODE_ENV === 'test') {
      /* eslint-disable-next-line no-console */
      console[method](msg);
      return;
    }

    try {
      throw new Error(msg);
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console[method](e);
    }
  }

  function logError(message, vm) {
    log('error', message, vm);
  }

  function logWarn(message, vm) {
    log('warn', message, vm);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // This is a temporary workaround to get the @lwc/engine-server to evaluate in node without having
  // to inject at runtime.


  var HTMLElementConstructor$1 = typeof HTMLElement !== 'undefined' ? HTMLElement : function () {};
  var HTMLElementPrototype = HTMLElementConstructor$1.prototype;
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // These properties get added to LWCElement.prototype publicProps automatically

  var defaultDefHTMLPropertyNames = ['accessKey', 'dir', 'draggable', 'hidden', 'id', 'lang', 'spellcheck', 'tabIndex', 'title'];

  function offsetPropertyErrorMessage(name) {
    return "Using the `".concat(name, "` property is an anti-pattern because it rounds the value to an integer. Instead, use the `getBoundingClientRect` method to obtain fractional values for the size of an element and its position relative to the viewport.");
  } // Global HTML Attributes & Properties
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement


  var globalHTMLProperties = assign(create(null), {
    accessKey: {
      attribute: 'accesskey'
    },
    accessKeyLabel: {
      readOnly: true
    },
    className: {
      attribute: 'class',
      error: 'Using the `className` property is an anti-pattern because of slow runtime behavior and potential conflicts with classes provided by the owner element. Use the `classList` API instead.'
    },
    contentEditable: {
      attribute: 'contenteditable'
    },
    dataset: {
      readOnly: true,
      error: "Using the `dataset` property is an anti-pattern because it can't be statically analyzed. Expose each property individually using the `@api` decorator instead."
    },
    dir: {
      attribute: 'dir'
    },
    draggable: {
      attribute: 'draggable'
    },
    dropzone: {
      attribute: 'dropzone',
      readOnly: true
    },
    hidden: {
      attribute: 'hidden'
    },
    id: {
      attribute: 'id'
    },
    inputMode: {
      attribute: 'inputmode'
    },
    lang: {
      attribute: 'lang'
    },
    slot: {
      attribute: 'slot',
      error: 'Using the `slot` property is an anti-pattern.'
    },
    spellcheck: {
      attribute: 'spellcheck'
    },
    style: {
      attribute: 'style'
    },
    tabIndex: {
      attribute: 'tabindex'
    },
    title: {
      attribute: 'title'
    },
    translate: {
      attribute: 'translate'
    },
    // additional "global attributes" that are not present in the link above.
    isContentEditable: {
      readOnly: true
    },
    offsetHeight: {
      readOnly: true,
      error: offsetPropertyErrorMessage('offsetHeight')
    },
    offsetLeft: {
      readOnly: true,
      error: offsetPropertyErrorMessage('offsetLeft')
    },
    offsetParent: {
      readOnly: true
    },
    offsetTop: {
      readOnly: true,
      error: offsetPropertyErrorMessage('offsetTop')
    },
    offsetWidth: {
      readOnly: true,
      error: offsetPropertyErrorMessage('offsetWidth')
    },
    role: {
      attribute: 'role'
    }
  });
  var controlledElement = null;
  var controlledAttributeName;

  function isAttributeLocked(elm, attrName) {
    return elm !== controlledElement || attrName !== controlledAttributeName;
  }

  function lockAttribute(_elm, _key) {
    controlledElement = null;
    controlledAttributeName = undefined;
  }

  function unlockAttribute(elm, key) {
    controlledElement = elm;
    controlledAttributeName = key;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * This is a descriptor map that contains
   * all standard properties that a Custom Element can support (including AOM properties), which
   * determines what kind of capabilities the Base HTML Element and
   * Base Lightning Element should support.
   */


  var HTMLElementOriginalDescriptors = create(null);
  forEach.call(keys(AriaPropNameToAttrNameMap), function (propName) {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
    var descriptor = getPropertyDescriptor(HTMLElementPrototype, propName);

    if (!isUndefined$1(descriptor)) {
      HTMLElementOriginalDescriptors[propName] = descriptor;
    }
  });
  forEach.call(defaultDefHTMLPropertyNames, function (propName) {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
    // this category, so, better to be sure.
    var descriptor = getPropertyDescriptor(HTMLElementPrototype, propName);

    if (!isUndefined$1(descriptor)) {
      HTMLElementOriginalDescriptors[propName] = descriptor;
    }
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function generateDataDescriptor(options) {
    return assign({
      configurable: true,
      enumerable: true,
      writable: true
    }, options);
  }

  function generateAccessorDescriptor(options) {
    return assign({
      configurable: true,
      enumerable: true
    }, options);
  }

  var isDomMutationAllowed = false;

  function unlockDomMutation() {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    isDomMutationAllowed = true;
  }

  function lockDomMutation() {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    isDomMutationAllowed = false;
  }

  function logMissingPortalError(name, type) {
    return logError("The `".concat(name, "` ").concat(type, " is available only on elements that use the `lwc:dom=\"manual\"` directive."));
  }

  function patchElementWithRestrictions(elm, options) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML');
    var descriptors = {
      outerHTML: generateAccessorDescriptor({
        get: function get() {
          return originalOuterHTMLDescriptor.get.call(this);
        },
        set: function set(_value) {
          throw new TypeError("Invalid attempt to set outerHTML on Element.");
        }
      })
    }; // Apply extra restriction related to DOM manipulation if the element is not a portal.

    if (!options.isLight && !options.isPortal) {
      var _appendChild = elm.appendChild,
          _insertBefore = elm.insertBefore,
          _removeChild = elm.removeChild,
          _replaceChild = elm.replaceChild;
      var originalNodeValueDescriptor = getPropertyDescriptor(elm, 'nodeValue');
      var originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML');
      var originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent');
      assign(descriptors, {
        appendChild: generateDataDescriptor({
          value: function value(aChild) {
            logMissingPortalError('appendChild', 'method');
            return _appendChild.call(this, aChild);
          }
        }),
        insertBefore: generateDataDescriptor({
          value: function value(newNode, referenceNode) {
            if (!isDomMutationAllowed) {
              logMissingPortalError('insertBefore', 'method');
            }

            return _insertBefore.call(this, newNode, referenceNode);
          }
        }),
        removeChild: generateDataDescriptor({
          value: function value(aChild) {
            if (!isDomMutationAllowed) {
              logMissingPortalError('removeChild', 'method');
            }

            return _removeChild.call(this, aChild);
          }
        }),
        replaceChild: generateDataDescriptor({
          value: function value(newChild, oldChild) {
            logMissingPortalError('replaceChild', 'method');
            return _replaceChild.call(this, newChild, oldChild);
          }
        }),
        nodeValue: generateAccessorDescriptor({
          get: function get() {
            return originalNodeValueDescriptor.get.call(this);
          },
          set: function set(value) {
            if (!isDomMutationAllowed) {
              logMissingPortalError('nodeValue', 'property');
            }

            originalNodeValueDescriptor.set.call(this, value);
          }
        }),
        textContent: generateAccessorDescriptor({
          get: function get() {
            return originalTextContentDescriptor.get.call(this);
          },
          set: function set(value) {
            logMissingPortalError('textContent', 'property');
            originalTextContentDescriptor.set.call(this, value);
          }
        }),
        innerHTML: generateAccessorDescriptor({
          get: function get() {
            return originalInnerHTMLDescriptor.get.call(this);
          },
          set: function set(value) {
            logMissingPortalError('innerHTML', 'property');
            return originalInnerHTMLDescriptor.set.call(this, value);
          }
        })
      });
    }

    defineProperties(elm, descriptors);
  }

  function getShadowRootRestrictionsDescriptors(sr) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    } // Disallowing properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running with synthetic shadow.


    var originalAddEventListener = sr.addEventListener;
    var originalInnerHTMLDescriptor = getPropertyDescriptor(sr, 'innerHTML');
    var originalTextContentDescriptor = getPropertyDescriptor(sr, 'textContent');
    return {
      innerHTML: generateAccessorDescriptor({
        get: function get() {
          return originalInnerHTMLDescriptor.get.call(this);
        },
        set: function set(_value) {
          throw new TypeError("Invalid attempt to set innerHTML on ShadowRoot.");
        }
      }),
      textContent: generateAccessorDescriptor({
        get: function get() {
          return originalTextContentDescriptor.get.call(this);
        },
        set: function set(_value) {
          throw new TypeError("Invalid attempt to set textContent on ShadowRoot.");
        }
      }),
      addEventListener: generateDataDescriptor({
        value: function value(type, listener, options) {
          // TODO [#420]: this is triggered when the component author attempts to add a listener
          // programmatically into its Component's shadow root
          if (!isUndefined$1(options)) {
            logError('The `addEventListener` method on ShadowRoot does not support any options.', getAssociatedVMIfPresent(this));
          } // Typescript does not like it when you treat the `arguments` object as an array
          // @ts-ignore type-mismatch


          return originalAddEventListener.apply(this, arguments);
        }
      })
    };
  } // Custom Elements Restrictions:
  // -----------------------------


  function getCustomElementRestrictionsDescriptors(elm) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var originalAddEventListener = elm.addEventListener;
    var originalInnerHTMLDescriptor = getPropertyDescriptor(elm, 'innerHTML');
    var originalOuterHTMLDescriptor = getPropertyDescriptor(elm, 'outerHTML');
    var originalTextContentDescriptor = getPropertyDescriptor(elm, 'textContent');
    return {
      innerHTML: generateAccessorDescriptor({
        get: function get() {
          return originalInnerHTMLDescriptor.get.call(this);
        },
        set: function set(_value) {
          throw new TypeError("Invalid attempt to set innerHTML on HTMLElement.");
        }
      }),
      outerHTML: generateAccessorDescriptor({
        get: function get() {
          return originalOuterHTMLDescriptor.get.call(this);
        },
        set: function set(_value) {
          throw new TypeError("Invalid attempt to set outerHTML on HTMLElement.");
        }
      }),
      textContent: generateAccessorDescriptor({
        get: function get() {
          return originalTextContentDescriptor.get.call(this);
        },
        set: function set(_value) {
          throw new TypeError("Invalid attempt to set textContent on HTMLElement.");
        }
      }),
      addEventListener: generateDataDescriptor({
        value: function value(type, listener, options) {
          // TODO [#420]: this is triggered when the component author attempts to add a listener
          // programmatically into a lighting element node
          if (!isUndefined$1(options)) {
            logError('The `addEventListener` method in `LightningElement` does not support any options.', getAssociatedVMIfPresent(this));
          } // Typescript does not like it when you treat the `arguments` object as an array
          // @ts-ignore type-mismatch


          return originalAddEventListener.apply(this, arguments);
        }
      })
    };
  }

  function getComponentRestrictionsDescriptors() {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    return {
      tagName: generateAccessorDescriptor({
        get: function get() {
          throw new Error("Usage of property `tagName` is disallowed because the component itself does" + " not know which tagName will be used to create the element, therefore writing" + " code that check for that value is error prone.");
        },
        configurable: true,
        enumerable: false // no enumerable properties on component

      })
    };
  }

  function getLightningElementPrototypeRestrictionsDescriptors(proto) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var originalDispatchEvent = proto.dispatchEvent;
    var descriptors = {
      dispatchEvent: generateDataDescriptor({
        value: function value(event) {
          var vm = getAssociatedVM(this);

          if (!isNull(event) && isObject(event)) {
            var type = event.type;

            if (!/^[a-z][a-z0-9_]*$/.test(type)) {
              logError("Invalid event type \"".concat(type, "\" dispatched in element ").concat(getComponentTag(vm), ".") + " Event name must start with a lowercase letter and followed only lowercase" + " letters, numbers, and underscores", vm);
            }
          } // Typescript does not like it when you treat the `arguments` object as an array
          // @ts-ignore type-mismatch


          return originalDispatchEvent.apply(this, arguments);
        }
      })
    };
    forEach.call(getOwnPropertyNames$1(globalHTMLProperties), function (propName) {
      if (propName in proto) {
        return; // no need to redefine something that we are already exposing
      }

      descriptors[propName] = generateAccessorDescriptor({
        get: function get() {
          var _globalHTMLProperties = globalHTMLProperties[propName],
              error = _globalHTMLProperties.error,
              attribute = _globalHTMLProperties.attribute;
          var msg = [];
          msg.push("Accessing the global HTML property \"".concat(propName, "\" is disabled."));

          if (error) {
            msg.push(error);
          } else if (attribute) {
            msg.push("Instead access it via `this.getAttribute(\"".concat(attribute, "\")`."));
          }

          logError(msg.join('\n'), getAssociatedVM(this));
        },
        set: function set() {
          var readOnly = globalHTMLProperties[propName].readOnly;

          if (readOnly) {
            logError("The global HTML property `".concat(propName, "` is read-only."), getAssociatedVM(this));
          }
        }
      });
    });
    return descriptors;
  } // This routine will prevent access to certain properties on a shadow root instance to guarantee
  // that all components will work fine in IE11 and other browsers without shadow dom support.


  function patchShadowRootWithRestrictions(sr) {
    defineProperties(sr, getShadowRootRestrictionsDescriptors(sr));
  }

  function patchCustomElementWithRestrictions(elm) {
    var restrictionsDescriptors = getCustomElementRestrictionsDescriptors(elm);
    var elmProto = getPrototypeOf$1(elm);
    setPrototypeOf(elm, create(elmProto, restrictionsDescriptors));
  }

  function patchComponentWithRestrictions(cmp) {
    defineProperties(cmp, getComponentRestrictionsDescriptors());
  }

  function patchLightningElementPrototypeWithRestrictions(proto) {
    defineProperties(proto, getLightningElementPrototypeRestrictionsDescriptors(proto));
  }
  /**
   * Copyright (C) 2017 salesforce.com, inc.
   */


  var isArray = Array.isArray;
  var ObjectDotPrototype = Object.prototype,
      _getPrototypeOf = Object.getPrototypeOf,
      ObjectCreate = Object.create,
      ObjectDefineProperty = Object.defineProperty,
      _isExtensible = Object.isExtensible,
      _getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
      getOwnPropertyNames = Object.getOwnPropertyNames,
      getOwnPropertySymbols = Object.getOwnPropertySymbols,
      _preventExtensions = Object.preventExtensions,
      hasOwnProperty = Object.hasOwnProperty;
  var _Array$prototype2 = Array.prototype,
      ArrayPush = _Array$prototype2.push,
      ArrayConcat = _Array$prototype2.concat;
  var OtS = {}.toString;

  function toString(obj) {
    if (obj && obj.toString) {
      return obj.toString();
    } else if (_typeof(obj) === 'object') {
      return OtS.call(obj);
    } else {
      return obj + '';
    }
  }

  function isUndefined(obj) {
    return obj === undefined;
  }

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  var proxyToValueMap = new WeakMap();

  function registerProxy(proxy, value) {
    proxyToValueMap.set(proxy, value);
  }

  var unwrap$1 = function unwrap$1(replicaOrAny) {
    return proxyToValueMap.get(replicaOrAny) || replicaOrAny;
  };

  var BaseProxyHandler = /*#__PURE__*/function () {
    function BaseProxyHandler(membrane, value) {
      _classCallCheck(this, BaseProxyHandler);

      this.originalTarget = value;
      this.membrane = membrane;
    } // Shared utility methods


    _createClass(BaseProxyHandler, [{
      key: "wrapDescriptor",
      value: function wrapDescriptor(descriptor) {
        if (hasOwnProperty.call(descriptor, 'value')) {
          descriptor.value = this.wrapValue(descriptor.value);
        } else {
          var originalSet = descriptor.set,
              originalGet = descriptor.get;

          if (!isUndefined(originalGet)) {
            descriptor.get = this.wrapGetter(originalGet);
          }

          if (!isUndefined(originalSet)) {
            descriptor.set = this.wrapSetter(originalSet);
          }
        }

        return descriptor;
      }
    }, {
      key: "copyDescriptorIntoShadowTarget",
      value: function copyDescriptorIntoShadowTarget(shadowTarget, key) {
        var originalTarget = this.originalTarget; // Note: a property might get defined multiple times in the shadowTarget
        //       but it will always be compatible with the previous descriptor
        //       to preserve the object invariants, which makes these lines safe.

        var originalDescriptor = _getOwnPropertyDescriptor(originalTarget, key); // TODO: it should be impossible for the originalDescriptor to ever be undefined, this `if` can be removed

        /* istanbul ignore else */


        if (!isUndefined(originalDescriptor)) {
          var wrappedDesc = this.wrapDescriptor(originalDescriptor);
          ObjectDefineProperty(shadowTarget, key, wrappedDesc);
        }
      }
    }, {
      key: "lockShadowTarget",
      value: function lockShadowTarget(shadowTarget) {
        var _this = this;

        var originalTarget = this.originalTarget;
        var targetKeys = ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
        targetKeys.forEach(function (key) {
          _this.copyDescriptorIntoShadowTarget(shadowTarget, key);
        });
        var tagPropertyKey = this.membrane.tagPropertyKey;

        if (!isUndefined(tagPropertyKey) && !hasOwnProperty.call(shadowTarget, tagPropertyKey)) {
          ObjectDefineProperty(shadowTarget, tagPropertyKey, ObjectCreate(null));
        }

        _preventExtensions(shadowTarget);
      } // Shared Traps
      // TODO: apply() is never called

      /* istanbul ignore next */

    }, {
      key: "apply",
      value: function apply(shadowTarget, thisArg, argArray) {
        /* No op */
      } // TODO: construct() is never called

      /* istanbul ignore next */

    }, {
      key: "construct",
      value: function construct(shadowTarget, argArray, newTarget) {
        /* No op */
      }
    }, {
      key: "get",
      value: function get(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            valueObserved = this.membrane.valueObserved;
        var value = originalTarget[key];
        valueObserved(originalTarget, key);
        return this.wrapValue(value);
      }
    }, {
      key: "has",
      value: function has(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            _this$membrane = this.membrane,
            tagPropertyKey = _this$membrane.tagPropertyKey,
            valueObserved = _this$membrane.valueObserved;
        valueObserved(originalTarget, key); // since key is never going to be undefined, and tagPropertyKey might be undefined
        // we can simply compare them as the second part of the condition.

        return key in originalTarget || key === tagPropertyKey;
      }
    }, {
      key: "ownKeys",
      value: function ownKeys(shadowTarget) {
        var originalTarget = this.originalTarget,
            tagPropertyKey = this.membrane.tagPropertyKey; // if the membrane tag key exists and it is not in the original target, we add it to the keys.

        var keys = isUndefined(tagPropertyKey) || hasOwnProperty.call(originalTarget, tagPropertyKey) ? [] : [tagPropertyKey]; // small perf optimization using push instead of concat to avoid creating an extra array

        ArrayPush.apply(keys, getOwnPropertyNames(originalTarget));
        ArrayPush.apply(keys, getOwnPropertySymbols(originalTarget));
        return keys;
      }
    }, {
      key: "isExtensible",
      value: function isExtensible(shadowTarget) {
        var originalTarget = this.originalTarget; // optimization to avoid attempting to lock down the shadowTarget multiple times

        if (!_isExtensible(shadowTarget)) {
          return false; // was already locked down
        }

        if (!_isExtensible(originalTarget)) {
          this.lockShadowTarget(shadowTarget);
          return false;
        }

        return true;
      }
    }, {
      key: "getPrototypeOf",
      value: function getPrototypeOf(shadowTarget) {
        var originalTarget = this.originalTarget;
        return _getPrototypeOf(originalTarget);
      }
    }, {
      key: "getOwnPropertyDescriptor",
      value: function getOwnPropertyDescriptor(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            _this$membrane2 = this.membrane,
            valueObserved = _this$membrane2.valueObserved,
            tagPropertyKey = _this$membrane2.tagPropertyKey; // keys looked up via getOwnPropertyDescriptor need to be reactive

        valueObserved(originalTarget, key);

        var desc = _getOwnPropertyDescriptor(originalTarget, key);

        if (isUndefined(desc)) {
          if (key !== tagPropertyKey) {
            return undefined;
          } // if the key is the membrane tag key, and is not in the original target,
          // we produce a synthetic descriptor and install it on the shadow target


          desc = {
            value: undefined,
            writable: false,
            configurable: false,
            enumerable: false
          };
          ObjectDefineProperty(shadowTarget, tagPropertyKey, desc);
          return desc;
        }

        if (desc.configurable === false) {
          // updating the descriptor to non-configurable on the shadow
          this.copyDescriptorIntoShadowTarget(shadowTarget, key);
        } // Note: by accessing the descriptor, the key is marked as observed
        // but access to the value, setter or getter (if available) cannot observe
        // mutations, just like regular methods, in which case we just do nothing.


        return this.wrapDescriptor(desc);
      }
    }]);

    return BaseProxyHandler;
  }();

  var getterMap$1 = new WeakMap();
  var setterMap$1 = new WeakMap();
  var reverseGetterMap = new WeakMap();
  var reverseSetterMap = new WeakMap();

  var ReactiveProxyHandler = /*#__PURE__*/function (_BaseProxyHandler) {
    _inherits(ReactiveProxyHandler, _BaseProxyHandler);

    var _super = _createSuper(ReactiveProxyHandler);

    function ReactiveProxyHandler() {
      _classCallCheck(this, ReactiveProxyHandler);

      return _super.apply(this, arguments);
    }

    _createClass(ReactiveProxyHandler, [{
      key: "wrapValue",
      value: function wrapValue(value) {
        return this.membrane.getProxy(value);
      }
    }, {
      key: "wrapGetter",
      value: function wrapGetter(originalGet) {
        var wrappedGetter = getterMap$1.get(originalGet);

        if (!isUndefined(wrappedGetter)) {
          return wrappedGetter;
        }

        var handler = this;

        var get = function get() {
          // invoking the original getter with the original target
          return handler.wrapValue(originalGet.call(unwrap$1(this)));
        };

        getterMap$1.set(originalGet, get);
        reverseGetterMap.set(get, originalGet);
        return get;
      }
    }, {
      key: "wrapSetter",
      value: function wrapSetter(originalSet) {
        var wrappedSetter = setterMap$1.get(originalSet);

        if (!isUndefined(wrappedSetter)) {
          return wrappedSetter;
        }

        var set = function set(v) {
          // invoking the original setter with the original target
          originalSet.call(unwrap$1(this), unwrap$1(v));
        };

        setterMap$1.set(originalSet, set);
        reverseSetterMap.set(set, originalSet);
        return set;
      }
    }, {
      key: "unwrapDescriptor",
      value: function unwrapDescriptor(descriptor) {
        if (hasOwnProperty.call(descriptor, 'value')) {
          // dealing with a data descriptor
          descriptor.value = unwrap$1(descriptor.value);
        } else {
          var set = descriptor.set,
              get = descriptor.get;

          if (!isUndefined(get)) {
            descriptor.get = this.unwrapGetter(get);
          }

          if (!isUndefined(set)) {
            descriptor.set = this.unwrapSetter(set);
          }
        }

        return descriptor;
      }
    }, {
      key: "unwrapGetter",
      value: function unwrapGetter(redGet) {
        var reverseGetter = reverseGetterMap.get(redGet);

        if (!isUndefined(reverseGetter)) {
          return reverseGetter;
        }

        var handler = this;

        var get = function get() {
          // invoking the red getter with the proxy of this
          return unwrap$1(redGet.call(handler.wrapValue(this)));
        };

        getterMap$1.set(get, redGet);
        reverseGetterMap.set(redGet, get);
        return get;
      }
    }, {
      key: "unwrapSetter",
      value: function unwrapSetter(redSet) {
        var reverseSetter = reverseSetterMap.get(redSet);

        if (!isUndefined(reverseSetter)) {
          return reverseSetter;
        }

        var handler = this;

        var set = function set(v) {
          // invoking the red setter with the proxy of this
          redSet.call(handler.wrapValue(this), handler.wrapValue(v));
        };

        setterMap$1.set(set, redSet);
        reverseSetterMap.set(redSet, set);
        return set;
      }
    }, {
      key: "set",
      value: function set(shadowTarget, key, value) {
        var originalTarget = this.originalTarget,
            valueMutated = this.membrane.valueMutated;
        var oldValue = originalTarget[key];

        if (oldValue !== value) {
          originalTarget[key] = value;
          valueMutated(originalTarget, key);
        } else if (key === 'length' && isArray(originalTarget)) {
          // fix for issue #236: push will add the new index, and by the time length
          // is updated, the internal length is already equal to the new length value
          // therefore, the oldValue is equal to the value. This is the forking logic
          // to support this use case.
          valueMutated(originalTarget, key);
        }

        return true;
      }
    }, {
      key: "deleteProperty",
      value: function deleteProperty(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            valueMutated = this.membrane.valueMutated;
        delete originalTarget[key];
        valueMutated(originalTarget, key);
        return true;
      }
    }, {
      key: "setPrototypeOf",
      value: function setPrototypeOf(shadowTarget, prototype) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
          throw new Error("Invalid setPrototypeOf invocation for reactive proxy ".concat(toString(this.originalTarget), ". Prototype of reactive objects cannot be changed."));
        }
      }
    }, {
      key: "preventExtensions",
      value: function preventExtensions(shadowTarget) {
        if (_isExtensible(shadowTarget)) {
          var originalTarget = this.originalTarget;

          _preventExtensions(originalTarget); // if the originalTarget is a proxy itself, it might reject
          // the preventExtension call, in which case we should not attempt to lock down
          // the shadow target.
          // TODO: It should not actually be possible to reach this `if` statement.
          // If a proxy rejects extensions, then calling preventExtensions will throw an error:
          // https://codepen.io/nolanlawson-the-selector/pen/QWMOjbY

          /* istanbul ignore if */


          if (_isExtensible(originalTarget)) {
            return false;
          }

          this.lockShadowTarget(shadowTarget);
        }

        return true;
      }
    }, {
      key: "defineProperty",
      value: function defineProperty(shadowTarget, key, descriptor) {
        var originalTarget = this.originalTarget,
            _this$membrane3 = this.membrane,
            valueMutated = _this$membrane3.valueMutated,
            tagPropertyKey = _this$membrane3.tagPropertyKey;

        if (key === tagPropertyKey && !hasOwnProperty.call(originalTarget, key)) {
          // To avoid leaking the membrane tag property into the original target, we must
          // be sure that the original target doesn't have yet.
          // NOTE: we do not return false here because Object.freeze and equivalent operations
          // will attempt to set the descriptor to the same value, and expect no to throw. This
          // is an small compromise for the sake of not having to diff the descriptors.
          return true;
        }

        ObjectDefineProperty(originalTarget, key, this.unwrapDescriptor(descriptor)); // intentionally testing if false since it could be undefined as well

        if (descriptor.configurable === false) {
          this.copyDescriptorIntoShadowTarget(shadowTarget, key);
        }

        valueMutated(originalTarget, key);
        return true;
      }
    }]);

    return ReactiveProxyHandler;
  }(BaseProxyHandler);

  var getterMap = new WeakMap();
  var setterMap = new WeakMap();

  var ReadOnlyHandler = /*#__PURE__*/function (_BaseProxyHandler2) {
    _inherits(ReadOnlyHandler, _BaseProxyHandler2);

    var _super2 = _createSuper(ReadOnlyHandler);

    function ReadOnlyHandler() {
      _classCallCheck(this, ReadOnlyHandler);

      return _super2.apply(this, arguments);
    }

    _createClass(ReadOnlyHandler, [{
      key: "wrapValue",
      value: function wrapValue(value) {
        return this.membrane.getReadOnlyProxy(value);
      }
    }, {
      key: "wrapGetter",
      value: function wrapGetter(originalGet) {
        var wrappedGetter = getterMap.get(originalGet);

        if (!isUndefined(wrappedGetter)) {
          return wrappedGetter;
        }

        var handler = this;

        var get = function get() {
          // invoking the original getter with the original target
          return handler.wrapValue(originalGet.call(unwrap$1(this)));
        };

        getterMap.set(originalGet, get);
        return get;
      }
    }, {
      key: "wrapSetter",
      value: function wrapSetter(originalSet) {
        var wrappedSetter = setterMap.get(originalSet);

        if (!isUndefined(wrappedSetter)) {
          return wrappedSetter;
        }

        var handler = this;

        var set = function set(v) {
          /* istanbul ignore else */
          if (process.env.NODE_ENV !== 'production') {
            var originalTarget = handler.originalTarget;
            throw new Error("Invalid mutation: Cannot invoke a setter on \"".concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only."));
          }
        };

        setterMap.set(originalSet, set);
        return set;
      }
    }, {
      key: "set",
      value: function set(shadowTarget, key, value) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          var msg = isArray(originalTarget) ? "Invalid mutation: Cannot mutate array at index ".concat(key.toString(), ". Array is read-only.") : "Invalid mutation: Cannot set \"".concat(key.toString(), "\" on \"").concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only.");
          throw new Error(msg);
        }
        /* istanbul ignore next */


        return false;
      }
    }, {
      key: "deleteProperty",
      value: function deleteProperty(shadowTarget, key) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot delete \"".concat(key.toString(), "\" on \"").concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only."));
        }
        /* istanbul ignore next */


        return false;
      }
    }, {
      key: "setPrototypeOf",
      value: function setPrototypeOf(shadowTarget, prototype) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid prototype mutation: Cannot set prototype on \"".concat(originalTarget, "\". \"").concat(originalTarget, "\" prototype is read-only."));
        }
      }
    }, {
      key: "preventExtensions",
      value: function preventExtensions(shadowTarget) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot preventExtensions on ".concat(originalTarget, "\". \"").concat(originalTarget, " is read-only."));
        }
        /* istanbul ignore next */


        return false;
      }
    }, {
      key: "defineProperty",
      value: function defineProperty(shadowTarget, key, descriptor) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot defineProperty \"".concat(key.toString(), "\" on \"").concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only."));
        }
        /* istanbul ignore next */


        return false;
      }
    }]);

    return ReadOnlyHandler;
  }(BaseProxyHandler);

  function extract(objectOrArray) {
    if (isArray(objectOrArray)) {
      return objectOrArray.map(function (item) {
        var original = unwrap$1(item);

        if (original !== item) {
          return extract(original);
        }

        return item;
      });
    }

    var obj = ObjectCreate(_getPrototypeOf(objectOrArray));
    var names = getOwnPropertyNames(objectOrArray);
    return ArrayConcat.call(names, getOwnPropertySymbols(objectOrArray)).reduce(function (seed, key) {
      var item = objectOrArray[key];
      var original = unwrap$1(item);

      if (original !== item) {
        seed[key] = extract(original);
      } else {
        seed[key] = item;
      }

      return seed;
    }, obj);
  }

  var formatter = {
    header: function header(plainOrProxy) {
      var originalTarget = unwrap$1(plainOrProxy); // if originalTarget is falsy or not unwrappable, exit

      if (!originalTarget || originalTarget === plainOrProxy) {
        return null;
      }

      var obj = extract(plainOrProxy);
      return ['object', {
        object: obj
      }];
    },
    hasBody: function hasBody() {
      return false;
    },
    body: function body() {
      return null;
    }
  }; // Inspired from paulmillr/es6-shim
  // https://github.com/paulmillr/es6-shim/blob/master/es6-shim.js#L176-L185

  /* istanbul ignore next */

  function getGlobal() {
    // the only reliable means to get the global object is `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof globalThis !== 'undefined') {
      return globalThis;
    }

    if (typeof self !== 'undefined') {
      return self;
    }

    if (typeof window !== 'undefined') {
      return window;
    }

    if (typeof global !== 'undefined') {
      return global;
    } // Gracefully degrade if not able to locate the global object


    return {};
  }

  function init() {
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var global = getGlobal(); // Custom Formatter for Dev Tools. To enable this, open Chrome Dev Tools
    //  - Go to Settings,
    //  - Under console, select "Enable custom formatters"
    // For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview

    var devtoolsFormatters = global.devtoolsFormatters || [];
    ArrayPush.call(devtoolsFormatters, formatter);
    global.devtoolsFormatters = devtoolsFormatters;
  }
  /* istanbul ignore else */


  if (process.env.NODE_ENV !== 'production') {
    init();
  }

  function defaultValueIsObservable(value) {
    // intentionally checking for null
    if (value === null) {
      return false;
    } // treat all non-object types, including undefined, as non-observable values


    if (_typeof(value) !== 'object') {
      return false;
    }

    if (isArray(value)) {
      return true;
    }

    var proto = _getPrototypeOf(value);

    return proto === ObjectDotPrototype || proto === null || _getPrototypeOf(proto) === null;
  }

  var defaultValueObserved = function defaultValueObserved(obj, key) {
    /* do nothing */
  };

  var defaultValueMutated = function defaultValueMutated(obj, key) {
    /* do nothing */
  };

  function createShadowTarget(value) {
    return isArray(value) ? [] : {};
  }

  var ObservableMembrane = /*#__PURE__*/function () {
    function ObservableMembrane() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, ObservableMembrane);

      this.readOnlyObjectGraph = new WeakMap();
      this.reactiveObjectGraph = new WeakMap();
      var valueMutated = options.valueMutated,
          valueObserved = options.valueObserved,
          valueIsObservable = options.valueIsObservable,
          tagPropertyKey = options.tagPropertyKey;
      this.valueMutated = isFunction(valueMutated) ? valueMutated : defaultValueMutated;
      this.valueObserved = isFunction(valueObserved) ? valueObserved : defaultValueObserved;
      this.valueIsObservable = isFunction(valueIsObservable) ? valueIsObservable : defaultValueIsObservable;
      this.tagPropertyKey = tagPropertyKey;
    }

    _createClass(ObservableMembrane, [{
      key: "getProxy",
      value: function getProxy(value) {
        var unwrappedValue = unwrap$1(value);

        if (this.valueIsObservable(unwrappedValue)) {
          // When trying to extract the writable version of a readonly we return the readonly.
          if (this.readOnlyObjectGraph.get(unwrappedValue) === value) {
            return value;
          }

          return this.getReactiveHandler(unwrappedValue);
        }

        return unwrappedValue;
      }
    }, {
      key: "getReadOnlyProxy",
      value: function getReadOnlyProxy(value) {
        value = unwrap$1(value);

        if (this.valueIsObservable(value)) {
          return this.getReadOnlyHandler(value);
        }

        return value;
      }
    }, {
      key: "unwrapProxy",
      value: function unwrapProxy(p) {
        return unwrap$1(p);
      }
    }, {
      key: "getReactiveHandler",
      value: function getReactiveHandler(value) {
        var proxy = this.reactiveObjectGraph.get(value);

        if (isUndefined(proxy)) {
          // caching the proxy after the first time it is accessed
          var handler = new ReactiveProxyHandler(this, value);
          proxy = new Proxy(createShadowTarget(value), handler);
          registerProxy(proxy, value);
          this.reactiveObjectGraph.set(value, proxy);
        }

        return proxy;
      }
    }, {
      key: "getReadOnlyHandler",
      value: function getReadOnlyHandler(value) {
        var proxy = this.readOnlyObjectGraph.get(value);

        if (isUndefined(proxy)) {
          // caching the proxy after the first time it is accessed
          var handler = new ReadOnlyHandler(this, value);
          proxy = new Proxy(createShadowTarget(value), handler);
          registerProxy(proxy, value);
          this.readOnlyObjectGraph.set(value, proxy);
        }

        return proxy;
      }
    }]);

    return ObservableMembrane;
  }();
  /** version: 2.0.0 */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var lockerLivePropertyKey = Symbol.for('@@lockerLiveValue');
  var reactiveMembrane = new ObservableMembrane({
    valueObserved: valueObserved,
    valueMutated: valueMutated,
    tagPropertyKey: lockerLivePropertyKey
  });
  /**
   * EXPERIMENTAL: This function implements an unwrap mechanism that
   * works for observable membrane objects. This API is subject to
   * change or being removed.
   */

  function unwrap(value) {
    return reactiveMembrane.unwrapProxy(value);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * This operation is called with a descriptor of an standard html property
   * that a Custom Element can support (including AOM properties), which
   * determines what kind of capabilities the Base Lightning Element should support. When producing the new descriptors
   * for the Base Lightning Element, it also include the reactivity bit, so the standard property is reactive.
   */


  function createBridgeToElementDescriptor(propName, descriptor) {
    var _get = descriptor.get,
        _set = descriptor.set,
        enumerable = descriptor.enumerable,
        configurable = descriptor.configurable;

    if (!isFunction$1(_get)) {
      if (process.env.NODE_ENV !== 'production') {
        assert.fail("Detected invalid public property descriptor for HTMLElement.prototype.".concat(propName, " definition. Missing the standard getter."));
      }

      throw new TypeError();
    }

    if (!isFunction$1(_set)) {
      if (process.env.NODE_ENV !== 'production') {
        assert.fail("Detected invalid public property descriptor for HTMLElement.prototype.".concat(propName, " definition. Missing the standard setter."));
      }

      throw new TypeError();
    }

    return {
      enumerable: enumerable,
      configurable: configurable,
      get: function get() {
        var vm = getAssociatedVM(this);

        if (isBeingConstructed(vm)) {
          if (process.env.NODE_ENV !== 'production') {
            logError("The value of property `".concat(propName, "` can't be read from the constructor because the owner component hasn't set the value yet. Instead, use the constructor to set a default value for the property."), vm);
          }

          return;
        }

        componentValueObserved(vm, propName);
        return _get.call(vm.elm);
      },
      set: function set(newValue) {
        var vm = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
          var _vmBeingRendered = getVMBeingRendered();

          assert.invariant(!isInvokingRender, "".concat(_vmBeingRendered, ".render() method has side effects on the state of ").concat(vm, ".").concat(propName));
          assert.invariant(!isUpdatingTemplate, "When updating the template of ".concat(_vmBeingRendered, ", one of the accessors used by the template has side effects on the state of ").concat(vm, ".").concat(propName));
          assert.isFalse(isBeingConstructed(vm), "Failed to construct '".concat(getComponentTag(vm), "': The result must not have attributes."));
          assert.invariant(!isObject(newValue) || isNull(newValue), "Invalid value \"".concat(newValue, "\" for \"").concat(propName, "\" of ").concat(vm, ". Value cannot be an object, must be a primitive value."));
        }

        if (newValue !== vm.cmpProps[propName]) {
          vm.cmpProps[propName] = newValue;
          componentValueMutated(vm, propName);
        }

        return _set.call(vm.elm, newValue);
      }
    };
  }
  /**
   * This class is the base class for any LWC element.
   * Some elements directly extends this class, others implement it via inheritance.
   **/
  // @ts-ignore


  var LightningElement = function LightningElement() {
    // This should be as performant as possible, while any initialization should be done lazily
    if (isNull(vmBeingConstructed)) {
      throw new ReferenceError('Illegal constructor');
    }

    var vm = vmBeingConstructed;
    var def = vm.def,
        elm = vm.elm;
    var bridge = def.bridge;

    if (process.env.NODE_ENV !== 'production') {
      assertInstanceOfHTMLElement$1(vm.elm, "Component creation requires a DOM element to be associated to ".concat(vm, "."));
    }

    var component = this;
    setPrototypeOf(elm, bridge.prototype);
    vm.component = this; // Locker hooks assignment. When the LWC engine run with Locker, Locker intercepts all the new
    // component creation and passes hooks to instrument all the component interactions with the
    // engine. We are intentionally hiding this argument from the formal API of LightningElement
    // because we don't want folks to know about it just yet.

    if (arguments.length === 1) {
      var _arguments$ = arguments[0],
          _callHook = _arguments$.callHook,
          _setHook = _arguments$.setHook,
          _getHook = _arguments$.getHook;
      vm.callHook = _callHook;
      vm.setHook = _setHook;
      vm.getHook = _getHook;
    } // Making the component instance a live value when using Locker to support expandos.


    this[lockerLivePropertyKey] = undefined; // Linking elm, shadow root and component with the VM.

    associateVM(component, vm);
    associateVM(elm, vm);

    if (vm.renderMode === 1
    /* Shadow */
    ) {
      vm.renderRoot = doAttachShadow(vm);
    } else {
      vm.renderRoot = elm;
    } // Adding extra guard rails in DEV mode.


    if (process.env.NODE_ENV !== 'production') {
      patchCustomElementWithRestrictions(elm);
      patchComponentWithRestrictions(component);
    }

    return this;
  };

  function doAttachShadow(vm) {
    var _attachShadow$;

    var elm = vm.elm,
        mode = vm.mode,
        shadowMode = vm.shadowMode,
        ctor = vm.def.ctor;
    var shadowRoot = attachShadow$1(elm, (_attachShadow$ = {}, _defineProperty(_attachShadow$, KEY__SYNTHETIC_MODE, shadowMode === 1), _defineProperty(_attachShadow$, "delegatesFocus", Boolean(ctor.delegatesFocus)), _defineProperty(_attachShadow$, "mode", mode), _attachShadow$));
    vm.shadowRoot = shadowRoot;
    associateVM(shadowRoot, vm);

    if (process.env.NODE_ENV !== 'production') {
      patchShadowRootWithRestrictions(shadowRoot);
    }

    return shadowRoot;
  }

  function warnIfInvokedDuringConstruction(vm, methodOrPropName) {
    if (isBeingConstructed(vm)) {
      logError("this.".concat(methodOrPropName, " should not be called during the construction of the custom element for ").concat(getComponentTag(vm), " because the element is not yet in the DOM or has no children yet."));
    }
  } // @ts-ignore


  LightningElement.prototype = {
    constructor: LightningElement,
    dispatchEvent: function dispatchEvent(event) {
      var _getAssociatedVM = getAssociatedVM(this),
          elm = _getAssociatedVM.elm;

      return dispatchEvent$1(elm, event);
    },
    addEventListener: function addEventListener(type, listener, options) {
      var vm = getAssociatedVM(this);
      var elm = vm.elm;

      if (process.env.NODE_ENV !== 'production') {
        var _vmBeingRendered2 = getVMBeingRendered();

        assert.invariant(!isInvokingRender, "".concat(_vmBeingRendered2, ".render() method has side effects on the state of ").concat(vm, " by adding an event listener for \"").concat(type, "\"."));
        assert.invariant(!isUpdatingTemplate, "Updating the template of ".concat(_vmBeingRendered2, " has side effects on the state of ").concat(vm, " by adding an event listener for \"").concat(type, "\"."));
        assert.invariant(isFunction$1(listener), "Invalid second argument for this.addEventListener() in ".concat(vm, " for event \"").concat(type, "\". Expected an EventListener but received ").concat(listener, "."));
      }

      var wrappedListener = getWrappedComponentsListener(vm, listener);
      addEventListener$1(elm, type, wrappedListener, options);
    },
    removeEventListener: function removeEventListener(type, listener, options) {
      var vm = getAssociatedVM(this);
      var elm = vm.elm;
      var wrappedListener = getWrappedComponentsListener(vm, listener);
      removeEventListener$1(elm, type, wrappedListener, options);
    },
    hasAttribute: function hasAttribute(name) {
      var _getAssociatedVM2 = getAssociatedVM(this),
          elm = _getAssociatedVM2.elm;

      return !isNull(getAttribute$1(elm, name));
    },
    hasAttributeNS: function hasAttributeNS(namespace, name) {
      var _getAssociatedVM3 = getAssociatedVM(this),
          elm = _getAssociatedVM3.elm;

      return !isNull(getAttribute$1(elm, name, namespace));
    },
    removeAttribute: function removeAttribute(name) {
      var _getAssociatedVM4 = getAssociatedVM(this),
          elm = _getAssociatedVM4.elm;

      unlockAttribute(elm, name);
      removeAttribute$1(elm, name);
      lockAttribute();
    },
    removeAttributeNS: function removeAttributeNS(namespace, name) {
      var _getAssociatedVM5 = getAssociatedVM(this),
          elm = _getAssociatedVM5.elm;

      unlockAttribute(elm, name);
      removeAttribute$1(elm, name, namespace);
      lockAttribute();
    },
    getAttribute: function getAttribute(name) {
      var _getAssociatedVM6 = getAssociatedVM(this),
          elm = _getAssociatedVM6.elm;

      return getAttribute$1(elm, name);
    },
    getAttributeNS: function getAttributeNS(namespace, name) {
      var _getAssociatedVM7 = getAssociatedVM(this),
          elm = _getAssociatedVM7.elm;

      return getAttribute$1(elm, name, namespace);
    },
    setAttribute: function setAttribute(name, value) {
      var vm = getAssociatedVM(this);
      var elm = vm.elm;

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), "Failed to construct '".concat(getComponentTag(vm), "': The result must not have attributes."));
      }

      unlockAttribute(elm, name);
      setAttribute$1(elm, name, value);
      lockAttribute();
    },
    setAttributeNS: function setAttributeNS(namespace, name, value) {
      var vm = getAssociatedVM(this);
      var elm = vm.elm;

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), "Failed to construct '".concat(getComponentTag(vm), "': The result must not have attributes."));
      }

      unlockAttribute(elm, name);
      setAttribute$1(elm, name, value, namespace);
      lockAttribute();
    },
    getBoundingClientRect: function getBoundingClientRect() {
      var vm = getAssociatedVM(this);
      var elm = vm.elm;

      if (process.env.NODE_ENV !== 'production') {
        warnIfInvokedDuringConstruction(vm, 'getBoundingClientRect()');
      }

      return getBoundingClientRect$1(elm);
    },

    get isConnected() {
      var _getAssociatedVM8 = getAssociatedVM(this),
          elm = _getAssociatedVM8.elm;

      return isConnected$1(elm);
    },

    get classList() {
      var vm = getAssociatedVM(this);
      var elm = vm.elm;

      if (process.env.NODE_ENV !== 'production') {
        // TODO [#1290]: this still fails in dev but works in production, eventually, we should
        // just throw in all modes
        assert.isFalse(isBeingConstructed(vm), "Failed to construct ".concat(vm, ": The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead."));
      }

      return getClassList$1(elm);
    },

    get template() {
      var vm = getAssociatedVM(this);

      if (process.env.NODE_ENV !== 'production') {
        if (vm.renderMode === 0
        /* Light */
        ) {
          logError('`this.template` returns null for light DOM components. Since there is no shadow, the rendered content can be accessed via `this` itself. e.g. instead of `this.template.querySelector`, use `this.querySelector`.');
        }
      }

      return vm.shadowRoot;
    },

    get shadowRoot() {
      // From within the component instance, the shadowRoot is always reported as "closed".
      // Authors should rely on this.template instead.
      return null;
    },

    render: function render() {
      var vm = getAssociatedVM(this);
      return vm.def.template;
    },
    toString: function toString() {
      var vm = getAssociatedVM(this);
      return "[object ".concat(vm.def.name, "]");
    }
  };
  var queryAndChildGetterDescriptors = create(null); // The reason we don't just call `import * as renderer from '../renderer'` here is that the bundle size
  // is smaller if we reference each function individually. Otherwise Rollup will create one big frozen
  // object representing the renderer, with a lot of methods we don't actually need.

  var childGetters = ['children', 'childNodes', 'firstChild', 'firstElementChild', 'lastChild', 'lastElementChild'];

  function getChildGetter(methodName) {
    switch (methodName) {
      case 'children':
        return getChildren$1;

      case 'childNodes':
        return getChildNodes$1;

      case 'firstChild':
        return getFirstChild$1;

      case 'firstElementChild':
        return getFirstElementChild$1;

      case 'lastChild':
        return getLastChild$1;

      case 'lastElementChild':
        return getLastElementChild$1;
    }
  } // Generic passthrough for child getters on HTMLElement to the relevant Renderer APIs


  var _loop = function _loop() {
    var childGetter = _childGetters[_i7];
    queryAndChildGetterDescriptors[childGetter] = {
      get: function get() {
        var vm = getAssociatedVM(this);
        var elm = vm.elm;

        if (process.env.NODE_ENV !== 'production') {
          warnIfInvokedDuringConstruction(vm, childGetter);
        }

        return getChildGetter(childGetter)(elm);
      },
      configurable: true,
      enumerable: true
    };
  };

  for (var _i7 = 0, _childGetters = childGetters; _i7 < _childGetters.length; _i7++) {
    _loop();
  }

  var queryMethods = ['getElementsByClassName', 'getElementsByTagName', 'querySelector', 'querySelectorAll'];

  function getQueryMethod(methodName) {
    switch (methodName) {
      case 'getElementsByClassName':
        return getElementsByClassName$1;

      case 'getElementsByTagName':
        return getElementsByTagName$1;

      case 'querySelector':
        return querySelector$1;

      case 'querySelectorAll':
        return querySelectorAll$1;
    }
  } // Generic passthrough for query APIs on HTMLElement to the relevant Renderer APIs


  var _loop2 = function _loop2() {
    var queryMethod = _queryMethods[_i8];
    queryAndChildGetterDescriptors[queryMethod] = {
      value: function value(arg) {
        var vm = getAssociatedVM(this);
        var elm = vm.elm;

        if (process.env.NODE_ENV !== 'production') {
          warnIfInvokedDuringConstruction(vm, "".concat(queryMethod, "()"));
        }

        return getQueryMethod(queryMethod)(elm, arg);
      },
      configurable: true,
      enumerable: true,
      writable: true
    };
  };

  for (var _i8 = 0, _queryMethods = queryMethods; _i8 < _queryMethods.length; _i8++) {
    _loop2();
  }

  defineProperties(LightningElement.prototype, queryAndChildGetterDescriptors);
  var lightningBasedDescriptors = create(null);

  for (var _propName in HTMLElementOriginalDescriptors) {
    lightningBasedDescriptors[_propName] = createBridgeToElementDescriptor(_propName, HTMLElementOriginalDescriptors[_propName]);
  }

  defineProperties(LightningElement.prototype, lightningBasedDescriptors);
  defineProperty(LightningElement, 'CustomElementConstructor', {
    get: function get() {
      // If required, a runtime-specific implementation must be defined.
      throw new ReferenceError('The current runtime does not support CustomElementConstructor.');
    },
    configurable: true
  });

  if (process.env.NODE_ENV !== 'production') {
    patchLightningElementPrototypeWithRestrictions(LightningElement.prototype);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * @wire decorator to wire fields and methods to a wire adapter in
   * LWC Components. This function implements the internals of this
   * decorator.
   */


  function wire(_adapter, _config) {
    if (process.env.NODE_ENV !== 'production') {
      assert.fail('@wire(adapter, config?) may only be used as a decorator.');
    }

    throw new Error();
  }

  function internalWireFieldDecorator(key) {
    return {
      get: function get() {
        var vm = getAssociatedVM(this);
        componentValueObserved(vm, key);
        return vm.cmpFields[key];
      },
      set: function set(value) {
        var vm = getAssociatedVM(this);
        /**
         * Reactivity for wired fields is provided in wiring.
         * We intentionally add reactivity here since this is just
         * letting the author to do the wrong thing, but it will keep our
         * system to be backward compatible.
         */

        if (value !== vm.cmpFields[key]) {
          vm.cmpFields[key] = value;
          componentValueMutated(vm, key);
        }
      },
      enumerable: true,
      configurable: true
    };
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function track(target) {
    if (arguments.length === 1) {
      return reactiveMembrane.getProxy(target);
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.fail("@track decorator can only be used with one argument to return a trackable object, or as a decorator function.");
    }

    throw new Error();
  }

  function internalTrackDecorator(key) {
    return {
      get: function get() {
        var vm = getAssociatedVM(this);
        componentValueObserved(vm, key);
        return vm.cmpFields[key];
      },
      set: function set(newValue) {
        var vm = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
          var _vmBeingRendered3 = getVMBeingRendered();

          assert.invariant(!isInvokingRender, "".concat(_vmBeingRendered3, ".render() method has side effects on the state of ").concat(vm, ".").concat(toString$1(key)));
          assert.invariant(!isUpdatingTemplate, "Updating the template of ".concat(_vmBeingRendered3, " has side effects on the state of ").concat(vm, ".").concat(toString$1(key)));
        }

        var reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);

        if (reactiveOrAnyValue !== vm.cmpFields[key]) {
          vm.cmpFields[key] = reactiveOrAnyValue;
          componentValueMutated(vm, key);
        }
      },
      enumerable: true,
      configurable: true
    };
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function api$1() {
    if (process.env.NODE_ENV !== 'production') {
      assert.fail("@api decorator can only be used as a decorator function.");
    }

    throw new Error();
  }

  function createPublicPropertyDescriptor(key) {
    return {
      get: function get() {
        var vm = getAssociatedVM(this);

        if (isBeingConstructed(vm)) {
          if (process.env.NODE_ENV !== 'production') {
            logError("Can\u2019t read the value of property `".concat(toString$1(key), "` from the constructor because the owner component hasn\u2019t set the value yet. Instead, use the constructor to set a default value for the property."), vm);
          }

          return;
        }

        componentValueObserved(vm, key);
        return vm.cmpProps[key];
      },
      set: function set(newValue) {
        var vm = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
          var _vmBeingRendered4 = getVMBeingRendered();

          assert.invariant(!isInvokingRender, "".concat(_vmBeingRendered4, ".render() method has side effects on the state of ").concat(vm, ".").concat(toString$1(key)));
          assert.invariant(!isUpdatingTemplate, "Updating the template of ".concat(_vmBeingRendered4, " has side effects on the state of ").concat(vm, ".").concat(toString$1(key)));
        }

        vm.cmpProps[key] = newValue;
        componentValueMutated(vm, key);
      },
      enumerable: true,
      configurable: true
    };
  }

  var AccessorReactiveObserver = /*#__PURE__*/function (_ReactiveObserver) {
    _inherits(AccessorReactiveObserver, _ReactiveObserver);

    var _super3 = _createSuper(AccessorReactiveObserver);

    function AccessorReactiveObserver(vm, set) {
      var _this2;

      _classCallCheck(this, AccessorReactiveObserver);

      _this2 = _super3.call(this, function () {
        if (isFalse(_this2.debouncing)) {
          _this2.debouncing = true;
          addCallbackToNextTick(function () {
            if (isTrue(_this2.debouncing)) {
              var _assertThisInitialize = _assertThisInitialized(_this2),
                  value = _assertThisInitialize.value;

              var dirtyStateBeforeSetterCall = vm.isDirty,
                  component = vm.component,
                  _idx = vm.idx;
              set.call(component, value); // de-bouncing after the call to the original setter to prevent
              // infinity loop if the setter itself is mutating things that
              // were accessed during the previous invocation.

              _this2.debouncing = false;

              if (isTrue(vm.isDirty) && isFalse(dirtyStateBeforeSetterCall) && _idx > 0) {
                // immediate rehydration due to a setter driven mutation, otherwise
                // the component will get rendered on the second tick, which it is not
                // desirable.
                rerenderVM(vm);
              }
            }
          });
        }
      });
      _this2.debouncing = false;
      return _this2;
    }

    _createClass(AccessorReactiveObserver, [{
      key: "reset",
      value: function reset(value) {
        _get2(_getPrototypeOf2(AccessorReactiveObserver.prototype), "reset", this).call(this);

        this.debouncing = false;

        if (arguments.length > 0) {
          this.value = value;
        }
      }
    }]);

    return AccessorReactiveObserver;
  }(ReactiveObserver);

  function createPublicAccessorDescriptor(key, descriptor) {
    var _get3 = descriptor.get,
        _set2 = descriptor.set,
        enumerable = descriptor.enumerable,
        configurable = descriptor.configurable;

    if (!isFunction$1(_get3)) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction$1(_get3), "Invalid compiler output for public accessor ".concat(toString$1(key), " decorated with @api"));
      }

      throw new Error();
    }

    return {
      get: function get() {
        if (process.env.NODE_ENV !== 'production') {
          // Assert that the this value is an actual Component with an associated VM.
          getAssociatedVM(this);
        }

        return _get3.call(this);
      },
      set: function set(newValue) {
        var _this3 = this;

        var vm = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
          var _vmBeingRendered5 = getVMBeingRendered();

          assert.invariant(!isInvokingRender, "".concat(_vmBeingRendered5, ".render() method has side effects on the state of ").concat(vm, ".").concat(toString$1(key)));
          assert.invariant(!isUpdatingTemplate, "Updating the template of ".concat(_vmBeingRendered5, " has side effects on the state of ").concat(vm, ".").concat(toString$1(key)));
        }

        if (_set2) {
          if (runtimeFlags.ENABLE_REACTIVE_SETTER) {
            var ro = vm.oar[key];

            if (isUndefined$1(ro)) {
              ro = vm.oar[key] = new AccessorReactiveObserver(vm, _set2);
            } // every time we invoke this setter from outside (through this wrapper setter)
            // we should reset the value and then debounce just in case there is a pending
            // invocation the next tick that is not longer relevant since the value is changing
            // from outside.


            ro.reset(newValue);
            ro.observe(function () {
              _set2.call(_this3, newValue);
            });
          } else {
            _set2.call(this, newValue);
          }
        } else if (process.env.NODE_ENV !== 'production') {
          assert.fail("Invalid attempt to set a new value for property ".concat(toString$1(key), " of ").concat(vm, " that does not has a setter decorated with @api."));
        }
      },
      enumerable: enumerable,
      configurable: configurable
    };
  }

  function createObservedFieldPropertyDescriptor(key) {
    return {
      get: function get() {
        var vm = getAssociatedVM(this);
        componentValueObserved(vm, key);
        return vm.cmpFields[key];
      },
      set: function set(newValue) {
        var vm = getAssociatedVM(this);

        if (newValue !== vm.cmpFields[key]) {
          vm.cmpFields[key] = newValue;
          componentValueMutated(vm, key);
        }
      },
      enumerable: true,
      configurable: true
    };
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getClassDescriptorType(descriptor) {
    if (isFunction$1(descriptor.value)) {
      return "method"
      /* Method */
      ;
    } else if (isFunction$1(descriptor.set) || isFunction$1(descriptor.get)) {
      return "accessor"
      /* Accessor */
      ;
    } else {
      return "field"
      /* Field */
      ;
    }
  }

  function validateObservedField(Ctor, fieldName, descriptor) {
    if (!isUndefined$1(descriptor)) {
      var type = getClassDescriptorType(descriptor);
      var message = "Invalid observed ".concat(fieldName, " field. Found a duplicate ").concat(type, " with the same name."); // [W-9927596] Ideally we always throw an error when detecting duplicate observed field.
      // This branch is only here for backward compatibility reasons.

      if (type === "accessor"
      /* Accessor */
      ) {
        logError(message);
      } else {
        assert.fail(message);
      }
    }
  }

  function validateFieldDecoratedWithTrack(Ctor, fieldName, descriptor) {
    if (!isUndefined$1(descriptor)) {
      var type = getClassDescriptorType(descriptor);
      assert.fail("Invalid @track ".concat(fieldName, " field. Found a duplicate ").concat(type, " with the same name."));
    }
  }

  function validateFieldDecoratedWithWire(Ctor, fieldName, descriptor) {
    if (!isUndefined$1(descriptor)) {
      var type = getClassDescriptorType(descriptor);
      assert.fail("Invalid @wire ".concat(fieldName, " field. Found a duplicate ").concat(type, " with the same name."));
    }
  }

  function validateMethodDecoratedWithWire(Ctor, methodName, descriptor) {
    if (isUndefined$1(descriptor) || !isFunction$1(descriptor.value) || isFalse(descriptor.writable)) {
      assert.fail("Invalid @wire ".concat(methodName, " method."));
    }
  }

  function validateFieldDecoratedWithApi(Ctor, fieldName, descriptor) {
    if (!isUndefined$1(descriptor)) {
      var type = getClassDescriptorType(descriptor);
      var message = "Invalid @api ".concat(fieldName, " field. Found a duplicate ").concat(type, " with the same name."); // [W-9927596] Ideally we always throw an error when detecting duplicate public properties.
      // This branch is only here for backward compatibility reasons.

      if (type === "accessor"
      /* Accessor */
      ) {
        logError(message);
      } else {
        assert.fail(message);
      }
    }
  }

  function validateAccessorDecoratedWithApi(Ctor, fieldName, descriptor) {
    if (isUndefined$1(descriptor)) {
      assert.fail("Invalid @api get ".concat(fieldName, " accessor."));
    } else if (isFunction$1(descriptor.set)) {
      assert.isTrue(isFunction$1(descriptor.get), "Missing getter for property ".concat(fieldName, " decorated with @api in ").concat(Ctor, ". You cannot have a setter without the corresponding getter."));
    } else if (!isFunction$1(descriptor.get)) {
      assert.fail("Missing @api get ".concat(fieldName, " accessor."));
    }
  }

  function validateMethodDecoratedWithApi(Ctor, methodName, descriptor) {
    if (isUndefined$1(descriptor) || !isFunction$1(descriptor.value) || isFalse(descriptor.writable)) {
      assert.fail("Invalid @api ".concat(methodName, " method."));
    }
  }
  /**
   * INTERNAL: This function can only be invoked by compiled code. The compiler
   * will prevent this function from being imported by user-land code.
   */


  function registerDecorators(Ctor, meta) {
    var proto = Ctor.prototype;
    var publicProps = meta.publicProps,
        publicMethods = meta.publicMethods,
        wire = meta.wire,
        track = meta.track,
        fields = meta.fields;
    var apiMethods = create(null);
    var apiFields = create(null);
    var wiredMethods = create(null);
    var wiredFields = create(null);
    var observedFields = create(null);
    var apiFieldsConfig = create(null);
    var descriptor;

    if (!isUndefined$1(publicProps)) {
      for (var fieldName in publicProps) {
        var propConfig = publicProps[fieldName];
        apiFieldsConfig[fieldName] = propConfig.config;
        descriptor = getOwnPropertyDescriptor$1(proto, fieldName);

        if (propConfig.config > 0) {
          // accessor declaration
          if (process.env.NODE_ENV !== 'production') {
            validateAccessorDecoratedWithApi(Ctor, fieldName, descriptor);
          }

          if (isUndefined$1(descriptor)) {
            throw new Error();
          }

          descriptor = createPublicAccessorDescriptor(fieldName, descriptor);
        } else {
          // field declaration
          if (process.env.NODE_ENV !== 'production') {
            validateFieldDecoratedWithApi(Ctor, fieldName, descriptor);
          } // [W-9927596] If a component has both a public property and a private setter/getter
          // with the same name, the property is defined as a public accessor. This branch is
          // only here for backward compatibility reasons.


          if (!isUndefined$1(descriptor) && !isUndefined$1(descriptor.get)) {
            descriptor = createPublicAccessorDescriptor(fieldName, descriptor);
          } else {
            descriptor = createPublicPropertyDescriptor(fieldName);
          }
        }

        apiFields[fieldName] = descriptor;
        defineProperty(proto, fieldName, descriptor);
      }
    }

    if (!isUndefined$1(publicMethods)) {
      forEach.call(publicMethods, function (methodName) {
        descriptor = getOwnPropertyDescriptor$1(proto, methodName);

        if (process.env.NODE_ENV !== 'production') {
          validateMethodDecoratedWithApi(Ctor, methodName, descriptor);
        }

        if (isUndefined$1(descriptor)) {
          throw new Error();
        }

        apiMethods[methodName] = descriptor;
      });
    }

    if (!isUndefined$1(wire)) {
      for (var fieldOrMethodName in wire) {
        var _wire$fieldOrMethodNa = wire[fieldOrMethodName],
            adapter = _wire$fieldOrMethodNa.adapter,
            method = _wire$fieldOrMethodNa.method,
            configCallback = _wire$fieldOrMethodNa.config,
            _wire$fieldOrMethodNa2 = _wire$fieldOrMethodNa.dynamic,
            dynamic = _wire$fieldOrMethodNa2 === void 0 ? [] : _wire$fieldOrMethodNa2;
        descriptor = getOwnPropertyDescriptor$1(proto, fieldOrMethodName);

        if (method === 1) {
          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(adapter, "@wire on method \"".concat(fieldOrMethodName, "\": adapter id must be truthy."));
            validateMethodDecoratedWithWire(Ctor, fieldOrMethodName, descriptor);
          }

          if (isUndefined$1(descriptor)) {
            throw new Error();
          }

          wiredMethods[fieldOrMethodName] = descriptor;
          storeWiredMethodMeta(descriptor, adapter, configCallback, dynamic);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(adapter, "@wire on field \"".concat(fieldOrMethodName, "\": adapter id must be truthy."));
            validateFieldDecoratedWithWire(Ctor, fieldOrMethodName, descriptor);
          }

          descriptor = internalWireFieldDecorator(fieldOrMethodName);
          wiredFields[fieldOrMethodName] = descriptor;
          storeWiredFieldMeta(descriptor, adapter, configCallback, dynamic);
          defineProperty(proto, fieldOrMethodName, descriptor);
        }
      }
    }

    if (!isUndefined$1(track)) {
      for (var _fieldName in track) {
        descriptor = getOwnPropertyDescriptor$1(proto, _fieldName);

        if (process.env.NODE_ENV !== 'production') {
          validateFieldDecoratedWithTrack(Ctor, _fieldName, descriptor);
        }

        descriptor = internalTrackDecorator(_fieldName);
        defineProperty(proto, _fieldName, descriptor);
      }
    }

    if (!isUndefined$1(fields)) {
      for (var _i9 = 0, n = fields.length; _i9 < n; _i9++) {
        var _fieldName2 = fields[_i9];
        descriptor = getOwnPropertyDescriptor$1(proto, _fieldName2);

        if (process.env.NODE_ENV !== 'production') {
          validateObservedField(Ctor, _fieldName2, descriptor);
        } // [W-9927596] Only mark a field as observed whenever it isn't a duplicated public nor
        // tracked property. This is only here for backward compatibility purposes.


        var isDuplicatePublicProp = !isUndefined$1(publicProps) && _fieldName2 in publicProps;
        var isDuplicateTrackedProp = !isUndefined$1(track) && _fieldName2 in track;

        if (!isDuplicatePublicProp && !isDuplicateTrackedProp) {
          observedFields[_fieldName2] = createObservedFieldPropertyDescriptor(_fieldName2);
        }
      }
    }

    setDecoratorsMeta(Ctor, {
      apiMethods: apiMethods,
      apiFields: apiFields,
      apiFieldsConfig: apiFieldsConfig,
      wiredMethods: wiredMethods,
      wiredFields: wiredFields,
      observedFields: observedFields
    });
    return Ctor;
  }

  var signedDecoratorToMetaMap = new Map();

  function setDecoratorsMeta(Ctor, meta) {
    signedDecoratorToMetaMap.set(Ctor, meta);
  }

  var defaultMeta = {
    apiMethods: EmptyObject,
    apiFields: EmptyObject,
    apiFieldsConfig: EmptyObject,
    wiredMethods: EmptyObject,
    wiredFields: EmptyObject,
    observedFields: EmptyObject
  };

  function getDecoratorsMeta(Ctor) {
    var meta = signedDecoratorToMetaMap.get(Ctor);
    return isUndefined$1(meta) ? defaultMeta : meta;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var warned = false;

  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetWarnedOnVersionMismatch = function () {
      warned = false;
    };
  }

  function checkVersionMismatch(func, type) {
    var versionMatcher = func.toString().match(LWC_VERSION_COMMENT_REGEX);

    if (!isNull(versionMatcher) && !warned) {
      var version = versionMatcher[1];

      var _version$split = version.split('.'),
          _version$split2 = _slicedToArray(_version$split, 2),
          major = _version$split2[0],
          minor = _version$split2[1];

      var _LWC_VERSION$split = LWC_VERSION.split('.'),
          _LWC_VERSION$split2 = _slicedToArray(_LWC_VERSION$split, 2),
          expectedMajor = _LWC_VERSION$split2[0],
          expectedMinor = _LWC_VERSION$split2[1];

      if (major !== expectedMajor || minor !== expectedMinor) {
        warned = true; // only warn once to avoid flooding the console
        // stylesheets and templates do not have user-meaningful names, but components do

        var friendlyName = type === 'component' ? "".concat(type, " ").concat(func.name) : type;
        logError("LWC WARNING: current engine is v".concat(LWC_VERSION, ", but ").concat(friendlyName, " was compiled with v").concat(version, ".\nPlease update your compiled code or LWC engine so that the versions match.\nNo further warnings will appear."));
      }
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var signedTemplateSet = new Set();

  function defaultEmptyTemplate() {
    return [];
  }

  signedTemplateSet.add(defaultEmptyTemplate);

  function isTemplateRegistered(tpl) {
    return signedTemplateSet.has(tpl);
  }
  /**
   * INTERNAL: This function can only be invoked by compiled code. The compiler
   * will prevent this function from being imported by userland code.
   */


  function registerTemplate(tpl) {
    if (process.env.NODE_ENV !== 'production') {
      checkVersionMismatch(tpl, 'template');
    }

    signedTemplateSet.add(tpl); // FIXME[@W-10950976]: the template object should be frozen, and it should not be possible to set
    // the stylesheets or stylesheetToken(s). For backwards compat, though, we shim stylesheetTokens
    // on top of stylesheetToken for anyone who is accessing the old internal API.
    // Details: https://salesforce.quip.com/v1rmAFu2cKAr

    defineProperty(tpl, 'stylesheetTokens', {
      get: function get() {
        var stylesheetToken = this.stylesheetToken;

        if (isUndefined$1(stylesheetToken)) {
          return stylesheetToken;
        } // Shim for the old `stylesheetTokens` property
        // See https://github.com/salesforce/lwc/pull/2332/files#diff-7901555acef29969adaa6583185b3e9bce475cdc6f23e799a54e0018cb18abaa


        return {
          hostAttribute: "".concat(stylesheetToken, "-host"),
          shadowAttribute: stylesheetToken
        };
      },
      set: function set(value) {
        // If the value is null or some other exotic object, you would be broken anyway in the past
        // because the engine would try to access hostAttribute/shadowAttribute, which would throw an error.
        // However it may be undefined in newer versions of LWC, so we need to guard against that case.
        this.stylesheetToken = isUndefined$1(value) ? undefined : value.shadowAttribute;
      }
    }); // chaining this method as a way to wrap existing
    // assignment of templates easily, without too much transformation

    return tpl;
  }
  /**
   * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
   * libraries to sanitize vulnerable attributes.
   */


  function sanitizeAttribute(tagName, namespaceUri, attrName, attrValue) {
    // locker-service patches this function during runtime to sanitize vulnerable attributes. When
    // ran off-core this function becomes a noop and returns the user authored value.
    return attrValue;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // A bridge descriptor is a descriptor whose job is just to get the component instance
  // from the element instance, and get the value or set a new value on the component.
  // This means that across different elements, similar names can get the exact same
  // descriptor, so we can cache them:


  var cachedGetterByKey = create(null);
  var cachedSetterByKey = create(null);

  function createGetter(key) {
    var fn = cachedGetterByKey[key];

    if (isUndefined$1(fn)) {
      fn = cachedGetterByKey[key] = function () {
        var vm = getAssociatedVM(this);
        var getHook = vm.getHook;
        return getHook(vm.component, key);
      };
    }

    return fn;
  }

  function createSetter(key) {
    var fn = cachedSetterByKey[key];

    if (isUndefined$1(fn)) {
      fn = cachedSetterByKey[key] = function (newValue) {
        var vm = getAssociatedVM(this);
        var setHook = vm.setHook;
        newValue = reactiveMembrane.getReadOnlyProxy(newValue);
        setHook(vm.component, key, newValue);
      };
    }

    return fn;
  }

  function createMethodCaller(methodName) {
    return function () {
      var vm = getAssociatedVM(this);
      var callHook = vm.callHook,
          component = vm.component;
      var fn = component[methodName];
      return callHook(vm.component, fn, ArraySlice.call(arguments));
    };
  }

  function createAttributeChangedCallback(attributeToPropMap, superAttributeChangedCallback) {
    return function attributeChangedCallback(attrName, oldValue, newValue) {
      if (oldValue === newValue) {
        // Ignore same values.
        return;
      }

      var propName = attributeToPropMap[attrName];

      if (isUndefined$1(propName)) {
        if (!isUndefined$1(superAttributeChangedCallback)) {
          // delegate unknown attributes to the super.
          // Typescript does not like it when you treat the `arguments` object as an array
          // @ts-ignore type-mismatch
          superAttributeChangedCallback.apply(this, arguments);
        }

        return;
      }

      if (!isAttributeLocked(this, attrName)) {
        // Ignore changes triggered by the engine itself during:
        // * diffing when public props are attempting to reflect to the DOM
        // * component via `this.setAttribute()`, should never update the prop
        // Both cases, the setAttribute call is always wrapped by the unlocking of the
        // attribute to be changed
        return;
      } // Reflect attribute change to the corresponding property when changed from outside.


      this[propName] = newValue;
    };
  }

  function HTMLBridgeElementFactory(SuperClass, props, methods) {
    var HTMLBridgeElement;
    /**
     * Modern browsers will have all Native Constructors as regular Classes
     * and must be instantiated with the new keyword. In older browsers,
     * specifically IE11, those are objects with a prototype property defined,
     * since they are not supposed to be extended or instantiated with the
     * new keyword. This forking logic supports both cases, specifically because
     * wc.ts relies on the construction path of the bridges to create new
     * fully qualifying web components.
     */

    if (isFunction$1(SuperClass)) {
      HTMLBridgeElement = /*#__PURE__*/function (_SuperClass) {
        _inherits(HTMLBridgeElement, _SuperClass);

        var _super4 = _createSuper(HTMLBridgeElement);

        function HTMLBridgeElement() {
          _classCallCheck(this, HTMLBridgeElement);

          return _super4.apply(this, arguments);
        }

        return _createClass(HTMLBridgeElement);
      }(SuperClass);
    } else {
      HTMLBridgeElement = function HTMLBridgeElement() {
        // Bridge classes are not supposed to be instantiated directly in
        // browsers that do not support web components.
        throw new TypeError('Illegal constructor');
      }; // prototype inheritance dance


      setPrototypeOf(HTMLBridgeElement, SuperClass);
      setPrototypeOf(HTMLBridgeElement.prototype, SuperClass.prototype);
      defineProperty(HTMLBridgeElement.prototype, 'constructor', {
        writable: true,
        configurable: true,
        value: HTMLBridgeElement
      });
    } // generating the hash table for attributes to avoid duplicate fields and facilitate validation
    // and false positives in case of inheritance.


    var attributeToPropMap = create(null);
    var superAttributeChangedCallback = SuperClass.prototype.attributeChangedCallback;
    var _SuperClass$observedA = SuperClass.observedAttributes,
        superObservedAttributes = _SuperClass$observedA === void 0 ? [] : _SuperClass$observedA;
    var descriptors = create(null); // expose getters and setters for each public props on the new Element Bridge

    for (var _i10 = 0, _len3 = props.length; _i10 < _len3; _i10 += 1) {
      var _propName2 = props[_i10];
      attributeToPropMap[htmlPropertyToAttribute(_propName2)] = _propName2;
      descriptors[_propName2] = {
        get: createGetter(_propName2),
        set: createSetter(_propName2),
        enumerable: true,
        configurable: true
      };
    } // expose public methods as props on the new Element Bridge


    for (var _i11 = 0, _len4 = methods.length; _i11 < _len4; _i11 += 1) {
      var methodName = methods[_i11];
      descriptors[methodName] = {
        value: createMethodCaller(methodName),
        writable: true,
        configurable: true
      };
    } // creating a new attributeChangedCallback per bridge because they are bound to the corresponding
    // map of attributes to props. We do this after all other props and methods to avoid the possibility
    // of getting overrule by a class declaration in user-land, and we make it non-writable, non-configurable
    // to preserve this definition.


    descriptors.attributeChangedCallback = {
      value: createAttributeChangedCallback(attributeToPropMap, superAttributeChangedCallback)
    }; // Specify attributes for which we want to reflect changes back to their corresponding
    // properties via attributeChangedCallback.

    defineProperty(HTMLBridgeElement, 'observedAttributes', {
      get: function get() {
        return [].concat(_toConsumableArray(superObservedAttributes), _toConsumableArray(keys(attributeToPropMap)));
      }
    });
    defineProperties(HTMLBridgeElement.prototype, descriptors);
    return HTMLBridgeElement;
  }

  var BaseBridgeElement = HTMLBridgeElementFactory(HTMLElementConstructor$1, getOwnPropertyNames$1(HTMLElementOriginalDescriptors), []);
  freeze(BaseBridgeElement);
  seal(BaseBridgeElement.prototype);
  /*
   * Copyright (c) 2020, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function resolveCircularModuleDependency(fn) {
    var module = fn();
    return (module === null || module === void 0 ? void 0 : module.__esModule) ? module.default : module;
  }

  function isCircularModuleDependency(obj) {
    return isFunction$1(obj) && hasOwnProperty$1.call(obj, '__circular__');
  }
  /*
   * Copyright (c) 2020, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var swappedTemplateMap = new WeakMap();
  var swappedComponentMap = new WeakMap();
  var swappedStyleMap = new WeakMap();
  var activeTemplates = new WeakMap();
  var activeComponents = new WeakMap();
  var activeStyles = new WeakMap();

  function rehydrateHotTemplate(tpl) {
    var list = activeTemplates.get(tpl);

    if (!isUndefined$1(list)) {
      list.forEach(function (vm) {
        if (isFalse(vm.isDirty)) {
          // forcing the vm to rehydrate in the micro-task:
          markComponentAsDirty(vm);
          scheduleRehydration(vm);
        }
      }); // resetting the Set to release the memory of those vm references
      // since they are not longer related to this template, instead
      // they will get re-associated once these instances are rehydrated.

      list.clear();
    }

    return true;
  }

  function rehydrateHotStyle(style) {
    var list = activeStyles.get(style);

    if (!isUndefined$1(list)) {
      list.forEach(function (vm) {
        // if a style definition is swapped, we must reset
        // vm's template content in the next micro-task:
        forceRehydration(vm);
      }); // resetting the Set to release the memory of those vm references
      // since they are not longer related to this style, instead
      // they will get re-associated once these instances are rehydrated.

      list.clear();
    }

    return true;
  }

  function rehydrateHotComponent(Ctor) {
    var list = activeComponents.get(Ctor);
    var canRefreshAllInstances = true;

    if (!isUndefined$1(list)) {
      list.forEach(function (vm) {
        var owner = vm.owner;

        if (!isNull(owner)) {
          // if a component class definition is swapped, we must reset
          // owner's template content in the next micro-task:
          forceRehydration(owner);
        } else {
          // the hot swapping for components only work for instances of components
          // created from a template, root elements can't be swapped because we
          // don't have a way to force the creation of the element with the same state
          // of the current element.
          // Instead, we can report the problem to the caller so it can take action,
          // for example: reload the entire page.
          canRefreshAllInstances = false;
        }
      }); // resetting the Set to release the memory of those vm references
      // since they are not longer related to this constructor, instead
      // they will get re-associated once these instances are rehydrated.

      list.clear();
    }

    return canRefreshAllInstances;
  }

  function getTemplateOrSwappedTemplate(tpl) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    if (runtimeFlags.ENABLE_HMR) {
      var visited = new Set();

      while (swappedTemplateMap.has(tpl) && !visited.has(tpl)) {
        visited.add(tpl);
        tpl = swappedTemplateMap.get(tpl);
      }
    }

    return tpl;
  }

  function getComponentOrSwappedComponent(Ctor) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    if (runtimeFlags.ENABLE_HMR) {
      var visited = new Set();

      while (swappedComponentMap.has(Ctor) && !visited.has(Ctor)) {
        visited.add(Ctor);
        Ctor = swappedComponentMap.get(Ctor);
      }
    }

    return Ctor;
  }

  function getStyleOrSwappedStyle(style) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    if (runtimeFlags.ENABLE_HMR) {
      var visited = new Set();

      while (swappedStyleMap.has(style) && !visited.has(style)) {
        visited.add(style);
        style = swappedStyleMap.get(style);
      }
    }

    return style;
  }

  function setActiveVM(vm) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    if (runtimeFlags.ENABLE_HMR) {
      // tracking active component
      var Ctor = vm.def.ctor;
      var componentVMs = activeComponents.get(Ctor);

      if (isUndefined$1(componentVMs)) {
        componentVMs = new Set();
        activeComponents.set(Ctor, componentVMs);
      } // this will allow us to keep track of the hot components


      componentVMs.add(vm); // tracking active template

      var tpl = vm.cmpTemplate;

      if (tpl) {
        var templateVMs = activeTemplates.get(tpl);

        if (isUndefined$1(templateVMs)) {
          templateVMs = new Set();
          activeTemplates.set(tpl, templateVMs);
        } // this will allow us to keep track of the templates that are
        // being used by a hot component


        templateVMs.add(vm); // tracking active styles associated to template

        var stylesheets = tpl.stylesheets;

        if (!isUndefined$1(stylesheets)) {
          flattenStylesheets(stylesheets).forEach(function (stylesheet) {
            // this is necessary because we don't hold the list of styles
            // in the vm, we only hold the selected (already swapped template)
            // but the styles attached to the template might not be the actual
            // active ones, but the swapped versions of those.
            stylesheet = getStyleOrSwappedStyle(stylesheet);
            var stylesheetVMs = activeStyles.get(stylesheet);

            if (isUndefined$1(stylesheetVMs)) {
              stylesheetVMs = new Set();
              activeStyles.set(stylesheet, stylesheetVMs);
            } // this will allow us to keep track of the stylesheet that are
            // being used by a hot component


            stylesheetVMs.add(vm);
          });
        }
      }
    }
  }

  function removeActiveVM(vm) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    if (runtimeFlags.ENABLE_HMR) {
      // tracking inactive component
      var Ctor = vm.def.ctor;
      var list = activeComponents.get(Ctor);

      if (!isUndefined$1(list)) {
        // deleting the vm from the set to avoid leaking memory
        list.delete(vm);
      } // removing inactive template


      var tpl = vm.cmpTemplate;

      if (tpl) {
        list = activeTemplates.get(tpl);

        if (!isUndefined$1(list)) {
          // deleting the vm from the set to avoid leaking memory
          list.delete(vm);
        } // removing active styles associated to template


        var styles = tpl.stylesheets;

        if (!isUndefined$1(styles)) {
          flattenStylesheets(styles).forEach(function (style) {
            list = activeStyles.get(style);

            if (!isUndefined$1(list)) {
              // deleting the vm from the set to avoid leaking memory
              list.delete(vm);
            }
          });
        }
      }
    }
  }

  function swapTemplate(oldTpl, newTpl) {
    if (process.env.NODE_ENV !== 'production') {
      if (isTemplateRegistered(oldTpl) && isTemplateRegistered(newTpl)) {
        swappedTemplateMap.set(oldTpl, newTpl);
        return rehydrateHotTemplate(oldTpl);
      } else {
        throw new TypeError("Invalid Template");
      }
    }

    if (!runtimeFlags.ENABLE_HMR) {
      throw new Error('HMR is not enabled');
    }

    return false;
  }

  function swapComponent(oldComponent, newComponent) {
    if (process.env.NODE_ENV !== 'production') {
      if (isComponentConstructor(oldComponent) && isComponentConstructor(newComponent)) {
        swappedComponentMap.set(oldComponent, newComponent);
        return rehydrateHotComponent(oldComponent);
      } else {
        throw new TypeError("Invalid Component");
      }
    }

    if (!runtimeFlags.ENABLE_HMR) {
      throw new Error('HMR is not enabled');
    }

    return false;
  }

  function swapStyle(oldStyle, newStyle) {
    if (process.env.NODE_ENV !== 'production') {
      // TODO [#1887]: once the support for registering styles is implemented
      // we can add the validation of both styles around this block.
      swappedStyleMap.set(oldStyle, newStyle);
      return rehydrateHotStyle(oldStyle);
    }

    if (!runtimeFlags.ENABLE_HMR) {
      throw new Error('HMR is not enabled');
    }

    return false;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var CtorToDefMap = new WeakMap();

  function getCtorProto(Ctor) {
    var proto = getPrototypeOf$1(Ctor);

    if (isNull(proto)) {
      throw new ReferenceError("Invalid prototype chain for ".concat(Ctor.name, ", you must extend LightningElement."));
    } // covering the cases where the ref is circular in AMD


    if (isCircularModuleDependency(proto)) {
      var p = resolveCircularModuleDependency(proto);

      if (process.env.NODE_ENV !== 'production') {
        if (isNull(p)) {
          throw new ReferenceError("Circular module dependency for ".concat(Ctor.name, ", must resolve to a constructor that extends LightningElement."));
        }
      } // escape hatch for Locker and other abstractions to provide their own base class instead
      // of our Base class without having to leak it to user-land. If the circular function returns
      // itself, that's the signal that we have hit the end of the proto chain, which must always
      // be base.


      proto = p === proto ? LightningElement : p;
    }

    return proto;
  }

  function createComponentDef(Ctor) {
    var ctorShadowSupportMode = Ctor.shadowSupportMode,
        ctorRenderMode = Ctor.renderMode;

    if (process.env.NODE_ENV !== 'production') {
      var ctorName = Ctor.name; // Removing the following assert until https://bugs.webkit.org/show_bug.cgi?id=190140 is fixed.
      // assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);

      assert.isTrue(Ctor.constructor, "Missing ".concat(ctorName, ".constructor, ").concat(ctorName, " should have a \"constructor\" property."));

      if (!isUndefined$1(ctorShadowSupportMode)) {
        assert.invariant(ctorShadowSupportMode === "any"
        /* Any */
        || ctorShadowSupportMode === "reset"
        /* Default */
        , "Invalid value for static property shadowSupportMode: '".concat(ctorShadowSupportMode, "'"));
      }

      if (!isUndefined$1(ctorRenderMode)) {
        assert.invariant(ctorRenderMode === 'light' || ctorRenderMode === 'shadow', "Invalid value for static property renderMode: '".concat(ctorRenderMode, "'. renderMode must be either 'light' or 'shadow'."));
      }
    }

    var decoratorsMeta = getDecoratorsMeta(Ctor);
    var apiFields = decoratorsMeta.apiFields,
        apiFieldsConfig = decoratorsMeta.apiFieldsConfig,
        apiMethods = decoratorsMeta.apiMethods,
        wiredFields = decoratorsMeta.wiredFields,
        wiredMethods = decoratorsMeta.wiredMethods,
        observedFields = decoratorsMeta.observedFields;
    var proto = Ctor.prototype;
    var connectedCallback = proto.connectedCallback,
        disconnectedCallback = proto.disconnectedCallback,
        renderedCallback = proto.renderedCallback,
        errorCallback = proto.errorCallback,
        render = proto.render;
    var superProto = getCtorProto(Ctor);
    var superDef = superProto !== LightningElement ? getComponentInternalDef(superProto) : lightingElementDef;
    var bridge = HTMLBridgeElementFactory(superDef.bridge, keys(apiFields), keys(apiMethods));
    var props = assign(create(null), superDef.props, apiFields);
    var propsConfig = assign(create(null), superDef.propsConfig, apiFieldsConfig);
    var methods = assign(create(null), superDef.methods, apiMethods);
    var wire = assign(create(null), superDef.wire, wiredFields, wiredMethods);
    connectedCallback = connectedCallback || superDef.connectedCallback;
    disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
    renderedCallback = renderedCallback || superDef.renderedCallback;
    errorCallback = errorCallback || superDef.errorCallback;
    render = render || superDef.render;
    var shadowSupportMode = superDef.shadowSupportMode;

    if (!isUndefined$1(ctorShadowSupportMode)) {
      shadowSupportMode = ctorShadowSupportMode;
    }

    var renderMode = superDef.renderMode;

    if (!isUndefined$1(ctorRenderMode)) {
      renderMode = ctorRenderMode === 'light' ? 0
      /* Light */
      : 1
      /* Shadow */
      ;
    }

    var template = getComponentRegisteredTemplate(Ctor) || superDef.template;
    var name = Ctor.name || superDef.name; // installing observed fields into the prototype.

    defineProperties(proto, observedFields);
    var def = {
      ctor: Ctor,
      name: name,
      wire: wire,
      props: props,
      propsConfig: propsConfig,
      methods: methods,
      bridge: bridge,
      template: template,
      renderMode: renderMode,
      shadowSupportMode: shadowSupportMode,
      connectedCallback: connectedCallback,
      disconnectedCallback: disconnectedCallback,
      renderedCallback: renderedCallback,
      errorCallback: errorCallback,
      render: render
    };

    if (process.env.NODE_ENV !== 'production') {
      freeze(Ctor.prototype);
    }

    return def;
  }
  /**
   * EXPERIMENTAL: This function allows for the identification of LWC constructors. This API is
   * subject to change or being removed.
   */


  function isComponentConstructor(ctor) {
    if (!isFunction$1(ctor)) {
      return false;
    } // Fast path: LightningElement is part of the prototype chain of the constructor.


    if (ctor.prototype instanceof LightningElement) {
      return true;
    } // Slow path: LightningElement is not part of the prototype chain of the constructor, we need
    // climb up the constructor prototype chain to check in case there are circular dependencies
    // to resolve.


    var current = ctor;

    do {
      if (isCircularModuleDependency(current)) {
        var circularResolved = resolveCircularModuleDependency(current); // If the circular function returns itself, that's the signal that we have hit the end
        // of the proto chain, which must always be a valid base constructor.

        if (circularResolved === current) {
          return true;
        }

        current = circularResolved;
      }

      if (current === LightningElement) {
        return true;
      }
    } while (!isNull(current) && (current = getPrototypeOf$1(current))); // Finally return false if the LightningElement is not part of the prototype chain.


    return false;
  }

  function getComponentInternalDef(Ctor) {
    if (process.env.NODE_ENV !== 'production') {
      Ctor = getComponentOrSwappedComponent(Ctor);
    }

    var def = CtorToDefMap.get(Ctor);

    if (isUndefined$1(def)) {
      if (isCircularModuleDependency(Ctor)) {
        var resolvedCtor = resolveCircularModuleDependency(Ctor);
        def = getComponentInternalDef(resolvedCtor); // Cache the unresolved component ctor too. The next time if the same unresolved ctor is used,
        // look up the definition in cache instead of re-resolving and recreating the def.

        CtorToDefMap.set(Ctor, def);
        return def;
      }

      if (!isComponentConstructor(Ctor)) {
        throw new TypeError("".concat(Ctor, " is not a valid component, or does not extends LightningElement from \"lwc\". You probably forgot to add the extend clause on the class declaration."));
      }

      def = createComponentDef(Ctor);
      CtorToDefMap.set(Ctor, def);
    }

    return def;
  }

  function getComponentHtmlPrototype(Ctor) {
    var def = getComponentInternalDef(Ctor);
    return def.bridge;
  }

  var lightingElementDef = {
    ctor: LightningElement,
    name: LightningElement.name,
    props: lightningBasedDescriptors,
    propsConfig: EmptyObject,
    methods: EmptyObject,
    renderMode: 1
    /* Shadow */
    ,
    shadowSupportMode: "reset"
    /* Default */
    ,
    wire: EmptyObject,
    bridge: BaseBridgeElement,
    template: defaultEmptyTemplate,
    render: LightningElement.prototype.render
  };
  /**
   * EXPERIMENTAL: This function allows for the collection of internal component metadata. This API is
   * subject to change or being removed.
   */

  function getComponentDef(Ctor) {
    var def = getComponentInternalDef(Ctor); // From the internal def object, we need to extract the info that is useful
    // for some external services, e.g.: Locker Service, usually, all they care
    // is about the shape of the constructor, the internals of it are not relevant
    // because they don't have a way to mess with that.

    var ctor = def.ctor,
        name = def.name,
        props = def.props,
        propsConfig = def.propsConfig,
        methods = def.methods;
    var publicProps = {};

    for (var key in props) {
      // avoid leaking the reference to the public props descriptors
      publicProps[key] = {
        config: propsConfig[key] || 0,
        type: "any"
        /* any */
        ,
        attr: htmlPropertyToAttribute(key)
      };
    }

    var publicMethods = {};

    for (var _key2 in methods) {
      // avoid leaking the reference to the public method descriptors
      publicMethods[_key2] = methods[_key2].value;
    }

    return {
      ctor: ctor,
      name: name,
      props: publicProps,
      methods: publicMethods
    };
  }
  /*
   * Copyright (c) 2020, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function getUpgradableConstructor(tagName) {
    // Should never get a tag with upper case letter at this point, the compiler should
    // produce only tags with lowercase letters
    // But, for backwards compatibility, we will lower case the tagName
    tagName = tagName.toLowerCase();
    var CE = getCustomElement$1(tagName);

    if (!isUndefined$1(CE)) {
      return CE;
    }
    /**
     * LWC Upgradable Element reference to an element that was created
     * via the scoped registry mechanism, and that is ready to be upgraded.
     */


    CE = /*#__PURE__*/function (_HTMLElementExported$) {
      _inherits(LWCUpgradableElement, _HTMLElementExported$);

      var _super5 = _createSuper(LWCUpgradableElement);

      function LWCUpgradableElement(upgradeCallback) {
        var _this4;

        _classCallCheck(this, LWCUpgradableElement);

        _this4 = _super5.call(this);

        if (isFunction$1(upgradeCallback)) {
          upgradeCallback(_assertThisInitialized(_this4)); // nothing to do with the result for now
        }

        return _this4;
      }

      return _createClass(LWCUpgradableElement);
    }(HTMLElementExported$1);

    defineCustomElement$1(tagName, CE);
    return CE;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function isVBaseElement(vnode) {
    var type = vnode.type;
    return type === 2
    /* Element */
    || type === 3
    /* CustomElement */
    ;
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var ColonCharCode = 58;

  function patchAttributes(oldVnode, vnode) {
    var attrs = vnode.data.attrs;

    if (isUndefined$1(attrs)) {
      return;
    }

    var oldAttrs = isNull(oldVnode) ? EmptyObject : oldVnode.data.attrs;

    if (oldAttrs === attrs) {
      return;
    }

    var elm = vnode.elm;

    for (var key in attrs) {
      var cur = attrs[key];
      var old = oldAttrs[key];

      if (old !== cur) {
        unlockAttribute(elm, key);

        if (StringCharCodeAt.call(key, 3) === ColonCharCode) {
          // Assume xml namespace
          setAttribute$1(elm, key, cur, XML_NAMESPACE);
        } else if (StringCharCodeAt.call(key, 5) === ColonCharCode) {
          // Assume xlink namespace
          setAttribute$1(elm, key, cur, XLINK_NAMESPACE);
        } else if (isNull(cur) || isUndefined$1(cur)) {
          removeAttribute$1(elm, key);
        } else {
          setAttribute$1(elm, key, cur);
        }

        lockAttribute();
      }
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function isLiveBindingProp(sel, key) {
    // For properties with live bindings, we read values from the DOM element
    // instead of relying on internally tracked values.
    return sel === 'input' && (key === 'value' || key === 'checked');
  }

  function patchProps(oldVnode, vnode) {
    var props = vnode.data.props;

    if (isUndefined$1(props)) {
      return;
    }

    var oldProps = isNull(oldVnode) ? EmptyObject : oldVnode.data.props;

    if (oldProps === props) {
      return;
    }

    var isFirstPatch = isNull(oldVnode);
    var elm = vnode.elm,
        sel = vnode.sel;

    for (var key in props) {
      var cur = props[key]; // Set the property if it's the first time is is patched or if the previous property is
      // different than the one previously set.

      if (isFirstPatch || cur !== (isLiveBindingProp(sel, key) ? getProperty$1(elm, key) : oldProps[key])) {
        setProperty$1(elm, key, cur);
      }
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var classNameToClassMap = create(null);

  function getMapFromClassName(className) {
    // Intentionally using == to match undefined and null values from computed style attribute
    if (className == null) {
      return EmptyObject;
    } // computed class names must be string


    className = isString(className) ? className : className + '';
    var map = classNameToClassMap[className];

    if (map) {
      return map;
    }

    map = create(null);
    var start = 0;
    var o;
    var len = className.length;

    for (o = 0; o < len; o++) {
      if (StringCharCodeAt.call(className, o) === SPACE_CHAR) {
        if (o > start) {
          map[StringSlice.call(className, start, o)] = true;
        }

        start = o + 1;
      }
    }

    if (o > start) {
      map[StringSlice.call(className, start, o)] = true;
    }

    classNameToClassMap[className] = map;

    if (process.env.NODE_ENV !== 'production') {
      // just to make sure that this object never changes as part of the diffing algo
      freeze(map);
    }

    return map;
  }

  function patchClassAttribute(oldVnode, vnode) {
    var elm = vnode.elm,
        newClass = vnode.data.className;
    var oldClass = isNull(oldVnode) ? undefined : oldVnode.data.className;

    if (oldClass === newClass) {
      return;
    }

    var classList = getClassList$1(elm);
    var newClassMap = getMapFromClassName(newClass);
    var oldClassMap = getMapFromClassName(oldClass);
    var name;

    for (name in oldClassMap) {
      // remove only if it is not in the new class collection and it is not set from within the instance
      if (isUndefined$1(newClassMap[name])) {
        classList.remove(name);
      }
    }

    for (name in newClassMap) {
      if (isUndefined$1(oldClassMap[name])) {
        classList.add(name);
      }
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // The style property is a string when defined via an expression in the template.


  function patchStyleAttribute(oldVnode, vnode) {
    var elm = vnode.elm,
        newStyle = vnode.data.style;
    var oldStyle = isNull(oldVnode) ? undefined : oldVnode.data.style;

    if (oldStyle === newStyle) {
      return;
    }

    if (!isString(newStyle) || newStyle === '') {
      removeAttribute$1(elm, 'style');
    } else {
      setAttribute$1(elm, 'style', newStyle);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function applyEventListeners(vnode) {
    var elm = vnode.elm,
        on = vnode.data.on;

    if (isUndefined$1(on)) {
      return;
    }

    for (var name in on) {
      var handler = on[name];
      addEventListener$1(elm, name, handler);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // The HTML class property becomes the vnode.data.classMap object when defined as a string in the template.
  // The compiler takes care of transforming the inline classnames into an object. It's faster to set the
  // different classnames properties individually instead of via a string.


  function applyStaticClassAttribute(vnode) {
    var elm = vnode.elm,
        classMap = vnode.data.classMap;

    if (isUndefined$1(classMap)) {
      return;
    }

    var classList = getClassList$1(elm);

    for (var name in classMap) {
      classList.add(name);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // The HTML style property becomes the vnode.data.styleDecls object when defined as a string in the template.
  // The compiler takes care of transforming the inline style into an object. It's faster to set the
  // different style properties individually instead of via a string.


  function applyStaticStyleAttribute(vnode) {
    var elm = vnode.elm,
        styleDecls = vnode.data.styleDecls;

    if (isUndefined$1(styleDecls)) {
      return;
    }

    for (var _i12 = 0; _i12 < styleDecls.length; _i12++) {
      var _styleDecls$_i = _slicedToArray(styleDecls[_i12], 3),
          prop = _styleDecls$_i[0],
          value = _styleDecls$_i[1],
          important = _styleDecls$_i[2];

      setCSSStyleProperty$1(elm, prop, value, important);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  function patchChildren(c1, c2, parent) {
    if (hasDynamicChildren(c2)) {
      updateDynamicChildren(c1, c2, parent);
    } else {
      updateStaticChildren(c1, c2, parent);
    }
  }

  function patch(n1, n2) {
    if (n1 === n2) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!isSameVnode(n1, n2)) {
        throw new Error('Expected these VNodes to be the same: ' + JSON.stringify({
          sel: n1.sel,
          key: n1.key
        }) + ', ' + JSON.stringify({
          sel: n2.sel,
          key: n2.key
        }));
      }
    }

    switch (n2.type) {
      case 0
      /* Text */
      :
        patchText(n1, n2);
        break;

      case 1
      /* Comment */
      :
        patchComment(n1, n2);
        break;

      case 2
      /* Element */
      :
        patchElement(n1, n2);
        break;

      case 3
      /* CustomElement */
      :
        patchCustomElement(n1, n2);
        break;
    }
  }

  function mount(node, parent, anchor) {
    switch (node.type) {
      case 0
      /* Text */
      :
        mountText(node, parent, anchor);
        break;

      case 1
      /* Comment */
      :
        mountComment(node, parent, anchor);
        break;

      case 2
      /* Element */
      :
        mountElement(node, parent, anchor);
        break;

      case 3
      /* CustomElement */
      :
        mountCustomElement(node, parent, anchor);
        break;
    }
  }

  function patchText(n1, n2) {
    n2.elm = n1.elm;

    if (n2.text !== n1.text) {
      updateTextContent(n2);
    }
  }

  function mountText(node, parent, anchor) {
    var owner = node.owner;
    var textNode = node.elm = createText$1(node.text);
    linkNodeToShadow(textNode, owner);
    insertNode(textNode, parent, anchor);
  }

  function patchComment(n1, n2) {
    n2.elm = n1.elm; // FIXME: Comment nodes should be static, we shouldn't need to diff them together. However
    // it is the case today.

    if (n2.text !== n1.text) {
      updateTextContent(n2);
    }
  }

  function mountComment(node, parent, anchor) {
    var owner = node.owner;
    var commentNode = node.elm = createComment$1(node.text);
    linkNodeToShadow(commentNode, owner);
    insertNode(commentNode, parent, anchor);
  }

  function mountElement(vnode, parent, anchor) {
    var sel = vnode.sel,
        owner = vnode.owner,
        svg = vnode.data.svg;
    var namespace = isTrue(svg) ? SVG_NAMESPACE : undefined;
    var elm = createElement$2(sel, namespace);
    linkNodeToShadow(elm, owner);
    fallbackElmHook(elm, vnode);
    vnode.elm = elm;
    patchElementPropsAndAttrs$1(null, vnode);
    insertNode(elm, parent, anchor);
    mountVNodes(vnode.children, elm, null);
  }

  function patchElement(n1, n2) {
    var elm = n2.elm = n1.elm;
    patchElementPropsAndAttrs$1(n1, n2);
    patchChildren(n1.children, n2.children, elm);
  }

  function mountCustomElement(vnode, parent, anchor) {
    var sel = vnode.sel,
        owner = vnode.owner;
    var UpgradableConstructor = getUpgradableConstructor(sel);
    /**
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */

    var vm;
    var elm = new UpgradableConstructor(function (elm) {
      // the custom element from the registry is expecting an upgrade callback
      vm = createViewModelHook(elm, vnode);
    });
    linkNodeToShadow(elm, owner);
    vnode.elm = elm;
    vnode.vm = vm;

    if (vm) {
      allocateChildren(vnode, vm);
    } else if (vnode.ctor !== UpgradableConstructor) {
      throw new TypeError("Incorrect Component Constructor");
    }

    patchElementPropsAndAttrs$1(null, vnode);
    insertNode(elm, parent, anchor);

    if (vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state === 0
        /* created */
        , "".concat(vm, " cannot be recycled."));
      }

      runConnectedCallback(vm);
    }

    mountVNodes(vnode.children, elm, null);

    if (vm) {
      appendVM(vm);
    }
  }

  function patchCustomElement(n1, n2) {
    var elm = n2.elm = n1.elm;
    var vm = n2.vm = n1.vm;
    patchElementPropsAndAttrs$1(n1, n2);

    if (!isUndefined$1(vm)) {
      // in fallback mode, the allocation will always set children to
      // empty and delegate the real allocation to the slot elements
      allocateChildren(n2, vm);
    } // in fallback mode, the children will be always empty, so, nothing
    // will happen, but in native, it does allocate the light dom


    patchChildren(n1.children, n2.children, elm);

    if (!isUndefined$1(vm)) {
      // this will probably update the shadowRoot, but only if the vm is in a dirty state
      // this is important to preserve the top to bottom synchronous rendering phase.
      rerenderVM(vm);
    }
  }

  function mountVNodes(vnodes, parent, anchor) {
    var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var end = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : vnodes.length;

    for (; start < end; ++start) {
      var vnode = vnodes[start];

      if (isVNode(vnode)) {
        mount(vnode, parent, anchor);
      }
    }
  }

  function unmount(vnode, parent) {
    var doRemove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var type = vnode.type,
        elm = vnode.elm,
        sel = vnode.sel; // When unmounting a VNode subtree not all the elements have to removed from the DOM. The
    // subtree root, is the only element worth unmounting from the subtree.

    if (doRemove) {
      removeNode(elm, parent);
    }

    var removeChildren = sel === 'slot'; // slot content is removed to trigger slotchange event when removing slot

    switch (type) {
      case 2
      /* Element */
      :
        unmountVNodes(vnode.children, elm, removeChildren);
        break;

      case 3
      /* CustomElement */
      :
        {
          var vm = vnode.vm; // No need to unmount the children here, `removeVM` will take care of removing the
          // children.

          if (!isUndefined$1(vm)) {
            removeVM(vm);
          }
        }
    }
  }

  function unmountVNodes(vnodes, parent) {
    var doRemove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var end = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : vnodes.length;

    for (; start < end; ++start) {
      var ch = vnodes[start];

      if (isVNode(ch)) {
        unmount(ch, parent, doRemove);
      }
    }
  }

  function isVNode(vnode) {
    return vnode != null;
  }

  function observeElementChildNodes(elm) {
    elm.$domManual$ = true;
  }

  function setElementShadowToken(elm, token) {
    elm.$shadowToken$ = token;
  } // Set the scope token class for *.scoped.css styles


  function setScopeTokenClassIfNecessary(elm, owner) {
    var cmpTemplate = owner.cmpTemplate,
        context = owner.context;
    var token = cmpTemplate === null || cmpTemplate === void 0 ? void 0 : cmpTemplate.stylesheetToken;

    if (!isUndefined$1(token) && context.hasScopedStyles) {
      getClassList$1(elm).add(token);
    }
  }

  function linkNodeToShadow(elm, owner) {
    var renderRoot = owner.renderRoot,
        renderMode = owner.renderMode,
        shadowMode = owner.shadowMode; // TODO [#1164]: this should eventually be done by the polyfill directly

    if (isSyntheticShadowDefined$1) {
      if (shadowMode === 1
      /* Synthetic */
      || renderMode === 0
      /* Light */
      ) {
        elm[KEY__SHADOW_RESOLVER] = renderRoot[KEY__SHADOW_RESOLVER];
      }
    }
  }

  function updateTextContent(vnode) {
    var elm = vnode.elm,
        text = vnode.text;

    if (process.env.NODE_ENV !== 'production') {
      unlockDomMutation();
    }

    setText$1(elm, text);

    if (process.env.NODE_ENV !== 'production') {
      lockDomMutation();
    }
  }

  function insertNode(node, parent, anchor) {
    if (process.env.NODE_ENV !== 'production') {
      unlockDomMutation();
    }

    insert$1(node, parent, anchor);

    if (process.env.NODE_ENV !== 'production') {
      lockDomMutation();
    }
  }

  function removeNode(node, parent) {
    if (process.env.NODE_ENV !== 'production') {
      unlockDomMutation();
    }

    remove$1(node, parent);

    if (process.env.NODE_ENV !== 'production') {
      lockDomMutation();
    }
  }

  function patchElementPropsAndAttrs$1(oldVnode, vnode) {
    if (isNull(oldVnode)) {
      applyEventListeners(vnode);
      applyStaticClassAttribute(vnode);
      applyStaticStyleAttribute(vnode);
    } // Attrs need to be applied to element before props IE11 will wipe out value on radio inputs if
    // value is set before type=radio.


    patchClassAttribute(oldVnode, vnode);
    patchStyleAttribute(oldVnode, vnode);
    patchAttributes(oldVnode, vnode);
    patchProps(oldVnode, vnode);
  }

  function fallbackElmHook(elm, vnode) {
    var owner = vnode.owner;
    setScopeTokenClassIfNecessary(elm, owner);

    if (owner.shadowMode === 1
    /* Synthetic */
    ) {
      var context = vnode.data.context;
      var stylesheetToken = owner.context.stylesheetToken;

      if (!isUndefined$1(context) && !isUndefined$1(context.lwc) && context.lwc.dom === "manual"
      /* Manual */
      ) {
        // this element will now accept any manual content inserted into it
        observeElementChildNodes(elm);
      }

      if (!isUndefined$1(stylesheetToken)) {
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, stylesheetToken);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      var _context = vnode.data.context;
      var isPortal = !isUndefined$1(_context) && !isUndefined$1(_context.lwc) && _context.lwc.dom === "manual"
      /* Manual */
      ;
      var isLight = owner.renderMode === 0
      /* Light */
      ;
      patchElementWithRestrictions(elm, {
        isPortal: isPortal,
        isLight: isLight
      });
    }
  }

  function allocateChildren(vnode, vm) {
    // A component with slots will re-render because:
    // 1- There is a change of the internal state.
    // 2- There is a change on the external api (ex: slots)
    //
    // In case #1, the vnodes in the cmpSlots will be reused since they didn't changed. This routine emptied the
    // slotted children when those VCustomElement were rendered and therefore in subsequent calls to allocate children
    // in a reused VCustomElement, there won't be any slotted children.
    // For those cases, we will use the reference for allocated children stored when rendering the fresh VCustomElement.
    //
    // In case #2, we will always get a fresh VCustomElement.
    var children = vnode.aChildren || vnode.children;
    vm.aChildren = children;
    var renderMode = vm.renderMode,
        shadowMode = vm.shadowMode;

    if (shadowMode === 1
    /* Synthetic */
    || renderMode === 0
    /* Light */
    ) {
      // slow path
      allocateInSlot(vm, children); // save the allocated children in case this vnode is reused.

      vnode.aChildren = children; // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!

      vnode.children = EmptyArray;
    }
  }

  function createViewModelHook(elm, vnode) {
    var vm = getAssociatedVMIfPresent(elm); // There is a possibility that a custom element is registered under tagName, in which case, the
    // initialization is already carry on, and there is nothing else to do here since this hook is
    // called right after invoking `document.createElement`.

    if (!isUndefined$1(vm)) {
      return vm;
    }

    var sel = vnode.sel,
        mode = vnode.mode,
        ctor = vnode.ctor,
        owner = vnode.owner;
    setScopeTokenClassIfNecessary(elm, owner);

    if (owner.shadowMode === 1
    /* Synthetic */
    ) {
      var stylesheetToken = owner.context.stylesheetToken; // when running in synthetic shadow mode, we need to set the shadowToken value
      // into each element from the template, so they can be styled accordingly.

      if (!isUndefined$1(stylesheetToken)) {
        setElementShadowToken(elm, stylesheetToken);
      }
    }

    vm = createVM(elm, ctor, {
      mode: mode,
      owner: owner,
      tagName: sel
    });

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isArray$1(vnode.children), "Invalid vnode for a custom element, it must have children defined.");
    }

    return vm;
  }

  function allocateInSlot(vm, children) {
    var _a;

    var oldSlots = vm.cmpSlots;
    var cmpSlots = vm.cmpSlots = create(null);

    for (var _i13 = 0, _len5 = children.length; _i13 < _len5; _i13 += 1) {
      var vnode = children[_i13];

      if (isNull(vnode)) {
        continue;
      }

      var slotName = '';

      if (isVBaseElement(vnode)) {
        slotName = ((_a = vnode.data.attrs) === null || _a === void 0 ? void 0 : _a.slot) || '';
      }

      var vnodes = cmpSlots[slotName] = cmpSlots[slotName] || []; // re-keying the vnodes is necessary to avoid conflicts with default content for the slot
      // which might have similar keys. Each vnode will always have a key that
      // starts with a numeric character from compiler. In this case, we add a unique
      // notation for slotted vnodes keys, e.g.: `@foo:1:1`

      if (!isUndefined$1(vnode.key)) {
        vnode.key = "@".concat(slotName, ":").concat(vnode.key);
      }

      ArrayPush$1.call(vnodes, vnode);
    }

    if (isFalse(vm.isDirty)) {
      // We need to determine if the old allocation is really different from the new one
      // and mark the vm as dirty
      var oldKeys = keys(oldSlots);

      if (oldKeys.length !== keys(cmpSlots).length) {
        markComponentAsDirty(vm);
        return;
      }

      for (var _i14 = 0, _len6 = oldKeys.length; _i14 < _len6; _i14 += 1) {
        var key = oldKeys[_i14];

        if (isUndefined$1(cmpSlots[key]) || oldSlots[key].length !== cmpSlots[key].length) {
          markComponentAsDirty(vm);
          return;
        }

        var oldVNodes = oldSlots[key];
        var _vnodes = cmpSlots[key];

        for (var j = 0, a = cmpSlots[key].length; j < a; j += 1) {
          if (oldVNodes[j] !== _vnodes[j]) {
            markComponentAsDirty(vm);
            return;
          }
        }
      }
    }
  } // Using a WeakMap instead of a WeakSet because this one works in IE11 :(


  var FromIteration = new WeakMap(); // dynamic children means it was generated by an iteration
  // in a template, and will require a more complex diffing algo.

  function markAsDynamicChildren(children) {
    FromIteration.set(children, 1);
  }

  function hasDynamicChildren(children) {
    return FromIteration.has(children);
  }

  function createKeyToOldIdx(children, beginIdx, endIdx) {
    var map = {}; // TODO [#1637]: simplify this by assuming that all vnodes has keys

    for (var j = beginIdx; j <= endIdx; ++j) {
      var ch = children[j];

      if (isVNode(ch)) {
        var key = ch.key;

        if (key !== undefined) {
          map[key] = j;
        }
      }
    }

    return map;
  }

  function updateDynamicChildren(oldCh, newCh, parent) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newChEnd = newCh.length - 1;
    var newEndIdx = newChEnd;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx;
    var idxInOld;
    var elmToMove;
    var before;
    var clonedOldCh = false;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (!isVNode(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
      } else if (!isVNode(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (!isVNode(newStartVnode)) {
        newStartVnode = newCh[++newStartIdx];
      } else if (!isVNode(newEndVnode)) {
        newEndVnode = newCh[--newEndIdx];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patch(oldStartVnode, newStartVnode);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patch(oldStartVnode, newEndVnode);
        insertNode(oldStartVnode.elm, parent, nextSibling$1(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patch(oldEndVnode, newStartVnode);
        insertNode(newStartVnode.elm, parent, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }

        idxInOld = oldKeyToIdx[newStartVnode.key];

        if (isUndefined$1(idxInOld)) {
          // New element
          mount(newStartVnode, parent, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];

          if (isVNode(elmToMove)) {
            if (elmToMove.sel !== newStartVnode.sel) {
              // New element
              mount(newStartVnode, parent, oldStartVnode.elm);
            } else {
              patch(elmToMove, newStartVnode); // Delete the old child, but copy the array since it is read-only.
              // The `oldCh` will be GC'ed after `updateDynamicChildren` is complete,
              // so we only care about the `oldCh` object inside this function.
              // To avoid cloning over and over again, we check `clonedOldCh`
              // and only clone once.

              if (!clonedOldCh) {
                clonedOldCh = true;
                oldCh = _toConsumableArray(oldCh);
              } // We've already cloned at least once, so it's no longer read-only


              oldCh[idxInOld] = undefined;
              insertNode(elmToMove.elm, parent, oldStartVnode.elm);
            }
          }

          newStartVnode = newCh[++newStartIdx];
        }
      }
    }

    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        // There's some cases in which the sub array of vnodes to be inserted is followed by null(s) and an
        // already processed vnode, in such cases the vnodes to be inserted should be before that processed vnode.
        var _i15 = newEndIdx;
        var n;

        do {
          n = newCh[++_i15];
        } while (!isVNode(n) && _i15 < newChEnd);

        before = isVNode(n) ? n.elm : null;
        mountVNodes(newCh, parent, before, newStartIdx, newEndIdx + 1);
      } else {
        unmountVNodes(oldCh, parent, true, oldStartIdx, oldEndIdx + 1);
      }
    }
  }

  function updateStaticChildren(c1, c2, parent) {
    var c1Length = c1.length;
    var c2Length = c2.length;

    if (c1Length === 0) {
      // the old list is empty, we can directly insert anything new
      mountVNodes(c2, parent, null);
      return;
    }

    if (c2Length === 0) {
      // the old list is nonempty and the new list is empty so we can directly remove all old nodes
      // this is the case in which the dynamic children of an if-directive should be removed
      unmountVNodes(c1, parent, true);
      return;
    } // if the old list is not empty, the new list MUST have the same
    // amount of nodes, that's why we call this static children


    var anchor = null;

    for (var _i16 = c2Length - 1; _i16 >= 0; _i16 -= 1) {
      var n1 = c1[_i16];
      var n2 = c2[_i16];

      if (n2 !== n1) {
        if (isVNode(n1)) {
          if (isVNode(n2)) {
            // both vnodes are equivalent, and we just need to patch them
            patch(n1, n2);
            anchor = n2.elm;
          } else {
            // removing the old vnode since the new one is null
            unmount(n1, parent, true);
          }
        } else if (isVNode(n2)) {
          mount(n2, parent, anchor);
          anchor = n2.elm;
        }
      }
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var SymbolIterator = Symbol.iterator;

  function addVNodeToChildLWC(vnode) {
    ArrayPush$1.call(getVMBeingRendered().velements, vnode);
  } // [h]tml node


  function h(sel, data) {
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EmptyArray;
    var vmBeingRendered = getVMBeingRendered();

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(sel), "h() 1st argument sel must be a string.");
      assert.isTrue(isObject(data), "h() 2nd argument data must be an object.");
      assert.isTrue(isArray$1(children), "h() 3rd argument children must be an array.");
      assert.isTrue('key' in data, " <".concat(sel, "> \"key\" attribute is invalid or missing for ").concat(vmBeingRendered, ". Key inside iterator is either undefined or null.")); // checking reserved internal data properties

      assert.isFalse(data.className && data.classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
      assert.isFalse(data.styleDecls && data.style, "vnode.data.styleDecls and vnode.data.style ambiguous declaration.");

      if (data.style && !isString(data.style)) {
        logError("Invalid 'style' attribute passed to <".concat(sel, "> is ignored. This attribute must be a string value."), vmBeingRendered);
      }

      forEach.call(children, function (childVnode) {
        if (childVnode != null) {
          assert.isTrue('type' in childVnode && 'sel' in childVnode && 'elm' in childVnode && 'key' in childVnode, "".concat(childVnode, " is not a vnode."));
        }
      });
    }

    var elm;
    var key = data.key;
    return {
      type: 2
      /* Element */
      ,
      sel: sel,
      data: data,
      children: children,
      elm: elm,
      key: key,
      owner: vmBeingRendered
    };
  } // [t]ab[i]ndex function


  function ti(value) {
    // if value is greater than 0, we normalize to 0
    // If value is an invalid tabIndex value (null, undefined, string, etc), we let that value pass through
    // If value is less than -1, we don't care
    var shouldNormalize = value > 0 && !(isTrue(value) || isFalse(value));

    if (process.env.NODE_ENV !== 'production') {
      var _vmBeingRendered6 = getVMBeingRendered();

      if (shouldNormalize) {
        logError("Invalid tabindex value `".concat(toString$1(value), "` in template for ").concat(_vmBeingRendered6, ". This attribute must be set to 0 or -1."), _vmBeingRendered6);
      }
    }

    return shouldNormalize ? 0 : value;
  } // [s]lot element node


  function s(slotName, data, children, slotset) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(slotName), "s() 1st argument slotName must be a string.");
      assert.isTrue(isObject(data), "s() 2nd argument data must be an object.");
      assert.isTrue(isArray$1(children), "h() 3rd argument children must be an array.");
    }

    if (!isUndefined$1(slotset) && !isUndefined$1(slotset[slotName]) && slotset[slotName].length !== 0) {
      children = slotset[slotName];
    }

    var vmBeingRendered = getVMBeingRendered();
    var renderMode = vmBeingRendered.renderMode,
        shadowMode = vmBeingRendered.shadowMode;

    if (renderMode === 0
    /* Light */
    ) {
      sc(children);
      return children;
    }

    if (shadowMode === 1
    /* Synthetic */
    ) {
      // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic
      sc(children);
    }

    return h('slot', data, children);
  } // [c]ustom element node


  function c(sel, Ctor, data) {
    var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EmptyArray;
    var vmBeingRendered = getVMBeingRendered();

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(sel), "c() 1st argument sel must be a string.");
      assert.isTrue(isFunction$1(Ctor), "c() 2nd argument Ctor must be a function.");
      assert.isTrue(isObject(data), "c() 3nd argument data must be an object.");
      assert.isTrue(arguments.length === 3 || isArray$1(children), "c() 4nd argument data must be an array."); // checking reserved internal data properties

      assert.isFalse(data.className && data.classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
      assert.isFalse(data.styleDecls && data.style, "vnode.data.styleDecls and vnode.data.style ambiguous declaration.");

      if (data.style && !isString(data.style)) {
        logError("Invalid 'style' attribute passed to <".concat(sel, "> is ignored. This attribute must be a string value."), vmBeingRendered);
      }

      if (arguments.length === 4) {
        forEach.call(children, function (childVnode) {
          if (childVnode != null) {
            assert.isTrue('type' in childVnode && 'sel' in childVnode && 'elm' in childVnode && 'key' in childVnode, "".concat(childVnode, " is not a vnode."));
          }
        });
      }
    }

    var key = data.key;
    var elm, aChildren, vm;
    var vnode = {
      type: 3
      /* CustomElement */
      ,
      sel: sel,
      data: data,
      children: children,
      elm: elm,
      key: key,
      ctor: Ctor,
      owner: vmBeingRendered,
      mode: 'open',
      aChildren: aChildren,
      vm: vm
    };
    addVNodeToChildLWC(vnode);
    return vnode;
  } // [i]terable node


  function i(iterable, factory) {
    var list = []; // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic

    sc(list);
    var vmBeingRendered = getVMBeingRendered();

    if (isUndefined$1(iterable) || iterable === null) {
      if (process.env.NODE_ENV !== 'production') {
        logError("Invalid template iteration for value \"".concat(toString$1(iterable), "\" in ").concat(vmBeingRendered, ". It must be an Array or an iterable Object."), vmBeingRendered);
      }

      return list;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.isFalse(isUndefined$1(iterable[SymbolIterator]), "Invalid template iteration for value `".concat(toString$1(iterable), "` in ").concat(vmBeingRendered, ". It must be an array-like object and not `null` nor `undefined`."));
    }

    var iterator = iterable[SymbolIterator]();

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(iterator && isFunction$1(iterator.next), "Invalid iterator function for \"".concat(toString$1(iterable), "\" in ").concat(vmBeingRendered, "."));
    }

    var next = iterator.next();
    var j = 0;
    var _next = next,
        value = _next.value,
        last = _next.done;
    var keyMap;
    var iterationError;

    if (process.env.NODE_ENV !== 'production') {
      keyMap = create(null);
    }

    while (last === false) {
      // implementing a look-back-approach because we need to know if the element is the last
      next = iterator.next();
      last = next.done; // template factory logic based on the previous collected value

      var vnode = factory(value, j, j === 0, last === true);

      if (isArray$1(vnode)) {
        ArrayPush$1.apply(list, vnode);
      } else {
        ArrayPush$1.call(list, vnode);
      }

      if (process.env.NODE_ENV !== 'production') {
        var vnodes = isArray$1(vnode) ? vnode : [vnode];
        forEach.call(vnodes, function (childVnode) {
          if (!isNull(childVnode) && isObject(childVnode) && !isUndefined$1(childVnode.sel)) {
            var key = childVnode.key;

            if (isString(key) || isNumber(key)) {
              if (keyMap[key] === 1 && isUndefined$1(iterationError)) {
                iterationError = "Duplicated \"key\" attribute value for \"<".concat(childVnode.sel, ">\" in ").concat(vmBeingRendered, " for item number ").concat(j, ". A key with value \"").concat(childVnode.key, "\" appears more than once in the iteration. Key values must be unique numbers or strings.");
              }

              keyMap[key] = 1;
            } else if (isUndefined$1(iterationError)) {
              iterationError = "Invalid \"key\" attribute value in \"<".concat(childVnode.sel, ">\" in ").concat(vmBeingRendered, " for item number ").concat(j, ". Set a unique \"key\" value on all iterated child elements.");
            }
          }
        });
      } // preparing next value


      j += 1;
      value = next.value;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!isUndefined$1(iterationError)) {
        logError(iterationError, vmBeingRendered);
      }
    }

    return list;
  }
  /**
   * [f]lattening
   */


  function f(items) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isArray$1(items), 'flattening api can only work with arrays.');
    }

    var len = items.length;
    var flattened = []; // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic

    sc(flattened);

    for (var j = 0; j < len; j += 1) {
      var item = items[j];

      if (isArray$1(item)) {
        ArrayPush$1.apply(flattened, item);
      } else {
        ArrayPush$1.call(flattened, item);
      }
    }

    return flattened;
  } // [t]ext node


  function t(text) {
    var sel, key, elm;
    return {
      type: 0
      /* Text */
      ,
      sel: sel,
      text: text,
      elm: elm,
      key: key,
      owner: getVMBeingRendered()
    };
  } // [co]mment node


  function co(text) {
    var sel, key, elm;
    return {
      type: 1
      /* Comment */
      ,
      sel: sel,
      text: text,
      elm: elm,
      key: key,
      owner: getVMBeingRendered()
    };
  } // [d]ynamic text


  function d(value) {
    return value == null ? '' : String(value);
  } // [b]ind function


  function b(fn) {
    var vmBeingRendered = getVMBeingRendered();

    if (isNull(vmBeingRendered)) {
      throw new Error();
    }

    var vm = vmBeingRendered;
    return function (event) {
      invokeEventListener(vm, fn, vm.component, event);
    };
  } // [k]ey function


  function k(compilerKey, obj) {
    switch (_typeof(obj)) {
      case 'number':
      case 'string':
        return compilerKey + ':' + obj;

      case 'object':
        if (process.env.NODE_ENV !== 'production') {
          assert.fail("Invalid key value \"".concat(obj, "\" in ").concat(getVMBeingRendered(), ". Key must be a string or number."));
        }

    }
  } // [g]lobal [id] function


  function gid(id) {
    var vmBeingRendered = getVMBeingRendered();

    if (isUndefined$1(id) || id === '') {
      if (process.env.NODE_ENV !== 'production') {
        logError("Invalid id value \"".concat(id, "\". The id attribute must contain a non-empty string."), vmBeingRendered);
      }

      return id;
    } // We remove attributes when they are assigned a value of null


    if (isNull(id)) {
      return null;
    }

    var idx = vmBeingRendered.idx,
        shadowMode = vmBeingRendered.shadowMode;

    if (shadowMode === 1
    /* Synthetic */
    ) {
      return StringReplace.call(id, /\S+/g, function (id) {
        return "".concat(id, "-").concat(idx);
      });
    }

    return id;
  } // [f]ragment [id] function


  function fid(url) {
    var vmBeingRendered = getVMBeingRendered();

    if (isUndefined$1(url) || url === '') {
      if (process.env.NODE_ENV !== 'production') {
        if (isUndefined$1(url)) {
          logError("Undefined url value for \"href\" or \"xlink:href\" attribute. Expected a non-empty string.", vmBeingRendered);
        }
      }

      return url;
    } // We remove attributes when they are assigned a value of null


    if (isNull(url)) {
      return null;
    }

    var idx = vmBeingRendered.idx,
        shadowMode = vmBeingRendered.shadowMode; // Apply transformation only for fragment-only-urls, and only in shadow DOM

    if (shadowMode === 1
    /* Synthetic */
    && /^#/.test(url)) {
      return "".concat(url, "-").concat(idx);
    }

    return url;
  }
  /**
   * Map to store an index value assigned to any dynamic component reference ingested
   * by dc() api. This allows us to generate a unique unique per template per dynamic
   * component reference to avoid diffing algo mismatches.
   */


  var DynamicImportedComponentMap = new Map();
  var dynamicImportedComponentCounter = 0;
  /**
   * create a dynamic component via `<x-foo lwc:dynamic={Ctor}>`
   */

  function dc(sel, Ctor, data) {
    var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EmptyArray;

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(sel), "dc() 1st argument sel must be a string.");
      assert.isTrue(isObject(data), "dc() 3nd argument data must be an object.");
      assert.isTrue(arguments.length === 3 || isArray$1(children), "dc() 4nd argument data must be an array.");
    } // null or undefined values should produce a null value in the VNodes


    if (Ctor == null) {
      return null;
    }

    if (!isComponentConstructor(Ctor)) {
      throw new Error("Invalid LWC Constructor ".concat(toString$1(Ctor), " for custom element <").concat(sel, ">."));
    }

    var idx = DynamicImportedComponentMap.get(Ctor);

    if (isUndefined$1(idx)) {
      idx = dynamicImportedComponentCounter++;
      DynamicImportedComponentMap.set(Ctor, idx);
    } // the new vnode key is a mix of idx and compiler key, this is required by the diffing algo
    // to identify different constructors as vnodes with different keys to avoid reusing the
    // element used for previous constructors.
    // Shallow clone is necessary here becuase VElementData may be shared across VNodes due to
    // hoisting optimization.


    var newData = Object.assign(Object.assign({}, data), {
      key: "dc:".concat(idx, ":").concat(data.key)
    });
    return c(sel, Ctor, newData, children);
  }
  /**
   * slow children collection marking mechanism. this API allows the compiler to signal
   * to the engine that a particular collection of children must be diffed using the slow
   * algo based on keys due to the nature of the list. E.g.:
   *
   *   - slot element's children: the content of the slot has to be dynamic when in synthetic
   *                              shadow mode because the `vnode.children` might be the slotted
   *                              content vs default content, in which case the size and the
   *                              keys are not matching.
   *   - children that contain dynamic components
   *   - children that are produced by iteration
   *
   */


  function sc(vnodes) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isArray$1(vnodes), 'sc() api can only work with arrays.');
    } // We have to mark the vnodes collection as dynamic so we can later on
    // choose to use the snabbdom virtual dom diffing algo instead of our
    // static dummy algo.


    markAsDynamicChildren(vnodes);
    return vnodes;
  }
  /**
   * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
   * libraries to sanitize HTML content. This hook process the content passed via the template to
   * lwc:inner-html directive.
   * It is meant to be overridden with setSanitizeHtmlContentHook, it throws an error by default.
   */


  var sanitizeHtmlContentHook = function sanitizeHtmlContentHook() {
    // locker-service patches this function during runtime to sanitize HTML content.
    throw new Error('sanitizeHtmlContent hook must be implemented.');
  };
  /**
   * Sets the sanitizeHtmlContentHook.
   */


  function setSanitizeHtmlContentHook(newHookImpl) {
    sanitizeHtmlContentHook = newHookImpl;
  } // [s]anitize [h]tml [c]ontent


  function shc(content) {
    return sanitizeHtmlContentHook(content);
  }

  var api = freeze({
    s: s,
    h: h,
    c: c,
    i: i,
    f: f,
    t: t,
    d: d,
    b: b,
    k: k,
    co: co,
    dc: dc,
    ti: ti,
    gid: gid,
    fid: fid,
    shc: shc
  });
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function makeHostToken(token) {
    return "".concat(token, "-host");
  }

  function createInlineStyleVNode(content) {
    return api.h('style', {
      key: 'style',
      attrs: {
        type: 'text/css'
      }
    }, [api.t(content)]);
  }

  function updateStylesheetToken(vm, template) {
    var elm = vm.elm,
        context = vm.context,
        renderMode = vm.renderMode,
        shadowMode = vm.shadowMode;
    var newStylesheets = template.stylesheets,
        newStylesheetToken = template.stylesheetToken;
    var isSyntheticShadow = renderMode === 1
    /* Shadow */
    && shadowMode === 1
    /* Synthetic */
    ;
    var hasScopedStyles = context.hasScopedStyles;
    var newToken;
    var newHasTokenInClass;
    var newHasTokenInAttribute; // Reset the styling token applied to the host element.

    var oldToken = context.stylesheetToken,
        oldHasTokenInClass = context.hasTokenInClass,
        oldHasTokenInAttribute = context.hasTokenInAttribute;

    if (!isUndefined$1(oldToken)) {
      if (oldHasTokenInClass) {
        getClassList$1(elm).remove(makeHostToken(oldToken));
      }

      if (oldHasTokenInAttribute) {
        removeAttribute$1(elm, makeHostToken(oldToken));
      }
    } // Apply the new template styling token to the host element, if the new template has any
    // associated stylesheets. In the case of light DOM, also ensure there is at least one scoped stylesheet.


    if (!isUndefined$1(newStylesheets) && newStylesheets.length !== 0) {
      newToken = newStylesheetToken;
    } // Set the new styling token on the host element


    if (!isUndefined$1(newToken)) {
      if (hasScopedStyles) {
        getClassList$1(elm).add(makeHostToken(newToken));
        newHasTokenInClass = true;
      }

      if (isSyntheticShadow) {
        setAttribute$1(elm, makeHostToken(newToken), '');
        newHasTokenInAttribute = true;
      }
    } // Update the styling tokens present on the context object.


    context.stylesheetToken = newToken;
    context.hasTokenInClass = newHasTokenInClass;
    context.hasTokenInAttribute = newHasTokenInAttribute;
  }

  function evaluateStylesheetsContent(stylesheets, stylesheetToken, vm) {
    var content = [];
    var root;

    for (var _i17 = 0; _i17 < stylesheets.length; _i17++) {
      var stylesheet = stylesheets[_i17];

      if (isArray$1(stylesheet)) {
        ArrayPush$1.apply(content, evaluateStylesheetsContent(stylesheet, stylesheetToken, vm));
      } else {
        if (process.env.NODE_ENV !== 'production') {
          // Check for compiler version mismatch in dev mode only
          checkVersionMismatch(stylesheet, 'stylesheet'); // in dev-mode, we support hot swapping of stylesheet, which means that
          // the component instance might be attempting to use an old version of
          // the stylesheet, while internally, we have a replacement for it.

          stylesheet = getStyleOrSwappedStyle(stylesheet);
        }

        var isScopedCss = stylesheet[KEY__SCOPED_CSS]; // Apply the scope token only if the stylesheet itself is scoped, or if we're rendering synthetic shadow.

        var scopeToken = isScopedCss || vm.shadowMode === 1
        /* Synthetic */
        && vm.renderMode === 1
        /* Shadow */
        ? stylesheetToken : undefined; // Use the actual `:host` selector if we're rendering global CSS for light DOM, or if we're rendering
        // native shadow DOM. Synthetic shadow DOM never uses `:host`.

        var useActualHostSelector = vm.renderMode === 0
        /* Light */
        ? !isScopedCss : vm.shadowMode === 0
        /* Native */
        ; // Use the native :dir() pseudoclass only in native shadow DOM. Otherwise, in synthetic shadow,
        // we use an attribute selector on the host to simulate :dir().

        var useNativeDirPseudoclass = void 0;

        if (vm.renderMode === 1
        /* Shadow */
        ) {
          useNativeDirPseudoclass = vm.shadowMode === 0
          /* Native */
          ;
        } else {
          // Light DOM components should only render `[dir]` if they're inside of a synthetic shadow root.
          // At the top level (root is null) or inside of a native shadow root, they should use `:dir()`.
          if (isUndefined$1(root)) {
            // Only calculate the root once as necessary
            root = getNearestShadowComponent(vm);
          }

          useNativeDirPseudoclass = isNull(root) || root.shadowMode === 0
          /* Native */
          ;
        }

        ArrayPush$1.call(content, stylesheet(scopeToken, useActualHostSelector, useNativeDirPseudoclass));
      }
    }

    return content;
  }

  function getStylesheetsContent(vm, template) {
    var stylesheets = template.stylesheets,
        stylesheetToken = template.stylesheetToken;
    var content = [];

    if (!isUndefined$1(stylesheets) && stylesheets.length !== 0) {
      content = evaluateStylesheetsContent(stylesheets, stylesheetToken, vm);
    }

    return content;
  } // It might be worth caching this to avoid doing the lookup repeatedly, but
  // perf testing has not shown it to be a huge improvement yet:
  // https://github.com/salesforce/lwc/pull/2460#discussion_r691208892


  function getNearestShadowComponent(vm) {
    var owner = vm;

    while (!isNull(owner)) {
      if (owner.renderMode === 1
      /* Shadow */
      ) {
        return owner;
      }

      owner = owner.owner;
    }

    return owner;
  }

  function getNearestNativeShadowComponent(vm) {
    var owner = getNearestShadowComponent(vm);

    if (!isNull(owner) && owner.shadowMode === 1
    /* Synthetic */
    ) {
      // Synthetic-within-native is impossible. So if the nearest shadow component is
      // synthetic, we know we won't find a native component if we go any further.
      return null;
    }

    return owner;
  }

  function createStylesheet(vm, stylesheets) {
    var renderMode = vm.renderMode,
        shadowMode = vm.shadowMode;

    if (renderMode === 1
    /* Shadow */
    && shadowMode === 1
    /* Synthetic */
    ) {
      for (var _i18 = 0; _i18 < stylesheets.length; _i18++) {
        insertGlobalStylesheet$1(stylesheets[_i18]);
      }
    } else if (ssr$1 || isHydrating$1()) {
      // Note: We need to ensure that during hydration, the stylesheets method is the same as those in ssr.
      //       This works in the client, because the stylesheets are created, and cached in the VM
      //       the first time the VM renders.
      // native shadow or light DOM, SSR
      var combinedStylesheetContent = ArrayJoin.call(stylesheets, '\n');
      return createInlineStyleVNode(combinedStylesheetContent);
    } else {
      // native shadow or light DOM, DOM renderer
      var root = getNearestNativeShadowComponent(vm);
      var isGlobal = isNull(root);

      for (var _i19 = 0; _i19 < stylesheets.length; _i19++) {
        if (isGlobal) {
          insertGlobalStylesheet$1(stylesheets[_i19]);
        } else {
          // local level
          insertStylesheet$1(stylesheets[_i19], root.shadowRoot);
        }
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


  var operationIdNameMapping = ['constructor', 'render', 'patch', 'connectedCallback', 'renderedCallback', 'disconnectedCallback', 'errorCallback', 'lwc-hydrate', 'lwc-rehydrate']; // Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
  // JSDom (used in Jest) for example doesn't implement the UserTiming APIs.

  var isUserTimingSupported = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';
  var start = !isUserTimingSupported ? noop : function (markName) {
    performance.mark(markName);
  };
  var end = !isUserTimingSupported ? noop : function (measureName, markName) {
    performance.measure(measureName, markName); // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.

    performance.clearMarks(markName);
    performance.clearMeasures(measureName);
  };

  function getOperationName(opId) {
    return operationIdNameMapping[opId];
  }

  function getMeasureName(opId, vm) {
    return "".concat(getComponentTag(vm), " - ").concat(getOperationName(opId));
  }

  function getMarkName(opId, vm) {
    // Adding the VM idx to the mark name creates a unique mark name component instance. This is necessary to produce
    // the right measures for components that are recursive.
    return "".concat(getMeasureName(opId, vm), " - ").concat(vm.idx);
  }
  /** Indicates if operations should be logged via the User Timing API. */


  var isMeasureEnabled = process.env.NODE_ENV !== 'production';
  /** Indicates if operations should be logged by the profiler. */

  var isProfilerEnabled = false;
  /** The currently assigned profiler dispatcher. */

  var currentDispatcher = noop;
  var profilerControl = {
    enableProfiler: function enableProfiler() {
      isProfilerEnabled = true;
    },
    disableProfiler: function disableProfiler() {
      isProfilerEnabled = false;
    },
    attachDispatcher: function attachDispatcher(dispatcher) {
      currentDispatcher = dispatcher;
      this.enableProfiler();
    },
    detachDispatcher: function detachDispatcher() {
      var dispatcher = currentDispatcher;
      currentDispatcher = noop;
      this.disableProfiler();
      return dispatcher;
    }
  };

  function logOperationStart(opId, vm) {
    if (isMeasureEnabled) {
      var markName = getMarkName(opId, vm);
      start(markName);
    }

    if (isProfilerEnabled) {
      currentDispatcher(opId, 0
      /* Start */
      , vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
  }

  function logOperationEnd(opId, vm) {
    if (isMeasureEnabled) {
      var markName = getMarkName(opId, vm);
      var measureName = getMeasureName(opId, vm);
      end(measureName, markName);
    }

    if (isProfilerEnabled) {
      currentDispatcher(opId, 1
      /* Stop */
      , vm.tagName, vm.idx, vm.renderMode, vm.shadowMode);
    }
  }

  function logGlobalOperationStart(opId, vm) {
    if (isMeasureEnabled) {
      var opName = getOperationName(opId);
      var markName = isUndefined$1(vm) ? opName : getMarkName(opId, vm);
      start(markName);
    }

    if (isProfilerEnabled) {
      currentDispatcher(opId, 0
      /* Start */
      , vm === null || vm === void 0 ? void 0 : vm.tagName, vm === null || vm === void 0 ? void 0 : vm.idx, vm === null || vm === void 0 ? void 0 : vm.renderMode, vm === null || vm === void 0 ? void 0 : vm.shadowMode);
    }
  }

  function logGlobalOperationEnd(opId, vm) {
    if (isMeasureEnabled) {
      var opName = getOperationName(opId);
      var markName = isUndefined$1(vm) ? opName : getMarkName(opId, vm);
      end(opName, markName);
    }

    if (isProfilerEnabled) {
      currentDispatcher(opId, 1
      /* Stop */
      , vm === null || vm === void 0 ? void 0 : vm.tagName, vm === null || vm === void 0 ? void 0 : vm.idx, vm === null || vm === void 0 ? void 0 : vm.renderMode, vm === null || vm === void 0 ? void 0 : vm.shadowMode);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var isUpdatingTemplate = false;
  var vmBeingRendered = null;

  function getVMBeingRendered() {
    return vmBeingRendered;
  }

  function setVMBeingRendered(vm) {
    vmBeingRendered = vm;
  }

  function validateSlots(vm, html) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var cmpSlots = vm.cmpSlots;
    var _html$slots = html.slots,
        slots = _html$slots === void 0 ? EmptyArray : _html$slots;

    for (var slotName in cmpSlots) {
      // eslint-disable-next-line lwc-internal/no-production-assert
      assert.isTrue(isArray$1(cmpSlots[slotName]), "Slots can only be set to an array, instead received ".concat(toString$1(cmpSlots[slotName]), " for slot \"").concat(slotName, "\" in ").concat(vm, "."));

      if (slotName !== '' && ArrayIndexOf.call(slots, slotName) === -1) {
        // TODO [#1297]: this should never really happen because the compiler should always validate
        // eslint-disable-next-line lwc-internal/no-production-assert
        logError("Ignoring unknown provided slot name \"".concat(slotName, "\" in ").concat(vm, ". Check for a typo on the slot attribute."), vm);
      }
    }
  }

  function validateLightDomTemplate(template, vm) {
    if (template === defaultEmptyTemplate) return;

    if (vm.renderMode === 0
    /* Light */
    ) {
      assert.isTrue(template.renderMode === 'light', "Light DOM components can't render shadow DOM templates. Add an 'lwc:render-mode=\"light\"' directive to the root template tag of ".concat(getComponentTag(vm), "."));
    } else {
      assert.isTrue(isUndefined$1(template.renderMode), "Shadow DOM components template can't render light DOM templates. Either remove the 'lwc:render-mode' directive from ".concat(getComponentTag(vm), " or set it to 'lwc:render-mode=\"shadow\""));
    }
  }

  function evaluateTemplate(vm, html) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isFunction$1(html), "evaluateTemplate() second argument must be an imported template instead of ".concat(toString$1(html))); // in dev-mode, we support hot swapping of templates, which means that
      // the component instance might be attempting to use an old version of
      // the template, while internally, we have a replacement for it.

      html = getTemplateOrSwappedTemplate(html);
    }

    var isUpdatingTemplateInception = isUpdatingTemplate;
    var vmOfTemplateBeingUpdatedInception = vmBeingRendered;
    var vnodes = [];
    runWithBoundaryProtection(vm, vm.owner, function () {
      // pre
      vmBeingRendered = vm;
      logOperationStart(1
      /* Render */
      , vm);
    }, function () {
      // job
      var component = vm.component,
          context = vm.context,
          cmpSlots = vm.cmpSlots,
          cmpTemplate = vm.cmpTemplate,
          tro = vm.tro;
      tro.observe(function () {
        // Reset the cache memoizer for template when needed.
        if (html !== cmpTemplate) {
          if (process.env.NODE_ENV !== 'production') {
            validateLightDomTemplate(html, vm);
          } // Perf opt: do not reset the shadow root during the first rendering (there is
          // nothing to reset).


          if (!isNull(cmpTemplate)) {
            // It is important to reset the content to avoid reusing similar elements
            // generated from a different template, because they could have similar IDs,
            // and snabbdom just rely on the IDs.
            resetComponentRoot(vm);
          } // Check that the template was built by the compiler.


          if (!isTemplateRegistered(html)) {
            throw new TypeError("Invalid template returned by the render() method on ".concat(vm, ". It must return an imported template (e.g.: `import html from \"./").concat(vm.def.name, ".html\"`), instead, it has returned: ").concat(toString$1(html), "."));
          }

          vm.cmpTemplate = html; // Create a brand new template cache for the swapped templated.

          context.tplCache = create(null); // Set the computeHasScopedStyles property in the context, to avoid recomputing it repeatedly.

          context.hasScopedStyles = computeHasScopedStyles(html); // Update the scoping token on the host element.

          updateStylesheetToken(vm, html); // Evaluate, create stylesheet and cache the produced VNode for future
          // re-rendering.

          var stylesheetsContent = getStylesheetsContent(vm, html);
          context.styleVNode = stylesheetsContent.length === 0 ? null : createStylesheet(vm, stylesheetsContent);
        }

        if (process.env.NODE_ENV !== 'production') {
          // validating slots in every rendering since the allocated content might change over time
          validateSlots(vm, html); // add the VM to the list of host VMs that can be re-rendered if html is swapped

          setActiveVM(vm);
        } // right before producing the vnodes, we clear up all internal references
        // to custom elements from the template.


        vm.velements = []; // Set the global flag that template is being updated

        isUpdatingTemplate = true;
        vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);
        var styleVNode = context.styleVNode;

        if (!isNull(styleVNode)) {
          ArrayUnshift.call(vnodes, styleVNode);
        }
      });
    }, function () {
      // post
      isUpdatingTemplate = isUpdatingTemplateInception;
      vmBeingRendered = vmOfTemplateBeingUpdatedInception;
      logOperationEnd(1
      /* Render */
      , vm);
    });

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isArray$1(vnodes), "Compiler should produce html functions that always return an array.");
    }

    return vnodes;
  }

  function computeHasScopedStyles(template) {
    var stylesheets = template.stylesheets;

    if (!isUndefined$1(stylesheets)) {
      for (var _i20 = 0; _i20 < stylesheets.length; _i20++) {
        if (isTrue(stylesheets[_i20][KEY__SCOPED_CSS])) {
          return true;
        }
      }
    }

    return false;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var isInvokingRender = false;
  var vmBeingConstructed = null;

  function isBeingConstructed(vm) {
    return vmBeingConstructed === vm;
  }

  function invokeComponentCallback(vm, fn, args) {
    var component = vm.component,
        callHook = vm.callHook,
        owner = vm.owner;
    runWithBoundaryProtection(vm, owner, noop, function () {
      callHook(component, fn, args);
    }, noop);
  }

  function invokeComponentConstructor(vm, Ctor) {
    var vmBeingConstructedInception = vmBeingConstructed;
    var error;
    logOperationStart(0
    /* Constructor */
    , vm);
    vmBeingConstructed = vm;
    /**
     * Constructors don't need to be wrapped with a boundary because for root elements
     * it should throw, while elements from template are already wrapped by a boundary
     * associated to the diffing algo.
     */

    try {
      // job
      var result = new Ctor(); // Check indirectly if the constructor result is an instance of LightningElement. Using
      // the "instanceof" operator would not work here since Locker Service provides its own
      // implementation of LightningElement, so we indirectly check if the base constructor is
      // invoked by accessing the component on the vm.

      if (vmBeingConstructed.component !== result) {
        throw new TypeError('Invalid component constructor, the class should extend LightningElement.');
      }
    } catch (e) {
      error = Object(e);
    } finally {
      logOperationEnd(0
      /* Constructor */
      , vm);
      vmBeingConstructed = vmBeingConstructedInception;

      if (!isUndefined$1(error)) {
        addErrorComponentStack(vm, error); // re-throwing the original error annotated after restoring the context

        throw error; // eslint-disable-line no-unsafe-finally
      }
    }
  }

  function invokeComponentRenderMethod(vm) {
    var render = vm.def.render,
        callHook = vm.callHook,
        component = vm.component,
        owner = vm.owner;
    var isRenderBeingInvokedInception = isInvokingRender;
    var vmBeingRenderedInception = getVMBeingRendered();
    var html;
    var renderInvocationSuccessful = false;
    runWithBoundaryProtection(vm, owner, function () {
      // pre
      isInvokingRender = true;
      setVMBeingRendered(vm);
    }, function () {
      // job
      vm.tro.observe(function () {
        html = callHook(component, render);
        renderInvocationSuccessful = true;
      });
    }, function () {
      // post
      isInvokingRender = isRenderBeingInvokedInception;
      setVMBeingRendered(vmBeingRenderedInception);
    }); // If render() invocation failed, process errorCallback in boundary and return an empty template

    return renderInvocationSuccessful ? evaluateTemplate(vm, html) : [];
  }

  function invokeEventListener(vm, fn, thisValue, event) {
    var callHook = vm.callHook,
        owner = vm.owner;
    runWithBoundaryProtection(vm, owner, noop, function () {
      // job
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isFunction$1(fn), "Invalid event handler for event '".concat(event.type, "' on ").concat(vm, "."));
      }

      callHook(thisValue, fn, [event]);
    }, noop);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var signedTemplateMap = new Map();
  /**
   * INTERNAL: This function can only be invoked by compiled code. The compiler
   * will prevent this function from being imported by userland code.
   */

  function registerComponent( // We typically expect a LightningElementConstructor, but technically you can call this with anything
  Ctor, _ref2) {
    var tmpl = _ref2.tmpl;

    if (isFunction$1(Ctor)) {
      if (process.env.NODE_ENV !== 'production') {
        checkVersionMismatch(Ctor, 'component');
      }

      signedTemplateMap.set(Ctor, tmpl);
    } // chaining this method as a way to wrap existing assignment of component constructor easily,
    // without too much transformation


    return Ctor;
  }

  function getComponentRegisteredTemplate(Ctor) {
    return signedTemplateMap.get(Ctor);
  }

  function getTemplateReactiveObserver(vm) {
    return new ReactiveObserver(function () {
      var isDirty = vm.isDirty;

      if (isFalse(isDirty)) {
        markComponentAsDirty(vm);
        scheduleRehydration(vm);
      }
    });
  }

  function renderComponent(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(vm.isDirty, "".concat(vm, " is not dirty."));
    }

    vm.tro.reset();
    var vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    vm.isScheduled = false;
    return vnodes;
  }

  function markComponentAsDirty(vm) {
    if (process.env.NODE_ENV !== 'production') {
      var _vmBeingRendered7 = getVMBeingRendered();

      assert.isFalse(vm.isDirty, "markComponentAsDirty() for ".concat(vm, " should not be called when the component is already dirty."));
      assert.isFalse(isInvokingRender, "markComponentAsDirty() for ".concat(vm, " cannot be called during rendering of ").concat(_vmBeingRendered7, "."));
      assert.isFalse(isUpdatingTemplate, "markComponentAsDirty() for ".concat(vm, " cannot be called while updating template of ").concat(_vmBeingRendered7, "."));
    }

    vm.isDirty = true;
  }

  var cmpEventListenerMap = new WeakMap();

  function getWrappedComponentsListener(vm, listener) {
    if (!isFunction$1(listener)) {
      throw new TypeError(); // avoiding problems with non-valid listeners
    }

    var wrappedListener = cmpEventListenerMap.get(listener);

    if (isUndefined$1(wrappedListener)) {
      wrappedListener = function wrappedListener(event) {
        invokeEventListener(vm, listener, undefined, event);
      };

      cmpEventListenerMap.set(listener, wrappedListener);
    }

    return wrappedListener;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var Services = create(null);
  var hooks = ['rendered', 'connected', 'disconnected'];
  /**
   * EXPERIMENTAL: This function allows for the registration of "services"
   * in LWC by exposing hooks into the component life-cycle. This API is
   * subject to change or being removed.
   */

  function register(service) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isObject(service), "Invalid service declaration, ".concat(service, ": service must be an object"));
    }

    for (var _i21 = 0; _i21 < hooks.length; ++_i21) {
      var hookName = hooks[_i21];

      if (hookName in service) {
        var l = Services[hookName];

        if (isUndefined$1(l)) {
          Services[hookName] = l = [];
        }

        ArrayPush$1.call(l, service[hookName]);
      }
    }
  }

  function invokeServiceHook(vm, cbs) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isArray$1(cbs) && cbs.length > 0, "Optimize invokeServiceHook() to be invoked only when needed");
    }

    var component = vm.component,
        def = vm.def,
        context = vm.context;

    for (var _i22 = 0, _len7 = cbs.length; _i22 < _len7; ++_i22) {
      cbs[_i22].call(undefined, component, {}, def, context);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var idx = 0;
  /** The internal slot used to associate different objects the engine manipulates with the VM */

  var ViewModelReflection = new WeakMap();

  function callHook(cmp, fn) {
    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    return fn.apply(cmp, args);
  }

  function setHook(cmp, prop, newValue) {
    cmp[prop] = newValue;
  }

  function getHook(cmp, prop) {
    return cmp[prop];
  }

  function rerenderVM(vm) {
    rehydrate(vm);
  }

  function connectRootElement(elm) {
    var vm = getAssociatedVM(elm);
    logGlobalOperationStart(7
    /* GlobalHydrate */
    , vm); // Usually means moving the element from one place to another, which is observable via
    // life-cycle hooks.

    if (vm.state === 1
    /* connected */
    ) {
      disconnectRootElement(elm);
    }

    runConnectedCallback(vm);
    rehydrate(vm);
    logGlobalOperationEnd(7
    /* GlobalHydrate */
    , vm);
  }

  function disconnectRootElement(elm) {
    var vm = getAssociatedVM(elm);
    resetComponentStateWhenRemoved(vm);
  }

  function appendVM(vm) {
    rehydrate(vm);
  } // just in case the component comes back, with this we guarantee re-rendering it
  // while preventing any attempt to rehydration until after reinsertion.


  function resetComponentStateWhenRemoved(vm) {
    var state = vm.state;

    if (state !== 2
    /* disconnected */
    ) {
      var oar = vm.oar,
          tro = vm.tro; // Making sure that any observing record will not trigger the rehydrated on this vm

      tro.reset(); // Making sure that any observing accessor record will not trigger the setter to be reinvoked

      for (var key in oar) {
        oar[key].reset();
      }

      runDisconnectedCallback(vm); // Spec: https://dom.spec.whatwg.org/#concept-node-remove (step 14-15)

      runChildNodesDisconnectedCallback(vm);
      runLightChildNodesDisconnectedCallback(vm);
    }

    if (process.env.NODE_ENV !== 'production') {
      removeActiveVM(vm);
    }
  } // this method is triggered by the diffing algo only when a vnode from the
  // old vnode.children is removed from the DOM.


  function removeVM(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm.state === 1
      /* connected */
      || vm.state === 2
      /* disconnected */
      , "".concat(vm, " must have been connected."));
    }

    resetComponentStateWhenRemoved(vm);
  }

  function getNearestShadowAncestor(vm) {
    var ancestor = vm.owner;

    while (!isNull(ancestor) && ancestor.renderMode === 0
    /* Light */
    ) {
      ancestor = ancestor.owner;
    }

    return ancestor;
  }

  function createVM(elm, ctor, options) {
    var mode = options.mode,
        owner = options.owner,
        tagName = options.tagName;
    var def = getComponentInternalDef(ctor);
    var vm = {
      elm: elm,
      def: def,
      idx: idx++,
      state: 0
      /* created */
      ,
      isScheduled: false,
      isDirty: true,
      tagName: tagName,
      mode: mode,
      owner: owner,
      children: EmptyArray,
      aChildren: EmptyArray,
      velements: EmptyArray,
      cmpProps: create(null),
      cmpFields: create(null),
      cmpSlots: create(null),
      oar: create(null),
      cmpTemplate: null,
      renderMode: def.renderMode,
      context: {
        stylesheetToken: undefined,
        hasTokenInClass: undefined,
        hasTokenInAttribute: undefined,
        hasScopedStyles: undefined,
        styleVNode: null,
        tplCache: EmptyObject,
        wiredConnecting: EmptyArray,
        wiredDisconnecting: EmptyArray
      },
      // Properties set right after VM creation.
      tro: null,
      shadowMode: null,
      // Properties set by the LightningElement constructor.
      component: null,
      shadowRoot: null,
      renderRoot: null,
      callHook: callHook,
      setHook: setHook,
      getHook: getHook
    };
    vm.shadowMode = computeShadowMode(vm);
    vm.tro = getTemplateReactiveObserver(vm);

    if (process.env.NODE_ENV !== 'production') {
      vm.toString = function () {
        return "[object:vm ".concat(def.name, " (").concat(vm.idx, ")]");
      };

      if (runtimeFlags.ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST) {
        vm.shadowMode = 0
        /* Native */
        ;
      }
    } // Create component instance associated to the vm and the element.


    invokeComponentConstructor(vm, def.ctor); // Initializing the wire decorator per instance only when really needed

    if (hasWireAdapters(vm)) {
      installWireAdapters(vm);
    }

    return vm;
  }

  function computeShadowMode(vm) {
    var def = vm.def;
    var shadowMode;

    if (isSyntheticShadowDefined$1) {
      if (def.renderMode === 0
      /* Light */
      ) {
        // ShadowMode.Native implies "not synthetic shadow" which is consistent with how
        // everything defaults to native when the synthetic shadow polyfill is unavailable.
        shadowMode = 0
        /* Native */
        ;
      } else if (isNativeShadowDefined$1) {
        // Not combined with above condition because @lwc/features only supports identifiers in
        // the if-condition.
        if (runtimeFlags.ENABLE_MIXED_SHADOW_MODE) {
          if (def.shadowSupportMode === "any"
          /* Any */
          ) {
            shadowMode = 0
            /* Native */
            ;
          } else {
            var shadowAncestor = getNearestShadowAncestor(vm);

            if (!isNull(shadowAncestor) && shadowAncestor.shadowMode === 0
            /* Native */
            ) {
              // Transitive support for native Shadow DOM. A component in native mode
              // transitively opts all of its descendants into native.
              shadowMode = 0
              /* Native */
              ;
            } else {
              // Synthetic if neither this component nor any of its ancestors are configured
              // to be native.
              shadowMode = 1
              /* Synthetic */
              ;
            }
          }
        } else {
          shadowMode = 1
          /* Synthetic */
          ;
        }
      } else {
        // Synthetic if there is no native Shadow DOM support.
        shadowMode = 1
        /* Synthetic */
        ;
      }
    } else {
      // Native if the synthetic shadow polyfill is unavailable.
      shadowMode = 0
      /* Native */
      ;
    }

    return shadowMode;
  }

  function assertIsVM(obj) {
    if (isNull(obj) || !isObject(obj) || !('renderRoot' in obj)) {
      throw new TypeError("".concat(obj, " is not a VM."));
    }
  }

  function associateVM(obj, vm) {
    ViewModelReflection.set(obj, vm);
  }

  function getAssociatedVM(obj) {
    var vm = ViewModelReflection.get(obj);

    if (process.env.NODE_ENV !== 'production') {
      assertIsVM(vm);
    }

    return vm;
  }

  function getAssociatedVMIfPresent(obj) {
    var maybeVm = ViewModelReflection.get(obj);

    if (process.env.NODE_ENV !== 'production') {
      if (!isUndefined$1(maybeVm)) {
        assertIsVM(maybeVm);
      }
    }

    return maybeVm;
  }

  function rehydrate(vm) {
    if (isTrue(vm.isDirty)) {
      var children = renderComponent(vm);
      patchShadowRoot(vm, children);
    }
  }

  function patchShadowRoot(vm, newCh) {
    var renderRoot = vm.renderRoot,
        oldCh = vm.children; // caching the new children collection

    vm.children = newCh;

    if (newCh.length > 0 || oldCh.length > 0) {
      // patch function mutates vnodes by adding the element reference,
      // however, if patching fails it contains partial changes.
      if (oldCh !== newCh) {
        runWithBoundaryProtection(vm, vm, function () {
          // pre
          logOperationStart(2
          /* Patch */
          , vm);
        }, function () {
          // job
          patchChildren(oldCh, newCh, renderRoot);
        }, function () {
          // post
          logOperationEnd(2
          /* Patch */
          , vm);
        });
      }
    }

    if (vm.state === 1
    /* connected */
    ) {
      // If the element is connected, that means connectedCallback was already issued, and
      // any successive rendering should finish with the call to renderedCallback, otherwise
      // the connectedCallback will take care of calling it in the right order at the end of
      // the current rehydration process.
      runRenderedCallback(vm);
    }
  }

  function runRenderedCallback(vm) {
    var renderedCallback = vm.def.renderedCallback;

    if (isTrue(ssr$1)) {
      return;
    }

    var rendered = Services.rendered;

    if (rendered) {
      invokeServiceHook(vm, rendered);
    }

    if (!isUndefined$1(renderedCallback)) {
      logOperationStart(4
      /* RenderedCallback */
      , vm);
      invokeComponentCallback(vm, renderedCallback);
      logOperationEnd(4
      /* RenderedCallback */
      , vm);
    }
  }

  var rehydrateQueue = [];

  function flushRehydrationQueue() {
    logGlobalOperationStart(8
    /* GlobalRehydrate */
    );

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(rehydrateQueue.length, "If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ".concat(rehydrateQueue, "."));
    }

    var vms = rehydrateQueue.sort(function (a, b) {
      return a.idx - b.idx;
    });
    rehydrateQueue = []; // reset to a new queue

    for (var _i23 = 0, _len8 = vms.length; _i23 < _len8; _i23 += 1) {
      var vm = vms[_i23];

      try {
        rehydrate(vm);
      } catch (error) {
        if (_i23 + 1 < _len8) {
          // pieces of the queue are still pending to be rehydrated, those should have priority
          if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
          }

          ArrayUnshift.apply(rehydrateQueue, ArraySlice.call(vms, _i23 + 1));
        } // we need to end the measure before throwing.


        logGlobalOperationEnd(8
        /* GlobalRehydrate */
        ); // re-throwing the original error will break the current tick, but since the next tick is
        // already scheduled, it should continue patching the rest.

        throw error; // eslint-disable-line no-unsafe-finally
      }
    }

    logGlobalOperationEnd(8
    /* GlobalRehydrate */
    );
  }

  function runConnectedCallback(vm) {
    var state = vm.state;

    if (state === 1
    /* connected */
    ) {
      return; // nothing to do since it was already connected
    }

    vm.state = 1
    /* connected */
    ; // reporting connection

    var connected = Services.connected;

    if (connected) {
      invokeServiceHook(vm, connected);
    }

    if (hasWireAdapters(vm)) {
      connectWireAdapters(vm);
    }

    var connectedCallback = vm.def.connectedCallback;

    if (!isUndefined$1(connectedCallback)) {
      logOperationStart(3
      /* ConnectedCallback */
      , vm);
      invokeComponentCallback(vm, connectedCallback);
      logOperationEnd(3
      /* ConnectedCallback */
      , vm);
    }
  }

  function hasWireAdapters(vm) {
    return getOwnPropertyNames$1(vm.def.wire).length > 0;
  }

  function runDisconnectedCallback(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm.state !== 2
      /* disconnected */
      , "".concat(vm, " must be inserted."));
    }

    if (isFalse(vm.isDirty)) {
      // this guarantees that if the component is reused/reinserted,
      // it will be re-rendered because we are disconnecting the reactivity
      // linking, so mutations are not automatically reflected on the state
      // of disconnected components.
      vm.isDirty = true;
    }

    vm.state = 2
    /* disconnected */
    ; // reporting disconnection

    var disconnected = Services.disconnected;

    if (disconnected) {
      invokeServiceHook(vm, disconnected);
    }

    if (hasWireAdapters(vm)) {
      disconnectWireAdapters(vm);
    }

    var disconnectedCallback = vm.def.disconnectedCallback;

    if (!isUndefined$1(disconnectedCallback)) {
      logOperationStart(5
      /* DisconnectedCallback */
      , vm);
      invokeComponentCallback(vm, disconnectedCallback);
      logOperationEnd(5
      /* DisconnectedCallback */
      , vm);
    }
  }

  function runChildNodesDisconnectedCallback(vm) {
    var vCustomElementCollection = vm.velements; // Reporting disconnection for every child in inverse order since they are
    // inserted in reserved order.

    for (var _i24 = vCustomElementCollection.length - 1; _i24 >= 0; _i24 -= 1) {
      var elm = vCustomElementCollection[_i24].elm; // There are two cases where the element could be undefined:
      // * when there is an error during the construction phase, and an error
      //   boundary picks it, there is a possibility that the VCustomElement
      //   is not properly initialized, and therefore is should be ignored.
      // * when slotted custom element is not used by the element where it is
      //   slotted into it, as  a result, the custom element was never
      //   initialized.

      if (!isUndefined$1(elm)) {
        var childVM = getAssociatedVMIfPresent(elm); // The VM associated with the element might be associated undefined
        // in the case where the VM failed in the middle of its creation,
        // eg: constructor throwing before invoking super().

        if (!isUndefined$1(childVM)) {
          resetComponentStateWhenRemoved(childVM);
        }
      }
    }
  }

  function runLightChildNodesDisconnectedCallback(vm) {
    var adoptedChildren = vm.aChildren;
    recursivelyDisconnectChildren(adoptedChildren);
  }
  /**
   * The recursion doesn't need to be a complete traversal of the vnode graph,
   * instead it can be partial, when a custom element vnode is found, we don't
   * need to continue into its children because by attempting to disconnect the
   * custom element itself will trigger the removal of anything slotted or anything
   * defined on its shadow.
   */


  function recursivelyDisconnectChildren(vnodes) {
    for (var _i25 = 0, _len9 = vnodes.length; _i25 < _len9; _i25 += 1) {
      var vnode = vnodes[_i25];

      if (!isNull(vnode) && !isUndefined$1(vnode.elm)) {
        switch (vnode.type) {
          case 2
          /* Element */
          :
            recursivelyDisconnectChildren(vnode.children);
            break;

          case 3
          /* CustomElement */
          :
            {
              var vm = getAssociatedVM(vnode.elm);
              resetComponentStateWhenRemoved(vm);
              break;
            }
        }
      }
    }
  } // This is a super optimized mechanism to remove the content of the root node (shadow root
  // for shadow DOM components and the root element itself for light DOM) without having to go
  // into snabbdom. Especially useful when the reset is a consequence of an error, in which case the
  // children VNodes might not be representing the current state of the DOM.


  function resetComponentRoot(vm) {
    var children = vm.children,
        renderRoot = vm.renderRoot;

    for (var _i26 = 0, _len10 = children.length; _i26 < _len10; _i26++) {
      var child = children[_i26];

      if (!isNull(child) && !isUndefined$1(child.elm)) {
        remove$1(child.elm, renderRoot);
      }
    }

    vm.children = EmptyArray;
    runChildNodesDisconnectedCallback(vm);
    vm.velements = EmptyArray;
  }

  function scheduleRehydration(vm) {
    if (isTrue(ssr$1) || isTrue(vm.isScheduled)) {
      return;
    }

    vm.isScheduled = true;

    if (rehydrateQueue.length === 0) {
      addCallbackToNextTick(flushRehydrationQueue);
    }

    ArrayPush$1.call(rehydrateQueue, vm);
  }

  function getErrorBoundaryVM(vm) {
    var currentVm = vm;

    while (!isNull(currentVm)) {
      if (!isUndefined$1(currentVm.def.errorCallback)) {
        return currentVm;
      }

      currentVm = currentVm.owner;
    }
  }

  function runWithBoundaryProtection(vm, owner, pre, job, post) {
    var error;
    pre();

    try {
      job();
    } catch (e) {
      error = Object(e);
    } finally {
      post();

      if (!isUndefined$1(error)) {
        addErrorComponentStack(vm, error);
        var errorBoundaryVm = isNull(owner) ? undefined : getErrorBoundaryVM(owner);

        if (isUndefined$1(errorBoundaryVm)) {
          throw error; // eslint-disable-line no-unsafe-finally
        }

        resetComponentRoot(vm); // remove offenders

        logOperationStart(6
        /* ErrorCallback */
        , vm); // error boundaries must have an ErrorCallback

        var errorCallback = errorBoundaryVm.def.errorCallback;
        invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);
        logOperationEnd(6
        /* ErrorCallback */
        , vm);
      }
    }
  }

  function forceRehydration(vm) {
    // if we must reset the shadowRoot content and render the template
    // from scratch on an active instance, the way to force the reset
    // is by replacing the value of old template, which is used during
    // to determine if the template has changed or not during the rendering
    // process. If the template returned by render() is different from the
    // previous stored template, the styles will be reset, along with the
    // content of the shadowRoot, this way we can guarantee that all children
    // elements will be throw away, and new instances will be created.
    vm.cmpTemplate = function () {
      return [];
    };

    if (isFalse(vm.isDirty)) {
      // forcing the vm to rehydrate in the next tick
      markComponentAsDirty(vm);
      scheduleRehydration(vm);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var DeprecatedWiredElementHost = '$$DeprecatedWiredElementHostKey$$';
  var DeprecatedWiredParamsMeta = '$$DeprecatedWiredParamsMetaKey$$';
  var WireMetaMap = new Map();

  var WireContextRegistrationEvent = /*#__PURE__*/function (_CustomEvent) {
    _inherits(WireContextRegistrationEvent, _CustomEvent);

    var _super6 = _createSuper(WireContextRegistrationEvent);

    function WireContextRegistrationEvent(adapterToken, _ref3) {
      var _this5;

      var setNewContext = _ref3.setNewContext,
          setDisconnectedCallback = _ref3.setDisconnectedCallback;

      _classCallCheck(this, WireContextRegistrationEvent);

      _this5 = _super6.call(this, adapterToken, {
        bubbles: true,
        composed: true
      });
      defineProperties(_assertThisInitialized(_this5), {
        setNewContext: {
          value: setNewContext
        },
        setDisconnectedCallback: {
          value: setDisconnectedCallback
        }
      });
      return _this5;
    }

    return _createClass(WireContextRegistrationEvent);
  }( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

  function createFieldDataCallback(vm, name) {
    var cmpFields = vm.cmpFields;
    return function (value) {
      if (value !== vm.cmpFields[name]) {
        // storing the value in the underlying storage
        cmpFields[name] = value;
        componentValueMutated(vm, name);
      }
    };
  }

  function createMethodDataCallback(vm, method) {
    return function (value) {
      // dispatching new value into the wired method
      runWithBoundaryProtection(vm, vm.owner, noop, function () {
        // job
        method.call(vm.component, value);
      }, noop);
    };
  }

  function createConfigWatcher(component, configCallback, callbackWhenConfigIsReady) {
    var hasPendingConfig = false; // creating the reactive observer for reactive params when needed

    var ro = new ReactiveObserver(function () {
      if (hasPendingConfig === false) {
        hasPendingConfig = true; // collect new config in the micro-task

        Promise.resolve().then(function () {
          hasPendingConfig = false; // resetting current reactive params

          ro.reset(); // dispatching a new config due to a change in the configuration

          computeConfigAndUpdate();
        });
      }
    });

    var computeConfigAndUpdate = function computeConfigAndUpdate() {
      var config;
      ro.observe(function () {
        return config = configCallback(component);
      }); // eslint-disable-next-line lwc-internal/no-invalid-todo
      // TODO: dev-mode validation of config based on the adapter.configSchema
      // @ts-ignore it is assigned in the observe() callback

      callbackWhenConfigIsReady(config);
    };

    return {
      computeConfigAndUpdate: computeConfigAndUpdate,
      ro: ro
    };
  }

  function createContextWatcher(vm, wireDef, callbackWhenContextIsReady) {
    var adapter = wireDef.adapter;
    var adapterContextToken = getAdapterToken(adapter);

    if (isUndefined$1(adapterContextToken)) {
      return; // no provider found, nothing to be done
    }

    var elm = vm.elm,
        _vm$context = vm.context,
        wiredConnecting = _vm$context.wiredConnecting,
        wiredDisconnecting = _vm$context.wiredDisconnecting; // waiting for the component to be connected to formally request the context via the token

    ArrayPush$1.call(wiredConnecting, function () {
      // This event is responsible for connecting the host element with another
      // element in the composed path that is providing contextual data. The provider
      // must be listening for a special dom event with the name corresponding to the value of
      // `adapterContextToken`, which will remain secret and internal to this file only to
      // guarantee that the linkage can be forged.
      var contextRegistrationEvent = new WireContextRegistrationEvent(adapterContextToken, {
        setNewContext: function setNewContext(newContext) {
          // eslint-disable-next-line lwc-internal/no-invalid-todo
          // TODO: dev-mode validation of config based on the adapter.contextSchema
          callbackWhenContextIsReady(newContext);
        },
        setDisconnectedCallback: function setDisconnectedCallback(disconnectCallback) {
          // adds this callback into the disconnect bucket so it gets disconnected from parent
          // the the element hosting the wire is disconnected
          ArrayPush$1.call(wiredDisconnecting, disconnectCallback);
        }
      });
      dispatchEvent$1(elm, contextRegistrationEvent);
    });
  }

  function createConnector(vm, name, wireDef) {
    var method = wireDef.method,
        adapter = wireDef.adapter,
        configCallback = wireDef.configCallback,
        dynamic = wireDef.dynamic;
    var dataCallback = isUndefined$1(method) ? createFieldDataCallback(vm, name) : createMethodDataCallback(vm, method);
    var context;
    var connector; // Workaround to pass the component element associated to this wire adapter instance.

    defineProperty(dataCallback, DeprecatedWiredElementHost, {
      value: vm.elm
    });
    defineProperty(dataCallback, DeprecatedWiredParamsMeta, {
      value: dynamic
    });
    runWithBoundaryProtection(vm, vm, noop, function () {
      // job
      connector = new adapter(dataCallback);
    }, noop);

    var updateConnectorConfig = function updateConnectorConfig(config) {
      // every time the config is recomputed due to tracking,
      // this callback will be invoked with the new computed config
      runWithBoundaryProtection(vm, vm, noop, function () {
        // job
        connector.update(config, context);
      }, noop);
    }; // Computes the current wire config and calls the update method on the wire adapter.
    // If it has params, we will need to observe changes in the next tick.


    var _createConfigWatcher = createConfigWatcher(vm.component, configCallback, updateConnectorConfig),
        computeConfigAndUpdate = _createConfigWatcher.computeConfigAndUpdate,
        ro = _createConfigWatcher.ro; // if the adapter needs contextualization, we need to watch for new context and push it alongside the config


    if (!isUndefined$1(adapter.contextSchema)) {
      createContextWatcher(vm, wireDef, function (newContext) {
        // every time the context is pushed into this component,
        // this callback will be invoked with the new computed context
        if (context !== newContext) {
          context = newContext; // Note: when new context arrives, the config will be recomputed and pushed along side the new
          // context, this is to preserve the identity characteristics, config should not have identity
          // (ever), while context can have identity

          if (vm.state === 1
          /* connected */
          ) {
            computeConfigAndUpdate();
          }
        }
      });
    }

    return {
      // @ts-ignore the boundary protection executes sync, connector is always defined
      connector: connector,
      computeConfigAndUpdate: computeConfigAndUpdate,
      resetConfigWatcher: function resetConfigWatcher() {
        return ro.reset();
      }
    };
  }

  var AdapterToTokenMap = new Map();

  function getAdapterToken(adapter) {
    return AdapterToTokenMap.get(adapter);
  }

  function setAdapterToken(adapter, token) {
    AdapterToTokenMap.set(adapter, token);
  }

  function storeWiredMethodMeta(descriptor, adapter, configCallback, dynamic) {
    // support for callable adapters
    if (adapter.adapter) {
      adapter = adapter.adapter;
    }

    var method = descriptor.value;
    var def = {
      adapter: adapter,
      method: method,
      configCallback: configCallback,
      dynamic: dynamic
    };
    WireMetaMap.set(descriptor, def);
  }

  function storeWiredFieldMeta(descriptor, adapter, configCallback, dynamic) {
    // support for callable adapters
    if (adapter.adapter) {
      adapter = adapter.adapter;
    }

    var def = {
      adapter: adapter,
      configCallback: configCallback,
      dynamic: dynamic
    };
    WireMetaMap.set(descriptor, def);
  }

  function installWireAdapters(vm) {
    var context = vm.context,
        wire = vm.def.wire;
    var wiredConnecting = context.wiredConnecting = [];
    var wiredDisconnecting = context.wiredDisconnecting = [];

    for (var fieldNameOrMethod in wire) {
      var descriptor = wire[fieldNameOrMethod];
      var wireDef = WireMetaMap.get(descriptor);

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(wireDef, "Internal Error: invalid wire definition found.");
      }

      if (!isUndefined$1(wireDef)) {
        (function () {
          var _createConnector = createConnector(vm, fieldNameOrMethod, wireDef),
              connector = _createConnector.connector,
              computeConfigAndUpdate = _createConnector.computeConfigAndUpdate,
              resetConfigWatcher = _createConnector.resetConfigWatcher;

          var hasDynamicParams = wireDef.dynamic.length > 0;
          ArrayPush$1.call(wiredConnecting, function () {
            connector.connect();

            if (!runtimeFlags.ENABLE_WIRE_SYNC_EMIT) {
              if (hasDynamicParams) {
                Promise.resolve().then(computeConfigAndUpdate);
                return;
              }
            }

            computeConfigAndUpdate();
          });
          ArrayPush$1.call(wiredDisconnecting, function () {
            connector.disconnect();
            resetConfigWatcher();
          });
        })();
      }
    }
  }

  function connectWireAdapters(vm) {
    var wiredConnecting = vm.context.wiredConnecting;

    for (var _i27 = 0, _len11 = wiredConnecting.length; _i27 < _len11; _i27 += 1) {
      wiredConnecting[_i27]();
    }
  }

  function disconnectWireAdapters(vm) {
    var wiredDisconnecting = vm.context.wiredDisconnecting;
    runWithBoundaryProtection(vm, vm, noop, function () {
      // job
      for (var _i28 = 0, _len12 = wiredDisconnecting.length; _i28 < _len12; _i28 += 1) {
        wiredDisconnecting[_i28]();
      }
    }, noop);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // this is lwc internal implementation


  function createContextProvider(adapter) {
    var adapterContextToken = getAdapterToken(adapter);

    if (!isUndefined$1(adapterContextToken)) {
      throw new Error("Adapter already has a context provider.");
    }

    adapterContextToken = guid();
    setAdapterToken(adapter, adapterContextToken);
    var providers = new WeakSet();
    return function (elm, options) {
      if (providers.has(elm)) {
        throw new Error("Adapter was already installed on ".concat(elm, "."));
      }

      providers.add(elm);
      var consumerConnectedCallback = options.consumerConnectedCallback,
          consumerDisconnectedCallback = options.consumerDisconnectedCallback;
      elm.addEventListener(adapterContextToken, function (evt) {
        var setNewContext = evt.setNewContext,
            setDisconnectedCallback = evt.setDisconnectedCallback;
        var consumer = {
          provide: function provide(newContext) {
            setNewContext(newContext);
          }
        };

        var disconnectCallback = function disconnectCallback() {
          if (!isUndefined$1(consumerDisconnectedCallback)) {
            consumerDisconnectedCallback(consumer);
          }
        };

        setDisconnectedCallback(disconnectCallback);
        consumerConnectedCallback(consumer);
        evt.stopImmediatePropagation();
      });
    };
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * EXPERIMENTAL: This function allows you to create a reactive readonly
   * membrane around any object value. This API is subject to change or
   * being removed.
   */


  function readonly(obj) {
    if (process.env.NODE_ENV !== 'production') {
      // TODO [#1292]: Remove the readonly decorator
      if (arguments.length !== 1) {
        assert.fail('@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value.');
      }
    }

    return reactiveMembrane.getReadOnlyProxy(obj);
  }
  /*
   * Copyright (c) 2022, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // flag indicating if the hydration recovered from the DOM mismatch


  var hasMismatch = false;

  function hydrateRoot(vm) {
    hasMismatch = false;
    runConnectedCallback(vm);
    hydrateVM(vm);

    if (hasMismatch) {
      logError('Hydration completed with errors.', vm);
    }
  }

  function hydrateVM(vm) {
    var children = renderComponent(vm);
    vm.children = children;
    var parentNode = vm.renderRoot;
    hydrateChildren(getFirstChild$1(parentNode), children, parentNode, vm);
    runRenderedCallback(vm);
  }

  function hydrateNode(node, vnode) {
    var hydratedNode;

    switch (vnode.type) {
      case 0
      /* Text */
      :
        hydratedNode = hydrateText(node, vnode);
        break;

      case 1
      /* Comment */
      :
        hydratedNode = hydrateComment(node, vnode);
        break;

      case 2
      /* Element */
      :
        hydratedNode = hydrateElement(node, vnode);
        break;

      case 3
      /* CustomElement */
      :
        hydratedNode = hydrateCustomElement(node, vnode);
        break;
    }

    return nextSibling$1(hydratedNode);
  }

  function hydrateText(node, vnode) {
    var _a;

    if (!hasCorrectNodeType(vnode, node, 3
    /* TEXT */
    )) {
      return handleMismatch(node, vnode);
    }

    if (process.env.NODE_ENV !== 'production') {
      var nodeValue = getProperty$1(node, 'nodeValue');

      if (nodeValue !== vnode.text && !(nodeValue === "\u200D" && vnode.text === '')) {
        logWarn('Hydration mismatch: text values do not match, will recover from the difference', vnode.owner);
      }
    }

    setText$1(node, (_a = vnode.text) !== null && _a !== void 0 ? _a : null);
    vnode.elm = node;
    return node;
  }

  function hydrateComment(node, vnode) {
    var _a;

    if (!hasCorrectNodeType(vnode, node, 8
    /* COMMENT */
    )) {
      return handleMismatch(node, vnode);
    }

    if (process.env.NODE_ENV !== 'production') {
      var nodeValue = getProperty$1(node, 'nodeValue');

      if (nodeValue !== vnode.text) {
        logWarn('Hydration mismatch: comment values do not match, will recover from the difference', vnode.owner);
      }
    }

    setProperty$1(node, 'nodeValue', (_a = vnode.text) !== null && _a !== void 0 ? _a : null);
    vnode.elm = node;
    return node;
  }

  function hydrateElement(elm, vnode) {
    if (!hasCorrectNodeType(vnode, elm, 1
    /* ELEMENT */
    ) || !isMatchingElement(vnode, elm)) {
      return handleMismatch(elm, vnode);
    }

    vnode.elm = elm;
    var context = vnode.data.context;
    var isDomManual = Boolean(!isUndefined$1(context) && !isUndefined$1(context.lwc) && context.lwc.dom === "manual"
    /* Manual */
    );

    if (isDomManual) {
      // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
      // remove the innerHTML from props so it reuses the existing dom elements.
      var props = vnode.data.props;

      if (!isUndefined$1(props) && !isUndefined$1(props.innerHTML)) {
        if (getProperty$1(elm, 'innerHTML') === props.innerHTML) {
          // Do a shallow clone since VNodeData may be shared across VNodes due to hoist optimization
          vnode.data = Object.assign(Object.assign({}, vnode.data), {
            props: cloneAndOmitKey(props, 'innerHTML')
          });
        } else {
          if (process.env.NODE_ENV !== 'production') {
            logWarn("Mismatch hydrating element <".concat(getProperty$1(elm, 'tagName').toLowerCase(), ">: innerHTML values do not match for element, will recover from the difference"), vnode.owner);
          }
        }
      }
    }

    patchElementPropsAndAttrs(vnode);

    if (!isDomManual) {
      hydrateChildren(getFirstChild$1(elm), vnode.children, elm, vnode.owner);
    }

    return elm;
  }

  function hydrateCustomElement(elm, vnode) {
    if (!hasCorrectNodeType(vnode, elm, 1
    /* ELEMENT */
    ) || !isMatchingElement(vnode, elm)) {
      return handleMismatch(elm, vnode);
    }

    var sel = vnode.sel,
        mode = vnode.mode,
        ctor = vnode.ctor,
        owner = vnode.owner;
    var vm = createVM(elm, ctor, {
      mode: mode,
      owner: owner,
      tagName: sel
    });
    vnode.elm = elm;
    vnode.vm = vm;
    allocateChildren(vnode, vm);
    patchElementPropsAndAttrs(vnode); // Insert hook section:

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm.state === 0
      /* created */
      , "".concat(vm, " cannot be recycled."));
    }

    runConnectedCallback(vm);

    if (vm.renderMode !== 0
    /* Light */
    ) {
      // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
      // Note: for Light DOM, this is handled while hydrating the VM
      hydrateChildren(getFirstChild$1(elm), vnode.children, elm, vm);
    }

    hydrateVM(vm);
    return elm;
  }

  function hydrateChildren(node, children, parentNode, owner) {
    var hasWarned = false;
    var nextNode = node;
    var anchor = null;

    for (var _i29 = 0; _i29 < children.length; _i29++) {
      var childVnode = children[_i29];

      if (!isNull(childVnode)) {
        if (nextNode) {
          nextNode = hydrateNode(nextNode, childVnode);
          anchor = childVnode.elm;
        } else {
          hasMismatch = true;

          if (process.env.NODE_ENV !== 'production') {
            if (!hasWarned) {
              hasWarned = true;
              logError("Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.", owner);
            }
          }

          mount(childVnode, parentNode, anchor);
          anchor = childVnode.elm;
        }
      }
    }

    if (nextNode) {
      hasMismatch = true;

      if (process.env.NODE_ENV !== 'production') {
        if (!hasWarned) {
          logError("Hydration mismatch: incorrect number of rendered nodes. Server rendered more nodes than the client.", owner);
        }
      }

      do {
        var current = nextNode;
        nextNode = nextSibling$1(nextNode);
        removeNode(current, parentNode);
      } while (nextNode);
    }
  }

  function handleMismatch(node, vnode, msg) {
    hasMismatch = true;

    if (!isUndefined$1(msg)) {
      if (process.env.NODE_ENV !== 'production') {
        logError(msg, vnode.owner);
      }
    }

    var parentNode = getProperty$1(node, 'parentNode');
    mount(vnode, parentNode, node);
    removeNode(node, parentNode);
    return vnode.elm;
  }

  function patchElementPropsAndAttrs(vnode) {
    applyEventListeners(vnode);
    patchProps(null, vnode);
  }

  function hasCorrectNodeType(vnode, node, nodeType) {
    if (getProperty$1(node, 'nodeType') !== nodeType) {
      if (process.env.NODE_ENV !== 'production') {
        logError('Hydration mismatch: incorrect node type received', vnode.owner);
      }

      return false;
    }

    return true;
  }

  function isMatchingElement(vnode, elm) {
    if (vnode.sel.toLowerCase() !== getProperty$1(elm, 'tagName').toLowerCase()) {
      if (process.env.NODE_ENV !== 'production') {
        logError("Hydration mismatch: expecting element with tag \"".concat(vnode.sel.toLowerCase(), "\" but found \"").concat(getProperty$1(elm, 'tagName').toLowerCase(), "\"."), vnode.owner);
      }

      return false;
    }

    var hasIncompatibleAttrs = validateAttrs(vnode, elm);
    var hasIncompatibleClass = validateClassAttr(vnode, elm);
    var hasIncompatibleStyle = validateStyleAttr(vnode, elm);
    return hasIncompatibleAttrs && hasIncompatibleClass && hasIncompatibleStyle;
  }

  function validateAttrs(vnode, elm) {
    var _vnode$data$attrs = vnode.data.attrs,
        attrs = _vnode$data$attrs === void 0 ? {} : _vnode$data$attrs;
    var nodesAreCompatible = true; // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.

    for (var _i30 = 0, _Object$entries = Object.entries(attrs); _i30 < _Object$entries.length; _i30++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i30], 2),
          attrName = _Object$entries$_i[0],
          attrValue = _Object$entries$_i[1];

      var elmAttrValue = getAttribute$1(elm, attrName);

      if (String(attrValue) !== elmAttrValue) {
        if (process.env.NODE_ENV !== 'production') {
          logError("Mismatch hydrating element <".concat(getProperty$1(elm, 'tagName').toLowerCase(), ">: attribute \"").concat(attrName, "\" has different values, expected \"").concat(attrValue, "\" but found \"").concat(elmAttrValue, "\""), vnode.owner);
        }

        nodesAreCompatible = false;
      }
    }

    return nodesAreCompatible;
  }

  function validateClassAttr(vnode, elm) {
    var _vnode$data = vnode.data,
        className = _vnode$data.className,
        classMap = _vnode$data.classMap;
    var nodesAreCompatible = true;
    var vnodeClassName;

    if (!isUndefined$1(className) && String(className) !== getProperty$1(elm, 'className')) {
      // className is used when class is bound to an expr.
      nodesAreCompatible = false;
      vnodeClassName = className;
    } else if (!isUndefined$1(classMap)) {
      // classMap is used when class is set to static value.
      var classList = getClassList$1(elm);
      var computedClassName = ''; // all classes from the vnode should be in the element.classList

      for (var name in classMap) {
        computedClassName += ' ' + name;

        if (!classList.contains(name)) {
          nodesAreCompatible = false;
        }
      }

      vnodeClassName = computedClassName.trim();

      if (classList.length > keys(classMap).length) {
        nodesAreCompatible = false;
      }
    }

    if (!nodesAreCompatible) {
      if (process.env.NODE_ENV !== 'production') {
        logError("Mismatch hydrating element <".concat(getProperty$1(elm, 'tagName').toLowerCase(), ">: attribute \"class\" has different values, expected \"").concat(vnodeClassName, "\" but found \"").concat(getProperty$1(elm, 'className'), "\""), vnode.owner);
      }
    }

    return nodesAreCompatible;
  }

  function validateStyleAttr(vnode, elm) {
    var _vnode$data2 = vnode.data,
        style = _vnode$data2.style,
        styleDecls = _vnode$data2.styleDecls;
    var elmStyle = getAttribute$1(elm, 'style') || '';
    var vnodeStyle;
    var nodesAreCompatible = true;

    if (!isUndefined$1(style) && style !== elmStyle) {
      nodesAreCompatible = false;
      vnodeStyle = style;
    } else if (!isUndefined$1(styleDecls)) {
      var parsedVnodeStyle = parseStyleText(elmStyle);
      var expectedStyle = []; // styleMap is used when style is set to static value.

      for (var _i31 = 0, n = styleDecls.length; _i31 < n; _i31++) {
        var _styleDecls$_i2 = _slicedToArray(styleDecls[_i31], 3),
            prop = _styleDecls$_i2[0],
            value = _styleDecls$_i2[1],
            important = _styleDecls$_i2[2];

        expectedStyle.push("".concat(prop, ": ").concat(value + (important ? ' important!' : '')));
        var parsedPropValue = parsedVnodeStyle[prop];

        if (isUndefined$1(parsedPropValue)) {
          nodesAreCompatible = false;
        } else if (!parsedPropValue.startsWith(value)) {
          nodesAreCompatible = false;
        } else if (important && !parsedPropValue.endsWith('!important')) {
          nodesAreCompatible = false;
        }
      }

      if (keys(parsedVnodeStyle).length > styleDecls.length) {
        nodesAreCompatible = false;
      }

      vnodeStyle = ArrayJoin.call(expectedStyle, ';');
    }

    if (!nodesAreCompatible) {
      if (process.env.NODE_ENV !== 'production') {
        logError("Mismatch hydrating element <".concat(getProperty$1(elm, 'tagName').toLowerCase(), ">: attribute \"style\" has different values, expected \"").concat(vnodeStyle, "\" but found \"").concat(elmStyle, "\"."), vnode.owner);
      }
    }

    return nodesAreCompatible;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var hooksAreSet = false;

  function setHooks(hooks) {
    assert.isFalse(hooksAreSet, 'Hooks are already overridden, only one definition is allowed.');
    hooksAreSet = true;
    setSanitizeHtmlContentHook(hooks.sanitizeHtmlContent);
  }
  /* version: 2.11.8 */

  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var globalStylesheets = create(null);

  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetGlobalStylesheets = function () {
      for (var _i32 = 0, _Object$keys2 = Object.keys(globalStylesheets); _i32 < _Object$keys2.length; _i32++) {
        var key = _Object$keys2[_i32];
        delete globalStylesheets[key];
      }
    };
  }

  var globalStylesheetsParentElement = document.head || document.body || document; // This check for constructable stylesheets is similar to Fast's:
  // https://github.com/microsoft/fast/blob/d49d1ec/packages/web-components/fast-element/src/dom.ts#L51-L53
  // See also: https://github.com/whatwg/webidl/issues/1027#issuecomment-934510070

  var supportsConstructableStyleSheets = isFunction$1(CSSStyleSheet.prototype.replaceSync) && isArray$1(document.adoptedStyleSheets);
  var supportsMutableAdoptedStyleSheets = supportsConstructableStyleSheets && getOwnPropertyDescriptor$1(document.adoptedStyleSheets, 'length').writable;
  var styleElements = create(null);
  var styleSheets = create(null);
  var shadowRootsToStyleSheets = new WeakMap();
  var getCustomElement;
  var defineCustomElement;
  var HTMLElementConstructor;

  function isCustomElementRegistryAvailable() {
    if (typeof customElements === 'undefined') {
      return false;
    }

    try {
      // dereference HTMLElement global because babel wraps globals in compat mode with a
      // _wrapNativeSuper()
      // This is a problem because LWCUpgradableElement extends renderer.HTMLElement which does not
      // get wrapped by babel.
      var HTMLElementAlias = HTMLElement; // In case we use compat mode with a modern browser, the compat mode transformation
      // invokes the DOM api with an .apply() or .call() to initialize any DOM api sub-classing,
      // which are not equipped to be initialized that way.

      var clazz = /*#__PURE__*/function (_HTMLElementAlias) {
        _inherits(clazz, _HTMLElementAlias);

        var _super7 = _createSuper(clazz);

        function clazz() {
          _classCallCheck(this, clazz);

          return _super7.apply(this, arguments);
        }

        return _createClass(clazz);
      }(HTMLElementAlias);

      customElements.define('lwc-test-' + Math.floor(Math.random() * 1000000), clazz);
      new clazz();
      return true;
    } catch (_a) {
      return false;
    }
  }

  function insertConstructableStyleSheet(content, target) {
    // It's important for CSSStyleSheets to be unique based on their content, so that
    // `shadowRoot.adoptedStyleSheets.includes(sheet)` works.
    var styleSheet = styleSheets[content];

    if (isUndefined$1(styleSheet)) {
      styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(content);
      styleSheets[content] = styleSheet;
    }

    var adoptedStyleSheets = target.adoptedStyleSheets;

    if (!adoptedStyleSheets.includes(styleSheet)) {
      if (supportsMutableAdoptedStyleSheets) {
        // This is only supported in later versions of Chromium:
        // https://chromestatus.com/feature/5638996492288000
        adoptedStyleSheets.push(styleSheet);
      } else {
        target.adoptedStyleSheets = [].concat(_toConsumableArray(adoptedStyleSheets), [styleSheet]);
      }
    }
  }

  function insertStyleElement(content, target) {
    // Avoid inserting duplicate `<style>`s
    var sheets = shadowRootsToStyleSheets.get(target);

    if (isUndefined$1(sheets)) {
      sheets = create(null);
      shadowRootsToStyleSheets.set(target, sheets);
    }

    if (sheets[content]) {
      return;
    }

    sheets[content] = true; // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
    // faster to call `cloneNode()` on an existing node than to recreate it every time.

    var elm = styleElements[content];

    if (isUndefined$1(elm)) {
      elm = document.createElement('style');
      elm.type = 'text/css';
      elm.textContent = content;
      styleElements[content] = elm;
    } else {
      elm = elm.cloneNode(true);
    }

    target.appendChild(elm);
  }

  if (isCustomElementRegistryAvailable()) {
    getCustomElement = customElements.get.bind(customElements);
    defineCustomElement = customElements.define.bind(customElements);
    HTMLElementConstructor = HTMLElement;
  } else {
    var registry = create(null);
    var reverseRegistry = new WeakMap();

    defineCustomElement = function define(name, ctor) {
      if (name !== StringToLowerCase.call(name) || registry[name]) {
        throw new TypeError("Invalid Registration");
      }

      registry[name] = ctor;
      reverseRegistry.set(ctor, name);
    };

    getCustomElement = function get(name) {
      return registry[name];
    };

    HTMLElementConstructor = function HTMLElement() {
      if (!(this instanceof HTMLElement)) {
        throw new TypeError("Invalid Invocation");
      }

      var constructor = this.constructor;
      var name = reverseRegistry.get(constructor);

      if (!name) {
        throw new TypeError("Invalid Construction");
      }

      var elm = document.createElement(name);
      setPrototypeOf(elm, constructor.prototype);
      return elm;
    };

    HTMLElementConstructor.prototype = HTMLElement.prototype;
  }

  var hydrating = false;

  function setIsHydrating(value) {
    hydrating = value;
  }

  var ssr = false;

  function isHydrating() {
    return hydrating;
  }

  var isNativeShadowDefined = _globalThis[KEY__IS_NATIVE_SHADOW_ROOT_DEFINED];
  var isSyntheticShadowDefined = hasOwnProperty$1.call(Element.prototype, KEY__SHADOW_TOKEN);

  function createElement$1(tagName, namespace) {
    return isUndefined$1(namespace) ? document.createElement(tagName) : document.createElementNS(namespace, tagName);
  }

  function createText(content) {
    return document.createTextNode(content);
  }

  function createComment(content) {
    return document.createComment(content);
  }

  function insert(node, parent, anchor) {
    parent.insertBefore(node, anchor);
  }

  function remove(node, parent) {
    parent.removeChild(node);
  }

  function nextSibling(node) {
    return node.nextSibling;
  }

  function attachShadow(element, options) {
    if (hydrating) {
      return element.shadowRoot;
    }

    return element.attachShadow(options);
  }

  function setText(node, content) {
    node.nodeValue = content;
  }

  function getProperty(node, key) {
    return node[key];
  }

  function setProperty(node, key, value) {
    if (process.env.NODE_ENV !== 'production') {
      if (node instanceof Element && !(key in node)) {
        // TODO [#1297]: Move this validation to the compiler
        assert.fail("Unknown public property \"".concat(key, "\" of element <").concat(node.tagName, ">. This is likely a typo on the corresponding attribute \"").concat(htmlPropertyToAttribute(key), "\"."));
      }
    }

    node[key] = value;
  }

  function getAttribute(element, name, namespace) {
    return isUndefined$1(namespace) ? element.getAttribute(name) : element.getAttributeNS(namespace, name);
  }

  function setAttribute(element, name, value, namespace) {
    return isUndefined$1(namespace) ? element.setAttribute(name, value) : element.setAttributeNS(namespace, name, value);
  }

  function removeAttribute(element, name, namespace) {
    if (isUndefined$1(namespace)) {
      element.removeAttribute(name);
    } else {
      element.removeAttributeNS(namespace, name);
    }
  }

  function addEventListener(target, type, callback, options) {
    target.addEventListener(type, callback, options);
  }

  function removeEventListener(target, type, callback, options) {
    target.removeEventListener(type, callback, options);
  }

  function dispatchEvent(target, event) {
    return target.dispatchEvent(event);
  }

  function getClassList(element) {
    return element.classList;
  }

  function setCSSStyleProperty(element, name, value, important) {
    // TODO [#0]: How to avoid this type casting? Shall we use a different type interface to
    // represent elements in the engine?
    element.style.setProperty(name, value, important ? 'important' : '');
  }

  function getBoundingClientRect(element) {
    return element.getBoundingClientRect();
  }

  function querySelector(element, selectors) {
    return element.querySelector(selectors);
  }

  function querySelectorAll(element, selectors) {
    return element.querySelectorAll(selectors);
  }

  function getElementsByTagName(element, tagNameOrWildCard) {
    return element.getElementsByTagName(tagNameOrWildCard);
  }

  function getElementsByClassName(element, names) {
    return element.getElementsByClassName(names);
  }

  function getChildren(element) {
    return element.children;
  }

  function getChildNodes(element) {
    return element.childNodes;
  }

  function getFirstChild(element) {
    return element.firstChild;
  }

  function getFirstElementChild(element) {
    return element.firstElementChild;
  }

  function getLastChild(element) {
    return element.lastChild;
  }

  function getLastElementChild(element) {
    return element.lastElementChild;
  }

  function isConnected(node) {
    return node.isConnected;
  }

  function insertGlobalStylesheet(content) {
    if (!isUndefined$1(globalStylesheets[content])) {
      return;
    }

    globalStylesheets[content] = true;
    var elm = document.createElement('style');
    elm.type = 'text/css';
    elm.textContent = content;
    globalStylesheetsParentElement.appendChild(elm);
  }

  function insertStylesheet(content, target) {
    if (supportsConstructableStyleSheets) {
      insertConstructableStyleSheet(content, target);
    } else {
      // Fall back to <style> element
      insertStyleElement(content, target);
    }
  }

  function assertInstanceOfHTMLElement(elm, msg) {
    assert.invariant(elm instanceof HTMLElement, msg);
  }

  var HTMLElementExported = HTMLElementConstructor;
  /*
   * Copyright (c) 2020, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  setAssertInstanceOfHTMLElement(assertInstanceOfHTMLElement);
  setAttachShadow(attachShadow);
  setCreateComment(createComment);
  setCreateElement(createElement$1);
  setCreateText(createText);
  setDefineCustomElement(defineCustomElement);
  setDispatchEvent(dispatchEvent);
  setGetAttribute(getAttribute);
  setGetBoundingClientRect(getBoundingClientRect);
  setGetChildNodes(getChildNodes);
  setGetChildren(getChildren);
  setGetClassList(getClassList);
  setGetCustomElement(getCustomElement);
  setGetElementsByClassName(getElementsByClassName);
  setGetElementsByTagName(getElementsByTagName);
  setGetFirstChild(getFirstChild);
  setGetFirstElementChild(getFirstElementChild);
  setGetLastChild(getLastChild);
  setGetLastElementChild(getLastElementChild);
  setGetProperty(getProperty);
  setHTMLElement(HTMLElementExported);
  setInsert(insert);
  setInsertGlobalStylesheet(insertGlobalStylesheet);
  setInsertStylesheet(insertStylesheet);
  setIsConnected(isConnected);
  setIsHydrating$1(isHydrating);
  setIsNativeShadowDefined(isNativeShadowDefined);
  setIsSyntheticShadowDefined(isSyntheticShadowDefined);
  setNextSibling(nextSibling);
  setQuerySelector(querySelector);
  setQuerySelectorAll(querySelectorAll);
  setRemove(remove);
  setRemoveAttribute(removeAttribute);
  setRemoveEventListener(removeEventListener);
  setSetAttribute(setAttribute);
  setSetCSSStyleProperty(setCSSStyleProperty);
  setSetProperty(setProperty);
  setSetText(setText);
  setSsr(ssr);
  setAddEventListener(addEventListener);
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  function resetShadowRootAndLightDom(element, Ctor) {
    if (element.shadowRoot) {
      var shadowRoot = element.shadowRoot;

      while (!isNull(shadowRoot.firstChild)) {
        shadowRoot.removeChild(shadowRoot.firstChild);
      }
    }

    if (Ctor.renderMode === 'light') {
      while (!isNull(element.firstChild)) {
        element.removeChild(element.firstChild);
      }
    }
  }

  function createVMWithProps(element, Ctor, props) {
    var vm = createVM(element, Ctor, {
      mode: 'open',
      owner: null,
      tagName: element.tagName.toLowerCase()
    });

    for (var _i33 = 0, _Object$entries2 = Object.entries(props); _i33 < _Object$entries2.length; _i33++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i33], 2),
          key = _Object$entries2$_i[0],
          value = _Object$entries2$_i[1];

      element[key] = value;
    }

    return vm;
  }

  function hydrateComponent(element, Ctor) {
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!(element instanceof Element)) {
      throw new TypeError("\"hydrateComponent\" expects a valid DOM element as the first parameter but instead received ".concat(element, "."));
    }

    if (!isFunction$1(Ctor)) {
      throw new TypeError("\"hydrateComponent\" expects a valid component constructor as the second parameter but instead received ".concat(Ctor, "."));
    }

    if (!isObject(props) || isNull(props)) {
      throw new TypeError("\"hydrateComponent\" expects an object as the third parameter but instead received ".concat(props, "."));
    }

    if (getAssociatedVMIfPresent(element)) {
      /* eslint-disable-next-line no-console */
      console.warn("\"hydrateComponent\" expects an element that is not hydrated.", element);
      return;
    }

    try {
      // Let the renderer know we are hydrating, so it does not replace the existing shadowRoot
      // and uses the same algo to create the stylesheets as in SSR.
      setIsHydrating(true);
      var vm = createVMWithProps(element, Ctor, props);
      hydrateRoot(vm); // set it back since now we finished hydration.

      setIsHydrating(false);
    } catch (e) {
      // Fallback: In case there's an error while hydrating, let's log the error, and replace the element content
      //           with the client generated DOM.

      /* eslint-disable-next-line no-console */
      console.error('Recovering from error while hydrating: ', e); // We want to preserve the element, so we need to reset the shadowRoot and light dom.

      resetShadowRootAndLightDom(element, Ctor); // we need to recreate the vm with the hydration flag on, so it re-uses the existing shadowRoot.

      createVMWithProps(element, Ctor, props);
      setIsHydrating(false);
      connectRootElement(element);
    } finally {
      // in case there's an error during recovery
      setIsHydrating(false);
    }
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * This function builds a Web Component class from a LWC constructor so it can be
   * registered as a new element via customElements.define() at any given time.
   *
   * @deprecated since version 1.3.11
   *
   * @example
   * ```
   * import { buildCustomElementConstructor } from 'lwc';
   * import Foo from 'ns/foo';
   * const WC = buildCustomElementConstructor(Foo);
   * customElements.define('x-foo', WC);
   * const elm = document.createElement('x-foo');
   * ```
   */


  function deprecatedBuildCustomElementConstructor(Ctor) {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable-next-line no-console */
      console.warn('Deprecated function called: "buildCustomElementConstructor" function is deprecated and it will be removed.' + "Use \"".concat(Ctor.name, ".CustomElementConstructor\" static property of the component constructor to access the corresponding custom element constructor instead."));
    }

    return Ctor.CustomElementConstructor;
  } // Note: WeakSet is not supported in IE11, and the polyfill is not performant enough.
  //       This WeakSet usage is valid because this functionality is not meant to run in IE11.


  var hydratedCustomElements = new WeakSet();

  function buildCustomElementConstructor(Ctor) {
    var HtmlPrototype = getComponentHtmlPrototype(Ctor);
    return /*#__PURE__*/function (_HtmlPrototype) {
      _inherits(_class, _HtmlPrototype);

      var _super8 = _createSuper(_class);

      function _class() {
        var _this6;

        _classCallCheck(this, _class);

        _this6 = _super8.call(this);

        if (_this6.isConnected) {
          // this if block is hit when there's already an un-upgraded element in the DOM with the same tag name.
          hydrateComponent(_assertThisInitialized(_this6), Ctor, {});
          hydratedCustomElements.add(_assertThisInitialized(_this6));
        } else {
          createVM(_assertThisInitialized(_this6), Ctor, {
            mode: 'open',
            owner: null,
            tagName: _this6.tagName
          });
        }

        return _this6;
      }

      _createClass(_class, [{
        key: "connectedCallback",
        value: function connectedCallback() {
          if (hydratedCustomElements.has(this)) {
            // This is an un-upgraded element that was hydrated in the constructor.
            hydratedCustomElements.delete(this);
          } else {
            connectRootElement(this);
          }
        }
      }, {
        key: "disconnectedCallback",
        value: function disconnectedCallback() {
          disconnectRootElement(this);
        }
      }]);

      return _class;
    }(HtmlPrototype);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // TODO [#2472]: Remove this workaround when appropriate.
  // eslint-disable-next-line lwc-internal/no-global-node


  var _Node$1 = Node;
  var ConnectingSlot = new WeakMap();
  var DisconnectingSlot = new WeakMap();

  function callNodeSlot(node, slot) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(node, "callNodeSlot() should not be called for a non-object");
    }

    var fn = slot.get(node);

    if (!isUndefined$1(fn)) {
      fn(node);
    }

    return node; // for convenience
  } // Monkey patching Node methods to be able to detect the insertions and removal of root elements
  // created via createElement.


  var _Node$1$prototype = _Node$1.prototype,
      _appendChild2 = _Node$1$prototype.appendChild,
      _insertBefore2 = _Node$1$prototype.insertBefore,
      _removeChild2 = _Node$1$prototype.removeChild,
      _replaceChild2 = _Node$1$prototype.replaceChild;
  assign(_Node$1.prototype, {
    appendChild: function appendChild(newChild) {
      var appendedNode = _appendChild2.call(this, newChild);

      return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore: function insertBefore(newChild, referenceNode) {
      var insertedNode = _insertBefore2.call(this, newChild, referenceNode);

      return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild: function removeChild(oldChild) {
      var removedNode = _removeChild2.call(this, oldChild);

      return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild: function replaceChild(newChild, oldChild) {
      var replacedNode = _replaceChild2.call(this, newChild, oldChild);

      callNodeSlot(replacedNode, DisconnectingSlot);
      callNodeSlot(newChild, ConnectingSlot);
      return replacedNode;
    }
  });
  /**
   * EXPERIMENTAL: This function is almost identical to document.createElement with the slightly
   * difference that in the options, you can pass the `is` property set to a Constructor instead of
   * just a string value. The intent is to allow the creation of an element controlled by LWC without
   * having to register the element as a custom element.
   *
   * @example
   * ```
   * const el = createElement('x-foo', { is: FooCtor });
   * ```
   */

  function createElement(sel, options) {
    if (!isObject(options) || isNull(options)) {
      throw new TypeError("\"createElement\" function expects an object as second parameter but received \"".concat(toString$1(options), "\"."));
    }

    var Ctor = options.is;

    if (!isFunction$1(Ctor)) {
      throw new TypeError("\"createElement\" function expects an \"is\" option with a valid component constructor.");
    }

    var UpgradableConstructor = getUpgradableConstructor(sel);
    var wasComponentUpgraded = false; // the custom element from the registry is expecting an upgrade callback

    /**
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */

    var element = new UpgradableConstructor(function (elm) {
      createVM(elm, Ctor, {
        tagName: sel,
        mode: options.mode !== 'closed' ? 'open' : 'closed',
        owner: null
      });
      ConnectingSlot.set(elm, connectRootElement);
      DisconnectingSlot.set(elm, disconnectRootElement);
      wasComponentUpgraded = true;
    });

    if (!wasComponentUpgraded) {
      /* eslint-disable-next-line no-console */
      console.error("Unexpected tag name \"".concat(sel, "\". This name is a registered custom element, preventing LWC to upgrade the element."));
    }

    return element;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */

  /**
   * EXPERIMENTAL: This function provides access to the component constructor, given an HTMLElement.
   * This API is subject to change or being removed.
   */


  function getComponentConstructor(elm) {
    var ctor = null;

    if (elm instanceof HTMLElement) {
      var vm = getAssociatedVMIfPresent(elm);

      if (!isUndefined$1(vm)) {
        ctor = vm.def.ctor;
      }
    }

    return ctor;
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */
  // TODO [#2472]: Remove this workaround when appropriate.
  // eslint-disable-next-line lwc-internal/no-global-node


  var _Node = Node;
  /**
   * EXPERIMENTAL: The purpose of this function is to detect shadowed nodes. THIS API WILL BE REMOVED
   * ONCE LOCKER V1 IS NO LONGER SUPPORTED.
   */

  function isNodeShadowed(node) {
    if (isFalse(node instanceof _Node)) {
      return false;
    } // It's debatable whether shadow root instances should be considered as shadowed, but we keep
    // this unchanged for legacy reasons (#1250).


    if (node instanceof ShadowRoot) {
      return false;
    }

    var rootNode = node.getRootNode(); // Handle the native case. We can return early here because an invariant of LWC is that
    // synthetic roots cannot be descendants of native roots.

    if (rootNode instanceof ShadowRoot && isFalse(hasOwnProperty$1.call(getPrototypeOf$1(rootNode), 'synthetic'))) {
      return true;
    } // TODO [#1252]: Old behavior that is still used by some pieces of the platform. Manually
    // inserted nodes without the `lwc:dom=manual` directive will be considered as global elements.


    return isSyntheticShadowDefined && !isUndefined$1(node[KEY__SHADOW_RESOLVER]);
  }
  /*
   * Copyright (c) 2018, salesforce.com, inc.
   * All rights reserved.
   * SPDX-License-Identifier: MIT
   * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
   */


  var ComponentConstructorToCustomElementConstructorMap = new Map();

  function getCustomElementConstructor(Ctor) {
    if (Ctor === LightningElement) {
      throw new TypeError("Invalid Constructor. LightningElement base class can't be claimed as a custom element.");
    }

    var ce = ComponentConstructorToCustomElementConstructorMap.get(Ctor);

    if (isUndefined$1(ce)) {
      ce = buildCustomElementConstructor(Ctor);
      ComponentConstructorToCustomElementConstructorMap.set(Ctor, ce);
    }

    return ce;
  }
  /**
   * This static getter builds a Web Component class from a LWC constructor so it can be registered
   * as a new element via customElements.define() at any given time. E.g.:
   *
   *      import Foo from 'ns/foo';
   *      customElements.define('x-foo', Foo.CustomElementConstructor);
   *      const elm = document.createElement('x-foo');
   *
   */


  defineProperty(LightningElement, 'CustomElementConstructor', {
    get: function get() {
      return getCustomElementConstructor(this);
    }
  });
  freeze(LightningElement);
  seal(LightningElement.prototype);
  /* version: 2.11.8 */

  exports.LightningElement = LightningElement;
  exports.__unstable__ProfilerControl = profilerControl;
  exports.api = api$1;
  exports.buildCustomElementConstructor = deprecatedBuildCustomElementConstructor;
  exports.createContextProvider = createContextProvider;
  exports.createElement = createElement;
  exports.getComponentConstructor = getComponentConstructor;
  exports.getComponentDef = getComponentDef;
  exports.hydrateComponent = hydrateComponent;
  exports.isComponentConstructor = isComponentConstructor;
  exports.isNodeFromTemplate = isNodeShadowed;
  exports.readonly = readonly;
  exports.register = register;
  exports.registerComponent = registerComponent;
  exports.registerDecorators = registerDecorators;
  exports.registerTemplate = registerTemplate;
  exports.sanitizeAttribute = sanitizeAttribute;
  exports.setFeatureFlag = setFeatureFlag;
  exports.setFeatureFlagForTest = setFeatureFlagForTest;
  exports.setHooks = setHooks;
  exports.swapComponent = swapComponent;
  exports.swapStyle = swapStyle;
  exports.swapTemplate = swapTemplate;
  exports.track = track;
  exports.unwrap = unwrap;
  exports.wire = wire;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
