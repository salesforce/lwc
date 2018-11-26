(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  var __callKey0 = Proxy.callKey0;

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
    return __concat(__concat("", nativeShadow ? ":host {display: block;width: 300px;height: 300px;background: red;}" : hostSelector + " {display: block;width: 300px;height: 300px;background: red;}", "\ndiv"), shadowSelector, " {color: #00ff00;}");
  }

  var _implicitStylesheets = [stylesheet];

  function stylesheet$1(hostSelector, shadowSelector, nativeShadow) {
    return __concat(__concat("p", shadowSelector, " {color: blue;}\n\n"), nativeShadow ? ":host([data-title-yellow]) h1" + shadowSelector + " {color: yellow;}" : hostSelector + "[data-title-yellow] h1" + shadowSelector + " {color: yellow;}");
  }

  var _implicitStylesheets$1 = [stylesheet$1];

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("h1", {
      key: 2
    }, [api_text("Child")]), api_element("div", {
      classMap: {
        "child-div": true
      },
      key: 3
    }, [api_text("Styles are not leaking")])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  if (_implicitStylesheets$1) {
    __callKey2((tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets).push, "apply", tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets, _implicitStylesheets$1);
  }

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-child_child-host",
    shadowAttribute: "integration-child_child"
  });

  var XChild =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(XChild, _LightningElement);

    function XChild() {
      _classCallCheck(this, XChild);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(XChild), "apply", this, arguments));
    }

    return XChild;
  }(lwc.LightningElement);

  var _integrationChild = lwc.registerComponent(XChild, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("div", {
      classMap: {
        "parent-div": true
      },
      key: 2
    }, [api_text("I am styled!")]), api_element("span", {
      classMap: {
        "dimensions": true
      },
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("dimensions") : $cmp.dimensions)]), api_element("hr", {
      key: 4
    }, []), api_custom_element("integration-child", _integrationChild, {
      key: 5
    }, []), api_custom_element("integration-child", _integrationChild, {
      attrs: {
        "data-title-yellow": true
      },
      key: 6
    }, [])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  if (_implicitStylesheets) {
    __callKey2((tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets).push, "apply", tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets, _implicitStylesheets);
  }

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-inject-style_inject-style-host",
    shadowAttribute: "integration-inject-style_inject-style"
  });

  var InjectStyle =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(InjectStyle, _LightningElement);

    function InjectStyle() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, InjectStyle);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(InjectStyle), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "dimensions", void 0);

      return _this;
    }

    _createClass(InjectStyle, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        if ((this._ES5ProxyType ? this.get("dimensions") : this.dimensions) === undefined) {
          var _this$getBoundingClie = __callKey0(this, "getBoundingClientRect"),
              width = _this$getBoundingClie._ES5ProxyType ? _this$getBoundingClie.get("width") : _this$getBoundingClie.width,
              height = _this$getBoundingClie._ES5ProxyType ? _this$getBoundingClie.get("height") : _this$getBoundingClie.height;

          __setKey(this, "dimensions", __concat(__concat("", width, "x"), height));
        }
      }
    }]);

    return InjectStyle;
  }(lwc.LightningElement);

  lwc.registerDecorators(InjectStyle, {
    track: {
      dimensions: 1
    }
  });

  var Cmp = lwc.registerComponent(InjectStyle, {
    tmpl: _tmpl$1
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-inject-style', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
