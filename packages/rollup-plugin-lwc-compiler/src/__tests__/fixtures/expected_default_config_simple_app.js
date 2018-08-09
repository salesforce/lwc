(function () {
    'use strict';

    /* proxy-compat-disable */
    const StringSplit = String.prototype.split;
    const assert = {
      invariant(value, msg) {
        if (!value) {
          throw new Error(`Invariant Violation: ${msg}`);
        }
      },

      isTrue(value, msg) {
        if (!value) {
          throw new Error(`Assert Violation: ${msg}`);
        }
      },

      isFalse(value, msg) {
        if (value) {
          throw new Error(`Assert Violation: ${msg}`);
        }
      },

      fail(msg) {
        throw new Error(msg);
      },

      logError(msg) {
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

      logWarning(msg) {
        if (process.env.NODE_ENV === 'test') {
          console.warn(msg); // tslint:disable-line

          return;
        }

        try {
          throw new Error(msg);
        } catch (e) {
          const stackTraceLines = StringSplit.call(e.stack, '\n');
          console.group(`Warning: ${msg}`); // tslint:disable-line

          stackTraceLines.filter(trace => {
            // Chrome adds the error message as the first item in the stack trace
            // So we filter it out to prevent logging it twice.
            return trace.replace('Error: ', '') !== msg;
          }).forEach(trace => {
            // We need to format this as a string,
            // because Safari will detect that the string
            // is a stack trace line item and will format it as so
            console.log('%s', trace.trim()); // tslint:disable-line
          });
          console.groupEnd(); // tslint:disable-line
        }
      }

    };
    const {
      freeze,
      seal,
      keys,
      create,
      assign,
      defineProperty,
      getPrototypeOf,
      setPrototypeOf,
      getOwnPropertyDescriptor,
      getOwnPropertyNames,
      defineProperties,
      getOwnPropertySymbols,
      hasOwnProperty,
      preventExtensions,
      isExtensible
    } = Object;
    const {
      isArray
    } = Array;
    const {
      concat: ArrayConcat,
      filter: ArrayFilter,
      slice: ArraySlice,
      splice: ArraySplice,
      unshift: ArrayUnshift,
      indexOf: ArrayIndexOf,
      push: ArrayPush,
      map: ArrayMap,
      forEach,
      reduce: ArrayReduce
    } = Array.prototype;
    const {
      replace: StringReplace,
      toLowerCase: StringToLowerCase,
      indexOf: StringIndexOf,
      charCodeAt: StringCharCodeAt,
      slice: StringSlice,
      split: StringSplit$1
    } = String.prototype;

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
      return typeof obj === 'object';
    }

    function isString(obj) {
      return typeof obj === 'string';
    }

    function isNumber(obj) {
      return typeof obj === 'number';
    }

    const OtS = {}.toString;

    function toString(obj) {
      if (obj && obj.toString) {
        return obj.toString();
      } else if (typeof obj === 'object') {
        return OtS.call(obj);
      } else {
        return obj + '';
      }
    }

    function getPropertyDescriptor(o, p) {
      do {
        const d = getOwnPropertyDescriptor(o, p);

        if (!isUndefined(d)) {
          return d;
        }

        o = getPrototypeOf(o);
      } while (o !== null);
    } // These properties get added to LWCElement.prototype publicProps automatically


    const defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable', 'tabIndex']; // Few more exceptions that are using the attribute name to match the property in lowercase.
    // this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
    // and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
    // Note: this list most be in sync with the compiler as well.

    const HTMLPropertyNamesWithLowercasedReflectiveAttributes = ['accessKey', 'readOnly', 'tabIndex', 'bgColor', 'colSpan', 'rowSpan', 'contentEditable', 'dateTime', 'formAction', 'isMap', 'maxLength', 'useMap']; // this regular expression is used to transform aria props into aria attributes because
    // that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`

    const ARIA_REGEX = /^aria/; // Global Aria and Role Properties derived from ARIA and Role Attributes.
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques

    const ElementAOMPropertyNames = ['ariaAutoComplete', 'ariaChecked', 'ariaCurrent', 'ariaDisabled', 'ariaExpanded', 'ariaHasPopUp', 'ariaHidden', 'ariaInvalid', 'ariaLabel', 'ariaLevel', 'ariaMultiLine', 'ariaMultiSelectable', 'ariaOrientation', 'ariaPressed', 'ariaReadOnly', 'ariaRequired', 'ariaSelected', 'ariaSort', 'ariaValueMax', 'ariaValueMin', 'ariaValueNow', 'ariaValueText', 'ariaLive', 'ariaRelevant', 'ariaAtomic', 'ariaBusy', 'ariaActiveDescendant', 'ariaControls', 'ariaDescribedBy', 'ariaFlowTo', 'ariaLabelledBy', 'ariaOwns', 'ariaPosInSet', 'ariaSetSize', 'ariaColCount', 'ariaColIndex', 'ariaDetails', 'ariaErrorMessage', 'ariaKeyShortcuts', 'ariaModal', 'ariaPlaceholder', 'ariaRoleDescription', 'ariaRowCount', 'ariaRowIndex', 'ariaRowSpan', 'role'];
    const OffsetPropertiesError = 'This property will round the value to an integer, and it is considered an anti-pattern. Instead, you can use \`this.getBoundingClientRect()\` to obtain `left`, `top`, `right`, `bottom`, `x`, `y`, `width`, and `height` fractional values describing the overall border-box in pixels.'; // Global HTML Attributes & Properties
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
          error: `Using property "className" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property "classList".`
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
          error: `Using property or attribute "style" is an anti-pattern. Instead use property "classList".`
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
          error: `Using property or attribute "slot" is an anti-pattern.`
        }
      };
    } // TODO: complete this list with Element properties
    // https://developer.mozilla.org/en-US/docs/Web/API/Element
    // TODO: complete this list with Node properties
    // https://developer.mozilla.org/en-US/docs/Web/API/Node


    const AttrNameToPropNameMap = create(null);
    const PropNameToAttrNameMap = create(null); // Synthetic creation of all AOM property descriptors for Custom Elements

    forEach.call(ElementAOMPropertyNames, propName => {
      const attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
      AttrNameToPropNameMap[attrName] = propName;
      PropNameToAttrNameMap[propName] = attrName;
    });
    forEach.call(defaultDefHTMLPropertyNames, propName => {
      const attrName = StringToLowerCase.call(propName);
      AttrNameToPropNameMap[attrName] = propName;
      PropNameToAttrNameMap[propName] = attrName;
    });
    forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, propName => {
      const attrName = StringToLowerCase.call(propName);
      AttrNameToPropNameMap[attrName] = propName;
      PropNameToAttrNameMap[propName] = attrName;
    });
    const CAMEL_REGEX = /-([a-z])/g;
    /**
     * This method maps between attribute names
     * and the corresponding property name.
     */

    function getPropNameFromAttrName(attrName) {
      if (isUndefined(AttrNameToPropNameMap[attrName])) {
        AttrNameToPropNameMap[attrName] = StringReplace.call(attrName, CAMEL_REGEX, g => g[1].toUpperCase());
      }

      return AttrNameToPropNameMap[attrName];
    }

    const CAPS_REGEX = /[A-Z]/g;
    /**
     * This method maps between property names
     * and the corresponding attribute name.
     */

    function getAttrNameFromPropName(propName) {
      if (isUndefined(PropNameToAttrNameMap[propName])) {
        PropNameToAttrNameMap[propName] = StringReplace.call(propName, CAPS_REGEX, match => '-' + match.toLowerCase());
      }

      return PropNameToAttrNameMap[propName];
    }

    function decorate(Ctor, decorators) {
      // intentionally comparing decorators with null and undefined
      if (!isFunction(Ctor) || decorators == null) {
        throw new TypeError();
      }

      const props = getOwnPropertyNames(decorators); // intentionally allowing decoration of classes only for now

      const target = Ctor.prototype;

      for (let i = 0, len = props.length; i < len; i += 1) {
        const propName = props[i];
        const decorator = decorators[propName];

        if (!isFunction(decorator)) {
          throw new TypeError();
        }

        const originalDescriptor = getOwnPropertyDescriptor(target, propName);
        const descriptor = decorator(Ctor, propName, originalDescriptor);

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
      return typeof Symbol() === 'symbol' ? Symbol(key) : `$$lwc-${key}$$`;
    }

    function setInternalField(o, fieldName, value) {
      // TODO: improve this to use  or a WeakMap
      if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the internal fields
        defineProperty(o, fieldName, {
          value,
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

    let nextTickCallbackQueue = [];
    const SPACE_CHAR = 32;
    const EmptyObject = seal(create(null));
    const EmptyArray = seal([]);
    const ViewModelReflection = createFieldName('ViewModel');
    const PatchedFlag = createFieldName('PatchedFlag');

    function flushCallbackQueue() {
      if (process.env.NODE_ENV !== 'production') {
        if (nextTickCallbackQueue.length === 0) {
          throw new Error(`Internal Error: If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue.`);
        }
      }

      const callbacks = nextTickCallbackQueue;
      nextTickCallbackQueue = []; // reset to a new queue

      for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
      }
    }

    function addCallbackToNextTick(callback) {
      if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(callback)) {
          throw new Error(`Internal Error: addCallbackToNextTick() can only accept a function callback`);
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
          throw new ReferenceError(`Circular module dependency must be a function.`);
        }
      }

      return fn();
    }

    const {
      DOCUMENT_POSITION_CONTAINED_BY,
      DOCUMENT_POSITION_CONTAINS
    } = Node;
    const {
      insertBefore,
      removeChild,
      appendChild,
      compareDocumentPosition
    } = Node.prototype;
    /**
     * Returns the context shadow included root.
     */

    function findShadowRoot(node) {
      const initialParent = parentNodeGetter.call(node); // We need to ensure that the parent element is present before accessing it.

      if (isNull(initialParent)) {
        return node;
      } // In the case of LWC, the root and the host element are the same things. Therefor,
      // when calling findShadowRoot on the a host element we want to return the parent host
      // element and not the current host element.


      node = initialParent;
      let nodeParent;

      while (!isNull(nodeParent = parentNodeGetter.call(node)) && isUndefined(getNodeKey(node))) {
        node = nodeParent;
      }

      return node;
    }

    function findComposedRootNode(node) {
      let nodeParent;

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
      const composed = isUndefined(options) ? false : !!options.composed;
      return isTrue(composed) ? findComposedRootNode(this) : findShadowRoot(this);
    }

    const textContextSetter = getOwnPropertyDescriptor(Node.prototype, 'textContent').set;
    const parentNodeGetter = getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;
    const parentElementGetter = hasOwnProperty.call(Node.prototype, 'parentElement') ? getOwnPropertyDescriptor(Node.prototype, 'parentElement').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement').get; // IE11

    const childNodesGetter = hasOwnProperty.call(Node.prototype, 'childNodes') ? getOwnPropertyDescriptor(Node.prototype, 'childNodes').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes').get; // IE11
    // DO NOT CHANGE this:
    // these two values need to be in sync with framework/vm.ts

    const OwnerKey = '$$OwnerKey$$';
    const OwnKey = '$$OwnKey$$';

    function getNodeOwnerKey(node) {
      return node[OwnerKey];
    }

    function getNodeKey(node) {
      return node[OwnKey];
    }

    const {
      addEventListener,
      removeEventListener,
      getAttribute,
      getAttributeNS,
      setAttribute,
      setAttributeNS,
      removeAttribute,
      removeAttributeNS,
      querySelector,
      querySelectorAll
    } = Element.prototype;
    const innerHTMLSetter = hasOwnProperty.call(Element.prototype, 'innerHTML') ? getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set : getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML').set; // IE11

    const tagNameGetter = getOwnPropertyDescriptor(Element.prototype, 'tagName').get;

    function wrapIframeWindow(win) {
      return {
        postMessage() {
          return win.postMessage.apply(win, arguments);
        },

        blur() {
          return win.blur.apply(win, arguments);
        },

        close() {
          return win.close.apply(win, arguments);
        },

        focus() {
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

    const proxies = new WeakMap(); // We ONLY want to have DOM nodes and DOM methods
    // going into the traverse membrane. This check is
    // a little too broad, because any function that passes
    // through here will be inserted into the membrane,
    // but the only case where this would happen would be:
    // node()(), so this should be sufficient for now.

    function isReplicable(value) {
      return value instanceof Node || isFunction(value);
    }

    const traverseMembraneHandler = {
      get(originalTarget, key) {
        if (key === TargetSlot) {
          return originalTarget;
        }

        if (!isFunction(originalTarget)) {
          let descriptors = NodePatchDescriptors$1;

          if (originalTarget instanceof Element) {
            const tagName = tagNameGetter.call(originalTarget);

            switch (tagName) {
              case 'SLOT':
                // slot
                descriptors = SlotPatchDescriptors;
                break;

              default:
                // element
                descriptors = ElementPatchDescriptors;
            }
          }

          if (hasOwnProperty.call(descriptors, key)) {
            const descriptor = descriptors[key];

            if (hasOwnProperty.call(descriptor, 'value')) {
              return wrap(descriptor.value);
            } else {
              return descriptor.get.call(originalTarget);
            }
          }
        }

        return wrap(originalTarget[key]);
      },

      set(originalTarget, key, value) {
        if (key === TargetSlot) {
          return false;
        }

        originalTarget[key] = unwrap(value);
        return true;
      },

      apply(originalTarget, thisArg, args) {
        const unwrappedContext = unwrap(thisArg);
        const unwrappedArgs = ArrayMap.call(args, arg => unwrap(arg));
        const value = originalTarget.apply(unwrappedContext, unwrappedArgs);
        return wrap(value);
      }

    };
    const TargetSlot = createFieldName('targetSlot'); // TODO: we are using a funky and leaky abstraction here to try to identify if
    // the proxy is a compat proxy, and define the unwrap method accordingly.
    // @ts-ignore: getting getKey from Proxy intrinsic

    const {
      getKey: ProxyGetKey
    } = Proxy;
    const getKey = ProxyGetKey ? ProxyGetKey : (o, key) => o[key];

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

      const unwrapped = unwrap(value);

      if (!isReplicable(unwrapped)) {
        return unwrapped;
      }

      const r = proxies.get(unwrapped);

      if (r) {
        return r;
      }

      const proxy = new Proxy(unwrapped, traverseMembraneHandler);
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
      let s = '';
      const childNodes = getFilteredChildNodes(node);

      for (let i = 0, len = childNodes.length; i < len; i += 1) {
        s += getOuterHTML(childNodes[i]);
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


    const escapeAttrRegExp = /[&\u00A0"]/g;
    const escapeDataRegExp = /[&\u00A0<>]/g;
    const {
      replace,
      toLowerCase
    } = String.prototype;

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

        case '\u00A0':
          return '&nbsp;';
      }
    }

    function escapeAttr(s) {
      return replace.call(s, escapeAttrRegExp, escapeReplace);
    }

    function escapeData(s) {
      return replace.call(s, escapeDataRegExp, escapeReplace);
    } // http://www.whatwg.org/specs/web-apps/current-work/#void-elements


    const voidElements = new Set(['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']);
    const plaintextParents = new Set(['STYLE', 'SCRIPT', 'XMP', 'IFRAME', 'NOEMBED', 'NOFRAMES', 'PLAINTEXT', 'NOSCRIPT']);

    function getOuterHTML(node) {
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          {
            const {
              tagName,
              attributes: attrs
            } = node;
            let s = '<' + toLowerCase.call(tagName);

            for (let i = 0, attr; attr = attrs[i]; i++) {
              s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
            }

            s += '>';

            if (voidElements.has(tagName)) {
              return s;
            }

            return s + getInnerHTML(node) + '</' + toLowerCase.call(tagName) + '>';
          }

        case Node.TEXT_NODE:
          {
            const {
              data,
              parentNode
            } = node;

            if (parentNode !== null && plaintextParents.has(parentNode.tagName)) {
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
          const childNodes = getFilteredChildNodes(node);
          let content = '';

          for (let i = 0, len = childNodes.length; i < len; i += 1) {
            content += getTextContent(childNodes[i]);
          }

          return content;

        default:
          return node.nodeValue;
      }
    } // This is only needed in this polyfill because we closed the ability
    // this regular expression is used to transform aria props into aria attributes because
    // that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`


    const ARIA_REGEX$1 = /^aria/;
    const CAMEL_REGEX$1 = /-([a-z])/g; // Global Aria and Role Properties derived from ARIA and Role Attributes.
    // https://wicg.github.io/aom/spec/aria-reflection.html

    const ElementPrototypeAriaPropertyNames = ['ariaAutoComplete', 'ariaChecked', 'ariaCurrent', 'ariaDisabled', 'ariaExpanded', 'ariaHasPopUp', 'ariaHidden', 'ariaInvalid', 'ariaLabel', 'ariaLevel', 'ariaMultiLine', 'ariaMultiSelectable', 'ariaOrientation', 'ariaPressed', 'ariaReadOnly', 'ariaRequired', 'ariaSelected', 'ariaSort', 'ariaValueMax', 'ariaValueMin', 'ariaValueNow', 'ariaValueText', 'ariaLive', 'ariaRelevant', 'ariaAtomic', 'ariaBusy', 'ariaActiveDescendant', 'ariaControls', 'ariaDescribedBy', 'ariaFlowTo', 'ariaLabelledBy', 'ariaOwns', 'ariaPosInSet', 'ariaSetSize', 'ariaColCount', 'ariaColIndex', 'ariaDetails', 'ariaErrorMessage', 'ariaKeyShortcuts', 'ariaModal', 'ariaPlaceholder', 'ariaRoleDescription', 'ariaRowCount', 'ariaRowIndex', 'ariaRowSpan', 'role'];
    const nodeToAriaPropertyValuesMap = new WeakMap();
    const {
      hasOwnProperty: hasOwnProperty$1
    } = Object.prototype;
    const {
      setAttribute: setAttribute$1,
      removeAttribute: removeAttribute$1,
      getAttribute: getAttribute$1
    } = Element.prototype;
    const isNativeShadowRootAvailable = typeof window.ShadowRoot !== "undefined";
    const {
      replace: StringReplace$1,
      toLowerCase: StringToLowerCase$1,
      toUpperCase: StringToUpperCase
    } = String.prototype;

    function getAriaPropertyMap(elm) {
      let map = nodeToAriaPropertyValuesMap.get(elm);

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
      return !(elmOrShadow instanceof Element) && 'host' in elmOrShadow;
    }

    function isSignedCustomElement(elmOrShadow) {
      return !isShadowRoot(elmOrShadow) && getNodeKey$1(elmOrShadow) !== undefined;
    }

    function getNormalizedAriaPropertyValue(propName, value) {
      return value == null ? null : value + '';
    }

    function patchCustomElementAttributeMethods(elm) {
      const {
        setAttribute: originalSetAttribute,
        removeAttribute: originalRemoveAttribute
      } = elm;
      Object.defineProperties(elm, {
        removeAttribute: {
          value(attrName) {
            const propName = StringReplace$1.call(attrName, CAMEL_REGEX$1, g => StringToUpperCase.call(g[1]));
            let newValue = null;

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
        get() {
          const node = this;

          if (isSignedCustomElement(node)) {
            const map = getAriaPropertyMap(node);

            if (hasOwnProperty$1.call(map.host, propName)) {
              return map.host[propName];
            } else if (hasOwnProperty$1.call(map.sr, propName)) {
              return null;
            }
          } else if (isShadowRoot(node)) {
            // supporting regular custom elements and LWC
            const host = getShadowRootHost(node) || node.host;
            const map = getAriaPropertyMap(host);
            return hasOwnProperty$1.call(map, propName) ? map[propName] : null;
          } // regular html elements are just going to reflect what's in the attribute


          return getAttribute$1.call(node, attrName);
        },

        set(newValue) {
          const node = this;
          newValue = getNormalizedAriaPropertyValue(propName, newValue);

          if (isSignedCustomElement(node)) {
            const map = getAriaPropertyMap(node);
            map.host[propName] = newValue;

            if (newValue === null && hasOwnProperty$1.call(map.sr, propName) && map.sr[propName] !== null) {
              newValue = map.sr[propName]; // falling back to the shadow root's value
            }
          } else if (isShadowRoot(node)) {
            // supporting regular custom elements and LWC
            const host = getShadowRootHost(node) || node.host;
            const map = getAriaPropertyMap(host);
            map.sr[propName] = newValue;

            if (!hasOwnProperty$1.call(map.host, propName) || map.host[propName] === null) {
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

    const descriptors = {};

    function patch() {
      for (let i = 0, len = ElementPrototypeAriaPropertyNames.length; i < len; i += 1) {
        const propName = ElementPrototypeAriaPropertyNames[i];

        if (Object.getOwnPropertyDescriptor(Element.prototype, propName) === undefined) {
          const attrName = StringToLowerCase$1.call(StringReplace$1.call(propName, ARIA_REGEX$1, 'aria-'));
          descriptors[propName] = createAriaPropertyPropertyDescriptor(propName, attrName, null);
        }
      }

      Object.defineProperties(Element.prototype, descriptors);

      if (isNativeShadowRootAvailable) {
        Object.defineProperties(window.ShadowRoot.prototype, descriptors);
      }
    }

    let ArtificialShadowRootPrototype;
    const HostKey = createFieldName('host');
    const ShadowRootKey = createFieldName('shadowRoot');
    const isNativeShadowRootAvailable$1 = typeof window.ShadowRoot !== "undefined";

    function getHost(root) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(root[HostKey], `A 'ShadowRoot' node must be attached to an 'HTMLElement' node.`);
      }

      return root[HostKey];
    }

    function getShadowRoot(elm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(getInternalField(elm, ShadowRootKey), `A Custom Element with a shadow attached must be provided as the first argument.`);
      }

      return getInternalField(elm, ShadowRootKey);
    } // Synthetic creation of all AOM property descriptors for Shadow Roots


    function createShadowRootAOMDescriptorMap() {
      return ArrayReduce.call(ElementPrototypeAriaPropertyNames, (seed, propName) => {
        let descriptor;

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
        throw new Error(`Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`);
      }

      const {
        mode
      } = options;

      if (isUndefined(ArtificialShadowRootPrototype)) {
        // Adding AOM properties to the faux shadow root prototype
        // Note: lazy creation to avoid circular deps
        assign(ArtificialShadowRootDescriptors, createShadowRootAOMDescriptorMap());
        ArtificialShadowRootPrototype = create(null, ArtificialShadowRootDescriptors);
      }

      const sr = create(ArtificialShadowRootPrototype, {
        mode: {
          get() {
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
      const {
        childNodes
      } = this;
      return childNodes[0] || null;
    }

    function patchedShadowRootLastChildGetter() {
      const {
        childNodes
      } = this;
      return childNodes[childNodes.length - 1] || null;
    }

    function patchedShadowRootInnerHTMLGetter() {
      const {
        childNodes
      } = this;
      let innerHTML = '';

      for (let i = 0, len = childNodes.length; i < len; i += 1) {
        innerHTML += getInnerHTML(childNodes[i]);
      }

      return innerHTML;
    }

    function patchedShadowRootTextContentGetter() {
      const {
        childNodes
      } = this;
      let textContent = '';

      for (let i = 0, len = childNodes.length; i < len; i += 1) {
        textContent += getTextContent(childNodes[i]);
      }

      return textContent;
    }

    function hostGetter() {
      return getHost(this);
    }

    const ArtificialShadowRootDescriptors = {
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
        value() {
          return this.childNodes.length > 0;
        },

        enumerable: true,
        configurable: true
      },
      querySelector: {
        value(selector) {
          const node = shadowRootQuerySelector(this, selector);

          if (process.env.NODE_ENV !== 'production') {
            const host = getHost(this);
            const isRoot = isUndefined(getNodeKey(host));

            if (isNull(node) && !isRoot) {
              // note: we don't show errors for root elements since their light dom is always empty in fallback mode
              if (getPatchedCustomElement(host).querySelector(selector)) {
                assert.logWarning(`this.template.querySelector() can only return elements from the template declaration of ${toString(host)}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
              }
            }
          }

          return node;
        },

        enumerable: true,
        configurable: true
      },
      querySelectorAll: {
        value(selector) {
          const nodeList = shadowRootQuerySelectorAll(this, selector);

          if (process.env.NODE_ENV !== 'production') {
            const host = getHost(this);
            const isRoot = isUndefined(getNodeKey(host));

            if (nodeList.length === 0 && !isRoot) {
              // note: we don't show errors for root elements since their light dom is always empty in fallback mode
              if (getPatchedCustomElement(host).querySelector(selector)) {
                assert.logWarning(`this.template.querySelectorAll() can only return elements from template declaration of ${toString(host)}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
              }
            }
          }

          return nodeList;
        },

        enumerable: true,
        configurable: true
      },
      addEventListener: {
        value(type, listener, options) {
          addShadowRootEventListener(this, type, listener, options);
        },

        enumerable: true,
        configurable: true
      },
      removeEventListener: {
        value(type, listener, options) {
          removeShadowRootEventListener(this, type, listener, options);
        },

        enumerable: true,
        configurable: true
      },
      compareDocumentPosition: {
        value(otherNode) {
          // this API might be called with proxies
          otherNode = unwrap(otherNode);
          const host = getHost(this);

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
        value(otherNode) {
          // this API might be called with proxies
          otherNode = unwrap(otherNode);
          const host = getHost(this); // must be child of the host and owned by it.

          return (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 && isNodeOwnedBy(host, otherNode);
        },

        enumerable: true,
        configurable: true
      },
      toString: {
        value() {
          return `[object ShadowRoot]`;
        }

      }
    };

    function getPatchedCustomElement(element) {
      return wrap(element);
    }

    const iFrameContentWindowGetter = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow').get;

    function getNodeOwner(node) {
      if (!(node instanceof Node)) {
        return null;
      }

      let ownerKey; // search for the first element with owner identity (just in case of manually inserted elements)

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
        assert.invariant(node instanceof Node && owner instanceof HTMLElement, `isNodeOwnedByVM() should be called with a node as the second argument instead of ${node}`);
        assert.isTrue(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${owner}`);
      }

      const ownerKey = getNodeOwnerKey(node);
      return isUndefined(ownerKey) || getNodeKey(owner) === ownerKey;
    }

    function getShadowParent(node, value) {
      const owner = getNodeOwner(node);

      if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner);
      } else if (value instanceof Element && getNodeOwnerKey(node) === getNodeOwnerKey(value)) {
        // cutting out access to something outside of the shadow of the current target (usually slots)
        return patchShadowDomTraversalMethods(value);
      }

      return null;
    }

    function parentNodeDescriptorValue() {
      const value = parentNodeGetter.call(this);

      if (isNull(value)) {
        return value;
      }

      return getShadowParent(this, value);
    }

    function parentElementDescriptorValue() {
      const parentNode = parentNodeDescriptorValue.call(this);
      const ownerShadow = getShadowRoot(getNodeOwner(this)); // If we have traversed to the host element,
      // we need to return null

      if (ownerShadow === parentNode) {
        return null;
      }

      return parentNode;
    }

    function shadowRootChildNodes(root) {
      const elm = getHost(root);
      return getAllMatches(elm, childNodesGetter.call(elm));
    }

    function getAllMatches(owner, nodeList) {
      const filteredAndPatched = [];

      for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        const isOwned = isNodeOwnedBy(owner, node);

        if (isOwned) {
          // Patch querySelector, querySelectorAll, etc
          // if element is owned by VM
          ArrayPush.call(filteredAndPatched, patchShadowDomTraversalMethods(node));
        }
      }

      return filteredAndPatched;
    }

    function getFirstMatch(owner, nodeList) {
      for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedBy(owner, nodeList[i])) {
          return patchShadowDomTraversalMethods(nodeList[i]);
        }
      }

      return null;
    }

    function lightDomQuerySelectorAll(elm, selector) {
      const owner = getNodeOwner(elm);

      if (isNull(owner)) {
        return [];
      }

      const matches = querySelectorAll.call(elm, selector);
      return getAllMatches(owner, matches);
    }

    function lightDomQuerySelector(elm, selector) {
      const owner = getNodeOwner(elm);

      if (isNull(owner)) {
        return null;
      }

      const nodeList = querySelectorAll.call(elm, selector);
      return getFirstMatch(owner, nodeList);
    }

    function lightDomQuerySelectorAllValue(selector) {
      return lightDomQuerySelectorAll(this, selector);
    }

    function lightDomQuerySelectorValue(selector) {
      return lightDomQuerySelector(this, selector);
    }

    function shadowRootQuerySelector(root, selector) {
      const elm = getHost(root);
      const nodeList = querySelectorAll.call(elm, selector);
      return getFirstMatch(elm, nodeList);
    }

    function shadowRootQuerySelectorAll(root, selector) {
      const elm = getHost(root);
      const nodeList = querySelectorAll.call(elm, selector);
      return getAllMatches(elm, nodeList);
    }

    function getFilteredSlotAssignedNodes(slot) {
      const owner = getNodeOwner(slot);

      if (isNull(owner)) {
        return [];
      }

      return ArrayReduce.call(childNodesGetter.call(slot), (seed, child) => {
        if (!isNodeOwnedBy(owner, child)) {
          ArrayPush.call(seed, child);
        }

        return seed;
      }, []);
    }

    function getFilteredSlotFlattenNodes(slot) {
      return ArrayReduce.call(childNodesGetter.call(slot), (seed, child) => {
        if (child instanceof Element && tagNameGetter.call(child) === 'SLOT') {
          ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child));
        } else {
          ArrayPush.call(seed, child);
        }

        return seed;
      }, []);
    }

    function getFilteredChildNodes(node) {
      let children;

      if (!isUndefined(getNodeKey(node))) {
        // node itself is a custom element
        // lwc element, in which case we need to get only the nodes
        // that were slotted
        const slots = querySelectorAll.call(node, 'slot');
        children = ArrayReduce.call(slots, (seed, slot) => {
          if (isNodeOwnedBy(node, slot)) {
            ArrayPush.apply(seed, getFilteredSlotAssignedNodes(slot));
          }

          return seed;
        }, []);
      } else {
        // regular element
        children = childNodesGetter.call(node);
      }

      const owner = getNodeOwner(node);

      if (isNull(owner)) {
        return [];
      }

      return ArrayReduce.call(children, (seed, child) => {
        if (isNodeOwnedBy(owner, child)) {
          ArrayPush.call(seed, child);
        }

        return seed;
      }, []);
    }

    function lightDomChildNodesGetter() {
      if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`childNodes on ${toString(this)} returns a live NodeList which is not stable. Use querySelectorAll instead.`);
      }

      const owner = getNodeOwner(this);

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
      const parentNode = parentNodeGetter.call(this);
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
      const flatten = !isUndefined(options) && isTrue(options.flatten);
      const nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
      return ArrayMap.call(nodes, patchShadowDomTraversalMethods);
    }

    function slotAssignedElementsValue(options) {
      const flatten = !isUndefined(options) && isTrue(options.flatten);
      const nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
      const elements = ArrayFilter.call(nodes, node => node instanceof Element);
      return ArrayMap.call(elements, patchShadowDomTraversalMethods);
    }

    function slotNameGetter() {
      const name = getAttribute.call(this, 'name');
      return isNull(name) ? '' : name;
    }

    const NodePatchDescriptors$1 = {
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
    const ElementPatchDescriptors = assign(create(null), NodePatchDescriptors$1, {
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
    const SlotPatchDescriptors = assign(create(null), ElementPatchDescriptors, {
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
    const contentWindowDescriptor = {
      get() {
        const original = iFrameContentWindowGetter.call(this);

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
      if (isFalse(nodeIsPatched(node)) && node instanceof Element) {
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

    const eventToContextMap = new WeakMap();

    function isChildNode(root, node) {
      return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
    }

    const eventTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'target').get;
    const eventCurrentTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'currentTarget').get;
    const GET_ROOT_NODE_CONFIG_FALSE = {
      composed: false
    };
    const EventPatchDescriptors = {
      currentTarget: {
        get() {
          const currentTarget = eventCurrentTargetGetter.call(this);

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
        get() {
          const currentTarget = eventCurrentTargetGetter.call(this);
          const originalTarget = eventTargetGetter.call(this); // Handle cases where the currentTarget is null (for async events)
          // and when currentTarget is window.

          if (!(currentTarget instanceof Node)) {
            // the event was inspected asynchronously, in which case we need to return the
            // top custom element the belongs to the body.
            let outerMostElement = originalTarget;
            let parentNode;

            while ((parentNode = parentNodeGetter.call(outerMostElement)) && !isUndefined(getNodeOwnerKey(outerMostElement))) {
              outerMostElement = parentNode;
            } // This value will always be the root LWC node.
            // There is a chance that this value will be accessed
            // inside of an async event handler in the component tree,
            // but because we don't know if it is being accessed
            // inside the tree or outside the tree, we do not patch.


            return outerMostElement;
          }

          const eventContext = eventToContextMap.get(this); // Executing event listener on component, target is always currentTarget

          if (eventContext === EventListenerContext.CUSTOM_ELEMENT_LISTENER) {
            return patchShadowDomTraversalMethods(currentTarget);
          }

          const currentTargetRootNode = getRootNode.call(currentTarget, GET_ROOT_NODE_CONFIG_FALSE); // x-child
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

          const myCurrentShadowKey = eventContext === EventListenerContext.SHADOW_ROOT_LISTENER ? getNodeKey(currentTarget) : getNodeOwnerKey(currentTarget); // Determine Number 2:
          // The easy part: The VM context owner is always the event's currentTarget OwnerKey:
          // NOTE: if the current target is the shadow root, the way we collect the Context owner's key is different because
          //       currentTargetRootNode is both: shadow root and custom element.

          const myOwnerKey = eventContext === EventListenerContext.SHADOW_ROOT_LISTENER ? getNodeKey(currentTargetRootNode) : getNodeOwnerKey(currentTargetRootNode); // Determining Number 3:
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

          let closestTarget = originalTarget;

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

    const customElementToWrappedListeners = new WeakMap();

    function getEventMap(elm) {
      let listenerInfo = customElementToWrappedListeners.get(elm);

      if (isUndefined(listenerInfo)) {
        listenerInfo = create(null);
        customElementToWrappedListeners.set(elm, listenerInfo);
      }

      return listenerInfo;
    }

    const shadowRootEventListenerMap = new WeakMap();

    function getWrappedShadowRootListener(sr, listener) {
      if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
      }

      let shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);

      if (isUndefined(shadowRootWrappedListener)) {
        shadowRootWrappedListener = function (event) {
          // * if the event is dispatched directly on the host, it is not observable from root
          // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
          //   it is not observable from the root
          const {
            composed
          } = event;
          const target = eventTargetGetter.call(event);
          const currentTarget = eventCurrentTargetGetter.call(event);

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

    const customElementEventListenerMap = new WeakMap();

    function getWrappedCustomElementListener(elm, listener) {
      if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
      }

      let customElementWrappedListener = customElementEventListenerMap.get(listener);

      if (isUndefined(customElementWrappedListener)) {
        customElementWrappedListener = function (event) {
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
      let interrupted = false;
      const {
        type,
        stopImmediatePropagation
      } = evt;
      const currentTarget = eventCurrentTargetGetter.call(evt);
      const listenerMap = getEventMap(currentTarget);
      const listeners = listenerMap[type]; // it must have listeners at this point

      const len = listeners.length;

      evt.stopImmediatePropagation = function () {
        interrupted = true;
        stopImmediatePropagation.call(evt);
      };

      patchEvent(evt);
      eventToContextMap.set(evt, EventListenerContext.SHADOW_ROOT_LISTENER);

      for (let i = 0; i < len; i += 1) {
        if (listeners[i].placement === EventListenerContext.SHADOW_ROOT_LISTENER) {
          // all handlers on the custom element should be called with undefined 'this'
          listeners[i].call(undefined, evt);

          if (interrupted) {
            return;
          }
        }
      }

      eventToContextMap.set(evt, EventListenerContext.CUSTOM_ELEMENT_LISTENER);

      for (let i = 0; i < len; i += 1) {
        if (listeners[i].placement === EventListenerContext.CUSTOM_ELEMENT_LISTENER) {
          // all handlers on the custom element should be called with undefined 'this'
          listeners[i].call(undefined, evt);

          if (interrupted) {
            return;
          }
        }
      }

      eventToContextMap.set(evt, 0);
    }

    function attachDOMListener(elm, type, wrappedListener) {
      const listenerMap = getEventMap(elm);
      let cmpEventHandlers = listenerMap[type];

      if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = listenerMap[type] = [];
      } // only add to DOM if there is no other listener on the same placement yet


      if (cmpEventHandlers.length === 0) {
        addEventListener.call(elm, type, domListener);
      } else if (process.env.NODE_ENV !== 'production') {
        if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
          assert.logWarning(`${toString(elm)} has duplicate listener ${wrappedListener.original} for event "${type}". Instead add the event listener in the connectedCallback() hook.`);
        }
      }

      ArrayPush.call(cmpEventHandlers, wrappedListener);
    }

    function detachDOMListener(elm, type, wrappedListener) {
      const listenerMap = getEventMap(elm);
      let p;
      let listeners;

      if (!isUndefined(listeners = listenerMap[type]) && (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1) {
        ArraySplice.call(listeners, p, 1); // only remove from DOM if there is no other listener on the same placement

        if (listeners.length === 0) {
          removeEventListener.call(elm, type, domListener);
        }
      } else if (process.env.NODE_ENV !== 'production') {
        assert.logError(`Did not find event listener ${wrappedListener.original} for event "${type}" on ${toString(elm)}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
      }
    }

    const NON_COMPOSED = {
      composed: false
    };

    function isValidEventForCustomElement(event) {
      const target = eventTargetGetter.call(event);
      const currentTarget = eventCurrentTargetGetter.call(event);
      const {
        composed
      } = event;
      return (// it is composed, and we should always get it, or
        composed === true || // it is dispatched onto the custom element directly, or
        target === currentTarget || // it is coming from an slotted element
        isChildNode(getRootNode.call(target, NON_COMPOSED), currentTarget)
      );
    }

    function addCustomElementEventListener(elm, type, listener, options) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${toString(elm)} for event "${type}". Expected an EventListener but received ${listener}.`); // TODO: issue #420
        // this is triggered when the component author attempts to add a listener programmatically into a lighting element node

        if (!isUndefined(options)) {
          assert.logWarning(`The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed: ${toString(options)} in ${toString(elm)}`);
        }
      }

      const wrappedListener = getWrappedCustomElementListener(elm, listener);
      attachDOMListener(elm, type, wrappedListener);
    }

    function removeCustomElementEventListener(elm, type, listener, options) {
      const wrappedListener = getWrappedCustomElementListener(elm, listener);
      detachDOMListener(elm, type, wrappedListener);
    }

    function addShadowRootEventListener(sr, type, listener, options) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${toString(sr)} for event "${type}". Expected an EventListener but received ${listener}.`); // TODO: issue #420
        // this is triggered when the component author attempts to add a listener programmatically into its Component's shadow root

        if (!isUndefined(options)) {
          assert.logWarning(`The 'addEventListener' method in 'ShadowRoot' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed: ${toString(options)} in ${toString(sr)}`);
        }
      }

      const elm = getHost(sr);
      const wrappedListener = getWrappedShadowRootListener(sr, listener);
      attachDOMListener(elm, type, wrappedListener);
    }

    function removeShadowRootEventListener(sr, type, listener, options) {
      const elm = getHost(sr);
      const wrappedListener = getWrappedShadowRootListener(sr, listener);
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

    const CustomElementPatchDescriptors = {
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

    const CHAR_S = 115;
    const CHAR_V = 118;
    const CHAR_G = 103;
    const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
    const SymbolIterator = Symbol.iterator;
    const {
      ELEMENT_NODE,
      TEXT_NODE,
      COMMENT_NODE
    } = Node;
    const classNameToClassMap = create(null);

    function getMapFromClassName(className) {
      if (className === undefined) {
        return;
      }

      let map = classNameToClassMap[className];

      if (map) {
        return map;
      }

      map = {};
      let start = 0;
      let o;
      const len = className.length;

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


    const hook = {
      postpatch(oldVNode, vnode) {
        const vm = getCustomElementVM(vnode.elm);
        renderVM(vm);
      },

      insert(vnode) {
        const vm = getCustomElementVM(vnode.elm);
        appendVM(vm);
        renderVM(vm);
      },

      create(oldVNode, vnode) {
        const {
          fallback,
          mode,
          ctor
        } = vnode.data;
        const elm = vnode.elm;

        if (hasOwnProperty.call(elm, ViewModelReflection)) {
          // There is a possibility that a custom element is registered under tagName,
          // in which case, the initialization is already carry on, and there is nothing else
          // to do here since this hook is called right after invoking `document.createElement`.
          return;
        }

        createVM(vnode.sel, elm, ctor, {
          mode,
          fallback
        });
        const vm = getCustomElementVM(elm);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
        }

        if (isTrue(vm.fallback)) {
          // slow path
          const children = vnode.children;
          allocateInSlot(vm, children); // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!

          vnode.children = EmptyArray;
        }
      },

      update(oldVNode, vnode) {
        const vm = getCustomElementVM(vnode.elm);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
        }

        if (isTrue(vm.fallback)) {
          // slow path
          const children = vnode.children;
          allocateInSlot(vm, children); // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!

          vnode.children = EmptyArray;
        }
      },

      destroy(vnode) {
        removeVM(getCustomElementVM(vnode.elm));
      }

    };

    function isVElement(vnode) {
      return vnode.nt === ELEMENT_NODE;
    }

    function addNS(vnode) {
      const {
        data,
        children,
        sel
      } = vnode; // TODO: review why `sel` equal `foreignObject` should get this `ns`

      data.ns = NamespaceAttributeForSVG;

      if (isArray(children) && sel !== 'foreignObject') {
        for (let j = 0, n = children.length; j < n; ++j) {
          const childNode = children[j];

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
        assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
        assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
        assert.isTrue('key' in data || !!data.key, ` <${sel}> "key" attribute is invalid or missing for ${vmBeingRendered}. Key inside iterator is either undefined or null.`); // checking reserved internal data properties

        assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling h().`);
        assert.isFalse(data.className && data.classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
        assert.isFalse(data.styleMap && data.style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);

        if (data.style && !isString(data.style)) {
          assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }

        forEach.call(children, childVnode => {
          if (childVnode != null) {
            assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode && "nt" in childVnode, `${childVnode} is not a vnode.`);
          }
        });
      }

      const {
        classMap,
        className,
        style,
        styleMap,
        key
      } = data;
      data.class = classMap || getMapFromClassName(normalizeStyleString(className));
      data.style = styleMap || normalizeStyleString(style);
      data.token = getCurrentShadowToken();
      data.uid = getCurrentOwnerId();
      let text, elm; // tslint:disable-line

      const vnode = {
        nt: ELEMENT_NODE,
        tag: sel,
        sel,
        data,
        children,
        text,
        elm,
        key
      };

      if (sel.length === 3 && StringCharCodeAt.call(sel, 0) === CHAR_S && StringCharCodeAt.call(sel, 1) === CHAR_V && StringCharCodeAt.call(sel, 2) === CHAR_G) {
        addNS(vnode);
      }

      return vnode;
    } // [s]lot element node


    function s(slotName, data, children, slotset) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(slotName), `s() 1st argument slotName must be a string.`);
        assert.isTrue(isObject(data), `s() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
      }

      return h('slot', data, isUndefined(slotset) || isUndefined(slotset[slotName]) || slotset[slotName].length === 0 ? children : slotset[slotName]);
    } // [c]ustom element node


    function c(sel, Ctor, data, children) {
      if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
        assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
        assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        assert.isTrue(arguments.length === 3 || isArray(children), `c() 4nd argument data must be an array.`); // checking reserved internal data properties

        assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling c().`);
        assert.isFalse(data.className && data.classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
        assert.isFalse(data.styleMap && data.style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);

        if (data.style && !isString(data.style)) {
          assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }

        if (arguments.length === 4) {
          forEach.call(children, childVnode => {
            if (childVnode != null) {
              assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode && "nt" in childVnode, `${childVnode} is not a vnode.`);
            }
          });
        }
      }

      const {
        key,
        styleMap,
        style,
        on,
        className,
        classMap,
        props
      } = data;
      let {
        attrs
      } = data; // hack to allow component authors to force the usage of the "is" attribute in their components

      const {
        forceTagName
      } = Ctor;
      let tag = sel,
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
        hook,
        key,
        attrs,
        on,
        props,
        ctor: Ctor
      };
      data.class = classMap || getMapFromClassName(normalizeStyleString(className));
      data.style = styleMap || normalizeStyleString(style);
      data.token = getCurrentShadowToken();
      data.uid = getCurrentOwnerId();
      data.fallback = getCurrentFallback();
      data.mode = 'open'; // TODO: this should be defined in Ctor

      children = arguments.length === 3 ? EmptyArray : children;
      const vnode = {
        nt: ELEMENT_NODE,
        tag,
        sel,
        data,
        children,
        text,
        elm,
        key
      };
      return vnode;
    } // [i]terable node


    function i(iterable, factory) {
      const list = [];

      if (isUndefined(iterable) || iterable === null) {
        if (process.env.NODE_ENV !== 'production') {
          assert.logWarning(`Invalid template iteration for value "${iterable}" in ${vmBeingRendered}, it should be an Array or an iterable Object.`);
        }

        return list;
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isUndefined(iterable[SymbolIterator]), `Invalid template iteration for value \`${iterable}\` in ${vmBeingRendered}, it requires an array-like object, not \`null\` or \`undefined\`.`);
      }

      const iterator = iterable[SymbolIterator]();

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(iterator && isFunction(iterator.next), `Invalid iterator function for "${iterable}" in ${vmBeingRendered}.`);
      }

      let next = iterator.next();
      let j = 0;
      let {
        value,
        done: last
      } = next;
      let keyMap;
      let iterationError;

      if (process.env.NODE_ENV !== 'production') {
        keyMap = create(null);
      }

      while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done; // template factory logic based on the previous collected value

        const vnode = factory(value, j, j === 0, last);

        if (isArray(vnode)) {
          ArrayPush.apply(list, vnode);
        } else {
          ArrayPush.call(list, vnode);
        }

        if (process.env.NODE_ENV !== 'production') {
          const vnodes = isArray(vnode) ? vnode : [vnode];
          forEach.call(vnodes, childVnode => {
            if (!isNull(childVnode) && isObject(childVnode) && !isUndefined(childVnode.sel)) {
              const {
                key
              } = childVnode;

              if (isString(key) || isNumber(key)) {
                if (keyMap[key] === 1 && isUndefined(iterationError)) {
                  iterationError = `Duplicated "key" attribute value for "<${childVnode.sel}>" in ${vmBeingRendered} for item number ${j}. Key with value "${childVnode.key}" appears more than once in iteration. Key values must be unique numbers or strings.`;
                }

                keyMap[key] = 1;
              } else if (isUndefined(iterationError)) {
                iterationError = `Invalid "key" attribute value in "<${childVnode.sel}>" in ${vmBeingRendered} for item number ${j}. Instead set a unique "key" attribute value on all iteration children so internal state can be preserved during rehydration.`;
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

      const len = items.length;
      const flattened = [];

      for (let j = 0; j < len; j += 1) {
        const item = items[j];

        if (isArray(item)) {
          ArrayPush.apply(flattened, item);
        } else {
          ArrayPush.call(flattened, item);
        }
      }

      return flattened;
    } // [t]ext node


    function t(text) {
      let sel,
          data = {
        uid: getCurrentOwnerId()
      },
          children,
          key,
          elm; // tslint:disable-line

      return {
        nt: TEXT_NODE,
        sel,
        data,
        children,
        text,
        elm,
        key
      };
    }

    function p(text) {
      let sel = '!',
          data = {
        uid: getCurrentOwnerId()
      },
          children,
          key,
          elm; // tslint:disable-line

      return {
        nt: COMMENT_NODE,
        sel,
        data,
        children,
        text,
        elm,
        key
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

      const vm = vmBeingRendered;
      return function (event) {
        if (vm.fallback) {
          patchEvent(event);
        }

        invokeEventListener(vm, fn, vm.component, event);
      };
    } // [k]ey function


    function k(compilerKey, obj) {
      switch (typeof obj) {
        case 'number': // TODO: when obj is a numeric key, we might be able to use some
        // other strategy to combine two numbers into a new unique number

        case 'string':
          return compilerKey + ':' + obj;

        case 'object':
          if (process.env.NODE_ENV !== 'production') {
            assert.fail(`Invalid key value "${obj}" in ${vmBeingRendered}. Key must be a string or number.`);
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
    const {
      setAttribute: setAttribute$2,
      getAttribute: getAttribute$2,
      setAttributeNS: setAttributeNS$1,
      getAttributeNS: getAttributeNS$1,
      removeAttribute: removeAttribute$2,
      removeAttributeNS: removeAttributeNS$1,
      addEventListener: addEventListener$1,
      removeEventListener: removeEventListener$1
    } = Element.prototype;
    const parentNodeGetter$1 = getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;
    const parentElementGetter$1 = hasOwnProperty.call(Node.prototype, 'parentElement') ? getOwnPropertyDescriptor(Node.prototype, 'parentElement').get : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement').get; // IE11

    const elementTagNameGetter = getOwnPropertyDescriptor(Element.prototype, 'tagName').get;
    const dispatchEvent = 'EventTarget' in window ? EventTarget.prototype.dispatchEvent : Node.prototype.dispatchEvent; // IE11

    const BaseCustomElementProto = document.createElement('x-lwc').constructor.prototype;
    const EmptySlots = create(null);

    function validateSlots(vm, html) {
      if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
      }

      const {
        cmpSlots = EmptySlots
      } = vm;
      const {
        slots = EmptyArray
      } = html;

      for (const slotName in cmpSlots) {
        assert.isTrue(isArray(cmpSlots[slotName]), `Slots can only be set to an array, instead received ${toString(cmpSlots[slotName])} for slot "${slotName}" in ${vm}.`);

        if (ArrayIndexOf.call(slots, slotName) === -1) {
          // TODO: this should never really happen because the compiler should always validate
          assert.logWarning(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
        }
      }
    }

    function validateFields(vm, html) {
      if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
      }

      const component = vm.component; // validating identifiers used by template that should be provided by the component

      const {
        ids = []
      } = html;
      forEach.call(ids, propName => {
        if (!(propName in component)) {
          assert.logWarning(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`);
        } else if (hasOwnProperty.call(component, propName)) {
          assert.fail(`${component}'s template is accessing \`this.${toString(propName)}\`, which is considered a non-reactive private field. Instead access it via a getter or make it reactive by decorating it with \`@track ${toString(propName)}\`.`);
        }
      });
    }
    /**
     * Apply/Update the styling token applied to the host element.
     */


    function applyTokenToHost(vm, html) {
      const {
        context,
        elm
      } = vm;
      const oldToken = context.hostToken;
      const newToken = html.hostToken; // Remove the token currently applied to the host element if different than the one associated
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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
      } // TODO: add identity to the html functions


      const {
        component,
        context,
        cmpSlots,
        cmpTemplate
      } = vm; // reset the cache memoizer for template when needed

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
        assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`); // validating slots in every rendering since the allocated content might change over time

        validateSlots(vm, html);
      }

      const vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
      }

      return vnodes;
    } // Even if all the browser the engine supports implements the UserTiming API, we need to guard the measure APIs.
    // JSDom (used in Jest) for example doesn't implement the UserTiming APIs


    const isUserTimingSupported = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';

    function getMarkName(vm, phase) {
      return `<${vm.def.name} (${vm.uid})> - ${phase}`;
    }

    function startMeasure(vm, phase) {
      if (!isUserTimingSupported) {
        return;
      }

      const name = getMarkName(vm, phase);
      performance.mark(name);
    }

    function endMeasure(vm, phase) {
      if (!isUserTimingSupported) {
        return;
      }

      const name = getMarkName(vm, phase);
      performance.measure(name, name); // Clear the created marks and measure to avoid filling the performance entries buffer.
      // Note: Even if the entries get deleted, existing PerformanceObservers preserve a copy of those entries.

      performance.clearMarks(name);
      performance.clearMeasures(name);
    }

    let isRendering = false;
    let vmBeingRendered = null;
    let vmBeingConstructed = null;

    function isBeingConstructed(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      return vmBeingConstructed === vm;
    }

    function invokeComponentCallback(vm, fn, args) {
      const {
        context,
        component,
        callHook
      } = vm;
      let result;
      let error;

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
      const vmBeingConstructedInception = vmBeingConstructed;
      vmBeingConstructed = vm;

      if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'constructor');
      }

      let error;

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
      const {
        def: {
          render
        },
        callHook
      } = vm;

      if (isUndefined(render)) {
        return [];
      }

      const {
        component,
        context
      } = vm;
      const isRenderingInception = isRendering;
      const vmBeingRenderedInception = vmBeingRendered;
      isRendering = true;
      vmBeingRendered = vm;
      let result;
      let error;

      if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'render');
      }

      try {
        const html = callHook(component, render);

        if (isFunction(html)) {
          result = evaluateTemplate(vm, html);
        } else if (!isUndefined(html)) {
          if (process.env.NODE_ENV !== 'production') {
            assert.fail(`The template rendered by ${vm} must return an imported template tag (e.g.: \`import html from "./mytemplate.html"\`) or undefined, instead, it has returned ${html}.`);
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
      const {
        context,
        callHook
      } = vm;
      let error;

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

    const Services = create(null);

    function invokeServiceHook(vm, cbs) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
      }

      const {
        component,
        data,
        def,
        context
      } = vm;

      for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
      }
    }

    function createComponent(vm, Ctor) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      } // create the component instance


      invokeComponentConstructor(vm, Ctor);

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(vm.component), `Invalid construction for ${vm}, maybe you are missing the call to super() on classes extending Element.`);
      }
    }

    function linkComponent(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      } // wiring service


      const {
        def: {
          wire
        }
      } = vm;

      if (wire) {
        const {
          wiring
        } = Services;

        if (wiring) {
          invokeServiceHook(vm, wiring);
        }
      }
    }

    function clearReactiveListeners(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const {
        deps
      } = vm;
      const len = deps.length;

      if (len) {
        for (let i = 0; i < len; i += 1) {
          const set = deps[i];
          const pos = ArrayIndexOf.call(deps[i], vm);

          if (process.env.NODE_ENV !== 'production') {
            assert.invariant(pos > -1, `when clearing up deps, the vm must be part of the collection.`);
          }

          ArraySplice.call(set, pos, 1);
        }

        deps.length = 0;
      }
    }

    function renderComponent(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.invariant(vm.isDirty, `${vm} is not dirty.`);
      }

      clearReactiveListeners(vm);
      const vnodes = invokeComponentRenderMethod(vm);
      vm.isDirty = false;

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
      }

      return vnodes;
    }

    function markComponentAsDirty(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the component is already dirty.`);
        assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
      }

      vm.isDirty = true;
    }

    const cmpEventListenerMap = new WeakMap();

    function getWrappedComponentsListener(vm, listener) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
      }

      let wrappedListener = cmpEventListenerMap.get(listener);

      if (isUndefined(wrappedListener)) {
        wrappedListener = function (event) {
          invokeEventListener(vm, listener, undefined, event);
        };

        cmpEventListenerMap.set(listener, wrappedListener);
      }

      return wrappedListener;
    }

    const TargetToReactiveRecordMap = new WeakMap();

    function notifyMutation(target, key) {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isRendering, `Mutating property ${toString(key)} of ${toString(target)} is not allowed during the rendering life-cycle of ${vmBeingRendered}.`);
      }

      const reactiveRecord = TargetToReactiveRecordMap.get(target);

      if (!isUndefined(reactiveRecord)) {
        const value = reactiveRecord[key];

        if (value) {
          const len = value.length;

          for (let i = 0; i < len; i += 1) {
            const vm = value[i];

            if (process.env.NODE_ENV !== 'production') {
              assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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

      const vm = vmBeingRendered;
      let reactiveRecord = TargetToReactiveRecordMap.get(target);

      if (isUndefined(reactiveRecord)) {
        const newRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
      }

      let value = reactiveRecord[key];

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


    const {
      isArray: isArray$1
    } = Array;
    const {
      getPrototypeOf: getPrototypeOf$1,
      create: ObjectCreate,
      defineProperty: ObjectDefineProperty,
      defineProperties: ObjectDefineProperties,
      isExtensible: isExtensible$1,
      getOwnPropertyDescriptor: getOwnPropertyDescriptor$1,
      getOwnPropertyNames: getOwnPropertyNames$1,
      getOwnPropertySymbols: getOwnPropertySymbols$1,
      preventExtensions: preventExtensions$1
    } = Object;
    const {
      push: ArrayPush$1,
      concat: ArrayConcat$1,
      map: ArrayMap$1
    } = Array.prototype;
    const ObjectDotPrototype = Object.prototype;
    const OtS$1 = {}.toString;

    function toString$1(obj) {
      if (obj && obj.toString) {
        return obj.toString();
      } else if (typeof obj === 'object') {
        return OtS$1.call(obj);
      } else {
        return obj + '';
      }
    }

    function isUndefined$1(obj) {
      return obj === undefined;
    }

    const TargetSlot$1 = Symbol(); // TODO: we are using a funky and leaky abstraction here to try to identify if
    // the proxy is a compat proxy, and define the unwrap method accordingly.
    // @ts-ignore

    const {
      getKey: getKey$1
    } = Proxy;
    const unwrap$1 = getKey$1 ? replicaOrAny => replicaOrAny && getKey$1(replicaOrAny, TargetSlot$1) || replicaOrAny : replicaOrAny => replicaOrAny && replicaOrAny[TargetSlot$1] || replicaOrAny;

    function isObservable(value) {
      // intentionally checking for null and undefined
      if (value == null) {
        return false;
      }

      if (isArray$1(value)) {
        return true;
      }

      const proto = getPrototypeOf$1(value);
      return proto === ObjectDotPrototype || proto === null || getPrototypeOf$1(proto) === null;
    }

    function isObject$1(obj) {
      return typeof obj === 'object';
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
      const targetKeys = ArrayConcat$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
      targetKeys.forEach(key => {
        let descriptor = getOwnPropertyDescriptor$1(originalTarget, key); // We do not need to wrap the descriptor if not configurable
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

    class ReactiveProxyHandler {
      constructor(membrane, value, options) {
        this.originalTarget = value;
        this.membrane = membrane;

        if (!isUndefined$1(options)) {
          this.valueMutated = options.valueMutated;
          this.valueObserved = options.valueObserved;
        }
      }

      get(shadowTarget, key) {
        const {
          originalTarget,
          membrane
        } = this;

        if (key === TargetSlot$1) {
          return originalTarget;
        }

        const value = originalTarget[key];
        const {
          valueObserved
        } = this;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return membrane.getProxy(value);
      }

      set(shadowTarget, key, value) {
        const {
          originalTarget,
          valueMutated
        } = this;
        const oldValue = originalTarget[key];

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

      deleteProperty(shadowTarget, key) {
        const {
          originalTarget,
          valueMutated
        } = this;
        delete originalTarget[key];

        if (!isUndefined$1(valueMutated)) {
          valueMutated(originalTarget, key);
        }

        return true;
      }

      apply(shadowTarget, thisArg, argArray) {
        /* No op */
      }

      construct(target, argArray, newTarget) {
        /* No op */
      }

      has(shadowTarget, key) {
        const {
          originalTarget,
          valueObserved
        } = this;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return key in originalTarget;
      }

      ownKeys(shadowTarget) {
        const {
          originalTarget
        } = this;
        return ArrayConcat$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
      }

      isExtensible(shadowTarget) {
        const shadowIsExtensible = isExtensible$1(shadowTarget);

        if (!shadowIsExtensible) {
          return shadowIsExtensible;
        }

        const {
          originalTarget,
          membrane
        } = this;
        const targetIsExtensible = isExtensible$1(originalTarget);

        if (!targetIsExtensible) {
          lockShadowTarget(membrane, shadowTarget, originalTarget);
        }

        return targetIsExtensible;
      }

      setPrototypeOf(shadowTarget, prototype) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(`Invalid setPrototypeOf invocation for reactive proxy ${toString$1(this.originalTarget)}. Prototype of reactive objects cannot be changed.`);
        }
      }

      getPrototypeOf(shadowTarget) {
        const {
          originalTarget
        } = this;
        return getPrototypeOf$1(originalTarget);
      }

      getOwnPropertyDescriptor(shadowTarget, key) {
        const {
          originalTarget,
          membrane,
          valueObserved
        } = this; // keys looked up via hasOwnProperty need to be reactive

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        let desc = getOwnPropertyDescriptor$1(originalTarget, key);

        if (isUndefined$1(desc)) {
          return desc;
        }

        const shadowDescriptor = getOwnPropertyDescriptor$1(shadowTarget, key);

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

      preventExtensions(shadowTarget) {
        const {
          originalTarget,
          membrane
        } = this;
        lockShadowTarget(membrane, shadowTarget, originalTarget);
        preventExtensions$1(originalTarget);
        return true;
      }

      defineProperty(shadowTarget, key, descriptor) {
        const {
          originalTarget,
          membrane,
          valueMutated
        } = this;
        const {
          configurable
        } = descriptor; // We have to check for value in descriptor
        // because Object.freeze(proxy) calls this method
        // with only { configurable: false, writeable: false }
        // Additionally, method will only be called with writeable:false
        // if the descriptor has a value, as opposed to getter/setter
        // So we can just check if writable is present and then see if
        // value is present. This eliminates getter and setter descriptors

        if ('writable' in descriptor && !('value' in descriptor)) {
          const originalDescriptor = getOwnPropertyDescriptor$1(originalTarget, key);
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

    }

    function wrapDescriptor$1(membrane, descriptor) {
      if ('value' in descriptor) {
        descriptor.value = isObservable(descriptor.value) ? membrane.getReadOnlyProxy(descriptor.value) : descriptor.value;
      }

      return descriptor;
    }

    class ReadOnlyHandler {
      constructor(membrane, value, options) {
        this.originalTarget = value;
        this.membrane = membrane;

        if (!isUndefined$1(options)) {
          this.valueObserved = options.valueObserved;
        }
      }

      get(shadowTarget, key) {
        const {
          membrane,
          originalTarget
        } = this;

        if (key === TargetSlot$1) {
          return originalTarget;
        }

        const value = originalTarget[key];
        const {
          valueObserved
        } = this;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return membrane.getReadOnlyProxy(value);
      }

      set(shadowTarget, key, value) {
        if (process.env.NODE_ENV !== 'production') {
          const {
            originalTarget
          } = this;
          throw new Error(`Invalid mutation: Cannot set "${key.toString()}" on "${originalTarget}". "${originalTarget}" is read-only.`);
        }

        return false;
      }

      deleteProperty(shadowTarget, key) {
        if (process.env.NODE_ENV !== 'production') {
          const {
            originalTarget
          } = this;
          throw new Error(`Invalid mutation: Cannot delete "${key.toString()}" on "${originalTarget}". "${originalTarget}" is read-only.`);
        }

        return false;
      }

      apply(shadowTarget, thisArg, argArray) {
        /* No op */
      }

      construct(target, argArray, newTarget) {
        /* No op */
      }

      has(shadowTarget, key) {
        const {
          originalTarget
        } = this;
        const {
          valueObserved
        } = this;

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        return key in originalTarget;
      }

      ownKeys(shadowTarget) {
        const {
          originalTarget
        } = this;
        return ArrayConcat$1.call(getOwnPropertyNames$1(originalTarget), getOwnPropertySymbols$1(originalTarget));
      }

      setPrototypeOf(shadowTarget, prototype) {
        if (process.env.NODE_ENV !== 'production') {
          const {
            originalTarget
          } = this;
          throw new Error(`Invalid prototype mutation: Cannot set prototype on "${originalTarget}". "${originalTarget}" prototype is read-only.`);
        }
      }

      getOwnPropertyDescriptor(shadowTarget, key) {
        const {
          originalTarget,
          membrane,
          valueObserved
        } = this; // keys looked up via hasOwnProperty need to be reactive

        if (!isUndefined$1(valueObserved)) {
          valueObserved(originalTarget, key);
        }

        let desc = getOwnPropertyDescriptor$1(originalTarget, key);

        if (isUndefined$1(desc)) {
          return desc;
        }

        const shadowDescriptor = getOwnPropertyDescriptor$1(shadowTarget, key);

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

      preventExtensions(shadowTarget) {
        if (process.env.NODE_ENV !== 'production') {
          const {
            originalTarget
          } = this;
          throw new Error(`Invalid mutation: Cannot preventExtensions on ${originalTarget}". "${originalTarget} is read-only.`);
        }

        return false;
      }

      defineProperty(shadowTarget, key, descriptor) {
        if (process.env.NODE_ENV !== 'production') {
          const {
            originalTarget
          } = this;
          throw new Error(`Invalid mutation: Cannot defineProperty "${key.toString()}" on "${originalTarget}". "${originalTarget}" is read-only.`);
        }

        return false;
      }

    }

    function getTarget(item) {
      return item && item[TargetSlot$1];
    }

    function extract(objectOrArray) {
      if (isArray$1(objectOrArray)) {
        return objectOrArray.map(item => {
          const original = getTarget(item);

          if (original) {
            return extract(original);
          }

          return item;
        });
      }

      const obj = ObjectCreate(getPrototypeOf$1(objectOrArray));
      const names = getOwnPropertyNames$1(objectOrArray);
      return ArrayConcat$1.call(names, getOwnPropertySymbols$1(objectOrArray)).reduce((seed, key) => {
        const item = objectOrArray[key];
        const original = getTarget(item);

        if (original) {
          seed[key] = extract(original);
        } else {
          seed[key] = item;
        }

        return seed;
      }, obj);
    }

    const formatter = {
      header: plainOrProxy => {
        const originalTarget = plainOrProxy[TargetSlot$1];

        if (!originalTarget) {
          return null;
        }

        const obj = extract(plainOrProxy);
        return ['object', {
          object: obj
        }];
      },
      hasBody: () => {
        return false;
      },
      body: () => {
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


      const devWindow = window;
      const devtoolsFormatters = devWindow.devtoolsFormatters || [];
      ArrayPush$1.call(devtoolsFormatters, formatter);
      devWindow.devtoolsFormatters = devtoolsFormatters;
    }

    if (process.env.NODE_ENV !== 'production') {
      init();
    }

    function createShadowTarget(value) {
      let shadowTarget = undefined;

      if (isArray$1(value)) {
        shadowTarget = [];
      } else if (isObject$1(value)) {
        shadowTarget = {};
      }

      return shadowTarget;
    }

    class ReactiveMembrane {
      constructor(options) {
        this.objectGraph = new WeakMap();

        if (!isUndefined$1(options)) {
          this.valueDistortion = options.valueDistortion;
          this.valueMutated = options.valueMutated;
          this.valueObserved = options.valueObserved;
        }
      }

      getProxy(value) {
        const {
          valueDistortion
        } = this;
        const distorted = isUndefined$1(valueDistortion) ? value : valueDistortion(value);

        if (isObservable(distorted)) {
          const o = this.getReactiveState(distorted); // when trying to extract the writable version of a readonly
          // we return the readonly.

          return o.readOnly === value ? value : o.reactive;
        }

        return distorted;
      }

      getReadOnlyProxy(value) {
        const {
          valueDistortion
        } = this;
        const distorted = isUndefined$1(valueDistortion) ? value : valueDistortion(value);

        if (isObservable(distorted)) {
          return this.getReactiveState(distorted).readOnly;
        }

        return distorted;
      }

      unwrapProxy(p) {
        return unwrap$1(p);
      }

      getReactiveState(value) {
        const membrane = this;
        const {
          objectGraph,
          valueMutated,
          valueObserved
        } = membrane;
        value = unwrap$1(value);
        let reactiveState = objectGraph.get(value);

        if (reactiveState) {
          return reactiveState;
        }

        reactiveState = ObjectDefineProperties(ObjectCreate(null), {
          reactive: {
            get() {
              const reactiveHandler = new ReactiveProxyHandler(membrane, value, {
                valueMutated,
                valueObserved
              }); // caching the reactive proxy after the first time it is accessed

              const proxy = new Proxy(createShadowTarget(value), reactiveHandler);
              ObjectDefineProperty(this, 'reactive', {
                value: proxy
              });
              return proxy;
            },

            configurable: true
          },
          readOnly: {
            get() {
              const readOnlyHandler = new ReadOnlyHandler(membrane, value, {
                valueObserved
              }); // caching the readOnly proxy after the first time it is accessed

              const proxy = new Proxy(createShadowTarget(value), readOnlyHandler);
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

    }
    /** version: 0.25.0 */


    function valueDistortion(value) {
      if (process.env.NODE_ENV !== 'production') {
        // For now, if we determine that value is a traverse membrane we want to
        // throw a big error.
        if (unwrap(value) !== value) {
          throw new ReferenceError(`Invalid attempt to get access to a traverse membrane ${toString(value)} via a reactive membrane.`);
        }
      }

      return value;
    }

    const reactiveMembrane = new ReactiveMembrane({
      valueObserved: observeMutation,
      valueMutated: notifyMutation,
      valueDistortion
    }); // TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129

    function track(target, prop, descriptor) {
      if (arguments.length === 1) {
        return reactiveMembrane.getProxy(target);
      }

      if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 3) {
          assert.fail(`@track decorator can only be used with one argument to return a trackable object, or as a decorator function.`);
        }

        if (!isUndefined(descriptor)) {
          const {
            get,
            set,
            configurable,
            writable
          } = descriptor;
          assert.isTrue(!get && !set, `Compiler Error: A @track decorator can only be applied to a public field.`);
          assert.isTrue(configurable !== false, `Compiler Error: A @track decorator can only be applied to a configurable property.`);
          assert.isTrue(writable !== false, `Compiler Error: A @track decorator can only be applied to a writable property.`);
        }
      }

      return createTrackedPropertyDescriptor(target, prop, isUndefined(descriptor) ? true : descriptor.enumerable === true);
    }

    function createTrackedPropertyDescriptor(Ctor, key, enumerable) {
      return {
        get() {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          }

          observeMutation(this, key);
          return vm.cmpTrack[key];
        },

        set(newValue) {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
          }

          const reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);

          if (reactiveOrAnyValue !== vm.cmpTrack[key]) {
            if (process.env.NODE_ENV !== 'production') {
              // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
              // Then newValue if newValue is observable (plain object or array)
              const isObservable = reactiveOrAnyValue !== newValue;

              if (!isObservable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                assert.logWarning(`Property "${toString(key)}" of ${vm} is set to a non-trackable object, which means changes into that object cannot be observed.`);
              }
            }

            vm.cmpTrack[key] = reactiveOrAnyValue;

            if (vm.idx > 0) {
              // perf optimization to skip this step if not in the DOM
              notifyMutation(this, key);
            }
          }
        },

        enumerable,
        configurable: true
      };
    }

    function wireDecorator(target, prop, descriptor) {
      if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(descriptor)) {
          const {
            get,
            set,
            configurable,
            writable
          } = descriptor;
          assert.isTrue(!get && !set, `Compiler Error: A @wire decorator can only be applied to a public field.`);
          assert.isTrue(configurable !== false, `Compiler Error: A @wire decorator can only be applied to a configurable property.`);
          assert.isTrue(writable !== false, `Compiler Error: A @wire decorator can only be applied to a writable property.`);
        }
      } // TODO: eventually this decorator should have its own logic


      return createTrackedPropertyDescriptor(target, prop, isObject(descriptor) ? descriptor.enumerable === true : true);
    } // @wire is a factory that when invoked, returns the wire decorator


    function wire(adapter, config) {
      const len = arguments.length;

      if (len > 0 && len < 3) {
        return wireDecorator;
      } else {
        if (process.env.NODE_ENV !== 'production') {
          assert.fail("@wire(adapter, config?) may only be used as a decorator.");
        }

        throw new TypeError();
      }
    }

    const COMPUTED_GETTER_MASK = 1;
    const COMPUTED_SETTER_MASK = 2;

    function api$1(target, propName, descriptor) {
      if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 3) {
          assert.fail(`@api decorator can only be used as a decorator function.`);
        }
      }

      const meta = target.publicProps; // publicProps must be an own property, otherwise the meta is inherited.

      const config = !isUndefined(meta) && hasOwnProperty.call(target, 'publicProps') && hasOwnProperty.call(meta, propName) ? meta[propName].config : 0; // initializing getters and setters for each public prop on the target prototype

      if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
        if (process.env.NODE_ENV !== 'production') {
          assert.invariant(!descriptor || isFunction(descriptor.get) || isFunction(descriptor.set), `Invalid property ${toString(propName)} definition in ${target}, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
          const mustHaveGetter = COMPUTED_GETTER_MASK & config;
          const mustHaveSetter = COMPUTED_SETTER_MASK & config;

          if (mustHaveGetter) {
            assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), `Missing getter for property ${toString(propName)} decorated with @api in ${target}`);
          }

          if (mustHaveSetter) {
            assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), `Missing setter for property ${toString(propName)} decorated with @api in ${target}`);
            assert.isTrue(mustHaveGetter, `Missing getter for property ${toString(propName)} decorated with @api in ${target}. You cannot have a setter without the corresponding getter.`);
          }
        } // if it is configured as an accessor it must have a descriptor


        return createPublicAccessorDescriptor(target, propName, descriptor);
      } else {
        return createPublicPropertyDescriptor(target, propName, descriptor);
      }
    }

    let vmBeingUpdated = null;

    function prepareForPropUpdate(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      vmBeingUpdated = vm;
    }

    function createPublicPropertyDescriptor(proto, key, descriptor) {
      return {
        get() {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          }

          if (isBeingConstructed(vm)) {
            if (process.env.NODE_ENV !== 'production') {
              assert.logError(`${vm} constructor should not read the value of property "${toString(key)}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
            }

            return;
          }

          observeMutation(this, key);
          return vm.cmpProps[key];
        },

        set(newValue) {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(key)}`);
          }

          if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
            vmBeingUpdated = vm;

            if (process.env.NODE_ENV !== 'production') {
              // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
              // Then newValue if newValue is observable (plain object or array)
              const isObservable = reactiveMembrane.getProxy(newValue) !== newValue;

              if (!isObservable && !isNull(newValue) && isObject(newValue)) {
                assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${toString(key)} of ${vm} is not common because mutations on that value cannot be observed.`);
              }
            }
          }

          if (process.env.NODE_ENV !== 'production') {
            if (vmBeingUpdated !== vm) {
              // logic for setting new properties of the element directly from the DOM
              // is only recommended for root elements created via createElement()
              assert.logWarning(`If property ${toString(key)} decorated with @api in ${vm} is used in the template, the value ${toString(newValue)} set manually may be overridden by the template, consider binding the property only in the template.`);
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
      const {
        get,
        set,
        enumerable
      } = descriptor;

      if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
          assert.fail(`Invalid attempt to create public property descriptor ${toString(key)} in ${Ctor}. It is missing the getter declaration with @api get ${toString(key)}() {} syntax.`);
        }

        throw new TypeError();
      }

      return {
        get() {
          if (process.env.NODE_ENV !== 'production') {
            const vm = getComponentVM(this);
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          }

          return get.call(this);
        },

        set(newValue) {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(key)}`);
          }

          if (vm.isRoot || isBeingConstructed(vm)) {
            vmBeingUpdated = vm;

            if (process.env.NODE_ENV !== 'production') {
              // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
              // Then newValue if newValue is observable (plain object or array)
              const isObservable = reactiveMembrane.getProxy(newValue) !== newValue;

              if (!isObservable && !isNull(newValue) && isObject(newValue)) {
                assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${toString(key)} of ${vm} is not common because mutations on that value cannot be observed.`);
              }
            }
          }

          if (process.env.NODE_ENV !== 'production') {
            if (vmBeingUpdated !== vm) {
              // logic for setting new properties of the element directly from the DOM
              // is only recommended for root elements created via createElement()
              assert.logWarning(`If property ${toString(key)} decorated with @api in ${vm} is used in the template, the value ${toString(newValue)} set manually may be overridden by the template, consider binding the property only in the template.`);
            }
          }

          vmBeingUpdated = null; // releasing the lock
          // not need to wrap or check the value since that is happening somewhere else

          if (set) {
            set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
          } else if (process.env.NODE_ENV !== 'production') {
            assert.fail(`Invalid attempt to set a new value for property ${toString(key)} of ${vm} that does not has a setter decorated with @api.`);
          }
        },

        enumerable
      };
    }

    function getNodeRestrictionsDescriptors(node) {
      if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
      }

      const originalChildNodesDescriptor = getPropertyDescriptor(node, 'childNodes');
      return {
        childNodes: {
          get() {
            assert.logWarning(`Discouraged access to property 'childNodes' on 'Node': It returns a live NodeList and should not be relied upon. Instead, use 'querySelectorAll' which returns a static NodeList.`);
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


      const originalQuerySelector = sr.querySelector;
      const originalQuerySelectorAll = sr.querySelectorAll;
      const originalAddEventListener = sr.addEventListener;
      const descriptors = getNodeRestrictionsDescriptors(sr);
      assign(descriptors, {
        addEventListener: {
          value(type) {
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${toString(sr)} by adding an event listener for "${type}".`);
            return originalAddEventListener.apply(this, arguments);
          }

        },
        querySelector: {
          value() {
            const vm = getShadowRootVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.template.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
            return originalQuerySelector.apply(this, arguments);
          }

        },
        querySelectorAll: {
          value() {
            const vm = getShadowRootVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
            return originalQuerySelectorAll.apply(this, arguments);
          }

        },
        host: {
          get() {
            throw new Error(`Disallowed property "host" in ShadowRoot.`);
          }

        },
        ownerDocument: {
          get() {
            throw new Error(`Disallowed property "ownerDocument" in ShadowRoot.`);
          }

        },
        mode: {
          // from within, the shadow root is always seen as closed
          value: 'closed',
          enumerable: true,
          configurable: true
        }
      });
      const BlackListedShadowRootMethods = {
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
      forEach.call(getOwnPropertyNames(BlackListedShadowRootMethods), methodName => {
        const descriptor = {
          get() {
            throw new Error(`Disallowed method "${methodName}" in ShadowRoot.`);
          }

        };
        descriptors[methodName] = descriptor;
      });
      return descriptors;
    } // Custom Elements Restrictions:
    // -----------------------------


    function getAttributePatched(attrName) {
      if (process.env.NODE_ENV !== 'production') {
        const vm = getCustomElementVM(this);
        assertAttributeReflectionCapability(vm, attrName);
      }

      return getAttribute$2.apply(this, ArraySlice.call(arguments));
    }

    function setAttributePatched(attrName, newValue) {
      const vm = getCustomElementVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
      }

      setAttribute$2.apply(this, ArraySlice.call(arguments));
    }

    function setAttributeNSPatched(attrNameSpace, attrName, newValue) {
      const vm = getCustomElementVM(this);

      if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
      }

      setAttributeNS$1.apply(this, ArraySlice.call(arguments));
    }

    function removeAttributePatched(attrName) {
      const vm = getCustomElementVM(this); // marking the set is needed for the AOM polyfill

      if (process.env.NODE_ENV !== 'production') {
        assertAttributeMutationCapability(vm, attrName);
        assertAttributeReflectionCapability(vm, attrName);
      }

      removeAttribute$2.apply(this, ArraySlice.call(arguments));
    }

    function removeAttributeNSPatched(attrNameSpace, attrName) {
      const vm = getCustomElementVM(this);

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

      const propName = isString(attrName) ? getPropNameFromAttrName(StringToLowerCase.call(attrName)) : null;
      const {
        elm,
        def: {
          props: propsConfig
        }
      } = vm;

      if (!isUndefined(getNodeOwnerKey$1(elm)) && isAttributeLocked(elm, attrName) && propsConfig && propName && propsConfig[propName]) {
        assert.logError(`Invalid attribute "${StringToLowerCase.call(attrName)}" for ${vm}. Instead access the public property with \`element.${propName};\`.`);
      }
    }

    function assertAttributeMutationCapability(vm, attrName) {
      if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
      }

      const {
        elm
      } = vm;

      if (!isUndefined(getNodeOwnerKey$1(elm)) && isAttributeLocked(elm, attrName)) {
        assert.logError(`Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute "${attrName}", you can update the state of the component, and let the engine to rehydrate the element accordingly.`);
      }
    }

    let controlledElement = null;
    let controlledAttributeName;

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

      const descriptors = getNodeRestrictionsDescriptors(elm);
      const originalAddEventListener = elm.addEventListener;
      return assign(descriptors, {
        addEventListener: {
          value(type) {
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${toString(elm)} by adding an event listener for "${type}".`);
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

      const originalSetAttribute = cmp.setAttribute;
      return {
        setAttribute: {
          value(attrName, value) {
            // logging errors for experimental and special attributes
            if (isString(attrName)) {
              const propName = getPropNameFromAttrName(attrName);
              const info = getGlobalHTMLPropertiesInfo();

              if (info[propName] && info[propName].attribute) {
                const {
                  error,
                  experimental
                } = info[propName];

                if (error) {
                  assert.logError(error);
                } else if (experimental) {
                  assert.logError(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
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
      const info = getGlobalHTMLPropertiesInfo();
      const descriptors = {};
      forEach.call(getOwnPropertyNames(info), propName => {
        if (propName in proto) {
          return; // no need to redefine something that we are already exposing
        }

        descriptors[propName] = {
          get() {
            const {
              error,
              attribute,
              readOnly,
              experimental
            } = info[propName];
            const msg = [];
            msg.push(`Accessing the global HTML property "${propName}" in ${this} is disabled.`);

            if (error) {
              msg.push(error);
            } else {
              if (experimental) {
                msg.push(`This is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`);
              }

              if (readOnly) {
                // TODO - need to improve this message
                msg.push(`Property is read-only.`);
              }

              if (attribute) {
                msg.push(`"Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
              }
            }

            console.log(msg.join('\n')); // tslint:disable-line

            return; // explicit undefined
          },

          // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
          set() {}

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

    const GlobalEvent = Event; // caching global reference to avoid poisoning

    function getHTMLPropDescriptor(propName, descriptor) {
      const {
        get,
        set,
        enumerable,
        configurable
      } = descriptor;

      if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
          assert.fail(`Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard getter.`);
        }

        throw new TypeError();
      }

      if (!isFunction(set)) {
        if (process.env.NODE_ENV !== 'production') {
          assert.fail(`Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard setter.`);
        }

        throw new TypeError();
      }

      return {
        enumerable,
        configurable,

        get() {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          }

          if (isBeingConstructed(vm)) {
            if (process.env.NODE_ENV !== 'production') {
              assert.logError(`${vm} constructor should not read the value of property "${propName}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
            }

            return;
          }

          observeMutation(this, propName);
          return get.call(vm.elm);
        },

        set(newValue) {
          const vm = getComponentVM(this);

          if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${propName}`);
            assert.isFalse(isBeingConstructed(vm), `Failed to construct '${this}': The result must not have attributes.`);
            assert.invariant(!isObject(newValue) || isNull(newValue), `Invalid value "${newValue}" for "${propName}" of ${vm}. Value cannot be an object, must be a primitive value.`);
          }

          if (newValue !== vm.cmpProps[propName]) {
            vm.cmpProps[propName] = newValue;

            if (vm.idx > 0) {
              // perf optimization to skip this step if not in the DOM
              notifyMutation(this, propName);
            }
          }

          return set.call(vm.elm, newValue);
        }

      };
    }

    function getLinkedElement(cmp) {
      return getComponentVM(cmp).elm;
    }

    const LightningElement = function BaseLightningElement() {
      // This should be as performant as possible, while any initialization should be done lazily
      if (isNull(vmBeingConstructed)) {
        throw new ReferenceError();
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vmBeingConstructed && "cmpRoot" in vmBeingConstructed, `${vmBeingConstructed} is not a vm.`);
        assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`);
      }

      const vm = vmBeingConstructed;
      const {
        elm,
        def,
        cmpRoot,
        uid
      } = vm;
      const component = this;
      vm.component = component; // interaction hooks
      // We are intentionally hiding this argument from the formal API of LWCElement because
      // we don't want folks to know about it just yet.

      if (arguments.length === 1) {
        const {
          callHook,
          setHook,
          getHook
        } = arguments[0];
        vm.callHook = callHook;
        vm.setHook = setHook;
        vm.getHook = getHook;
      } // linking elm, shadow root and component with the VM


      setInternalField(component, ViewModelReflection, vm);
      setInternalField(elm, ViewModelReflection, vm);
      setInternalField(cmpRoot, ViewModelReflection, vm);
      setNodeKey(elm, uid); // registered custom elements will be patched at the proto level already, not need to patch them here.

      if (isFalse(PatchedFlag in elm)) {
        if (elm.constructor.prototype !== BaseCustomElementProto) {
          // this is slow path for component instances using `is` attribute or `forceTagName`, which
          // are set to be removed in the near future.
          const {
            descriptors
          } = def;
          defineProperties(elm, descriptors);
        } else {
          const {
            elmProto
          } = def;
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

      dispatchEvent(event) {
        const elm = getLinkedElement(this);
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          if (arguments.length === 0) {
            throw new Error(`Failed to execute 'dispatchEvent' on ${this}: 1 argument required, but only 0 present.`);
          }

          if (!(event instanceof GlobalEvent)) {
            throw new Error(`Failed to execute 'dispatchEvent' on ${this}: parameter 1 is not of type 'Event'.`);
          }

          const {
            type: evtName,
            composed,
            bubbles
          } = event;
          assert.isFalse(isBeingConstructed(vm), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event "${evtName}" just yet.`);

          if (bubbles && 'composed' in event && !composed) {
            assert.logWarning(`Invalid event "${evtName}" dispatched in element ${this}. Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component.`);
          }

          if (vm.idx === 0) {
            assert.logWarning(`Unreachable event "${evtName}" dispatched from disconnected element ${this}. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).`);
          }

          if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
            assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
          }
        }

        return dispatchEvent.call(elm, event);
      },

      addEventListener(type, listener, options) {
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
          assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
        }

        const wrappedListener = getWrappedComponentsListener(vm, listener);
        vm.elm.addEventListener(type, wrappedListener, options);
      },

      removeEventListener(type, listener, options) {
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        }

        const wrappedListener = getWrappedComponentsListener(vm, listener);
        vm.elm.removeEventListener(type, wrappedListener, options);
      },

      setAttributeNS(ns, attrName, value) {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isFalse(isBeingConstructed(getComponentVM(this)), `Failed to construct '${this}': The result must not have attributes.`);
          unlockAttribute(elm, attrName);
        }

        elm.setAttributeNS.apply(elm, arguments);

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, attrName);
        }
      },

      removeAttributeNS(ns, attrName) {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          unlockAttribute(elm, attrName);
        }

        elm.removeAttributeNS.apply(elm, arguments);

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, attrName);
        }
      },

      removeAttribute(attrName) {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          unlockAttribute(elm, attrName);
        }

        elm.removeAttribute.apply(elm, arguments);

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, attrName);
        }
      },

      setAttribute(attrName, value) {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isFalse(isBeingConstructed(getComponentVM(this)), `Failed to construct '${this}': The result must not have attributes.`);
          unlockAttribute(elm, attrName);
        }

        elm.setAttribute.apply(elm, arguments);

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, attrName);
        }
      },

      getAttribute(attrName) {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          unlockAttribute(elm, attrName);
        }

        const value = elm.getAttribute.apply(elm, arguments);

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, attrName);
        }

        return value;
      },

      getAttributeNS(ns, attrName) {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          unlockAttribute(elm, attrName);
        }

        const value = elm.getAttributeNS.apply(elm, arguments);

        if (process.env.NODE_ENV !== 'production') {
          lockAttribute(elm, attrName);
        }

        return value;
      },

      getBoundingClientRect() {
        const elm = getLinkedElement(this);

        if (process.env.NODE_ENV !== 'production') {
          const vm = getComponentVM(this);
          assert.isFalse(isBeingConstructed(vm), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        }

        return elm.getBoundingClientRect();
      },

      querySelector(selector) {
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }

        const {
          elm
        } = vm; // fallback to a patched querySelector to respect
        // shadow semantics

        if (isTrue(vm.fallback)) {
          return lightDomQuerySelector(elm, selector);
        } // Delegate to custom element querySelector.


        return elm.querySelector(selector);
      },

      querySelectorAll(selector) {
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }

        const {
          elm
        } = vm; // fallback to a patched querySelectorAll to respect
        // shadow semantics

        if (isTrue(vm.fallback)) {
          return lightDomQuerySelectorAll(elm, selector);
        } // Delegate to custom element querySelectorAll.


        return ArraySlice.call(elm.querySelectorAll(selector));
      },

      get tagName() {
        const elm = getLinkedElement(this);
        return elementTagNameGetter.call(elm);
      },

      get classList() {
        if (process.env.NODE_ENV !== 'production') {
          const vm = getComponentVM(this); // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes

          assert.isFalse(isBeingConstructed(vm), `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`);
        }

        return getLinkedElement(this).classList;
      },

      get template() {
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        }

        return vm.cmpRoot;
      },

      get root() {
        // TODO: issue #418
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
          assert.logWarning(`"this.root" access in ${vm.component} has been deprecated and will be removed. Use "this.template" instead.`);
        }

        return vm.cmpRoot;
      },

      get shadowRoot() {
        // from within, the shadowRoot is always in "closed" mode
        return null;
      },

      toString() {
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        }

        const {
          elm
        } = vm;
        const tagName = elementTagNameGetter.call(elm);
        const is = elm.getAttribute('is');
        return `<${tagName.toLowerCase()}${is ? ' is="${is}' : ''}>`;
      }

    };
    /**
     * This abstract operation is supposed to be called once, with a descriptor map that contains
     * all standard properties that a Custom Element can support (including AOM properties), which
     * determines what kind of capabilities the Base Element should support. When creating the descriptors
     * for be Base Element, it also include the reactivity bit, so those standard properties are reactive.
     */

    function createBaseElementStandardPropertyDescriptors(StandardPropertyDescriptors) {
      const descriptors = ArrayReduce.call(getOwnPropertyNames(StandardPropertyDescriptors), (seed, propName) => {
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

      const proxy = new Proxy([3, 4], {});
      const res = [1, 2].concat(proxy);
      return res.length !== 4;
    }

    const {
      isConcatSpreadable
    } = Symbol;
    const {
      isArray: isArray$2
    } = Array;
    const {
      slice: ArraySlice$1,
      unshift: ArrayUnshift$1,
      shift: ArrayShift
    } = Array.prototype;

    function isObject$2(O) {
      return typeof O === 'object' ? O !== null : typeof O === 'function';
    } // https://www.ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable


    function isSpreadable(O) {
      if (!isObject$2(O)) {
        return false;
      }

      const spreadable = O[isConcatSpreadable];
      return spreadable !== undefined ? Boolean(spreadable) : isArray$2(O);
    } // https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat


    function ArrayConcatPolyfill(...args) {
      const O = Object(this);
      const A = [];
      let N = 0;
      const items = ArraySlice$1.call(arguments);
      ArrayUnshift$1.call(items, O);

      while (items.length) {
        const E = ArrayShift.call(items);

        if (isSpreadable(E)) {
          let k = 0;
          const length = E.length;

          for (k; k < length; k += 1, N += 1) {
            if (k in E) {
              const subElement = E[k];
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
      const composedEvents = assign(create(null), {
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
          get() {
            const {
              type
            } = this;
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

    const {
      CustomEvent: OriginalCustomEvent
    } = window;

    function PatchedCustomEvent(type, eventInitDict) {
      const event = new OriginalCustomEvent(type, eventInitDict); // support for composed on custom events

      Object.defineProperties(event, {
        composed: {
          // We can't use "value" here, because IE11 doesn't like mixing and matching
          // value with get() from Event.prototype.
          get() {
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
      const originalComposedGetter = Object.getOwnPropertyDescriptor(Event.prototype, 'composed').get;
      Object.defineProperties(FocusEvent.prototype, {
        composed: {
          get() {
            const {
              isTrusted
            } = this;
            const composed = originalComposedGetter.call(this);

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


    const CtorToDefMap = new WeakMap();

    function getCtorProto(Ctor) {
      const proto = getPrototypeOf(Ctor);
      return isCircularModuleDependency(proto) ? resolveCircularModuleDependency(proto) : proto;
    } // According to the WC spec (https://dom.spec.whatwg.org/#dom-element-attachshadow), certain elements
    // are not allowed to attached a shadow dom, and therefore, we need to prevent setting forceTagName to
    // those, otherwise we will not be able to use shadowDOM when forceTagName is specified in the future.


    function assertValidForceTagName(Ctor) {
      if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
      }

      const {
        forceTagName
      } = Ctor;

      if (isUndefined(forceTagName)) {
        return;
      }

      const invalidTags = ["article", "aside", "blockquote", "body", "div", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "main", "nav", "p", "section", "span"];

      if (ArrayIndexOf.call(invalidTags, forceTagName) !== -1) {
        throw new RangeError(`Invalid static forceTagName property set to "${forceTagName}" in component ${Ctor}. None of the following tag names can be used: ${invalidTags.join(", ")}.`);
      }

      if (StringIndexOf.call(forceTagName, '-') !== -1) {
        throw new RangeError(`Invalid static forceTagName property set to "${forceTagName}" in component ${Ctor}. It cannot have a dash (-) on it because that is reserved for existing custom elements.`);
      }
    }

    function isElementComponent(Ctor, protoSet) {
      protoSet = protoSet || [];

      if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
      }

      const proto = getCtorProto(Ctor);

      if (proto === LightningElement) {
        return true;
      }

      getComponentDef(proto); // ensuring that the prototype chain is already expanded

      ArrayPush.call(protoSet, Ctor);
      return isElementComponent(proto, protoSet);
    }

    function createComponentDef(Ctor) {
      if (globalInitialization) {
        // Note: this routine is just to solve the circular dependencies mess introduced by rollup.
        globalInitialization();
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isElementComponent(Ctor), `${Ctor} is not a valid component, or does not extends Element from "engine". You probably forgot to add the extend clause on the class declaration.`); // local to dev block

        const ctorName = Ctor.name;
        assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);
        assert.isTrue(Ctor.constructor, `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`);
        assertValidForceTagName(Ctor);
      }

      const name = Ctor.name;
      let props = getPublicPropertiesHash(Ctor);
      let methods = getPublicMethodsHash(Ctor);
      let wire$$1 = getWireHash(Ctor);
      const track$$1 = getTrackHash(Ctor);
      const proto = Ctor.prototype;
      const decoratorMap = create(null); // TODO: eventually, the compiler should do this work

      {
        for (const propName in props) {
          decoratorMap[propName] = api$1;
        }

        if (wire$$1) {
          for (const propName in wire$$1) {
            const wireDef = wire$$1[propName];

            if (wireDef.method) {
              // for decorated methods we need to do nothing
              continue;
            }

            decoratorMap[propName] = wire(wireDef.adapter, wireDef.params);
          }
        }

        if (track$$1) {
          for (const propName in track$$1) {
            decoratorMap[propName] = track;
          }
        }

        decorate(Ctor, decoratorMap);
      }
      let {
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render
      } = proto;
      let superElmProto = globalElmProto;
      let superElmDescriptors = globalElmDescriptors;
      const superProto = getCtorProto(Ctor);
      const superDef = superProto !== LightningElement ? getComponentDef(superProto) : null;

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

      const localKeyDescriptors = createCustomElementDescriptorMap(props, methods);
      const elmProto = create(superElmProto, localKeyDescriptors);
      const descriptors = assign(create(null), superElmDescriptors, localKeyDescriptors);
      props = assign(create(null), HTML_PROPS, props);
      const def = {
        name,
        wire: wire$$1,
        track: track$$1,
        props,
        methods,
        descriptors,
        elmProto,
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render
      };

      if (process.env.NODE_ENV !== 'production') {
        freeze(Ctor.prototype);
        freeze(wire$$1);
        freeze(props);
        freeze(methods);

        for (const key in def) {
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


    const cachedGetterByKey = create(null);
    const cachedSetterByKey = create(null);

    function createGetter(key) {
      let fn = cachedGetterByKey[key];

      if (isUndefined(fn)) {
        fn = cachedGetterByKey[key] = function () {
          const vm = getCustomElementVM(this);
          const {
            getHook
          } = vm;
          return getHook(vm.component, key);
        };
      }

      return fn;
    }

    function createSetter(key) {
      let fn = cachedSetterByKey[key];

      if (isUndefined(fn)) {
        fn = cachedSetterByKey[key] = function (newValue) {
          const vm = getCustomElementVM(this);
          const {
            setHook
          } = vm;
          setHook(vm.component, key, newValue);
        };
      }

      return fn;
    }

    function createMethodCaller(method) {
      return function () {
        const vm = getCustomElementVM(this);
        const {
          callHook
        } = vm;
        return callHook(vm.component, method, ArraySlice.call(arguments));
      };
    }

    function createCustomElementDescriptorMap(publicProps, publicMethodsConfig) {
      const descriptors = create(null); // expose getters and setters for each public props on the Element

      for (const key in publicProps) {
        descriptors[key] = {
          get: createGetter(key),
          set: createSetter(key),
          enumerable: true,
          configurable: true
        };
      } // expose public methods as props on the Element


      for (const key in publicMethodsConfig) {
        descriptors[key] = {
          value: createMethodCaller(publicMethodsConfig[key]),
          writable: true,
          configurable: true
        };
      }

      return descriptors;
    }

    function getTrackHash(target) {
      const track$$1 = target.track;

      if (!getOwnPropertyDescriptor(target, 'track') || !track$$1 || !getOwnPropertyNames(track$$1).length) {
        return EmptyObject;
      } // TODO: check that anything in `track` is correctly defined in the prototype


      return assign(create(null), track$$1);
    }

    function getWireHash(target) {
      const wire$$1 = target.wire;

      if (!getOwnPropertyDescriptor(target, 'wire') || !wire$$1 || !getOwnPropertyNames(wire$$1).length) {
        return;
      } // TODO: check that anything in `wire` is correctly defined in the prototype


      return assign(create(null), wire$$1);
    }

    function getPublicPropertiesHash(target) {
      const props = target.publicProps;

      if (!getOwnPropertyDescriptor(target, 'publicProps') || !props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
      }

      return getOwnPropertyNames(props).reduce((propsHash, propName) => {
        const attrName = getAttrNameFromPropName(propName);

        if (process.env.NODE_ENV !== 'production') {
          const globalHTMLProperty = getGlobalHTMLPropertiesInfo()[propName];

          if (globalHTMLProperty && globalHTMLProperty.attribute && globalHTMLProperty.reflective === false) {
            const {
              error,
              attribute,
              experimental
            } = globalHTMLProperty;
            const msg = [];

            if (error) {
              msg.push(error);
            } else if (experimental) {
              msg.push(`"${propName}" is an experimental property that is not standardized or supported by all browsers. You should not use "${propName}" and attribute "${attribute}" in your component.`);
            } else {
              msg.push(`"${propName}" is a global HTML property. Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
              msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
              msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
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
      const publicMethods = target.publicMethods;

      if (!getOwnPropertyDescriptor(target, 'publicMethods') || !publicMethods || !publicMethods.length) {
        return EmptyObject;
      }

      return publicMethods.reduce((methodsHash, methodName) => {
        if (process.env.NODE_ENV !== 'production') {
          assert.isTrue(isFunction(target.prototype[methodName]), `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
        }

        methodsHash[methodName] = target.prototype[methodName];
        return methodsHash;
      }, create(null));
    }

    function getComponentDef(Ctor) {
      let def = CtorToDefMap.get(Ctor);

      if (def) {
        return def;
      }

      def = createComponentDef(Ctor);
      CtorToDefMap.set(Ctor, def);
      return def;
    }

    const HTML_PROPS = create(null);
    const GLOBAL_PROPS_DESCRIPTORS = create(null);
    const globalElmProto = create(BaseCustomElementProto);
    const globalElmDescriptors = create(null, {
      // this symbol is used as a flag for html-element.ts to determine if
      // the element needs some patches of the proto chain of not. Which
      // helps for the cases when a Web Component is created via the global
      // registry.
      [PatchedFlag]: {}
    });

    let globalInitialization = () => {
      // Note: this routine is just to solve the circular dependencies mess introduced by rollup.
      forEach.call(ElementAOMPropertyNames, propName => {
        // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
        // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
        const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);

        if (!isUndefined(descriptor)) {
          const attrName = getAttrNameFromPropName(propName);
          HTML_PROPS[propName] = {
            config: 3,
            type: 'any',
            attr: attrName
          };
          const globalElmDescriptor = globalElmDescriptors[propName] = {
            get: createGetter(propName),
            set: createSetter(propName),
            enumerable: true,
            configurable: true
          };
          defineProperty(globalElmProto, propName, globalElmDescriptor);
          GLOBAL_PROPS_DESCRIPTORS[propName] = descriptor;
        }
      });
      forEach.call(defaultDefHTMLPropertyNames, propName => {
        // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
        // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
        // this category, so, better to be sure.
        const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);

        if (!isUndefined(descriptor)) {
          const attrName = getAttrNameFromPropName(propName);
          HTML_PROPS[propName] = {
            config: 3,
            type: 'any',
            attr: attrName
          };
          const globalElmDescriptor = globalElmDescriptors[propName] = {
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
      globalInitialization = void 0;
    };
    /**
    @license
    Copyright (c) 2015 Simon Friis Vindum.
    This code may only be used under the MIT License found at
    https://github.com/snabbdom/snabbdom/blob/master/LICENSE
    Code distributed by Snabbdom as part of the Snabbdom project at
    https://github.com/snabbdom/snabbdom/
    */


    const {
      isArray: isArray$3
    } = Array;
    const ELEMENT_NODE$1 = 1,
          TEXT_NODE$1 = 3,
          COMMENT_NODE$1 = 8,
          DOCUMENT_FRAGMENT_NODE = 11;

    function isUndef(s) {
      return s === undefined;
    }

    function isDef(s) {
      return s !== undefined;
    }

    const emptyNode = {
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
      const map = {};
      let i, key, ch;

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

    const hooks$1 = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

    function init$1(modules, api, compareFn) {
      const cbs = {};
      let i, j;
      const sameVnode = isUndef(compareFn) ? defaultCompareFn : compareFn;

      for (i = 0; i < hooks$1.length; ++i) {
        cbs[hooks$1[i]] = [];

        for (j = 0; j < modules.length; ++j) {
          const hook = modules[j][hooks$1[i]];

          if (hook !== undefined) {
            cbs[hooks$1[i]].push(hook);
          }
        }
      }

      function createRmCb(childElm, listeners) {
        return function rmCb() {
          if (--listeners === 0) {
            const parent = api.parentNode(childElm);
            api.removeChild(parent, childElm);
          }
        };
      }

      function createElm(vnode, insertedVnodeQueue) {
        let i;
        const {
          data
        } = vnode;

        if (!isUndef(data)) {
          if (isDef(i = data.hook) && isDef(i = i.init)) {
            i(vnode);
          }
        }

        if (isElementVNode(vnode)) {
          const {
            data,
            tag
          } = vnode;
          const elm = vnode.elm = isDef(i = data.ns) ? api.createElementNS(i, tag, data.uid) : api.createElement(tag, data.uid);

          if (isDef(i = data.hook) && isDef(i.create)) {
            i.create(emptyNode, vnode);
          }

          for (i = 0; i < cbs.create.length; ++i) {
            cbs.create[i](emptyNode, vnode);
          }

          const {
            children
          } = vnode;

          if (isArray$3(children)) {
            for (i = 0; i < children.length; ++i) {
              const ch = children[i];

              if (isVNode(ch)) {
                api.appendChild(elm, createElm(ch, insertedVnodeQueue));
              }
            }
          } else if (!isUndef(vnode.text)) {
            api.appendChild(elm, api.createTextNode(vnode.text, vnode.data.uid));
          }

          if (isDef(i = data.hook) && isDef(i.insert)) {
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
          const ch = vnodes[startIdx];

          if (isVNode(ch)) {
            api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
          }
        }
      }

      function invokeDestroyHook(vnode) {
        const {
          data
        } = vnode;
        let i, j;

        if (isDef(i = data.hook) && isDef(i = i.destroy)) {
          i(vnode);
        }

        for (i = 0; i < cbs.destroy.length; ++i) {
          cbs.destroy[i](vnode);
        }

        const {
          children
        } = vnode;

        if (isUndef(children)) {
          return;
        }

        for (j = 0; j < children.length; ++j) {
          const n = children[j];

          if (isVNode(n) && !isTextVNode(n)) {
            invokeDestroyHook(n);
          }
        }
      }

      function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
          const ch = vnodes[startIdx];
          let i, listeners, rm; // text nodes do not have logic associated to them

          if (isVNode(ch)) {
            if (!isTextVNode(ch)) {
              listeners = cbs.remove.length + 1;
              rm = createRmCb(ch.elm, listeners);

              for (i = 0; i < cbs.remove.length; ++i) {
                cbs.remove[i](ch, rm);
              }

              if (isDef(i = ch.data.hook) && isDef(i = i.remove)) {
                i(ch, rm);
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
        let oldStartIdx = 0,
            newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let oldKeyToIdx;
        let idxInOld;
        let elmToMove;
        let before;

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
            const n = newCh[newEndIdx + 1];
            before = isVNode(n) ? n.elm : null;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
          } else {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
          }
        }
      }

      function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        let i, hook;

        if (isDef(i = vnode.data)) {
          hook = i.hook;
        }

        if (isDef(hook) && isDef(i = hook.prepatch)) {
          i(oldVnode, vnode);
        }

        const elm = vnode.elm = oldVnode.elm;

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

        const oldCh = oldVnode.children;
        const ch = vnode.children;

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

      const patch = function patch(oldVnode, vnode) {
        if (!isVNode(oldVnode) || !isVNode(vnode)) {
          throw new TypeError();
        }

        let i, n, elm, parent;
        const {
          pre,
          post
        } = cbs;
        const insertedVnodeQueue = [];

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

        let i, n;
        const {
          pre,
          post
        } = cbs;
        const insertedVnodeQueue = [];

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

    const EspecialTagAndPropMap = create(null, {
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
      const props = vnode.data.props;

      if (isUndefined(props)) {
        return;
      }

      const oldProps = oldVnode.data.props;

      if (oldProps === props) {
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldProps) || keys(oldProps).join(',') === keys(props).join(','), `vnode.data.props cannot change shape.`);
      }

      let key;
      let cur;
      const elm = vnode.elm;
      const vm = getInternalField(elm, ViewModelReflection);
      const isFirstPatch = isUndefined(oldProps);
      const isCustomElement = !isUndefined(vm);
      const {
        sel
      } = vnode;

      for (key in props) {
        cur = props[key];

        if (process.env.NODE_ENV !== 'production') {
          if (!(key in elm)) {
            // TODO: this should never really happen because the compiler should always validate
            assert.fail(`Unknown public property "${key}" of element <${StringToLowerCase.call(elementTagNameGetter.call(elm))}>. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(key)}".`);
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
                assert.logWarning(`Possible insufficient validation for property "${toString(key)}" in ${toString(vm)}. If the value is set to \`undefined\`, the component is not normalizing it.`);
              }
            } else {
              if (isString(elm[key])) {
                assert.logWarning(`Invalid initial \`undefined\` value for for property "${toString(key)}" in Element ${toString(elm)}, it will be casted to String.`);
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

    const propsModule = {
      create: update,
      update
    };
    const xlinkNS = 'http://www.w3.org/1999/xlink';
    const xmlNS = 'http://www.w3.org/XML/1998/namespace';
    const ColonCharCode = 58;

    function updateAttrs(oldVnode, vnode) {
      const {
        data: {
          attrs
        }
      } = vnode;

      if (isUndefined(attrs)) {
        return;
      }

      let {
        data: {
          attrs: oldAttrs
        }
      } = oldVnode;

      if (oldAttrs === attrs) {
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldAttrs) || keys(oldAttrs).join(',') === keys(attrs).join(','), `vnode.data.attrs cannot change shape.`);
      }

      const elm = vnode.elm;
      let key;
      oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs; // update modified attributes, add new attributes
      // this routine is only useful for data-* attributes in all kind of elements
      // and aria-* in standard elements (custom elements will use props for these)

      for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];

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

    const attributesModule = {
      create: updateAttrs,
      update: updateAttrs
    };

    function updateStyle(oldVnode, vnode) {
      const {
        style: newStyle
      } = vnode.data;

      if (isUndefined(newStyle)) {
        return;
      }

      let {
        style: oldStyle
      } = oldVnode.data;

      if (oldStyle === newStyle) {
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldStyle) || typeof newStyle === typeof oldStyle, `vnode.data.style cannot change types.`);
      }

      let name;
      const elm = vnode.elm;
      const {
        style
      } = elm;

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
          const cur = newStyle[name];

          if (cur !== oldStyle[name]) {
            style[name] = cur;
          }
        }
      }
    }

    const styleModule = {
      create: updateStyle,
      update: updateStyle
    };

    function updateClass(oldVnode, vnode) {
      const {
        elm,
        data: {
          class: klass
        }
      } = vnode;

      if (isUndefined(klass)) {
        return;
      }

      let {
        data: {
          class: oldClass
        }
      } = oldVnode;

      if (oldClass === klass) {
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldClass) || typeof oldClass === typeof klass, `vnode.data.class cannot change types.`);
      }

      const {
        classList
      } = elm;
      let name;
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
      const {
        type
      } = event;
      const {
        data: {
          on
        }
      } = vnode;
      const handler = on && on[type]; // call event handler if exists

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
      const {
        data: {
          on
        },
        listener
      } = vnode;

      if (on && listener) {
        const elm = vnode.elm;
        let name;

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
      const {
        data: {
          on
        }
      } = vnode;

      if (isUndefined(on)) {
        return;
      }

      const elm = vnode.elm;
      const listener = vnode.listener = createListener();
      listener.vnode = vnode;
      let name;

      for (name in on) {
        elm.addEventListener(name, listener);
      }
    }

    const eventListenersModule = {
      update: updateAllEventListeners,
      create: createAllEventListeners,
      destroy: removeAllEventListeners
    };

    function updateToken(oldVnode, vnode) {
      const {
        data: {
          token: oldToken
        }
      } = oldVnode;
      const {
        data: {
          token: newToken
        }
      } = vnode;

      if (oldToken === newToken) {
        return;
      }

      const elm = vnode.elm;

      if (!isUndefined(oldToken)) {
        removeAttribute$2.call(elm, oldToken);
      }

      if (!isUndefined(newToken)) {
        setAttribute$2.call(elm, newToken, '');
      }
    }

    const tokenModule = {
      create: updateToken,
      update: updateToken
    };
    const {
      createElement,
      createElementNS,
      createTextNode,
      createComment,
      createDocumentFragment
    } = document;
    const {
      insertBefore: insertBefore$1,
      removeChild: removeChild$1,
      appendChild: appendChild$1
    } = Node.prototype;

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

    const htmlDomApi = {
      createFragment() {
        return createDocumentFragment.call(document);
      },

      createElement(tagName, uid) {
        const element = createElement.call(document, tagName);
        setNodeOwnerKey(element, uid);

        if (process.env.NODE_ENV !== 'production') {
          if (tagName === 'slot') {
            patchSlotElementWithRestrictions(element);
          }
        }

        return element;
      },

      createElementNS(namespaceURI, qualifiedName, uid) {
        const element = createElementNS.call(document, namespaceURI, qualifiedName);
        setNodeOwnerKey(element, uid);
        return element;
      },

      createTextNode(text, uid) {
        const textNode = createTextNode.call(document, text);
        setNodeOwnerKey(textNode, uid);
        return textNode;
      },

      createComment(text, uid) {
        const comment = createComment.call(document, text);
        setNodeOwnerKey(comment, uid);
        return comment;
      },

      insertBefore(parent, newNode, referenceNode) {
        const vm = getInternalField(parent, ViewModelReflection);
        parent = remapNodeIfFallbackIsNeeded(vm, parent);
        insertBefore$1.call(parent, newNode, referenceNode);
      },

      removeChild(node, child) {
        if (!isNull(node)) {
          const vm = getInternalField(node, ViewModelReflection);
          node = remapNodeIfFallbackIsNeeded(vm, node);
          removeChild$1.call(node, child);
        }
      },

      appendChild(node, child) {
        const vm = getInternalField(node, ViewModelReflection);

        if (process.env.NODE_ENV !== 'production') {
          if (!isUndefined(vm) && isTrue(vm.fallback)) {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.invariant(vm.elm !== node, `Internal Error: no insertion should be carry on host element directly when running in fallback mode.`);
          }
        }

        node = remapNodeIfFallbackIsNeeded(vm, node);
        appendChild$1.call(node, child);
      },

      parentNode,
      nextSibling,
      setTextContent
    };
    const patchVNode = init$1([// Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    attributesModule, propsModule, classes, styleModule, eventListenersModule, tokenModule], htmlDomApi);
    const patchChildren = patchVNode.children;
    const isNativeShadowRootAvailable$2 = typeof window.ShadowRoot !== "undefined";
    let idx = 0;
    let uid = 0;

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


    const OwnerKey$1 = '$$OwnerKey$$';
    const OwnKey$1 = '$$OwnKey$$';

    function addInsertionIndex(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.invariant(vm.idx === 0, `${vm} is already locked to a previously generated idx.`);
      }

      vm.idx = ++idx;
      const {
        connected
      } = Services;

      if (connected) {
        invokeServiceHook(vm, connected);
      }

      const {
        connectedCallback
      } = vm.def;

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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.invariant(vm.idx > 0, `${vm} is not locked to a previously generated idx.`);
      }

      vm.idx = 0;
      const {
        disconnected
      } = Services;

      if (disconnected) {
        invokeServiceHook(vm, disconnected);
      }

      const {
        disconnectedCallback
      } = vm.def;

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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      if (vm.isDirty) {
        rehydrate(vm);
      }
    }

    function appendVM(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      if (vm.idx !== 0) {
        return; // already appended
      }

      addInsertionIndex(vm);
    }

    function removeVM(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
        assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element instead of ${elm}.`);
      }

      const def = getComponentDef(Ctor);
      const {
        isRoot,
        mode
      } = options;
      const fallback = isTrue(options.fallback) || isFalse(isNativeShadowRootAvailable$2);

      if (fallback) {
        patchCustomElement(elm);
      }

      uid += 1;
      const vm = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot: isTrue(isRoot),
        fallback,
        mode,
        def,
        elm: elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots: fallback ? create(null) : undefined,
        cmpTemplate: undefined,
        cmpRoot: elm.attachShadow(options),
        callHook,
        setHook,
        getHook,
        component: undefined,
        children: EmptyArray,
        // used to track down all object-key pairs that makes this vm reactive
        deps: []
      };

      if (process.env.NODE_ENV !== 'production') {
        vm.toString = () => {
          return `[object:vm ${def.name} (${vm.idx})]`;
        };
      } // create component instance associated to the vm and the element


      createComponent(vm, Ctor); // link component to the wire service

      linkComponent(vm);
    }

    function rehydrate(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(vm.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
      }

      if (vm.idx > 0 && vm.isDirty) {
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
      }
    }

    function patchErrorBoundaryVm(errorBoundaryVm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(errorBoundaryVm && "component" in errorBoundaryVm, `${errorBoundaryVm} is not a vm.`);
        assert.isTrue(errorBoundaryVm.elm instanceof HTMLElement, `rehydration can only happen after ${errorBoundaryVm} was patched the first time.`);
        assert.isTrue(errorBoundaryVm.isDirty, "rehydration recovery should only happen if vm has updated");
      }

      const children = renderComponent(errorBoundaryVm);
      const {
        cmpRoot,
        children: oldCh
      } = errorBoundaryVm;
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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const {
        cmpRoot,
        children: oldCh
      } = vm;
      vm.children = children; // caching the new children collection

      if (children.length === 0 && oldCh.length === 0) {
        return; // nothing to do here
      }

      let error;

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
          const errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);

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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const {
        rendered
      } = Services;

      if (rendered) {
        invokeServiceHook(vm, rendered);
      }

      const {
        renderedCallback
      } = vm.def;

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

    let rehydrateQueue = [];

    function flushRehydrationQueue() {
      if (process.env.NODE_ENV !== 'production') {
        assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
      }

      const vms = rehydrateQueue.sort((a, b) => a.idx - b.idx);
      rehydrateQueue = []; // reset to a new queue

      for (let i = 0, len = vms.length; i < len; i += 1) {
        const vm = vms[i];

        try {
          rehydrate(vm);
        } catch (error) {
          const errorBoundaryVm = getErrorBoundaryVMFromParentElement(vm);

          if (isUndefined(errorBoundaryVm)) {
            if (i + 1 < len) {
              // pieces of the queue are still pending to be rehydrated, those should have priority
              if (rehydrateQueue.length === 0) {
                addCallbackToNextTick(flushRehydrationQueue);
              }

              ArrayUnshift.apply(rehydrateQueue, ArraySlice.call(vms, i + 1));
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

      const {
        errorCallback
      } = errorBoundaryVm.def;

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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const parentElm = vm.fallback ? vm.elm : vm.cmpRoot;
      parentElm.innerHTML = "";
    }

    function resetShadowRoot(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const {
        cmpRoot,
        children: oldCh
      } = vm;
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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const {
        elm
      } = vm; // TODO: bug #435 - shadowDOM will preventing this walking process, we
      // need to find a different way to find the right boundary

      const parentElm = elm && parentElementGetter$1.call(elm);
      return getErrorBoundaryVM(parentElm);
    }

    function getErrorBoundaryVMFromOwnElement(vm) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      const {
        elm
      } = vm;
      return getErrorBoundaryVM(elm);
    }

    function getErrorBoundaryVM(startingElement) {
      let elm = startingElement;
      let vm;

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
      const wcStack = [];
      let elm = vm.elm;

      do {
        const currentVm = getInternalField(elm, ViewModelReflection);

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
          value,
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
          value,
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
      const vm = getInternalField(sr, ViewModelReflection);

      if (isUndefined(vm)) {
        return null;
      }

      return vm.elm;
    }

    function getCustomElementVM(elm) {
      if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(elm, ViewModelReflection);
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      return getInternalField(elm, ViewModelReflection);
    }

    function getComponentVM(component) {
      // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
      if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(component, ViewModelReflection);
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      return getInternalField(component, ViewModelReflection);
    }

    function getShadowRootVM(root) {
      // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
      if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(root, ViewModelReflection);
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
      }

      return getInternalField(root, ViewModelReflection);
    } // slow path routine
    // NOTE: we should probably more this routine to the faux shadow folder
    // and get the allocation to be cached by in the elm instead of in the VM


    function allocateInSlot(vm, children) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.invariant(isObject(vm.cmpSlots), `When doing manual allocation, there must be a cmpSlots object available.`);
      }

      const {
        cmpSlots: oldSlots
      } = vm;
      const cmpSlots = vm.cmpSlots = create(null);

      for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];

        if (isNull(vnode)) {
          continue;
        }

        const data = vnode.data;
        const slotName = data.attrs && data.attrs.slot || '';
        const vnodes = cmpSlots[slotName] = cmpSlots[slotName] || [];
        vnodes.push(vnode);
      }

      if (!vm.isDirty) {
        // We need to determine if the old allocation is really different from the new one
        // and mark the vm as dirty
        const oldKeys = keys(oldSlots);

        if (oldKeys.length !== keys(cmpSlots).length) {
          markComponentAsDirty(vm);
          return;
        }

        for (let i = 0, len = oldKeys.length; i < len; i += 1) {
          const key = oldKeys[i];

          if (isUndefined(cmpSlots[key]) || oldSlots[key].length !== cmpSlots[key].length) {
            markComponentAsDirty(vm);
            return;
          }

          const oldVNodes = oldSlots[key];
          const vnodes = cmpSlots[key];

          for (let j = 0, a = cmpSlots[key].length; j < a; j += 1) {
            if (oldVNodes[j] !== vnodes[j]) {
              markComponentAsDirty(vm);
              return;
            }
          }
        }
      }
    }

    const {
      removeChild: removeChild$2,
      appendChild: appendChild$2,
      insertBefore: insertBefore$2,
      replaceChild
    } = Node.prototype;
    const ConnectingSlot = createFieldName('connecting');
    const DisconnectingSlot = createFieldName('disconnecting');

    function callNodeSlot(node, slot) {
      if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
      }

      const fn = getInternalField(node, slot);

      if (!isUndefined(fn)) {
        fn();
      }

      return node; // for convenience
    } // monkey patching Node methods to be able to detect the insertions and removal of
    // root elements created via createElement.


    assign(Node.prototype, {
      appendChild(newChild) {
        const appendedNode = appendChild$2.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
      },

      insertBefore(newChild, referenceNode) {
        const insertedNode = insertBefore$2.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
      },

      removeChild(oldChild) {
        const removedNode = removeChild$2.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
      },

      replaceChild(newChild, oldChild) {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
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

    function createElement$1(sel, options = {}) {
      if (!isObject(options) || isNull(options)) {
        throw new TypeError();
      }

      let Ctor = options.is;

      if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
      }

      let {
        mode,
        fallback
      } = options; // TODO: for now, we default to open, but eventually it should default to 'closed'

      if (mode !== 'closed') {
        mode = 'open';
      } // TODO: for now, we default to true, but eventually it should default to false


      if (fallback !== false) {
        fallback = true;
      } // extracting the registered constructor just in case we need to force the tagName


      const {
        forceTagName
      } = Ctor;
      const tagName = isUndefined(forceTagName) ? sel : forceTagName; // Create element with correct tagName

      const element = document.createElement(tagName);

      if (!isUndefined(getNodeKey$1(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
      } // In case the element is not initialized already, we need to carry on the manual creation


      createVM(sel, element, Ctor, {
        mode,
        fallback,
        isRoot: true
      }); // Handle insertion and removal from the DOM manually

      setInternalField(element, ConnectingSlot, () => {
        const vm = getCustomElementVM(element);
        removeVM(vm); // moving the element from one place to another is observable via life-cycle hooks

        appendVM(vm); // TODO: this is the kind of awkwardness introduced by "is" attribute
        // We don't want to do this during construction because it breaks another
        // WC invariant.

        if (!isUndefined(forceTagName)) {
          setAttribute$2.call(element, 'is', sel);
        }

        renderVM(vm);
      });
      setInternalField(element, DisconnectingSlot, () => {
        const vm = getCustomElementVM(element);
        removeVM(vm);
      });
      return element;
    } // when used with exactly one argument, we assume it is a function invocation.
    /** version: 0.24.12 */

    const style = undefined;

    const style$1 = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;

      return [api_element("div", {
        key: 1
      }, [api_dynamic($cmp.x)])];
    }

    if (style$1) {
        tmpl.hostToken = 'x-foo_foo-host';
        tmpl.shadowToken = 'x-foo_foo';

        const style = document.createElement('style');
        style.type = 'text/css';
        style.dataset.token = 'x-foo_foo';
        style.textContent = style$1('x-foo_foo');
        document.head.appendChild(style);
    }

    class Foo extends LightningElement {
      constructor(...args) {
        var _temp;

        return _temp = super(...args), this.x = void 0, _temp;
      }

      render() {
        return tmpl;
      }

    }
    Foo.publicProps = {
      x: {
        config: 0
      }
    };

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        h: api_element
      } = $api;

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
        tmpl$1.hostToken = 'x-app_app-host';
        tmpl$1.shadowToken = 'x-app_app';

        const style$$1 = document.createElement('style');
        style$$1.type = 'text/css';
        style$$1.dataset.token = 'x-app_app';
        style$$1.textContent = style('x-app_app');
        document.head.appendChild(style$$1);
    }

    class App extends LightningElement {
      constructor() {
        super();
        this.list = [];
      }

      render() {
        return tmpl$1;
      }

    }

    const container = document.getElementById('main');
    const element = createElement$1('x-app', {
      is: App
    });
    container.appendChild(element);

}());
