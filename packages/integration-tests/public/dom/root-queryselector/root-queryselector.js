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
    var _state, _error, _state2, _error2, _state3, _error3;

    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("div", {
      classMap: {
        "error": true
      },
      key: 2
    }, [api_dynamic((_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error))]) : null, !(_state3 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error3 = _state3._ES5ProxyType ? _state3.get("error") : _state3.error) ? api_element("div", {
      classMap: {
        "no-error": true
      },
      key: 3
    }, [api_text("No Error")]) : null];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-root-queryselector_root-queryselector-host",
    shadowAttribute: "integration-root-queryselector_root-queryselector"
  });

  var RootQuerySelector =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RootQuerySelector, _LightningElement);

    function RootQuerySelector() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, RootQuerySelector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(RootQuerySelector), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        error: undefined
      });

      return _this;
    }

    _createClass(RootQuerySelector, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        var _state, _error;

        if (_state = this._ES5ProxyType ? this.get("state") : this.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) {
          return;
        }

        try {
          __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelectorAll", 'div');
        } catch (e) {
          __setKey(this._ES5ProxyType ? this.get("state") : this.state, "error", e);
        }
      }
    }]);

    return RootQuerySelector;
  }(lwc.LightningElement);

  lwc.registerDecorators(RootQuerySelector, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(RootQuerySelector, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-root-queryselector', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
