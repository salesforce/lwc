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
    "handler-computes-inner-text-input": true
  };
  var stc1 = {
    "type": "text"
  };
  var stc2 = {
    "handler-computes-inner-text-div": true
  };
  var stc3 = {
    key: 2
  };

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("input", {
      classMap: stc0,
      attrs: stc1,
      key: 0,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("computeInputInnerText") : $cmp.computeInputInnerText))
      }
    }), api_element("input", {
      classMap: stc2,
      attrs: stc1,
      key: 1,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("computeDivInnerText") : $cmp.computeDivInnerText))
      }
    }), api_element("div", stc3, [api_text("some text")])];
    /*LWC compiler v2.11.8*/
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var InnerText = /*#__PURE__*/function (_LightningElement) {
    _inherits(InnerText, _LightningElement);

    var _super = _createSuper(InnerText);

    function InnerText() {
      var _this;

      _classCallCheck(this, InnerText);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = __callKey2(_super._ES5ProxyType ? _super.get("call") : _super.call, "apply", _super, __concat([this], args));

      __setKey(_this, "_innerText", null);

      return _this;
    }

    _createClass(InnerText, [{
      key: "computeInputInnerText",
      value: function computeInputInnerText(evt) {
        var _target;

        __setKey(this, "_innerText", (_target = evt._ES5ProxyType ? evt.get("target") : evt.target, _target._ES5ProxyType ? _target.get("innerText") : _target.innerText));
      }
    }, {
      key: "computeDivInnerText",
      value: function computeDivInnerText() {
        var _this$template$queryS;

        __setKey(this, "_innerText", (_this$template$queryS = __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'div'), _this$template$queryS._ES5ProxyType ? _this$template$queryS.get("innerText") : _this$template$queryS.innerText));
      }
      /*LWC compiler v2.11.8*/

    }]);

    return InnerText;
  }(lwc.LightningElement);

  lwc.registerDecorators(InnerText, {
    fields: ["_innerText"]
  });

  var Cmp = lwc.registerComponent(InnerText, {
    tmpl: _tmpl
  });

  var element = lwc.createElement('integration-inner-text', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

})(LWC);
