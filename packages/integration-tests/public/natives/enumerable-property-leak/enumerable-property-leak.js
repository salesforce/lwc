(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __iterableKey = Proxy.iterableKey;

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
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("p", {
      classMap: {
        "object-enumerable-properties": true
      },
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("objectEnumerableProperties") : $cmp.objectEnumerableProperties)]), api_element("p", {
      classMap: {
        "array-enumerable-properties": true
      },
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("arrayEnumerableProperties") : $cmp.arrayEnumerableProperties)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-enumerable-property-leak_enumerable-property-leak-host",
    shadowAttribute: "integration-enumerable-property-leak_enumerable-property-leak"
  });

  var EnumerablePropertyLeak =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(EnumerablePropertyLeak, _LightningElement);

    function EnumerablePropertyLeak() {
      _classCallCheck(this, EnumerablePropertyLeak);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(EnumerablePropertyLeak), "apply", this, arguments));
    }

    _createClass(EnumerablePropertyLeak, [{
      key: "objectEnumerableProperties",
      get: function get() {
        var properties = [];
        var obj = {
          x: 'x',
          y: 'y'
        };

        for (var property in __iterableKey(obj)) {
          properties.push(property);
        }

        return properties;
      }
    }, {
      key: "arrayEnumerableProperties",
      get: function get() {
        var properties = [];
        var array = ['x', 'y'];

        for (var property in __iterableKey(array)) {
          properties.push(property);
        }

        return properties;
      }
    }]);

    return EnumerablePropertyLeak;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(EnumerablePropertyLeak, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-enumerable-property-leak', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
