

(function () {
  'use strict';

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var __getKey = Proxy.getKey;
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return __getKey(o, "__proto__") || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  var __setKey = Proxy.setKey;
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      __setKey(o, "__proto__", p);

      return o;
    };

    return _setPrototypeOf(o, p);
  }

  var __setKey$1 = Proxy.setKey;
  var __getKey$1 = Proxy.getKey;
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    __setKey$1(subClass, "prototype", Object.create(superClass && __getKey$1(superClass, "prototype"), {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    }));

    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  var __getKey$2 = Proxy.getKey;

  var __getKey$3 = Proxy.getKey;
  var __getKeys2 = Proxy.getKeys2;
  var __callKey1 = Proxy.callKey1;
  var __callKey3 = Proxy.callKey3;
  var __callKey2 = Proxy.callKey2;

  var __callKey1$1 = Proxy.callKey1;
  var __callKey2$1 = Proxy.callKey2;
  var __getKey$4 = Proxy.getKey;
  var __setKey$2 = Proxy.setKey;

  var __inKey = Proxy.inKey;
  var __setKey$3 = Proxy.setKey;
  function _defineProperty(obj, key, value) {
    if (__inKey(obj, key)) {
      Object.compatDefineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      __setKey$3(obj, key, value);
    }

    return obj;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var __getKey$5 = Proxy.getKey;
  var __setKey$4 = Proxy.setKey;
  var __inKey$1 = Proxy.inKey;

  function _defineProperties(target, props) {
    for (var i = 0; i < __getKey$5(props, "length"); i++) {
      var descriptor = __getKey$5(props, i);

      __setKey$4(descriptor, "enumerable", __getKey$5(descriptor, "enumerable") || false);

      __setKey$4(descriptor, "configurable", true);

      if (__inKey$1(descriptor, "value")) __setKey$4(descriptor, "writable", true);
      Object.compatDefineProperty(target, __getKey$5(descriptor, "key"), descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(__getKey$5(Constructor, "prototype"), protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var __getKey$6 = Proxy.getKey;
  var __callKey1$2 = Proxy.callKey1;
  var __instanceOfKey = Proxy.instanceOfKey;
  function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && __getKey$6(right, Symbol.hasInstance)) {
      return __callKey1$2(right, Symbol.hasInstance, left);
    } else {
      return __instanceOfKey(left, right);
    }
  }

  var __getKey$7 = Proxy.getKey;
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && __getKey$7(obj, "constructor") === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  /* proxy-compat-disable */
  var StringSplit = String.prototype.split;
  var assert = {
    invariant: function invariant(value, msg) {
      if (!value) {
        throw new Error("Invariant Violation: ".concat(msg));
      }
    },
    isTrue: function isTrue(value, msg) {
      if (!value) {
        throw new Error("Assert Violation: ".concat(msg));
      }
    },
    isFalse: function isFalse(value, msg) {
      if (value) {
        throw new Error("Assert Violation: ".concat(msg));
      }
    },
    fail: function fail(msg) {
      throw new Error(msg);
    },
    logError: function logError(msg) {
      if (process.env.NODE_ENV === 'test') {
        console.error(msg); // tslint:disable-line

        return;
      }

      try {
        throw new Error(msg);
      } catch (e) {
        console.error(e); // tslint:disable-line
      }
    },
    logWarning: function logWarning(msg) {
      if (process.env.NODE_ENV === 'test') {
        console.warn(msg); // tslint:disable-line

        return;
      }

      try {
        throw new Error(msg);
      } catch (e) {
        var stackTraceLines = StringSplit.call(e.stack, '\n');
        console.group("Warning: ".concat(msg)); // tslint:disable-line

        stackTraceLines.filter(function (trace) {
          // Chrome adds the error message as the first item in the stack trace
          // So we filter it out to prevent logging it twice.
          return trace.replace('Error: ', '') !== msg;
        }).forEach(function (trace) {
          // We need to format this as a string,
          // because Safari will detect that the string
          // is a stack trace line item and will format it as so
          console.log('%s', trace.trim()); // tslint:disable-line
        });
        console.groupEnd(); // tslint:disable-line
      }
    }
  };
  var freeze = Object.freeze,
      seal = Object.seal,
      keys = Object.keys,
      create = Object.create,
      assign = Object.assign,
      defineProperty = Object.defineProperty,
      getPrototypeOf = Object.getPrototypeOf,
      setPrototypeOf = Object.setPrototypeOf,
      getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
      getOwnPropertyNames = Object.getOwnPropertyNames,
      defineProperties = Object.defineProperties,
      hasOwnProperty = Object.hasOwnProperty;
  var isArray = Array.isArray;
  var _Array$prototype = Array.prototype,
      ArrayFilter = _Array$prototype.filter,
      ArraySlice = _Array$prototype.slice,
      ArraySplice = _Array$prototype.splice,
      ArrayUnshift = _Array$prototype.unshift,
      ArrayIndexOf = _Array$prototype.indexOf,
      ArrayPush = _Array$prototype.push,
      ArrayMap = _Array$prototype.map,
      forEach = _Array$prototype.forEach,
      ArrayReduce = _Array$prototype.reduce;
  var _String$prototype = String.prototype,
      StringReplace = _String$prototype.replace,
      StringToLowerCase = _String$prototype.toLowerCase,
      StringIndexOf = _String$prototype.indexOf,
      StringCharCodeAt = _String$prototype.charCodeAt,
      StringSlice = _String$prototype.slice;

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

  function isString(obj) {
    return typeof obj === 'string';
  }

  function isNumber(obj) {
    return typeof obj === 'number';
  }

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

  function getPropertyDescriptor(o, p) {
    do {
      var _d = getOwnPropertyDescriptor(o, p);

      if (!isUndefined(_d)) {
        return _d;
      }

      o = getPrototypeOf(o);
    } while (o !== null);
  } // These properties get added to LWCElement.prototype publicProps automatically


  var defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable', 'tabIndex']; // Few more exceptions that are using the attribute name to match the property in lowercase.
  // this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
  // and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
  // Note: this list most be in sync with the compiler as well.

  var HTMLPropertyNamesWithLowercasedReflectiveAttributes = ['accessKey', 'readOnly', 'tabIndex', 'bgColor', 'colSpan', 'rowSpan', 'contentEditable', 'dateTime', 'formAction', 'isMap', 'maxLength', 'useMap']; // this regular expression is used to transform aria props into aria attributes because
  // that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`

  var ARIA_REGEX = /^aria/; // Global Aria and Role Properties derived from ARIA and Role Attributes.
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques

  var ElementAOMPropertyNames = ['ariaAutoComplete', 'ariaChecked', 'ariaCurrent', 'ariaDisabled', 'ariaExpanded', 'ariaHasPopUp', 'ariaHidden', 'ariaInvalid', 'ariaLabel', 'ariaLevel', 'ariaMultiLine', 'ariaMultiSelectable', 'ariaOrientation', 'ariaPressed', 'ariaReadOnly', 'ariaRequired', 'ariaSelected', 'ariaSort', 'ariaValueMax', 'ariaValueMin', 'ariaValueNow', 'ariaValueText', 'ariaLive', 'ariaRelevant', 'ariaAtomic', 'ariaBusy', 'ariaActiveDescendant', 'ariaControls', 'ariaDescribedBy', 'ariaFlowTo', 'ariaLabelledBy', 'ariaOwns', 'ariaPosInSet', 'ariaSetSize', 'ariaColCount', 'ariaColIndex', 'ariaDetails', 'ariaErrorMessage', 'ariaKeyShortcuts', 'ariaModal', 'ariaPlaceholder', 'ariaRoleDescription', 'ariaRowCount', 'ariaRowIndex', 'ariaRowSpan', 'role'];
  var OffsetPropertiesError = 'This property will round the value to an integer, and it is considered an anti-pattern. Instead, you can use \`this.getBoundingClientRect()\` to obtain `left`, `top`, `right`, `bottom`, `x`, `y`, `width`, and `height` fractional values describing the overall border-box in pixels.'; // Global HTML Attributes & Properties
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement

  function getGlobalHTMLPropertiesInfo() {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    return {
      id: {
        attribute: 'id',
        reflective: true
      },
      accessKey: {
        attribute: 'accesskey',
        reflective: true
      },
      accessKeyLabel: {
        readOnly: true
      },
      className: {
        attribute: 'class',
        error: "Using property \"className\" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property \"classList\"."
      },
      contentEditable: {
        attribute: 'contenteditable',
        reflective: true
      },
      isContentEditable: {
        readOnly: true
      },
      contextMenu: {
        attribute: 'contextmenu'
      },
      dataset: {
        readOnly: true,
        error: 'Using property "dataset" is an anti-pattern. Components should not rely on dataset to implement its internal logic, nor use that as a communication channel.'
      },
      dir: {
        attribute: 'dir',
        reflective: true
      },
      draggable: {
        attribute: 'draggable',
        experimental: true,
        reflective: true
      },
      dropzone: {
        attribute: 'dropzone',
        readOnly: true,
        experimental: true
      },
      hidden: {
        attribute: 'hidden',
        reflective: true
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
        attribute: 'lang',
        reflective: true
      },
      offsetHeight: {
        readOnly: true,
        error: OffsetPropertiesError
      },
      offsetLeft: {
        readOnly: true,
        error: OffsetPropertiesError
      },
      offsetParent: {
        readOnly: true
      },
      offsetTop: {
        readOnly: true,
        error: OffsetPropertiesError
      },
      offsetWidth: {
        readOnly: true,
        error: OffsetPropertiesError
      },
      properties: {
        readOnly: true,
        experimental: true
      },
      spellcheck: {
        experimental: true,
        reflective: true
      },
      style: {
        attribute: 'style',
        error: "Using property or attribute \"style\" is an anti-pattern. Instead use property \"classList\"."
      },
      tabIndex: {
        attribute: 'tabindex',
        reflective: true
      },
      title: {
        attribute: 'title',
        reflective: true
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
        error: "Using property or attribute \"slot\" is an anti-pattern."
      }
    };
  } // TODO: complete this list with Element properties
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // TODO: complete this list with Node properties
  // https://developer.mozilla.org/en-US/docs/Web/API/Node


  var AttrNameToPropNameMap = create(null);
  var PropNameToAttrNameMap = create(null); // Synthetic creation of all AOM property descriptors for Custom Elements

  forEach.call(ElementAOMPropertyNames, function (propName) {
    var attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
  });
  forEach.call(defaultDefHTMLPropertyNames, function (propName) {
    var attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
  });
  forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, function (propName) {
    var attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
  });
  var CAMEL_REGEX = /-([a-z])/g;
  /**
   * This method maps between attribute names
   * and the corresponding property name.
   */

  function getPropNameFromAttrName(attrName) {
    if (isUndefined(AttrNameToPropNameMap[attrName])) {
      AttrNameToPropNameMap[attrName] = StringReplace.call(attrName, CAMEL_REGEX, function (g) {
        return g[1].toUpperCase();
      });
    }

    return AttrNameToPropNameMap[attrName];
  }

  var CAPS_REGEX = /[A-Z]/g;
  /**
   * This method maps between property names
   * and the corresponding attribute name.
   */

  function getAttrNameFromPropName(propName) {
    if (isUndefined(PropNameToAttrNameMap[propName])) {
      PropNameToAttrNameMap[propName] = StringReplace.call(propName, CAPS_REGEX, function (match) {
        return '-' + match.toLowerCase();
      });
    }

    return PropNameToAttrNameMap[propName];
  }

  function decorate(Ctor, decorators) {
    // intentionally comparing decorators with null and undefined
    if (!isFunction(Ctor) || decorators == null) {
      throw new TypeError();
    }

    var props = getOwnPropertyNames(decorators); // intentionally allowing decoration of classes only for now

    var target = Ctor.prototype;

    for (var _i = 0, len = props.length; _i < len; _i += 1) {
      var propName = props[_i];
      var decorator = decorators[propName];

      if (!isFunction(decorator)) {
        throw new TypeError();
      }

      var originalDescriptor = getOwnPropertyDescriptor(target, propName);
      var descriptor = decorator(Ctor, propName, originalDescriptor);

      if (!isUndefined(descriptor)) {
        defineProperty(target, propName, descriptor);
      }
    }

    return Ctor; // chaining
  }
  /**
   * In IE11, symbols that we plan to apply everywhere are expensive
   * due to the nature of the symbol polyfill. This method abstract the
   * creation of symbols, so we can fallback to string when native symbols
   * are not supported.
   */


  function createFieldName(key) {
    // @ts-ignore: using a string as a symbol for perf reasons
    return _typeof(Symbol()) === 'symbol' ? Symbol(key) : "$$lwc-".concat(key, "$$");
  }

  function setInternalField(o, fieldName, value) {
    // TODO: improve this to use  or a WeakMap
    if (process.env.NODE_ENV !== 'production') {
      // in dev-mode, we are more restrictive about what you can do with the internal fields
      defineProperty(o, fieldName, {
        value: value,
        enumerable: true,
        configurable: false,
        writable: false
      });
    } else {
      // in prod, for better perf, we just let it roll
      o[fieldName] = value;
    }
  }

  function getInternalField(o, fieldName) {
    return o[fieldName];
  }

  var nextTickCallbackQueue = [];
  var SPACE_CHAR = 32;
  var EmptyObject = seal(create(null));
  var EmptyArray = seal([]);
  var ViewModelReflection = createFieldName('ViewModel');
  var PatchedFlag = createFieldName('PatchedFlag');

  function flushCallbackQueue() {
    if (process.env.NODE_ENV !== 'production') {
      if (nextTickCallbackQueue.length === 0) {
        throw new Error("Internal Error: If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue.");
      }
    }

    var callbacks = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue

    for (var _i2 = 0, len = callbacks.length; _i2 < len; _i2 += 1) {
      callbacks[_i2]();
    }
  }

  function addCallbackToNextTick(callback) {
    if (process.env.NODE_ENV !== 'production') {
      if (!isFunction(callback)) {
        throw new Error("Internal Error: addCallbackToNextTick() can only accept a function callback");
      }
    }

    if (nextTickCallbackQueue.length === 0) {
      Promise.resolve().then(flushCallbackQueue);
    } // TODO: eventually, we might want to have priority when inserting callbacks


    ArrayPush.call(nextTickCallbackQueue, callback);
  }

  function isCircularModuleDependency(value) {
    return hasOwnProperty.call(value, '__circular__');
  }
  /**
   * When LWC is used in the context of an Aura application, the compiler produces AMD
   * modules, that doesn't resolve properly circular dependencies between modules. In order
   * to circumvent this issue, the module loader returns a factory with a symbol attached
   * to it.
   *
   * This method returns the resolved value if it received a factory as argument. Otherwise
   * it returns the original value.
   */


  function resolveCircularModuleDependency(fn) {
    if (process.env.NODE_ENV !== 'production') {
      if (!isFunction(fn)) {
        throw new ReferenceError("Circular module dependency must be a function.");
      }
    }

    return fn();
  }

  var _Node = Node,
      DOCUMENT_POSITION_CONTAINED_BY = _Node.DOCUMENT_POSITION_CONTAINED_BY,
      DOCUMENT_POSITION_CONTAINS = _Node.DOCUMENT_POSITION_CONTAINS;
  var _Node$prototype = Node.prototype,
      insertBefore = _Node$prototype.insertBefore,
      removeChild = _Node$prototype.removeChild,
      appendChild = _Node$prototype.appendChild,
      compareDocumentPosition = _Node$prototype.compareDocumentPosition;
  /**
   * Returns the context shadow included root.
   */

  function findShadowRoot(node) {
    var initialParent = parentNodeGetter.call(node); // We need to ensure that the parent element is present before accessing it.

    if (isNull(initialParent)) {
      return node;
    } // In the case of LWC, the root and the host element are the same things. Therefor,
    // when calling findShadowRoot on the a host element we want to return the parent host
    // element and not the current host element.


    node = initialParent;
    var nodeParent;

    while (!isNull(nodeParent = parentNodeGetter.call(node)) && isUndefined(getNodeKey(node))) {
      node = nodeParent;
    }

    return node;
  }

  function findComposedRootNode(node) {
    var nodeParent;

    while (!isNull(nodeParent = parentNodeGetter.call(node))) {
      node = nodeParent;
    }

    return node;
  }
  /**
   * Dummy implementation of the Node.prototype.getRootNode.
   * Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode
   *
   * TODO: Once we start using the real shadowDOM, this method should be replaced by:
   * const { getRootNode } = Node.prototype;
   */


  function getRootNode(options) {
    var composed = isUndefined(options) ? false : !!options.composed;
    return isTrue(composed) ? findComposedRootNode(this) : findShadowRoot(this);
  }

  var textContextSetter = getOwnPropertyDescriptor(Node.prototype, 'textContent').set;
  var parentNodeGetter = getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;
  var parentElementGetter = hasOwnProperty.call(Node.prototype, 'parentElement') ? getOwnPropertyDescriptor(Node.prototype, 'parentElement').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement').get; // IE11

  var childNodesGetter = hasOwnProperty.call(Node.prototype, 'childNodes') ? getOwnPropertyDescriptor(Node.prototype, 'childNodes').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes').get; // IE11
  // DO NOT CHANGE this:
  // these two values need to be in sync with framework/vm.ts

  var OwnerKey = '$$OwnerKey$$';
  var OwnKey = '$$OwnKey$$';

  function getNodeOwnerKey(node) {
    return node[OwnerKey];
  }

  function getNodeKey(node) {
    return node[OwnKey];
  }

  var _Element$prototype = Element.prototype,
      addEventListener = _Element$prototype.addEventListener,
      removeEventListener = _Element$prototype.removeEventListener,
      getAttribute = _Element$prototype.getAttribute,
      getAttributeNS = _Element$prototype.getAttributeNS,
      setAttribute = _Element$prototype.setAttribute,
      setAttributeNS = _Element$prototype.setAttributeNS,
      removeAttribute = _Element$prototype.removeAttribute,
      removeAttributeNS = _Element$prototype.removeAttributeNS,
      querySelector = _Element$prototype.querySelector,
      querySelectorAll = _Element$prototype.querySelectorAll;
  var innerHTMLSetter = hasOwnProperty.call(Element.prototype, 'innerHTML') ? getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set : getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML').set; // IE11

  var tagNameGetter = getOwnPropertyDescriptor(Element.prototype, 'tagName').get;

  function wrapIframeWindow(win) {
    return {
      postMessage: function postMessage() {
        return win.postMessage.apply(win, arguments);
      },
      blur: function blur() {
        return win.blur.apply(win, arguments);
      },
      close: function close() {
        return win.close.apply(win, arguments);
      },
      focus: function focus() {
        return win.focus.apply(win, arguments);
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

    };
  }

  var proxies = new WeakMap(); // We ONLY want to have DOM nodes and DOM methods
  // going into the traverse membrane. This check is
  // a little too broad, because any function that passes
  // through here will be inserted into the membrane,
  // but the only case where this would happen would be:
  // node()(), so this should be sufficient for now.

  function isReplicable(value) {
    return _instanceof(value, Node) || isFunction(value);
  }

  var traverseMembraneHandler = {
    get: function get(originalTarget, key) {
      if (key === TargetSlot) {
        return originalTarget;
      }

      if (!isFunction(originalTarget)) {
        var _descriptors = NodePatchDescriptors$1;

        if (_instanceof(originalTarget, Element)) {
          var tagName = tagNameGetter.call(originalTarget);

          switch (tagName) {
            case 'SLOT':
              // slot
              _descriptors = SlotPatchDescriptors;
              break;

            default:
              // element
              _descriptors = ElementPatchDescriptors;
          }
        }

        if (hasOwnProperty.call(_descriptors, key)) {
          var descriptor = _descriptors[key];

          if (hasOwnProperty.call(descriptor, 'value')) {
            return wrap(descriptor.value);
          } else {
            return descriptor.get.call(originalTarget);
          }
        }
      }

      return wrap(originalTarget[key]);
    },
    set: function set(originalTarget, key, value) {
      if (key === TargetSlot) {
        return false;
      }

      originalTarget[key] = unwrap(value);
      return true;
    },
    apply: function apply(originalTarget, thisArg, args) {
      var unwrappedContext = unwrap(thisArg);
      var unwrappedArgs = ArrayMap.call(args, function (arg) {
        return unwrap(arg);
      });
      var value = originalTarget.apply(unwrappedContext, unwrappedArgs);
      return wrap(value);
    }
  };
  var TargetSlot = createFieldName('targetSlot'); // TODO: we are using a funky and leaky abstraction here to try to identify if
  // the proxy is a compat proxy, and define the unwrap method accordingly.
  // @ts-ignore: getting getKey from Proxy intrinsic

  var ProxyGetKey = Proxy.getKey;
  var getKey = ProxyGetKey ? ProxyGetKey : function (o, key) {
    return o[key];
  };

  function unwrap(value) {
    return value && getKey(value, TargetSlot) || value;
  }

  function contains(value) {
    return proxies.has(value);
  }

  function wrap(value) {
    if (isNull(value)) {
      return value;
    }

    var unwrapped = unwrap(value);

    if (!isReplicable(unwrapped)) {
      return unwrapped;
    }

    var r = proxies.get(unwrapped);

    if (r) {
      return r;
    }

    var proxy = new Proxy(unwrapped, traverseMembraneHandler);
    proxies.set(unwrapped, proxy);
    return proxy;
  }
  /**
  @license
  Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */


  function getInnerHTML(node) {
    var s = '';
    var childNodes = getFilteredChildNodes(node);

    for (var _i3 = 0, len = childNodes.length; _i3 < len; _i3 += 1) {
      s += getOuterHTML(childNodes[_i3]);
    }

    return s;
  }
  /**
  @license
  Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
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
      case Node.ELEMENT_NODE:
        {
          var tagName = node.tagName,
              attrs = node.attributes;

          var _s = '<' + toLowerCase.call(tagName);

          for (var _i4 = 0, attr; attr = attrs[_i4]; _i4++) {
            _s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
          }

          _s += '>';

          if (voidElements.has(tagName)) {
            return _s;
          }

          return _s + getInnerHTML(node) + '</' + toLowerCase.call(tagName) + '>';
        }

      case Node.TEXT_NODE:
        {
          var data = node.data,
              _parentNode = node.parentNode;

          if (_parentNode !== null && plaintextParents.has(_parentNode.tagName)) {
            return data;
          }

          return escapeData(data);
        }

      case Node.COMMENT_NODE:
        {
          return '<!--' + node.data + '-->';
        }

      default:
        {
          throw new Error();
        }
    }
  }
  /**
  @license
  Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
  */


  function getTextContent(node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        var childNodes = getFilteredChildNodes(node);
        var content = '';

        for (var _i5 = 0, len = childNodes.length; _i5 < len; _i5 += 1) {
          content += getTextContent(childNodes[_i5]);
        }

        return content;

      default:
        return node.nodeValue;
    }
  } // This is only needed in this polyfill because we closed the ability
  // this regular expression is used to transform aria props into aria attributes because
  // that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`


  var ARIA_REGEX$1 = /^aria/;
  var CAMEL_REGEX$1 = /-([a-z])/g; // Global Aria and Role Properties derived from ARIA and Role Attributes.
  // https://wicg.github.io/aom/spec/aria-reflection.html

  var ElementPrototypeAriaPropertyNames = ['ariaAutoComplete', 'ariaChecked', 'ariaCurrent', 'ariaDisabled', 'ariaExpanded', 'ariaHasPopUp', 'ariaHidden', 'ariaInvalid', 'ariaLabel', 'ariaLevel', 'ariaMultiLine', 'ariaMultiSelectable', 'ariaOrientation', 'ariaPressed', 'ariaReadOnly', 'ariaRequired', 'ariaSelected', 'ariaSort', 'ariaValueMax', 'ariaValueMin', 'ariaValueNow', 'ariaValueText', 'ariaLive', 'ariaRelevant', 'ariaAtomic', 'ariaBusy', 'ariaActiveDescendant', 'ariaControls', 'ariaDescribedBy', 'ariaFlowTo', 'ariaLabelledBy', 'ariaOwns', 'ariaPosInSet', 'ariaSetSize', 'ariaColCount', 'ariaColIndex', 'ariaDetails', 'ariaErrorMessage', 'ariaKeyShortcuts', 'ariaModal', 'ariaPlaceholder', 'ariaRoleDescription', 'ariaRowCount', 'ariaRowIndex', 'ariaRowSpan', 'role'];
  var nodeToAriaPropertyValuesMap = new WeakMap();
  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var _Element$prototype2 = Element.prototype,
      setAttribute$1 = _Element$prototype2.setAttribute,
      removeAttribute$1 = _Element$prototype2.removeAttribute,
      getAttribute$1 = _Element$prototype2.getAttribute;
  var isNativeShadowRootAvailable = typeof window.ShadowRoot !== "undefined";
  var _String$prototype3 = String.prototype,
      StringReplace$1 = _String$prototype3.replace,
      StringToLowerCase$1 = _String$prototype3.toLowerCase,
      StringToUpperCase = _String$prototype3.toUpperCase;

  function getAriaPropertyMap(elm) {
    var map = nodeToAriaPropertyValuesMap.get(elm);

    if (map === undefined) {
      map = {
        host: {},
        sr: {}
      };
      nodeToAriaPropertyValuesMap.set(elm, map); // the first time that we interact with a custom element via aria props
      // we should patch the host removeAttribute, so it can fallback.

      patchCustomElementAttributeMethods(elm);
    }

    return map;
  }

  function isShadowRoot(elmOrShadow) {
    return !_instanceof(elmOrShadow, Element) && 'host' in elmOrShadow;
  }

  function isSignedCustomElement(elmOrShadow) {
    return !isShadowRoot(elmOrShadow) && getNodeKey$1(elmOrShadow) !== undefined;
  }

  function getNormalizedAriaPropertyValue(propName, value) {
    return value == null ? null : value + '';
  }

  function patchCustomElementAttributeMethods(elm) {
    var originalSetAttribute = elm.setAttribute,
        originalRemoveAttribute = elm.removeAttribute;
    Object.defineProperties(elm, {
      removeAttribute: {
        value: function value(attrName) {
          var propName = StringReplace$1.call(attrName, CAMEL_REGEX$1, function (g) {
            return StringToUpperCase.call(g[1]);
          });
          var newValue = null;

          if (hasOwnProperty$1.call(descriptors, propName)) {
            newValue = getAriaPropertyMap(this).sr[propName];
          }

          if (newValue === null) {
            originalRemoveAttribute.call(this, attrName);
          } else {
            originalSetAttribute.call(this, attrName, newValue);
          }
        },
        enumerable: true,
        configurable: true
      }
    });
  }

  function createAriaPropertyPropertyDescriptor(propName, attrName, defaultValue) {
    return {
      get: function get() {
        var node = this;

        if (isSignedCustomElement(node)) {
          var map = getAriaPropertyMap(node);

          if (hasOwnProperty$1.call(map.host, propName)) {
            return map.host[propName];
          } else if (hasOwnProperty$1.call(map.sr, propName)) {
            return null;
          }
        } else if (isShadowRoot(node)) {
          // supporting regular custom elements and LWC
          var host = getShadowRootHost(node) || node.host;

          var _map = getAriaPropertyMap(host);

          return hasOwnProperty$1.call(_map, propName) ? _map[propName] : null;
        } // regular html elements are just going to reflect what's in the attribute


        return getAttribute$1.call(node, attrName);
      },
      set: function set(newValue) {
        var node = this;
        newValue = getNormalizedAriaPropertyValue(propName, newValue);

        if (isSignedCustomElement(node)) {
          var map = getAriaPropertyMap(node);
          map.host[propName] = newValue;

          if (newValue === null && hasOwnProperty$1.call(map.sr, propName) && map.sr[propName] !== null) {
            newValue = map.sr[propName]; // falling back to the shadow root's value
          }
        } else if (isShadowRoot(node)) {
          // supporting regular custom elements and LWC
          var host = getShadowRootHost(node) || node.host;

          var _map2 = getAriaPropertyMap(host);

          _map2.sr[propName] = newValue;

          if (!hasOwnProperty$1.call(_map2.host, propName) || _map2.host[propName] === null) {
            // the host already have a value for this property
            if (newValue === null) {
              removeAttribute$1.call(host, attrName);
            } else {
              setAttribute$1.call(host, attrName, newValue);
            }
          }

          return;
        } // regular html elements are just going to reflect what's in the attribute
        // while host and shadow roots will update the host when needed


        if (newValue === null) {
          removeAttribute$1.call(node, attrName);
        } else {
          setAttribute$1.call(node, attrName, newValue);
        }
      },
      configurable: true,
      enumerable: true
    };
  }

  var descriptors = {};

  function patch() {
    for (var _i6 = 0, len = ElementPrototypeAriaPropertyNames.length; _i6 < len; _i6 += 1) {
      var propName = ElementPrototypeAriaPropertyNames[_i6];

      if (Object.getOwnPropertyDescriptor(Element.prototype, propName) === undefined) {
        var attrName = StringToLowerCase$1.call(StringReplace$1.call(propName, ARIA_REGEX$1, 'aria-'));
        descriptors[propName] = createAriaPropertyPropertyDescriptor(propName, attrName, null);
      }
    }

    Object.defineProperties(Element.prototype, descriptors);

    if (isNativeShadowRootAvailable) {
      Object.defineProperties(window.ShadowRoot.prototype, descriptors);
    }
  }

  var ArtificialShadowRootPrototype;
  var HostKey = createFieldName('host');
  var ShadowRootKey = createFieldName('shadowRoot');
  var isNativeShadowRootAvailable$1 = typeof window.ShadowRoot !== "undefined";

  function getHost(root) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(root[HostKey], "A 'ShadowRoot' node must be attached to an 'HTMLElement' node.");
    }

    return root[HostKey];
  }

  function getShadowRoot(elm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(getInternalField(elm, ShadowRootKey), "A Custom Element with a shadow attached must be provided as the first argument.");
    }

    return getInternalField(elm, ShadowRootKey);
  } // Synthetic creation of all AOM property descriptors for Shadow Roots


  function createShadowRootAOMDescriptorMap() {
    return ArrayReduce.call(ElementPrototypeAriaPropertyNames, function (seed, propName) {
      var descriptor;

      if (isNativeShadowRootAvailable$1) {
        descriptor = getOwnPropertyDescriptor(window.ShadowRoot.prototype, propName);
      } else {
        descriptor = getOwnPropertyDescriptor(Element.prototype, propName);
      }

      if (!isUndefined(descriptor)) {
        seed[propName] = descriptor;
      }

      return seed;
    }, create(null));
  }

  function attachShadow(elm, options) {
    if (getInternalField(elm, ShadowRootKey)) {
      throw new Error("Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.");
    }

    var mode = options.mode;

    if (isUndefined(ArtificialShadowRootPrototype)) {
      // Adding AOM properties to the faux shadow root prototype
      // Note: lazy creation to avoid circular deps
      assign(ArtificialShadowRootDescriptors, createShadowRootAOMDescriptorMap());
      ArtificialShadowRootPrototype = create(null, ArtificialShadowRootDescriptors);
    }

    var sr = create(ArtificialShadowRootPrototype, {
      mode: {
        get: function get() {
          return mode;
        },
        enumerable: true,
        configurable: true
      }
    });
    setInternalField(sr, HostKey, elm);
    setInternalField(elm, ShadowRootKey, sr); // expose the shadow via a hidden symbol for testing purposes

    if (process.env.NODE_ENV === 'test') {
      elm['$$ShadowRoot$$'] = sr; // tslint:disable-line
    }

    return sr;
  }

  function patchedShadowRootChildNodesGetter() {
    return shadowRootChildNodes(this);
  }

  function patchedShadowRootFirstChildGetter() {
    var childNodes = this.childNodes;
    return childNodes[0] || null;
  }

  function patchedShadowRootLastChildGetter() {
    var childNodes = this.childNodes;
    return childNodes[childNodes.length - 1] || null;
  }

  function patchedShadowRootInnerHTMLGetter() {
    var childNodes = this.childNodes;
    var innerHTML = '';

    for (var _i7 = 0, len = childNodes.length; _i7 < len; _i7 += 1) {
      innerHTML += getInnerHTML(childNodes[_i7]);
    }

    return innerHTML;
  }

  function patchedShadowRootTextContentGetter() {
    var childNodes = this.childNodes;
    var textContent = '';

    for (var _i8 = 0, len = childNodes.length; _i8 < len; _i8 += 1) {
      textContent += getTextContent(childNodes[_i8]);
    }

    return textContent;
  }

  function hostGetter() {
    return getHost(this);
  }

  var ArtificialShadowRootDescriptors = {
    host: {
      get: hostGetter,
      enumerable: true,
      configurable: true
    },
    firstChild: {
      get: patchedShadowRootFirstChildGetter,
      enumerable: true,
      configurable: true
    },
    lastChild: {
      get: patchedShadowRootLastChildGetter,
      enumerable: true,
      configurable: true
    },
    innerHTML: {
      get: patchedShadowRootInnerHTMLGetter,
      enumerable: true,
      configurable: true
    },
    textContent: {
      get: patchedShadowRootTextContentGetter,
      enumerable: true,
      configurable: true
    },
    childNodes: {
      get: patchedShadowRootChildNodesGetter,
      enumerable: true,
      configurable: true
    },
    delegatesFocus: {
      value: false,
      enumerable: true,
      configurable: true
    },
    hasChildNodes: {
      value: function value() {
        return this.childNodes.length > 0;
      },
      enumerable: true,
      configurable: true
    },
    querySelector: {
      value: function value(selector) {
        var node = shadowRootQuerySelector(this, selector);

        if (process.env.NODE_ENV !== 'production') {
          var host = getHost(this);
          var isRoot = isUndefined(getNodeKey(host));

          if (isNull(node) && !isRoot) {
            // note: we don't show errors for root elements since their light dom is always empty in fallback mode
            if (getPatchedCustomElement(host).querySelector(selector)) {
              assert.logWarning("this.template.querySelector() can only return elements from the template declaration of ".concat(toString(host), ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead."));
            }
          }
        }

        return node;
      },
      enumerable: true,
      configurable: true
    },
    querySelectorAll: {
      value: function value(selector) {
        var nodeList = shadowRootQuerySelectorAll(this, selector);

        if (process.env.NODE_ENV !== 'production') {
          var host = getHost(this);
          var isRoot = isUndefined(getNodeKey(host));

          if (nodeList.length === 0 && !isRoot) {
            // note: we don't show errors for root elements since their light dom is always empty in fallback mode
            if (getPatchedCustomElement(host).querySelector(selector)) {
              assert.logWarning("this.template.querySelectorAll() can only return elements from template declaration of ".concat(toString(host), ". It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead."));
            }
          }
        }

        return nodeList;
      },
      enumerable: true,
      configurable: true
    },
    addEventListener: {
      value: function value(type, listener, options) {
        addShadowRootEventListener(this, type, listener, options);
      },
      enumerable: true,
      configurable: true
    },
    removeEventListener: {
      value: function value(type, listener, options) {
        removeShadowRootEventListener(this, type, listener, options);
      },
      enumerable: true,
      configurable: true
    },
    compareDocumentPosition: {
      value: function value(otherNode) {
        // this API might be called with proxies
        otherNode = unwrap(otherNode);
        var host = getHost(this);

        if (this === otherNode) {
          // it is the root itself
          return 0;
        }

        if (this.contains(otherNode)) {
          // it belongs to the shadow root instance
          return 20; // 10100 === DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        } else if (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) {
          // it is a child element but does not belong to the shadow root instance
          return 37; // 100101 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        } else {
          // it is not a descendant
          return 35; // 100011 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_PRECEDING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        }
      },
      enumerable: true,
      configurable: true
    },
    contains: {
      value: function value(otherNode) {
        // this API might be called with proxies
        otherNode = unwrap(otherNode);
        var host = getHost(this); // must be child of the host and owned by it.

        return (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 && isNodeOwnedBy(host, otherNode);
      },
      enumerable: true,
      configurable: true
    },
    toString: {
      value: function value() {
        return "[object ShadowRoot]";
      }
    }
  };

  function getPatchedCustomElement(element) {
    return wrap(element);
  }

  var iFrameContentWindowGetter = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow').get;

  function getNodeOwner(node) {
    if (!_instanceof(node, Node)) {
      return null;
    }

    var ownerKey; // search for the first element with owner identity (just in case of manually inserted elements)

    while (!isNull(node) && isUndefined(ownerKey = getNodeOwnerKey(node))) {
      node = parentNodeGetter.call(node);
    } // either we hit the wall, or we node is root element (which does not have an owner key)


    if (isUndefined(ownerKey) || isNull(node)) {
      return null;
    } // At this point, node is a valid node with owner identity, now we need to find the owner node
    // search for a custom element with a VM that owns the first element with owner identity attached to it


    while (!isNull(node) && getNodeKey(node) !== ownerKey) {
      node = parentNodeGetter.call(node);
    }

    if (isNull(node)) {
      return null;
    }

    return node;
  }

  function isNodeOwnedBy(owner, node) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(_instanceof(node, Node) && _instanceof(owner, HTMLElement), "isNodeOwnedByVM() should be called with a node as the second argument instead of ".concat(node));
      assert.isTrue(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS, "isNodeOwnedByVM() should never be called with a node that is not a child node of ".concat(owner));
    }

    var ownerKey = getNodeOwnerKey(node);
    return isUndefined(ownerKey) || getNodeKey(owner) === ownerKey;
  }

  function getShadowParent(node, value) {
    var owner = getNodeOwner(node);

    if (value === owner) {
      // walking up via parent chain might end up in the shadow root element
      return getShadowRoot(owner);
    } else if (_instanceof(value, Element) && getNodeOwnerKey(node) === getNodeOwnerKey(value)) {
      // cutting out access to something outside of the shadow of the current target (usually slots)
      return patchShadowDomTraversalMethods(value);
    }

    return null;
  }

  function parentNodeDescriptorValue() {
    var value = parentNodeGetter.call(this);

    if (isNull(value)) {
      return value;
    }

    return getShadowParent(this, value);
  }

  function parentElementDescriptorValue() {
    var parentNode = parentNodeDescriptorValue.call(this);
    var ownerShadow = getShadowRoot(getNodeOwner(this)); // If we have traversed to the host element,
    // we need to return null

    if (ownerShadow === parentNode) {
      return null;
    }

    return parentNode;
  }

  function shadowRootChildNodes(root) {
    var elm = getHost(root);
    return getAllMatches(elm, childNodesGetter.call(elm));
  }

  function getAllMatches(owner, nodeList) {
    var filteredAndPatched = [];

    for (var _i9 = 0, len = nodeList.length; _i9 < len; _i9 += 1) {
      var node = nodeList[_i9];
      var isOwned = isNodeOwnedBy(owner, node);

      if (isOwned) {
        // Patch querySelector, querySelectorAll, etc
        // if element is owned by VM
        ArrayPush.call(filteredAndPatched, patchShadowDomTraversalMethods(node));
      }
    }

    return filteredAndPatched;
  }

  function getFirstMatch(owner, nodeList) {
    for (var _i10 = 0, len = nodeList.length; _i10 < len; _i10 += 1) {
      if (isNodeOwnedBy(owner, nodeList[_i10])) {
        return patchShadowDomTraversalMethods(nodeList[_i10]);
      }
    }

    return null;
  }

  function lightDomQuerySelectorAll(elm, selector) {
    var owner = getNodeOwner(elm);

    if (isNull(owner)) {
      return [];
    }

    var matches = querySelectorAll.call(elm, selector);
    return getAllMatches(owner, matches);
  }

  function lightDomQuerySelector(elm, selector) {
    var owner = getNodeOwner(elm);

    if (isNull(owner)) {
      return null;
    }

    var nodeList = querySelectorAll.call(elm, selector);
    return getFirstMatch(owner, nodeList);
  }

  function lightDomQuerySelectorAllValue(selector) {
    return lightDomQuerySelectorAll(this, selector);
  }

  function lightDomQuerySelectorValue(selector) {
    return lightDomQuerySelector(this, selector);
  }

  function shadowRootQuerySelector(root, selector) {
    var elm = getHost(root);
    var nodeList = querySelectorAll.call(elm, selector);
    return getFirstMatch(elm, nodeList);
  }

  function shadowRootQuerySelectorAll(root, selector) {
    var elm = getHost(root);
    var nodeList = querySelectorAll.call(elm, selector);
    return getAllMatches(elm, nodeList);
  }

  function getFilteredSlotAssignedNodes(slot) {
    var owner = getNodeOwner(slot);

    if (isNull(owner)) {
      return [];
    }

    return ArrayReduce.call(childNodesGetter.call(slot), function (seed, child) {
      if (!isNodeOwnedBy(owner, child)) {
        ArrayPush.call(seed, child);
      }

      return seed;
    }, []);
  }

  function getFilteredSlotFlattenNodes(slot) {
    return ArrayReduce.call(childNodesGetter.call(slot), function (seed, child) {
      if (_instanceof(child, Element) && tagNameGetter.call(child) === 'SLOT') {
        ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child));
      } else {
        ArrayPush.call(seed, child);
      }

      return seed;
    }, []);
  }

  function getFilteredChildNodes(node) {
    var children;

    if (!isUndefined(getNodeKey(node))) {
      // node itself is a custom element
      // lwc element, in which case we need to get only the nodes
      // that were slotted
      var slots = querySelectorAll.call(node, 'slot');
      children = ArrayReduce.call(slots, function (seed, slot) {
        if (isNodeOwnedBy(node, slot)) {
          ArrayPush.apply(seed, getFilteredSlotAssignedNodes(slot));
        }

        return seed;
      }, []);
    } else {
      // regular element
      children = childNodesGetter.call(node);
    }

    var owner = getNodeOwner(node);

    if (isNull(owner)) {
      return [];
    }

    return ArrayReduce.call(children, function (seed, child) {
      if (isNodeOwnedBy(owner, child)) {
        ArrayPush.call(seed, child);
      }

      return seed;
    }, []);
  }

  function lightDomChildNodesGetter() {
    if (process.env.NODE_ENV !== 'production') {
      assert.logWarning("childNodes on ".concat(toString(this), " returns a live NodeList which is not stable. Use querySelectorAll instead."));
    }

    var owner = getNodeOwner(this);

    if (isNull(owner)) {
      return [];
    }

    return getAllMatches(owner, getFilteredChildNodes(this));
  }

  function lightDomInnerHTMLGetter() {
    return getInnerHTML(this);
  }

  function lightDomOuterHTMLGetter() {
    return getOuterHTML(this);
  }

  function lightDomTextContentGetter() {
    return getTextContent(this);
  }

  function assignedSlotGetter() {
    var parentNode = parentNodeGetter.call(this);
    /**
     * if it doesn't have a parent node,
     * or the parent is not an slot element
     * or they both belong to the same template (default content)
     * we should assume that it is not slotted
     */

    if (isNull(parentNode) || tagNameGetter.call(parentNode) !== 'SLOT' || getNodeOwnerKey(parentNode) === getNodeOwnerKey(this)) {
      return null;
    }

    return patchShadowDomTraversalMethods(parentNode);
  }

  function slotAssignedNodesValue(options) {
    var flatten = !isUndefined(options) && isTrue(options.flatten);
    var nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
    return ArrayMap.call(nodes, patchShadowDomTraversalMethods);
  }

  function slotAssignedElementsValue(options) {
    var flatten = !isUndefined(options) && isTrue(options.flatten);
    var nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
    var elements = ArrayFilter.call(nodes, function (node) {
      return _instanceof(node, Element);
    });
    return ArrayMap.call(elements, patchShadowDomTraversalMethods);
  }

  function slotNameGetter() {
    var name = getAttribute.call(this, 'name');
    return isNull(name) ? '' : name;
  }

  var NodePatchDescriptors$1 = {
    childNodes: {
      get: lightDomChildNodesGetter,
      configurable: true,
      enumerable: true
    },
    assignedSlot: {
      get: assignedSlotGetter,
      configurable: true,
      enumerable: true
    },
    textContent: {
      get: lightDomTextContentGetter,
      set: textContextSetter,
      configurable: true,
      enumerable: true
    },
    parentNode: {
      get: parentNodeDescriptorValue,
      configurable: true
    },
    parentElement: {
      get: parentElementDescriptorValue,
      configurable: true
    }
  };
  var ElementPatchDescriptors = assign(create(null), NodePatchDescriptors$1, {
    querySelector: {
      value: lightDomQuerySelectorValue,
      configurable: true,
      enumerable: true,
      writable: true
    },
    querySelectorAll: {
      value: lightDomQuerySelectorAllValue,
      configurable: true,
      enumerable: true,
      writable: true
    },
    innerHTML: {
      get: lightDomInnerHTMLGetter,
      set: innerHTMLSetter,
      configurable: true,
      enumerable: true
    },
    outerHTML: {
      get: lightDomOuterHTMLGetter,
      configurable: true,
      enumerable: true
    }
  });
  var SlotPatchDescriptors = assign(create(null), ElementPatchDescriptors, {
    assignedElements: {
      value: slotAssignedElementsValue,
      configurable: true,
      enumerable: true,
      writable: true
    },
    assignedNodes: {
      value: slotAssignedNodesValue,
      configurable: true,
      enumerable: true,
      writable: true
    },
    name: {
      // in browsers that do not support shadow dom, slot's name attribute is not reflective
      get: slotNameGetter,
      configurable: true,
      enumerable: true
    }
  });
  var contentWindowDescriptor = {
    get: function get() {
      var original = iFrameContentWindowGetter.call(this);

      if (original) {
        return wrapIframeWindow(original);
      }

      return original;
    },
    configurable: true
  };

  function nodeIsPatched(node) {
    // TODO: Remove comment once membrane is gone
    // return isFalse(hasOwnProperty.call(node, 'querySelector'));
    return contains(node);
  }

  function patchDomNode(node) {
    return wrap(node);
  } // For the time being, we have to use a proxy to get Shadow Semantics.
  // The other possibility is to monkey patch the element itself, but this
  // is very difficult to integrate because almost no integration tests
  // understand what to do with shadow root. Using a Proxy here allows us
  // to enforce shadow semantics from within components and still allows browser
  // to use "light" apis as expected.


  function patchShadowDomTraversalMethods(node) {
    // Patching is done at the HTMLElement instance level.
    // Avoid monkey patching shadow methods twice for perf reasons.
    // If the node has querySelector defined on it, we have already
    // seen it and can move on.
    if (isFalse(nodeIsPatched(node)) && _instanceof(node, Element)) {
      if (tagNameGetter.call(node) === 'IFRAME') {
        // We need to patch iframe.contentWindow because raw access to the contentWindow
        // Will break in compat mode
        defineProperty(node, 'contentWindow', contentWindowDescriptor);
      }
    }

    return patchDomNode(node);
  }

  var EventListenerContext;

  (function (EventListenerContext) {
    EventListenerContext[EventListenerContext["CUSTOM_ELEMENT_LISTENER"] = 1] = "CUSTOM_ELEMENT_LISTENER";
    EventListenerContext[EventListenerContext["SHADOW_ROOT_LISTENER"] = 2] = "SHADOW_ROOT_LISTENER";
  })(EventListenerContext || (EventListenerContext = {}));

  var eventToContextMap = new WeakMap();

  function isChildNode(root, node) {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
  }

  var eventTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'target').get;
  var eventCurrentTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'currentTarget').get;
  var GET_ROOT_NODE_CONFIG_FALSE = {
    composed: false
  };
  var EventPatchDescriptors = {
    currentTarget: {
      get: function get() {
        var currentTarget = eventCurrentTargetGetter.call(this);

        if (isNull(currentTarget) || isUndefined(getNodeOwnerKey(currentTarget))) {
          // event is already beyond the boundaries of our controlled shadow roots
          return currentTarget;
        }

        return patchShadowDomTraversalMethods(currentTarget);
      },
      enumerable: true,
      configurable: true
    },
    target: {
      get: function get() {
        var currentTarget = eventCurrentTargetGetter.call(this);
        var originalTarget = eventTargetGetter.call(this); // Handle cases where the currentTarget is null (for async events)
        // and when currentTarget is window.

        if (!_instanceof(currentTarget, Node)) {
          // the event was inspected asynchronously, in which case we need to return the
          // top custom element the belongs to the body.
          var outerMostElement = originalTarget;

          var _parentNode2;

          while ((_parentNode2 = parentNodeGetter.call(outerMostElement)) && !isUndefined(getNodeOwnerKey(outerMostElement))) {
            outerMostElement = _parentNode2;
          } // This value will always be the root LWC node.
          // There is a chance that this value will be accessed
          // inside of an async event handler in the component tree,
          // but because we don't know if it is being accessed
          // inside the tree or outside the tree, we do not patch.


          return outerMostElement;
        }

        var eventContext = eventToContextMap.get(this); // Executing event listener on component, target is always currentTarget

        if (eventContext === EventListenerContext.CUSTOM_ELEMENT_LISTENER) {
          return patchShadowDomTraversalMethods(currentTarget);
        }

        var currentTargetRootNode = getRootNode.call(currentTarget, GET_ROOT_NODE_CONFIG_FALSE); // x-child
        // Before we can process any events, we need to first determine three things:
        // 1) What VM context was the event attached to? (e.g. in what VM context was addEventListener called in).
        // 2) What VM owns the context where the event was attached? (e.g. who rendered the VM context from step 1).
        // 3) What is the event's original target's relationship to 1 and 2?
        // Determining Number 1:
        // In most cases, the VM context maps to the currentTarget's owner VM. This will correspond to the custom element:
        //
        // // x-parent.html
        // <template>
        //  <!--
        //    The event below is attached inside of x-parent's template
        //    so vm context will be <x-parent>'s owner VM
        //  -->
        //  <div onclick={handleClick}</div>
        // </template>
        //
        // In the case of this.template.addEventListener, the VM context needs to be the custom element's VM, NOT the owner VM.
        //
        // // x-parent.js
        // connectedCallback() {
        //   The event below is attached to x-parent's shadow root.
        //   Under the hood, we add the event listener to the custom element.
        //   Because template events happen INSIDE the custom element's shadow,
        //   we CANNOT get the owner VM. Instead, we must get the custom element's VM instead.
        //   this.template.addEventListener('click', () => {});
        // }

        var myCurrentShadowKey = eventContext === EventListenerContext.SHADOW_ROOT_LISTENER ? getNodeKey(currentTarget) : getNodeOwnerKey(currentTarget); // Determine Number 2:
        // The easy part: The VM context owner is always the event's currentTarget OwnerKey:
        // NOTE: if the current target is the shadow root, the way we collect the Context owner's key is different because
        //       currentTargetRootNode is both: shadow root and custom element.

        var myOwnerKey = eventContext === EventListenerContext.SHADOW_ROOT_LISTENER ? getNodeKey(currentTargetRootNode) : getNodeOwnerKey(currentTargetRootNode); // Determining Number 3:
        // Because we only support bubbling and we are already inside of an event, we know that the original event target
        // is an ancestor of the currentTarget. The key here, is that we have to determine if the event is coming from an
        // element inside of the attached shadow context (#1 above) or from the owner context (#2).
        // We determine this by traversing up the DOM until either 1) We come across an element that has the same VM as #1
        // Or we come across an element that has the same VM as #2.
        //
        // If we come across an element that has the same VM as #1, we have an element that was rendered inside #1 template:
        //
        // <template>
        //   <x-foo onClick={handleClick}> <!-- VM is equal to #1, this is our target
        //      # shadow
        //           <div> <-- VM is not equal to #1 or #2, keep going
        //              <span>  <-- click event happened
        // </template>
        //
        //
        // If we come across an element that has the same VM as #2, we have an element that was rendered inside #1 slot:
        // <template>
        //  <div onClick={handleClick}>
        //    <slot>
        //      <x-bar> <-- VM is equal to #2, this is our target
        //        # x-bar shadow
        //          <div> <-- VM is not equal to #1 or #2, keep going
        //            <x-baz>  <-- VM is not equal to #1 or #2, keep going
        //              # x-baz shadow
        //                <span></span>  <-- click event happened
        //            </x-baz>
        //          </div>
        //      </x-bar>
        //    </slot>
        //  </div>
        // </template>
        //

        var closestTarget = originalTarget;

        while (getNodeOwnerKey(closestTarget) !== myCurrentShadowKey && getNodeOwnerKey(closestTarget) !== myOwnerKey) {
          closestTarget = parentNodeGetter.call(closestTarget);
        }
        /**
         * <div> <-- document.querySelector('div').addEventListener('click')
         *    <x-foo></x-foo> <-- this.addEventListener('click') in constructor
         * </div>
         *
         * or
         *
         * <x-foo></x-foo> <-- document.querySelector('x-foo').addEventListener('click')
         * while the event is patched because the component is listening for it internally
         * via this.addEventListener('click') in constructor or something similar
         */


        if (isUndefined(getNodeOwnerKey(closestTarget))) {
          return closestTarget;
        }

        return patchShadowDomTraversalMethods(closestTarget);
      },
      enumerable: true,
      configurable: true
    }
  };

  function patchEvent(event) {
    if (!eventToContextMap.has(event)) {
      defineProperties(event, EventPatchDescriptors);
      eventToContextMap.set(event, 0);
    }
  }

  var customElementToWrappedListeners = new WeakMap();

  function getEventMap(elm) {
    var listenerInfo = customElementToWrappedListeners.get(elm);

    if (isUndefined(listenerInfo)) {
      listenerInfo = create(null);
      customElementToWrappedListeners.set(elm, listenerInfo);
    }

    return listenerInfo;
  }

  var shadowRootEventListenerMap = new WeakMap();

  function getWrappedShadowRootListener(sr, listener) {
    if (!isFunction(listener)) {
      throw new TypeError(); // avoiding problems with non-valid listeners
    }

    var shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);

    if (isUndefined(shadowRootWrappedListener)) {
      shadowRootWrappedListener = function shadowRootWrappedListener(event) {
        // * if the event is dispatched directly on the host, it is not observable from root
        // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
        //   it is not observable from the root
        var composed = event.composed;
        var target = eventTargetGetter.call(event);
        var currentTarget = eventCurrentTargetGetter.call(event);

        if ( // it is composed and was not dispatched onto the custom element directly
        composed === true && target !== currentTarget || // it is coming from an slotted element
        isChildNode(getRootNode.call(target, event), currentTarget) || // it is not composed and its is coming from from shadow
        composed === false && getRootNode.call(target) === currentTarget) {
          // TODO: we should figure why `undefined` makes sense here
          // and how this is going to work for native shadow root?
          listener.call(undefined, event);
        }
      };

      shadowRootWrappedListener.placement = EventListenerContext.SHADOW_ROOT_LISTENER;

      if (process.env.NODE_ENV !== 'production') {
        shadowRootWrappedListener.original = listener; // for logging purposes
      }

      shadowRootEventListenerMap.set(listener, shadowRootWrappedListener);
    }

    return shadowRootWrappedListener;
  }

  var customElementEventListenerMap = new WeakMap();

  function getWrappedCustomElementListener(elm, listener) {
    if (!isFunction(listener)) {
      throw new TypeError(); // avoiding problems with non-valid listeners
    }

    var customElementWrappedListener = customElementEventListenerMap.get(listener);

    if (isUndefined(customElementWrappedListener)) {
      customElementWrappedListener = function customElementWrappedListener(event) {
        if (isValidEventForCustomElement(event)) {
          // all handlers on the custom element should be called with undefined 'this'
          listener.call(elm, event);
        }
      };

      customElementWrappedListener.placement = EventListenerContext.CUSTOM_ELEMENT_LISTENER;

      if (process.env.NODE_ENV !== 'production') {
        customElementWrappedListener.original = listener; // for logging purposes
      }

      customElementEventListenerMap.set(listener, customElementWrappedListener);
    }

    return customElementWrappedListener;
  }

  function domListener(evt) {
    var interrupted = false;
    var type = evt.type,
        stopImmediatePropagation = evt.stopImmediatePropagation;
    var currentTarget = eventCurrentTargetGetter.call(evt);
    var listenerMap = getEventMap(currentTarget);
    var listeners = listenerMap[type]; // it must have listeners at this point

    var len = listeners.length;

    evt.stopImmediatePropagation = function () {
      interrupted = true;
      stopImmediatePropagation.call(evt);
    };

    patchEvent(evt);
    eventToContextMap.set(evt, EventListenerContext.SHADOW_ROOT_LISTENER);

    for (var _i11 = 0; _i11 < len; _i11 += 1) {
      if (listeners[_i11].placement === EventListenerContext.SHADOW_ROOT_LISTENER) {
        // all handlers on the custom element should be called with undefined 'this'
        listeners[_i11].call(undefined, evt);

        if (interrupted) {
          return;
        }
      }
    }

    eventToContextMap.set(evt, EventListenerContext.CUSTOM_ELEMENT_LISTENER);

    for (var _i12 = 0; _i12 < len; _i12 += 1) {
      if (listeners[_i12].placement === EventListenerContext.CUSTOM_ELEMENT_LISTENER) {
        // all handlers on the custom element should be called with undefined 'this'
        listeners[_i12].call(undefined, evt);

        if (interrupted) {
          return;
        }
      }
    }

    eventToContextMap.set(evt, 0);
  }

  function attachDOMListener(elm, type, wrappedListener) {
    var listenerMap = getEventMap(elm);
    var cmpEventHandlers = listenerMap[type];

    if (isUndefined(cmpEventHandlers)) {
      cmpEventHandlers = listenerMap[type] = [];
    } // only add to DOM if there is no other listener on the same placement yet


    if (cmpEventHandlers.length === 0) {
      addEventListener.call(elm, type, domListener);
    } else if (process.env.NODE_ENV !== 'production') {
      if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
        assert.logWarning("".concat(toString(elm), " has duplicate listener ").concat(wrappedListener.original, " for event \"").concat(type, "\". Instead add the event listener in the connectedCallback() hook."));
      }
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
    } else if (process.env.NODE_ENV !== 'production') {
      assert.logError("Did not find event listener ".concat(wrappedListener.original, " for event \"").concat(type, "\" on ").concat(toString(elm), ". This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook."));
    }
  }

  var NON_COMPOSED = {
    composed: false
  };

  function isValidEventForCustomElement(event) {
    var target = eventTargetGetter.call(event);
    var currentTarget = eventCurrentTargetGetter.call(event);
    var composed = event.composed;
    return (// it is composed, and we should always get it, or
      composed === true || // it is dispatched onto the custom element directly, or
      target === currentTarget || // it is coming from an slotted element
      isChildNode(getRootNode.call(target, NON_COMPOSED), currentTarget)
    );
  }

  function addCustomElementEventListener(elm, type, listener, options) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isFunction(listener), "Invalid second argument for this.template.addEventListener() in ".concat(toString(elm), " for event \"").concat(type, "\". Expected an EventListener but received ").concat(listener, ".")); // TODO: issue #420
      // this is triggered when the component author attempts to add a listener programmatically into a lighting element node

      if (!isUndefined(options)) {
        assert.logWarning("The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed: ".concat(toString(options), " in ").concat(toString(elm)));
      }
    }

    var wrappedListener = getWrappedCustomElementListener(elm, listener);
    attachDOMListener(elm, type, wrappedListener);
  }

  function removeCustomElementEventListener(elm, type, listener, options) {
    var wrappedListener = getWrappedCustomElementListener(elm, listener);
    detachDOMListener(elm, type, wrappedListener);
  }

  function addShadowRootEventListener(sr, type, listener, options) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isFunction(listener), "Invalid second argument for this.template.addEventListener() in ".concat(toString(sr), " for event \"").concat(type, "\". Expected an EventListener but received ").concat(listener, ".")); // TODO: issue #420
      // this is triggered when the component author attempts to add a listener programmatically into its Component's shadow root

      if (!isUndefined(options)) {
        assert.logWarning("The 'addEventListener' method in 'ShadowRoot' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed: ".concat(toString(options), " in ").concat(toString(sr)));
      }
    }

    var elm = getHost(sr);
    var wrappedListener = getWrappedShadowRootListener(sr, listener);
    attachDOMListener(elm, type, wrappedListener);
  }

  function removeShadowRootEventListener(sr, type, listener, options) {
    var elm = getHost(sr);
    var wrappedListener = getWrappedShadowRootListener(sr, listener);
    detachDOMListener(elm, type, wrappedListener);
  }

  function addEventListenerPatchedValue(type, listener, options) {
    addCustomElementEventListener(this, type, listener, options);
  }

  function removeEventListenerPatchedValue(type, listener, options) {
    removeCustomElementEventListener(this, type, listener, options);
  }

  function attachShadowGetter(options) {
    return attachShadow(this, options);
  }

  var CustomElementPatchDescriptors = {
    attachShadow: {
      value: attachShadowGetter,
      writable: true,
      enumerable: true,
      configurable: true
    },
    addEventListener: {
      value: addEventListenerPatchedValue,
      configurable: true,
      enumerable: true
    },
    removeEventListener: {
      value: removeEventListenerPatchedValue,
      configurable: true,
      enumerable: true
    }
  };

  function patchCustomElement(elm) {
    defineProperties(elm, CustomElementPatchDescriptors);
  }

  var CHAR_S = 115;
  var CHAR_V = 118;
  var CHAR_G = 103;
  var NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
  var SymbolIterator = Symbol.iterator;
  var _Node2 = Node,
      ELEMENT_NODE = _Node2.ELEMENT_NODE,
      TEXT_NODE = _Node2.TEXT_NODE,
      COMMENT_NODE = _Node2.COMMENT_NODE;
  var classNameToClassMap = create(null);

  function getMapFromClassName(className) {
    if (className === undefined) {
      return;
    }

    var map = classNameToClassMap[className];

    if (map) {
      return map;
    }

    map = {};
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
  } // insert is called after postpatch, which is used somewhere else (via a module)
  // to mark the vm as inserted, that means we cannot use postpatch as the main channel
  // to rehydrate when dirty, because sometimes the element is not inserted just yet,
  // which breaks some invariants. For that reason, we have the following for any
  // Custom Element that is inserted via a template.


  var hook = {
    postpatch: function postpatch(oldVNode, vnode) {
      var vm = getCustomElementVM(vnode.elm);
      renderVM(vm);
    },
    insert: function insert(vnode) {
      var vm = getCustomElementVM(vnode.elm);
      appendVM(vm);
      renderVM(vm);
    },
    create: function create(oldVNode, vnode) {
      var _vnode$data = vnode.data,
          fallback = _vnode$data.fallback,
          mode = _vnode$data.mode,
          ctor = _vnode$data.ctor;
      var elm = vnode.elm;

      if (hasOwnProperty.call(elm, ViewModelReflection)) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here since this hook is called right after invoking `document.createElement`.
        return;
      }

      createVM(vnode.sel, elm, ctor, {
        mode: mode,
        fallback: fallback
      });
      var vm = getCustomElementVM(elm);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        assert.isTrue(isArray(vnode.children), "Invalid vnode for a custom element, it must have children defined.");
      }

      if (isTrue(vm.fallback)) {
        // slow path
        var children = vnode.children;
        allocateInSlot(vm, children); // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!

        vnode.children = EmptyArray;
      }
    },
    update: function update(oldVNode, vnode) {
      var vm = getCustomElementVM(vnode.elm);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        assert.isTrue(isArray(vnode.children), "Invalid vnode for a custom element, it must have children defined.");
      }

      if (isTrue(vm.fallback)) {
        // slow path
        var children = vnode.children;
        allocateInSlot(vm, children); // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!

        vnode.children = EmptyArray;
      }
    },
    destroy: function destroy(vnode) {
      removeVM(getCustomElementVM(vnode.elm));
    }
  };

  function isVElement(vnode) {
    return vnode.nt === ELEMENT_NODE;
  }

  function addNS(vnode) {
    var data = vnode.data,
        children = vnode.children,
        sel = vnode.sel; // TODO: review why `sel` equal `foreignObject` should get this `ns`

    data.ns = NamespaceAttributeForSVG;

    if (isArray(children) && sel !== 'foreignObject') {
      for (var j = 0, n = children.length; j < n; ++j) {
        var childNode = children[j];

        if (childNode != null && isVElement(childNode)) {
          addNS(childNode);
        }
      }
    }
  }

  function getCurrentOwnerId() {
    return isNull(vmBeingRendered) ? 0 : vmBeingRendered.uid;
  }

  function getCurrentFallback() {
    // TODO: eventually this should fallback to false to favor real Shadow DOM
    return isNull(vmBeingRendered) || vmBeingRendered.fallback;
  }

  function getCurrentShadowToken() {
    // For root elements and other special cases the vm is not set.
    if (isNull(vmBeingRendered)) {
      return;
    }

    return vmBeingRendered.context.shadowToken;
  }

  function normalizeStyleString(value) {
    if (value == null || value === false) {
      return;
    }

    if (isString(value)) {
      return value;
    }

    return value + '';
  } // [h]tml node


  function h(sel, data, children) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(sel), "h() 1st argument sel must be a string.");
      assert.isTrue(isObject(data), "h() 2nd argument data must be an object.");
      assert.isTrue(isArray(children), "h() 3rd argument children must be an array.");
      assert.isTrue('key' in data || !!data.key, " <".concat(sel, "> \"key\" attribute is invalid or missing for ").concat(vmBeingRendered, ". Key inside iterator is either undefined or null.")); // checking reserved internal data properties

      assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling h().");
      assert.isFalse(data.className && data.classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
      assert.isFalse(data.styleMap && data.style, "vnode.data.styleMap and vnode.data.style ambiguous declaration.");

      if (data.style && !isString(data.style)) {
        assert.logWarning("Invalid 'style' attribute passed to <".concat(sel, "> should be a string value, and will be ignored."));
      }

      forEach.call(children, function (childVnode) {
        if (childVnode != null) {
          assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode && "nt" in childVnode, "".concat(childVnode, " is not a vnode."));
        }
      });
    }

    var classMap = data.classMap,
        className = data.className,
        style = data.style,
        styleMap = data.styleMap,
        key = data.key;
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentShadowToken();
    data.uid = getCurrentOwnerId();
    var text, elm; // tslint:disable-line

    var vnode = {
      nt: ELEMENT_NODE,
      tag: sel,
      sel: sel,
      data: data,
      children: children,
      text: text,
      elm: elm,
      key: key
    };

    if (sel.length === 3 && StringCharCodeAt.call(sel, 0) === CHAR_S && StringCharCodeAt.call(sel, 1) === CHAR_V && StringCharCodeAt.call(sel, 2) === CHAR_G) {
      addNS(vnode);
    }

    return vnode;
  } // [s]lot element node


  function s(slotName, data, children, slotset) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(slotName), "s() 1st argument slotName must be a string.");
      assert.isTrue(isObject(data), "s() 2nd argument data must be an object.");
      assert.isTrue(isArray(children), "h() 3rd argument children must be an array.");
    }

    return h('slot', data, isUndefined(slotset) || isUndefined(slotset[slotName]) || slotset[slotName].length === 0 ? children : slotset[slotName]);
  } // [c]ustom element node


  function c(sel, Ctor, data, children) {
    if (isCircularModuleDependency(Ctor)) {
      Ctor = resolveCircularModuleDependency(Ctor);
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isString(sel), "c() 1st argument sel must be a string.");
      assert.isTrue(isFunction(Ctor), "c() 2nd argument Ctor must be a function.");
      assert.isTrue(isObject(data), "c() 3nd argument data must be an object.");
      assert.isTrue(arguments.length === 3 || isArray(children), "c() 4nd argument data must be an array."); // checking reserved internal data properties

      assert.invariant(data.class === undefined, "vnode.data.class should be undefined when calling c().");
      assert.isFalse(data.className && data.classMap, "vnode.data.className and vnode.data.classMap ambiguous declaration.");
      assert.isFalse(data.styleMap && data.style, "vnode.data.styleMap and vnode.data.style ambiguous declaration.");

      if (data.style && !isString(data.style)) {
        assert.logWarning("Invalid 'style' attribute passed to <".concat(sel, "> should be a string value, and will be ignored."));
      }

      if (arguments.length === 4) {
        forEach.call(children, function (childVnode) {
          if (childVnode != null) {
            assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode && "nt" in childVnode, "".concat(childVnode, " is not a vnode."));
          }
        });
      }
    }

    var _data = data,
        key = _data.key,
        styleMap = _data.styleMap,
        style = _data.style,
        on = _data.on,
        className = _data.className,
        classMap = _data.classMap,
        props = _data.props;
    var _data2 = data,
        attrs = _data2.attrs; // hack to allow component authors to force the usage of the "is" attribute in their components

    var _Ctor = Ctor,
        forceTagName = _Ctor.forceTagName;
    var tag = sel,
        text,
        elm; // tslint:disable-line

    if (!isUndefined(attrs) && !isUndefined(attrs.is)) {
      tag = sel;
      sel = attrs.is;
    } else if (!isUndefined(forceTagName)) {
      tag = forceTagName;
      attrs = assign(create(null), attrs);
      attrs.is = sel;
    }

    data = {
      hook: hook,
      key: key,
      attrs: attrs,
      on: on,
      props: props,
      ctor: Ctor
    };
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentShadowToken();
    data.uid = getCurrentOwnerId();
    data.fallback = getCurrentFallback();
    data.mode = 'open'; // TODO: this should be defined in Ctor

    children = arguments.length === 3 ? EmptyArray : children;
    var vnode = {
      nt: ELEMENT_NODE,
      tag: tag,
      sel: sel,
      data: data,
      children: children,
      text: text,
      elm: elm,
      key: key
    };
    return vnode;
  } // [i]terable node


  function i(iterable, factory) {
    var list = [];

    if (isUndefined(iterable) || iterable === null) {
      if (process.env.NODE_ENV !== 'production') {
        assert.logWarning("Invalid template iteration for value \"".concat(iterable, "\" in ").concat(vmBeingRendered, ", it should be an Array or an iterable Object."));
      }

      return list;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.isFalse(isUndefined(iterable[SymbolIterator]), "Invalid template iteration for value `".concat(iterable, "` in ").concat(vmBeingRendered, ", it requires an array-like object, not `null` or `undefined`."));
    }

    var iterator = iterable[SymbolIterator]();

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(iterator && isFunction(iterator.next), "Invalid iterator function for \"".concat(iterable, "\" in ").concat(vmBeingRendered, "."));
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

      var vnode = factory(value, j, j === 0, last);

      if (isArray(vnode)) {
        ArrayPush.apply(list, vnode);
      } else {
        ArrayPush.call(list, vnode);
      }

      if (process.env.NODE_ENV !== 'production') {
        var vnodes = isArray(vnode) ? vnode : [vnode];
        forEach.call(vnodes, function (childVnode) {
          if (!isNull(childVnode) && isObject(childVnode) && !isUndefined(childVnode.sel)) {
            var key = childVnode.key;

            if (isString(key) || isNumber(key)) {
              if (keyMap[key] === 1 && isUndefined(iterationError)) {
                iterationError = "Duplicated \"key\" attribute value for \"<".concat(childVnode.sel, ">\" in ").concat(vmBeingRendered, " for item number ").concat(j, ". Key with value \"").concat(childVnode.key, "\" appears more than once in iteration. Key values must be unique numbers or strings.");
              }

              keyMap[key] = 1;
            } else if (isUndefined(iterationError)) {
              iterationError = "Invalid \"key\" attribute value in \"<".concat(childVnode.sel, ">\" in ").concat(vmBeingRendered, " for item number ").concat(j, ". Instead set a unique \"key\" attribute value on all iteration children so internal state can be preserved during rehydration.");
            }
          }
        });
      } // preparing next value


      j += 1;
      value = next.value;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!isUndefined(iterationError)) {
        assert.logError(iterationError);
      }
    }

    return list;
  }
  /**
   * [f]lattening
   */


  function f(items) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    }

    var len = items.length;
    var flattened = [];

    for (var j = 0; j < len; j += 1) {
      var item = items[j];

      if (isArray(item)) {
        ArrayPush.apply(flattened, item);
      } else {
        ArrayPush.call(flattened, item);
      }
    }

    return flattened;
  } // [t]ext node


  function t(text) {
    var sel,
        data = {
      uid: getCurrentOwnerId()
    },
        children,
        key,
        elm; // tslint:disable-line

    return {
      nt: TEXT_NODE,
      sel: sel,
      data: data,
      children: children,
      text: text,
      elm: elm,
      key: key
    };
  }

  function p(text) {
    var sel = '!',
        data = {
      uid: getCurrentOwnerId()
    },
        children,
        key,
        elm; // tslint:disable-line

    return {
      nt: COMMENT_NODE,
      sel: sel,
      data: data,
      children: children,
      text: text,
      elm: elm,
      key: key
    };
  } // [d]ynamic value to produce a text vnode


  function d(value) {
    if (value === undefined || value === null) {
      return null;
    }

    return t(value);
  } // [b]ind function


  function b(fn) {
    if (isNull(vmBeingRendered)) {
      throw new Error();
    }

    var vm = vmBeingRendered;
    return function (event) {
      if (vm.fallback) {
        patchEvent(event);
      }

      invokeEventListener(vm, fn, vm.component, event);
    };
  } // [k]ey function


  function k(compilerKey, obj) {
    switch (_typeof(obj)) {
      case 'number': // TODO: when obj is a numeric key, we might be able to use some
      // other strategy to combine two numbers into a new unique number

      case 'string':
        return compilerKey + ':' + obj;

      case 'object':
        if (process.env.NODE_ENV !== 'production') {
          assert.fail("Invalid key value \"".concat(obj, "\" in ").concat(vmBeingRendered, ". Key must be a string or number."));
        }

    }
  }

  var api =
  /*#__PURE__*/
  Object.freeze({
    h: h,
    s: s,
    c: c,
    i: i,
    f: f,
    t: t,
    p: p,
    d: d,
    b: b,
    k: k
  });
  var _Element$prototype3 = Element.prototype,
      setAttribute$2 = _Element$prototype3.setAttribute,
      getAttribute$2 = _Element$prototype3.getAttribute,
      setAttributeNS$1 = _Element$prototype3.setAttributeNS,
      getAttributeNS$1 = _Element$prototype3.getAttributeNS,
      removeAttribute$2 = _Element$prototype3.removeAttribute,
      removeAttributeNS$1 = _Element$prototype3.removeAttributeNS,
      addEventListener$1 = _Element$prototype3.addEventListener,
      removeEventListener$1 = _Element$prototype3.removeEventListener;
  var parentNodeGetter$1 = getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;
  var parentElementGetter$1 = hasOwnProperty.call(Node.prototype, 'parentElement') ? getOwnPropertyDescriptor(Node.prototype, 'parentElement').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement').get; // IE11

  var elementTagNameGetter = getOwnPropertyDescriptor(Element.prototype, 'tagName').get;

  var _dispatchEvent = 'EventTarget' in window ? EventTarget.prototype.dispatchEvent : Node.prototype.dispatchEvent; // IE11


  var BaseCustomElementProto = document.createElement('x-lwc').constructor.prototype;
  var EmptySlots = create(null);

  function validateSlots(vm, html) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var _vm$cmpSlots = vm.cmpSlots,
        cmpSlots = _vm$cmpSlots === void 0 ? EmptySlots : _vm$cmpSlots;
    var _html$slots = html.slots,
        slots = _html$slots === void 0 ? EmptyArray : _html$slots;

    for (var slotName in cmpSlots) {
      assert.isTrue(isArray(cmpSlots[slotName]), "Slots can only be set to an array, instead received ".concat(toString(cmpSlots[slotName]), " for slot \"").concat(slotName, "\" in ").concat(vm, "."));

      if (ArrayIndexOf.call(slots, slotName) === -1) {
        // TODO: this should never really happen because the compiler should always validate
        assert.logWarning("Ignoring unknown provided slot name \"".concat(slotName, "\" in ").concat(vm, ". This is probably a typo on the slot attribute."));
      }
    }
  }

  function validateFields(vm, html) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var component = vm.component; // validating identifiers used by template that should be provided by the component

    var _html$ids = html.ids,
        ids = _html$ids === void 0 ? [] : _html$ids;
    forEach.call(ids, function (propName) {
      if (!(propName in component)) {
        assert.logWarning("The template rendered by ".concat(vm, " references `this.").concat(propName, "`, which is not declared. This is likely a typo in the template."));
      } else if (hasOwnProperty.call(component, propName)) {
        assert.fail("".concat(component, "'s template is accessing `this.").concat(toString(propName), "`, which is considered a non-reactive private field. Instead access it via a getter or make it reactive by decorating it with `@track ").concat(toString(propName), "`."));
      }
    });
  }
  /**
   * Apply/Update the styling token applied to the host element.
   */


  function applyTokenToHost(vm, html) {
    var context = vm.context,
        elm = vm.elm;
    var oldToken = context.hostToken;
    var newToken = html.hostToken; // Remove the token currently applied to the host element if different than the one associated
    // with the current template

    if (!isUndefined(oldToken)) {
      removeAttribute$2.call(elm, oldToken);
    } // If the template has a token apply the token to the host element


    if (!isUndefined(newToken)) {
      setAttribute$2.call(elm, newToken, '');
    }

    context.hostToken = html.hostToken;
    context.shadowToken = html.shadowToken;
  }

  function evaluateTemplate(vm, html) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.isTrue(isFunction(html), "evaluateTemplate() second argument must be a function instead of ".concat(html));
    } // TODO: add identity to the html functions


    var component = vm.component,
        context = vm.context,
        cmpSlots = vm.cmpSlots,
        cmpTemplate = vm.cmpTemplate; // reset the cache memoizer for template when needed

    if (html !== cmpTemplate) {
      if (!isUndefined(cmpTemplate)) {
        resetShadowRoot(vm);
      }

      vm.cmpTemplate = html; // Populate context with template information

      context.tplCache = create(null); // TODO: tokens are only needed in fallback mode

      applyTokenToHost(vm, html);

      if (process.env.NODE_ENV !== 'production') {
        // one time operation for any new template returned by render()
        // so we can warn if the template is attempting to use a binding
        // that is not provided by the component instance.
        validateFields(vm, html);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isObject(context.tplCache), "vm.context.tplCache must be an object associated to ".concat(cmpTemplate, ".")); // validating slots in every rendering since the allocated content might change over time

      validateSlots(vm, html);
    }

    var vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isArray(vnodes), "Compiler should produce html functions that always return an array.");
    }

    return vnodes;
  } // Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
  // JSDom (used in Jest) for example doesn't implement the UserTiming APIs


  var isUserTimingSupported = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';

  function getMarkName(vm, phase) {
    return "<".concat(vm.def.name, " (").concat(vm.uid, ")> - ").concat(phase);
  }

  function startMeasure(vm, phase) {
    if (!isUserTimingSupported) {
      return;
    }

    var name = getMarkName(vm, phase);
    performance.mark(name);
  }

  function endMeasure(vm, phase) {
    if (!isUserTimingSupported) {
      return;
    }

    var name = getMarkName(vm, phase);
    performance.measure(name, name); // Clear the created marks and measure to avoid filling the performance entries buffer.
    // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.

    performance.clearMarks(name);
    performance.clearMeasures(name);
  }

  var isRendering = false;
  var vmBeingRendered = null;
  var vmBeingConstructed = null;

  function isBeingConstructed(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    return vmBeingConstructed === vm;
  }

  function invokeComponentCallback(vm, fn, args) {
    var context = vm.context,
        component = vm.component,
        callHook = vm.callHook;
    var result;
    var error;

    try {
      result = callHook(component, fn, args);
    } catch (e) {
      error = Object(e);
    } finally {
      if (error) {
        error.wcStack = getComponentStack(vm); // rethrowing the original error annotated after restoring the context

        throw error; // tslint:disable-line
      }
    }

    return result;
  }

  function invokeComponentConstructor(vm, Ctor) {
    var vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;

    if (process.env.NODE_ENV !== 'production') {
      startMeasure(vm, 'constructor');
    }

    var error;

    try {
      new Ctor(); // tslint:disable-line
    } catch (e) {
      error = Object(e);
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        endMeasure(vm, 'constructor');
      }

      vmBeingConstructed = vmBeingConstructedInception;

      if (error) {
        error.wcStack = getComponentStack(vm); // rethrowing the original error annotated after restoring the context

        throw error; // tslint:disable-line
      }
    }
  }

  function invokeComponentRenderMethod(vm) {
    var render = vm.def.render,
        callHook = vm.callHook;

    if (isUndefined(render)) {
      return [];
    }

    var component = vm.component,
        context = vm.context;
    var isRenderingInception = isRendering;
    var vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    var result;
    var error;

    if (process.env.NODE_ENV !== 'production') {
      startMeasure(vm, 'render');
    }

    try {
      var html = callHook(component, render);

      if (isFunction(html)) {
        result = evaluateTemplate(vm, html);
      } else if (!isUndefined(html)) {
        if (process.env.NODE_ENV !== 'production') {
          assert.fail("The template rendered by ".concat(vm, " must return an imported template tag (e.g.: `import html from \"./mytemplate.html\"`) or undefined, instead, it has returned ").concat(html, "."));
        }
      }
    } catch (e) {
      error = Object(e);
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        endMeasure(vm, 'render');
      }

      isRendering = isRenderingInception;
      vmBeingRendered = vmBeingRenderedInception;

      if (error) {
        error.wcStack = getComponentStack(vm); // rethrowing the original error annotated after restoring the context

        throw error; // tslint:disable-line
      }
    }

    return result || [];
  }

  function invokeEventListener(vm, fn, thisValue, event) {
    var context = vm.context,
        callHook = vm.callHook;
    var error;

    try {
      callHook(thisValue, fn, [event]);
    } catch (e) {
      error = Object(e);
    } finally {
      if (error) {
        error.wcStack = getComponentStack(vm); // rethrowing the original error annotated after restoring the context

        throw error; // tslint:disable-line
      }
    }
  }

  var Services = create(null);

  function invokeServiceHook(vm, cbs) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.isTrue(isArray(cbs) && cbs.length > 0, "Optimize invokeServiceHook() to be invoked only when needed");
    }

    var component = vm.component,
        data = vm.data,
        def = vm.def,
        context = vm.context;

    for (var _i14 = 0, len = cbs.length; _i14 < len; ++_i14) {
      cbs[_i14].call(undefined, component, data, def, context);
    }
  }

  function createComponent(vm, Ctor) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    } // create the component instance


    invokeComponentConstructor(vm, Ctor);

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isObject(vm.component), "Invalid construction for ".concat(vm, ", maybe you are missing the call to super() on classes extending Element."));
    }
  }

  function linkComponent(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    } // wiring service


    var wire = vm.def.wire;

    if (wire) {
      var wiring = Services.wiring;

      if (wiring) {
        invokeServiceHook(vm, wiring);
      }
    }
  }

  function clearReactiveListeners(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var deps = vm.deps;
    var len = deps.length;

    if (len) {
      for (var _i15 = 0; _i15 < len; _i15 += 1) {
        var set = deps[_i15];
        var pos = ArrayIndexOf.call(deps[_i15], vm);

        if (process.env.NODE_ENV !== 'production') {
          assert.invariant(pos > -1, "when clearing up deps, the vm must be part of the collection.");
        }

        ArraySplice.call(set, pos, 1);
      }

      deps.length = 0;
    }
  }

  function renderComponent(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.invariant(vm.isDirty, "".concat(vm, " is not dirty."));
    }

    clearReactiveListeners(vm);
    var vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isArray(vnodes), "".concat(vm, ".render() should always return an array of vnodes instead of ").concat(vnodes));
    }

    return vnodes;
  }

  function markComponentAsDirty(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.isFalse(vm.isDirty, "markComponentAsDirty() for ".concat(vm, " should not be called when the component is already dirty."));
      assert.isFalse(isRendering, "markComponentAsDirty() for ".concat(vm, " cannot be called during rendering of ").concat(vmBeingRendered, "."));
    }

    vm.isDirty = true;
  }

  var cmpEventListenerMap = new WeakMap();

  function getWrappedComponentsListener(vm, listener) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    if (!isFunction(listener)) {
      throw new TypeError(); // avoiding problems with non-valid listeners
    }

    var wrappedListener = cmpEventListenerMap.get(listener);

    if (isUndefined(wrappedListener)) {
      wrappedListener = function wrappedListener(event) {
        invokeEventListener(vm, listener, undefined, event);
      };

      cmpEventListenerMap.set(listener, wrappedListener);
    }

    return wrappedListener;
  }

  var TargetToReactiveRecordMap = new WeakMap();

  function notifyMutation(target, key) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(!isRendering, "Mutating property ".concat(toString(key), " of ").concat(toString(target), " is not allowed during the rendering life-cycle of ").concat(vmBeingRendered, "."));
    }

    var reactiveRecord = TargetToReactiveRecordMap.get(target);

    if (!isUndefined(reactiveRecord)) {
      var value = reactiveRecord[key];

      if (value) {
        var len = value.length;

        for (var _i16 = 0; _i16 < len; _i16 += 1) {
          var vm = value[_i16];

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
          }

          if (!vm.isDirty) {
            markComponentAsDirty(vm);
            scheduleRehydration(vm);
          }
        }
      }
    }
  }

  function observeMutation(target, key) {
    if (isNull(vmBeingRendered)) {
      return; // nothing to subscribe to
    }

    var vm = vmBeingRendered;
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
    } else if (value[0] === vm) {
      return; // perf optimization considering that most subscriptions will come from the same vm
    }

    if (ArrayIndexOf.call(value, vm) === -1) {
      ArrayPush.call(value, vm); // we keep track of the sets that vm is listening from to be able to do some clean up later on

      ArrayPush.call(vm.deps, value);
    }
  }
  /**
   * Copyright (C) 2017 salesforce.com, inc.
   */


  var isArray$1 = Array.isArray;
  var getPrototypeOf$1 = Object.getPrototypeOf,
      ObjectCreate = Object.create,
      ObjectDefineProperty = Object.defineProperty,
      ObjectDefineProperties = Object.defineProperties,
      isExtensible$1 = Object.isExtensible,
      getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor,
      getOwnPropertyNames$1 = Object.getOwnPropertyNames,
      getOwnPropertySymbols$1 = Object.getOwnPropertySymbols,
      preventExtensions$1 = Object.preventExtensions;
  var _Array$prototype2 = Array.prototype,
      ArrayPush$1 = _Array$prototype2.push,
      ArrayConcat$1 = _Array$prototype2.concat;
  var ObjectDotPrototype = Object.prototype;
  var OtS$1 = {}.toString;

  function toString$1(obj) {
    if (obj && obj.toString) {
      return obj.toString();
    } else if (_typeof(obj) === 'object') {
      return OtS$1.call(obj);
    } else {
      return obj + '';
    }
  }

  function isUndefined$1(obj) {
    return obj === undefined;
  }

  var TargetSlot$1 = Symbol(); // TODO: we are using a funky and leaky abstraction here to try to identify if
  // the proxy is a compat proxy, and define the unwrap method accordingly.
  // @ts-ignore

  var getKey$1 = Proxy.getKey;
  var unwrap$1 = getKey$1 ? function (replicaOrAny) {
    return replicaOrAny && getKey$1(replicaOrAny, TargetSlot$1) || replicaOrAny;
  } : function (replicaOrAny) {
    return replicaOrAny && replicaOrAny[TargetSlot$1] || replicaOrAny;
  };

  function isObservable(value) {
    // intentionally checking for null and undefined
    if (value == null) {
      return false;
    }

    if (isArray$1(value)) {
      return true;
    }

    var proto = getPrototypeOf$1(value);
    return proto === ObjectDotPrototype || proto === null || getPrototypeOf$1(proto) === null;
  }

  function isObject$1(obj) {
    return _typeof(obj) === 'object';
  } // Unwrap property descriptors
  // We only need to unwrap if value is specified


  function unwrapDescriptor(descriptor) {
    if ('value' in descriptor) {
      descriptor.value = unwrap$1(descriptor.value);
    }

    return descriptor;
  }

  function wrapDescriptor(membrane, descriptor) {
    if ('value' in descriptor) {
      descriptor.value = isObservable(descriptor.value) ? membrane.getProxy(descriptor.value) : descriptor.value;
    }

    return descriptor;
  }

  function lockShadowTarget(membrane, shadowTarget, originalTarget) {
    var targetKeys = ArrayConcat$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
    targetKeys.forEach(function (key) {
      var descriptor = getOwnPropertyDescriptor$1(originalTarget, key); // We do not need to wrap the descriptor if not configurable
      // Because we can deal with wrapping it when user goes through
      // Get own property descriptor. There is also a chance that this descriptor
      // could change sometime in the future, so we can defer wrapping
      // until we need to

      if (!descriptor.configurable) {
        descriptor = wrapDescriptor(membrane, descriptor);
      }

      ObjectDefineProperty(shadowTarget, key, descriptor);
    });
    preventExtensions$1(shadowTarget);
  }

  var ReactiveProxyHandler =
  /*#__PURE__*/
  function () {
    function ReactiveProxyHandler(membrane, value, options) {
      _classCallCheck(this, ReactiveProxyHandler);

      this.originalTarget = value;
      this.membrane = membrane;

      if (!isUndefined$1(options)) {
        this.valueMutated = options.valueMutated;
        this.valueObserved = options.valueObserved;
      }
    }

    _createClass(ReactiveProxyHandler, [{
      key: "get",
      value: function get(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            membrane = this.membrane;

        if (key === TargetSlot$1) {
          return originalTarget;
        }

        var value = originalTarget[key];
        var valueObserved = this.valueObserved;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return membrane.getProxy(value);
      }
    }, {
      key: "set",
      value: function set(shadowTarget, key, value) {
        var originalTarget = this.originalTarget,
            valueMutated = this.valueMutated;
        var oldValue = originalTarget[key];

        if (oldValue !== value) {
          originalTarget[key] = value;

          if (!isUndefined$1(valueMutated)) {
            valueMutated(originalTarget, key);
          }
        } else if (key === 'length' && isArray$1(originalTarget)) {
          // fix for issue #236: push will add the new index, and by the time length
          // is updated, the internal length is already equal to the new length value
          // therefore, the oldValue is equal to the value. This is the forking logic
          // to support this use case.
          if (!isUndefined$1(valueMutated)) {
            valueMutated(originalTarget, key);
          }
        }

        return true;
      }
    }, {
      key: "deleteProperty",
      value: function deleteProperty(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            valueMutated = this.valueMutated;
        delete originalTarget[key];

        if (!isUndefined$1(valueMutated)) {
          valueMutated(originalTarget, key);
        }

        return true;
      }
    }, {
      key: "apply",
      value: function apply(shadowTarget, thisArg, argArray) {
        /* No op */
      }
    }, {
      key: "construct",
      value: function construct(target, argArray, newTarget) {
        /* No op */
      }
    }, {
      key: "has",
      value: function has(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            valueObserved = this.valueObserved;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return key in originalTarget;
      }
    }, {
      key: "ownKeys",
      value: function ownKeys(shadowTarget) {
        var originalTarget = this.originalTarget;
        return ArrayConcat$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
      }
    }, {
      key: "isExtensible",
      value: function isExtensible(shadowTarget) {
        var shadowIsExtensible = isExtensible$1(shadowTarget);

        if (!shadowIsExtensible) {
          return shadowIsExtensible;
        }

        var originalTarget = this.originalTarget,
            membrane = this.membrane;
        var targetIsExtensible = isExtensible$1(originalTarget);

        if (!targetIsExtensible) {
          lockShadowTarget(membrane, shadowTarget, originalTarget);
        }

        return targetIsExtensible;
      }
    }, {
      key: "setPrototypeOf",
      value: function setPrototypeOf(shadowTarget, prototype) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error("Invalid setPrototypeOf invocation for reactive proxy ".concat(toString$1(this.originalTarget), ". Prototype of reactive objects cannot be changed."));
        }
      }
    }, {
      key: "getPrototypeOf",
      value: function getPrototypeOf(shadowTarget) {
        var originalTarget = this.originalTarget;
        return getPrototypeOf$1(originalTarget);
      }
    }, {
      key: "getOwnPropertyDescriptor",
      value: function getOwnPropertyDescriptor(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            membrane = this.membrane,
            valueObserved = this.valueObserved; // keys looked up via hasOwnProperty need to be reactive

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        var desc = getOwnPropertyDescriptor$1(originalTarget, key);

        if (isUndefined$1(desc)) {
          return desc;
        }

        var shadowDescriptor = getOwnPropertyDescriptor$1(shadowTarget, key);

        if (!desc.configurable && !shadowDescriptor) {
          // If descriptor from original target is not configurable,
          // We must copy the wrapped descriptor over to the shadow target.
          // Otherwise, proxy will throw an invariant error.
          // This is our last chance to lock the value.
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
          desc = wrapDescriptor(membrane, desc);
          ObjectDefineProperty(shadowTarget, key, desc);
        }

        return shadowDescriptor || desc;
      }
    }, {
      key: "preventExtensions",
      value: function preventExtensions(shadowTarget) {
        var originalTarget = this.originalTarget,
            membrane = this.membrane;
        lockShadowTarget(membrane, shadowTarget, originalTarget);
        preventExtensions$1(originalTarget);
        return true;
      }
    }, {
      key: "defineProperty",
      value: function defineProperty(shadowTarget, key, descriptor) {
        var originalTarget = this.originalTarget,
            membrane = this.membrane,
            valueMutated = this.valueMutated;
        var configurable = descriptor.configurable; // We have to check for value in descriptor
        // because Object.freeze(proxy) calls this method
        // with only { configurable: false, writeable: false }
        // Additionally, method will only be called with writeable:false
        // if the descriptor has a value, as opposed to getter/setter
        // So we can just check if writable is present and then see if
        // value is present. This eliminates getter and setter descriptors

        if ('writable' in descriptor && !('value' in descriptor)) {
          var originalDescriptor = getOwnPropertyDescriptor$1(originalTarget, key);
          descriptor.value = originalDescriptor.value;
        }

        ObjectDefineProperty(originalTarget, key, unwrapDescriptor(descriptor));

        if (configurable === false) {
          ObjectDefineProperty(shadowTarget, key, wrapDescriptor(membrane, descriptor));
        }

        if (!isUndefined$1(valueMutated)) {
          valueMutated(originalTarget, key);
        }

        return true;
      }
    }]);

    return ReactiveProxyHandler;
  }();

  function wrapDescriptor$1(membrane, descriptor) {
    if ('value' in descriptor) {
      descriptor.value = isObservable(descriptor.value) ? membrane.getReadOnlyProxy(descriptor.value) : descriptor.value;
    }

    return descriptor;
  }

  var ReadOnlyHandler =
  /*#__PURE__*/
  function () {
    function ReadOnlyHandler(membrane, value, options) {
      _classCallCheck(this, ReadOnlyHandler);

      this.originalTarget = value;
      this.membrane = membrane;

      if (!isUndefined$1(options)) {
        this.valueObserved = options.valueObserved;
      }
    }

    _createClass(ReadOnlyHandler, [{
      key: "get",
      value: function get(shadowTarget, key) {
        var membrane = this.membrane,
            originalTarget = this.originalTarget;

        if (key === TargetSlot$1) {
          return originalTarget;
        }

        var value = originalTarget[key];
        var valueObserved = this.valueObserved;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return membrane.getReadOnlyProxy(value);
      }
    }, {
      key: "set",
      value: function set(shadowTarget, key, value) {
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot set \"".concat(key.toString(), "\" on \"").concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only."));
        }

        return false;
      }
    }, {
      key: "deleteProperty",
      value: function deleteProperty(shadowTarget, key) {
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot delete \"".concat(key.toString(), "\" on \"").concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only."));
        }

        return false;
      }
    }, {
      key: "apply",
      value: function apply(shadowTarget, thisArg, argArray) {
        /* No op */
      }
    }, {
      key: "construct",
      value: function construct(target, argArray, newTarget) {
        /* No op */
      }
    }, {
      key: "has",
      value: function has(shadowTarget, key) {
        var originalTarget = this.originalTarget;
        var valueObserved = this.valueObserved;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return key in originalTarget;
      }
    }, {
      key: "ownKeys",
      value: function ownKeys(shadowTarget) {
        var originalTarget = this.originalTarget;
        return ArrayConcat$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
      }
    }, {
      key: "setPrototypeOf",
      value: function setPrototypeOf(shadowTarget, prototype) {
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid prototype mutation: Cannot set prototype on \"".concat(originalTarget, "\". \"").concat(originalTarget, "\" prototype is read-only."));
        }
      }
    }, {
      key: "getOwnPropertyDescriptor",
      value: function getOwnPropertyDescriptor(shadowTarget, key) {
        var originalTarget = this.originalTarget,
            membrane = this.membrane,
            valueObserved = this.valueObserved; // keys looked up via hasOwnProperty need to be reactive

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        var desc = getOwnPropertyDescriptor$1(originalTarget, key);

        if (isUndefined$1(desc)) {
          return desc;
        }

        var shadowDescriptor = getOwnPropertyDescriptor$1(shadowTarget, key);

        if (!desc.configurable && !shadowDescriptor) {
          // If descriptor from original target is not configurable,
          // We must copy the wrapped descriptor over to the shadow target.
          // Otherwise, proxy will throw an invariant error.
          // This is our last chance to lock the value.
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
          desc = wrapDescriptor$1(membrane, desc);
          ObjectDefineProperty(shadowTarget, key, desc);
        }

        return shadowDescriptor || desc;
      }
    }, {
      key: "preventExtensions",
      value: function preventExtensions(shadowTarget) {
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot preventExtensions on ".concat(originalTarget, "\". \"").concat(originalTarget, " is read-only."));
        }

        return false;
      }
    }, {
      key: "defineProperty",
      value: function defineProperty(shadowTarget, key, descriptor) {
        if (process.env.NODE_ENV !== 'production') {
          var originalTarget = this.originalTarget;
          throw new Error("Invalid mutation: Cannot defineProperty \"".concat(key.toString(), "\" on \"").concat(originalTarget, "\". \"").concat(originalTarget, "\" is read-only."));
        }

        return false;
      }
    }]);

    return ReadOnlyHandler;
  }();

  function getTarget(item) {
    return item && item[TargetSlot$1];
  }

  function extract(objectOrArray) {
    if (isArray$1(objectOrArray)) {
      return objectOrArray.map(function (item) {
        var original = getTarget(item);

        if (original) {
          return extract(original);
        }

        return item;
      });
    }

    var obj = ObjectCreate(getPrototypeOf$1(objectOrArray));
    var names = getOwnPropertyNames$1(objectOrArray);
    return ArrayConcat$1.call(names, getOwnPropertySymbols$1(objectOrArray)).reduce(function (seed, key) {
      var item = objectOrArray[key];
      var original = getTarget(item);

      if (original) {
        seed[key] = extract(original);
      } else {
        seed[key] = item;
      }

      return seed;
    }, obj);
  }

  var formatter = {
    header: function header(plainOrProxy) {
      var originalTarget = plainOrProxy[TargetSlot$1];

      if (!originalTarget) {
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
  };

  function init() {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    } // Custom Formatter for Dev Tools
    // To enable this, open Chrome Dev Tools
    // Go to Settings,
    // Under console, select "Enable custom formatters"
    // For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview


    var devWindow = window;
    var devtoolsFormatters = devWindow.devtoolsFormatters || [];
    ArrayPush$1.call(devtoolsFormatters, formatter);
    devWindow.devtoolsFormatters = devtoolsFormatters;
  }

  if (process.env.NODE_ENV !== 'production') {
    init();
  }

  function createShadowTarget(value) {
    var shadowTarget = undefined;

    if (isArray$1(value)) {
      shadowTarget = [];
    } else if (isObject$1(value)) {
      shadowTarget = {};
    }

    return shadowTarget;
  }

  var ReactiveMembrane =
  /*#__PURE__*/
  function () {
    function ReactiveMembrane(options) {
      _classCallCheck(this, ReactiveMembrane);

      this.objectGraph = new WeakMap();

      if (!isUndefined$1(options)) {
        this.valueDistortion = options.valueDistortion;
        this.valueMutated = options.valueMutated;
        this.valueObserved = options.valueObserved;
      }
    }

    _createClass(ReactiveMembrane, [{
      key: "getProxy",
      value: function getProxy(value) {
        var valueDistortion = this.valueDistortion;
        var distorted = isUndefined$1(valueDistortion) ? value : valueDistortion(value);

        if (isObservable(distorted)) {
          var o = this.getReactiveState(distorted); // when trying to extract the writable version of a readonly
          // we return the readonly.

          return o.readOnly === value ? value : o.reactive;
        }

        return distorted;
      }
    }, {
      key: "getReadOnlyProxy",
      value: function getReadOnlyProxy(value) {
        var valueDistortion = this.valueDistortion;
        var distorted = isUndefined$1(valueDistortion) ? value : valueDistortion(value);

        if (isObservable(distorted)) {
          return this.getReactiveState(distorted).readOnly;
        }

        return distorted;
      }
    }, {
      key: "unwrapProxy",
      value: function unwrapProxy(p) {
        return unwrap$1(p);
      }
    }, {
      key: "getReactiveState",
      value: function getReactiveState(value) {
        var membrane = this;
        var objectGraph = membrane.objectGraph,
            valueMutated = membrane.valueMutated,
            valueObserved = membrane.valueObserved;
        value = unwrap$1(value);
        var reactiveState = objectGraph.get(value);

        if (reactiveState) {
          return reactiveState;
        }

        reactiveState = ObjectDefineProperties(ObjectCreate(null), {
          reactive: {
            get: function get() {
              var reactiveHandler = new ReactiveProxyHandler(membrane, value, {
                valueMutated: valueMutated,
                valueObserved: valueObserved
              }); // caching the reactive proxy after the first time it is accessed

              var proxy = new Proxy(createShadowTarget(value), reactiveHandler);
              ObjectDefineProperty(this, 'reactive', {
                value: proxy
              });
              return proxy;
            },
            configurable: true
          },
          readOnly: {
            get: function get() {
              var readOnlyHandler = new ReadOnlyHandler(membrane, value, {
                valueObserved: valueObserved
              }); // caching the readOnly proxy after the first time it is accessed

              var proxy = new Proxy(createShadowTarget(value), readOnlyHandler);
              ObjectDefineProperty(this, 'readOnly', {
                value: proxy
              });
              return proxy;
            },
            configurable: true
          }
        });
        objectGraph.set(value, reactiveState);
        return reactiveState;
      }
    }]);

    return ReactiveMembrane;
  }();
  /** version: 0.25.0 */


  function valueDistortion(value) {
    if (process.env.NODE_ENV !== 'production') {
      // For now, if we determine that value is a traverse membrane we want to
      // throw a big error.
      if (unwrap(value) !== value) {
        throw new ReferenceError("Invalid attempt to get access to a traverse membrane ".concat(toString(value), " via a reactive membrane."));
      }
    }

    return value;
  }

  var reactiveMembrane = new ReactiveMembrane({
    valueObserved: observeMutation,
    valueMutated: notifyMutation,
    valueDistortion: valueDistortion
  }); // TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129

  function track(target, prop, descriptor) {
    if (arguments.length === 1) {
      return reactiveMembrane.getProxy(target);
    }

    if (process.env.NODE_ENV !== 'production') {
      if (arguments.length !== 3) {
        assert.fail("@track decorator can only be used with one argument to return a trackable object, or as a decorator function.");
      }

      if (!isUndefined(descriptor)) {
        var get = descriptor.get,
            set = descriptor.set,
            configurable = descriptor.configurable,
            writable = descriptor.writable;
        assert.isTrue(!get && !set, "Compiler Error: A @track decorator can only be applied to a public field.");
        assert.isTrue(configurable !== false, "Compiler Error: A @track decorator can only be applied to a configurable property.");
        assert.isTrue(writable !== false, "Compiler Error: A @track decorator can only be applied to a writable property.");
      }
    }

    return createTrackedPropertyDescriptor(target, prop, isUndefined(descriptor) ? true : descriptor.enumerable === true);
  }

  function createTrackedPropertyDescriptor(Ctor, key, enumerable) {
    return {
      get: function get() {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        }

        observeMutation(this, key);
        return vm.cmpTrack[key];
      },
      set: function set(newValue) {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
          assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(vm, ".").concat(key));
        }

        var reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);

        if (reactiveOrAnyValue !== vm.cmpTrack[key]) {
          if (process.env.NODE_ENV !== 'production') {
            // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
            // Then newValue if newValue is observable (plain object or array)
            var _isObservable = reactiveOrAnyValue !== newValue;

            if (!_isObservable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
              assert.logWarning("Property \"".concat(toString(key), "\" of ").concat(vm, " is set to a non-trackable object, which means changes into that object cannot be observed."));
            }
          }

          vm.cmpTrack[key] = reactiveOrAnyValue;

          if (vm.idx > 0) {
            // perf optimization to skip this step if not in the DOM
            notifyMutation(this, key);
          }
        }
      },
      enumerable: enumerable,
      configurable: true
    };
  }

  function wireDecorator(target, prop, descriptor) {
    if (process.env.NODE_ENV !== 'production') {
      if (!isUndefined(descriptor)) {
        var get = descriptor.get,
            set = descriptor.set,
            configurable = descriptor.configurable,
            writable = descriptor.writable;
        assert.isTrue(!get && !set, "Compiler Error: A @wire decorator can only be applied to a public field.");
        assert.isTrue(configurable !== false, "Compiler Error: A @wire decorator can only be applied to a configurable property.");
        assert.isTrue(writable !== false, "Compiler Error: A @wire decorator can only be applied to a writable property.");
      }
    } // TODO: eventually this decorator should have its own logic


    return createTrackedPropertyDescriptor(target, prop, isObject(descriptor) ? descriptor.enumerable === true : true);
  } // @wire is a factory that when invoked, returns the wire decorator


  function wire(adapter, config) {
    var len = arguments.length;

    if (len > 0 && len < 3) {
      return wireDecorator;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        assert.fail("@wire(adapter, config?) may only be used as a decorator.");
      }

      throw new TypeError();
    }
  }

  var COMPUTED_GETTER_MASK = 1;
  var COMPUTED_SETTER_MASK = 2;

  function api$1(target, propName, descriptor) {
    if (process.env.NODE_ENV !== 'production') {
      if (arguments.length !== 3) {
        assert.fail("@api decorator can only be used as a decorator function.");
      }
    }

    var meta = target.publicProps; // publicProps must be an own property, otherwise the meta is inherited.

    var config = !isUndefined(meta) && hasOwnProperty.call(target, 'publicProps') && hasOwnProperty.call(meta, propName) ? meta[propName].config : 0; // initializing getters and setters for each public prop on the target prototype

    if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!descriptor || isFunction(descriptor.get) || isFunction(descriptor.set), "Invalid property ".concat(toString(propName), " definition in ").concat(target, ", it cannot be a prototype definition if it is a public property. Instead use the constructor to define it."));
        var mustHaveGetter = COMPUTED_GETTER_MASK & config;
        var mustHaveSetter = COMPUTED_SETTER_MASK & config;

        if (mustHaveGetter) {
          assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), "Missing getter for property ".concat(toString(propName), " decorated with @api in ").concat(target));
        }

        if (mustHaveSetter) {
          assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), "Missing setter for property ".concat(toString(propName), " decorated with @api in ").concat(target));
          assert.isTrue(mustHaveGetter, "Missing getter for property ".concat(toString(propName), " decorated with @api in ").concat(target, ". You cannot have a setter without the corresponding getter."));
        }
      } // if it is configured as an accessor it must have a descriptor


      return createPublicAccessorDescriptor(target, propName, descriptor);
    } else {
      return createPublicPropertyDescriptor(target, propName, descriptor);
    }
  }

  var vmBeingUpdated = null;

  function prepareForPropUpdate(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    vmBeingUpdated = vm;
  }

  function createPublicPropertyDescriptor(proto, key, descriptor) {
    return {
      get: function get() {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        }

        if (isBeingConstructed(vm)) {
          if (process.env.NODE_ENV !== 'production') {
            assert.logError("".concat(vm, " constructor should not read the value of property \"").concat(toString(key), "\". The owner component has not yet set the value. Instead use the constructor to set default values for properties."));
          }

          return;
        }

        observeMutation(this, key);
        return vm.cmpProps[key];
      },
      set: function set(newValue) {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
          assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(vm, ".").concat(toString(key)));
        }

        if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
          vmBeingUpdated = vm;

          if (process.env.NODE_ENV !== 'production') {
            // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
            // Then newValue if newValue is observable (plain object or array)
            var _isObservable2 = reactiveMembrane.getProxy(newValue) !== newValue;

            if (!_isObservable2 && !isNull(newValue) && isObject(newValue)) {
              assert.logWarning("Assigning a non-reactive value ".concat(newValue, " to member property ").concat(toString(key), " of ").concat(vm, " is not common because mutations on that value cannot be observed."));
            }
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          if (vmBeingUpdated !== vm) {
            // logic for setting new properties of the element directly from the DOM
            // is only recommended for root elements created via createElement()
            assert.logWarning("If property ".concat(toString(key), " decorated with @api in ").concat(vm, " is used in the template, the value ").concat(toString(newValue), " set manually may be overridden by the template, consider binding the property only in the template."));
          }
        }

        vmBeingUpdated = null; // releasing the lock
        // not need to wrap or check the value since that is happening somewhere else

        vm.cmpProps[key] = reactiveMembrane.getReadOnlyProxy(newValue); // avoid notification of observability while constructing the instance

        if (vm.idx > 0) {
          // perf optimization to skip this step if not in the DOM
          notifyMutation(this, key);
        }
      },
      enumerable: isUndefined(descriptor) ? true : descriptor.enumerable
    };
  }

  function createPublicAccessorDescriptor(Ctor, key, descriptor) {
    var _get = descriptor.get,
        _set = descriptor.set,
        enumerable = descriptor.enumerable;

    if (!isFunction(_get)) {
      if (process.env.NODE_ENV !== 'production') {
        assert.fail("Invalid attempt to create public property descriptor ".concat(toString(key), " in ").concat(Ctor, ". It is missing the getter declaration with @api get ").concat(toString(key), "() {} syntax."));
      }

      throw new TypeError();
    }

    return {
      get: function get() {
        if (process.env.NODE_ENV !== 'production') {
          var vm = getComponentVM(this);
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        }

        return _get.call(this);
      },
      set: function set(newValue) {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
          assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(vm, ".").concat(toString(key)));
        }

        if (vm.isRoot || isBeingConstructed(vm)) {
          vmBeingUpdated = vm;

          if (process.env.NODE_ENV !== 'production') {
            // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
            // Then newValue if newValue is observable (plain object or array)
            var _isObservable3 = reactiveMembrane.getProxy(newValue) !== newValue;

            if (!_isObservable3 && !isNull(newValue) && isObject(newValue)) {
              assert.logWarning("Assigning a non-reactive value ".concat(newValue, " to member property ").concat(toString(key), " of ").concat(vm, " is not common because mutations on that value cannot be observed."));
            }
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          if (vmBeingUpdated !== vm) {
            // logic for setting new properties of the element directly from the DOM
            // is only recommended for root elements created via createElement()
            assert.logWarning("If property ".concat(toString(key), " decorated with @api in ").concat(vm, " is used in the template, the value ").concat(toString(newValue), " set manually may be overridden by the template, consider binding the property only in the template."));
          }
        }

        vmBeingUpdated = null; // releasing the lock
        // not need to wrap or check the value since that is happening somewhere else

        if (_set) {
          _set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
        } else if (process.env.NODE_ENV !== 'production') {
          assert.fail("Invalid attempt to set a new value for property ".concat(toString(key), " of ").concat(vm, " that does not has a setter decorated with @api."));
        }
      },
      enumerable: enumerable
    };
  }

  function getNodeRestrictionsDescriptors(node) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var originalChildNodesDescriptor = getPropertyDescriptor(node, 'childNodes');
    return {
      childNodes: {
        get: function get() {
          assert.logWarning("Discouraged access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll' which returns a static NodeList.");
          return originalChildNodesDescriptor.get.call(this);
        },
        enumerable: true,
        configurable: true
      }
    };
  }

  function getShadowRootRestrictionsDescriptors(sr) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    } // blacklisting properties in dev mode only to avoid people doing the wrong
    // thing when using the real shadow root, because if that's the case,
    // the component will not work when running in fallback mode.


    var originalQuerySelector = sr.querySelector;
    var originalQuerySelectorAll = sr.querySelectorAll;
    var originalAddEventListener = sr.addEventListener;
    var descriptors = getNodeRestrictionsDescriptors(sr);
    assign(descriptors, {
      addEventListener: {
        value: function value(type) {
          assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(toString(sr), " by adding an event listener for \"").concat(type, "\"."));
          return originalAddEventListener.apply(this, arguments);
        }
      },
      querySelector: {
        value: function value() {
          var vm = getShadowRootVM(this);
          assert.isFalse(isBeingConstructed(vm), "this.template.querySelector() cannot be called during the construction of the custom element for ".concat(vm, " because no content has been rendered yet."));
          return originalQuerySelector.apply(this, arguments);
        }
      },
      querySelectorAll: {
        value: function value() {
          var vm = getShadowRootVM(this);
          assert.isFalse(isBeingConstructed(vm), "this.template.querySelectorAll() cannot be called during the construction of the custom element for ".concat(vm, " because no content has been rendered yet."));
          return originalQuerySelectorAll.apply(this, arguments);
        }
      },
      host: {
        get: function get() {
          throw new Error("Disallowed property \"host\" in ShadowRoot.");
        }
      },
      ownerDocument: {
        get: function get() {
          throw new Error("Disallowed property \"ownerDocument\" in ShadowRoot.");
        }
      },
      mode: {
        // from within, the shadow root is always seen as closed
        value: 'closed',
        enumerable: true,
        configurable: true
      }
    });
    var BlackListedShadowRootMethods = {
      appendChild: 0,
      removeChild: 0,
      replaceChild: 0,
      cloneNode: 0,
      insertBefore: 0,
      getElementById: 0,
      getSelection: 0,
      elementFromPoint: 0,
      elementsFromPoint: 0
    };
    forEach.call(getOwnPropertyNames(BlackListedShadowRootMethods), function (methodName) {
      var descriptor = {
        get: function get() {
          throw new Error("Disallowed method \"".concat(methodName, "\" in ShadowRoot."));
        }
      };
      descriptors[methodName] = descriptor;
    });
    return descriptors;
  } // Custom Elements Restrictions:
  // -----------------------------


  function getAttributePatched(attrName) {
    if (process.env.NODE_ENV !== 'production') {
      var vm = getCustomElementVM(this);
      assertAttributeReflectionCapability(vm, attrName);
    }

    return getAttribute$2.apply(this, ArraySlice.call(arguments));
  }

  function setAttributePatched(attrName, newValue) {
    var vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
      assertAttributeMutationCapability(vm, attrName);
      assertAttributeReflectionCapability(vm, attrName);
    }

    setAttribute$2.apply(this, ArraySlice.call(arguments));
  }

  function setAttributeNSPatched(attrNameSpace, attrName, newValue) {
    var vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
      assertAttributeMutationCapability(vm, attrName);
      assertAttributeReflectionCapability(vm, attrName);
    }

    setAttributeNS$1.apply(this, ArraySlice.call(arguments));
  }

  function removeAttributePatched(attrName) {
    var vm = getCustomElementVM(this); // marking the set is needed for the AOM polyfill

    if (process.env.NODE_ENV !== 'production') {
      assertAttributeMutationCapability(vm, attrName);
      assertAttributeReflectionCapability(vm, attrName);
    }

    removeAttribute$2.apply(this, ArraySlice.call(arguments));
  }

  function removeAttributeNSPatched(attrNameSpace, attrName) {
    var vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
      assertAttributeMutationCapability(vm, attrName);
      assertAttributeReflectionCapability(vm, attrName);
    }

    removeAttributeNS$1.apply(this, ArraySlice.call(arguments));
  }

  function assertAttributeReflectionCapability(vm, attrName) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var propName = isString(attrName) ? getPropNameFromAttrName(StringToLowerCase.call(attrName)) : null;
    var elm = vm.elm,
        propsConfig = vm.def.props;

    if (!isUndefined(getNodeOwnerKey$1(elm)) && isAttributeLocked(elm, attrName) && propsConfig && propName && propsConfig[propName]) {
      assert.logError("Invalid attribute \"".concat(StringToLowerCase.call(attrName), "\" for ").concat(vm, ". Instead access the public property with `element.").concat(propName, ";`."));
    }
  }

  function assertAttributeMutationCapability(vm, attrName) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var elm = vm.elm;

    if (!isUndefined(getNodeOwnerKey$1(elm)) && isAttributeLocked(elm, attrName)) {
      assert.logError("Invalid operation on Element ".concat(vm, ". Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute \"").concat(attrName, "\", you can update the state of the component, and let the engine to rehydrate the element accordingly."));
    }
  }

  var controlledElement = null;
  var controlledAttributeName;

  function isAttributeLocked(elm, attrName) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    return elm !== controlledElement || attrName !== controlledAttributeName;
  }

  function lockAttribute(elm, key) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    controlledElement = null;
    controlledAttributeName = undefined;
  }

  function unlockAttribute(elm, key) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    controlledElement = elm;
    controlledAttributeName = key;
  }

  function getCustomElementRestrictionsDescriptors(elm) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var descriptors = getNodeRestrictionsDescriptors(elm);
    var originalAddEventListener = elm.addEventListener;
    return assign(descriptors, {
      addEventListener: {
        value: function value(type) {
          assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(toString(elm), " by adding an event listener for \"").concat(type, "\"."));
          return originalAddEventListener.apply(this, arguments);
        }
      },
      // replacing mutators and accessors on the element itself to catch any mutation
      getAttribute: {
        value: getAttributePatched,
        configurable: true
      },
      setAttribute: {
        value: setAttributePatched,
        configurable: true
      },
      setAttributeNS: {
        value: setAttributeNSPatched,
        configurable: true
      },
      removeAttribute: {
        value: removeAttributePatched,
        configurable: true
      },
      removeAttributeNS: {
        value: removeAttributeNSPatched,
        configurable: true
      }
    });
  }

  function getComponentRestrictionsDescriptors(cmp) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var originalSetAttribute = cmp.setAttribute;
    return {
      setAttribute: {
        value: function value(attrName, _value) {
          // logging errors for experimental and special attributes
          if (isString(attrName)) {
            var propName = getPropNameFromAttrName(attrName);
            var info = getGlobalHTMLPropertiesInfo();

            if (info[propName] && info[propName].attribute) {
              var _info$propName = info[propName],
                  error = _info$propName.error,
                  experimental = _info$propName.experimental;

              if (error) {
                assert.logError(error);
              } else if (experimental) {
                assert.logError("Attribute `".concat(attrName, "` is an experimental attribute that is not standardized or supported by all browsers. Property \"").concat(propName, "\" and attribute \"").concat(attrName, "\" are ignored."));
              }
            }
          }

          originalSetAttribute.apply(this, arguments);
        },
        enumerable: true,
        configurable: true,
        writable: true
      }
    };
  }

  function getLightingElementProtypeRestrictionsDescriptors(proto) {
    var info = getGlobalHTMLPropertiesInfo();
    var descriptors = {};
    forEach.call(getOwnPropertyNames(info), function (propName) {
      if (propName in proto) {
        return; // no need to redefine something that we are already exposing
      }

      descriptors[propName] = {
        get: function get() {
          var _info$propName2 = info[propName],
              error = _info$propName2.error,
              attribute = _info$propName2.attribute,
              readOnly = _info$propName2.readOnly,
              experimental = _info$propName2.experimental;
          var msg = [];
          msg.push("Accessing the global HTML property \"".concat(propName, "\" in ").concat(this, " is disabled."));

          if (error) {
            msg.push(error);
          } else {
            if (experimental) {
              msg.push("This is an experimental property that is not standardized or supported by all browsers. Property \"".concat(propName, "\" and attribute \"").concat(attribute, "\" are ignored."));
            }

            if (readOnly) {
              // TODO - need to improve this message
              msg.push("Property is read-only.");
            }

            if (attribute) {
              msg.push("\"Instead access it via the reflective attribute \"".concat(attribute, "\" with one of these techniques:"));
              msg.push("  * Use `this.getAttribute(\"".concat(attribute, "\")` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process."));
              msg.push("  * Declare `static observedAttributes = [\"".concat(attribute, "\"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated."));
            }
          }

          console.log(msg.join('\n')); // tslint:disable-line

          return; // explicit undefined
        },
        // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
        set: function set() {}
      };
    });
    return descriptors;
  }

  function getSlotElementRestrictionsDescriptors(slot) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    return {};
  }

  function patchShadowRootWithRestrictions(sr) {
    // This routine will prevent access to certain properties on a shadow root instance to guarantee
    // that all components will work fine in IE11 and other browsers without shadow dom support
    defineProperties(sr, getShadowRootRestrictionsDescriptors(sr));
  }

  function patchCustomElementWithRestrictions(elm) {
    defineProperties(elm, getCustomElementRestrictionsDescriptors(elm));
  }

  function patchComponentWithRestrictions(cmp) {
    defineProperties(cmp, getComponentRestrictionsDescriptors(cmp));
  }

  function patchLightningElementPrototypeWithRestrictions(proto) {
    defineProperties(proto, getLightingElementProtypeRestrictionsDescriptors(proto));
  }

  function patchSlotElementWithRestrictions(slot) {
    defineProperties(slot, getSlotElementRestrictionsDescriptors(slot));
  }

  var GlobalEvent = Event; // caching global reference to avoid poisoning

  function getHTMLPropDescriptor(propName, descriptor) {
    var _get2 = descriptor.get,
        _set2 = descriptor.set,
        enumerable = descriptor.enumerable,
        configurable = descriptor.configurable;

    if (!isFunction(_get2)) {
      if (process.env.NODE_ENV !== 'production') {
        assert.fail("Detected invalid public property descriptor for HTMLElement.prototype.".concat(propName, " definition. Missing the standard getter."));
      }

      throw new TypeError();
    }

    if (!isFunction(_set2)) {
      if (process.env.NODE_ENV !== 'production') {
        assert.fail("Detected invalid public property descriptor for HTMLElement.prototype.".concat(propName, " definition. Missing the standard setter."));
      }

      throw new TypeError();
    }

    return {
      enumerable: enumerable,
      configurable: configurable,
      get: function get() {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        }

        if (isBeingConstructed(vm)) {
          if (process.env.NODE_ENV !== 'production') {
            assert.logError("".concat(vm, " constructor should not read the value of property \"").concat(propName, "\". The owner component has not yet set the value. Instead use the constructor to set default values for properties."));
          }

          return;
        }

        observeMutation(this, propName);
        return _get2.call(vm.elm);
      },
      set: function set(newValue) {
        var vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
          assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(vm, ".").concat(propName));
          assert.isFalse(isBeingConstructed(vm), "Failed to construct '".concat(this, "': The result must not have attributes."));
          assert.invariant(!isObject(newValue) || isNull(newValue), "Invalid value \"".concat(newValue, "\" for \"").concat(propName, "\" of ").concat(vm, ". Value cannot be an object, must be a primitive value."));
        }

        if (newValue !== vm.cmpProps[propName]) {
          vm.cmpProps[propName] = newValue;

          if (vm.idx > 0) {
            // perf optimization to skip this step if not in the DOM
            notifyMutation(this, propName);
          }
        }

        return _set2.call(vm.elm, newValue);
      }
    };
  }

  function getLinkedElement(cmp) {
    return getComponentVM(cmp).elm;
  }

  var LightningElement = function BaseLightningElement() {
    // This should be as performant as possible, while any initialization should be done lazily
    if (isNull(vmBeingConstructed)) {
      throw new ReferenceError();
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vmBeingConstructed && "cmpRoot" in vmBeingConstructed, "".concat(vmBeingConstructed, " is not a vm."));
      assert.invariant(_instanceof(vmBeingConstructed.elm, HTMLElement), "Component creation requires a DOM element to be associated to ".concat(vmBeingConstructed, "."));
    }

    var vm = vmBeingConstructed;
    var elm = vm.elm,
        def = vm.def,
        cmpRoot = vm.cmpRoot,
        uid = vm.uid;
    var component = this;
    vm.component = component; // interaction hooks
    // We are intentionally hiding this argument from the formal API of LWCElement because
    // we don't want folks to know about it just yet.

    if (arguments.length === 1) {
      var _arguments$ = arguments[0],
          _callHook = _arguments$.callHook,
          _setHook = _arguments$.setHook,
          _getHook = _arguments$.getHook;
      vm.callHook = _callHook;
      vm.setHook = _setHook;
      vm.getHook = _getHook;
    } // linking elm, shadow root and component with the VM


    setInternalField(component, ViewModelReflection, vm);
    setInternalField(elm, ViewModelReflection, vm);
    setInternalField(cmpRoot, ViewModelReflection, vm);
    setNodeKey(elm, uid); // registered custom elements will be patched at the proto level already, not need to patch them here.

    if (isFalse(PatchedFlag in elm)) {
      if (elm.constructor.prototype !== BaseCustomElementProto) {
        // this is slow path for component instances using `is` attribute or `forceTagName`, which
        // are set to be removed in the near future.
        var _descriptors2 = def.descriptors;
        defineProperties(elm, _descriptors2);
      } else {
        var elmProto = def.elmProto;
        setPrototypeOf(elm, elmProto);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      patchCustomElementWithRestrictions(elm);
      patchComponentWithRestrictions(component);
      patchShadowRootWithRestrictions(cmpRoot);
    }
  }; // HTML Element - The Good Parts


  LightningElement.prototype = {
    constructor: LightningElement,
    dispatchEvent: function dispatchEvent(event) {
      var elm = getLinkedElement(this);
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        if (arguments.length === 0) {
          throw new Error("Failed to execute 'dispatchEvent' on ".concat(this, ": 1 argument required, but only 0 present."));
        }

        if (!_instanceof(event, GlobalEvent)) {
          throw new Error("Failed to execute 'dispatchEvent' on ".concat(this, ": parameter 1 is not of type 'Event'."));
        }

        var evtName = event.type,
            composed = event.composed,
            bubbles = event.bubbles;
        assert.isFalse(isBeingConstructed(vm), "this.dispatchEvent() should not be called during the construction of the custom element for ".concat(this, " because no one is listening for the event \"").concat(evtName, "\" just yet."));

        if (bubbles && 'composed' in event && !composed) {
          assert.logWarning("Invalid event \"".concat(evtName, "\" dispatched in element ").concat(this, ". Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component."));
        }

        if (vm.idx === 0) {
          assert.logWarning("Unreachable event \"".concat(evtName, "\" dispatched from disconnected element ").concat(this, ". Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback)."));
        }

        if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
          assert.logWarning("Invalid event type: '".concat(evtName, "' dispatched in element ").concat(this, ". Event name should only contain lowercase alphanumeric characters."));
        }
      }

      return _dispatchEvent.call(elm, event);
    },
    addEventListener: function addEventListener(type, listener, options) {
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        assert.invariant(!isRendering, "".concat(vmBeingRendered, ".render() method has side effects on the state of ").concat(vm, " by adding an event listener for \"").concat(type, "\"."));
        assert.invariant(isFunction(listener), "Invalid second argument for this.template.addEventListener() in ".concat(vm, " for event \"").concat(type, "\". Expected an EventListener but received ").concat(listener, "."));
      }

      var wrappedListener = getWrappedComponentsListener(vm, listener);
      vm.elm.addEventListener(type, wrappedListener, options);
    },
    removeEventListener: function removeEventListener(type, listener, options) {
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      }

      var wrappedListener = getWrappedComponentsListener(vm, listener);
      vm.elm.removeEventListener(type, wrappedListener, options);
    },
    setAttributeNS: function setAttributeNS(ns, attrName, value) {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(getComponentVM(this)), "Failed to construct '".concat(this, "': The result must not have attributes."));
        unlockAttribute(elm, attrName);
      }

      elm.setAttributeNS.apply(elm, arguments);

      if (process.env.NODE_ENV !== 'production') {
        lockAttribute(elm, attrName);
      }
    },
    removeAttributeNS: function removeAttributeNS(ns, attrName) {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        unlockAttribute(elm, attrName);
      }

      elm.removeAttributeNS.apply(elm, arguments);

      if (process.env.NODE_ENV !== 'production') {
        lockAttribute(elm, attrName);
      }
    },
    removeAttribute: function removeAttribute(attrName) {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        unlockAttribute(elm, attrName);
      }

      elm.removeAttribute.apply(elm, arguments);

      if (process.env.NODE_ENV !== 'production') {
        lockAttribute(elm, attrName);
      }
    },
    setAttribute: function setAttribute(attrName, value) {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(getComponentVM(this)), "Failed to construct '".concat(this, "': The result must not have attributes."));
        unlockAttribute(elm, attrName);
      }

      elm.setAttribute.apply(elm, arguments);

      if (process.env.NODE_ENV !== 'production') {
        lockAttribute(elm, attrName);
      }
    },
    getAttribute: function getAttribute(attrName) {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        unlockAttribute(elm, attrName);
      }

      var value = elm.getAttribute.apply(elm, arguments);

      if (process.env.NODE_ENV !== 'production') {
        lockAttribute(elm, attrName);
      }

      return value;
    },
    getAttributeNS: function getAttributeNS(ns, attrName) {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        unlockAttribute(elm, attrName);
      }

      var value = elm.getAttributeNS.apply(elm, arguments);

      if (process.env.NODE_ENV !== 'production') {
        lockAttribute(elm, attrName);
      }

      return value;
    },
    getBoundingClientRect: function getBoundingClientRect() {
      var elm = getLinkedElement(this);

      if (process.env.NODE_ENV !== 'production') {
        var vm = getComponentVM(this);
        assert.isFalse(isBeingConstructed(vm), "this.getBoundingClientRect() should not be called during the construction of the custom element for ".concat(this, " because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks."));
      }

      return elm.getBoundingClientRect();
    },
    querySelector: function querySelector(selector) {
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), "this.querySelector() cannot be called during the construction of the custom element for ".concat(this, " because no children has been added to this element yet."));
      }

      var elm = vm.elm; // fallback to a patched querySelector to respect
      // shadow semantics

      if (isTrue(vm.fallback)) {
        return lightDomQuerySelector(elm, selector);
      } // Delegate to custom element querySelector.


      return elm.querySelector(selector);
    },
    querySelectorAll: function querySelectorAll(selector) {
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), "this.querySelectorAll() cannot be called during the construction of the custom element for ".concat(this, " because no children has been added to this element yet."));
      }

      var elm = vm.elm; // fallback to a patched querySelectorAll to respect
      // shadow semantics

      if (isTrue(vm.fallback)) {
        return lightDomQuerySelectorAll(elm, selector);
      } // Delegate to custom element querySelectorAll.


      return ArraySlice.call(elm.querySelectorAll(selector));
    },

    get tagName() {
      var elm = getLinkedElement(this);
      return elementTagNameGetter.call(elm);
    },

    get classList() {
      if (process.env.NODE_ENV !== 'production') {
        var vm = getComponentVM(this); // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes

        assert.isFalse(isBeingConstructed(vm), "Failed to construct ".concat(vm, ": The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead."));
      }

      return getLinkedElement(this).classList;
    },

    get template() {
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      }

      return vm.cmpRoot;
    },

    get root() {
      // TODO: issue #418
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
        assert.logWarning("\"this.root\" access in ".concat(vm.component, " has been deprecated and will be removed. Use \"this.template\" instead."));
      }

      return vm.cmpRoot;
    },

    get shadowRoot() {
      // from within, the shadowRoot is always in "closed" mode
      return null;
    },

    toString: function toString() {
      var vm = getComponentVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      }

      var elm = vm.elm;
      var tagName = elementTagNameGetter.call(elm);
      var is = elm.getAttribute('is');
      return "<".concat(tagName.toLowerCase()).concat(is ? ' is="${is}' : '', ">");
    }
  };
  /**
   * This abstract operation is supposed to be called once, with a descriptor map that contains
   * all standard properties that a Custom Element can support (including AOM properties), which
   * determines what kind of capabilities the Base Element should support. When creating the descriptors
   * for be Base Element, it also include the reactivity bit, so those standard properties are reactive.
   */

  function createBaseElementStandardPropertyDescriptors(StandardPropertyDescriptors) {
    var descriptors = ArrayReduce.call(getOwnPropertyNames(StandardPropertyDescriptors), function (seed, propName) {
      seed[propName] = getHTMLPropDescriptor(propName, StandardPropertyDescriptors[propName]);
      return seed;
    }, create(null));
    return descriptors;
  }

  function detect() {
    // Don't apply polyfill when ProxyCompat is enabled.
    if ('getKey' in Proxy) {
      return false;
    }

    var proxy = new Proxy([3, 4], {});
    var res = [1, 2].concat(proxy);
    return res.length !== 4;
  }

  var isConcatSpreadable = Symbol.isConcatSpreadable;
  var isArray$2 = Array.isArray;
  var _Array$prototype3 = Array.prototype,
      ArraySlice$1 = _Array$prototype3.slice,
      ArrayUnshift$1 = _Array$prototype3.unshift,
      ArrayShift = _Array$prototype3.shift;

  function isObject$2(O) {
    return _typeof(O) === 'object' ? O !== null : typeof O === 'function';
  } // https://www.ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable


  function isSpreadable(O) {
    if (!isObject$2(O)) {
      return false;
    }

    var spreadable = O[isConcatSpreadable];
    return spreadable !== undefined ? Boolean(spreadable) : isArray$2(O);
  } // https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat


  function ArrayConcatPolyfill() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var O = Object(this);
    var A = [];
    var N = 0;
    var items = ArraySlice$1.call(arguments);
    ArrayUnshift$1.call(items, O);

    while (items.length) {
      var E = ArrayShift.call(items);

      if (isSpreadable(E)) {
        var _k = 0;
        var length = E.length;

        for (_k; _k < length; _k += 1, N += 1) {
          if (_k in E) {
            var subElement = E[_k];
            A[N] = subElement;
          }
        }
      } else {
        A[N] = E;
        N += 1;
      }
    }

    return A;
  }

  function apply() {
    Array.prototype.concat = ArrayConcatPolyfill;
  }

  if (detect()) {
    apply();
  }

  function detect$1() {
    return Object.getOwnPropertyDescriptor(Event.prototype, 'composed') === undefined;
  }

  function apply$1() {
    // https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
    var composedEvents = assign(create(null), {
      blur: 1,
      focus: 1,
      focusin: 1,
      focusout: 1,
      click: 1,
      dblclick: 1,
      mousedown: 1,
      mouseenter: 1,
      mouseleave: 1,
      mousemove: 1,
      mouseout: 1,
      mouseover: 1,
      mouseup: 1,
      wheel: 1,
      beforeinput: 1,
      input: 1,
      keydown: 1,
      keyup: 1,
      compositionstart: 1,
      compositionupdate: 1,
      compositionend: 1,
      touchstart: 1,
      touchend: 1,
      touchmove: 1,
      touchcancel: 1,
      pointerover: 1,
      pointerenter: 1,
      pointerdown: 1,
      pointermove: 1,
      pointerup: 1,
      pointercancel: 1,
      pointerout: 1,
      pointerleave: 1,
      gotpointercapture: 1,
      lostpointercapture: 1,
      dragstart: 1,
      drag: 1,
      dragenter: 1,
      dragleave: 1,
      dragover: 1,
      drop: 1,
      dragend: 1,
      DOMActivate: 1,
      DOMFocusIn: 1,
      DOMFocusOut: 1,
      keypress: 1
    }); // Composed for Native events

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

  if (detect$1()) {
    apply$1();
  }

  var _window = window,
      OriginalCustomEvent = _window.CustomEvent;

  function PatchedCustomEvent(type, eventInitDict) {
    var event = new OriginalCustomEvent(type, eventInitDict); // support for composed on custom events

    Object.defineProperties(event, {
      composed: {
        // We can't use "value" here, because IE11 doesn't like mixing and matching
        // value with get() from Event.prototype.
        get: function get() {
          return !!(eventInitDict && eventInitDict.composed);
        },
        configurable: true,
        enumerable: true
      }
    });
    return event;
  }

  function apply$2() {
    window.CustomEvent = PatchedCustomEvent;
    window.CustomEvent.prototype = OriginalCustomEvent.prototype;
  }

  function detect$2() {
    // We need to check if CustomEvent is our PatchedCustomEvent because jest
    // will reset the window object but not constructos and prototypes (e.g.,
    // Event.prototype).
    // https://github.com/jsdom/jsdom#shared-constructors-and-prototypes
    return window.CustomEvent !== PatchedCustomEvent;
  }

  if (detect$2()) {
    apply$2();
  }

  function detect$3() {
    return true;
  }

  function apply$3() {
    var originalComposedGetter = Object.getOwnPropertyDescriptor(Event.prototype, 'composed').get;
    Object.defineProperties(FocusEvent.prototype, {
      composed: {
        get: function get() {
          var isTrusted = this.isTrusted;
          var composed = originalComposedGetter.call(this);

          if (isTrusted && composed === false) {
            return true;
          }

          return composed;
        },
        enumerable: true,
        configurable: true
      }
    });
  }

  if (detect$3()) {
    apply$3();
  }

  function detect$4() {
    return Object.getOwnPropertyDescriptor(Element.prototype, 'role') === undefined;
  }

  if (detect$4()) {
    patch();
  }
  /**
   * This module is responsible for producing the ComponentDef object that is always
   * accessible via `vm.def`. This is lazily created during the creation of the first
   * instance of a component class, and shared across all instances.
   *
   * This structure can be used to synthetically create proxies, and understand the
   * shape of a component. It is also used internally to apply extra optimizations.
   */


  var CtorToDefMap = new WeakMap();

  function getCtorProto(Ctor) {
    var proto = getPrototypeOf(Ctor);
    return isCircularModuleDependency(proto) ? resolveCircularModuleDependency(proto) : proto;
  } // According to the WC spec (https://dom.spec.whatwg.org/#dom-element-attachshadow), certain elements
  // are not allowed to attached a shadow dom, and therefore, we need to prevent setting forceTagName to
  // those, otherwise we will not be able to use shadowDOM when forceTagName is specified in the future.


  function assertValidForceTagName(Ctor) {
    if (process.env.NODE_ENV === 'production') {
      // this method should never leak to prod
      throw new ReferenceError();
    }

    var forceTagName = Ctor.forceTagName;

    if (isUndefined(forceTagName)) {
      return;
    }

    var invalidTags = ["article", "aside", "blockquote", "body", "div", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "main", "nav", "p", "section", "span"];

    if (ArrayIndexOf.call(invalidTags, forceTagName) !== -1) {
      throw new RangeError("Invalid static forceTagName property set to \"".concat(forceTagName, "\" in component ").concat(Ctor, ". None of the following tag names can be used: ").concat(invalidTags.join(", "), "."));
    }

    if (StringIndexOf.call(forceTagName, '-') !== -1) {
      throw new RangeError("Invalid static forceTagName property set to \"".concat(forceTagName, "\" in component ").concat(Ctor, ". It cannot have a dash (-) on it because that is reserved for existing custom elements."));
    }
  }

  function isElementComponent(Ctor, protoSet) {
    protoSet = protoSet || [];

    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
      return false; // null, undefined, or circular prototype definition
    }

    var proto = getCtorProto(Ctor);

    if (proto === LightningElement) {
      return true;
    }

    getComponentDef(proto); // ensuring that the prototype chain is already expanded

    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
  }

  function createComponentDef(Ctor) {
    if (_globalInitialization) {
      // Note: this routine is just to solve the circular dependencies mess introduced by rollup.
      _globalInitialization();
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(isElementComponent(Ctor), "".concat(Ctor, " is not a valid component, or does not extends Element from \"engine\". You probably forgot to add the extend clause on the class declaration.")); // local to dev block

      var ctorName = Ctor.name;
      assert.isTrue(ctorName && isString(ctorName), "".concat(toString(Ctor), " should have a \"name\" property with string value, but found ").concat(ctorName, "."));
      assert.isTrue(Ctor.constructor, "Missing ".concat(ctorName, ".constructor, ").concat(ctorName, " should have a \"constructor\" property."));
      assertValidForceTagName(Ctor);
    }

    var name = Ctor.name;
    var props = getPublicPropertiesHash(Ctor);
    var methods = getPublicMethodsHash(Ctor);
    var wire$$1 = getWireHash(Ctor);
    var track$$1 = getTrackHash(Ctor);
    var proto = Ctor.prototype;
    var decoratorMap = create(null); // TODO: eventually, the compiler should do this work

    {
      for (var propName in props) {
        decoratorMap[propName] = api$1;
      }

      if (wire$$1) {
        for (var _propName in wire$$1) {
          var wireDef = wire$$1[_propName];

          if (wireDef.method) {
            // for decorated methods we need to do nothing
            continue;
          }

          decoratorMap[_propName] = wire(wireDef.adapter, wireDef.params);
        }
      }

      if (track$$1) {
        for (var _propName2 in track$$1) {
          decoratorMap[_propName2] = track;
        }
      }

      decorate(Ctor, decoratorMap);
    }
    var connectedCallback = proto.connectedCallback,
        disconnectedCallback = proto.disconnectedCallback,
        renderedCallback = proto.renderedCallback,
        errorCallback = proto.errorCallback,
        render = proto.render;
    var superElmProto = globalElmProto;
    var superElmDescriptors = globalElmDescriptors;
    var superProto = getCtorProto(Ctor);
    var superDef = superProto !== LightningElement ? getComponentDef(superProto) : null;

    if (!isNull(superDef)) {
      props = assign(create(null), superDef.props, props);
      methods = assign(create(null), superDef.methods, methods);
      wire$$1 = superDef.wire || wire$$1 ? assign(create(null), superDef.wire, wire$$1) : undefined;
      connectedCallback = connectedCallback || superDef.connectedCallback;
      disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
      renderedCallback = renderedCallback || superDef.renderedCallback;
      errorCallback = errorCallback || superDef.errorCallback;
      render = render || superDef.render;
      superElmProto = superDef.elmProto;
      superElmDescriptors = superDef.descriptors;
    }

    var localKeyDescriptors = createCustomElementDescriptorMap(props, methods);
    var elmProto = create(superElmProto, localKeyDescriptors);
    var descriptors = assign(create(null), superElmDescriptors, localKeyDescriptors);
    props = assign(create(null), HTML_PROPS, props);
    var def = {
      name: name,
      wire: wire$$1,
      track: track$$1,
      props: props,
      methods: methods,
      descriptors: descriptors,
      elmProto: elmProto,
      connectedCallback: connectedCallback,
      disconnectedCallback: disconnectedCallback,
      renderedCallback: renderedCallback,
      errorCallback: errorCallback,
      render: render
    };

    if (process.env.NODE_ENV !== 'production') {
      freeze(Ctor.prototype);
      freeze(wire$$1);
      freeze(props);
      freeze(methods);

      for (var key in def) {
        defineProperty(def, key, {
          configurable: false,
          writable: false
        });
      }
    }

    return def;
  } // across components, the public props are almost much the same, we just cache
  // the getter and setter for perf reasons considering that most of them are standard
  // global properties, but they need to be monkey patch so we can delegate their
  // behavior to the corresponding instance.


  var cachedGetterByKey = create(null);
  var cachedSetterByKey = create(null);

  function createGetter(key) {
    var fn = cachedGetterByKey[key];

    if (isUndefined(fn)) {
      fn = cachedGetterByKey[key] = function () {
        var vm = getCustomElementVM(this);
        var getHook = vm.getHook;
        return getHook(vm.component, key);
      };
    }

    return fn;
  }

  function createSetter(key) {
    var fn = cachedSetterByKey[key];

    if (isUndefined(fn)) {
      fn = cachedSetterByKey[key] = function (newValue) {
        var vm = getCustomElementVM(this);
        var setHook = vm.setHook;
        setHook(vm.component, key, newValue);
      };
    }

    return fn;
  }

  function createMethodCaller(method) {
    return function () {
      var vm = getCustomElementVM(this);
      var callHook = vm.callHook;
      return callHook(vm.component, method, ArraySlice.call(arguments));
    };
  }

  function createCustomElementDescriptorMap(publicProps, publicMethodsConfig) {
    var descriptors = create(null); // expose getters and setters for each public props on the Element

    for (var key in publicProps) {
      descriptors[key] = {
        get: createGetter(key),
        set: createSetter(key),
        enumerable: true,
        configurable: true
      };
    } // expose public methods as props on the Element


    for (var _key2 in publicMethodsConfig) {
      descriptors[_key2] = {
        value: createMethodCaller(publicMethodsConfig[_key2]),
        writable: true,
        configurable: true
      };
    }

    return descriptors;
  }

  function getTrackHash(target) {
    var track$$1 = target.track;

    if (!getOwnPropertyDescriptor(target, 'track') || !track$$1 || !getOwnPropertyNames(track$$1).length) {
      return EmptyObject;
    } // TODO: check that anything in `track` is correctly defined in the prototype


    return assign(create(null), track$$1);
  }

  function getWireHash(target) {
    var wire$$1 = target.wire;

    if (!getOwnPropertyDescriptor(target, 'wire') || !wire$$1 || !getOwnPropertyNames(wire$$1).length) {
      return;
    } // TODO: check that anything in `wire` is correctly defined in the prototype


    return assign(create(null), wire$$1);
  }

  function getPublicPropertiesHash(target) {
    var props = target.publicProps;

    if (!getOwnPropertyDescriptor(target, 'publicProps') || !props || !getOwnPropertyNames(props).length) {
      return EmptyObject;
    }

    return getOwnPropertyNames(props).reduce(function (propsHash, propName) {
      var attrName = getAttrNameFromPropName(propName);

      if (process.env.NODE_ENV !== 'production') {
        var globalHTMLProperty = getGlobalHTMLPropertiesInfo()[propName];

        if (globalHTMLProperty && globalHTMLProperty.attribute && globalHTMLProperty.reflective === false) {
          var error = globalHTMLProperty.error,
              attribute = globalHTMLProperty.attribute,
              experimental = globalHTMLProperty.experimental;
          var msg = [];

          if (error) {
            msg.push(error);
          } else if (experimental) {
            msg.push("\"".concat(propName, "\" is an experimental property that is not standardized or supported by all browsers. You should not use \"").concat(propName, "\" and attribute \"").concat(attribute, "\" in your component."));
          } else {
            msg.push("\"".concat(propName, "\" is a global HTML property. Instead access it via the reflective attribute \"").concat(attribute, "\" with one of these techniques:"));
            msg.push("  * Use `this.getAttribute(\"".concat(attribute, "\")` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process."));
            msg.push("  * Declare `static observedAttributes = [\"".concat(attribute, "\"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated."));
          }

          console.error(msg.join('\n')); // tslint:disable-line
        }
      }

      propsHash[propName] = assign({
        config: 0,
        type: 'any',
        attr: attrName
      }, props[propName]);
      return propsHash;
    }, create(null));
  }

  function getPublicMethodsHash(target) {
    var publicMethods = target.publicMethods;

    if (!getOwnPropertyDescriptor(target, 'publicMethods') || !publicMethods || !publicMethods.length) {
      return EmptyObject;
    }

    return publicMethods.reduce(function (methodsHash, methodName) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isFunction(target.prototype[methodName]), "Component \"".concat(target.name, "\" should have a method `").concat(methodName, "` instead of ").concat(target.prototype[methodName], "."));
      }

      methodsHash[methodName] = target.prototype[methodName];
      return methodsHash;
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

  var HTML_PROPS = create(null);
  var GLOBAL_PROPS_DESCRIPTORS = create(null);
  var globalElmProto = create(BaseCustomElementProto);
  var globalElmDescriptors = create(null, _defineProperty({}, PatchedFlag, {}));

  var _globalInitialization = function globalInitialization() {
    // Note: this routine is just to solve the circular dependencies mess introduced by rollup.
    forEach.call(ElementAOMPropertyNames, function (propName) {
      // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
      // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
      var descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);

      if (!isUndefined(descriptor)) {
        var attrName = getAttrNameFromPropName(propName);
        HTML_PROPS[propName] = {
          config: 3,
          type: 'any',
          attr: attrName
        };
        var globalElmDescriptor = globalElmDescriptors[propName] = {
          get: createGetter(propName),
          set: createSetter(propName),
          enumerable: true,
          configurable: true
        };
        defineProperty(globalElmProto, propName, globalElmDescriptor);
        GLOBAL_PROPS_DESCRIPTORS[propName] = descriptor;
      }
    });
    forEach.call(defaultDefHTMLPropertyNames, function (propName) {
      // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
      // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
      // this category, so, better to be sure.
      var descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);

      if (!isUndefined(descriptor)) {
        var attrName = getAttrNameFromPropName(propName);
        HTML_PROPS[propName] = {
          config: 3,
          type: 'any',
          attr: attrName
        };
        var globalElmDescriptor = globalElmDescriptors[propName] = {
          get: createGetter(propName),
          set: createSetter(propName),
          enumerable: true,
          configurable: true
        };
        defineProperty(globalElmProto, propName, globalElmDescriptor);
        GLOBAL_PROPS_DESCRIPTORS[propName] = descriptor;
      }
    });
    defineProperties(LightningElement.prototype, createBaseElementStandardPropertyDescriptors(GLOBAL_PROPS_DESCRIPTORS));

    if (process.env.NODE_ENV !== 'production') {
      patchLightningElementPrototypeWithRestrictions(LightningElement.prototype);
    }

    freeze(LightningElement);
    seal(LightningElement.prototype);
    _globalInitialization = void 0;
  };
  /**
  @license
  Copyright (c) 2015 Simon Friis Vindum.
  This code may only be used under the MIT License found at
  https://github.com/snabbdom/snabbdom/blob/master/LICENSE
  Code distributed by Snabbdom as part of the Snabbdom project at
  https://github.com/snabbdom/snabbdom/
  */


  var isArray$3 = Array.isArray;
  var ELEMENT_NODE$1 = 1,
      TEXT_NODE$1 = 3,
      COMMENT_NODE$1 = 8,
      DOCUMENT_FRAGMENT_NODE = 11;

  function isUndef(s) {
    return s === undefined;
  }

  function isDef(s) {
    return s !== undefined;
  }

  var emptyNode = {
    nt: 0,
    sel: '',
    data: {},
    children: undefined,
    text: undefined,
    elm: undefined,
    key: undefined
  };

  function defaultCompareFn(vnode1, vnode2) {
    return vnode1.nt === vnode2.nt && vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
  }

  function isVNode(vnode) {
    return vnode != null;
  }

  function isElementVNode(vnode) {
    return vnode.nt === ELEMENT_NODE$1;
  }

  function isFragmentVNode(vnode) {
    return vnode.nt === DOCUMENT_FRAGMENT_NODE;
  }

  function isTextVNode(vnode) {
    return vnode.nt === TEXT_NODE$1;
  }

  function isCommentVNode(vnode) {
    return vnode.nt === COMMENT_NODE$1;
  }

  function createKeyToOldIdx(children, beginIdx, endIdx) {
    var map = {};
    var i, key, ch;

    for (i = beginIdx; i <= endIdx; ++i) {
      ch = children[i];

      if (isVNode(ch)) {
        key = ch.key;

        if (key !== undefined) {
          map[key] = i;
        }
      }
    }

    return map;
  }

  var hooks$1 = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

  function init$1(modules, api, compareFn) {
    var cbs = {};
    var i, j;
    var sameVnode = isUndef(compareFn) ? defaultCompareFn : compareFn;

    for (i = 0; i < hooks$1.length; ++i) {
      cbs[hooks$1[i]] = [];

      for (j = 0; j < modules.length; ++j) {
        var _hook = modules[j][hooks$1[i]];

        if (_hook !== undefined) {
          cbs[hooks$1[i]].push(_hook);
        }
      }
    }

    function createRmCb(childElm, listeners) {
      return function rmCb() {
        if (--listeners === 0) {
          var parent = api.parentNode(childElm);
          api.removeChild(parent, childElm);
        }
      };
    }

    function createElm(vnode, insertedVnodeQueue) {
      var i;
      var data = vnode.data;

      if (!isUndef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) {
          i(vnode);
        }
      }

      if (isElementVNode(vnode)) {
        var _data3 = vnode.data,
            tag = vnode.tag;
        var elm = vnode.elm = isDef(i = _data3.ns) ? api.createElementNS(i, tag, _data3.uid) : api.createElement(tag, _data3.uid);

        if (isDef(i = _data3.hook) && isDef(i.create)) {
          i.create(emptyNode, vnode);
        }

        for (i = 0; i < cbs.create.length; ++i) {
          cbs.create[i](emptyNode, vnode);
        }

        var children = vnode.children;

        if (isArray$3(children)) {
          for (i = 0; i < children.length; ++i) {
            var ch = children[i];

            if (isVNode(ch)) {
              api.appendChild(elm, createElm(ch, insertedVnodeQueue));
            }
          }
        } else if (!isUndef(vnode.text)) {
          api.appendChild(elm, api.createTextNode(vnode.text, vnode.data.uid));
        }

        if (isDef(i = _data3.hook) && isDef(i.insert)) {
          insertedVnodeQueue.push(vnode);
        }
      } else if (isTextVNode(vnode)) {
        vnode.elm = api.createTextNode(vnode.text, vnode.data.uid);
      } else if (isCommentVNode(vnode)) {
        vnode.elm = api.createComment(vnode.text, vnode.data.uid);
      } else if (isFragmentVNode(vnode)) {
        vnode.elm = api.createFragment();
      } else {
        throw new TypeError();
      }

      return vnode.elm;
    }

    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];

        if (isVNode(ch)) {
          api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
        }
      }
    }

    function invokeDestroyHook(vnode) {
      var data = vnode.data;
      var i, j;

      if (isDef(i = data.hook) && isDef(i = i.destroy)) {
        i(vnode);
      }

      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode);
      }

      var children = vnode.children;

      if (isUndef(children)) {
        return;
      }

      for (j = 0; j < children.length; ++j) {
        var n = children[j];

        if (isVNode(n) && !isTextVNode(n)) {
          invokeDestroyHook(n);
        }
      }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];

        var _i17 = void 0,
            listeners = void 0,
            rm = void 0; // text nodes do not have logic associated to them


        if (isVNode(ch)) {
          if (!isTextVNode(ch)) {
            listeners = cbs.remove.length + 1;
            rm = createRmCb(ch.elm, listeners);

            for (_i17 = 0; _i17 < cbs.remove.length; ++_i17) {
              cbs.remove[_i17](ch, rm);
            }

            if (isDef(_i17 = ch.data.hook) && isDef(_i17 = _i17.remove)) {
              _i17(ch, rm);
            } else {
              rm();
            }

            invokeDestroyHook(ch);
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
        if (!isVNode(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
        } else if (!isVNode(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (!isVNode(newStartVnode)) {
          newStartVnode = newCh[++newStartIdx];
        } else if (!isVNode(newEndVnode)) {
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
          if (oldKeyToIdx === undefined) {
            oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
          }

          idxInOld = oldKeyToIdx[newStartVnode.key];

          if (isUndef(idxInOld)) {
            // New element
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            elmToMove = oldCh[idxInOld];

            if (isVNode(elmToMove)) {
              if (elmToMove.sel !== newStartVnode.sel) {
                api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
              } else {
                patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                oldCh[idxInOld] = undefined;
                api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
              }
            }

            newStartVnode = newCh[++newStartIdx];
          }
        }
      }

      if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
        if (oldStartIdx > oldEndIdx) {
          var n = newCh[newEndIdx + 1];
          before = isVNode(n) ? n.elm : null;
          addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        } else {
          removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
      }
    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
      var i, hook;

      if (isDef(i = vnode.data)) {
        hook = i.hook;
      }

      if (isDef(hook) && isDef(i = hook.prepatch)) {
        i(oldVnode, vnode);
      }

      var elm = vnode.elm = oldVnode.elm;

      if (oldVnode === vnode) {
        return;
      }

      if (vnode.data !== undefined) {
        for (i = 0; i < cbs.update.length; ++i) {
          cbs.update[i](oldVnode, vnode);
        }

        if (isDef(hook) && isDef(i = hook.update)) {
          i(oldVnode, vnode);
        }
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;

      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) {
            updateChildren(elm, oldCh, ch, insertedVnodeQueue);
          }
        } else if (isDef(ch)) {
          if (isDef(oldVnode.text)) {
            api.setTextContent(elm, '');
          }

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

    var patch = function patch(oldVnode, vnode) {
      if (!isVNode(oldVnode) || !isVNode(vnode)) {
        throw new TypeError();
      }

      var i, n, elm, parent;
      var pre = cbs.pre,
          post = cbs.post;
      var insertedVnodeQueue = [];

      for (i = 0, n = pre.length; i < n; ++i) {
        pre[i]();
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

      for (i = 0, n = insertedVnodeQueue.length; i < n; ++i) {
        // if a vnode is in this queue, it must have the insert hook defined
        insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
      }

      for (i = 0, n = post.length; i < n; ++i) {
        post[i]();
      }

      return vnode;
    };

    patch.children = function children(parentElm, oldCh, newCh) {
      if (!isArray$3(oldCh) || !isArray$3(newCh)) {
        throw new TypeError();
      }

      var i, n;
      var pre = cbs.pre,
          post = cbs.post;
      var insertedVnodeQueue = [];

      for (i = 0, n = pre.length; i < n; ++i) {
        pre[i]();
      }

      if (oldCh !== newCh) {
        updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue);
      }

      for (i = 0, n = insertedVnodeQueue.length; i < n; ++i) {
        // if a vnode is in this queue, it must have the insert hook defined
        insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
      }

      for (i = 0, n = post.length; i < n; ++i) {
        post[i]();
      }

      return newCh;
    };

    return patch;
  }

  var EspecialTagAndPropMap = create(null, {
    input: {
      value: create(null, {
        value: {
          value: 1
        },
        checked: {
          value: 1
        }
      })
    },
    select: {
      value: create(null, {
        value: {
          value: 1
        }
      })
    },
    textarea: {
      value: create(null, {
        value: {
          value: 1
        }
      })
    }
  });

  function isLiveBindingProp(sel, key) {
    // checked and value properties are considered especial, and even if the old tracked value is equal to the new tracked value
    // we still check against the element's corresponding value to be sure.
    return sel in EspecialTagAndPropMap && key in EspecialTagAndPropMap[sel];
  }

  function update(oldVnode, vnode) {
    var props = vnode.data.props;

    if (isUndefined(props)) {
      return;
    }

    var oldProps = oldVnode.data.props;

    if (oldProps === props) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','), "vnode.data.props cannot change shape.");
    }

    var key;
    var cur;
    var elm = vnode.elm;
    var vm = getInternalField(elm, ViewModelReflection);
    var isFirstPatch = isUndefined(oldProps);
    var isCustomElement = !isUndefined(vm);
    var sel = vnode.sel;

    for (key in props) {
      cur = props[key];

      if (process.env.NODE_ENV !== 'production') {
        if (!(key in elm)) {
          // TODO: this should never really happen because the compiler should always validate
          assert.fail("Unknown public property \"".concat(key, "\" of element <").concat(StringToLowerCase.call(elementTagNameGetter.call(elm)), ">. This is likely a typo on the corresponding attribute \"").concat(getAttrNameFromPropName(key), "\"."));
        }
      }

      if (isFirstPatch) {
        // TODO: this check for undefined should not be in place after 216
        // in which case initial undefined values will be set just like any
        // other non-undefined value, and it is a responsibility of the author
        // and consumer to provide the right values.
        if (!isUndefined(cur)) {
          if (isCustomElement) {
            prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
          }

          elm[key] = cur;
        } else {
          // setting undefined value initial is probably a mistake by the consumer,
          // unless that the component author is accepting undefined, but we can't
          // know that as of today, this is some basic heuristics to give them some
          // warnings.
          if (isCustomElement) {
            if (!isUndefined(elm[key]) && vm.def.props[key].config === 0) {
              // component does not have a getter or setter
              assert.logWarning("Possible insufficient validation for property \"".concat(toString(key), "\" in ").concat(toString(vm), ". If the value is set to `undefined`, the component is not normalizing it."));
            }
          } else {
            if (isString(elm[key])) {
              assert.logWarning("Invalid initial `undefined` value for for property \"".concat(toString(key), "\" in Element ").concat(toString(elm), ", it will be casted to String."));
            }
          }
        }
      } else if (cur !== (isLiveBindingProp(sel, key) ? elm[key] : oldProps[key])) {
        // if the current value is different to the previous value...
        if (isCustomElement) {
          prepareForPropUpdate(vm); // this is just in case the vnode is actually a custom element
        } // touching the dom only when the prop value is really changing.


        elm[key] = cur;
      }
    }
  }

  var propsModule = {
    create: update,
    update: update
  };
  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var xmlNS = 'http://www.w3.org/XML/1998/namespace';
  var ColonCharCode = 58;

  function updateAttrs(oldVnode, vnode) {
    var attrs = vnode.data.attrs;

    if (isUndefined(attrs)) {
      return;
    }

    var oldAttrs = oldVnode.data.attrs;

    if (oldAttrs === attrs) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isUndefined(oldAttrs) || keys(oldAttrs).join(',') === keys(attrs).join(','), "vnode.data.attrs cannot change shape.");
    }

    var elm = vnode.elm;
    var key;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs; // update modified attributes, add new attributes
    // this routine is only useful for data-* attributes in all kind of elements
    // and aria-* in standard elements (custom elements will use props for these)

    for (key in attrs) {
      var cur = attrs[key];
      var old = oldAttrs[key];

      if (old !== cur) {
        if (process.env.NODE_ENV !== 'production') {
          unlockAttribute(elm, key);
        }

        if (StringCharCodeAt.call(key, 3) === ColonCharCode) {
          // Assume xml namespace
          elm.setAttributeNS(xmlNS, key, cur);
        } else if (StringCharCodeAt.call(key, 5) === ColonCharCode) {
          // Assume xlink namespace
          elm.setAttributeNS(xlinkNS, key, cur);
        } else if (isNull(cur)) {
          elm.removeAttribute(key);
        } else {
          elm.setAttribute(key, cur);
        }

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, key);
        }
      }
    }
  }

  var attributesModule = {
    create: updateAttrs,
    update: updateAttrs
  };

  function updateStyle(oldVnode, vnode) {
    var newStyle = vnode.data.style;

    if (isUndefined(newStyle)) {
      return;
    }

    var oldStyle = oldVnode.data.style;

    if (oldStyle === newStyle) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isUndefined(oldStyle) || _typeof(newStyle) === _typeof(oldStyle), "vnode.data.style cannot change types.");
    }

    var name;
    var elm = vnode.elm;
    var style = elm.style;

    if (isUndefined(newStyle) || newStyle === '') {
      removeAttribute$2.call(elm, 'style');
    } else if (isString(newStyle)) {
      // The style property is a string when defined via an expression in the template.
      style.cssText = newStyle;
    } else {
      if (!isUndefined(oldStyle)) {
        for (name in oldStyle) {
          if (!(name in newStyle)) {
            style.removeProperty(name);
          }
        }
      } else {
        oldStyle = EmptyObject;
      } // The style property is an object when defined as a string in the template. The compiler
      // takes care of transforming the inline style into an object. It's faster to set the
      // different style properties individually instead of via a string.


      for (name in newStyle) {
        var cur = newStyle[name];

        if (cur !== oldStyle[name]) {
          style[name] = cur;
        }
      }
    }
  }

  var styleModule = {
    create: updateStyle,
    update: updateStyle
  };

  function updateClass(oldVnode, vnode) {
    var elm = vnode.elm,
        klass = vnode.data.class;

    if (isUndefined(klass)) {
      return;
    }

    var oldClass = oldVnode.data.class;

    if (oldClass === klass) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(isUndefined(oldClass) || _typeof(oldClass) === _typeof(klass), "vnode.data.class cannot change types.");
    }

    var classList = elm.classList;
    var name;
    oldClass = isUndefined(oldClass) ? EmptyObject : oldClass;

    for (name in oldClass) {
      // remove only if it is not in the new class collection and it is not set from within the instance
      if (isUndefined(klass[name])) {
        classList.remove(name);
      }
    }

    for (name in klass) {
      if (isUndefined(oldClass[name])) {
        classList.add(name);
      }
    }
  }

  var classes = {
    create: updateClass,
    update: updateClass
  };

  function handleEvent(event, vnode) {
    var type = event.type;
    var on = vnode.data.on;
    var handler = on && on[type]; // call event handler if exists

    if (handler) {
      handler.call(undefined, event);
    }
  }

  function createListener() {
    return function handler(event) {
      handleEvent(event, handler.vnode);
    };
  }

  function removeAllEventListeners(vnode) {
    var on = vnode.data.on,
        listener = vnode.listener;

    if (on && listener) {
      var elm = vnode.elm;
      var name;

      for (name in on) {
        elm.removeEventListener(name, listener);
      }

      vnode.listener = undefined;
    }
  }

  function updateAllEventListeners(oldVnode, vnode) {
    if (isUndefined(oldVnode.listener)) {
      createAllEventListeners(oldVnode, vnode);
    } else {
      vnode.listener = oldVnode.listener;
      vnode.listener.vnode = vnode;
    }
  }

  function createAllEventListeners(oldVnode, vnode) {
    var on = vnode.data.on;

    if (isUndefined(on)) {
      return;
    }

    var elm = vnode.elm;
    var listener = vnode.listener = createListener();
    listener.vnode = vnode;
    var name;

    for (name in on) {
      elm.addEventListener(name, listener);
    }
  }

  var eventListenersModule = {
    update: updateAllEventListeners,
    create: createAllEventListeners,
    destroy: removeAllEventListeners
  };

  function updateToken(oldVnode, vnode) {
    var oldToken = oldVnode.data.token;
    var newToken = vnode.data.token;

    if (oldToken === newToken) {
      return;
    }

    var elm = vnode.elm;

    if (!isUndefined(oldToken)) {
      removeAttribute$2.call(elm, oldToken);
    }

    if (!isUndefined(newToken)) {
      setAttribute$2.call(elm, newToken, '');
    }
  }

  var tokenModule = {
    create: updateToken,
    update: updateToken
  };
  var _document = document,
      _createElement = _document.createElement,
      _createElementNS = _document.createElementNS,
      _createTextNode = _document.createTextNode,
      _createComment = _document.createComment,
      createDocumentFragment = _document.createDocumentFragment;
  var _Node$prototype2 = Node.prototype,
      insertBefore$1 = _Node$prototype2.insertBefore,
      removeChild$1 = _Node$prototype2.removeChild,
      appendChild$1 = _Node$prototype2.appendChild;

  function parentNode(node) {
    return parentNodeGetter$1.call(node);
  }

  function nextSibling(node) {
    return node.nextSibling;
  }

  function setTextContent(node, text) {
    node.nodeValue = text;
  }

  function remapNodeIfFallbackIsNeeded(vm, node) {
    // if operation in the fake shadow root, delegate the operation to the host
    return isUndefined(vm) || isFalse(vm.fallback) || vm.cmpRoot !== node ? node : vm.elm;
  }

  var htmlDomApi = {
    createFragment: function createFragment() {
      return createDocumentFragment.call(document);
    },
    createElement: function createElement(tagName, uid) {
      var element = _createElement.call(document, tagName);

      setNodeOwnerKey(element, uid);

      if (process.env.NODE_ENV !== 'production') {
        if (tagName === 'slot') {
          patchSlotElementWithRestrictions(element);
        }
      }

      return element;
    },
    createElementNS: function createElementNS(namespaceURI, qualifiedName, uid) {
      var element = _createElementNS.call(document, namespaceURI, qualifiedName);

      setNodeOwnerKey(element, uid);
      return element;
    },
    createTextNode: function createTextNode(text, uid) {
      var textNode = _createTextNode.call(document, text);

      setNodeOwnerKey(textNode, uid);
      return textNode;
    },
    createComment: function createComment(text, uid) {
      var comment = _createComment.call(document, text);

      setNodeOwnerKey(comment, uid);
      return comment;
    },
    insertBefore: function insertBefore(parent, newNode, referenceNode) {
      var vm = getInternalField(parent, ViewModelReflection);
      parent = remapNodeIfFallbackIsNeeded(vm, parent);
      insertBefore$1.call(parent, newNode, referenceNode);
    },
    removeChild: function removeChild(node, child) {
      if (!isNull(node)) {
        var vm = getInternalField(node, ViewModelReflection);
        node = remapNodeIfFallbackIsNeeded(vm, node);
        removeChild$1.call(node, child);
      }
    },
    appendChild: function appendChild(node, child) {
      var vm = getInternalField(node, ViewModelReflection);

      if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(vm) && isTrue(vm.fallback)) {
          assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
          assert.invariant(vm.elm !== node, "Internal Error: no insertion should be carry on host element directly when running in fallback mode.");
        }
      }

      node = remapNodeIfFallbackIsNeeded(vm, node);
      appendChild$1.call(node, child);
    },
    parentNode: parentNode,
    nextSibling: nextSibling,
    setTextContent: setTextContent
  };
  var patchVNode = init$1([// Attrs need to be applied to element before props
  // IE11 will wipe out value on radio inputs if value
  // is set before type=radio.
  attributesModule, propsModule, classes, styleModule, eventListenersModule, tokenModule], htmlDomApi);
  var patchChildren = patchVNode.children;
  var isNativeShadowRootAvailable$2 = typeof window.ShadowRoot !== "undefined";
  var idx = 0;
  var uid = 0;

  function callHook(cmp, fn, args) {
    return fn.apply(cmp, args);
  }

  function setHook(cmp, prop, newValue) {
    cmp[prop] = newValue;
  }

  function getHook(cmp, prop) {
    return cmp[prop];
  } // DO NOT CHANGE this:
  // these two values are used by the faux-shadow implementation to traverse the DOM


  var OwnerKey$1 = '$$OwnerKey$$';
  var OwnKey$1 = '$$OwnKey$$';

  function addInsertionIndex(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.invariant(vm.idx === 0, "".concat(vm, " is already locked to a previously generated idx."));
    }

    vm.idx = ++idx;
    var connected = Services.connected;

    if (connected) {
      invokeServiceHook(vm, connected);
    }

    var connectedCallback = vm.def.connectedCallback;

    if (!isUndefined(connectedCallback)) {
      if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'connectedCallback');
      }

      invokeComponentCallback(vm, connectedCallback);

      if (process.env.NODE_ENV !== 'production') {
        endMeasure(vm, 'connectedCallback');
      }
    }
  }

  function removeInsertionIndex(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.invariant(vm.idx > 0, "".concat(vm, " is not locked to a previously generated idx."));
    }

    vm.idx = 0;
    var disconnected = Services.disconnected;

    if (disconnected) {
      invokeServiceHook(vm, disconnected);
    }

    var disconnectedCallback = vm.def.disconnectedCallback;

    if (!isUndefined(disconnectedCallback)) {
      if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'disconnectedCallback');
      }

      invokeComponentCallback(vm, disconnectedCallback);

      if (process.env.NODE_ENV !== 'production') {
        endMeasure(vm, 'disconnectedCallback');
      }
    }
  }

  function renderVM(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    if (vm.isDirty) {
      rehydrate(vm);
    }
  }

  function appendVM(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    if (vm.idx !== 0) {
      return; // already appended
    }

    addInsertionIndex(vm);
  }

  function removeVM(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    if (vm.idx === 0) {
      return; // already removed
    }

    removeInsertionIndex(vm); // just in case it comes back, with this we guarantee re-rendering it

    vm.isDirty = true;
    clearReactiveListeners(vm); // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use Custom Element APIs, we can remove this
    // because the disconnectedCallback will be triggered automatically when
    // removed from the DOM.

    patchShadowRoot(vm, []);
  }

  function createVM(tagName, elm, Ctor, options) {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(_instanceof(elm, HTMLElement), "VM creation requires a DOM element instead of ".concat(elm, "."));
    }

    var def = getComponentDef(Ctor);
    var isRoot = options.isRoot,
        mode = options.mode;
    var fallback = isTrue(options.fallback) || isFalse(isNativeShadowRootAvailable$2);

    if (fallback) {
      patchCustomElement(elm);
    }

    uid += 1;
    var vm = {
      uid: uid,
      idx: 0,
      isScheduled: false,
      isDirty: true,
      isRoot: isTrue(isRoot),
      fallback: fallback,
      mode: mode,
      def: def,
      elm: elm,
      data: EmptyObject,
      context: create(null),
      cmpProps: create(null),
      cmpTrack: create(null),
      cmpState: undefined,
      cmpSlots: fallback ? create(null) : undefined,
      cmpTemplate: undefined,
      cmpRoot: elm.attachShadow(options),
      callHook: callHook,
      setHook: setHook,
      getHook: getHook,
      component: undefined,
      children: EmptyArray,
      // used to track down all object-key pairs that makes this vm reactive
      deps: []
    };

    if (process.env.NODE_ENV !== 'production') {
      vm.toString = function () {
        return "[object:vm ".concat(def.name, " (").concat(vm.idx, ")]");
      };
    } // create component instance associated to the vm and the element


    createComponent(vm, Ctor); // link component to the wire service

    linkComponent(vm);
  }

  function rehydrate(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.isTrue(_instanceof(vm.elm, HTMLElement), "rehydration can only happen after ".concat(vm, " was patched the first time."));
    }

    if (vm.idx > 0 && vm.isDirty) {
      var children = renderComponent(vm);
      vm.isScheduled = false;
      patchShadowRoot(vm, children);
      processPostPatchCallbacks(vm);
    }
  }

  function patchErrorBoundaryVm(errorBoundaryVm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(errorBoundaryVm && "component" in errorBoundaryVm, "".concat(errorBoundaryVm, " is not a vm."));
      assert.isTrue(_instanceof(errorBoundaryVm.elm, HTMLElement), "rehydration can only happen after ".concat(errorBoundaryVm, " was patched the first time."));
      assert.isTrue(errorBoundaryVm.isDirty, "rehydration recovery should only happen if vm has updated");
    }

    var children = renderComponent(errorBoundaryVm);
    var cmpRoot = errorBoundaryVm.cmpRoot,
        oldCh = errorBoundaryVm.children;
    errorBoundaryVm.isScheduled = false;
    errorBoundaryVm.children = children; // caching the new children collection
    // patch function mutates vnodes by adding the element reference,
    // however, if patching fails it contains partial changes.
    // patch failures are caught in flushRehydrationQueue

    patchChildren(cmpRoot, oldCh, children);
    processPostPatchCallbacks(errorBoundaryVm);
  }

  function patchShadowRoot(vm, children) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var cmpRoot = vm.cmpRoot,
        oldCh = vm.children;
    vm.children = children; // caching the new children collection

    if (children.length === 0 && oldCh.length === 0) {
      return; // nothing to do here
    }

    var error;

    if (process.env.NODE_ENV !== 'production') {
      startMeasure(vm, 'patch');
    }

    try {
      // patch function mutates vnodes by adding the element reference,
      // however, if patching fails it contains partial changes.
      patchChildren(cmpRoot, oldCh, children);
    } catch (e) {
      error = Object(e);
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        endMeasure(vm, 'patch');
      }

      if (!isUndefined(error)) {
        var errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);

        if (isUndefined(errorBoundaryVm)) {
          throw error; // tslint:disable-line
        }

        recoverFromLifeCycleError(vm, errorBoundaryVm, error); // synchronously render error boundary's alternative view
        // to recover in the same tick

        if (errorBoundaryVm.isDirty) {
          patchErrorBoundaryVm(errorBoundaryVm);
        }
      }
    }
  }

  function processPostPatchCallbacks(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var rendered = Services.rendered;

    if (rendered) {
      invokeServiceHook(vm, rendered);
    }

    var renderedCallback = vm.def.renderedCallback;

    if (!isUndefined(renderedCallback)) {
      if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'renderedCallback');
      }

      invokeComponentCallback(vm, renderedCallback);

      if (process.env.NODE_ENV !== 'production') {
        endMeasure(vm, 'renderedCallback');
      }
    }
  }

  var rehydrateQueue = [];

  function flushRehydrationQueue() {
    if (process.env.NODE_ENV !== 'production') {
      assert.invariant(rehydrateQueue.length, "If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ".concat(rehydrateQueue, "."));
    }

    var vms = rehydrateQueue.sort(function (a, b) {
      return a.idx - b.idx;
    });
    rehydrateQueue = []; // reset to a new queue

    for (var _i18 = 0, len = vms.length; _i18 < len; _i18 += 1) {
      var vm = vms[_i18];

      try {
        rehydrate(vm);
      } catch (error) {
        var errorBoundaryVm = getErrorBoundaryVMFromParentElement(vm);

        if (isUndefined(errorBoundaryVm)) {
          if (_i18 + 1 < len) {
            // pieces of the queue are still pending to be rehydrated, those should have priority
            if (rehydrateQueue.length === 0) {
              addCallbackToNextTick(flushRehydrationQueue);
            }

            ArrayUnshift.apply(rehydrateQueue, ArraySlice.call(vms, _i18 + 1));
          } // rethrowing the original error will break the current tick, but since the next tick is
          // already scheduled, it should continue patching the rest.


          throw error; // tslint:disable-line
        } // we only recover if error boundary is present in the hierarchy


        recoverFromLifeCycleError(vm, errorBoundaryVm, error);

        if (errorBoundaryVm.isDirty) {
          patchErrorBoundaryVm(errorBoundaryVm);
        }
      }
    }
  }

  function recoverFromLifeCycleError(failedVm, errorBoundaryVm, error) {
    if (isUndefined(error.wcStack)) {
      error.wcStack = getComponentStack(failedVm);
    }

    resetShadowRoot(failedVm); // remove offenders

    var errorCallback = errorBoundaryVm.def.errorCallback;

    if (process.env.NODE_ENV !== 'production') {
      startMeasure(errorBoundaryVm, 'errorCallback');
    } // error boundaries must have an ErrorCallback


    invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);

    if (process.env.NODE_ENV !== 'production') {
      endMeasure(errorBoundaryVm, 'errorCallback');
    }
  }

  function forceResetShadowContent(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var parentElm = vm.fallback ? vm.elm : vm.cmpRoot;
    parentElm.innerHTML = "";
  }

  function resetShadowRoot(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var cmpRoot = vm.cmpRoot,
        oldCh = vm.children;
    vm.children = EmptyArray;

    if (oldCh.length === 0) {
      return; // optimization for the common case
    }

    try {
      // patch function mutates vnodes by adding the element reference,
      // however, if patching fails it contains partial changes.
      patchChildren(cmpRoot, oldCh, EmptyArray);
    } catch (e) {
      forceResetShadowContent(vm);
    }
  }

  function scheduleRehydration(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    if (!vm.isScheduled) {
      vm.isScheduled = true;

      if (rehydrateQueue.length === 0) {
        addCallbackToNextTick(flushRehydrationQueue);
      }

      ArrayPush.call(rehydrateQueue, vm);
    }
  }

  function getErrorBoundaryVMFromParentElement(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var elm = vm.elm; // TODO: bug #435 - shadowDOM will preventing this walking process, we
    // need to find a different way to find the right boundary

    var parentElm = elm && parentElementGetter$1.call(elm);
    return getErrorBoundaryVM(parentElm);
  }

  function getErrorBoundaryVMFromOwnElement(vm) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    var elm = vm.elm;
    return getErrorBoundaryVM(elm);
  }

  function getErrorBoundaryVM(startingElement) {
    var elm = startingElement;
    var vm;

    while (!isNull(elm)) {
      vm = getInternalField(elm, ViewModelReflection);

      if (!isUndefined(vm) && !isUndefined(vm.def.errorCallback)) {
        return vm;
      } // TODO: bug #435 - shadowDOM will preventing this walking process, we
      // need to find a different way to find the right boundary


      elm = parentElementGetter$1.call(elm);
    }
  }

  function getComponentStack(vm) {
    var wcStack = [];
    var elm = vm.elm;

    do {
      var currentVm = getInternalField(elm, ViewModelReflection);

      if (!isUndefined(currentVm)) {
        ArrayPush.call(wcStack, currentVm.component.toString());
      } // TODO: bug #435 - shadowDOM will preventing this walking process, we
      // need to find a different way to find the right boundary


      elm = parentElementGetter$1.call(elm);
    } while (!isNull(elm));

    return wcStack.reverse().join('\n\t');
  }

  function getNodeOwnerKey$1(node) {
    return node[OwnerKey$1];
  }

  function setNodeOwnerKey(node, value) {
    if (process.env.NODE_ENV !== 'production') {
      // in dev-mode, we are more restrictive about what you can do with the owner key
      defineProperty(node, OwnerKey$1, {
        value: value,
        enumerable: true,
        configurable: false,
        writable: false
      });
    } else {
      // in prod, for better perf, we just let it roll
      node[OwnerKey$1] = value;
    }
  }

  function getNodeKey$1(node) {
    return node[OwnKey$1];
  }

  function setNodeKey(node, value) {
    if (process.env.NODE_ENV !== 'production') {
      // in dev-mode, we are more restrictive about what you can do with the own key
      defineProperty(node, OwnKey$1, {
        value: value,
        enumerable: true,
        configurable: false,
        writable: false
      });
    } else {
      // in prod, for better perf, we just let it roll
      node[OwnKey$1] = value;
    }
  }

  function getShadowRootHost(sr) {
    var vm = getInternalField(sr, ViewModelReflection);

    if (isUndefined(vm)) {
      return null;
    }

    return vm.elm;
  }

  function getCustomElementVM(elm) {
    if (process.env.NODE_ENV !== 'production') {
      var vm = getInternalField(elm, ViewModelReflection);
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    return getInternalField(elm, ViewModelReflection);
  }

  function getComponentVM(component) {
    // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
    if (process.env.NODE_ENV !== 'production') {
      var vm = getInternalField(component, ViewModelReflection);
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    return getInternalField(component, ViewModelReflection);
  }

  function getShadowRootVM(root) {
    // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
    if (process.env.NODE_ENV !== 'production') {
      var vm = getInternalField(root, ViewModelReflection);
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
    }

    return getInternalField(root, ViewModelReflection);
  } // slow path routine
  // NOTE: we should probably more this routine to the faux shadow folder
  // and get the allocation to be cached by in the elm instead of in the VM


  function allocateInSlot(vm, children) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(vm && "cmpRoot" in vm, "".concat(vm, " is not a vm."));
      assert.invariant(isObject(vm.cmpSlots), "When doing manual allocation, there must be a cmpSlots object available.");
    }

    var oldSlots = vm.cmpSlots;
    var cmpSlots = vm.cmpSlots = create(null);

    for (var _i19 = 0, len = children.length; _i19 < len; _i19 += 1) {
      var vnode = children[_i19];

      if (isNull(vnode)) {
        continue;
      }

      var data = vnode.data;
      var slotName = data.attrs && data.attrs.slot || '';
      var vnodes = cmpSlots[slotName] = cmpSlots[slotName] || [];
      vnodes.push(vnode);
    }

    if (!vm.isDirty) {
      // We need to determine if the old allocation is really different from the new one
      // and mark the vm as dirty
      var oldKeys = keys(oldSlots);

      if (oldKeys.length !== keys(cmpSlots).length) {
        markComponentAsDirty(vm);
        return;
      }

      for (var _i20 = 0, _len2 = oldKeys.length; _i20 < _len2; _i20 += 1) {
        var key = oldKeys[_i20];

        if (isUndefined(cmpSlots[key]) || oldSlots[key].length !== cmpSlots[key].length) {
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
  }

  var _Node$prototype3 = Node.prototype,
      removeChild$2 = _Node$prototype3.removeChild,
      appendChild$2 = _Node$prototype3.appendChild,
      insertBefore$2 = _Node$prototype3.insertBefore,
      _replaceChild = _Node$prototype3.replaceChild;
  var ConnectingSlot = createFieldName('connecting');
  var DisconnectingSlot = createFieldName('disconnecting');

  function callNodeSlot(node, slot) {
    if (process.env.NODE_ENV !== 'production') {
      assert.isTrue(node, "callNodeSlot() should not be called for a non-object");
    }

    var fn = getInternalField(node, slot);

    if (!isUndefined(fn)) {
      fn();
    }

    return node; // for convenience
  } // monkey patching Node methods to be able to detect the insertions and removal of
  // root elements created via createElement.


  assign(Node.prototype, {
    appendChild: function appendChild(newChild) {
      var appendedNode = appendChild$2.call(this, newChild);
      return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore: function insertBefore(newChild, referenceNode) {
      var insertedNode = insertBefore$2.call(this, newChild, referenceNode);
      return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild: function removeChild(oldChild) {
      var removedNode = removeChild$2.call(this, oldChild);
      return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild: function replaceChild(newChild, oldChild) {
      var replacedNode = _replaceChild.call(this, newChild, oldChild);

      callNodeSlot(replacedNode, DisconnectingSlot);
      callNodeSlot(newChild, ConnectingSlot);
      return replacedNode;
    }
  });
  /**
   * This method is almost identical to document.createElement
   * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
   * with the slightly difference that in the options, you can pass the `is`
   * property set to a Constructor instead of just a string value. E.g.:
   *
   * const el = createElement('x-foo', { is: FooCtor });
   *
   * If the value of `is` attribute is not a constructor,
   * then it throws a TypeError.
   */

  function createElement$1(sel) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!isObject(options) || isNull(options)) {
      throw new TypeError();
    }

    var Ctor = options.is;

    if (isCircularModuleDependency(Ctor)) {
      Ctor = resolveCircularModuleDependency(Ctor);
    }

    var mode = options.mode,
        fallback = options.fallback; // TODO: for now, we default to open, but eventually it should default to 'closed'

    if (mode !== 'closed') {
      mode = 'open';
    } // TODO: for now, we default to true, but eventually it should default to false


    if (fallback !== false) {
      fallback = true;
    } // extracting the registered constructor just in case we need to force the tagName


    var _Ctor2 = Ctor,
        forceTagName = _Ctor2.forceTagName;
    var tagName = isUndefined(forceTagName) ? sel : forceTagName; // Create element with correct tagName

    var element = document.createElement(tagName);

    if (!isUndefined(getNodeKey$1(element))) {
      // There is a possibility that a custom element is registered under tagName,
      // in which case, the initialization is already carry on, and there is nothing else
      // to do here.
      return element;
    } // In case the element is not initialized already, we need to carry on the manual creation


    createVM(sel, element, Ctor, {
      mode: mode,
      fallback: fallback,
      isRoot: true
    }); // Handle insertion and removal from the DOM manually

    setInternalField(element, ConnectingSlot, function () {
      var vm = getCustomElementVM(element);
      removeVM(vm); // moving the element from one place to another is observable via life-cycle hooks

      appendVM(vm); // TODO: this is the kind of awkwardness introduced by "is" attribute
      // We don't want to do this during construction because it breaks another
      // WC invariant.

      if (!isUndefined(forceTagName)) {
        setAttribute$2.call(element, 'is', sel);
      }

      renderVM(vm);
    });
    setInternalField(element, DisconnectingSlot, function () {
      var vm = getCustomElementVM(element);
      removeVM(vm);
    });
    return element;
  } // when used with exactly one argument, we assume it is a function invocation.
  /** version: 0.24.12 */

  var style = undefined;

  var style$1 = undefined;

  var __getKey$8 = Proxy.getKey;
  var __setKey$5 = Proxy.setKey;
  var __callKey1$3 = Proxy.callKey1;
  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_dynamic = __getKey$8($api, "d"),
        api_element = __getKey$8($api, "h");

    return [api_element("div", {
      key: 1
    }, [api_dynamic(__getKey$8($cmp, "x"))])];
  }

  if (style$1) {
    __setKey$5(tmpl, "hostToken", 'x-foo_foo-host');

    __setKey$5(tmpl, "shadowToken", 'x-foo_foo');

    var style$2 = __callKey1$3(document, "createElement", 'style');

    __setKey$5(style$2, "type", 'text/css');

    __setKey$5(__getKey$8(style$2, "dataset"), "token", 'x-foo_foo');

    __setKey$5(style$2, "textContent", style$1('x-foo_foo'));

    __callKey1$3(__getKey$8(document, "head"), "appendChild", style$2);
  }

  var __setKey$6 = Proxy.setKey;
  var __callKey2$2 = Proxy.callKey2;
  var __getKey$9 = Proxy.getKey;
  var __concat = Proxy.concat;

  var Foo =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Foo, _LightningElement);

    function Foo() {
      var _getPrototypeOf2;

      var _this;

      _classCallCheck(this, Foo);

      var _temp;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey$6(args, _key, arguments[_key]);
      }

      return _possibleConstructorReturn(_this, (_temp = _this = _possibleConstructorReturn(this, __callKey2$2(__getKey$9(_getPrototypeOf2 = _getPrototypeOf(Foo), "call"), "apply", _getPrototypeOf2, __concat([this], args))), __setKey$6(_this, "x", void 0), _temp));
    }

    _createClass(Foo, [{
      key: "render",
      value: function render() {
        return tmpl;
      }
    }]);

    return Foo;
  }(LightningElement);

  __setKey$6(Foo, "publicProps", {
    x: {
      config: 0
    }
  });

  var __getKey$a = Proxy.getKey;
  var __setKey$7 = Proxy.setKey;
  var __callKey1$4 = Proxy.callKey1;
  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_custom_element = __getKey$a($api, "c"),
        api_element = __getKey$a($api, "h");

    return [api_element("div", {
      classMap: {
        "container": true
      },
      key: 2
    }, [api_custom_element("x-foo", Foo, {
      props: {
        "x": "1"
      },
      key: 1
    }, [])])];
  }

  if (style) {
    __setKey$7(tmpl$1, "hostToken", 'x-app_app-host');

    __setKey$7(tmpl$1, "shadowToken", 'x-app_app');

    var style$3 = __callKey1$4(document, "createElement", 'style');

    __setKey$7(style$3, "type", 'text/css');

    __setKey$7(__getKey$a(style$3, "dataset"), "token", 'x-app_app');

    __setKey$7(style$3, "textContent", style('x-app_app'));

    __callKey1$4(__getKey$a(document, "head"), "appendChild", style$3);
  }

  var __callKey1$5 = Proxy.callKey1;
  var __setKey$8 = Proxy.setKey;

  var App =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(App, _LightningElement);

    function App() {
      var _this;

      _classCallCheck(this, App);

      _this = _possibleConstructorReturn(this, __callKey1$5(_getPrototypeOf(App), "call", this));

      __setKey$8(_this, "list", []);

      return _this;
    }

    _createClass(App, [{
      key: "render",
      value: function render() {
        return tmpl$1;
      }
    }]);

    return App;
  }(LightningElement);

  var __callKey1$6 = Proxy.callKey1;

  var container = __callKey1$6(document, "getElementById", 'main');

  var element = createElement$1('x-app', {
    is: App
  });

  __callKey1$6(container, "appendChild", element);

}());
