(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey3 = Proxy.callKey3;

  var __callKey2 = Proxy.callKey2;

  var __setKey = Proxy.setKey;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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

  var __concat = Proxy.concat;

  function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return nativeShadow ? ":host {color: var(--lwc-my-color);}" : __callKey1([hostSelector, " {color: var(--lwc-my-color);}"], "join", '');
  }

  var _implicitStylesheets = [stylesheet];

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_dynamic_text = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      key: 0
    }, [api_text(api_dynamic_text($cmp._ES5ProxyType ? $cmp.get("x") : $cmp.x))])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  if (_implicitStylesheets) {
    __callKey2((tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets).push, "apply", tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets, _implicitStylesheets);
  }

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "x-foo_foo-host",
    shadowAttribute: "x-foo_foo"
  });

  function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct$1() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var Foo = /*#__PURE__*/function (_LightningElement) {
    _inherits(Foo, _LightningElement);

    var _super = _createSuper$1(Foo);

    function Foo() {
      var _this;

      _classCallCheck(this, Foo);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "x", void 0);

      return _this;
    }

    return Foo;
  }(lwc.LightningElement);

  lwc.registerDecorators(Foo, {
    publicProps: {
      x: {
        config: 0
      }
    }
  });

  var _xFoo = lwc.registerComponent(Foo, {
    tmpl: _tmpl$1
  });

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      classMap: {
        "container": true
      },
      key: 0
    }, [api_custom_element("x-foo", _xFoo, {
      props: {
        "x": "1"
      },
      key: 1
    }, [])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "x-app_app-host",
    shadowAttribute: "x-app_app"
  });

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var App = /*#__PURE__*/function (_LightningElement) {
    _inherits(App, _LightningElement);

    var _super = _createSuper(App);

    function App() {
      var _this;

      _classCallCheck(this, App);

      _this = __callKey1(_super, "call", this);

      __setKey(_this, "list", []);

      return _this;
    }

    return App;
  }(lwc.LightningElement);

  var App$1 = lwc.registerComponent(App, {
    tmpl: _tmpl
  });

  var container = __callKey1(document, "getElementById", 'main');

  var element = lwc.createElement('x-app', {
    is: App$1
  });

  __callKey1(container, "appendChild", element);

}(LWC));
