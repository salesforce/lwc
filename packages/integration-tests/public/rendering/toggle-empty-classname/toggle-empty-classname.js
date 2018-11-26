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
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("div", {
      className: $cmp._ES5ProxyType ? $cmp.get("computedClassName") : $cmp.computedClassName,
      key: 2,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Classname")])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-toggle-empty-classname_toggle-empty-classname-host",
    shadowAttribute: "integration-toggle-empty-classname_toggle-empty-classname"
  });

  var EmptyClassname =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(EmptyClassname, _LightningElement);

    function EmptyClassname() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, EmptyClassname);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(EmptyClassname), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "computedClassName", 'foo');

      return _this;
    }

    _createClass(EmptyClassname, [{
      key: "handleClick",
      value: function handleClick() {
        __setKey(this, "computedClassName", '');
      }
    }]);

    return EmptyClassname;
  }(lwc.LightningElement);

  lwc.registerDecorators(EmptyClassname, {
    track: {
      computedClassName: 1
    }
  });

  var Cmp = lwc.registerComponent(EmptyClassname, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-toggle-empty-classname', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
