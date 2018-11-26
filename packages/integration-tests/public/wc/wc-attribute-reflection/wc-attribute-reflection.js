(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __setKey = Proxy.setKey;

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
        "test": true
      },
      key: 2
    }, [])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-wc-attribute-reflection_wc-attribute-reflection-host",
    shadowAttribute: "integration-wc-attribute-reflection_wc-attribute-reflection"
  });

  function _objectDestructuringEmpty(obj) {
    if (obj == null) throw new TypeError("Cannot destructure undefined");
  }

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    _objectDestructuringEmpty($api);

    return [];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-wcWithAttributeX_wcWithAttributeX-host",
    shadowAttribute: "integration-wcWithAttributeX_wcWithAttributeX"
  });

  var MyComponent =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(MyComponent, _LightningElement);

    function MyComponent() {
      _classCallCheck(this, MyComponent);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(MyComponent), "apply", this, arguments));
    }

    _createClass(MyComponent, [{
      key: "run",
      value: function run() {
        __callKey2(this, "setAttribute", 'title', 'else');

        __callKey2(this, "setAttribute", 'x', 3);
      }
    }, {
      key: "x",
      get: function get() {
        return this._ES5ProxyType ? this.get("_x") : this._x;
      },
      set: function set(v) {
        __setKey(this, "_x", parseInt(v, 10));
      }
    }]);

    return MyComponent;
  }(lwc.LightningElement);

  lwc.registerDecorators(MyComponent, {
    publicProps: {
      x: {
        config: 3
      }
    },
    publicMethods: ["run"]
  });

  var ComponentWithX = lwc.registerComponent(MyComponent, {
    tmpl: _tmpl$1
  });

  var WiredPropSuite =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(WiredPropSuite, _LightningElement);

    function WiredPropSuite() {
      _classCallCheck(this, WiredPropSuite);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(WiredPropSuite), "apply", this, arguments));
    }

    _createClass(WiredPropSuite, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        var WC = lwc.buildCustomElementConstructor(ComponentWithX);

        __callKey2(customElements, "define", 'x-foo', WC);

        var elm = __callKey1(document, "createElement", 'x-foo');

        __callKey2(elm, "setAttribute", 'title', 'something');

        __callKey2(elm, "setAttribute", 'x', 2);

        __setKey(this, "_elm", elm);

        __callKey1(__callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", '.test'), "appendChild", elm);
      }
    }, {
      key: "programmatic",
      get: function get() {
        return this._ES5ProxyType ? this.get("_elm") : this._elm;
      }
    }, {
      key: "declarative",
      get: function get() {
        return __callKey1(this._ES5ProxyType ? this.get("template") : this.template, "querySelector", 'integration-wc-with-attribute-x');
      }
    }]);

    return WiredPropSuite;
  }(lwc.LightningElement);

  lwc.registerDecorators(WiredPropSuite, {
    publicProps: {
      programmatic: {
        config: 1
      },
      declarative: {
        config: 1
      }
    }
  });

  var Cmp = lwc.registerComponent(WiredPropSuite, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-wc-attribute-reflection', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
