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
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3;

    return [api_element("div", {
      key: 2
    }, [api_element("span", {
      key: 3
    }, [api_text("Unshift")]), api_element("ul", {
      classMap: {
        "unshift-list": true
      },
      key: 4,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("items") : $cmp.items, function (item) {
      return api_element("li", {
        key: api_key(5, item._ES5ProxyType ? item.get("title") : item.title)
      }, [api_dynamic(item._ES5ProxyType ? item.get("title") : item.title)]);
    }))]), api_element("div", {
      key: 6
    }, [api_element("span", {
      key: 7
    }, [api_text("Push")]), api_element("ul", {
      classMap: {
        "push-list": true
      },
      key: 8,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handlePushClick") : $cmp.handlePushClick))
      }
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("pushItems") : $cmp.pushItems, function (item) {
      return api_element("li", {
        key: api_key(9, item._ES5ProxyType ? item.get("title") : item.title)
      }, [api_dynamic(item._ES5ProxyType ? item.get("title") : item.title)]);
    }))]), api_element("div", {
      key: 10
    }, [api_element("span", {
      key: 11
    }, [api_text("Concat")]), api_element("ul", {
      classMap: {
        "concat-list": true
      },
      key: 12,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("handleConcatClick") : $cmp.handleConcatClick))
      }
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("concatItems") : $cmp.concatItems, function (item) {
      return api_element("li", {
        key: api_key(13, item._ES5ProxyType ? item.get("title") : item.title)
      }, [api_dynamic(item._ES5ProxyType ? item.get("title") : item.title)]);
    }))]), api_element("div", {
      key: 14
    }, [api_element("span", {
      key: 15
    }, [api_text("Prop Concat")]), api_element("ul", {
      classMap: {
        "prop-concat-list": true
      },
      key: 16,
      on: {
        "click": _m3 || __setKey($ctx, "_m3", api_bind($cmp._ES5ProxyType ? $cmp.get("handlePropConcatClick") : $cmp.handlePropConcatClick))
      }
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("propConcatItem") : $cmp.propConcatItem, function (item) {
      return api_element("li", {
        key: api_key(17, item._ES5ProxyType ? item.get("title") : item.title)
      }, [api_dynamic(item._ES5ProxyType ? item.get("title") : item.title)]);
    }))])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-array-push-concat-unshift_array-push-concat-unshift-host",
    shadowAttribute: "integration-array-push-concat-unshift_array-push-concat-unshift"
  });

  var Issue763 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Issue763, _LightningElement);

    function Issue763() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, Issue763);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(Issue763), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "propItems", [{
        title: 'first'
      }, {
        title: 'second'
      }]);

      __setKey(_this, "items", [{
        title: 'first'
      }, {
        title: 'second'
      }]);

      __setKey(_this, "pushItems", [{
        title: 'first'
      }, {
        title: 'second'
      }]);

      __setKey(_this, "concatItems", [{
        title: 'first'
      }, {
        title: 'second'
      }]);

      __setKey(_this, "propConcatItem", [{
        title: 'first'
      }, {
        title: 'second'
      }]);

      return _this;
    }

    _createClass(Issue763, [{
      key: "handleClick",
      value: function handleClick() {
        (this._ES5ProxyType ? this.get("items") : this.items).unshift({
          title: 'unshifted'
        });
      }
    }, {
      key: "handlePushClick",
      value: function handlePushClick() {
        (this._ES5ProxyType ? this.get("pushItems") : this.pushItems).push({
          title: 'pushed'
        });
      }
    }, {
      key: "handleConcatClick",
      value: function handleConcatClick() {
        __setKey(this, "concatItems", __concat(this._ES5ProxyType ? this.get("concatItems") : this.concatItems, [{
          title: 'concat 1'
        }, {
          title: 'concat 2'
        }]));
      }
    }, {
      key: "handlePropConcatClick",
      value: function handlePropConcatClick() {
        __setKey(this, "propConcatItem", __concat([{
          title: 'concat 1'
        }, {
          title: 'concat 2'
        }], this._ES5ProxyType ? this.get("propItems") : this.propItems));
      }
    }]);

    return Issue763;
  }(lwc.LightningElement);

  lwc.registerDecorators(Issue763, {
    publicProps: {
      propItems: {
        config: 0
      }
    },
    track: {
      items: 1,
      pushItems: 1,
      concatItems: 1,
      propConcatItem: 1
    }
  });

  var Cmp = lwc.registerComponent(Issue763, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-array-push-concat-unshift', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
