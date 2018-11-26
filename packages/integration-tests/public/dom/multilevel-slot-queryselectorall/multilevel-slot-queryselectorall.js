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
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;
    return [api_slot("", {
      key: 2
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

    _createClass(Child, [{
      key: "selectAll",
      value: function selectAll(sel) {
        return __callKey1(this, "querySelectorAll", sel);
      }
    }]);

    return Child;
  }(lwc.LightningElement);

  lwc.registerDecorators(Child, {
    publicMethods: ["selectAll"]
  });

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_custom_element("integration-child", _integrationChild, {
      key: 2
    }, [api_slot("", {
      key: 3
    }, [], $slotset)])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "slots", [""]);

  __setKey(tmpl$1, "stylesheets", []);

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

    _createClass(Parent, [{
      key: "selectAll",
      value: function selectAll(sel) {
        return __callKey1(this, "querySelectorAll", sel);
      }
    }]);

    return Parent;
  }(lwc.LightningElement);

  lwc.registerDecorators(Parent, {
    publicMethods: ["selectAll"]
  });

  var _integrationParent = lwc.registerComponent(Parent, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("span", {
      key: 2
    }, [api_text("Span")])];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-custom_custom-host",
    shadowAttribute: "integration-custom_custom"
  });

  var Custom =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Custom, _LightningElement);

    function Custom() {
      _classCallCheck(this, Custom);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(Custom), "apply", this, arguments));
    }

    return Custom;
  }(lwc.LightningElement);

  var _integrationCustom = lwc.registerComponent(Custom, {
    tmpl: _tmpl$2
  });

  function tmpl$3($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_custom_element("integration-parent", _integrationParent, {
      key: 2
    }, [api_element("div", {
      key: 3
    }, [api_text("Nested")]), api_custom_element("integration-custom", _integrationCustom, {
      key: 4
    }, [])])];
  }

  var _tmpl$3 = lwc.registerTemplate(tmpl$3);

  __setKey(tmpl$3, "stylesheets", []);

  __setKey(tmpl$3, "stylesheetTokens", {
    hostAttribute: "integration-multilevel-slot-queryselectorall_multilevel-slot-queryselectorall-host",
    shadowAttribute: "integration-multilevel-slot-queryselectorall_multilevel-slot-queryselectorall"
  });

  var MultilevelSlotQuerySelector =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(MultilevelSlotQuerySelector, _LightningElement);

    function MultilevelSlotQuerySelector() {
      _classCallCheck(this, MultilevelSlotQuerySelector);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(MultilevelSlotQuerySelector), "apply", this, arguments));
    }

    return MultilevelSlotQuerySelector;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(MultilevelSlotQuerySelector, {
    tmpl: _tmpl$3
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-multilevel-slot-queryselectorall', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
