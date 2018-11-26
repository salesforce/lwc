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
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;
    return [api_element("div", {
      key: 2
    }, [api_element("span", {
      key: 3
    }, [api_text("Plain push")]), api_element("ul", {
      classMap: {
        "push-list-plain": true
      },
      key: 4
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("plainPush") : $cmp.plainPush, function (item) {
      return api_element("li", {
        key: api_key(5, item)
      }, [api_dynamic(item)]);
    }))]), api_element("div", {
      key: 6
    }, [api_element("span", {
      key: 7
    }, [api_text("Plain push with proxy item")]), api_element("ul", {
      classMap: {
        "push-list": true
      },
      key: 8
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("plainPushWithProxy") : $cmp.plainPushWithProxy, function (item) {
      return api_element("li", {
        key: api_key(9, item._ES5ProxyType ? item.get("title") : item.title)
      }, [api_dynamic(item._ES5ProxyType ? item.get("title") : item.title)]);
    }))]), api_element("div", {
      key: 10
    }, [api_element("span", {
      key: 11
    }, [api_text("Plain concat")]), api_element("ul", {
      classMap: {
        "concat-list-plain": true
      },
      key: 12
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("plainConcat") : $cmp.plainConcat, function (item) {
      return api_element("li", {
        key: api_key(13, item)
      }, [api_dynamic(item)]);
    }))]), api_element("div", {
      key: 14
    }, [api_element("span", {
      key: 15
    }, [api_text("Plain concat with proxy item")]), api_element("ul", {
      classMap: {
        "concat-list-proxy": true
      },
      key: 16
    }, api_iterator($cmp._ES5ProxyType ? $cmp.get("plainConcatWithProxy") : $cmp.plainConcatWithProxy, function (item) {
      return api_element("li", {
        key: api_key(17, item._ES5ProxyType ? item.get("title") : item.title)
      }, [api_dynamic(item._ES5ProxyType ? item.get("title") : item.title)]);
    }))])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-plain-array_plain-array-host",
    shadowAttribute: "integration-plain-array_plain-array"
  });

  var ArrayPush =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ArrayPush, _LightningElement);

    function ArrayPush() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, ArrayPush);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(ArrayPush), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "foo", {
        title: 'proxy'
      });

      return _this;
    }

    _createClass(ArrayPush, [{
      key: "plainPush",
      get: function get() {
        var array = [1, 2];
        array.push(3, 4);
        return array;
      }
    }, {
      key: "plainPushWithProxy",
      get: function get() {
        var array = [{
          title: 'first'
        }, {
          title: 'second'
        }];
        array.push(this._ES5ProxyType ? this.get("foo") : this.foo, {
          title: 'fourth'
        });
        return array;
      }
    }, {
      key: "plainConcat",
      get: function get() {
        var array = [1, 2];
        return __concat(array, [3, 4]);
      }
    }, {
      key: "plainConcatWithProxy",
      get: function get() {
        var array = [{
          title: 'first'
        }, {
          title: 'second'
        }];
        return __concat(array, [this._ES5ProxyType ? this.get("foo") : this.foo]);
      }
    }]);

    return ArrayPush;
  }(lwc.LightningElement);

  lwc.registerDecorators(ArrayPush, {
    track: {
      foo: 1
    }
  });

  var Cmp = lwc.registerComponent(ArrayPush, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-plain-array', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
