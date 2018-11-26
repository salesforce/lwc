(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __inKey = Proxy.inKey;

  var __setKey = Proxy.setKey;

  function _defineProperty(obj, key, value) {
    if (__inKey(obj, key)) {
      Object.compatDefineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      __setKey(obj, key, value);
    }

    return obj;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

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
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      classMap: {
        "object-stringify": true
      },
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("objectStringify") : $cmp.objectStringify)]), api_element("div", {
      classMap: {
        "array-stringify": true
      },
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayStringify") : $cmp.arrayStringify)]), api_element("div", {
      classMap: {
        "complex-object-stringify": true
      },
      key: 4
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("complexObjectStringify") : $cmp.complexObjectStringify)]), api_element("div", {
      classMap: {
        "nested-object-stringify": true
      },
      key: 5
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("nestedObjectStringify") : $cmp.nestedObjectStringify)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-json-stringify_json-stringify-host",
    shadowAttribute: "integration-json-stringify_json-stringify"
  });

  var JsonStringify =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(JsonStringify, _LightningElement);

    function JsonStringify() {
      _classCallCheck(this, JsonStringify);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(JsonStringify), "apply", this, arguments));
    }

    _createClass(JsonStringify, [{
      key: "objectStringify",
      get: function get() {
        var arr = new Proxy({
          x: 'x',
          y: 'y'
        }, {});
        return JSON.stringify(arr);
      }
    }, {
      key: "arrayStringify",
      get: function get() {
        var arr = new Proxy([1, 2], {});
        return JSON.stringify(arr);
      }
    }, {
      key: "complexObjectStringify",
      get: function get() {
        var obj = new Proxy(_defineProperty({
          string: 'x',
          number: 1,
          boolean: true,
          undefined: undefined,
          null: null,
          object: {
            x: 'x'
          }
        }, Symbol('symbol'), true), {});
        return JSON.stringify(obj);
      }
    }, {
      key: "nestedObjectStringify",
      get: function get() {
        var nested = new Proxy({
          x: new Proxy({
            y: true
          }, {}),
          z: new Proxy([false], {})
        }, {});
        return JSON.stringify(nested);
      }
    }]);

    return JsonStringify;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(JsonStringify, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-json-stringify', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
