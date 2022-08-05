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

  var stc0$2 = {
    "placeholder": "delegates-focus-true"
  };

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("input", {
      attrs: stc0$2,
      key: 0,
      on: {
        "focus": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    })];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$2() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var DelegatesFocusTrue = /*#__PURE__*/function (_LightningElement) {
    _inherits(DelegatesFocusTrue, _LightningElement);

    var _super = _createSuper$2(DelegatesFocusTrue);

    function DelegatesFocusTrue() {
      _classCallCheck(this, DelegatesFocusTrue);

      return __callKey2(_super, "apply", this, arguments);
    }

    _createClass(DelegatesFocusTrue, [{
      key: "handleShadowFocus",
      value: function handleShadowFocus() {
        __callKey1(this, "dispatchEvent", new CustomEvent('shadowfocus'));
      }
      /*LWC compiler v2.11.8*/

    }]);

    return DelegatesFocusTrue;
  }(lwc.LightningElement);

  __setKey(DelegatesFocusTrue, "delegatesFocus", true);

  var _integrationDelegatesFocusTrue = lwc.registerComponent(DelegatesFocusTrue, {
    tmpl: _tmpl$2
  });

  var stc0$1 = {
    "placeholder": "delegates-focus-false"
  };

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("input", {
      attrs: stc0$1,
      key: 0,
      on: {
        "focus": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    })];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$1() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var DelegatesFocusFalse = /*#__PURE__*/function (_LightningElement) {
    _inherits(DelegatesFocusFalse, _LightningElement);

    var _super = _createSuper$1(DelegatesFocusFalse);

    function DelegatesFocusFalse() {
      _classCallCheck(this, DelegatesFocusFalse);

      return __callKey2(_super, "apply", this, arguments);
    }

    _createClass(DelegatesFocusFalse, [{
      key: "handleShadowFocus",
      value: function handleShadowFocus() {
        __callKey1(this, "dispatchEvent", new CustomEvent('shadowfocus'));
      }
      /*LWC compiler v2.11.8*/

    }]);

    return DelegatesFocusFalse;
  }(lwc.LightningElement);

  __setKey(DelegatesFocusFalse, "delegatesFocus", false);

  var _integrationDelegatesFocusFalse = lwc.registerComponent(DelegatesFocusFalse, {
    tmpl: _tmpl$1
  });

  var stc0 = {
    key: 0
  };
  var stc1 = {
    key: 1
  };
  var stc2 = {
    classMap: {
      "delegates-true-tabindex-negative": true
    },
    key: 2
  };
  var stc3 = {
    key: 3
  };
  var stc4 = {
    classMap: {
      "head": true
    },
    key: 4
  };
  var stc5 = {
    "tabIndex": "-1"
  };
  var stc6 = {
    classMap: {
      "tail": true
    },
    key: 6
  };
  var stc7 = {
    classMap: {
      "delegates-true-tabindex-zero": true
    },
    key: 7
  };
  var stc8 = {
    key: 8
  };
  var stc9 = {
    classMap: {
      "head": true
    },
    key: 9
  };
  var stc10 = {
    "tabIndex": "0"
  };
  var stc11 = {
    classMap: {
      "tail": true
    },
    key: 11
  };
  var stc12 = {
    classMap: {
      "delegates-true-tabindex-none": true
    },
    key: 12
  };
  var stc13 = {
    key: 13
  };
  var stc14 = {
    classMap: {
      "head": true
    },
    key: 14
  };
  var stc15 = {
    classMap: {
      "tail": true
    },
    key: 16
  };
  var stc16 = {
    classMap: {
      "delegates-false-tabindex-negative": true
    },
    key: 17
  };
  var stc17 = {
    key: 18
  };
  var stc18 = {
    classMap: {
      "head": true
    },
    key: 19
  };
  var stc19 = {
    classMap: {
      "tail": true
    },
    key: 21
  };
  var stc20 = {
    classMap: {
      "delegates-false-tabindex-zero": true
    },
    key: 22
  };
  var stc21 = {
    key: 23
  };
  var stc22 = {
    classMap: {
      "head": true
    },
    key: 24
  };
  var stc23 = {
    classMap: {
      "tail": true
    },
    key: 26
  };
  var stc24 = {
    classMap: {
      "delegates-false-tabindex-none": true
    },
    key: 27
  };
  var stc25 = {
    key: 28
  };
  var stc26 = {
    classMap: {
      "head": true
    },
    key: 29
  };
  var stc27 = {
    classMap: {
      "tail": true
    },
    key: 31
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3,
        _m4 = $ctx._ES5ProxyType ? $ctx.get("_m4") : $ctx._m4,
        _m5 = $ctx._ES5ProxyType ? $ctx.get("_m5") : $ctx._m5,
        _m6 = $ctx._ES5ProxyType ? $ctx.get("_m6") : $ctx._m6,
        _m7 = $ctx._ES5ProxyType ? $ctx.get("_m7") : $ctx._m7,
        _m8 = $ctx._ES5ProxyType ? $ctx.get("_m8") : $ctx._m8,
        _m9 = $ctx._ES5ProxyType ? $ctx.get("_m9") : $ctx._m9,
        _m10 = $ctx._ES5ProxyType ? $ctx.get("_m10") : $ctx._m10,
        _m11 = $ctx._ES5ProxyType ? $ctx.get("_m11") : $ctx._m11;

    return [api_element("p", stc0, [api_text("host focus count: " + api_dynamic_text($cmp._ES5ProxyType ? $cmp.get("renderedHostFocusCount") : $cmp.renderedHostFocusCount))]), api_element("p", stc1, [api_text("shadow focus count: " + api_dynamic_text($cmp._ES5ProxyType ? $cmp.get("renderedShadowFocusCount") : $cmp.renderedShadowFocusCount))]), api_element("section", stc2, [api_element("h2", stc3, [api_text("delegatesFocus: true, tabindex: -1")]), api_element("input", stc4), api_custom_element("integration-delegates-focus-true", _integrationDelegatesFocusTrue, {
      props: stc5,
      key: 5,
      on: {
        "focus": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleHostFocus") : $cmp.handleHostFocus)),
        "shadowfocus": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    }), api_element("input", stc6)]), api_element("section", stc7, [api_element("h2", stc8, [api_text("delegatesFocus: true, tabindex: 0")]), api_element("input", stc9), api_custom_element("integration-delegates-focus-true", _integrationDelegatesFocusTrue, {
      props: stc10,
      key: 10,
      on: {
        "focus": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleHostFocus") : $cmp.handleHostFocus)),
        "shadowfocus": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    }), api_element("input", stc11)]), api_element("section", stc12, [api_element("h2", stc13, [api_text("delegatesFocus: true, tabindex: none")]), api_element("input", stc14), api_custom_element("integration-delegates-focus-true", _integrationDelegatesFocusTrue, {
      key: 15,
      on: {
        "focus": _m4 || __setKey($ctx, "_m4", api_bind($cmp._ES5ProxyType ? $cmp.get("handleHostFocus") : $cmp.handleHostFocus)),
        "shadowfocus": _m5 || __setKey($ctx, "_m5", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    }), api_element("input", stc15)]), api_element("section", stc16, [api_element("h2", stc17, [api_text("delegatesFocus: false, tabindex: -1")]), api_element("input", stc18), api_custom_element("integration-delegates-focus-false", _integrationDelegatesFocusFalse, {
      props: stc5,
      key: 20,
      on: {
        "focus": _m6 || __setKey($ctx, "_m6", api_bind($cmp._ES5ProxyType ? $cmp.get("handleHostFocus") : $cmp.handleHostFocus)),
        "shadowfocus": _m7 || __setKey($ctx, "_m7", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    }), api_element("input", stc19)]), api_element("section", stc20, [api_element("h2", stc21, [api_text("delegatesFocus: false, tabindex: 0")]), api_element("input", stc22), api_custom_element("integration-delegates-focus-false", _integrationDelegatesFocusFalse, {
      props: stc10,
      key: 25,
      on: {
        "focus": _m8 || __setKey($ctx, "_m8", api_bind($cmp._ES5ProxyType ? $cmp.get("handleHostFocus") : $cmp.handleHostFocus)),
        "shadowfocus": _m9 || __setKey($ctx, "_m9", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    }), api_element("input", stc23)]), api_element("section", stc24, [api_element("h2", stc25, [api_text("delegatesFocus: false, tabindex: none")]), api_element("input", stc26), api_custom_element("integration-delegates-focus-false", _integrationDelegatesFocusFalse, {
      key: 30,
      on: {
        "focus": _m10 || __setKey($ctx, "_m10", api_bind($cmp._ES5ProxyType ? $cmp.get("handleHostFocus") : $cmp.handleHostFocus)),
        "shadowfocus": _m11 || __setKey($ctx, "_m11", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowFocus") : $cmp.handleShadowFocus))
      }
    }), api_element("input", stc27)])];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Container = /*#__PURE__*/function (_LightningElement) {
    _inherits(Container, _LightningElement);

    var _super = _createSuper(Container);

    function Container() {
      var _this;

      _classCallCheck(this, Container);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "_hostFocusCount", 0);

      __setKey(_this, "_shadowFocusCount", 0);

      return _this;
    }

    _createClass(Container, [{
      key: "reset",
      value: function reset() {
        __setKey(this, "_hostFocusCount", 0);

        __setKey(this, "_shadowFocusCount", 0);
      }
    }, {
      key: "hostFocusCount",
      value: function hostFocusCount() {
        return this._ES5ProxyType ? this.get("_hostFocusCount") : this._hostFocusCount;
      }
    }, {
      key: "shadowFocusCount",
      value: function shadowFocusCount() {
        return this._ES5ProxyType ? this.get("_shadowFocusCount") : this._shadowFocusCount;
      }
    }, {
      key: "renderedHostFocusCount",
      get: function get() {
        return this._ES5ProxyType ? this.get("_hostFocusCount") : this._hostFocusCount;
      }
    }, {
      key: "renderedShadowFocusCount",
      get: function get() {
        return this._ES5ProxyType ? this.get("_shadowFocusCount") : this._shadowFocusCount;
      }
    }, {
      key: "handleHostFocus",
      value: function handleHostFocus() {
        __setKey(this, "_hostFocusCount", (this._ES5ProxyType ? this.get("_hostFocusCount") : this._hostFocusCount) + 1);
      }
    }, {
      key: "handleShadowFocus",
      value: function handleShadowFocus() {
        __setKey(this, "_shadowFocusCount", (this._ES5ProxyType ? this.get("_shadowFocusCount") : this._shadowFocusCount) + 1);
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Container;
  }(lwc.LightningElement);

  lwc.registerDecorators(Container, {
    publicMethods: ["reset", "hostFocusCount", "shadowFocusCount"],
    track: {
      _hostFocusCount: 1,
      _shadowFocusCount: 1
    }
  });

  var Cmp = lwc.registerComponent(Container, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-focus-event-while-navigating', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
