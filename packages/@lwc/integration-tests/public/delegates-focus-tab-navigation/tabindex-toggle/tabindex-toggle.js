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

  var stc0$1 = {
    classMap: {
      "first-inside": true
    },
    attrs: {
      "placeholder": "first (inside)"
    },
    key: 0
  };
  var stc1$1 = {
    classMap: {
      "second-inside": true
    },
    attrs: {
      "placeholder": "second (inside)"
    },
    key: 1
  };
  var stc2$1 = {
    classMap: {
      "third-inside": true
    },
    attrs: {
      "placeholder": "third (inside)"
    },
    key: 2
  };

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("input", stc0$1), api_element("input", stc1$1), api_element("input", stc2$1)];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$1() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Child = /*#__PURE__*/function (_LightningElement) {
    _inherits(Child, _LightningElement);

    var _super = _createSuper$1(Child);

    function Child() {
      _classCallCheck(this, Child);

      return __callKey2(_super, "apply", this, arguments);
    }

    return Child;
  }(lwc.LightningElement);

  __setKey(Child, "delegatesFocus", true);

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl$1
  });

  var stc0 = {
    key: 0
  };
  var stc1 = {
    "toggle": true
  };
  var stc2 = {
    classMap: {
      "first-outside": true
    },
    attrs: {
      "placeholder": "first (outside)"
    },
    key: 2
  };
  var stc3 = {
    classMap: {
      "second-outside": true
    },
    attrs: {
      "placeholder": "second (outside)"
    },
    key: 3
  };
  var stc4 = {
    key: 4
  };
  var stc5 = {
    classMap: {
      "third-outside": true
    },
    attrs: {
      "placeholder": "third (outside)"
    },
    key: 6
  };
  var stc6 = {
    classMap: {
      "fourth-outside": true
    },
    attrs: {
      "placeholder": "fourth (outside)"
    },
    key: 7
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_tab_index = $api._ES5ProxyType ? $api.get("ti") : $api.ti,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("div", stc0, [api_element("button", {
      classMap: stc1,
      key: 1,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("toggle tabindex (currently " + api_dynamic_text($cmp._ES5ProxyType ? $cmp.get("privateTabIndexToString") : $cmp.privateTabIndexToString) + ")")])]), api_element("input", stc2), api_element("input", stc3), api_element("div", stc4, [api_custom_element("integration-child", _integrationChild, {
      props: {
        "tabIndex": api_tab_index($cmp._ES5ProxyType ? $cmp.get("privateTabIndex") : $cmp.privateTabIndex)
      },
      key: 5
    })]), api_element("input", stc5), api_element("input", stc6)];
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

      __setKey(_this, "privateTabIndex", null);

      return _this;
    }

    _createClass(Container, [{
      key: "privateTabIndexToString",
      get: function get() {
        return String(this._ES5ProxyType ? this.get("privateTabIndex") : this.privateTabIndex);
      }
    }, {
      key: "handleClick",
      value: function handleClick() {
        __setKey(this, "privateTabIndex", (this._ES5ProxyType ? this.get("privateTabIndex") : this.privateTabIndex) === -1 ? null : -1);
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Container;
  }(lwc.LightningElement);

  lwc.registerDecorators(Container, {
    track: {
      privateTabIndex: 1
    }
  });

  var Cmp = lwc.registerComponent(Container, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-tabindex-toggle', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
