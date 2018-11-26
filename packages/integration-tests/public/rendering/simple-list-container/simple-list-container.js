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
        api_flatten = $api._ES5ProxyType ? $api.get("f") : $api.f;
    return [api_element("div", {
      key: 2
    }, [api_element("ul", {
      key: 3
    }, api_flatten([api_element("li", {
      classMap: {
        "first": true
      },
      key: 4
    }, [api_text("header")]), api_iterator($cmp._ES5ProxyType ? $cmp.get("data") : $cmp.data, function (item, index) {
      return api_element("li", {
        classMap: {
          "number": true
        },
        key: api_key(6, item)
      }, [api_text("Value of X = "), api_dynamic(item)]);
    }), api_element("li", {
      classMap: {
        "last": true
      },
      key: 7
    }, [api_text("footer")])]))])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-simpleList_simpleList-host",
    shadowAttribute: "integration-simpleList_simpleList"
  });

  var DefaultMinValue = 5;
  var DefaultMaxValue = 35;
  var base = [];

  for (var i = 0; i < 100; i += 1) {
    __setKey(base, i, i);
  }

  function produceNewData(min, max) {
    return __callKey2(base, "slice", min, max);
  }

  var SimpleList =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(SimpleList, _LightningElement);

    function SimpleList() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, SimpleList);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(SimpleList), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "normalizedMin", DefaultMinValue);

      __setKey(_this, "normalizedMax", DefaultMaxValue);

      __setKey(_this, "data", []);

      return _this;
    }

    _createClass(SimpleList, [{
      key: "min",
      get: function get() {
        return this._ES5ProxyType ? this.get("normalizedMin") : this.normalizedMin;
      },
      set: function set(value) {
        __setKey(this, "normalizedMin", Math.max(parseInt(value, 10), 0));

        __setKey(this, "data", produceNewData(this._ES5ProxyType ? this.get("normalizedMin") : this.normalizedMin, this._ES5ProxyType ? this.get("normalizedMax") : this.normalizedMax));
      }
    }, {
      key: "max",
      get: function get() {
        return this._ES5ProxyType ? this.get("normalizedMax") : this.normalizedMax;
      },
      set: function set(value) {
        __setKey(this, "normalizedMax", Math.min(parseInt(value, 10), 100));

        __setKey(this, "data", produceNewData(this._ES5ProxyType ? this.get("normalizedMin") : this.normalizedMin, this._ES5ProxyType ? this.get("normalizedMax") : this.normalizedMax));
      }
    }]);

    return SimpleList;
  }(lwc.LightningElement);

  lwc.registerDecorators(SimpleList, {
    publicProps: {
      min: {
        config: 3
      },
      max: {
        config: 3
      }
    },
    track: {
      data: 1
    }
  });

  var _integrationSimpleList = lwc.registerComponent(SimpleList, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2;

    return [($cmp._ES5ProxyType ? $cmp.get("header") : $cmp.header) ? api_element("h1", {
      key: 2
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("header") : $cmp.header)]) : null, api_element("div", {
      key: 3
    }, [api_element("button", {
      key: 4,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("label") : $cmp.label)])]), api_element("span", {
      key: 5
    }, [api_text("min:")]), api_element("input", {
      classMap: {
        "mininput": true
      },
      attrs: {
        "type": "number",
        "min": "0",
        "max": "50"
      },
      props: {
        "value": $cmp._ES5ProxyType ? $cmp.get("min") : $cmp.min
      },
      key: 6,
      on: {
        "input": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("onMinChange") : $cmp.onMinChange))
      }
    }, []), api_element("span", {
      key: 7
    }, [api_text("max:")]), api_element("input", {
      classMap: {
        "maxinput": true
      },
      attrs: {
        "type": "number",
        "min": "0",
        "max": "50"
      },
      props: {
        "value": $cmp._ES5ProxyType ? $cmp.get("max") : $cmp.max
      },
      key: 8,
      on: {
        "input": _m2 || __setKey($ctx, "_m2", api_bind($cmp._ES5ProxyType ? $cmp.get("onMaxChange") : $cmp.onMaxChange))
      }
    }, []), api_custom_element("integration-simple-list", _integrationSimpleList, {
      classMap: {
        "simpleList": true
      },
      props: {
        "min": $cmp._ES5ProxyType ? $cmp.get("min") : $cmp.min,
        "max": $cmp._ES5ProxyType ? $cmp.get("max") : $cmp.max
      },
      key: 9
    }, [])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-simple-list-container_simple-list-container-host",
    shadowAttribute: "integration-simple-list-container_simple-list-container"
  });

  var SimpleListContainer =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(SimpleListContainer, _LightningElement);

    function SimpleListContainer() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, SimpleListContainer);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(SimpleListContainer), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "label", 'default label');

      __setKey(_this, "header", 'default header');

      __setKey(_this, "min", 20);

      __setKey(_this, "max", 35);

      return _this;
    }

    _createClass(SimpleListContainer, [{
      key: "handleClick",
      value: function handleClick() {
        __setKey(this, "min", Math.floor(Math.random() * 100));

        __setKey(this, "max", Math.floor(Math.random() * (100 - (this._ES5ProxyType ? this.get("min") : this.min))) + (this._ES5ProxyType ? this.get("min") : this.min));
      }
    }, {
      key: "onMinChange",
      value: function onMinChange(event) {
        var _target, _value;

        __setKey(this, "min", (_target = event._ES5ProxyType ? event.get("target") : event.target, _value = _target._ES5ProxyType ? _target.get("value") : _target.value));
      }
    }, {
      key: "onMaxChange",
      value: function onMaxChange(event) {
        var _target2, _value2;

        __setKey(this, "max", (_target2 = event._ES5ProxyType ? event.get("target") : event.target, _value2 = _target2._ES5ProxyType ? _target2.get("value") : _target2.value));
      }
    }]);

    return SimpleListContainer;
  }(lwc.LightningElement);

  lwc.registerDecorators(SimpleListContainer, {
    publicProps: {
      label: {
        config: 0
      },
      header: {
        config: 0
      }
    },
    track: {
      min: 1,
      max: 1
    }
  });

  var Cmp = lwc.registerComponent(SimpleListContainer, {
    tmpl: _tmpl$1
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-simple-list-container', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
