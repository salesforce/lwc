(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

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

  var __setKey = Proxy.setKey;

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

  function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return __concat("", nativeShadow ? ":host {display: block;}" : hostSelector + " {display: block;}");
  }

  var _implicitStylesheets = [stylesheet];

  function stylesheet$1(hostSelector, shadowSelector, nativeShadow) {
    return __concat("", nativeShadow ? ":host {border: 1px solid red;padding: 10px;}" : hostSelector + " {border: 1px solid red;padding: 10px;}");
  }

  var _implicitStylesheets$1 = [stylesheet$1];

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("span", {
      key: 2
    }, [api_text("No focusable content")])];
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

  __setKey(Child, "delegatesFocus", true);

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("span", {
      classMap: {
        "focusable-span": true
      },
      attrs: {
        "tabindex": "0"
      },
      key: 2
    }, [api_text("Focusable span")]), api_custom_element("integration-child", _integrationChild, {
      props: {
        "tabIndex": "0"
      },
      key: 3
    }, [])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  if (_implicitStylesheets) {
    __callKey2((tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets).push, "apply", tmpl$1._ES5ProxyType ? tmpl$1.get("stylesheets") : tmpl$1.stylesheets, _implicitStylesheets);
  }

  __setKey(tmpl$1, "stylesheetTokens", {
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

  __setKey(Parent, "delegatesFocus", true);

  var _integrationParent = lwc.registerComponent(Parent, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_element("span", {
      key: 2
    }, [api_text("Not focusable")]), api_custom_element("integration-parent", _integrationParent, {
      props: {
        "tabIndex": "-1"
      },
      key: 3
    }, [])];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-delegates-focus-nested-focusable-custom-elements_delegates-focus-nested-focusable-custom-elements-host",
    shadowAttribute: "integration-delegates-focus-nested-focusable-custom-elements_delegates-focus-nested-focusable-custom-elements"
  });

  var DelegatesFocus =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(DelegatesFocus, _LightningElement);

    function DelegatesFocus() {
      _classCallCheck(this, DelegatesFocus);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(DelegatesFocus), "apply", this, arguments));
    }

    return DelegatesFocus;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(DelegatesFocus, {
    tmpl: _tmpl$2
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-delegates-focus-nested-focusable-custom-elements', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
