(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

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
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;
    return [api_element("div", {
      classMap: {
        "message-assert": true
      },
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("message") : $cmp.message)]), api_element("ul", {
      classMap: {
        "iterate-list": true
      },
      key: 3
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("items") : $cmp.items, function (xValue, xIndex, xFirst, xLast) {
      return api_element("li", {
        key: api_key(5, xValue)
      }, [api_dynamic(xValue)]);
    }))];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-function-arguments_function-arguments-host",
    shadowAttribute: "integration-function-arguments_function-arguments"
  });

  function argumentsIterate() {
    var res = [];

    for (var i = 0; i < arguments.length; i += 1) {
      res.push(arguments[i] + 1);
    }

    return res;
  }

  function argumentsTest() {
    return arguments[0]._ES5ProxyType ? arguments[0].get("foo") : arguments[0].foo;
  }

  var FunctionArguments =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(FunctionArguments, _LightningElement);

    function FunctionArguments() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, FunctionArguments);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(FunctionArguments), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "message", '');

      return _this;
    }

    _createClass(FunctionArguments, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        __setKey(this, "message", argumentsTest({
          foo: 'bar'
        }));
      }
    }, {
      key: "items",
      get: function get() {
        return argumentsIterate(1, 2, 3);
      }
    }]);

    return FunctionArguments;
  }(lwc.LightningElement);

  lwc.registerDecorators(FunctionArguments, {
    track: {
      message: 1
    }
  });

  var Cmp = lwc.registerComponent(FunctionArguments, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-function-arguments', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
