(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __callKey0 = Proxy.callKey0;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var __setKey = Proxy.setKey;

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

  var __concat = Proxy.concat;

  var __setKeyPostfixIncrement = Proxy.setKeyPostfixIncrement;

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("div", {
      className: $cmp._ES5ProxyType ? $cmp.get("computedClass") : $cmp.computedClass,
      attrs: {
        "title": $cmp._ES5ProxyType ? $cmp.get("title") : $cmp.title
      },
      key: 2,
      on: {
        "privatetabregister": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleTabRegister") : $cmp.handleTabRegister))
      }
    }, [api_slot("", {
      key: 3
    }, [], $slotset)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-fulltabset_fulltabset-host",
    shadowAttribute: "integration-fulltabset_fulltabset"
  });

  var LightningTabset =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(LightningTabset, _LightningElement);

    function LightningTabset() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, LightningTabset);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(LightningTabset), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "_registered", 0);

      return _this;
    }

    _createClass(LightningTabset, [{
      key: "handleTabRegister",
      value: function handleTabRegister(event) {
        __callKey0(event, "stopPropagation");

        var tab = event._ES5ProxyType ? event.get("target") : event.target;

        __setKeyPostfixIncrement(this, "_registered");

        __callKey0(tab, "loadContent");
      }
    }, {
      key: "getRegistered",
      value: function getRegistered() {
        return this._ES5ProxyType ? this.get("_registered") : this._registered;
      }
    }]);

    return LightningTabset;
  }(lwc.LightningElement);

  lwc.registerDecorators(LightningTabset, {
    publicMethods: ["getRegistered"]
  });

  var _integrationFulltabset = lwc.registerComponent(LightningTabset, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      classMap: {
        "slds-card": true
      },
      key: 2
    }, [api_custom_element("integration-fulltabset", _integrationFulltabset, {
      key: 3
    }, [api_slot("tabs", {
      attrs: {
        "name": "tabs"
      },
      key: 4
    }, [], $slotset)])])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "slots", ["tabs"]);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-tabset_tabset-host",
    shadowAttribute: "integration-tabset_tabset"
  });

  var IntTabSet =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(IntTabSet, _LightningElement);

    function IntTabSet() {
      _classCallCheck(this, IntTabSet);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(IntTabSet), "apply", this, arguments));
    }

    _createClass(IntTabSet, [{
      key: "getRegistered",
      value: function getRegistered() {
        return __callKey0(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-fulltabset'), "getRegistered");
      }
    }]);

    return IntTabSet;
  }(lwc.LightningElement);

  lwc.registerDecorators(IntTabSet, {
    publicMethods: ["getRegistered"]
  });

  var _integrationTabset = lwc.registerComponent(IntTabSet, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [($cmp._ES5ProxyType ? $cmp.get("_loadContent") : $cmp._loadContent) ? api_slot("body", {
      attrs: {
        "name": "body"
      },
      key: 3
    }, [], $slotset) : null];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "slots", ["body"]);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-tab_tab-host",
    shadowAttribute: "integration-tab_tab"
  });

  function tmpl$3($api, $cmp, $slotset, $ctx) {
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [($cmp._ES5ProxyType ? $cmp.get("_loadContent") : $cmp._loadContent) ? api_slot("", {
      key: 3
    }, [], $slotset) : null];
  }

  var _tmpl$3 = lwc.registerTemplate(tmpl$3);

  __setKey(tmpl$3, "slots", [""]);

  __setKey(tmpl$3, "stylesheets", []);

  __setKey(tmpl$3, "stylesheetTokens", {
    hostAttribute: "integration-fulltab_fulltab-host",
    shadowAttribute: "integration-fulltab_fulltab"
  });

  var LightningTab =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(LightningTab, _LightningElement);

    function LightningTab() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, LightningTab);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(LightningTab), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "_loadContent", false);

      return _this;
    }

    _createClass(LightningTab, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        __setKey(this, "_connected", true);

        __callKey1(this, "dispatchEvent", new CustomEvent('privatetabregister', {
          cancelable: true,
          bubbles: true,
          composed: true
        }));
      }
    }, {
      key: "loadContent",
      value: function loadContent() {
        __setKey(this, "_loadContent", true);

        __callKey1(this, "dispatchEvent", new CustomEvent('active'));
      }
    }, {
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        __setKey(this, "_connected", false);
      }
    }]);

    return LightningTab;
  }(lwc.LightningElement);

  lwc.registerDecorators(LightningTab, {
    publicMethods: ["loadContent"],
    track: {
      _loadContent: 1
    }
  });

  var LightningTab$1 = lwc.registerComponent(LightningTab, {
    tmpl: _tmpl$3
  });

  var FlexipageTab2 =
  /*#__PURE__*/
  function (_LightningTab) {
    _inherits(FlexipageTab2, _LightningTab);

    function FlexipageTab2() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, FlexipageTab2);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(FlexipageTab2), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "_internalLabel", void 0);

      return _this;
    }

    return FlexipageTab2;
  }(LightningTab$1);

  var _integrationTab = lwc.registerComponent(FlexipageTab2, {
    tmpl: _tmpl$2
  });

  function tmpl$4($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("div", {
      classMap: {
        "slds-p-around_x-large": true
      },
      key: 2
    }, [api_custom_element("integration-tabset", _integrationTabset, {
      key: 3
    }, [api_custom_element("integration-tab", _integrationTab, {
      attrs: {
        "slot": "tabs"
      },
      key: 4
    }, [api_element("div", {
      attrs: {
        "slot": "body"
      },
      key: 5
    }, [api_text("ONE ONE")]), api_element("div", {
      attrs: {
        "slot": "body"
      },
      key: 6
    }, [api_text("ONE TWO")]), api_element("div", {
      attrs: {
        "slot": "body"
      },
      key: 7
    }, [api_text("ONE THREE")])]), api_custom_element("integration-tab", _integrationTab, {
      attrs: {
        "slot": "tabs"
      },
      key: 8
    }, [api_element("div", {
      attrs: {
        "slot": "body"
      },
      key: 9
    }, [api_text("TWO ONE")]), api_element("div", {
      attrs: {
        "slot": "body"
      },
      key: 10
    }, [api_text("TWO TWO")]), api_element("div", {
      attrs: {
        "slot": "body"
      },
      key: 11
    }, [api_text("TWO THREE")])])])])];
  }

  var _tmpl$4 = lwc.registerTemplate(tmpl$4);

  __setKey(tmpl$4, "stylesheets", []);

  __setKey(tmpl$4, "stylesheetTokens", {
    hostAttribute: "integration-nested-slots_nested-slots-host",
    shadowAttribute: "integration-nested-slots_nested-slots"
  });

  var NestedSlots =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(NestedSlots, _LightningElement);

    function NestedSlots() {
      _classCallCheck(this, NestedSlots);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(NestedSlots), "apply", this, arguments));
    }

    _createClass(NestedSlots, [{
      key: "getRegisteredTabs",
      value: function getRegisteredTabs() {
        return __callKey0(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-tabset'), "getRegistered");
      }
    }]);

    return NestedSlots;
  }(lwc.LightningElement);

  lwc.registerDecorators(NestedSlots, {
    publicMethods: ["getRegisteredTabs"]
  });

  var Cmp = lwc.registerComponent(NestedSlots, {
    tmpl: _tmpl$4
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-nested-slots', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
