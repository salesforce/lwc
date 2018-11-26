(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __instanceOfKey = Proxy.instanceOfKey;

  function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && (right._ES5ProxyType ? right.get(Symbol.hasInstance) : right[Symbol.hasInstance])) {
      return __callKey1(right, Symbol.hasInstance, left);
    } else {
      return __instanceOfKey(left, right);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var __setKey = Proxy.setKey;

  var __inKey = Proxy.inKey;

  function _defineProperties(target, props) {
    for (var i = 0; i < (props._ES5ProxyType ? props.get("length") : props.length); i++) {
      var descriptor = props._ES5ProxyType ? props.get(i) : props[i];

      __setKey(descriptor, "enumerable", (descriptor._ES5ProxyType ? descriptor.get("enumerable") : descriptor.enumerable) || false);

      __setKey(descriptor, "configurable", true);

      if (__inKey(descriptor, "value")) __setKey(descriptor, "writable", true);
      Object.compatDefineProperty(target, descriptor._ES5ProxyType ? descriptor.get("key") : descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor._ES5ProxyType ? Constructor.get("prototype") : Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

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

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      __setKey(o, "__proto__", p);

      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    __setKey(subClass, "prototype", Object.create(superClass && (superClass._ES5ProxyType ? superClass.get("prototype") : superClass.prototype), {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    }));

    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      key: 2
    }, [api_text("Is Array Prototype: "), api_element("span", {
      classMap: {
        "is-array-prototype": true
      },
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("isArrayPrototype") : $cmp.isArrayPrototype)])]), api_element("div", {
      key: 4
    }, [api_text("Proxy is Document: "), api_element("span", {
      classMap: {
        "proxy-is-document": true
      },
      key: 5
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("isProxyPrototypeDocument") : $cmp.isProxyPrototypeDocument)])]), api_element("div", {
      key: 6
    }, [api_text("Proxy is Array: "), api_element("span", {
      classMap: {
        "proxy-is-array": true
      },
      key: 7
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("isProxyPrototypeArray") : $cmp.isProxyPrototypeArray)])]), api_element("div", {
      key: 8
    }, [api_text("Prototype equals argument from setPrototypeOf: "), api_element("span", {
      classMap: {
        "correct-prototype": true
      },
      key: 9
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("extractedCorrectPrototype") : $cmp.extractedCorrectPrototype)])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-object-setprototypeof_object-setprototypeof-host",
    shadowAttribute: "integration-object-setprototypeof_object-setprototypeof"
  });

  var ObjectSetPrototypeOf =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ObjectSetPrototypeOf, _LightningElement);

    function ObjectSetPrototypeOf() {
      _classCallCheck(this, ObjectSetPrototypeOf);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(ObjectSetPrototypeOf), "apply", this, arguments));
    }

    _createClass(ObjectSetPrototypeOf, [{
      key: "isArrayPrototype",
      get: function get() {
        var obj = {};
        Object.setPrototypeOf(obj, []);
        return _instanceof(obj, Array);
      }
    }, {
      key: "isProxyPrototypeDocument",
      get: function get() {
        var proxy = new Proxy({}, {
          setPrototypeOf: function setPrototypeOf(target, proto) {
            return Object.setPrototypeOf(target, document);
          }
        });
        Object.setPrototypeOf(proxy, []);
        return _instanceof(proxy, Document);
      }
    }, {
      key: "isProxyPrototypeArray",
      get: function get() {
        var proxy = new Proxy({}, {
          setPrototypeOf: function setPrototypeOf(target, proto) {
            return Object.setPrototypeOf(target, document);
          }
        });
        Object.setPrototypeOf(proxy, []);
        return _instanceof(proxy, Array);
      }
    }, {
      key: "extractedCorrectPrototype",
      get: function get() {
        var obj = {};
        var proto = [];
        Object.setPrototypeOf(obj, proto);
        return Object.getPrototypeOf(obj) === proto;
      }
    }]);

    return ObjectSetPrototypeOf;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(ObjectSetPrototypeOf, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-object-setprototypeof', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
