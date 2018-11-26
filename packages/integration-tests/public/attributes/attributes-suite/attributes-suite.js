(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

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
    var api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      classMap: {
        "childhost": true
      },
      key: 2
    }, [])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-attributes-suite_attributes-suite-host",
    shadowAttribute: "integration-attributes-suite_attributes-suite"
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_text("hello"), api_element("div", {
      classMap: {
        "titleattr": true
      },
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("getTitleAttr") : $cmp.getTitleAttr)]), api_element("div", {
      classMap: {
        "tabindexattr": true
      },
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("getTabindexAttr") : $cmp.getTabindexAttr)])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "attributes-suite-my-child_my-child-host",
    shadowAttribute: "attributes-suite-my-child_my-child"
  });

  var Child =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Child, _LightningElement);

    function Child() {
      _classCallCheck(this, Child);

      return _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(Child), "call", this));
    }

    _createClass(Child, [{
      key: "getTabindexAttr",
      get: function get() {
        return __callKey1(this, "getAttribute", 'tabindex');
      }
    }, {
      key: "getTitleAttr",
      get: function get() {
        return __callKey1(this, "getAttribute", 'title');
      }
    }]);

    return Child;
  }(lwc.LightningElement);

  lwc.registerDecorators(Child, {
    publicProps: {
      getTabindexAttr: {
        config: 1
      },
      getTitleAttr: {
        config: 1
      }
    }
  });

  var Child$1 = lwc.registerComponent(Child, {
    tmpl: _tmpl$1
  });

  var AttributesSuite =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(AttributesSuite, _LightningElement);

    function AttributesSuite() {
      var _this;

      _classCallCheck(this, AttributesSuite);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(AttributesSuite), "call", this));

      __setKey(_this, "state", {
        title: "Title value from parent's state"
      });

      return _this;
    }

    _createClass(AttributesSuite, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        var childElm = lwc.createElement('my-child', {
          is: Child$1
        });

        __callKey2(childElm, "setAttribute", 'tabindex', '4');

        __callKey2(childElm, "setAttribute", 'title', 'im child title');

        __callKey1(childElm, "removeAttribute", 'tabindex');

        __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", childElm);
      }
    }]);

    return AttributesSuite;
  }(lwc.LightningElement);

  lwc.registerDecorators(AttributesSuite, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(AttributesSuite, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-attributes-suite', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
