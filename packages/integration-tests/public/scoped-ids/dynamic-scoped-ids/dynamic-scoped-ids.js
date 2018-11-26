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
        api_scoped_id = $api._ES5ProxyType ? $api.get("gid") : $api.gid,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_element("div", {
      key: 2
    }, [api_element("div", {
      classMap: {
        "activedescendant-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("activedescendant") : $cmp.activedescendant)
      },
      key: 3
    }, [api_text("activedescendant-id")]), api_element("div", {
      classMap: {
        "activedescendant-idref": true
      },
      attrs: {
        "aria-activedescendant": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("activedescendant") : $cmp.activedescendant)
      },
      key: 4
    }, [api_text("activedescendant-idref")])]), api_element("div", {
      key: 5
    }, [api_element("div", {
      classMap: {
        "controls-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("controls") : $cmp.controls)
      },
      key: 6
    }, [api_text("controls-id")]), api_element("div", {
      classMap: {
        "controls-idref": true
      },
      attrs: {
        "aria-controls": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("controls") : $cmp.controls)
      },
      key: 7
    }, [api_text("controls-idref")])]), api_element("div", {
      key: 8
    }, [api_element("div", {
      classMap: {
        "describedby-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("describedby") : $cmp.describedby)
      },
      key: 9
    }, [api_text("describedby-id")]), api_element("div", {
      classMap: {
        "describedby-idref": true
      },
      attrs: {
        "aria-describedby": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("describedby") : $cmp.describedby)
      },
      key: 10
    }, [api_text("describedby-idref")])]), api_element("div", {
      key: 11
    }, [api_element("div", {
      classMap: {
        "details-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("details") : $cmp.details)
      },
      key: 12
    }, [api_text("details-id")]), api_element("div", {
      classMap: {
        "details-idref": true
      },
      attrs: {
        "aria-details": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("details") : $cmp.details)
      },
      key: 13
    }, [api_text("details-idref")])]), api_element("div", {
      key: 14
    }, [api_element("div", {
      classMap: {
        "errormessage-idref": true
      },
      attrs: {
        "aria-errormessage": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("errormessage") : $cmp.errormessage)
      },
      key: 15
    }, [api_text("errormessage-idref")]), api_element("div", {
      classMap: {
        "errormessage-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("errormessage") : $cmp.errormessage)
      },
      key: 16
    }, [api_text("errormessage-id")])]), api_element("div", {
      key: 17
    }, [api_element("div", {
      classMap: {
        "flowto-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("flowto") : $cmp.flowto)
      },
      key: 18
    }, [api_text("flowto-id")]), api_element("div", {
      classMap: {
        "flowto-idref": true
      },
      attrs: {
        "aria-flowto": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("flowto") : $cmp.flowto)
      },
      key: 19
    }, [api_text("flowto-idref")])]), api_element("div", {
      key: 20
    }, [api_element("div", {
      classMap: {
        "labelledby-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("labelledby") : $cmp.labelledby)
      },
      key: 21
    }, [api_text("labelledby-id")]), api_element("div", {
      classMap: {
        "labelledby-idref": true
      },
      attrs: {
        "aria-labelledby": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("labelledby") : $cmp.labelledby)
      },
      key: 22
    }, [api_text("labelledby-idref")])]), api_element("div", {
      key: 23
    }, [api_element("div", {
      classMap: {
        "owns-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("owns") : $cmp.owns)
      },
      key: 24
    }, [api_text("owns-id")]), api_element("div", {
      classMap: {
        "owns-idref": true
      },
      attrs: {
        "aria-owns": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("owns") : $cmp.owns)
      },
      key: 25
    }, [api_text("owns-idref")])]), api_element("div", {
      key: 26
    }, [api_element("label", {
      classMap: {
        "for-idref": true
      },
      attrs: {
        "for": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("forfor") : $cmp.forfor)
      },
      key: 27
    }, [api_text("for-idref")]), api_element("div", {
      classMap: {
        "for-id": true
      },
      attrs: {
        "id": api_scoped_id($cmp._ES5ProxyType ? $cmp.get("forfor") : $cmp.forfor)
      },
      key: 28
    }, [api_text("for-id")])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-dynamic-scoped-ids_dynamic-scoped-ids-host",
    shadowAttribute: "integration-dynamic-scoped-ids_dynamic-scoped-ids"
  });

  var DynamicScopedIds =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(DynamicScopedIds, _LightningElement);

    function DynamicScopedIds() {
      _classCallCheck(this, DynamicScopedIds);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(DynamicScopedIds), "apply", this, arguments));
    }

    _createClass(DynamicScopedIds, [{
      key: "activedescendant",
      get: function get() {
        return 'activedescendant';
      }
    }, {
      key: "controls",
      get: function get() {
        return 'controls';
      }
    }, {
      key: "describedby",
      get: function get() {
        return 'describedby';
      }
    }, {
      key: "details",
      get: function get() {
        return 'details';
      }
    }, {
      key: "errormessage",
      get: function get() {
        return 'errormessage';
      }
    }, {
      key: "flowto",
      get: function get() {
        return 'flowto';
      }
    }, {
      key: "labelledby",
      get: function get() {
        return 'labelledby';
      }
    }, {
      key: "owns",
      get: function get() {
        return 'owns';
      }
    }, {
      key: "forfor",
      get: function get() {
        return 'for';
      }
    }]);

    return DynamicScopedIds;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(DynamicScopedIds, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-dynamic-scoped-ids', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
