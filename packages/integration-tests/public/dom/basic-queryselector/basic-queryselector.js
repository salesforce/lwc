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

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_element("p", {
      key: 2
    }, [api_text("child shadow dom content")]), api_slot("", {
      key: 3
    }, [], $slotset)];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-child_child-host",
    shadowAttribute: "integration-child_child"
  });

  var Child =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Child, _LightningElement);

    function Child() {
      _classCallCheck(this, Child);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(Child), "apply", this, arguments));
    }

    return Child;
  }(lwc.LightningElement);

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d;
    return [api_custom_element("integration-child", _integrationChild, {
      key: 2
    }, [api_element("p", {
      key: 3
    }, [api_text("first slotted content")]), api_element("p", {
      key: 4
    }, [api_text("second slotted content")])]), api_element("div", {
      classMap: {
        "query-selector": true
      },
      key: 5
    }, [api_text("querySelector: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("querySelectorMessage") : $cmp.querySelectorMessage)]), api_element("div", {
      classMap: {
        "query-selector-all": true
      },
      key: 6
    }, [api_text("querySelectorAll: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("querySelectorAllMessage") : $cmp.querySelectorAllMessage)])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-basic-queryselector_basic-queryselector-host",
    shadowAttribute: "integration-basic-queryselector_basic-queryselector"
  });

  var QuerySelector =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(QuerySelector, _LightningElement);

    function QuerySelector() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, QuerySelector);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(QuerySelector), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "querySelectorMessage", void 0);

      __setKey(_this, "querySelectorAllMessage", void 0);

      return _this;
    }

    _createClass(QuerySelector, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        var _child$querySelector, _textContent;

        var child = __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'x-child');

        __setKey(this, "querySelectorMessage", (_child$querySelector = __callKey1(child, "querySelector", 'p'), _textContent = _child$querySelector._ES5ProxyType ? _child$querySelector.get("textContent") : _child$querySelector.textContent));

        __setKey(this, "querySelectorAllMessage", __callKey2(__callKey1(child, "querySelectorAll", 'p'), "reduce", function (str, el) {
          return __concat(__concat("", str, " "), el._ES5ProxyType ? el.get("textContent") : el.textContent);
        }, ''));
      }
    }]);

    return QuerySelector;
  }(lwc.LightningElement);

  lwc.registerDecorators(QuerySelector, {
    track: {
      querySelectorMessage: 1,
      querySelectorAllMessage: 1
    }
  });

  var Cmp = lwc.registerComponent(QuerySelector, {
    tmpl: _tmpl$1
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-basic-queryselector', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
