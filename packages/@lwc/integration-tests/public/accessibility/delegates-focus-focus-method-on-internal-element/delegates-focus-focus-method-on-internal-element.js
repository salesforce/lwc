(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey3 = Proxy.callKey3;

  var __callKey2 = Proxy.callKey2;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var __setKey = Proxy.setKey;

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

  var __callKey0 = Proxy.callKey0;

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

  function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
    var shadowSelector = token ? "[" + token + "]" : "";
    return ":focus" + shadowSelector + " {border-color: red;}";
    /*LWC compiler v2.11.8*/
  }

  var _implicitStylesheets = [stylesheet];

  var _implicitScopedStylesheets = undefined;

  var stc0$1 = {
    key: 0
  };

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("button", stc0$1, [api_text("internal button " + api_dynamic_text($cmp._ES5ProxyType ? $cmp.get("tabIndex") : $cmp.tabIndex))])];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  if (_implicitStylesheets) {
    __callKey2((tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets).push, "apply", tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets, _implicitStylesheets);
  }

  if (_implicitStylesheets || _implicitScopedStylesheets) {
    __setKey(tmpl$1, "stylesheetToken", "integration-button_button");
  }

  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$1() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Button = /*#__PURE__*/function (_LightningElement) {
    _inherits(Button, _LightningElement);

    var _super = _createSuper$1(Button);

    function Button() {
      _classCallCheck(this, Button);

      return __callKey2(_super, "apply", this, arguments);
    }

    _createClass(Button, [{
      key: "focus",
      value: function focus() {
        __callKey0(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'button'), "focus");
      }
      /*LWC compiler v2.11.8*/

    }]);

    return Button;
  }(lwc.LightningElement);

  __setKey(Button, "delegatesFocus", true);

  lwc.registerDecorators(Button, {
    publicMethods: ["focus"]
  });

  var _integrationButton = lwc.registerComponent(Button, {
    tmpl: _tmpl$1
  });

  var stc0 = {
    classMap: {
      "head": true
    },
    key: 0
  };
  var stc1 = {
    classMap: {
      "negative": true
    },
    props: {
      "tabIndex": "-1"
    },
    key: 1
  };
  var stc2 = {
    key: 2
  };
  var stc3 = {
    classMap: {
      "zero": true
    },
    props: {
      "tabIndex": "0"
    },
    key: 3
  };
  var stc4 = {
    key: 4
  };
  var stc5 = {
    classMap: {
      "none": true
    },
    key: 5
  };
  var stc6 = {
    classMap: {
      "tail": true
    },
    key: 6
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("input", stc0), api_custom_element("integration-button", _integrationButton, stc1), api_element("input", stc2), api_custom_element("integration-button", _integrationButton, stc3), api_element("input", stc4), api_custom_element("integration-button", _integrationButton, stc5), api_element("input", stc6)];
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
      _classCallCheck(this, Container);

      return __callKey2(_super, "apply", this, arguments);
    }

    return Container;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(Container, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-delegates-focus-focus-method-on-internal-element', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
