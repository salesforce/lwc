(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

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

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_element("div", {
      classMap: {
        "shadow-div": true
      },
      key: 2
    }, [api_text("Shadow Div")]), api_slot("", {
      key: 3
    }, [], $slotset)];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-parent_parent-host",
    shadowAttribute: "integration-parent_parent"
  });

  var Parent =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Parent, _LightningElement);

    function Parent() {
      _classCallCheck(this, Parent);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(Parent), "apply", this, arguments));
    }

    return Parent;
  }(lwc.LightningElement);

  var _integrationParent = lwc.registerComponent(Parent, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_custom_element("integration-parent", _integrationParent, {
      key: 2
    }, [api_element("span", {
      classMap: {
        "light-div": true
      },
      key: 3
    }, [api_text("Not Shadow Div")])])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-child-template-element-queryselector_child-template-element-queryselector-host",
    shadowAttribute: "integration-child-template-element-queryselector_child-template-element-queryselector"
  });

  var LightdomQuerySelector =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(LightdomQuerySelector, _LightningElement);

    function LightdomQuerySelector() {
      _classCallCheck(this, LightdomQuerySelector);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(LightdomQuerySelector), "apply", this, arguments));
    }

    _createClass(LightdomQuerySelector, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var _this = this;

        __callKey2(this, "addEventListener", 'click', function () {
          __callKey2(__callKey1(__callKey1(_this._ES5ProxyType ? _this.get("template") : _this.template, "querySelector", 'integration-parent'), "querySelector", 'span'), "setAttribute", 'data-selected', 'true');
        });
      }
    }]);

    return LightdomQuerySelector;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(LightdomQuerySelector, {
    tmpl: _tmpl$1
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-child-template-element-queryselector', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
