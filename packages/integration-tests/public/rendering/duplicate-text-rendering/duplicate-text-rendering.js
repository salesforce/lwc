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
    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_flatten = $api._ES5ProxyType ? $api.get("f") : $api.f;
    return api_flatten([($cmp._ES5ProxyType ? $cmp.get("hasParts") : $cmp.hasParts) ? api_iterator($cmp._ES5ProxyType ? $cmp.get("text") : $cmp.text, function (part) {
      return [(part._ES5ProxyType ? part.get("highlight") : part.highlight) ? api_dynamic(part._ES5ProxyType ? part.get("text") : part.text) : null, !(part._ES5ProxyType ? part.get("highlight") : part.highlight) ? api_dynamic(part._ES5ProxyType ? part.get("text") : part.text) : null];
    }) : [], !($cmp._ES5ProxyType ? $cmp.get("hasParts") : $cmp.hasParts) ? api_dynamic($cmp._ES5ProxyType ? $cmp.get("text") : $cmp.text) : null]);
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-duplicate-text-rendering_duplicate-text-rendering-host",
    shadowAttribute: "integration-duplicate-text-rendering_duplicate-text-rendering"
  });

  var App =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(App, _LightningElement);

    function App() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, App);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(App), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "text", [{
        text: 'a',
        highlight: false
      }]);

      return _this;
    }

    _createClass(App, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var _this2 = this;

        __callKey2(this, "addEventListener", 'click', function () {
          __setKey(_this2, "text", 'b');
        });
      }
    }, {
      key: "hasParts",
      get: function get() {
        var _text, _length;

        return Array.compatIsArray(this._ES5ProxyType ? this.get("text") : this.text) && (_text = this._ES5ProxyType ? this.get("text") : this.text, _length = _text._ES5ProxyType ? _text.get("length") : _text.length) > 0;
      }
    }, {
      key: "highlight",
      get: function get() {
        return false;
      }
    }, {
      key: "firstPart",
      get: function get() {
        var _text2, _;

        return _text2 = this._ES5ProxyType ? this.get("text") : this.text, _ = _text2._ES5ProxyType ? _text2.get(0) : _text2[0];
      }
    }]);

    return App;
  }(lwc.LightningElement);

  lwc.registerDecorators(App, {
    track: {
      text: 1
    }
  });

  var Cmp = lwc.registerComponent(App, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-duplicate-text-rendering', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
