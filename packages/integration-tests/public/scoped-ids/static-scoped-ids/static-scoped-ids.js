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
        "id": api_scoped_id("activedescendant")
      },
      key: 3
    }, [api_text("activedescendant-id")]), api_element("div", {
      classMap: {
        "activedescendant-idref": true
      },
      attrs: {
        "aria-activedescendant": __concat("", api_scoped_id("activedescendant"))
      },
      key: 4
    }, [api_text("activedescendant-idref")])]), api_element("div", {
      key: 5
    }, [api_element("div", {
      classMap: {
        "controls-id": true
      },
      attrs: {
        "id": api_scoped_id("controls")
      },
      key: 6
    }, [api_text("controls-id")]), api_element("div", {
      classMap: {
        "controls-idref": true
      },
      attrs: {
        "aria-controls": __concat("", api_scoped_id("controls"))
      },
      key: 7
    }, [api_text("controls-idref")])]), api_element("div", {
      key: 8
    }, [api_element("div", {
      classMap: {
        "describedby-id": true
      },
      attrs: {
        "id": api_scoped_id("describedby")
      },
      key: 9
    }, [api_text("describedby-id")]), api_element("div", {
      classMap: {
        "describedby-idref": true
      },
      attrs: {
        "aria-describedby": __concat("", api_scoped_id("describedby"))
      },
      key: 10
    }, [api_text("describedby-idref")])]), api_element("div", {
      key: 11
    }, [api_element("div", {
      classMap: {
        "details-id": true
      },
      attrs: {
        "id": api_scoped_id("details")
      },
      key: 12
    }, [api_text("details-id")]), api_element("div", {
      classMap: {
        "details-idref": true
      },
      attrs: {
        "aria-details": __concat("", api_scoped_id("details"))
      },
      key: 13
    }, [api_text("details-idref")])]), api_element("div", {
      key: 14
    }, [api_element("div", {
      classMap: {
        "errormessage-idref": true
      },
      attrs: {
        "aria-errormessage": __concat("", api_scoped_id("errormessage"))
      },
      key: 15
    }, [api_text("errormessage-idref")]), api_element("div", {
      classMap: {
        "errormessage-id": true
      },
      attrs: {
        "id": api_scoped_id("errormessage")
      },
      key: 16
    }, [api_text("errormessage-id")])]), api_element("div", {
      key: 17
    }, [api_element("div", {
      classMap: {
        "flowto-id": true
      },
      attrs: {
        "id": api_scoped_id("flowto")
      },
      key: 18
    }, [api_text("flowto-id")]), api_element("div", {
      classMap: {
        "flowto-idref": true
      },
      attrs: {
        "aria-flowto": __concat("", api_scoped_id("flowto"))
      },
      key: 19
    }, [api_text("flowto-idref")])]), api_element("div", {
      key: 20
    }, [api_element("div", {
      classMap: {
        "labelledby-id": true
      },
      attrs: {
        "id": api_scoped_id("labelledby")
      },
      key: 21
    }, [api_text("labelledby-id")]), api_element("div", {
      classMap: {
        "labelledby-idref": true
      },
      attrs: {
        "aria-labelledby": __concat("", api_scoped_id("labelledby"))
      },
      key: 22
    }, [api_text("labelledby-idref")])]), api_element("div", {
      key: 23
    }, [api_element("div", {
      classMap: {
        "owns-id": true
      },
      attrs: {
        "id": api_scoped_id("owns")
      },
      key: 24
    }, [api_text("owns-id")]), api_element("div", {
      classMap: {
        "owns-idref": true
      },
      attrs: {
        "aria-owns": __concat("", api_scoped_id("owns"))
      },
      key: 25
    }, [api_text("owns-idref")])]), api_element("div", {
      key: 26
    }, [api_element("label", {
      classMap: {
        "for-idref": true
      },
      attrs: {
        "for": __concat("", api_scoped_id("for"))
      },
      key: 27
    }, [api_text("for-idref")]), api_element("div", {
      classMap: {
        "for-id": true
      },
      attrs: {
        "id": api_scoped_id("for")
      },
      key: 28
    }, [api_text("for-id")])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-static-scoped-ids_static-scoped-ids-host",
    shadowAttribute: "integration-static-scoped-ids_static-scoped-ids"
  });

  var StaticScopedIds =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(StaticScopedIds, _LightningElement);

    function StaticScopedIds() {
      _classCallCheck(this, StaticScopedIds);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(StaticScopedIds), "apply", this, arguments));
    }

    return StaticScopedIds;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(StaticScopedIds, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-static-scoped-ids', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
