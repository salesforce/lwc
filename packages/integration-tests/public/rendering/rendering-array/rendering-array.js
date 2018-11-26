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

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_element("header", {
      style: $cmp._ES5ProxyType ? $cmp.get("headerStyle") : $cmp.headerStyle,
      key: 2
    }, [api_element("h4", {
      key: 3
    }, [api_element("a", {
      attrs: {
        "href": $cmp._ES5ProxyType ? $cmp.get("issueHref") : $cmp.issueHref,
        "target": "_BLANK"
      },
      key: 4
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("fullTitle") : $cmp.fullTitle)])]), ($cmp._ES5ProxyType ? $cmp.get("hasPlaygroundHref") : $cmp.hasPlaygroundHref) ? api_element("h5", {
      key: 5
    }, [api_element("a", {
      attrs: {
        "href": $cmp._ES5ProxyType ? $cmp.get("playgroundHref") : $cmp.playgroundHref,
        "target": "_BLANK"
      },
      key: 6
    }, [api_text("Playground repro: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("playgroundHref") : $cmp.playgroundHref)])]) : null]), api_slot("", {
      key: 7
    }, [], $slotset)];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "src-shared_test-case-host",
    shadowAttribute: "src-shared_test-case"
  });

  var TestCase =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(TestCase, _LightningElement);

    function TestCase() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, TestCase);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(TestCase), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "issueId", void 0);

      __setKey(_this, "issueTitle", '');

      __setKey(_this, "playgroundId", void 0);

      return _this;
    }

    _createClass(TestCase, [{
      key: "playgroundHref",
      get: function get() {
        return __concat("http://playground.sfdc.es/projects/", this._ES5ProxyType ? this.get("playgroundId") : this.playgroundId, "/edit");
      }
    }, {
      key: "headerStyle",
      get: function get() {
        return 'font-size:0.8em;margin:0;text-align:right;position:fixed;left:0;right:0;bottom:0;z-index:1;padding-right:10px;border-top:1px solid #000';
      }
    }, {
      key: "fullTitle",
      get: function get() {
        return __concat(__concat("Issue ", this._ES5ProxyType ? this.get("issueId") : this.issueId, ": "), this._ES5ProxyType ? this.get("issueTitle") : this.issueTitle);
      }
    }, {
      key: "issueHref",
      get: function get() {
        return __concat("https://github.com/salesforce/lwc/issues/", this._ES5ProxyType ? this.get("issueId") : this.issueId);
      }
    }, {
      key: "hasPlaygroundHref",
      get: function get() {
        return !!(this._ES5ProxyType ? this.get("playgroundId") : this.playgroundId);
      }
    }]);

    return TestCase;
  }(lwc.LightningElement);

  lwc.registerDecorators(TestCase, {
    publicProps: {
      issueId: {
        config: 0
      },
      issueTitle: {
        config: 0
      },
      playgroundId: {
        config: 0
      }
    }
  });

  var _testCase = lwc.registerComponent(TestCase, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var _item, _label;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d;
    return [api_text("Item: "), api_dynamic((_item = $cmp._ES5ProxyType ? $cmp.get("item") : $cmp.item, _label = _item._ES5ProxyType ? _item.get("label") : _item.label))];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-compatItem_compatItem-host",
    shadowAttribute: "integration-compatItem_compatItem"
  });

  var CompatItem =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(CompatItem, _LightningElement);

    function CompatItem() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, CompatItem);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(CompatItem), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "item", void 0);

      return _this;
    }

    return CompatItem;
  }(lwc.LightningElement);

  lwc.registerDecorators(CompatItem, {
    publicProps: {
      item: {
        config: 0
      }
    }
  });

  var _integrationCompatItem = lwc.registerComponent(CompatItem, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var _state, _items;

    var api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;
    return [api_custom_element("test-case", _testCase, {
      props: {
        "issueTitle": "[proxy-compat] Error: Setting property Symbol(Symbol.iterator) during the rendering",
        "issueId": "702"
      },
      key: 2
    }, api_iterator((_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _items = _state._ES5ProxyType ? _state.get("items") : _state.items), function (item) {
      return api_custom_element("integration-compat-item", _integrationCompatItem, {
        props: {
          "item": item
        },
        key: api_key(4, item._ES5ProxyType ? item.get("label") : item.label)
      }, []);
    }))];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-rendering-array_rendering-array-host",
    shadowAttribute: "integration-rendering-array_rendering-array"
  });

  var DEFAULT_ITEMS = [{
    label: 'P1'
  }, {
    label: 'P2'
  }];

  var AppList =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(AppList, _LightningElement);

    function AppList() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, AppList);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(AppList), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        items: DEFAULT_ITEMS
      });

      return _this;
    }

    return AppList;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(AppList, {
    tmpl: _tmpl$2
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-rendering-array', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
