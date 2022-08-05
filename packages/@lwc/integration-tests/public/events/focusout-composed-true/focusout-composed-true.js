(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey3 = Proxy.callKey3;

  var __callKey2 = Proxy.callKey2;

  var __setKey = Proxy.setKey;

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
    Object.compatDefineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
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

    Object.compatDefineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
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
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  var stc0 = {
    "type": "text"
  };
  var stc1 = {
    "custom-focus-out": true
  };
  var stc2 = {
    classMap: {
      "focus-out-composed": true
    },
    key: 3
  };
  var stc3 = {
    classMap: {
      "custom-focus-out-not-composed": true
    },
    key: 4
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2;

    return [api_element("input", {
      attrs: stc0,
      key: 0,
      on: {
        "focusout": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusOut") : $cmp.handleFocusOut))
      }
    }), api_element("input", {
      classMap: stc1,
      attrs: stc0,
      key: 1,
      on: {
        "focusout": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleCustomFocusOut") : $cmp.handleCustomFocusOut))
      }
    }), api_element("button", {
      key: 2,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleButtonClick") : $cmp.handleButtonClick))
      }
    }, [api_text("Trigger custom focusout")]), ($cmp._ES5ProxyType ? $cmp.get("eventIsComposed") : $cmp.eventIsComposed) ? api_element("div", stc2, [api_text("Focus Out Composed")]) : null, ($cmp._ES5ProxyType ? $cmp.get("customEventNotComposed") : $cmp.customEventNotComposed) ? api_element("div", stc3, [api_text("Custom Focus Out Not Composed")]) : null];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var FocusOutComposedTrue = /*#__PURE__*/function (_LightningElement) {
    _inherits(FocusOutComposedTrue, _LightningElement);

    var _super = _createSuper(FocusOutComposedTrue);

    function FocusOutComposedTrue() {
      var _this;

      _classCallCheck(this, FocusOutComposedTrue);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

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
      /*LWC compiler v2.11.8*/

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

  var element = lwc.createElement('integration-focusout-composed-true', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
