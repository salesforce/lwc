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
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2;

    return [api_element("input", {
      attrs: {
        "type": "text"
      },
      key: 2,
      on: {
        "focusout": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOut") : $cmp.handleFocusOut))
      }
    }, []), api_element("input", {
      classMap: {
        "custom-focus-out": true
      },
      attrs: {
        "type": "text"
      },
      key: 3,
      on: {
        "focusout": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleCustomFocusOut") : $cmp.handleCustomFocusOut))
      }
    }, []), api_element("button", {
      key: 4,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleButtonClick") : $cmp.handleButtonClick))
      }
    }, [api_text("Trigger custom focusout")]), ($cmp._ES5ProxyType ? $cmp.get("eventIsComposed") : $cmp.eventIsComposed) ? api_element("div", {
      classMap: {
        "focus-out-composed": true
      },
      key: 5
    }, [api_text("Focus Out Composed")]) : null, ($cmp._ES5ProxyType ? $cmp.get("customEventNotComposed") : $cmp.customEventNotComposed) ? api_element("div", {
      classMap: {
        "custom-focus-out-not-composed": true
      },
      key: 6
    }, [api_text("Custom Focus Out Not Composed")]) : null];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-focusout-composed-true_focusout-composed-true-host",
    shadowAttribute: "integration-focusout-composed-true_focusout-composed-true"
  });

  var FocusOutComposedTrue =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(FocusOutComposedTrue, _LightningElement);

    function FocusOutComposedTrue() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, FocusOutComposedTrue);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(FocusOutComposedTrue), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "eventIsComposed", false);

      __setKey(_this, "customEventNotComposed", false);

      return _this;
    } // Receives native focusout event


    _createClass(FocusOutComposedTrue, [{
      key: "handleFocusOut",
      value: function handleFocusOut(evt) {
        __setKey(this, "eventIsComposed", evt._ES5ProxyType ? evt.get("composed") : evt.composed);
      } // Receives custom native focusout event

    }, {
      key: "handleCustomFocusOut",
      value: function handleCustomFocusOut(evt) {
        __setKey(this, "customEventNotComposed", (evt._ES5ProxyType ? evt.get("composed") : evt.composed) === false);
      }
    }, {
      key: "handleButtonClick",
      value: function handleButtonClick() {
        __callKey1(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", '.custom-focus-out'), "dispatchEvent", new CustomEvent('focusout', {
          bubbles: true,
          composed: false
        }));
      }
    }]);

    return FocusOutComposedTrue;
  }(lwc.LightningElement);

  lwc.registerDecorators(FocusOutComposedTrue, {
    track: {
      eventIsComposed: 1,
      customEventNotComposed: 1
    }
  });

  var Cmp = lwc.registerComponent(FocusOutComposedTrue, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-focusout-composed-true', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
