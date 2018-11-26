(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __deleteKey = Proxy.deleteKey;

  var __hasOwnProperty = Proxy.hasOwnProperty;

  var __inKey = Proxy.inKey;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

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

  Proxy.callKey2;

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3;

    return [api_element("span", {
      classMap: {
        "s_ownprop": true
      },
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("hasOwnProp") : $cmp.hasOwnProp)]), api_element("button", {
      classMap: {
        "b_ownprop": true
      },
      key: 3,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleTrackHasOwnProp") : $cmp.handleTrackHasOwnProp))
      }
    }, [api_text("Add new prop")]), api_element("button", {
      classMap: {
        "b_defprop": true
      },
      key: 4,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleTrackDefinePropClick") : $cmp.handleTrackDefinePropClick))
      }
    }, [api_text("Define new prop")]), api_element("span", {
      classMap: {
        "s_defprop": true
      },
      key: 5
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("hasDefinedProp") : $cmp.hasDefinedProp)]), api_element("button", {
      classMap: {
        "b_deleteprop": true
      },
      key: 6,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleTrackDeletePropClick") : $cmp.handleTrackDeletePropClick))
      }
    }, [api_text("Define new prop")]), api_element("span", {
      classMap: {
        "s_deleteprop": true
      },
      key: 7
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("hasDeletedProp") : $cmp.hasDeletedProp)]), api_element("button", {
      classMap: {
        "b_enumerable": true
      },
      key: 8,
      on: {
        "click": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handleTrackEnumerableClick") : $cmp.handleTrackEnumerableClick))
      }
    }, [api_text("Define new prop")]), api_element("span", {
      classMap: {
        "s_enumerable": true
      },
      key: 9
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("hasEnumerable") : $cmp.hasEnumerable)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-reactive-prop_reactive-prop-host",
    shadowAttribute: "integration-reactive-prop_reactive-prop"
  });

  var ReactiveProp =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ReactiveProp, _LightningElement);

    function ReactiveProp() {
      var _this;

      _classCallCheck(this, ReactiveProp);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(ReactiveProp), "call", this));

      __setKey(_this, "trackHasOwnProp", {});

      __setKey(_this, "trackDefineProp", {});

      __setKey(_this, "trackDeletedProp", {
        inner: true
      });

      __setKey(_this, "trackEnumerableProp", {
        visible: true
      });

      return _this;
    }

    _createClass(ReactiveProp, [{
      key: "handleTrackHasOwnProp",
      value: function handleTrackHasOwnProp() {
        __setKey(this._ES5ProxyType ? this.get("trackHasOwnProp") : this.trackHasOwnProp, "inner", true);
      }
    }, {
      key: "handleTrackDefinePropClick",
      value: function handleTrackDefinePropClick() {
        Object.compatDefineProperty(this._ES5ProxyType ? this.get("trackDefineProp") : this.trackDefineProp, 'inner', {
          value: 'true',
          enumerable: true
        });
      }
    }, {
      key: "handleTrackDeletePropClick",
      value: function handleTrackDeletePropClick() {
        __deleteKey(this._ES5ProxyType ? this.get("trackDeletedProp") : this.trackDeletedProp, 'inner');
      }
    }, {
      key: "handleTrackEnumerableClick",
      value: function handleTrackEnumerableClick() {
        Object.compatDefineProperty(this._ES5ProxyType ? this.get("trackEnumerableProp") : this.trackEnumerableProp, 'visible', {
          enumerable: false
        });
      }
    }, {
      key: "hasOwnProp",
      get: function get() {
        return __hasOwnProperty(this._ES5ProxyType ? this.get("trackHasOwnProp") : this.trackHasOwnProp, 'inner');
      }
    }, {
      key: "hasDefinedProp",
      get: function get() {
        var _trackDefineProp, _inner;

        return _trackDefineProp = this._ES5ProxyType ? this.get("trackDefineProp") : this.trackDefineProp, _inner = _trackDefineProp._ES5ProxyType ? _trackDefineProp.get("inner") : _trackDefineProp.inner;
      }
    }, {
      key: "hasDeletedProp",
      get: function get() {
        return __inKey(this._ES5ProxyType ? this.get("trackDeletedProp") : this.trackDeletedProp, 'inner');
      }
    }, {
      key: "hasEnumerable",
      get: function get() {
        return Object.compatKeys(this._ES5ProxyType ? this.get("trackEnumerableProp") : this.trackEnumerableProp);
      }
    }]);

    return ReactiveProp;
  }(lwc.LightningElement);

  lwc.registerDecorators(ReactiveProp, {
    track: {
      trackHasOwnProp: 1,
      trackDefineProp: 1,
      trackDeletedProp: 1,
      trackEnumerableProp: 1
    }
  });

  var Cmp = lwc.registerComponent(ReactiveProp, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-reactive-prop', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
