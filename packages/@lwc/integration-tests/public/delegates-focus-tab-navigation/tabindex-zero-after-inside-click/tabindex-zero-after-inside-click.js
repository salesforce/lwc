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
    classMap: {
      "first-outside": true
    },
    attrs: {
      "placeholder": "first (outside)"
    },
    key: 0
  };
  var stc1 = {
    classMap: {
      "second-outside": true
    },
    attrs: {
      "placeholder": "second (outside)"
    },
    key: 1
  };
  var stc2 = {
    key: 2
  };
  var stc3 = {
    props: {
      "tabIndex": "0"
    },
    key: 3
  };
  var stc4 = {
    classMap: {
      "third-outside": true
    },
    attrs: {
      "placeholder": "third (outside)"
    },
    key: 4
  };
  var stc5 = {
    classMap: {
      "fourth-outside": true
    },
    attrs: {
      "placeholder": "fourth (outside)"
    },
    key: 5
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("input", stc0), api_element("input", stc1), api_element("div", stc2, [api_custom_element("integration-child", _integrationChild, stc3)]), api_element("input", stc4), api_element("input", stc5)];
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

  var element = lwc.createElement('integration-tabindex-zero-after-inside-click', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
