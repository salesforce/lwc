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
      "focusable-input": true
    },
    attrs: {
      "type": "text"
    },
    key: 0
  };

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("input", stc0$1)];
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

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl$1
  });

  var stc0 = {
    "tabIndex": "-1"
  };
  var stc1 = {
    classMap: {
      "focus-in-called": true
    },
    key: 1
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_custom_element("integration-child", _integrationChild, {
      props: stc0,
      key: 0,
      on: {
        "focusin": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleFocusIn") : $cmp.handleFocusIn))
      }
    }), ($cmp._ES5ProxyType ? $cmp.get("focusInCalled") : $cmp.focusInCalled) ? api_element("div", stc1, [api_text("Focus in called")]) : null];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Test = /*#__PURE__*/function (_LightningElement) {
    _inherits(Test, _LightningElement);

    var _super = _createSuper(Test);

    function Test() {
      var _this;

      _classCallCheck(this, Test);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "focusInCalled", false);

      return _this;
    }

    _createClass(Test, [{
      key: "handleFocusIn",
      value: function handleFocusIn() {
        __setKey(this, "focusInCalled", true);
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Test;
  }(lwc.LightningElement);

  lwc.registerDecorators(Test, {
    track: {
      focusInCalled: 1
    }
  });

  var Cmp = lwc.registerComponent(Test, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-delegates-focus-negative-tabindex-focusin-handler', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
