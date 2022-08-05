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

  function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
    var hostSelector = token ? "[" + token + "-host]" : "";
    return useActualHostSelector ? ":host {position: absolute;top: 0;left: 0;border:2px solid #000;}" : hostSelector + " {position: absolute;top: 0;left: 0;border:2px solid #000;}";
    /*LWC compiler v2.11.8*/
  }

  var _implicitStylesheets = [stylesheet];

  var _implicitScopedStylesheets = undefined;

  var stc0 = {
    "shadow-element-from-point": true
  };
  var stc1 = {
    "document-from-point": true
  };
  var stc2 = {
    classMap: {
      "correct-shadow-element-indicator": true
    },
    key: 2
  };
  var stc3 = {
    classMap: {
      "correct-document-element-indicator": true
    },
    key: 3
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("button", {
      classMap: stc0,
      key: 0,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowElementFromPointClick") : $cmp.handleShadowElementFromPointClick))
      }
    }, [api_text("Click to run shadow dom element from point")]), api_element("button", {
      classMap: stc1,
      key: 1,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleDocumentElementFromPointClick") : $cmp.handleDocumentElementFromPointClick))
      }
    }, [api_text("Click to run document element from point")]), ($cmp._ES5ProxyType ? $cmp.get("didSelectCorrectShadowElement") : $cmp.didSelectCorrectShadowElement) ? api_element("div", stc2, [api_text("Correct shadow element selected")]) : null, ($cmp._ES5ProxyType ? $cmp.get("didSelectCorrectDocumentElement") : $cmp.didSelectCorrectDocumentElement) ? api_element("div", stc3, [api_text("Correct document element selected")]) : null];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  if (_implicitStylesheets) {
    __callKey2((tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets).push, "apply", tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets, _implicitStylesheets);
  }

  if (_implicitStylesheets || _implicitScopedStylesheets) {
    __setKey(tmpl, "stylesheetToken", "integration-element-from-point_element-from-point");
  }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var ShadowRootFromPoint = /*#__PURE__*/function (_LightningElement) {
    _inherits(ShadowRootFromPoint, _LightningElement);

    var _super = _createSuper(ShadowRootFromPoint);

    function ShadowRootFromPoint() {
      var _this;

      _classCallCheck(this, ShadowRootFromPoint);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "didSelectCorrectShadowElement", null);

      __setKey(_this, "didSelectCorrectDocumentElement", null);

      return _this;
    }

    _createClass(ShadowRootFromPoint, [{
      key: "handleShadowElementFromPointClick",
      value: function handleShadowElementFromPointClick() {
        var match = __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "elementFromPoint", 5, 5);

        __setKey(this, "didSelectCorrectShadowElement", match === __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", '.shadow-element-from-point'));
      }
    }, {
      key: "handleDocumentElementFromPointClick",
      value: function handleDocumentElementFromPointClick() {
        var _template;

        var match = __callKey2(document, "elementFromPoint", 5, 5);

        __setKey(this, "didSelectCorrectDocumentElement", match === (_template = this._ES5ProxyType ? this.get("template") : this.template, _template._ES5ProxyType ? _template.get("host") : _template.host));
      }
      /*LWC compiler v2.11.8*/

    }]);

    return ShadowRootFromPoint;
  }(lwc.LightningElement);

  lwc.registerDecorators(ShadowRootFromPoint, {
    track: {
      didSelectCorrectShadowElement: 1,
      didSelectCorrectDocumentElement: 1
    }
  });

  var Cmp = lwc.registerComponent(ShadowRootFromPoint, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-element-from-point', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
