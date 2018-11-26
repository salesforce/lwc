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

  function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return __concat("", nativeShadow ? ":host {position: absolute;top: 0;left: 0;border:2px solid #000;}" : hostSelector + " {position: absolute;top: 0;left: 0;border:2px solid #000;}");
  }

  var _implicitStylesheets = [stylesheet];

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("button", {
      classMap: {
        "shadow-element-from-point": true
      },
      key: 2,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleShadowElementFromPointClick") : $cmp.handleShadowElementFromPointClick))
      }
    }, [api_text("Click to run shadow dom element from point")]), api_element("button", {
      classMap: {
        "document-from-point": true
      },
      key: 3,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleDocumentElementFromPointClick") : $cmp.handleDocumentElementFromPointClick))
      }
    }, [api_text("Click to run document element from point")]), ($cmp._ES5ProxyType ? $cmp.get("didSelectCorrectShadowElement") : $cmp.didSelectCorrectShadowElement) ? api_element("div", {
      classMap: {
        "correct-shadow-element-indicator": true
      },
      key: 4
    }, [api_text("Correct shadow element selected")]) : null, ($cmp._ES5ProxyType ? $cmp.get("didSelectCorrectDocumentElement") : $cmp.didSelectCorrectDocumentElement) ? api_element("div", {
      classMap: {
        "correct-document-element-indicator": true
      },
      key: 5
    }, [api_text("Correct document element selected")]) : null];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  if (_implicitStylesheets) {
    __callKey2((tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets).push, "apply", tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets, _implicitStylesheets);
  }

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-element-from-point_element-from-point-host",
    shadowAttribute: "integration-element-from-point_element-from-point"
  });

  var ShadowRootFromPoint =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ShadowRootFromPoint, _LightningElement);

    function ShadowRootFromPoint() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, ShadowRootFromPoint);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(ShadowRootFromPoint), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

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
        var _template, _host;

        var match = __callKey2(document, "elementFromPoint", 5, 5);

        __setKey(this, "didSelectCorrectDocumentElement", match === (_template = this._ES5ProxyType ? this.get("template") : this.template, _host = _template._ES5ProxyType ? _template.get("host") : _template.host));
      }
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

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-element-from-point', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
